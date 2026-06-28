import type { BookingStatus } from '@/types';

// ── Booking status → visual style map ────────────────────────────

const statusConfig: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  RESERVED:         { label: 'Reserved',         className: 'badge badge-blue' },
  GUESTS_ADDED:     { label: 'Guests Added',      className: 'badge badge-blue' },
  PAYMENTS_PENDING: { label: 'Payment Pending',   className: 'badge badge-yellow' },
  CONFIRMED:        { label: 'Confirmed',          className: 'badge badge-green' },
  CANCELLED:        { label: 'Cancelled',          className: 'badge badge-red' },
  EXPIRED:          { label: 'Expired',            className: 'badge badge-gray' },
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const cfg = statusConfig[status] ?? {
    label: status,
    className: 'badge badge-gray',
  };
  return <span className={cfg.className}>{cfg.label}</span>;
}

// ── Generic badge ─────────────────────────────────────────────────

type BadgeVariant = 'blue' | 'green' | 'yellow' | 'red' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
