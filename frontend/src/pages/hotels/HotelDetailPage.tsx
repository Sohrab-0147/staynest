import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowLeft, BedDouble } from 'lucide-react';
import hotelService from '@/services/hotelService';
import bookingService from '@/services/bookingService';
import RoomCard from '@/components/hotel/RoomCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { extractErrorMessage } from '@/hooks/useApi';
import { formatDate, nightsBetween } from '@/utils/dateUtils';
import type { HotelInfoDto, RoomPriceResponseDto } from '@/types';
import toast from 'react-hot-toast';

export default function HotelDetailPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const startDate  = searchParams.get('startDate')  ?? '';
  const endDate    = searchParams.get('endDate')    ?? '';
  const roomsCount = Number(searchParams.get('roomsCount') ?? 1);

  const [info, setInfo]         = useState<HotelInfoDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [bookingRoomId, setBookingRoomId] = useState<number | null>(null);

  // ── Fetch hotel info ──────────────────────────────────────────
  useEffect(() => {
    if (!hotelId || !startDate || !endDate) return;

    const fetch = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await hotelService.getHotelInfo(Number(hotelId), {
          startDate,
          endDate,
          roomsCount,
        });
        setInfo(data);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [hotelId, startDate, endDate, roomsCount]);

  // ── Book a room ───────────────────────────────────────────────
  async function handleBook(room: RoomPriceResponseDto) {
    if (!isAuthenticated) {
      toast.error('Please sign in to make a booking.');
      navigate('/login', { state: { from: { pathname: `/hotels/${hotelId}` } } });
      return;
    }
    if (!hotelId || !startDate || !endDate) return;

    setBookingRoomId(room.id);
    try {
      const booking = await bookingService.initBooking({
        hotelId: Number(hotelId),
        roomId: room.id,
        checkInDate: startDate,
        checkOutDate: endDate,
        roomsCount,
      });
      toast.success('Booking initiated!');
      navigate(`/booking/${booking.id}`, {
        state: { booking, hotel: info?.hotel, room },
      });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBookingRoomId(null);
    }
  }

  const nights = nightsBetween(startDate, endDate);
  const hotel  = info?.hotel;
  const photos = hotel?.photos ?? [];

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" label="Loading hotel details…" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="page-container py-8">
        <ErrorMessage
          message={error}
          variant="page"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="py-8 px-6">
      <div className="page-container flex flex-col gap-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost self-start gap-1.5 text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to results
        </button>

        {/* ── Photo gallery ─────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 h-72 overflow-hidden rounded-2xl">
          {photos.length > 0 ? (
            <>
              <div className="sm:col-span-2 overflow-hidden">
                <img
                  src={photos[0]}
                  alt={hotel?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="hidden sm:flex flex-col gap-3">
                {photos.slice(1, 3).map((p, i) => (
                  <div key={i} className="flex-1 overflow-hidden">
                    <img src={p} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                {photos.length === 1 && (
                  <div className="flex-1 flex items-center justify-center bg-slate-100 rounded-xl">
                    <BedDouble className="h-10 w-10 text-slate-300" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="sm:col-span-3 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl">
              <span className="text-7xl">🏨</span>
            </div>
          )}
        </div>

        {/* ── Hotel info + stay summary ──────────────────────── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">

          {/* Left: hotel details */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{hotel?.name}</h1>
              <div className="mt-2 flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{hotel?.contactInfo?.address ?? hotel?.city}</span>
              </div>
            </div>

            {/* Amenities */}
            {hotel?.amenities?.length ? (
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                  >
                    {a}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Contact */}
            {hotel?.contactInfo && (
              <div className="card p-4 flex flex-col gap-2">
                <p className="text-sm font-semibold text-slate-700">Contact</p>
                {hotel.contactInfo.phoneNumber && (
                  <a
                    href={`tel:${hotel.contactInfo.phoneNumber}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {hotel.contactInfo.phoneNumber}
                  </a>
                )}
                {hotel.contactInfo.email && (
                  <a
                    href={`mailto:${hotel.contactInfo.email}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {hotel.contactInfo.email}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: stay summary card */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="card p-5 flex flex-col gap-3 sticky top-24">
              <p className="font-semibold text-slate-800">Your stay</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Check-in</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{formatDate(startDate)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Check-out</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{formatDate(endDate)}</p>
                </div>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-sm text-slate-600">
                <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                <span>{roomsCount} room{roomsCount !== 1 ? 's' : ''}</span>
              </div>
              <p className="text-xs text-slate-400 text-center">Select a room below to book</p>
            </div>
          </div>
        </div>

        {/* ── Rooms ─────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Available Rooms ({info.rooms.length})
          </h2>

          {info.rooms.length === 0 ? (
            <div className="card p-10 text-center text-slate-500">
              <BedDouble className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="font-medium">No rooms available for these dates.</p>
              <p className="text-sm mt-1">Try adjusting your check-in or check-out dates.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {info.rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onBook={handleBook}
                  isBooking={bookingRoomId === room.id}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
