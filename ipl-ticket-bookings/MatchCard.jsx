export function MatchCard({ match, onSelectMatch }) {
  const isSoldOut = match.availableSeats === 0;

  return (
    <article className="match-card">
      <h3>{match.team1} vs {match.team2}</h3>
      <p>{match.date} • {match.venue}</p>
      <p>₹{match.price} • {match.availableSeats} seats left</p>
      <button disabled={isSoldOut} onClick={() => onSelectMatch(match)}>
        {isSoldOut ? 'Sold Out' : 'Book Tickets'}
      </button>
    </article>
  );
}
