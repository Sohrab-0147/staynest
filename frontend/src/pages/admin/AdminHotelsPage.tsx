import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, Pencil, Trash2, CheckCircle, BedDouble } from 'lucide-react';
import adminService from '@/services/adminService';
import hotelService from '@/services/hotelService';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/forms/FormInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { extractErrorMessage } from '@/hooks/useApi';
import { todayISO, daysFromNow } from '@/utils/dateUtils';
import type { HotelDto, HotelPriceResponseDto } from '@/types';
import toast from 'react-hot-toast';

// ── Hotel form state ──────────────────────────────────────────────

const EMPTY = {
  name:          '',
  city:          '',
  photos:        '',          // CSV of URLs
  amenities:     '',          // CSV
  address:       '',
  phoneNumber:   '',
  email:         '',
  location:      '',
};

type HotelForm = typeof EMPTY;

function formToDto(f: HotelForm): Omit<HotelDto, 'id'> {
  return {
    name:        f.name.trim(),
    city:        f.city.trim(),
    photos:      f.photos.split(',').map((s) => s.trim()).filter(Boolean),
    amenities:   f.amenities.split(',').map((s) => s.trim()).filter(Boolean),
    active:      false,
    contactInfo: {
      address:     f.address.trim(),
      phoneNumber: f.phoneNumber.trim(),
      email:       f.email.trim(),
      location:    f.location.trim(),
    },
  };
}

function dtoToForm(h: HotelDto): HotelForm {
  return {
    name:        h.name,
    city:        h.city,
    photos:      (h.photos ?? []).join(', '),
    amenities:   (h.amenities ?? []).join(', '),
    address:     h.contactInfo?.address     ?? '',
    phoneNumber: h.contactInfo?.phoneNumber ?? '',
    email:       h.contactInfo?.email       ?? '',
    location:    h.contactInfo?.location    ?? '',
  };
}

export default function AdminHotelsPage() {
  const navigate = useNavigate();

  // ── Search hotels (public endpoint — list by city) ────────────
  const [city, setCity]                     = useState('');
  const [searchResults, setSearchResults]   = useState<HotelPriceResponseDto[]>([]);
  const [isSearching, setIsSearching]       = useState(false);
  const [searchError, setSearchError]       = useState('');
  const [searched, setSearched]             = useState(false);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!city.trim()) return;
    setIsSearching(true);
    setSearchError('');
    setSearched(true);
    try {
      const page = await hotelService.searchHotels({
        city: city.trim(),
        startDate: todayISO(),
        endDate: daysFromNow(1),
        roomsCount: 1,
        page: 0,
        size: 20,
      });
      setSearchResults(page.content);
    } catch (err) {
      setSearchError(extractErrorMessage(err));
    } finally {
      setIsSearching(false);
    }
  }

  // ── Create / Edit modal ───────────────────────────────────────
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [form, setForm]             = useState<HotelForm>(EMPTY);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving]     = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setFormErrors({});
    setModalOpen(true);
  }

  async function openEdit(id: number) {
    try {
      const hotel = await adminService.getHotelById(id);
      setEditingId(id);
      setForm(dtoToForm(hotel));
      setFormErrors({});
      setModalOpen(true);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Hotel name is required.';
    if (!form.city.trim()) next.city = 'City is required.';
    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const dto = formToDto(form);
      if (editingId) {
        await adminService.updateHotel(editingId, dto);
        toast.success('Hotel updated.');
        setSearchResults((prev) =>
          prev.map((h) => (h.id === editingId ? { ...h, ...dto } : h)),
        );
      } else {
        await adminService.createHotel(dto);
        toast.success('Hotel created. Activate it to make it visible.');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  // ── Delete / Activate ─────────────────────────────────────────
  async function handleDelete(id: number) {
    if (!confirm('Delete this hotel permanently?')) return;
    try {
      await adminService.deleteHotel(id);
      setSearchResults((prev) => prev.filter((h) => h.id !== id));
      toast.success('Hotel deleted.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleActivate(id: number) {
    try {
      await adminService.activateHotel(id);
      toast.success('Hotel activated.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  const field = (key: keyof HotelForm) => ({
    value:    form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hotels</h1>
          <p className="text-sm text-slate-500 mt-0.5">Search, create and manage hotel listings</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> New Hotel
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="card flex gap-3 p-4">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search hotels by city…"
          className="input-base flex-1"
        />
        <button type="submit" disabled={isSearching} className="btn-primary gap-2 shrink-0">
          {isSearching ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </form>

      {searchError && <ErrorMessage message={searchError} />}

      {/* Results */}
      {searched && !isSearching && searchResults.length === 0 && (
        <div className="card p-10 text-center text-slate-500">
          <Building2 className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="font-medium">No hotels found for "{city}"</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="flex flex-col gap-3">
          {searchResults.map((h) => (
            <div key={h.id} className="card flex items-center gap-4 p-4 flex-wrap">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{h.name}</p>
                <p className="text-sm text-slate-500">{h.city}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => navigate(`/admin/hotels/${h.id}/rooms`)}
                  className="btn-secondary gap-1.5 text-sm"
                >
                  <BedDouble className="h-3.5 w-3.5" /> Rooms
                </button>
                <button
                  onClick={() => handleActivate(h.id)}
                  className="btn-ghost gap-1.5 text-sm text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Activate
                </button>
                <button
                  onClick={() => openEdit(h.id)}
                  className="btn-ghost rounded-lg p-2 text-slate-400 hover:text-blue-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(h.id)}
                  className="btn-ghost rounded-lg p-2 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit modal ──────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Hotel' : 'Create Hotel'}
        size="lg"
      >
        <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput label="Hotel name" required {...field('name')} error={formErrors.name} />
            <FormInput label="City" required {...field('city')} error={formErrors.city} />
          </div>

          <FormInput
            label="Photos (comma-separated URLs)"
            placeholder="https://img.example.com/1.jpg, https://…"
            {...field('photos')}
          />
          <FormInput
            label="Amenities (comma-separated)"
            placeholder="WiFi, Pool, Parking, Restaurant"
            {...field('amenities')}
          />

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 pt-2">
            Contact Information
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput label="Address"      {...field('address')} />
            <FormInput label="Phone number" {...field('phoneNumber')} />
            <FormInput label="Email"        type="email" {...field('email')} />
            <FormInput label="Location / Maps URL" {...field('location')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="btn-primary flex-1">
              {isSaving ? <LoadingSpinner size="sm" /> : editingId ? 'Update Hotel' : 'Create Hotel'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
