import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import FormInput from '@/components/forms/FormInput';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { extractErrorMessage } from '@/hooks/useApi';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Already logged in — bounce to home
  if (isAuthenticated) {
    navigate('/', { replace: true });
  }

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [apiError, setApiError]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────

  function setField(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: '' }));
    };
  }

  // ── Validation ─────────────────────────────────────────────────

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim())
      next.name = 'Full name is required.';
    if (!form.email)
      next.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      next.email = 'Enter a valid email address.';
    if (!form.password)
      next.password = 'Password is required.';
    else if (form.password.length < 8)
      next.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword)
      next.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
      next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="card p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Account created!
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Welcome to StayNest,{' '}
              <span className="font-semibold text-slate-700">{form.name}</span>.
              You can now sign in to start booking.
            </p>
            <Link
              to="/login"
              className="btn-primary mt-6 inline-flex w-full justify-center py-2.5"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-500 p-12 text-white">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <Building2 className="h-7 w-7" />
          StayNest
        </Link>

        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Join thousands of<br />happy travellers.
          </h1>
          <p className="mt-4 text-blue-200 text-lg max-w-sm">
            Create your free account and unlock access to exclusive hotels, seamless booking, and easy guest management.
          </p>

          <ul className="mt-8 flex flex-col gap-3 text-sm text-blue-100">
            {[
              'Search hotels by city and dates',
              'Book rooms in a few clicks',
              'Manage your guests and bookings',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-300 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-blue-300 text-sm">
          © {new Date().getFullYear()} StayNest. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md animate-fadeIn">

          {/* Mobile logo */}
          <Link
            to="/"
            className="mb-8 flex items-center justify-center gap-2 text-xl font-bold text-slate-900 lg:hidden"
          >
            <Building2 className="h-6 w-6 text-blue-600" />
            StayNest
          </Link>

          <div className="card p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
              <p className="mt-1 text-sm text-slate-500">
                Already have one?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {apiError && (
              <div className="mb-4">
                <ErrorMessage message={apiError} />
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <FormInput
                label="Full name"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                required
                value={form.name}
                onChange={setField('name')}
                error={errors.name}
              />

              <FormInput
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={setField('email')}
                error={errors.email}
              />

              <div className="relative">
                <FormInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  required
                  value={form.password}
                  onChange={setField('password')}
                  error={errors.password}
                  hint={!errors.password ? 'At least 8 characters' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <FormInput
                  label="Confirm password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  required
                  value={form.confirmPassword}
                  onChange={setField('confirmPassword')}
                  error={errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary mt-2 w-full py-2.5"
                id="register-submit-btn"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create account
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                By creating an account you agree to our{' '}
                <span className="underline cursor-pointer hover:text-slate-600">
                  Terms of Service
                </span>
                .
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
