import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarRange, Lock, Unlock, TrendingUp } from 'lucide-react';
import inventoryService from '@/services/inventoryService';
import FormInput from '@/components/forms/FormInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { extractErrorMessage } from '@/hooks/useApi';
import { formatDate, todayISO, daysFromNow } from '@/utils/dateUtils';
import type { InventoryDto } from '@/types';
import toast from 'react-hot-toast';

export default function AdminInventoryPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate   = useNavigate();

  const [inventory, setInventory] = useState<InventoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  // ── Bulk-update form ─────────────────────────────────────────
  const [updateForm, setUpdateForm] = useState({
    startDate:   todayISO(),
    endDate:     daysFromNow(7),
    surgeFactor: '1.0',
    closed:      false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInventory = useCallback(async () => {
    if (!roomId) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await inventoryService.getInventoryByRoom(Number(roomId));
      const sorted = [...data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setInventory(sorted);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!updateForm.startDate) next.startDate = 'Required.';
    if (!updateForm.endDate)   next.endDate   = 'Required.';
    if (updateForm.endDate < updateForm.startDate)
      next.endDate = 'End must be after start.';
    const sf = Number(updateForm.surgeFactor);
    if (isNaN(sf) || sf < 0.5 || sf > 5)
      next.surgeFactor = 'Surge factor must be between 0.5 and 5.';
    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !roomId) return;
    setIsUpdating(true);
    try {
      await inventoryService.updateInventory(Number(roomId), {
        startDate:   updateForm.startDate,
        endDate:     updateForm.endDate,
        surgeFactor: Number(updateForm.surgeFactor),
        closed:      updateForm.closed,
      });
      toast.success('Inventory updated.');
      await fetchInventory();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  }

  // ── Availability status ───────────────────────────────────────
  function availableCount(inv: InventoryDto): number {
    return Math.max(0, inv.totalCount - inv.bookedCount - inv.reservedCount);
  }

  function availabilityColor(inv: InventoryDto): string {
    if (inv.closed) return 'bg-red-50 border-red-100';
    const avail = availableCount(inv);
    if (avail === 0)      return 'bg-orange-50 border-orange-100';
    if (avail <= 2)       return 'bg-yellow-50 border-yellow-100';
    return 'bg-green-50 border-green-100';
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500">Room #{roomId}</p>
        </div>
      </div>

      {/* ── Bulk update panel ─────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Bulk Update</h2>
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start date"
              type="date"
              required
              value={updateForm.startDate}
              min={todayISO()}
              onChange={(e) => setUpdateForm((f) => ({ ...f, startDate: e.target.value }))}
              error={formErrors.startDate}
            />
            <FormInput
              label="End date"
              type="date"
              required
              value={updateForm.endDate}
              min={updateForm.startDate || todayISO()}
              onChange={(e) => setUpdateForm((f) => ({ ...f, endDate: e.target.value }))}
              error={formErrors.endDate}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <FormInput
              label="Surge factor (0.5 – 5.0)"
              type="number"
              step="0.1"
              min="0.5"
              max="5"
              value={updateForm.surgeFactor}
              onChange={(e) => setUpdateForm((f) => ({ ...f, surgeFactor: e.target.value }))}
              error={formErrors.surgeFactor}
              hint="1.0 = normal price, 1.5 = 50% surge"
            />

            {/* Close toggle */}
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-slate-700">Availability</p>
              <button
                type="button"
                onClick={() =>
                  setUpdateForm((f) => ({ ...f, closed: !f.closed }))
                }
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  updateForm.closed
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-green-200 bg-green-50 text-green-700'
                }`}
              >
                {updateForm.closed ? (
                  <><Lock className="h-4 w-4" /> Closed</>
                ) : (
                  <><Unlock className="h-4 w-4" /> Open</>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isUpdating} className="btn-primary w-full gap-2">
            {isUpdating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <><TrendingUp className="h-4 w-4" /> Apply to date range</>
            )}
          </button>
        </form>
      </div>

      {/* ── Calendar grid ────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Inventory Calendar
          </h2>
          <button onClick={fetchInventory} className="btn-ghost text-sm gap-1.5">
            <CalendarRange className="h-4 w-4" /> Refresh
          </button>
        </div>

        {isLoading && <LoadingSpinner size="md" label="Loading inventory…" />}
        {error && !isLoading && (
          <ErrorMessage message={error} onRetry={fetchInventory} />
        )}

        {!isLoading && !error && inventory.length === 0 && (
          <p className="text-center text-slate-500 py-8">
            No inventory records found for this room.
          </p>
        )}

        {!isLoading && !error && inventory.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {inventory.map((inv) => (
              <div
                key={inv.id}
                className={`rounded-xl border p-3 ${availabilityColor(inv)}`}
              >
                <p className="text-xs font-semibold text-slate-600">
                  {formatDate(inv.date)}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {inv.closed ? '—' : availableCount(inv)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {inv.closed ? 'Closed' : `of ${inv.totalCount} avail`}
                    </p>
                  </div>
                  {inv.surgeFactor !== 1 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      ×{inv.surgeFactor}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  ₹{inv.price?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
