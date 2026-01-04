import * as THREE from 'three';
import { CONFIG } from './config.js';
import { getShelfY, getBackZ, getSlotCenter } from './utils.js';

// Component factory functions
export function createBackPanel(materials) {
    const group = new THREE.Group();
    const { width, height, depth, thickness } = CONFIG.frame;

    // Back panel
    const back = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, thickness),
        materials.plywoodSide
    );
    back.position.z = -depth/2;
    group.add(back);

    return group;
}

export function createSides(materials) {
    const group = new THREE.Group();
    const { width, height, depth, thickness } = CONFIG.frame;

    // Side panels
    const leftSide = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, height, depth),
        materials.plywoodPanel
    );
    leftSide.position.x = -width/2;
    group.add(leftSide);

    const rightSide = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, height, depth),
        materials.plywoodPanel
    );
    rightSide.position.x = width/2;
    group.add(rightSide);

    return group;
}

export function createTopBottom(materials) {
    const group = new THREE.Group();
    const { width, height, depth, thickness } = CONFIG.frame;

    // Top and bottom
    const top = new THREE.Mesh(
        new THREE.BoxGeometry(width, thickness, depth),
        materials.plywood4
    );
    top.position.y = height/2;
    group.add(top);

    const bottom = new THREE.Mesh(
        new THREE.BoxGeometry(width, thickness, depth),
        materials.plywood4
    );
    bottom.position.y = -height/2;
    group.add(bottom);

    // Wireframe edges
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, depth));
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    group.add(line);

    return group;
}

export function createShelf(rowIndex, materials) {
    const group = new THREE.Group();
    const y = getShelfY(rowIndex);
    const zBack = getBackZ(); // This is the center Z of the shelf

    // Horizontal part
    const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.frame.thickness, CONFIG.shelves.depth),
        materials.plywood
    );
    // Shelf center is at zBack
    shelf.position.set(0, y, zBack);
    group.add(shelf);

    // Vertical Backplate (The "Piece of Plywood" at the end)
    // Positioned at the back edge of the shelf
    const backplateZ = zBack - (CONFIG.shelves.depth / 2) + (CONFIG.shelves.backplateThickness / 2);
    const backplateY = y + (CONFIG.shelves.backplateHeight / 2) + (CONFIG.frame.thickness / 2);
    
    const backplate = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.shelves.backplateHeight, CONFIG.shelves.backplateThickness),
        materials.plywoodSide // Use side texture for contrast
    );
    backplate.position.set(0, backplateY, backplateZ);
    group.add(backplate);

    return group;
}


export function createRails(rowIndex, materials) {
    const group = new THREE.Group();
    const y = getShelfY(rowIndex) - CONFIG.rails.gap;
    const z = getBackZ();

    // Left rail
    const leftRail = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.rails.width, CONFIG.rails.height, CONFIG.shelves.depth),
        materials.rail
    );
    leftRail.position.set(-CONFIG.frame.width/2 + CONFIG.rails.inset, y, z);
    group.add(leftRail);

    // Right rail
    const rightRail = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.rails.width, CONFIG.rails.height, CONFIG.shelves.depth),
        materials.rail
    );
    rightRail.position.set(CONFIG.frame.width/2 - CONFIG.rails.inset, y, z);
    group.add(rightRail);

    return group;
}

export function createDividers(rowIndex, materials) {
    const group = new THREE.Group();
    const y = getShelfY(rowIndex) + CONFIG.dividers.height/2;

    // Divider should touch backplate but not overlap
    const dividerDepth = CONFIG.shelves.depth - CONFIG.shelves.backplateThickness;
    const z = getBackZ() + CONFIG.shelves.backplateThickness / 2;

    // Create dividers based on grid columns
    for (let col = 1; col < CONFIG.grid.cols; col++) {
        const divider = new THREE.Mesh(
            new THREE.BoxGeometry(CONFIG.frame.thickness, CONFIG.dividers.height, dividerDepth),
            materials.plywood
        );
        divider.position.set(-CONFIG.frame.width/2 + (col * CONFIG.slot.width), y, z);
        group.add(divider);
    }

    return group;
}

