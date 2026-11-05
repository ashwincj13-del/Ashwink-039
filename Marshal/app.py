"""Marshall AI - ESP32 Voice Console v4.0 (backend)

- Serves the web console from /static
- POST /api/chat   {"message": "...", "history": [{"role","content"}, ...]}  -> {"reply": "..."}
  (an ESP32 can call this endpoint too, just send JSON text)
- GET/DELETE /api/logs  -> saved chat log (JSON lines on the data volume)
- Any .txt/.md files in KNOWLEDGE_DIR are fed to Marshall as reference text.
"""
import glob
import json
import os
import threading
import time

import anthropic
from flask import Flask, jsonify, request, send_from_directory

DATA_DIR = os.environ.get("DATA_DIR", "/data")
KNOWLEDGE_DIR = os.environ.get("KNOWLEDGE_DIR", "/app/knowledge")
MODEL = os.environ.get("MARSHALL_MODEL", "claude-sonnet-5-5")
MAX_KNOWLEDGE_CHARS = int(os.environ.get("MAX_KNOWLEDGE_CHARS", "60000"))
LOG_FILE = os.path.join(DATA_DIR, "chat_log.jsonl")

PERSONA = (
    "You are Marshall, a voice-first assistant running on a web console that an "
    "ESP32 device also talks to. Keep answers short and speakable: plain sentences, "
    "no markdown, no lists unless asked. If reference text is provided below, "
    "use it as your primary source and say so when the answer is not in it."
)

app = Flask(__name__, static_folder="static")
_lock = threading.Lock()
os.makedirs(DATA_DIR, exist_ok=True)


def load_knowledge() -> str:
    parts, total = [], 0
    files = sorted(glob.glob(os.path.join(KNOWLEDGE_DIR, "*.txt")) +
                   glob.glob(os.path.join(KNOWLEDGE_DIR, "*.md")))
    for path in files:
        try:
            with open(path, encoding="utf-8", errors="replace") as f:
                text = f.read()
        except OSError:
            continue
        chunk = f"--- {os.path.basename(path)} ---\n{text.strip()}\n"
        if total + len(chunk) > MAX_KNOWLEDGE_CHARS:
            chunk = chunk[: max(0, MAX_KNOWLEDGE_CHARS - total)]
        parts.append(chunk)
        total += len(chunk)
        if total >= MAX_KNOWLEDGE_CHARS:
            break
    return "\n".join(parts)


def log_exchange(user_text: str, reply: str, source: str) -> None:
    row = {"ts": int(time.time()), "source": source, "user": user_text, "marshall": reply}
    with _lock, open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/healthz")
def healthz():
    return jsonify(status="ok", model=MODEL)


@app.post("/api/chat")
def chat():
    body = request.get_json(silent=True) or {}
    message = (body.get("message") or "").strip()
    if not message:
        return jsonify(error="message is required"), 400
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return jsonify(error="ANTHROPIC_API_KEY is not set on the server"), 503

    history = [
        {"role": m["role"], "content": m["content"]}
        for m in (body.get("history") or [])[-20:]
        if m.get("role") in ("user", "assistant") and m.get("content")
    ]
    history.append({"role": "user", "content": message})

    system = PERSONA
    knowledge = load_knowledge()
    if knowledge:
        system += "\n\nReference text:\n" + knowledge

    try:
        client = anthropic.Anthropic()
        resp = client.messages.create(model=MODEL, max_tokens=600, system=system, messages=history)
        reply = "".join(b.text for b in resp.content if b.type == "text").strip()
    except anthropic.APIError as e:
        return jsonify(error=f"Model call failed: {e}"), 502

    log_exchange(message, reply, body.get("source", "web"))
    return jsonify(reply=reply)


@app.get("/api/logs")
def get_logs():
    rows = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, encoding="utf-8") as f:
            rows = [json.loads(line) for line in f if line.strip()][-200:]
    return jsonify(rows)


@app.delete("/api/logs")
def clear_logs():
    with _lock:
        open(LOG_FILE, "w").close()
    return jsonify(cleared=True)
