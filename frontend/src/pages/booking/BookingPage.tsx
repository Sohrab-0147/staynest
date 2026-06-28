import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Users, CreditCard,
  CalendarDays, BedDouble, AlertCircle,
} from 'lucide-react';
import bookingService from '@/services/bookingService';
import guestService from '@/services/guestService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { extractErrorMessage } from '@/hooks/useApi';
import { formatDate, nightsBetween } from '@/utils/dateUtils';
import type { BookingDto, GuestDto, HotelDto, RoomPriceResponseDto } from '@/types';
import toast from 'react-hot-toast';

// ── Step indicator ────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Review',  icon: <CalendarDays className="h-4 w-4" /> },
  { id: 2, label: 'Guests',  icon: <Users className="h-4 w-4" /> },
  { id: 3, label: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
              current > step.id
                ? 'border-blue-600 bg-blue-600 text-white'
                : current === step.id
                ? 'border-blue-600 bg-white text-blue-600'
                : 'border-slate-200 bg-white text-slate-400'
            }`}
          >
            {current > step.id ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
          </div>
          <p className={`ml-2 text-sm font-medium hidden sm:block ${
            current >= step.id ? 'text-slate-900' : 'text-slate-400'
          }`}>
            {step.label}
          </p>
          {idx < STEPS.length - 1 && (
            <div className={`mx-4 h-0.5 w-12 sm:w-20 transition-colors ${
              current > step.id ? 'bg-blue-600' : 'bg-slate-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Location state passed from HotelDetailPage ────────────────────

interface BookingLocationState {
  booking?: BookingDto;
  hotel?: HotelDto;
  room?: RoomPriceResponseDto;
}

export default function BookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location      = useLocation();
  const navigate      = useNavigate();

  const state = location.state as BookingLocationState | null;

  const [step, setStep]             = useState(1);
  const [booking, setBooking]       = useState<BookingDto | null>(state?.booking ?? null);
  const [guests, setGuests]         = useState<GuestDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading]   = useState(!state?.booking);
  const [isBusy, setIsBusy]         = useState(false);
  const [error, setError]           = useState('');

  const hotel = state?.hotel;
  const room  = state?.room;

  // ── If no state, fetch booking ────────────────────────────────
  useEffect(() => {
    if (booking) return;
    if (!bookingId) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const status = await bookingService.getBookingStatus(Number(bookingId));
        // We only have status, not full DTO — navigate to confirm if terminal
        if (['CONFIRMED', 'CANCELLED', 'EXPIRED'].includes(status.bookingStatus)) {
          navigate(`/booking/${bookingId}/confirm`, { replace: true });
        }
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [bookingId, booking, navigate]);

  // ── Load guests when entering step 2 ─────────────────────────
  useEffect(() => {
    if (step !== 2) return;
    const fetch = async () => {
      setIsBusy(true);
      try {
        const data = await guestService.getAllGuests();
        setGuests(data);
      } catch {
        toast.error('Could not load guests. You can skip this step.');
      } finally {
        setIsBusy(false);
      }
    };
    fetch();
  }, [step]);

  function toggleGuest(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  // ── Step 2 → add guests → proceed ────────────────────────────
  async function handleAddGuests() {
    if (!bookingId) return;
    setIsBusy(true);
    setError('');
    try {
      const updated = await bookingService.addGuests(
        Number(bookingId),
        selectedIds,
      );
      setBooking(updated);
      setStep(3);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  }

  // ── Step 3 → initiate Stripe payment ─────────────────────────
  async function handlePayment() {
    if (!bookingId) return;
    setIsBusy(true);
    setError('');
    try {
      const { sessionUrl } = await bookingService.initiatePayment(Number(bookingId));
      // Redirect to Stripe-hosted checkout
      window.location.href = sessionUrl;
    } catch (err) {
      setError(extractErrorMessage(err));
      setIsBusy(false);
    }
  }

  // ── Cancel booking ────────────────────────────────────────────
  async function handleCancel() {
    if (!bookingId || !confirm('Cancel this booking?')) return;
    setIsBusy(true);
    try {
      await bookingService.cancelBooking(Number(bookingId));
      toast.success('Booking cancelled.');
      navigate('/my-bookings', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setIsBusy(false);
    }
  }

  const nights = booking
    ? nightsBetween(booking.checkInDate, booking.checkOutDate)
    : 0;

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" label="Loading booking details…" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="py-10 px-6">
      <div className="page-container max-w-2xl mx-auto flex flex-col gap-8">

        {/* Step indicator */}
        <div className="card p-6">
          <StepBar current={step} />
        </div>

        {/* Error */}
        {error && <ErrorMessage message={error} onRetry={() => setError('')} />}

        {/* ── Step 1: Review ──────────────────────────────────── */}
        {step === 1 && (
          <div className="card p-6 flex flex-col gap-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-900">Review your booking</h2>

            {hotel && (
              <div className="flex items-start gap-3">
                <span className="text-3xl">🏨</span>
                <div>
                  <p className="font-semibold text-slate-900">{hotel.name}</p>
                  <p className="text-sm text-slate-500">{hotel.city}</p>
                </div>
              </div>
            )}

            {room && (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
                <BedDouble className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="font-medium text-slate-800">{room.type}</p>
                  <p className="text-sm text-blue-600 font-semibold">
                    ₹{room.price?.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / night
                  </p>
                </div>
              </div>
            )}

            {booking && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Check-in</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{formatDate(booking.checkInDate)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Check-out</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{formatDate(booking.checkOutDate)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Rooms</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{booking.roomsCount}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Nights</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{nights}</p>
                </div>
              </div>
            )}

            {booking && (
              <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
                <span className="font-semibold text-slate-800">Total</span>
                <span className="text-2xl font-bold text-blue-700">
                  ₹{Number(booking.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            )}

            {booking && (
              <div className="flex items-center gap-2">
                <BookingStatusBadge status={booking.bookingStatus} />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={handleCancel} disabled={isBusy} className="btn-danger flex-1">
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="btn-primary flex-1"
              >
                Continue → Add Guests
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Add Guests ──────────────────────────────── */}
        {step === 2 && (
          <div className="card p-6 flex flex-col gap-5 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add guests</h2>
              <p className="text-sm text-slate-500 mt-1">
                Select from your saved guests. You can skip this step.
              </p>
            </div>

            {isBusy && <LoadingSpinner size="md" label="Loading guests…" />}

            {!isBusy && guests.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">
                <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="font-medium">No saved guests</p>
                <p className="text-sm mt-1">
                  You can add guests in{' '}
                  <button
                    onClick={() => navigate('/guests')}
                    className="text-blue-600 underline"
                  >
                    My Guests
                  </button>
                  , or skip this step.
                </p>
              </div>
            )}

            {!isBusy && guests.length > 0 && (
              <div className="flex flex-col gap-2">
                {guests.map((g) => {
                  const isSelected = selectedIds.includes(g.id!);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGuest(g.id!)}
                      className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {g.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{g.name}</p>
                        <p className="text-xs text-slate-500">{g.gender} · DOB: {g.dateOfBirth}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                ← Back
              </button>
              <button
                onClick={handleAddGuests}
                disabled={isBusy}
                className="btn-primary flex-1"
              >
                {isBusy ? <LoadingSpinner size="sm" /> : (
                  selectedIds.length > 0
                    ? `Continue with ${selectedIds.length} guest${selectedIds.length > 1 ? 's' : ''}`
                    : 'Skip & Continue →'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Payment ─────────────────────────────────── */}
        {step === 3 && (
          <div className="card p-6 flex flex-col gap-5 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-900">Complete payment</h2>

            <div className="rounded-xl bg-blue-50 p-5 flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Booking ID</span>
                <span className="font-semibold text-slate-900">#{bookingId}</span>
              </div>
              {booking && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Duration</span>
                    <span className="font-semibold text-slate-900">{nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-px bg-blue-200" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800">Total amount</span>
                    <span className="text-2xl font-bold text-blue-700">
                      ₹{Number(booking.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                You'll be redirected to Stripe's secure checkout. After payment,
                you'll return here to see your confirmation.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                ← Back
              </button>
              <button
                onClick={handlePayment}
                disabled={isBusy}
                className="btn-primary flex-1 gap-2"
              >
                {isBusy ? (
                  <><LoadingSpinner size="sm" /> Redirecting…</>
                ) : (
                  <><CreditCard className="h-4 w-4" /> Pay now</>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
