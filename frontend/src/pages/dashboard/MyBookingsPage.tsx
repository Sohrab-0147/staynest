import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, BedDouble, XCircle, RefreshCw, ArrowRight } from 'lucide-react';
import bookingService from '@/services/bookingService';
import { BookingStatusBadge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { extractErrorMessage } from '@/hooks/useApi';
import { formatDate, nightsBetween } from '@/utils/dateUtils';
import type { BookingDto } from '@/types';
import toast from 'react-hot-toast';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await bookingService.getMyBookings();
      // Sort: newest first by createdAt
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setBookings(sorted);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  async function handleCancel(id: number) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(id);
    try {
      await bookingService.cancelBooking(id);
      toast.success('Booking cancelled.');
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, bookingStatus: 'CANCELLED' } : b,
        ),
      );
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  }

  const cancellable = (b: BookingDto) =>
    ['RESERVED', 'GUESTS_ADDED', 'PAYMENTS_PENDING'].includes(b.bookingStatus);

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="py-10 px-6">
      <div className="page-container max-w-3xl mx-auto flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Your full booking history</p>
          </div>
          <button
            onClick={fetchBookings}
            className="btn-ghost gap-2 text-sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {isLoading && <LoadingSpinner size="lg" label="Loading bookings…" />}

        {error && !isLoading && (
          <ErrorMessage message={error} onRetry={fetchBookings} variant="page" />
        )}

        {!isLoading && !error && bookings.length === 0 && (
          <div className="card flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-5xl">🧳</span>
            <h2 className="text-xl font-semibold text-slate-700">No bookings yet</h2>
            <p className="text-sm text-slate-500 max-w-xs">
              When you book a hotel, your reservations will appear here.
            </p>
            <button
              onClick={() => navigate('/hotels/search')}
              className="btn-primary"
            >
              Find Hotels
            </button>
          </div>
        )}

        {!isLoading && !error && bookings.map((booking) => {
          const nights = nightsBetween(booking.checkInDate, booking.checkOutDate);
          return (
            <div key={booking.id} className="card p-5 flex flex-col gap-4">
              {/* Header row */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <BedDouble className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Booking #{booking.id}</p>
                    <p className="text-xs text-slate-400">
                      Created {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>
                <BookingStatusBadge status={booking.bookingStatus} />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Check-in</p>
                  <p className="mt-0.5 font-semibold text-slate-900 text-sm">
                    {formatDate(booking.checkInDate)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Check-out</p>
                  <p className="mt-0.5 font-semibold text-slate-900 text-sm">
                    {formatDate(booking.checkOutDate)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Duration</p>
                  <p className="mt-0.5 font-semibold text-slate-900 text-sm">
                    {nights} night{nights !== 1 ? 's' : ''} · {booking.roomsCount} room{booking.roomsCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Guests */}
              {booking.guests?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {booking.guests.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2">
                <p className="text-xl font-bold text-blue-700">
                  ₹{Number(booking.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <div className="flex gap-2">
                  {/* Resume incomplete booking */}
                  {['RESERVED', 'GUESTS_ADDED'].includes(booking.bookingStatus) && (
                    <button
                      onClick={() => navigate(`/booking/${booking.id}`)}
                      className="btn-secondary flex items-center gap-1.5 text-sm"
                    >
                      Continue <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {cancellable(booking) && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="btn-danger flex items-center gap-1.5 text-sm"
                    >
                      {cancellingId === booking.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <><XCircle className="h-3.5 w-3.5" /> Cancel</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
