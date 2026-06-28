import axiosInstance from '@/api/axiosInstance';
import type {
  BookingRequest,
  BookingDto,
  BookingPaymentInitResponse,
  BookingStatusResponse,
} from '@/types';

const bookingService = {
  /**
   * POST /bookings/init
   * Step 1 of the booking flow. Creates a RESERVED booking.
   * Returns the BookingDto with the new bookingId.
   */
  async initBooking(data: BookingRequest): Promise<BookingDto> {
    const res = await axiosInstance.post<BookingDto>('/bookings/init', data);
    return res.data;
  },

  /**
   * POST /bookings/:bookingId/addGuests
   * Step 2 — attach guest IDs to the booking.
   * Body is a plain array of guest IDs (Long[]).
   */
  async addGuests(bookingId: number, guestIds: number[]): Promise<BookingDto> {
    const res = await axiosInstance.post<BookingDto>(
      `/bookings/${bookingId}/addGuests`,
      guestIds,
    );
    return res.data;
  },

  /**
   * POST /bookings/:bookingId/payments
   * Step 3 — initiates a Stripe Checkout session.
   * Returns the Stripe-hosted sessionUrl to redirect the user.
   */
  async initiatePayment(bookingId: number): Promise<BookingPaymentInitResponse> {
    const res = await axiosInstance.post<BookingPaymentInitResponse>(
      `/bookings/${bookingId}/payments`,
    );
    return res.data;
  },

  /**
   * POST /bookings/:bookingId/cancel
   * Cancels an in-progress booking. Returns 204.
   */
  async cancelBooking(bookingId: number): Promise<void> {
    await axiosInstance.post(`/bookings/${bookingId}/cancel`);
  },

  /**
   * GET /bookings/:bookingId/status
   * Polls the booking status (used after Stripe redirect).
   */
  async getBookingStatus(bookingId: number): Promise<BookingStatusResponse> {
    const res = await axiosInstance.get<BookingStatusResponse>(
      `/bookings/${bookingId}/status`,
    );
    return res.data;
  },

  /**
   * GET /users/myBookings
   * Returns all bookings for the authenticated user.
   */
  async getMyBookings(): Promise<BookingDto[]> {
    const res = await axiosInstance.get<BookingDto[]>('/users/myBookings');
    return res.data;
  },
};

export default bookingService;
