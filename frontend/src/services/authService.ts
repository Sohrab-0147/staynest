import axiosInstance from '@/api/axiosInstance';
import type { LoginRequest, LoginResponse, SignUpRequest, UserDto } from '@/types';

const authService = {
  /**
   * POST /auth/signup
   * Registers a new user. Returns the created UserDto.
   */
  async signup(data: SignUpRequest): Promise<UserDto> {
    const res = await axiosInstance.post<UserDto>('/auth/signup', data);
    return res.data;
  },

  /**
   * POST /auth/login
   * Returns accessToken in body; sets refreshToken as HttpOnly cookie.
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await axiosInstance.post<LoginResponse>('/auth/login', data);
    return res.data;
  },

  /**
   * POST /auth/refresh
   * Uses the HttpOnly refreshToken cookie (sent automatically via withCredentials).
   * Returns a new accessToken.
   */
  async refresh(): Promise<LoginResponse> {
    const res = await axiosInstance.post<LoginResponse>('/auth/refresh');
    return res.data;
  },
};

export default authService;