export function createCollectionBin(materials) {
    const binDepth = CONFIG.frame.depth - 6; // Total bin area depth: 18
    const slantedDepth = binDepth * 0.8; // 80% for slanted bin: 14.4

    const binFloor = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.frame.thickness, slantedDepth),
        materials.plywood
    );
    // Push back by 20% of the total depth
    const zOffset = (binDepth * 0.2) / 2; // Half of the 20% we removed
    binFloor.position.set(0, -CONFIG.frame.height/2 + 3, 3 - zOffset);
    binFloor.rotation.x = CONFIG.collection.slantAngle;
    return binFloor;
}

export function createBinFlap(materials) {
    // Calculate glass front bottom position
    const glassHeight = CONFIG.grid.rows * CONFIG.slot.height;
    const glassCenterY = CONFIG.slot.height/2;
    const glassBottomY = glassCenterY - (glassHeight / 2);

    // Border thickness
    const borderThickness = 1.5;
    const flapGap = 1.5; // Gap at bottom for flap clearance

    // Flap goes from slightly above bottom of frame to bottom of glass border
    const bottomY = -CONFIG.frame.height/2 + CONFIG.frame.thickness/2 + flapGap;
    const topY = glassBottomY - (borderThickness / 2); // Touch bottom of glass border
    const flapHeight = topY - bottomY;

    const flap = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width - 4, flapHeight, CONFIG.glass.thickness),
        materials.glass
    );
    // Position at the very front edge of the frame
    const zPos = CONFIG.frame.depth / 2;
    flap.position.set(0, bottomY + (flapHeight / 2), zPos);
    return flap;
}

export function createBinFlapBorder(materials) {
    const group = new THREE.Group();

    // Calculate glass front bottom position
    const glassHeight = CONFIG.grid.rows * CONFIG.slot.height;
    const glassCenterY = CONFIG.slot.height/2;
    const glassBottomY = glassCenterY - (glassHeight / 2);

    const borderThickness = 1.5;

    // Flap border matches flap height
    const bottomY = -CONFIG.frame.height/2 + CONFIG.frame.thickness/2;
    const topY = glassBottomY - (borderThickness / 2);
    const flapHeight = topY - bottomY;

    // Position at the very front edge of the frame
    const zPos = CONFIG.frame.depth / 2;
    const yPos = bottomY + (flapHeight / 2);

    // Top border (horizontal)
    const topBorder = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, borderThickness, borderThickness),
        materials.aluminumBracket
    );
    topBorder.position.set(0, yPos + (flapHeight / 2), zPos);
    group.add(topBorder);

    // Bottom border (horizontal)
    const bottomBorder = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, borderThickness, borderThickness),
        materials.aluminumBracket
    );
    bottomBorder.position.set(0, yPos - (flapHeight / 2), zPos);
    group.add(bottomBorder);

    // Left border (vertical) - inset to not overflow frame
    const leftBorder = new THREE.Mesh(
        new THREE.BoxGeometry(borderThickness, flapHeight, borderThickness),
        materials.aluminumBracket
    );
    leftBorder.position.set(-CONFIG.frame.width / 2 + borderThickness / 2, yPos, zPos);
    group.add(leftBorder);

    // Right border (vertical) - inset to not overflow frame
    const rightBorder = new THREE.Mesh(
        new THREE.BoxGeometry(borderThickness, flapHeight, borderThickness),
        materials.aluminumBracket
    );
    rightBorder.position.set(CONFIG.frame.width / 2 - borderThickness / 2, yPos, zPos);
    group.add(rightBorder);

    return group;
}

export function createGlassFront(materials) {
    const group = new THREE.Group();
    const glassHeight = CONFIG.grid.rows * CONFIG.slot.height;

    const glass = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width - 2, glassHeight, CONFIG.glass.thickness),
        materials.glass
    );
    // Position at the very front edge of the frame (it's a door)
    const zPos = CONFIG.frame.depth / 2;
    glass.position.set(0, CONFIG.slot.height/2, zPos);
    group.add(glass);

    return group;
}

