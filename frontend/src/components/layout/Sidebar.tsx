import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarRange,
  ChevronRight,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const items: SidebarItem[] = [
  {
    label: 'Dashboard',
    to: '/admin',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: 'Hotels',
    to: '/admin/hotels',
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    label: 'Rooms',
    to: '/admin/rooms',
    icon: <BedDouble className="h-4 w-4" />,
  },
  {
    label: 'Inventory',
    to: '/admin/inventory',
    icon: <CalendarRange className="h-4 w-4" />,
  },
];

interface SidebarProps {
  /** Render as a collapsible overlay on mobile when true */
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const content = (
    <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-white p-4">
      {/* Brand */}
      <div className="mb-6 flex items-center gap-2 px-1">
        <Building2 className="h-5 w-5 text-blue-600" />
        <span className="text-base font-bold text-slate-900">Admin Panel</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'} // exact match only for dashboard
            className={linkClass}
            onClick={onMobileClose}
          >
            <span className="flex items-center gap-3">
              {item.icon}
              {item.label}
            </span>
            <ChevronRight className="h-3.5 w-3.5 opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Footer hint */}
      <p className="mt-4 text-center text-xs text-slate-400">
        StayNest Manager
      </p>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden md:flex">{content}</div>

      {/* Mobile: overlay drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative animate-slideUp">{content}</div>
        </div>
      )}
    </>
  );
}
