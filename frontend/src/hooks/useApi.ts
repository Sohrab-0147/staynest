import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

// ── Types ─────────────────────────────────────────────────────────

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T, A extends unknown[]> extends UseApiState<T> {
  execute: (...args: A) => Promise<T | null>;
  reset: () => void;
}

// ── Helper — extract readable message from any error ──────────────

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const raw = err.response?.data;

    if (raw !== null && raw !== undefined) {
      // ── Plain string body ─────────────────────────────────────
      if (typeof raw === 'string' && raw.length > 0) return raw;

      if (typeof raw === 'object') {
        // ── Wrapped envelope: { timeStamp, data, error: { status, message, subErrors } }
        // The response interceptor already unwrapped 2xx. For error responses the
        // envelope still arrives raw. The `error` field holds the real error object.
        const inner = (raw as Record<string, unknown>).error;
        if (inner && typeof inner === 'object') {
          const ie = inner as Record<string, unknown>;
          if (typeof ie.message === 'string' && ie.message) return ie.message;
          // subErrors from validation
          if (Array.isArray(ie.subErrors) && ie.subErrors.length > 0) {
            return (ie.subErrors as Array<Record<string, unknown>>)
              .map((e) => (typeof e.message === 'string' ? e.message : JSON.stringify(e)))
              .join(' · ');
          }
        }

        // ── Direct error body: { status, message, subErrors } ──────
        const d = raw as Record<string, unknown>;
        if (typeof d.message === 'string' && d.message) return d.message;
        if (Array.isArray(d.subErrors) && d.subErrors.length > 0) {
          return (d.subErrors as Array<Record<string, unknown>>)
            .map((e) => (typeof e.message === 'string' ? e.message : JSON.stringify(e)))
            .join(' · ');
        }
        // `error` field that is a plain string (some Spring endpoints)
        if (typeof d.error === 'string' && d.error) return d.error;
      }
    }

    // ── HTTP status fallbacks ─────────────────────────────────────
    switch (err.response?.status) {
      case 400: return 'Bad request. Please check your inputs.';
      case 401: return 'Session expired. Please log in again.';
      case 403: return 'You do not have permission to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 409: return 'A conflict occurred. This resource may already exist.';
      case 422: return 'Validation failed. Please check your inputs.';
      case 500: return 'Server error. Please try again later.';
      default:  return err.message || 'An unexpected error occurred.';
    }
  }

  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}


// ── useApi — generic lazy fetcher ────────────────────────────────

/**
 * Wraps any async service function with loading / error / data state.
 *
 * Usage (lazy — call execute manually):
 *   const { data, isLoading, error, execute } = useApi(hotelService.searchHotels);
 *   await execute(searchParams);
 *
 * Usage (immediate — runs on mount):
 *   const { data, isLoading, error } = useApi(userService.getMyProfile, { immediate: true });
 */
export function useApi<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
  options?: {
    immediate?: boolean;         // run on mount with initialArgs
    initialArgs?: A;             // args to pass when immediate = true
    onSuccess?: (data: T) => void;
    onError?: (err: string) => void;
  },
): UseApiReturn<T, A> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: options?.immediate ?? false,
    error: null,
  });

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await fn(...args);
        setState({ data: result, isLoading: false, error: null });
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const message = extractErrorMessage(err);
        setState({ data: null, isLoading: false, error: message });
        options?.onError?.(message);
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn],
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  // Immediate execution on mount
  useEffect(() => {
    if (options?.immediate) {
      const args = (options.initialArgs ?? []) as A;
      execute(...args);
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, execute, reset };
}
