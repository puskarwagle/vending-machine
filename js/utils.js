import { CONFIG } from './config.js';

// Positioning helper functions
export function getShelfY(rowIndex) {
    return -CONFIG.frame.height/2 + (rowIndex * CONFIG.slot.height);
}

export function getBackZ() {
    // Center Z of the shelf, adjusted for wiring gap at the back
    // Original flush position + gap
    return -(CONFIG.frame.depth - CONFIG.shelves.depth) / 2 + CONFIG.wiring.gap;
}

export function getSlotCenter(row, col) {
    const x = -CONFIG.frame.width/2 + (col * CONFIG.slot.width) + (CONFIG.slot.width / 2);
    const y = -CONFIG.frame.height/2 + (row * CONFIG.slot.height) + (CONFIG.slot.height / 2);
    const z = getBackZ() - CONFIG.shelves.depth / 2;
    return { x, y, z };
}

export function getSlotPosition(row, col) {
    return getSlotCenter(row, col);
}
