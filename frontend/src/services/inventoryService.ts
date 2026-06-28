import axiosInstance from '@/api/axiosInstance';
import type { InventoryDto, UpdateInventoryRequest } from '@/types';

const inventoryService = {
  /**
   * GET /admin/inventory/rooms/:roomId
   * Returns all inventory records for a given room.
   *
   * Note: the backend path variable is `roomsId` in the @GetMapping
   * but the actual @PathVariable is `roomId` — the URL segment used
   * is `/rooms/{roomsId}` so we match that exactly.
   */
  async getInventoryByRoom(roomId: number): Promise<InventoryDto[]> {
    const res = await axiosInstance.get<InventoryDto[]>(
      `/admin/inventory/rooms/${roomId}`,
    );
    return res.data;
  },

  /**
   * PATCH /admin/inventory/rooms/:roomId
   * Bulk-updates inventory for a date range (surge factor, closed flag).
   * Returns 204.
   */
  async updateInventory(
    roomId: number,
    data: UpdateInventoryRequest,
  ): Promise<void> {
    await axiosInstance.patch(`/admin/inventory/rooms/${roomId}`, data);
  },
};

export default inventoryService;
