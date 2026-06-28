import { Users, BedDouble, Star } from 'lucide-react';
import type { RoomPriceResponseDto } from '@/types';

interface RoomCardProps {
  room: RoomPriceResponseDto;
  onBook: (room: RoomPriceResponseDto) => void;
  isBooking?: boolean; // shows spinner on this card's button
}

export default function RoomCard({ room, onBook, isBooking }: RoomCardProps) {
  const photo = room.photos?.[0];
  const amenities = room.amenities?.slice(0, 5) ?? [];

  return (
    <div className="card flex flex-col overflow-hidden sm:flex-row">
      {/* Photo */}
      <div className="h-44 w-full shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:w-52">
        {photo ? (
          <img
            src={photo}
            alt={room.type}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <BedDouble className="h-10 w-10 text-blue-300" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{room.type}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Users className="h-3.5 w-3.5" />
                <span>Up to {room.amenities?.includes('capacity') ? '—' : '—'} guests</span>
              </div>
            </div>
            {/* Price */}
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-slate-900">
                ₹{room.price?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-400">per night</p>
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {amenities.map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  <Star className="h-3 w-3" />
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-green-600 font-medium">✓ Free cancellation</p>
          <button
            onClick={() => onBook(room)}
            disabled={isBooking}
            className="btn-primary px-6"
          >
            {isBooking ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Booking…
              </span>
            ) : (
              'Book Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
