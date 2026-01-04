# Vending Machine Required Components

## Current Design Strengths
- Well-organized component structure
- Good material variety (plywood, glass, metal)
- Proper shelving system with dividers
- Working dispensing mechanism (motors, spirals, clamps)

## Electronics & Control System

### Already Have
- ✅ ESP32 with WiFi module

### To Purchase
- ✅ ESP32 LVGL 2.8" LCD touchscreen display
- LED lighting strips (internal product illumination)
- Motor driver module (L298N or relay board for dispensing motors)

## Structural Hardware Required

### Door & Security
- Door hinges for glass front (2-3 pieces)
- Security lock for front door
- Security lock for collection bin

## Payment System
- QR code payment integration only (eSewa/Khalti)
- Display QR codes on LCD touchscreen
- No physical payment hardware required

## Explicitly Not Required
- ❌ Temperature control/cooling system
- ❌ Door handle (maintenance access via unlocking)
- ❌ Ventilation system for cooling
- ❌ Coin/note acceptor
- ❌ Change dispenser
- ❌ Physical keypad (touchscreen handles input)

## Implementation Checklist

### Critical Components (Must Have)
1. **ESP32 LVGL 2.8" LCD Touchscreen** - User interface and QR code display
2. **Door Hinges** - Glass front opening mechanism
3. **Security Locks (x2)** - Front door and collection bin
4. **Motor Driver Module** - Control dispensing motors
5. **LED Strips** - Internal product illumination

### Optional Enhancements
- Product pusher mechanism (to move items forward)
- Cable management channels/conduits
- Branding panel area (top front)
- Leveling feet for stability when stationary
- Product label holders

## Total New Parts Summary
1. ESP32 LVGL 2.8" LCD touchscreen display
2. LED lighting strips
3. Motor driver module (L298N or similar)
4. Door hinges (2-3)
5. Security locks (2)
