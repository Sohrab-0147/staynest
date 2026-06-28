import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CalendarDays, Users, Star, Shield, HeartHandshake } from 'lucide-react';
import { todayISO, daysFromNow } from '@/utils/dateUtils';

const FEATURES = [
  {
    icon: <Search className="h-6 w-6 text-blue-600" />,
    title: 'Smart Search',
    desc: 'Filter by city, dates, and room count to find exactly what you need.',
  },
  {
    icon: <Shield className="h-6 w-6 text-blue-600" />,
    title: 'Secure Payments',
    desc: 'Pay safely via Stripe — your card details never touch our servers.',
  },
  {
    icon: <HeartHandshake className="h-6 w-6 text-blue-600" />,
    title: 'Easy Guest Management',
    desc: 'Save your travel companions and add them to bookings in one click.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const [city, setCity]             = useState('');
  const [startDate, setStartDate]   = useState(daysFromNow(1));
  const [endDate, setEndDate]       = useState(daysFromNow(3));
  const [roomsCount, setRoomsCount] = useState(1);
  const [error, setError]           = useState('');

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!city.trim()) { setError('Please enter a city.'); return; }
    if (!startDate)   { setError('Please select a check-in date.'); return; }
    if (!endDate)     { setError('Please select a check-out date.'); return; }
    if (endDate <= startDate) { setError('Check-out must be after check-in.'); return; }

    const params = new URLSearchParams({
      city: city.trim(),
      startDate,
      endDate,
      roomsCount: String(roomsCount),
    });
    navigate(`/hotels/search?${params.toString()}`);
  }

  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-24 text-white">
        {/* Background pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="page-container relative z-10 flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Star className="h-4 w-4 text-yellow-300" />
            Trusted by thousands of travellers
          </div>

          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Find your perfect stay,<br />
            <span className="text-blue-200">anywhere in India</span>
          </h1>

          <p className="max-w-xl text-lg text-blue-100">
            Search thousands of hotels, compare prices, and book in minutes — with secure payments and free cancellation.
          </p>

          {/* ── Search card ─────────────────────────────────────── */}
          <div className="mt-4 w-full max-w-3xl animate-fadeIn">
            <form
              onSubmit={handleSearch}
              className="card p-4 shadow-2xl"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* City */}
                <div className="flex flex-col gap-1 lg:col-span-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <MapPin className="h-3.5 w-3.5" /> Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setError(''); }}
                    className="input-base"
                  />
                </div>

                {/* Check-in */}
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" /> Check-in
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={todayISO()}
                    onChange={(e) => { setStartDate(e.target.value); setError(''); }}
                    className="input-base"
                  />
                </div>

                {/* Check-out */}
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" /> Check-out
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || todayISO()}
                    onChange={(e) => { setEndDate(e.target.value); setError(''); }}
                    className="input-base"
                  />
                </div>

                {/* Rooms */}
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Users className="h-3.5 w-3.5" /> Rooms
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={roomsCount}
                      onChange={(e) => setRoomsCount(Number(e.target.value))}
                      className="input-base"
                    />
                    <button
                      type="submit"
                      className="btn-primary shrink-0 px-4 py-2.5"
                      aria-label="Search hotels"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="page-container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Why choose StayNest?
            </h2>
            <p className="mt-3 text-slate-500 max-w-md mx-auto">
              We make finding and booking hotels effortless, from search to check-out.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card flex flex-col gap-4 p-6 transition-shadow hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-16 text-white">
        <div className="page-container flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold">Ready to find your next stay?</h2>
          <p className="text-blue-200 max-w-sm">
            Join thousands of travellers who book smarter with StayNest.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-2 rounded-xl bg-white px-8 py-3 font-semibold text-blue-700 shadow-md hover:shadow-lg transition"
          >
            Search hotels now
          </button>
        </div>
      </section>
    </div>
  );
}
