import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import hotelService from '@/services/hotelService';
import HotelCard from '@/components/hotel/HotelCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { extractErrorMessage } from '@/hooks/useApi';
import { todayISO } from '@/utils/dateUtils';
import type { HotelPriceResponseDto, Page } from '@/types';

export default function HotelSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ── Read params from URL ──────────────────────────────────────
  const city       = searchParams.get('city')       ?? '';
  const startDate  = searchParams.get('startDate')  ?? '';
  const endDate    = searchParams.get('endDate')    ?? '';
  const roomsCount = Number(searchParams.get('roomsCount') ?? 1);
  const page       = Number(searchParams.get('page') ?? 0);

  // ── Local state ───────────────────────────────────────────────
  const [result, setResult]     = useState<Page<HotelPriceResponseDto> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  // ── Editable search form (synced from URL) ────────────────────
  const [form, setForm] = useState({ city, startDate, endDate, roomsCount });

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchHotels = useCallback(async () => {
    if (!city || !startDate || !endDate) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await hotelService.searchHotels({
        city, startDate, endDate, roomsCount, page, size: 9,
      });
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [city, startDate, endDate, roomsCount, page]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  // ── Sync form if URL changes externally ───────────────────────
  useEffect(() => {
    setForm({ city, startDate, endDate, roomsCount });
  }, [city, startDate, endDate, roomsCount]);

  // ── Re-search ─────────────────────────────────────────────────
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!form.city.trim() || !form.startDate || !form.endDate) return;
    if (form.endDate <= form.startDate) return;
    setSearchParams({
      city: form.city.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      roomsCount: String(form.roomsCount),
      page: '0',
    });
  }

  function goToPage(p: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
  }

  // ── Forwarded search params for hotel detail page ─────────────
  const fwdParams = new URLSearchParams({
    startDate, endDate, roomsCount: String(roomsCount),
  }).toString();

  return (
    <div className="py-8 px-6">
      <div className="page-container flex flex-col gap-6">

        {/* ── Inline search bar ────────────────────────────────── */}
        <div className="card p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 min-w-36 flex-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Destination"
                className="input-base"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Check-in</label>
              <input
                type="date"
                value={form.startDate}
                min={todayISO()}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="input-base"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Check-out</label>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate || todayISO()}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="input-base"
              />
            </div>
            <div className="flex flex-col gap-1 w-24">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rooms</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.roomsCount}
                onChange={(e) => setForm((f) => ({ ...f, roomsCount: Number(e.target.value) }))}
                className="input-base"
              />
            </div>
            <button type="submit" className="btn-primary gap-2 self-end">
              <Search className="h-4 w-4" /> Search
            </button>
          </form>
        </div>

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {city ? `Hotels in ${city}` : 'All Hotels'}
            </h1>
            {result && (
              <p className="text-sm text-slate-500 mt-0.5">
                {result.totalElements} hotel{result.totalElements !== 1 ? 's' : ''} found
                {startDate && endDate
                  ? ` · ${startDate} – ${endDate}`
                  : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <SlidersHorizontal className="h-4 w-4" />
            {roomsCount} room{roomsCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ── Loading ───────────────────────────────────────────── */}
        {isLoading && (
          <div className="py-16">
            <LoadingSpinner size="lg" label="Searching hotels…" />
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────── */}
        {error && !isLoading && (
          <ErrorMessage message={error} onRetry={fetchHotels} variant="page" />
        )}

        {/* ── Empty ─────────────────────────────────────────────── */}
        {!isLoading && !error && result?.content.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-5xl">🏝️</span>
            <h2 className="text-xl font-semibold text-slate-700">No hotels found</h2>
            <p className="text-sm text-slate-500 max-w-xs">
              Try a different city or date range — we're constantly adding new properties.
            </p>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Back to home
            </button>
          </div>
        )}

        {/* ── Results grid ─────────────────────────────────────── */}
        {!isLoading && !error && (result?.content.length ?? 0) > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result!.content.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} searchParams={fwdParams} />
              ))}
            </div>

            {/* Pagination */}
            {result!.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={result!.first}
                  className="btn-secondary flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <span className="text-sm text-slate-600">
                  Page {result!.number + 1} of {result!.totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={result!.last}
                  className="btn-secondary flex items-center gap-1 disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
