import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, Clock, RefreshCw, CalendarDays, Home,
} from 'lucide-react';
import bookingService from '@/services/bookingService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { extractErrorMessage } from '@/hooks/useApi';
import type { BookingStatusResponse } from '@/types';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS        = 20; // 60 s max

// ── Status display config ─────────────────────────────────────────

type StatusState = 'polling' | 'confirmed' | 'cancelled' | 'expired' | 'error';

function getStatusState(status?: string): StatusState {
  switch (status) {
    case 'CONFIRMED':        return 'confirmed';
    case 'CANCELLED':        return 'cancelled';
    case 'EXPIRED':          return 'expired';
    case 'PAYMENTS_PENDING': return 'polling';
    default:                 return 'polling';
  }
}

export default function BookingConfirmPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [statusData, setStatusData] = useState<BookingStatusResponse | null>(null);
  const [error, setError]           = useState('');
  const [polls, setPolls]           = useState(0);

  const pollCount = useRef(0);
  const timer     = useRef<ReturnType<typeof setTimeout>>();

  const state = statusData ? getStatusState(statusData.bookingStatus) : 'polling';

  // ── Polling logic ─────────────────────────────────────────────

  async function poll() {
    if (!bookingId) return;
    if (pollCount.current >= MAX_POLLS) {
      setError('Confirmation is taking longer than expected. Please check My Bookings.');
      return;
    }

    try {
      const data = await bookingService.getBookingStatus(Number(bookingId));
      setStatusData(data);
      pollCount.current += 1;
      setPolls(pollCount.current);

      const terminal = ['CONFIRMED', 'CANCELLED', 'EXPIRED'];
      if (!terminal.includes(data.bookingStatus)) {
        timer.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  useEffect(() => {
    poll();
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="card p-8 text-center flex flex-col items-center gap-6">

          {/* ── Polling ───────────────────────────────────────── */}
          {state === 'polling' && !error && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Confirming your payment…
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  We're waiting for Stripe to confirm your payment. This usually takes a few seconds.
                </p>
              </div>
              <LoadingSpinner size="md" label={`Checking (${polls}/${MAX_POLLS})…`} />
              <p className="text-xs text-slate-400">Booking #{bookingId}</p>
            </>
          )}

          {/* ── Confirmed ─────────────────────────────────────── */}
          {state === 'confirmed' && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Your booking <span className="font-semibold">#{bookingId}</span> is confirmed.
                  Check your email for details.
                </p>
              </div>

              {statusData && (
                <div className="w-full rounded-xl bg-green-50 p-4 text-sm text-left flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Check-in</span>
                    <span className="font-semibold text-slate-900">{statusData.checkInDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Check-out</span>
                    <span className="font-semibold text-slate-900">{statusData.checkOutDate}</span>
                  </div>
                </div>
              )}

              <div className="flex w-full flex-col gap-2">
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="btn-primary w-full gap-2"
                >
                  <CalendarDays className="h-4 w-4" />
                  View My Bookings
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="btn-secondary w-full gap-2"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </button>
              </div>
            </>
          )}

          {/* ── Cancelled ─────────────────────────────────────── */}
          {state === 'cancelled' && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Booking Cancelled</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Your booking <span className="font-semibold">#{bookingId}</span> was cancelled.
                  Any payment will be refunded within 5–7 business days.
                </p>
              </div>
              <button
                onClick={() => navigate('/hotels/search')}
                className="btn-primary w-full"
              >
                Search Hotels Again
              </button>
            </>
          )}

          {/* ── Expired ───────────────────────────────────────── */}
          {state === 'expired' && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
                <Clock className="h-10 w-10 text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Session Expired</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Your booking session timed out before payment was completed.
                  Please start a new booking.
                </p>
              </div>
              <button
                onClick={() => navigate('/hotels/search')}
                className="btn-primary w-full"
              >
                Search Hotels Again
              </button>
            </>
          )}

          {/* ── Error ─────────────────────────────────────────── */}
          {error && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <XCircle className="h-10 w-10 text-slate-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
                <p className="mt-2 text-sm text-slate-500">{error}</p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <button onClick={poll} className="btn-secondary w-full gap-2">
                  <RefreshCw className="h-4 w-4" /> Try again
                </button>
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="btn-ghost w-full"
                >
                  Check My Bookings
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
