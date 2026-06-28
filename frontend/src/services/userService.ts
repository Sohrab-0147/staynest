import axiosInstance from '@/api/axiosInstance';
import type { UserDto, ProfileUpdateRequest } from '@/types';

const userService = {
  /**
   * GET /users/profile
   * Returns the currently authenticated user's profile.
   */
  async getMyProfile(): Promise<UserDto> {
    const res = await axiosInstance.get<UserDto>('/users/profile');
    return res.data;
  },

  /**
   * PATCH /users/profile
   * Updates name, dateOfBirth, gender. Returns 204 (no body).
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<void> {
    await axiosInstance.patch('/users/profile', data);
  },
};

export default userService;