export function createGlassFrontBorder(materials) {
    const group = new THREE.Group();
    const glassHeight = CONFIG.grid.rows * CONFIG.slot.height;
    const borderThickness = 1.5;
    const zPos = CONFIG.frame.depth / 2;
    const yPos = CONFIG.slot.height/2;

    // Top border (horizontal)
    const topBorder = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, borderThickness, borderThickness),
        materials.aluminumBracket
    );
    topBorder.position.set(0, yPos + (glassHeight / 2), zPos);
    group.add(topBorder);

    // Bottom border (horizontal)
    const bottomBorder = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, borderThickness, borderThickness),
        materials.aluminumBracket
    );
    bottomBorder.position.set(0, yPos - (glassHeight / 2), zPos);
    group.add(bottomBorder);

    // Left border (vertical) - inset to not overflow frame
    const leftBorder = new THREE.Mesh(
        new THREE.BoxGeometry(borderThickness, glassHeight, borderThickness),
        materials.aluminumBracket
    );
    leftBorder.position.set(-CONFIG.frame.width / 2 + borderThickness / 2, yPos, zPos);
    group.add(leftBorder);

    // Right border (vertical) - inset to not overflow frame
    const rightBorder = new THREE.Mesh(
        new THREE.BoxGeometry(borderThickness, glassHeight, borderThickness),
        materials.aluminumBracket
    );
    rightBorder.position.set(CONFIG.frame.width / 2 - borderThickness / 2, yPos, zPos);
    group.add(rightBorder);

    return group;
}

export function createMotorAssembly(row, col, materials) {
    const assembly = { motor: null, bracket: null, spiral: null };
    
    // Calculate positions relative to shelf
    const shelfY = getShelfY(row);
    const shelfFloorY = shelfY + (CONFIG.frame.thickness / 2);
    
    // Motor center must be one radius above the shelf floor for spiral to "lay" on it
    const motorY = shelfFloorY + CONFIG.spiral.radius;
    
    const slotPos = getSlotCenter(row, col);
    const motorX = slotPos.x;
    
    const backEdgeZ = getBackZ() - (CONFIG.shelves.depth / 2);
    
    // Z-Positioning Stack: Backplate -> Bracket -> Motor -> Spiral
    const bracketZ = backEdgeZ + CONFIG.shelves.backplateThickness + (CONFIG.bracket.thickness / 2);
    const motorZ = backEdgeZ + CONFIG.shelves.backplateThickness + CONFIG.bracket.thickness + (CONFIG.motor.length / 2);
    const spiralStartZ = backEdgeZ + CONFIG.shelves.backplateThickness + CONFIG.bracket.thickness + CONFIG.motor.length;

    // Mounting bracket (Clamp) - attached to front of backplate
    const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.bracket.width, CONFIG.bracket.height, CONFIG.bracket.thickness),
        materials.bracket
    );
    bracket.position.set(motorX, motorY, bracketZ);
    assembly.bracket = bracket;

    // Motor (cylinder) - held by clamp
    const motor = new THREE.Mesh(
        new THREE.CylinderGeometry(CONFIG.motor.radius, CONFIG.motor.radius, CONFIG.motor.length, 16),
        materials.motor
    );
    motor.rotation.z = Math.PI / 2; // Rotate to horizontal
    motor.position.set(motorX, motorY, motorZ);
    assembly.motor = motor;

    // Spiral coil (helix) - extending from motor
    const points = [];
    for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const angle = t * CONFIG.spiral.turns * Math.PI * 2;
        const x = Math.cos(angle) * CONFIG.spiral.radius;
        const y = Math.sin(angle) * CONFIG.spiral.radius;
        const z = t * CONFIG.spiral.length;
        points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const spiral = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 200, CONFIG.spiral.tubeRadius, 8, false),
        materials.spiral
    );
    spiral.position.set(motorX, motorY, spiralStartZ);
    assembly.spiral = spiral;

    return assembly;
}

export function createPowerBox(materials) {
    // Load textures for vending board
    const textureLoader = new THREE.TextureLoader();
    const frontTexture = textureLoader.load('images/vending-board-front.jpg');
    const backTexture = textureLoader.load('images/vending-board-back.jpg');

    // Create materials for each face of the box
    // BoxGeometry face order: right, left, top, bottom, front, back
    const boxMaterials = [
        new THREE.MeshPhongMaterial({ map: frontTexture }), // right
        new THREE.MeshPhongMaterial({ map: backTexture }), // left
        new THREE.MeshPhongMaterial({ map: frontTexture }), // top
        new THREE.MeshPhongMaterial({ map: backTexture }), // bottom
        new THREE.MeshPhongMaterial({ map: frontTexture }), // front
        new THREE.MeshPhongMaterial({ map: backTexture })   // back
    ];

    const powerBox = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.powerbox.width, CONFIG.powerbox.height, CONFIG.powerbox.depth),
        boxMaterials
    );

    // Position at the bottom, in the empty space behind the collection bin
    // Bottom of frame is -CONFIG.frame.height/2
    // Sits on floor: y = -height/2 + boxHeight/2
    // Back gap center: z = -9 (calculated from bin position)

    const y = -CONFIG.frame.height/2 + CONFIG.powerbox.height/2 + CONFIG.frame.thickness;
    const z = -CONFIG.frame.depth/2 + CONFIG.powerbox.depth/2 + 1; // Slight gap from back wall

    powerBox.position.set(0, y, z);
    return powerBox;
}

