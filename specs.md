# Vending Machine Prototype Build Specifications

## Project Overview
Building a working vending machine prototype to demonstrate reliable mechanical operation to potential investors. The machine will dispense chip bags using motorized metal spiral dispensers, with payment via QR code scanning (eSewa/Khalti/mobile banking).

## Machine Dimensions
- **Width**: 24 inches (2 feet)
- **Height**: 60 inches (5 feet)
- **Depth**: 24 inches (2 feet)
- **Material**: 1/3 inch (8mm) plywood throughout

## Slot Configuration
- **Total slots**: 18 (3 columns × 6 rows)
- **Slot dimensions**: 8" wide × 10" tall × 24" deep
- **Product**: Standard chip bags (approximately 8" tall × 5-6" wide)

## Required Materials

### Plywood Pieces to Cut

**Main Box (Outer Frame)**
1. Back panel: 24" × 60" × 1/3"
2. Left side panel: 24" × 60" × 1/3"
3. Right side panel: 24" × 60" × 1/3"
4. Top panel: 24" × 24" × 1/3"
5. Bottom panel: 24" × 24" × 1/3"
6. Front panel: 24" × 60" × 1/3" (with cutouts for viewing windows/doors)

**Internal Structure**
- Horizontal shelves: 5 pieces @ 24" × 24" × 1/3" (creates 6 rows)
  - Install at heights: 10", 20", 30", 40", 50" from bottom
- Vertical dividers: 12 pieces @ 10" × 24" × 1/3" (creates 3 columns per row)
  - 2 dividers per row positioned at: 8" and 16" from left edge

**Total Plywood Needed**: Approximately 3-4 sheets of 4'×8' plywood (1/3" thickness)

## Hardware & Fasteners
- Wood glue
- 1" wood screws (100+ count)
- Corner brackets for reinforcement (optional but recommended)
- Sandpaper (various grits)

## Electronics Components (Per Slot - 18 Total)
- 12V DC motor with metal spiral dispenser
- Motor mounting bracket
- Wiring harness

## Control System
- Microcontroller (Arduino/ESP32)
- Motor driver boards/relays (to control 18 motors)
- 12V power supply (adequate amperage for all motors)
- QR code payment integration system
- Wiring and connectors

## Assembly Process
1. Cut all plywood pieces to size
2. Assemble outer box frame (back, sides, top, bottom)
3. Install 5 horizontal shelves at specified heights
4. Install 12 vertical dividers (2 per row level)
5. Sand all surfaces and edges
6. Mount motors and spiral mechanisms in each slot
7. Wire all motors to controller system
8. Attach front panel with access doors
9. Install electronics and payment system
10. Test each slot individually
11. Load with products and run full system test

## What Makes This Design Work
- Simple box construction using readily available plywood
- Standardized slot sizes for consistent chip bag dispensing
- Modular internal grid allows independent slot operation
- Sturdy depth (24") accommodates full spiral mechanism
- Open front design allows easy loading and maintenance
