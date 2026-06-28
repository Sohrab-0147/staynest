import axiosInstance from '@/api/axiosInstance';
import type {
  HotelSearchRequest,
  HotelPriceResponseDto,
  HotelInfoDto,
  HotelInfoRequest,
  Page,
} from '@/types';

const hotelService = {
  /**
   * POST /hotels/search
   * Searches hotels by city, dates, roomsCount. Returns a paginated result.
   */
  async searchHotels(params: HotelSearchRequest): Promise<Page<HotelPriceResponseDto>> {
    const res = await axiosInstance.post<Page<HotelPriceResponseDto>>('/hotels/search', params);
    return res.data;
  },

  /**
   * POST /hotels/:hotelId/info
   * Returns hotel details + rooms with prices for the given date range.
   */
  async getHotelInfo(hotelId: number, params: HotelInfoRequest): Promise<HotelInfoDto> {
    const res = await axiosInstance.post<HotelInfoDto>(`/hotels/${hotelId}/info`, params);
    return res.data;
  },
};

export default hotelService;
