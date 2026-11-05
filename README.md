# Marshall AI – ESP32 Voice Console v4.0

## 1. Put your text data in `knowledge/`
Any `.txt` / `.md` files there become Marshall's reference text (about 60k characters total).

## 2. Docker
    export ANTHROPIC_API_KEY=sk-ant-...
    docker compose up --build
    # open http://localhost:8080

## 3. Kubernetes (minikube / kind / any cluster)
    docker build -t marshall-ai:4.0 .
    minikube image load marshall-ai:4.0      # or: kind load docker-image marshall-ai:4.0

    kubectl apply -f k8s/marshall.yaml       # namespace, volume, deployment, service
    kubectl -n marshall create secret generic marshall-secrets --from-literal=ANTHROPIC_API_KEY=sk-ant-...
    kubectl -n marshall create configmap marshall-knowledge --from-file=knowledge/
    kubectl -n marshall rollout restart deploy/marshall

    kubectl -n marshall port-forward svc/marshall 8080:80
    # open http://localhost:8080

### Updating your text data later
    kubectl -n marshall create configmap marshall-knowledge --from-file=knowledge/ --dry-run=client -o yaml | kubectl apply -f -
(Files update inside the pod within about a minute; no rebuild needed. ConfigMaps are limited to 1 MiB.)

### Saved chat logs
Stored at `/data/chat_log.jsonl` on the persistent volume:
    kubectl -n marshall exec deploy/marshall -- cat /data/chat_log.jsonl

## ESP32
POST JSON to `http://<host>/api/chat`:  `{"message":"hello","source":"esp32"}`  ->  `{"reply":"..."}`
