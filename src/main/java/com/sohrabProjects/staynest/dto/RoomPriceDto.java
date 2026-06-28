package com.sohrabProjects.staynest.dto;

import com.sohrabProjects.staynest.entity.Room;
import lombok.Data;

@Data
public class RoomPriceDto {
    private Room room;
    private Double price;

    public RoomPriceDto(Room room, Double price) {

        this.room = room;

        this.price = price;

    }


    public Room getRoom() { return room; }

    public Double getPrice() { return price; }
}