export function createWheels(materials) {
    const group = new THREE.Group();
    const wheelRadius = 1;
    const wheelThickness = 0.75;

    // Bottom panel Y position
    const bottomY = -CONFIG.frame.height/2;
    const wheelY = bottomY - CONFIG.frame.thickness/2 - wheelRadius;

    // Corner positions with slight inset from edges
    const inset = 2;
    const positions = [
        { x: -CONFIG.frame.width/2 + inset, z: -CONFIG.frame.depth/2 + inset },  // Back-left
        { x: CONFIG.frame.width/2 - inset, z: -CONFIG.frame.depth/2 + inset },   // Back-right
        { x: -CONFIG.frame.width/2 + inset, z: CONFIG.frame.depth/2 - inset },   // Front-left
        { x: CONFIG.frame.width/2 - inset, z: CONFIG.frame.depth/2 - inset }     // Front-right
    ];

    // Create 4 wheels at corners
    positions.forEach(pos => {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 16),
            materials.motor // Using dark metallic material
        );
        wheel.rotation.z = Math.PI / 2; // Rotate to align along width
        wheel.position.set(pos.x, wheelY, pos.z);
        group.add(wheel);
    });

    return group;
}

export function createWiring(materials) {
    const group = new THREE.Group();

    // Create materials for the 3 wires: Power+, Power-, Control
    const wireRadius = 0.25; // Thicker wires for better visibility
    const wireColors = [
        0xff0000, // Red - Power+
        0xff8800, // Orange - Power-
        0x00ff00  // Green - Control
    ];
    const wireMaterials = wireColors.map(color => new THREE.MeshBasicMaterial({ color }));

    // Helper function to create a tube between two points
    function createWireTube(start, end, material) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const geometry = new THREE.CylinderGeometry(wireRadius, wireRadius, length, 8);
        const wire = new THREE.Mesh(geometry, material);

        // Position at midpoint
        wire.position.copy(start).add(direction.multiplyScalar(0.5));

        // Rotate to align with direction
        wire.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.normalize()
        );

        return wire;
    }

    // Helper function to create curved wire tube
    function createCurvedWireTube(curve, material) {
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, wireRadius, 8, false);
        return new THREE.Mesh(tubeGeometry, material);
    }

    // Power Box Position (Target)
    const powerBoxY = -CONFIG.frame.height/2 + CONFIG.powerbox.height/2 + CONFIG.frame.thickness;
    const powerBoxZ = -CONFIG.frame.depth/2 + CONFIG.powerbox.depth/2 + 1;

    // Main Trunk (Vertical run up the back wall) - 3 wires side by side
    const trunkX = 0; // Center
    const trunkZ = -CONFIG.frame.depth/2 + 1; // Against back wall
    const wireSpacing = 0.6; // Increased spacing for better visibility

    const trunkStart = new THREE.Vector3(trunkX, powerBoxY, trunkZ);
    const trunkEnd = new THREE.Vector3(trunkX, CONFIG.frame.height/2 - 5, trunkZ);

    // Create 3 parallel trunk wires
    for (let i = 0; i < 3; i++) {
        const offset = (i - 1) * wireSpacing; // -wireSpacing, 0, +wireSpacing
        const start = trunkStart.clone().add(new THREE.Vector3(offset, 0, 0));
        const end = trunkEnd.clone().add(new THREE.Vector3(offset, 0, 0));
        group.add(createWireTube(start, end, wireMaterials[i]));
    }

    // Wiring for each row
    for (let row = 1; row <= CONFIG.grid.rows; row++) {
        const shelfY = getShelfY(row);
        const shelfFloorY = shelfY + (CONFIG.frame.thickness / 2);
        const motorY = shelfFloorY + CONFIG.spiral.radius;
        const shelfBackZ = getBackZ() - (CONFIG.shelves.depth / 2); // Back edge of sliding shelf

        // Service Loop (Flexible curve from Wall to Shelf) - 3 wires bundled
        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * wireSpacing;
            const wallPoint = new THREE.Vector3(trunkX + offset, motorY, trunkZ);
            const shelfPoint = new THREE.Vector3(0 + offset, motorY, shelfBackZ);

            // Create a more visible curve that bows out to the side
            const sideOffset = (i - 1) * 3; // Each wire bows out differently
            const curve = new THREE.QuadraticBezierCurve3(
                wallPoint,
                new THREE.Vector3(0 + offset + sideOffset, motorY - 6, (trunkZ + shelfBackZ) / 2), // Bow out sideways + dip down
                shelfPoint
            );
            group.add(createCurvedWireTube(curve, wireMaterials[i]));
        }

        // Distribution along the shelf backplate to motors - 3 wires to each motor
        for (let col = 0; col < CONFIG.grid.cols; col++) {
            const slotPos = getSlotCenter(row, col);
            const motorX = slotPos.x;

            for (let i = 0; i < 3; i++) {
                const offset = (i - 1) * wireSpacing;
                const zOffset = (i - 1) * wireRadius * 2.5; // Offset in Z to prevent overlap
                const start = new THREE.Vector3(0 + offset, motorY, shelfBackZ + zOffset);
                const end = new THREE.Vector3(motorX + offset, motorY, shelfBackZ + zOffset);
                group.add(createWireTube(start, end, wireMaterials[i]));
            }
        }
    }

    return group;
}

