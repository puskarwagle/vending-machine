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
    const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.frame.thickness, CONFIG.shelves.depth),
        materials.plywood
    );
    shelf.position.y = getShelfY(rowIndex);
    shelf.position.z = getBackZ();
    return shelf;
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
    const pos = getSlotCenter(row, col);
    const zBack = pos.z;

    // Motor (cylinder at back)
    const motor = new THREE.Mesh(
        new THREE.CylinderGeometry(CONFIG.motor.radius, CONFIG.motor.radius, CONFIG.motor.length, 16),
        materials.motor
    );
    motor.rotation.z = Math.PI / 2; // Rotate to horizontal
    motor.position.set(pos.x, pos.y, zBack + 1);
    assembly.motor = motor;

    // Mounting bracket (flat box behind motor)
    const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(CONFIG.bracket.width, CONFIG.bracket.height, CONFIG.bracket.thickness),
        materials.bracket
    );
    bracket.position.set(pos.x, pos.y, zBack - 0.5);
    assembly.bracket = bracket;

    // Spiral coil (helix from motor to front)
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
    spiral.position.set(pos.x, pos.y, zBack + 2);
    assembly.spiral = spiral;

    return assembly;
}
