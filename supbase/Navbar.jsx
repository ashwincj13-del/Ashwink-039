export function Navbar({ totalBookings }) {
  return (
    <nav className="navbar">
      <div>
        <a href="/">
          IPL TICKETS
        </a>
      </div>

      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/matches">Matches</a>
        <a href="/history">Booking History</a>
      </div>

      <div className="nav-bookings">
        <p>Bookings: <strong>{totalBookings}</strong></p>
      </div>
    </nav>
  );
}
