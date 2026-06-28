import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import guestService from '@/services/guestService';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { extractErrorMessage } from '@/hooks/useApi';
import { formatDate } from '@/utils/dateUtils';
import type { GuestDto, Gender } from '@/types';
import toast from 'react-hot-toast';

const GENDER_OPTIONS = [
  { value: 'MALE',   label: 'Male'   },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER',  label: 'Other'  },
];

const EMPTY_FORM = { name: '', gender: 'OTHER' as Gender, dateOfBirth: '' };

export default function GuestsPage() {
  const [guests, setGuests]       = useState<GuestDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<GuestDto | null>(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving]   = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchGuests = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await guestService.getAllGuests();
      setGuests(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  // ── Modal helpers ─────────────────────────────────────────────

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(guest: GuestDto) {
    setEditing(guest);
    setForm({
      name:        guest.name,
      gender:      guest.gender,
      dateOfBirth: guest.dateOfBirth,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim())    next.name = 'Name is required.';
    if (!form.dateOfBirth)    next.dateOfBirth = 'Date of birth is required.';
    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Save (add or update) ──────────────────────────────────────

  async function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        gender:      form.gender,
        dateOfBirth: form.dateOfBirth,
      };

      if (editing?.id) {
        await guestService.updateGuest(editing.id, payload);
        setGuests((prev) =>
          prev.map((g) => (g.id === editing.id ? { ...g, ...payload } : g)),
        );
        toast.success('Guest updated.');
      } else {
        const created = await guestService.addGuest(payload);
        setGuests((prev) => [...prev, created]);
        toast.success('Guest added.');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────

  async function handleDelete(id: number) {
    if (!confirm('Remove this guest from your list?')) return;
    setDeletingId(id);
    try {
      await guestService.deleteGuest(id);
      setGuests((prev) => prev.filter((g) => g.id !== id));
      toast.success('Guest removed.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="py-10 px-6">
      <div className="page-container max-w-2xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Guests</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Save travel companions to add them to bookings quickly
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary gap-2">
            <UserPlus className="h-4 w-4" /> Add guest
          </button>
        </div>

        {isLoading && <LoadingSpinner size="lg" label="Loading guests…" />}

        {error && !isLoading && (
          <ErrorMessage message={error} onRetry={fetchGuests} variant="page" />
        )}

        {!isLoading && !error && guests.length === 0 && (
          <div className="card flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-5xl">👥</span>
            <h2 className="text-xl font-semibold text-slate-700">No guests yet</h2>
            <p className="text-sm text-slate-500 max-w-xs">
              Add your travel companions so you can include them in future bookings.
            </p>
            <button onClick={openAdd} className="btn-primary gap-2">
              <UserPlus className="h-4 w-4" /> Add your first guest
            </button>
          </div>
        )}

        {/* Guest cards */}
        {!isLoading && !error && guests.length > 0 && (
          <div className="flex flex-col gap-3">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className="card flex items-center gap-4 p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-lg font-bold text-white">
                  {guest.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{guest.name}</p>
                  <p className="text-sm text-slate-500">
                    {guest.gender} · DOB: {formatDate(guest.dateOfBirth)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(guest)}
                    className="btn-ghost rounded-lg p-2 text-slate-400 hover:text-blue-600"
                    aria-label="Edit guest"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(guest.id!)}
                    disabled={deletingId === guest.id}
                    className="btn-ghost rounded-lg p-2 text-slate-400 hover:text-red-600"
                    aria-label="Delete guest"
                  >
                    {deletingId === guest.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit modal ──────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Guest' : 'Add Guest'}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <FormInput
            label="Full name"
            type="text"
            required
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              setFormErrors((er) => ({ ...er, name: '' }));
            }}
            error={formErrors.name}
          />

          <FormInput
            label="Date of birth"
            type="date"
            required
            value={form.dateOfBirth}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              setForm((f) => ({ ...f, dateOfBirth: e.target.value }));
              setFormErrors((er) => ({ ...er, dateOfBirth: '' }));
            }}
            error={formErrors.dateOfBirth}
          />

          <FormSelect
            label="Gender"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={(e) =>
              setForm((f) => ({ ...f, gender: e.target.value as Gender }))
            }
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex-1"
            >
              {isSaving ? <LoadingSpinner size="sm" /> : editing ? 'Update' : 'Add Guest'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
