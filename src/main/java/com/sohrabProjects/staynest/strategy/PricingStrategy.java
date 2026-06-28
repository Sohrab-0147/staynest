package com.sohrabProjects.staynest.strategy;

import com.sohrabProjects.staynest.entity.Inventory;

import java.math.BigDecimal;

public interface PricingStrategy {
    BigDecimal calculatePrice(Inventory inventory);
}
