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

export function createTopBottomSides(materials) {
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

    // Top and bottom
    const top = new THREE.Mesh(
        new THREE.BoxGeometry(width, thickness, depth),
        materials.plywood
    );
    top.position.y = height/2;
    group.add(top);

    const bottom = new THREE.Mesh(
        new THREE.BoxGeometry(width, thickness, depth),
        materials.plywood
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
    const binFloor = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.frame.thickness, CONFIG.frame.depth - 6),
        materials.plywood
    );
    binFloor.position.set(0, -CONFIG.frame.height/2 + 3, 3);
    binFloor.rotation.x = CONFIG.collection.slantAngle;
    return binFloor;
}

export function createGlassFront(materials) {
    const glassHeight = CONFIG.grid.rows * CONFIG.slot.height;
    const glass = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, glassHeight, CONFIG.glass.thickness),
        materials.glass
    );
    glass.position.set(0, CONFIG.slot.height/2, CONFIG.shelves.depth/2 + CONFIG.glass.offset);
    return glass;
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
