package com.sohrabProjects.staynest.service;


import com.sohrabProjects.staynest.dto.HotelPriceResponseDto;
import com.sohrabProjects.staynest.dto.HotelSearchRequest;
import com.sohrabProjects.staynest.dto.InventoryDto;
import com.sohrabProjects.staynest.dto.UpdateInventoryRequestDto;
import com.sohrabProjects.staynest.entity.Room;
import org.springframework.data.domain.Page;

import java.util.List;

public interface InventoryService {


    void initializeRoomForAYear(Room room);

    void deleteAllInventories(Room room);

    Page<HotelPriceResponseDto> searchHotels(HotelSearchRequest hotelSearchRequest);

    List<InventoryDto> getAllInventoryByRoom(Long roomId);

    void updateInventory(Long roomId, UpdateInventoryRequestDto updateInventoryRequestDto);
}
