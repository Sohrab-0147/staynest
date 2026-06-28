import { useState, useEffect, type FormEvent } from 'react';
import { User, Mail, Save, CheckCircle2 } from 'lucide-react';
import userService from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { extractErrorMessage } from '@/hooks/useApi';
import type { Gender } from '@/types';
import toast from 'react-hot-toast';

const GENDER_OPTIONS = [
  { value: 'MALE',   label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER',  label: 'Other' },
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    name:        user?.name        ?? '',
    dateOfBirth: user?.dateOfBirth ?? '',
    gender:      (user?.gender     ?? 'OTHER') as Gender,
  });
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(!user);
  const [isSaving, setIsSaving]   = useState(false);
  const [apiError, setApiError]   = useState('');
  const [saved, setSaved]         = useState(false);

  // Fetch profile if not already in context
  useEffect(() => {
    if (user) {
      setForm({
        name:        user.name        ?? '',
        dateOfBirth: user.dateOfBirth ?? '',
        gender:      user.gender      ?? 'OTHER',
      });
      setIsLoading(false);
      return;
    }
    const fetch = async () => {
      setIsLoading(true);
      try {
        const profile = await userService.getMyProfile();
        setForm({
          name:        profile.name        ?? '',
          dateOfBirth: profile.dateOfBirth ?? '',
          gender:      profile.gender      ?? 'OTHER',
        });
      } catch (err) {
        setApiError(extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [user]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.dateOfBirth) next.dateOfBirth = 'Date of birth is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    setSaved(false);
    if (!validate()) return;

    setIsSaving(true);
    try {
      await userService.updateProfile({
        name:        form.name.trim(),
        dateOfBirth: form.dateOfBirth,
        gender:      form.gender,
      });
      await refreshUser();
      setSaved(true);
      toast.success('Profile updated!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" label="Loading profile…" />
      </div>
    );
  }

  return (
    <div className="py-10 px-6">
      <div className="page-container max-w-xl mx-auto flex flex-col gap-6">

        {/* Avatar section */}
        <div className="card p-6 flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white shadow-lg">
            {form.name?.charAt(0)?.toUpperCase() || <User className="h-8 w-8" />}
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900">{form.name || '—'}</p>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </p>
          </div>
        </div>

        {/* Edit form */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Edit Profile</h2>

          {apiError && (
            <div className="mb-4">
              <ErrorMessage message={apiError} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormInput
              label="Full name"
              type="text"
              required
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors((er) => ({ ...er, name: '' }));
              }}
              error={errors.name}
            />

            <FormInput
              label="Date of birth"
              type="date"
              required
              value={form.dateOfBirth}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setForm((f) => ({ ...f, dateOfBirth: e.target.value }));
                setErrors((er) => ({ ...er, dateOfBirth: '' }));
              }}
              error={errors.dateOfBirth}
            />

            <FormSelect
              label="Gender"
              options={GENDER_OPTIONS}
              value={form.gender}
              onChange={(e) =>
                setForm((f) => ({ ...f, gender: e.target.value as Gender }))
              }
            />

            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary mt-2 w-full gap-2"
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
