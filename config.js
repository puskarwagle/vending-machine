// Configuration - all dimensions and parameters in one place
const CONFIG = {
    frame: {
        width: 24,
        height: 60,
        depth: 24,
        thickness: 0.33
    },
    grid: {
        rows: 5,
        cols: 3
    },
    slot: {
        width: 8,
        height: 10,
        depth: 18
    },
    collection: {
        height: 10,
        slantAngle: 0.3
    },
    shelves: {
        depth: 18  // Shallower than frame depth to create collection area
    },
    rails: {
        width: 1,
        height: 0.5,
        gap: 1,  // Distance below shelf
        inset: 2  // Distance from edge
    },
    dividers: {
        height: 5  // Half the slot height
    },
    glass: {
        thickness: 0.2,
        offset: 2  // Distance in front of shelves
    },
    motor: {
        radius: 1,
        length: 2.5
    },
    bracket: {
        width: 2,
        height: 2,
        thickness: 0.2
    },
    spiral: {
        radius: 3,
        length: 14,
        turns: 8,
        tubeRadius: 0.15
    }
};