export function createTouchscreen(materials) {
    const group = new THREE.Group();

    // Housing (black plastic case)
    const housing = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.touchscreen.width, CONFIG.touchscreen.height, CONFIG.touchscreen.depth),
        materials.plastic
    );
    group.add(housing);

    // Screen (glossy dark surface, slightly inset)
    const screen = new THREE.Mesh(
        new THREE.BoxGeometry(
            CONFIG.touchscreen.width - 0.3,
            CONFIG.touchscreen.height - 0.3,
            CONFIG.touchscreen.screenInset
        ),
        materials.screen
    );
    screen.position.z = CONFIG.touchscreen.depth / 2;
    group.add(screen);

    // Position on right side panel, near top
    const x = CONFIG.frame.width / 2 + CONFIG.frame.thickness / 2;
    const y = CONFIG.frame.height / 2 - CONFIG.touchscreen.height - 3;
    const z = 0;

    group.position.set(x, y, z);
    group.rotation.y = Math.PI / 2; // Face outward from right side

    return group;
}

export function createDoorHinges(materials) {
    const group = new THREE.Group();
    const numHinges = 3;

    // Glass door dimensions
    const glassHeight = CONFIG.grid.rows * CONFIG.slot.height;
    const glassCenterY = CONFIG.slot.height / 2;
    const glassTopY = glassCenterY + glassHeight / 2;
    const glassBottomY = glassCenterY - glassHeight / 2;

    // Hinge positions along left edge
    const hingeYPositions = [
        glassBottomY + 3,           // Bottom hinge
        glassCenterY,                // Middle hinge
        glassTopY - 3                // Top hinge
    ];

    const hingeX = -CONFIG.frame.width / 2 + 0.75; // Left edge of frame
    const hingeZ = CONFIG.frame.depth / 2;         // Front of machine

    hingeYPositions.forEach(y => {
        const hinge = new THREE.Group();

        // Hinge barrel (cylinder)
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(
                CONFIG.hinge.barrelRadius,
                CONFIG.hinge.barrelRadius,
                CONFIG.hinge.length,
                16
            ),
            materials.aluminumBracket
        );
        barrel.rotation.x = Math.PI / 2; // Vertical orientation
        hinge.add(barrel);

        // Hinge plates (2 flat pieces)
        const plate1 = new THREE.Mesh(
            new THREE.BoxGeometry(CONFIG.hinge.width, CONFIG.hinge.length, CONFIG.hinge.thickness),
            materials.aluminumBracket
        );
        plate1.position.x = -CONFIG.hinge.width / 2 - CONFIG.hinge.barrelRadius / 2;
        hinge.add(plate1);

        const plate2 = new THREE.Mesh(
            new THREE.BoxGeometry(CONFIG.hinge.width, CONFIG.hinge.length, CONFIG.hinge.thickness),
            materials.aluminumBracket
        );
        plate2.position.x = CONFIG.hinge.width / 2 + CONFIG.hinge.barrelRadius / 2;
        hinge.add(plate2);

        hinge.position.set(hingeX, y, hingeZ);
        group.add(hinge);
    });

    return group;
}

