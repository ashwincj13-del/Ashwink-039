import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MatchCard } from './components/MatchCard';
import { Footer } from './components/Footer';
import { supabase } from './supabase';
import './App.css';

export default function App() {
  const [matches, setMatches] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [bookingMatchId, setBookingMatchId] = useState(null);
  const [loadError, setLoadError] = useState('');

  const loadMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('id');

    if (error) {
      console.error('Could not load matches:', error.message);
      setLoadError(`Could not load matches: ${error.message}`);
      return;
    }

    setLoadError('');
    setMatches(data.map((match) => ({
      id: match.id,
      team1: match.team_a,
      team2: match.team_b,
      date: new Date(match.match_date).toLocaleString(),
      venue: match.venue,
      price: Number(match.price),
      availableSeats: match.available_seats,
    })));
  };

  const loadBookings = async () => {
    const { count, error } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Could not load bookings:', error.message);
      setLoadError(`Could not load bookings: ${error.message}`);
      return;
    }

    setTotalBookings(count || 0);
  };

  useEffect(() => {
    loadMatches();
    loadBookings();

    const channel = supabase
      .channel('ipl-booking-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        loadMatches
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        loadBookings
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSelectMatch = async (selectedMatch) => {
    if (selectedMatch.availableSeats <= 0) return;

    const customerName = window.prompt('Enter your name:')?.trim();
    if (!customerName) return;

    const seats = Number(window.prompt(
      `How many seats? Available: ${selectedMatch.availableSeats}`,
      '1'
    ));
    if (!Number.isInteger(seats) || seats < 1 || seats > selectedMatch.availableSeats) {
      window.alert(`Enter a whole number between 1 and ${selectedMatch.availableSeats}.`);
      return;
    }

    setBookingMatchId(selectedMatch.id);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        match_id: selectedMatch.id,
        customer_name: customerName,
        seats,
      })
      .select('id')
      .single();

    if (bookingError) {
      console.error('Could not create booking:', bookingError.message);
      window.alert(`Could not create booking: ${bookingError.message}`);
      setBookingMatchId(null);
      return;
    }

    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update({ available_seats: selectedMatch.availableSeats - seats })
      .eq('id', selectedMatch.id)
      .eq('available_seats', selectedMatch.availableSeats)
      .gte('available_seats', seats)
      .select('id')
      .maybeSingle();

    if (updateError || !updatedMatch) {
      const { error: rollbackError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id);

      if (rollbackError) {
        console.error('Could not remove the incomplete booking:', rollbackError.message);
        window.alert(`Seat update failed and the booking could not be rolled back: ${rollbackError.message}`);
      } else {
        const message = updateError?.message || 'There are no longer enough seats available.';
        console.error('Could not update available seats:', message);
        window.alert(`Could not complete booking: ${message}`);
      }
    }

    setBookingMatchId(null);
    await Promise.all([loadMatches(), loadBookings()]);
  };

  return (
    <div className="app-container">
      <Navbar totalBookings={totalBookings} />
      
      <main className="main-content">
        <Hero />

        <section className="matches-section">
          <h2>Upcoming Matches</h2>
          {loadError && <p role="alert">{loadError}</p>}
          <div className="matches-grid">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onSelectMatch={handleSelectMatch}
                isBooking={bookingMatchId === match.id}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
