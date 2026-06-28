import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  /** Optional retry callback — renders a Retry button */
  onRetry?: () => void;
  /** 'inline' = small banner, 'page' = centered full-section */
  variant?: 'inline' | 'page';
}

export default function ErrorMessage({
  message,
  onRetry,
  variant = 'inline',
}: ErrorMessageProps) {
  if (variant === 'page') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-800">Something went wrong</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
        </div>
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 min-w-0">
        <span>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-3 font-semibold underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
