package com.sohrabProjects.staynest.repository;

import com.sohrabProjects.staynest.entity.Booking;
import com.sohrabProjects.staynest.entity.Hotel;
import com.sohrabProjects.staynest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByPaymentSessionId(String sessionId);
    List<Booking> findByHotel(Hotel hotel);
    List<Booking> findByHotelAndCreatedAtBetween(

            Hotel hotel,

            LocalDateTime start,

            LocalDateTime end

    );
    List<Booking> findByUser(User user);
}
