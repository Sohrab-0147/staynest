// ─────────────────────────────────────────────────────────────────
// StayNest — TypeScript types mirroring the Spring Boot backend DTOs
// ─────────────────────────────────────────────────────────────────

// ── Enums ────────────────────────────────────────────────────────

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type Role = 'GUEST' | 'MANAGER';

export type BookingStatus =
  | 'RESERVED'
  | 'GUESTS_ADDED'
  | 'PAYMENTS_PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

// ── Auth ─────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

// ── User ─────────────────────────────────────────────────────────

export interface UserDto {
  id: number;
  email: string;
  name: string;
  gender: Gender;
  dateOfBirth: string; // ISO date string (LocalDate → string)
}

export interface ProfileUpdateRequest {
  name: string;
  dateOfBirth: string;
  gender: Gender;
}

// ── Hotel Contact Info ────────────────────────────────────────────

export interface HotelContactInfo {
  address: string;
  phoneNumber: string;
  email: string;
  location: string;
}

// ── Hotel ────────────────────────────────────────────────────────

export interface HotelDto {
  id: number;
  name: string;
  city: string;
  photos: string[];
  amenities: string[];
  contactInfo: HotelContactInfo;
  active: boolean;
}

export interface HotelPriceResponseDto {
  id: number;
  name: string;
  city: string;
  photos: string[];
  amenities: string[];
  contactInfo: HotelContactInfo;
  price: number;
}

export interface HotelInfoDto {
  hotel: HotelDto;
  rooms: RoomPriceResponseDto[];
}

// ── Hotel Search ──────────────────────────────────────────────────

export interface HotelSearchRequest {
  city: string;
  startDate: string;  // ISO date string
  endDate: string;    // ISO date string
  roomsCount: number;
  page?: number;
  size?: number;
}

export interface HotelInfoRequest {
  startDate: string;
  endDate: string;
  roomsCount: number;
}

// ── Paginated response (Spring Data Page) ────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       // current page (0-indexed)
  size: number;
  last: boolean;
  first: boolean;
}

// ── Room ─────────────────────────────────────────────────────────

export interface RoomDto {
  id: number;
  type: string;
  basePrice: number;
  photos: string[];
  amenities: string[];
  totalCount: number;
  capacity: number;
}

export interface RoomPriceResponseDto {
  id: number;
  type: string;
  photos: string[];
  amenities: string[];
  price: number;
}

// ── Guest ────────────────────────────────────────────────────────

export interface GuestDto {
  id?: number;
  name: string;
  gender: Gender;
  dateOfBirth: string; // ISO date string
}

// ── Booking ──────────────────────────────────────────────────────

export interface BookingRequest {
  hotelId: number;
  roomId: number;
  checkInDate: string;  // ISO date string
  checkOutDate: string; // ISO date string
  roomsCount: number;
}

export interface BookingDto {
  id: number;
  roomsCount: number;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  updatedAt: string;
  bookingStatus: BookingStatus;
  guests: GuestDto[];
  amount: number;
}

export interface BookingStatusResponse {
  bookingStatus: BookingStatus;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface BookingPaymentInitResponse {
  sessionUrl: string;
}

// ── Inventory ────────────────────────────────────────────────────

export interface InventoryDto {
  id: number;
  date: string;         // ISO date string
  bookedCount: number;
  reservedCount: number;
  totalCount: number;
  surgeFactor: number;
  price: number;
  closed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateInventoryRequest {
  startDate: string;    // ISO date string
  endDate: string;      // ISO date string
  surgeFactor: number;
  closed: boolean;
}

// ── Error response (Spring Boot default) ─────────────────────────

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// ── Auth context ──────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  gender: Gender;
  dateOfBirth: string;
  roles: Role[];
}

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isManager: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: SignUpRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
