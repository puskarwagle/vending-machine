import * as THREE from 'three';
import { CONFIG } from './config.js';
import { createMaterials } from './materials.js';

// Cut List 3D Viewers - Mini Three.js scenes for each component
let cutlistViewers = [];
let cutlistAnimationFrame = null;

export function initializeCutListViewers() {
    // Clean up any existing viewers first
    cleanupCutListViewers();

    const materials = createMaterials();

    // Component viewer configurations
    const viewerConfigs = [
        {
            id: 'top-bottom',
            create: () => {
                const group = new THREE.Group();
                // Create top and bottom panels stacked
                const top = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.frame.thickness, CONFIG.frame.depth),
                    materials.plywood
                );
                top.position.y = 3;
                group.add(top);

                const bottom = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.frame.thickness, CONFIG.frame.depth),
                    materials.plywood
                );
                bottom.position.y = -3;
                group.add(bottom);

                return group;
            },
            cameraDistance: 40
        },
        {
            id: 'sides',
            create: () => {
                const group = new THREE.Group();
                // Create left and right side panels
                const left = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.frame.thickness, CONFIG.frame.height, CONFIG.frame.depth),
                    materials.plywood
                );
                left.position.x = -5;
                group.add(left);

                const right = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.frame.thickness, CONFIG.frame.height, CONFIG.frame.depth),
                    materials.plywood
                );
                right.position.x = 5;
                group.add(right);

                return group;
            },
            cameraDistance: 80
        },
        {
            id: 'back',
            create: () => {
                const back = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.frame.height, CONFIG.frame.thickness),
                    materials.plywoodSide
                );
                return back;
            },
            cameraDistance: 70
        },
        {
            id: 'shelf',
            create: () => {
                const group = new THREE.Group();

                // Horizontal shelf
                const shelf = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.frame.thickness, CONFIG.shelves.depth),
                    materials.plywood
                );
                shelf.position.set(0, 0, 0);
                group.add(shelf);

                // Vertical backplate
                const backplateY = (CONFIG.shelves.backplateHeight / 2) + (CONFIG.frame.thickness / 2);
                const backplateZ = -(CONFIG.shelves.depth / 2) + (CONFIG.shelves.backplateThickness / 2);

                const backplate = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.shelves.backplateHeight, CONFIG.shelves.backplateThickness),
                    materials.plywoodSide
                );
                backplate.position.set(0, backplateY, backplateZ);
                group.add(backplate);

                // Add dividers
                const numDividers = CONFIG.grid.cols - 1;
                const slotWidth = CONFIG.frame.width / CONFIG.grid.cols;
                const dividerY = CONFIG.frame.thickness / 2 + CONFIG.dividers.height / 2;

                for (let i = 0; i < numDividers; i++) {
                    const divider = new THREE.Mesh(
                        new THREE.BoxGeometry(CONFIG.frame.thickness, CONFIG.dividers.height, CONFIG.shelves.depth),
                        materials.plywood
                    );
                    // Position dividers between slots
                    const xPos = -CONFIG.frame.width / 2 + slotWidth * (i + 1);
                    divider.position.set(xPos, dividerY, 0);
                    group.add(divider);
                }

                return group;
            },
            cameraDistance: 35
        },
        {
            id: 'rails',
            create: () => {
                const group = new THREE.Group();

                // Left rail
                const leftRail = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.rails.width, CONFIG.rails.height, CONFIG.shelves.depth),
                    materials.rail
                );
                leftRail.position.x = -8;
                group.add(leftRail);

                // Right rail
                const rightRail = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.rails.width, CONFIG.rails.height, CONFIG.shelves.depth),
                    materials.rail
                );
                rightRail.position.x = 8;
                group.add(rightRail);

                return group;
            },
            cameraDistance: 30
        },
        {
            id: 'glass',
            create: () => {
                const glassHeight = CONFIG.grid.rows * CONFIG.slot.height;
                const glass = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.frame.width, glassHeight, CONFIG.glass.thickness),
                    materials.glass
                );
                return glass;
            },
            cameraDistance: 60
        },
        {
            id: 'motor',
            create: () => {
                const group = new THREE.Group();

                // Bracket
                const bracket = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.bracket.width, CONFIG.bracket.height, CONFIG.bracket.thickness),
                    materials.bracket
                );
                bracket.position.z = 0;
                group.add(bracket);

                // Motor
                const motor = new THREE.Mesh(
                    new THREE.CylinderGeometry(CONFIG.motor.radius, CONFIG.motor.radius, CONFIG.motor.length, 16),
                    materials.motor
                );
                motor.rotation.z = Math.PI / 2;
                motor.position.z = CONFIG.bracket.thickness / 2 + CONFIG.motor.length / 2;
                group.add(motor);

                // Spiral
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
                spiral.position.z = CONFIG.bracket.thickness / 2 + CONFIG.motor.length;
                group.add(spiral);

                return group;
            },
            cameraDistance: 25
        },
        {
            id: 'bin',
            create: () => {
                const binFloor = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.frame.width, CONFIG.frame.thickness, CONFIG.frame.depth - 6),
                    materials.plywood
                );
                binFloor.rotation.x = CONFIG.collection.slantAngle;
                return binFloor;
            },
            cameraDistance: 40
        },
        {
            id: 'powerbox',
            create: () => {
                const powerBox = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.powerbox.width, CONFIG.powerbox.height, CONFIG.powerbox.depth),
                    new THREE.MeshPhongMaterial({ color: CONFIG.powerbox.color, shininess: 50 })
                );
                return powerBox;
            },
            cameraDistance: 20
        },
        {
            id: 'wiring',
            create: () => {
                const group = new THREE.Group();

                // Create materials for the 3 wires: Power+, Power-, Control
                const wireRadius = 0.25;
                const wireColors = [0xff0000, 0xff8800, 0x00ff00]; // Red, Orange, Green
                const wireMaterials = wireColors.map(color => new THREE.MeshBasicMaterial({ color }));

                // Helper to create wire tube
                function createWireTube(start, end, material) {
                    const direction = new THREE.Vector3().subVectors(end, start);
                    const length = direction.length();
                    const geometry = new THREE.CylinderGeometry(wireRadius, wireRadius, length, 8);
                    const wire = new THREE.Mesh(geometry, material);
                    wire.position.copy(start).add(direction.multiplyScalar(0.5));
                    wire.quaternion.setFromUnitVectors(
                        new THREE.Vector3(0, 1, 0),
                        direction.normalize()
                    );
                    return wire;
                }

                // Simplified wiring showcase - 3 colored wires with curves
                const wireSpacing = 1.5;

                // Vertical trunk
                for (let i = 0; i < 3; i++) {
                    const offset = (i - 1) * wireSpacing;
                    const start = new THREE.Vector3(offset, -10, 0);
                    const end = new THREE.Vector3(offset, 5, 0);
                    group.add(createWireTube(start, end, wireMaterials[i]));
                }

                // Service loop curves
                for (let i = 0; i < 3; i++) {
                    const offset = (i - 1) * wireSpacing;
                    const sideOffset = (i - 1) * 2;
                    const wallPoint = new THREE.Vector3(offset, 5, 0);
                    const shelfPoint = new THREE.Vector3(offset, 5, 8);

                    const curve = new THREE.QuadraticBezierCurve3(
                        wallPoint,
                        new THREE.Vector3(offset + sideOffset, 2, 4),
                        shelfPoint
                    );
                    const tubeGeometry = new THREE.TubeGeometry(curve, 20, wireRadius, 8, false);
                    group.add(new THREE.Mesh(tubeGeometry, wireMaterials[i]));
                }

                // Horizontal distribution
                for (let i = 0; i < 3; i++) {
                    const offset = (i - 1) * wireSpacing;
                    const start = new THREE.Vector3(offset, 5, 8);
                    const end = new THREE.Vector3(8 + offset, 5, 8);
                    group.add(createWireTube(start, end, wireMaterials[i]));
                }

                return group;
            },
            cameraDistance: 30
        }
    ];

    // Create a viewer for each component
    viewerConfigs.forEach(config => {
        const canvas = document.getElementById(`canvas-${config.id}`);
        if (!canvas) return;

        const container = document.getElementById(`viewer-${config.id}`);
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(config.cameraDistance * 0.5, config.cameraDistance * 0.4, config.cameraDistance * 0.7);
        camera.lookAt(0, 0, 0);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(width, height);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // Create component
        const component = config.create();
        scene.add(component);

        // Store viewer data
        cutlistViewers.push({
            id: config.id,
            scene,
            camera,
            renderer,
            component
        });
    });

    // Start animation loop
    animateCutListViewers();
}

export function animateCutListViewers() {
    cutlistAnimationFrame = requestAnimationFrame(animateCutListViewers);

    cutlistViewers.forEach(viewer => {
        // Rotate component slowly
        viewer.component.rotation.y += 0.005;
        viewer.renderer.render(viewer.scene, viewer.camera);
    });
}

export function cleanupCutListViewers() {
    // Stop animation
    if (cutlistAnimationFrame) {
        cancelAnimationFrame(cutlistAnimationFrame);
        cutlistAnimationFrame = null;
    }

    // Clean up each viewer
    cutlistViewers.forEach(viewer => {
        if (viewer.renderer) {
            viewer.renderer.dispose();
        }
        if (viewer.scene) {
            viewer.scene.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
    });

    cutlistViewers = [];
}
