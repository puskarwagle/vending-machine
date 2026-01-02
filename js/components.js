// Component factory functions
function createExternalFrame(materials) {
    const group = new THREE.Group();
    const { width, height, depth, thickness } = CONFIG.frame;

    // Back panel
    const back = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, thickness),
        materials.plywoodSide
    );
    back.position.z = -depth/2;
    group.add(back);

    // Side panels
    const leftSide = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, height, depth),
        materials.plywood
    );
    leftSide.position.x = -width/2;
    group.add(leftSide);

    const rightSide = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, height, depth),
        materials.plywood
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

function createShelf(rowIndex, materials) {
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

function createWiring(materials) {
    const group = new THREE.Group();
    const wireMaterial = new THREE.LineBasicMaterial({ color: CONFIG.wiring.color });
    
    // Power Box Position (Target)
    const powerBoxY = -CONFIG.frame.height/2 + CONFIG.powerbox.height/2 + CONFIG.frame.thickness;
    const powerBoxZ = -CONFIG.frame.depth/2 + CONFIG.powerbox.depth/2 + 1;
    
    // Main Trunk (Vertical run up the back wall)
    const trunkX = 0; // Center
    const trunkZ = -CONFIG.frame.depth/2 + 1; // Against back wall
    
    const trunkGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(trunkX, powerBoxY, trunkZ),
        new THREE.Vector3(trunkX, CONFIG.frame.height/2 - 5, trunkZ)
    ]);
    const trunk = new THREE.Line(trunkGeometry, wireMaterial);
    group.add(trunk);

    // Wiring for each row
    for (let row = 1; row <= CONFIG.grid.rows; row++) {
        const shelfY = getShelfY(row);
        const shelfBackZ = getBackZ() - (CONFIG.shelves.depth / 2); // Back edge of sliding shelf
        
        // 1. Connection from Main Trunk to Service Loop Point (Fixed on wall)
        const wallPoint = new THREE.Vector3(trunkX, shelfY + 2, trunkZ);
        
        // 2. Service Loop (Flexible curve from Wall to Shelf)
        // Shelf connection point (center of shelf backplate)
        const shelfPoint = new THREE.Vector3(0, shelfY + 2, shelfBackZ);
        
        const curve = new THREE.QuadraticBezierCurve3(
            wallPoint,
            new THREE.Vector3(0, shelfY - 4, (trunkZ + shelfBackZ) / 2), // Dip down for slack
            shelfPoint
        );
        const loopPoints = curve.getPoints(20);
        const loopGeometry = new THREE.BufferGeometry().setFromPoints(loopPoints);
        group.add(new THREE.Line(loopGeometry, wireMaterial));

        // 3. Distribution along the shelf backplate to motors
        for (let col = 0; col < CONFIG.grid.cols; col++) {
            const slotPos = getSlotCenter(row, col);
            const motorX = slotPos.x;
            
            // Wire from center of shelf backplate to specific motor
            const motorWireGeom = new THREE.BufferGeometry().setFromPoints([
                shelfPoint, // Center of shelf backplate
                new THREE.Vector3(motorX, shelfY + 2, shelfBackZ) // To motor location
            ]);
            group.add(new THREE.Line(motorWireGeom, wireMaterial));
        }
    }

    return group;
}

function createRails(rowIndex, materials) {
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

function createDividers(rowIndex, materials) {
    const group = new THREE.Group();
    const y = getShelfY(rowIndex) + CONFIG.dividers.height/2;
    const z = getBackZ();

    // Create dividers based on grid columns
    for (let col = 1; col < CONFIG.grid.cols; col++) {
        const divider = new THREE.Mesh(
            new THREE.BoxGeometry(CONFIG.frame.thickness, CONFIG.dividers.height, CONFIG.shelves.depth),
            materials.plywood
        );
        divider.position.set(-CONFIG.frame.width/2 + (col * CONFIG.slot.width), y, z);
        group.add(divider);
    }

    return group;
}

function createCollectionBin(materials) {
    const binFloor = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.frame.thickness, CONFIG.frame.depth - 6),
        materials.plywood
    );
    binFloor.position.set(0, -CONFIG.frame.height/2 + 3, 3);
    binFloor.rotation.x = CONFIG.collection.slantAngle;
    return binFloor;
}

