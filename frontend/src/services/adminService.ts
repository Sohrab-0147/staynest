import axiosInstance from '@/api/axiosInstance';
import type { HotelDto, RoomDto } from '@/types';

const adminService = {
  // ── Hotel Management (/admin/hotels) ────────────────────────────

  /**
   * POST /admin/hotels
   * Creates a new hotel. Returns the created HotelDto.
   */
  async createHotel(data: Omit<HotelDto, 'id'>): Promise<HotelDto> {
    const res = await axiosInstance.post<HotelDto>('/admin/hotels', data);
    return res.data;
  },

  /**
   * GET /admin/hotels/:hotelId
   * Fetches a single hotel by ID.
   */
  async getHotelById(hotelId: number): Promise<HotelDto> {
    const res = await axiosInstance.get<HotelDto>(`/admin/hotels/${hotelId}`);
    return res.data;
  },

  /**
   * PUT /admin/hotels/:hotelId
   * Fully updates a hotel. Returns the updated HotelDto.
   */
  async updateHotel(hotelId: number, data: Omit<HotelDto, 'id'>): Promise<HotelDto> {
    const res = await axiosInstance.put<HotelDto>(`/admin/hotels/${hotelId}`, data);
    return res.data;
  },

  /**
   * DELETE /admin/hotels/:hotelId
   * Deletes a hotel. Returns 204.
   */
  async deleteHotel(hotelId: number): Promise<void> {
    await axiosInstance.delete(`/admin/hotels/${hotelId}`);
  },

  /**
   * PATCH /admin/hotels/:hotelId
   * Activates a hotel (sets active = true). Returns 204.
   */
  async activateHotel(hotelId: number): Promise<void> {
    await axiosInstance.patch(`/admin/hotels/${hotelId}`);
  },

  // ── Room Management (/admin/hotels/:hotelId/rooms) ──────────────

  /**
   * POST /admin/hotels/:hotelId/rooms
   * Creates a new room under a hotel. Returns the created RoomDto.
   */
  async createRoom(hotelId: number, data: Omit<RoomDto, 'id'>): Promise<RoomDto> {
    const res = await axiosInstance.post<RoomDto>(
      `/admin/hotels/${hotelId}/rooms`,
      data,
    );
    return res.data;
  },

  /**
   * GET /admin/hotels/:hotelId/rooms
   * Lists all rooms for a hotel.
   */
  async getRoomsByHotel(hotelId: number): Promise<RoomDto[]> {
    const res = await axiosInstance.get<RoomDto[]>(`/admin/hotels/${hotelId}/rooms`);
    return res.data;
  },

  /**
   * GET /admin/hotels/:hotelId/rooms/:roomId
   * Fetches a single room by ID.
   */
  async getRoomById(hotelId: number, roomId: number): Promise<RoomDto> {
    const res = await axiosInstance.get<RoomDto>(
      `/admin/hotels/${hotelId}/rooms/${roomId}`,
    );
    return res.data;
  },

  /**
   * DELETE /admin/hotels/:hotelId/rooms/:roomId
   * Deletes a room. Returns 204.
   */
  async deleteRoom(hotelId: number, roomId: number): Promise<void> {
    await axiosInstance.delete(`/admin/hotels/${hotelId}/rooms/${roomId}`);
  },
};

export default adminService;
