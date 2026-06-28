import { Link } from 'react-router-dom';
import { Building2, BedDouble, CalendarRange, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const CARDS = [
  {
    title: 'Manage Hotels',
    desc: 'Create, update, activate and delete hotel listings.',
    icon: <Building2 className="h-7 w-7 text-blue-600" />,
    to: '/admin/hotels',
    color: 'bg-blue-50',
  },
  {
    title: 'Manage Rooms',
    desc: 'Add room types, set pricing and upload photos.',
    icon: <BedDouble className="h-7 w-7 text-indigo-600" />,
    to: '/admin/hotels',
    color: 'bg-indigo-50',
  },
  {
    title: 'Manage Inventory',
    desc: 'Set availability, surge pricing, and close dates.',
    icon: <CalendarRange className="h-7 w-7 text-violet-600" />,
    to: '/admin/inventory',
    color: 'bg-violet-50',
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-blue-200 text-sm max-w-md">
          Manage your hotels, rooms, and inventory from one place.
        </p>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="card group flex flex-col gap-4 p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${c.color}`}>
              {c.icon}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {c.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
              Go <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
