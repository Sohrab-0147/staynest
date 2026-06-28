import axiosInstance from '@/api/axiosInstance';
import type { GuestDto } from '@/types';

const guestService = {
  /**
   * GET /users/guests
   * Returns all guests belonging to the authenticated user.
   */
  async getAllGuests(): Promise<GuestDto[]> {
    const res = await axiosInstance.get<GuestDto[]>('/users/guests');
    return res.data;
  },

  /**
   * POST /users/guests
   * Adds a new guest to the user's guest list.
   */
  async addGuest(data: Omit<GuestDto, 'id'>): Promise<GuestDto> {
    const res = await axiosInstance.post<GuestDto>('/users/guests', data);
    return res.data;
  },

  /**
   * PUT /users/guests/:guestId
   * Updates an existing guest. Returns 204 (no body).
   */
  async updateGuest(guestId: number, data: Omit<GuestDto, 'id'>): Promise<void> {
    await axiosInstance.put(`/users/guests/${guestId}`, data);
  },

  /**
   * DELETE /users/guests/:guestId
   * Removes a guest. Returns 204 (no body).
   */
  async deleteGuest(guestId: number): Promise<void> {
    await axiosInstance.delete(`/users/guests/${guestId}`);
  },
};

export default guestService;