function createGlassFront(materials) {
    const glassHeight = CONFIG.grid.rows * CONFIG.slot.height;
    const glass = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, glassHeight, CONFIG.glass.thickness),
        materials.glass
    );
    glass.position.set(0, CONFIG.slot.height/2, CONFIG.shelves.depth/2 + CONFIG.glass.offset);
    return glass;
}

function createMotorAssembly(row, col, materials) {
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

function createPowerBox(materials) {
    const powerBox = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.powerbox.width, CONFIG.powerbox.height, CONFIG.powerbox.depth),
        new THREE.MeshPhongMaterial({ color: CONFIG.powerbox.color, shininess: 50 })
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

function createWiring(materials) {
    const group = new THREE.Group();
    const wireMaterial = new THREE.LineBasicMaterial({ color: CONFIG.wiring.color });
    
    // Power Box Position (Target)
    const powerBoxY = -CONFIG.frame.height/2 + CONFIG.powerbox.height/2 + CONFIG.frame.thickness;
    const powerBoxZ = -CONFIG.frame.depth/2 + CONFIG.powerbox.depth/2 + 1;
    
    // Main Trunk (Vertical run up the back wall)
    const trunkX = 0; // Center
    const trunkZ = -CONFIG.frame.depth/2 + 1; // Against back wall
    
    const trunkGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(trunkX, powerBoxY, trunkZ),
        new THREE.Vector3(trunkX, CONFIG.frame.height/2 - 5, trunkZ)
    ]);
    const trunk = new THREE.Line(trunkGeometry, wireMaterial);
    group.add(trunk);

    // Wiring for each row
    for (let row = 1; row <= CONFIG.grid.rows; row++) {
        const shelfY = getShelfY(row);
        const shelfFloorY = shelfY + (CONFIG.frame.thickness / 2);
        const motorY = shelfFloorY + CONFIG.spiral.radius;
        const shelfBackZ = getBackZ() - (CONFIG.shelves.depth / 2); // Back edge of sliding shelf
        
        // 1. Connection from Main Trunk to Service Loop Point (Fixed on wall)
        // Adjust loop attach point slightly lower than motor height
        const wallPoint = new THREE.Vector3(trunkX, motorY, trunkZ);
        
        // 2. Service Loop (Flexible curve from Wall to Shelf)
        // Shelf connection point (center of shelf backplate at motor height)
        const shelfPoint = new THREE.Vector3(0, motorY, shelfBackZ);
        
        const curve = new THREE.QuadraticBezierCurve3(
            wallPoint,
            new THREE.Vector3(0, motorY - 6, (trunkZ + shelfBackZ) / 2), // Dip down more for slack
            shelfPoint
        );
        const loopPoints = curve.getPoints(20);
        const loopGeometry = new THREE.BufferGeometry().setFromPoints(loopPoints);
        group.add(new THREE.Line(loopGeometry, wireMaterial));

        // 3. Distribution along the shelf backplate to motors
        for (let col = 0; col < CONFIG.grid.cols; col++) {
            const slotPos = getSlotCenter(row, col);
            const motorX = slotPos.x;
            
            // Wire from center of shelf backplate to specific motor
            const motorWireGeom = new THREE.BufferGeometry().setFromPoints([
                shelfPoint, // Center of shelf backplate
                new THREE.Vector3(motorX, motorY, shelfBackZ) // To motor location
            ]);
            group.add(new THREE.Line(motorWireGeom, wireMaterial));
        }
    }

    return group;
}
