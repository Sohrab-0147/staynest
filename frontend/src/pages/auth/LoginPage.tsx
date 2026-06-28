import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import FormInput from '@/components/forms/FormInput';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { extractErrorMessage } from '@/hooks/useApi';

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState)?.from?.pathname ?? '/';

  // If already logged in, bounce away immediately
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const [form, setForm]           = useState({ email: '', password: '' });
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [apiError, setApiError]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── Validation ────────────────────────────────────────────────

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.email)                          next.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email  = 'Enter a valid email address.';
    if (!form.password)                        next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 text-white">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <Building2 className="h-7 w-7" />
          StayNest
        </Link>

        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Welcome back.<br />
            Your next stay awaits.
          </h1>
          <p className="mt-4 text-blue-200 text-lg max-w-sm">
            Sign in to manage your bookings, guests, and find your perfect hotel.
          </p>
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
              <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Create one free
                </Link>
              </p>
            </div>

            {/* API-level error */}
            {apiError && (
              <div className="mb-4">
                <ErrorMessage message={apiError} />
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <FormInput
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  setErrors((er) => ({ ...er, email: '' }));
                }}
                error={errors.email}
              />

              <div className="relative">
                <FormInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, password: e.target.value }));
                    setErrors((er) => ({ ...er, password: '' }));
                  }}
                  error={errors.password}
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

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary mt-2 w-full py-2.5"
                id="login-submit-btn"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
