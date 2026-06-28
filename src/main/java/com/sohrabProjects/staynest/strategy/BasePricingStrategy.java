package com.sohrabProjects.staynest.strategy;

import com.sohrabProjects.staynest.entity.Inventory;

import java.math.BigDecimal;

public class BasePricingStrategy implements PricingStrategy  {
    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        return inventory.getRoom().getBasePrice();
    }
}
