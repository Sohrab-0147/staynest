import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { tokenUtils } from '@/utils/tokenUtils';

// ── Constants ─────────────────────────────────────────────────────

const BASE_URL = '/api'; // proxied to http://localhost:8080 via vite dev server

// ── Create base instance ──────────────────────────────────────────

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the HttpOnly refreshToken cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

// ── Request interceptor — attach access token ─────────────────────

axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — auto-refresh on 401 ───────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => {
    // Spring Boot wraps every response: { timeStamp, data, error }
    // Unwrap the inner `data` field so services always receive the raw DTO.
    // If there's no envelope (e.g. 204 No Content), return as-is.
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body && 'timeStamp' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error) => {
    // Unwrap error envelope: { timeStamp, data: null, error: {...} }
    // so that extractErrorMessage always sees a consistent shape.
    if (error.response?.data && typeof error.response.data === 'object') {
      const body = error.response.data as Record<string, unknown>;
      if ('timeStamp' in body && 'error' in body && body.error && typeof body.error === 'object') {
        // Replace the full envelope with just the inner error object
        error.response.data = body.error;
      }
    }

    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh for 401, but NOT for the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue subsequent requests while refresh is in-flight
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token is sent automatically via cookie (withCredentials: true)
        const response = await axiosInstance.post<{ accessToken: string }>(
          '/auth/refresh',
        );
        // After unwrapping, response.data IS { accessToken: string }
        const newToken = response.data.accessToken;
        tokenUtils.setAccessToken(newToken);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed → clear token and redirect to login
        tokenUtils.removeAccessToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── Helpers for GET-with-body (Spring Boot @RequestBody on GET) ───
// Spring Boot's HotelBrowseController uses GET + @RequestBody,
// which is non-standard. We send data via the `data` field and
// set the method explicitly.

export function getWithBody<T>(url: string, body: unknown): Promise<T> {
  return axiosInstance
    .request<T>({
      method: 'GET',
      url,
      data: body,
    })
    .then((r) => r.data);
}

export default axiosInstance;