export function createSecurityLocks(materials) {
    const locks = [];

    // Lock 1: Front door (glass front, right edge, mid-height)
    const lock1 = new THREE.Group();

    const lockBody1 = new THREE.Mesh(
        new THREE.BoxGeometry(
            CONFIG.securityLock.width,
            CONFIG.securityLock.height,
            CONFIG.securityLock.depth
        ),
        materials.lock
    );
    lock1.add(lockBody1);

    // Cylinder for lock
    const cylinder1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16),
        materials.lock
    );
    cylinder1.rotation.x = Math.PI / 2;
    cylinder1.position.z = CONFIG.securityLock.depth / 2 + 0.2;
    lock1.add(cylinder1);

    // Position on right edge of glass door
    const glassHeight = CONFIG.grid.rows * CONFIG.slot.height;
    const glassCenterY = CONFIG.slot.height / 2;
    lock1.position.set(
        CONFIG.frame.width / 2 - 2,
        glassCenterY,
        CONFIG.frame.depth / 2 + 0.3
    );
    locks.push(lock1);

    // Lock 2: Collection bin flap (bottom right)
    const lock2 = lock1.clone();

    // Position on bin flap
    const bottomY = -CONFIG.frame.height / 2 + CONFIG.frame.thickness / 2;
    const flapGap = 1.5;
    lock2.position.set(
        CONFIG.frame.width / 2 - 2,
        bottomY + flapGap + 2,
        CONFIG.frame.depth / 2 + 0.3
    );
    locks.push(lock2);

    return locks;
}

export function createMotorDriverBoard(materials) {
    const group = new THREE.Group();

    // PCB board (blue rectangle)
    const board = new THREE.Mesh(
        new THREE.BoxGeometry(
            CONFIG.motorDriver.width,
            CONFIG.motorDriver.depth,
            CONFIG.motorDriver.height
        ),
        materials.pcb
    );
    group.add(board);

    // Add some component details (capacitors as cylinders)
    const capacitorPositions = [
        { x: -0.8, z: 0.5 },
        { x: 0.8, z: 0.5 }
    ];

    capacitorPositions.forEach(pos => {
        const capacitor = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16),
            materials.motor
        );
        capacitor.position.set(pos.x, pos.z, CONFIG.motorDriver.height / 2 + 0.4);
        group.add(capacitor);
    });

    // Heat sink (aluminum)
    const heatSink = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 0.5),
        materials.aluminumBracket
    );
    heatSink.position.set(0, 0, CONFIG.motorDriver.height / 2 + 0.25);
    group.add(heatSink);

    // Position near power box at bottom
    const y = -CONFIG.frame.height / 2 + CONFIG.powerbox.height + CONFIG.motorDriver.depth / 2 + 1;
    const z = -CONFIG.frame.depth / 2 + CONFIG.motorDriver.width / 2 + 2;

    group.position.set(0, y, z);
    group.rotation.x = Math.PI / 2; // Lay flat

    return group;
}

export function createLEDStrips(materials) {
    const group = new THREE.Group();

    // Create LED strip for each shelf
    for (let row = 1; row <= CONFIG.grid.rows; row++) {
        const shelfY = getShelfY(row);
        const shelfZ = getBackZ();

        // LED strip at front edge of each shelf
        const ledStrip = new THREE.Mesh(
            new THREE.BoxGeometry(
                CONFIG.frame.width - 2,
                CONFIG.ledStrip.height,
                CONFIG.ledStrip.width
            ),
            materials.led
        );

        // Position at front bottom edge of shelf
        ledStrip.position.set(
            0,
            shelfY - CONFIG.frame.thickness / 2 - CONFIG.ledStrip.height / 2,
            shelfZ + CONFIG.shelves.depth / 2 - 1
        );

        group.add(ledStrip);

        // Add point light for each LED strip to create glow effect
        const light = new THREE.PointLight(CONFIG.ledStrip.color, 0.3, 15);
        light.position.copy(ledStrip.position);
        group.add(light);
    }

    return group;
}
