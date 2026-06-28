import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';

// ── Guards ────────────────────────────────────────────────────────
import ProtectedRoute from './ProtectedRoute';
import AdminRoute     from './AdminRoute';

// ── Layout components ─────────────────────────────────────────────
import Navbar  from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

// ── Auth pages ────────────────────────────────────────────────────
import LoginPage    from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// ── Module 6: Hotel Search Flow ───────────────────────────────────
import HomePage        from '@/pages/home/HomePage';
import HotelSearchPage from '@/pages/hotels/HotelSearchPage';
import HotelDetailPage from '@/pages/hotels/HotelDetailPage';

// ── Module 7: Booking Flow ────────────────────────────────────────
import BookingPage        from '@/pages/booking/BookingPage';
import BookingConfirmPage from '@/pages/booking/BookingConfirmPage';

// ── Module 8: User Dashboard ──────────────────────────────────────
import MyBookingsPage from '@/pages/dashboard/MyBookingsPage';
import ProfilePage    from '@/pages/dashboard/ProfilePage';
import GuestsPage     from '@/pages/dashboard/GuestsPage';

// ── Module 9: Admin Panel ─────────────────────────────────────────
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminHotelsPage    from '@/pages/admin/AdminHotelsPage';
import AdminRoomsPage     from '@/pages/admin/AdminRoomsPage';
import AdminInventoryPage from '@/pages/admin/AdminInventoryPage';

// ── Layout wrappers ───────────────────────────────────────────────

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar
          isMobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-auto">
          <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <Menu className="h-4 w-4" /> Menu
            </button>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        }}
      />

      <Routes>
        {/* ── Auth (no Navbar) ────────────────────────────────── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Public routes ────────────────────────────────────── */}
        <Route path="/"              element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/hotels/search" element={<MainLayout><HotelSearchPage /></MainLayout>} />
        <Route path="/hotels/:hotelId" element={<MainLayout><HotelDetailPage /></MainLayout>} />

        {/* ── Protected routes ─────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>

          {/* User dashboard */}
          <Route path="/my-bookings" element={<MainLayout><MyBookingsPage /></MainLayout>} />
          <Route path="/profile"     element={<MainLayout><ProfilePage /></MainLayout>} />
          <Route path="/guests"      element={<MainLayout><GuestsPage /></MainLayout>} />

          {/* Booking flow */}
          <Route path="/booking/:bookingId"         element={<MainLayout><BookingPage /></MainLayout>} />
          <Route path="/booking/:bookingId/confirm" element={<MainLayout><BookingConfirmPage /></MainLayout>} />

          {/* ── Admin routes (MANAGER role) ───────────────────── */}
          <Route element={<AdminRoute />}>
            <Route path="/admin"                        element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
            <Route path="/admin/hotels"                 element={<AdminLayout><AdminHotelsPage /></AdminLayout>} />
            <Route path="/admin/hotels/:hotelId/rooms"  element={<AdminLayout><AdminRoomsPage /></AdminLayout>} />
            <Route path="/admin/inventory/:roomId"      element={<AdminLayout><AdminInventoryPage /></AdminLayout>} />
          </Route>
        </Route>

        {/* ── Catch-all ─────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
