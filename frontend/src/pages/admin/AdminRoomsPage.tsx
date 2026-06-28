import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, BedDouble, Trash2, CalendarRange, ArrowLeft } from 'lucide-react';
import adminService from '@/services/adminService';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/forms/FormInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { extractErrorMessage } from '@/hooks/useApi';
import type { RoomDto } from '@/types';
import toast from 'react-hot-toast';

const EMPTY_ROOM = {
  type:       '',
  basePrice:  '',
  totalCount: '',
  capacity:   '',
  photos:     '',
  amenities:  '',
};

export default function AdminRoomsPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate    = useNavigate();

  const [rooms, setRooms]         = useState<RoomDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState(EMPTY_ROOM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving]   = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchRooms = useCallback(async () => {
    if (!hotelId) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await adminService.getRoomsByHotel(Number(hotelId));
      setRooms(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [hotelId]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.type.trim())              next.type       = 'Room type is required.';
    if (!form.basePrice || isNaN(Number(form.basePrice))) next.basePrice = 'Valid price is required.';
    if (!form.totalCount || isNaN(Number(form.totalCount))) next.totalCount = 'Total count is required.';
    if (!form.capacity || isNaN(Number(form.capacity))) next.capacity = 'Capacity is required.';
    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleCreate() {
    if (!validate() || !hotelId) return;
    setIsSaving(true);
    try {
      const newRoom = await adminService.createRoom(Number(hotelId), {
        type:       form.type.trim(),
        basePrice:  Number(form.basePrice),
        totalCount: Number(form.totalCount),
        capacity:   Number(form.capacity),
        photos:     form.photos.split(',').map((s) => s.trim()).filter(Boolean),
        amenities:  form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setRooms((prev) => [...prev, newRoom]);
      toast.success('Room created.');
      setModalOpen(false);
      setForm(EMPTY_ROOM);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(roomId: number) {
    if (!hotelId || !confirm('Delete this room?')) return;
    setDeletingId(roomId);
    try {
      await adminService.deleteRoom(Number(hotelId), roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      toast.success('Room deleted.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  const field = (key: keyof typeof EMPTY_ROOM) => ({
    value:    form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/hotels')} className="btn-ghost p-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Rooms</h1>
            <p className="text-sm text-slate-500">Hotel #{hotelId}</p>
          </div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> New Room
        </button>
      </div>

      {isLoading && <LoadingSpinner size="lg" label="Loading rooms…" />}
      {error && !isLoading && <ErrorMessage message={error} onRetry={fetchRooms} variant="page" />}

      {!isLoading && !error && rooms.length === 0 && (
        <div className="card p-10 text-center text-slate-500">
          <BedDouble className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="font-medium">No rooms yet</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary mt-4 gap-2">
            <Plus className="h-4 w-4" /> Add first room
          </button>
        </div>
      )}

      {/* Room cards */}
      <div className="flex flex-col gap-3">
        {rooms.map((room) => (
          <div key={room.id} className="card flex items-center gap-4 p-4 flex-wrap">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
              <BedDouble className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">{room.type}</p>
              <p className="text-sm text-slate-500">
                ₹{room.basePrice?.toLocaleString('en-IN')} / night ·{' '}
                {room.totalCount} room{room.totalCount !== 1 ? 's' : ''} ·{' '}
                Capacity: {room.capacity}
              </p>
              {room.amenities?.length > 0 && (
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {room.amenities.join(', ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(`/admin/inventory/${room.id}`)}
                className="btn-secondary gap-1.5 text-sm"
              >
                <CalendarRange className="h-3.5 w-3.5" /> Inventory
              </button>
              <button
                onClick={() => handleDelete(room.id)}
                disabled={deletingId === room.id}
                className="btn-ghost rounded-lg p-2 text-slate-400 hover:text-red-600"
              >
                {deletingId === room.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Room"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <FormInput label="Room type" placeholder="Deluxe Double" required {...field('type')} error={formErrors.type} />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Base price (₹)" type="number" min="0" required {...field('basePrice')} error={formErrors.basePrice} />
            <FormInput label="Total rooms"     type="number" min="1" required {...field('totalCount')} error={formErrors.totalCount} />
          </div>
          <FormInput label="Capacity (guests)" type="number" min="1" required {...field('capacity')} error={formErrors.capacity} />
          <FormInput label="Photos (comma-separated URLs)" placeholder="https://…" {...field('photos')} />
          <FormInput label="Amenities (comma-separated)" placeholder="AC, WiFi, TV" {...field('amenities')} />

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={isSaving} className="btn-primary flex-1">
              {isSaving ? <LoadingSpinner size="sm" /> : 'Create Room'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
