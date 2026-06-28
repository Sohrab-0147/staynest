package com.sohrabProjects.staynest.repository;

import com.sohrabProjects.staynest.entity.Hotel;
import com.sohrabProjects.staynest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByOwner(User user);
}

