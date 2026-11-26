create table if not exists public.matches (
  id bigint generated always as identity primary key,
  team_a text not null,
  team_b text not null,
  venue text not null,
  match_date timestamptz not null,
  price numeric not null,
  available_seats integer not null
);

create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  match_id bigint not null references public.matches(id) on delete cascade,
  customer_name text not null,
  seats integer not null check (seats > 0),
  created_at timestamptz not null default now()
);

insert into public.matches (team_a, team_b, venue, match_date, price, available_seats)
select seed.team_a, seed.team_b, seed.venue, seed.match_date, seed.price, seed.available_seats
from (values
  ('Chennai Super Kings', 'Royal Challengers Bengaluru', 'MA Chidambaram Stadium, Chennai', '2026-03-22 12:00:00+05:30'::timestamptz, 1500, 5),
  ('Mumbai Indians', 'Kolkata Knight Riders', 'Wankhede Stadium, Mumbai', '2026-03-25 12:00:00+05:30'::timestamptz, 2000, 0),
  ('Gujarat Titans', 'Rajasthan Royals', 'Narendra Modi Stadium, Ahmedabad', '2026-03-28 12:00:00+05:30'::timestamptz, 1200, 12),
  ('Delhi Capitals', 'Sunrisers Hyderabad', 'Arun Jaitley Stadium, Delhi', '2026-03-31 12:00:00+05:30'::timestamptz, 1800, 8)
) as seed(team_a, team_b, venue, match_date, price, available_seats)
where not exists (
  select 1
  from public.matches existing
  where existing.team_a = seed.team_a
    and existing.team_b = seed.team_b
    and existing.match_date = seed.match_date
);

alter table public.matches enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Matches are publicly readable" on public.matches;
create policy "Matches are publicly readable"
  on public.matches for select
  to anon, authenticated
  using (true);

drop policy if exists "Matches can be updated publicly" on public.matches;
create policy "Matches can be updated publicly"
  on public.matches for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Bookings are publicly readable" on public.bookings;
create policy "Bookings are publicly readable"
  on public.bookings for select
  to anon, authenticated
  using (true);

drop policy if exists "Bookings can be created publicly" on public.bookings;
create policy "Bookings can be created publicly"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Bookings can be deleted publicly" on public.bookings;
create policy "Bookings can be deleted publicly"
  on public.bookings for delete
  to anon, authenticated
  using (true);

grant usage on schema public to anon, authenticated;
grant select, update on public.matches to anon, authenticated;
grant select, insert, delete on public.bookings to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
