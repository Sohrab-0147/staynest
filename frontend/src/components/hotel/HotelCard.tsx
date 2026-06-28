import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, Utensils, Waves, Wind } from 'lucide-react';
import type { HotelPriceResponseDto } from '@/types';

// ── Amenity icon map ──────────────────────────────────────────────
const amenityIcons: Record<string, React.ReactNode> = {
  wifi:        <Wifi className="h-3.5 w-3.5" />,
  parking:     <Car className="h-3.5 w-3.5" />,
  restaurant:  <Utensils className="h-3.5 w-3.5" />,
  pool:        <Waves className="h-3.5 w-3.5" />,
  ac:          <Wind className="h-3.5 w-3.5" />,
};

function amenityIcon(label: string) {
  const key = label.toLowerCase();
  for (const [k, icon] of Object.entries(amenityIcons)) {
    if (key.includes(k)) return icon;
  }
  return <Star className="h-3.5 w-3.5" />;
}

interface HotelCardProps {
  hotel: HotelPriceResponseDto;
  searchParams: string; // forwarded to detail page so dates persist
}

export default function HotelCard({ hotel, searchParams }: HotelCardProps) {
  const photo = hotel.photos?.[0];
  const shownAmenities = hotel.amenities?.slice(0, 4) ?? [];

  return (
    <Link
      to={`/hotels/${hotel.id}?${searchParams}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
    >
      {/* Photo */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {photo ? (
          <img
            src={photo}
            alt={hotel.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <span className="text-5xl">🏨</span>
          </div>
        )}
        {/* Price badge */}
        <div className="absolute bottom-3 right-3 rounded-xl bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm">
          <span className="text-xs text-slate-400">from</span>
          <p className="text-lg font-bold text-slate-900 leading-tight">
            ₹{hotel.price?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-xs text-slate-400">/night</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {hotel.name}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">
              {hotel.contactInfo?.address
                ? `${hotel.contactInfo.address}, ${hotel.city}`
                : hotel.city}
            </span>
          </div>
        </div>

        {/* Amenities */}
        {shownAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shownAmenities.map((a) => (
              <span
                key={a}
                className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                {amenityIcon(a)}
                {a}
              </span>
            ))}
            {(hotel.amenities?.length ?? 0) > 4 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                +{hotel.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2 border-t border-slate-100">
          <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
            View rooms →
          </span>
        </div>
      </div>
    </Link>
  );
}
