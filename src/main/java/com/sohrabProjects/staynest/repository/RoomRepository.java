package com.sohrabProjects.staynest.repository;

import com.sohrabProjects.staynest.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
}