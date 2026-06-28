package com.sohrabProjects.staynest.service;

import com.sohrabProjects.staynest.entity.Booking;

public interface CheckoutService {
    String getCheckoutSession(Booking booking, String successUrl, String failureUrl);
}
