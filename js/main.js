// Global state variables
let scene, camera, renderer;
let frameGroup, externalFrame, internalFrame, glassFront, motorsGroup, clampsGroup, spiralsGroup, wiringGroup;
let shelvesGroup, railsGroup, dividersGroup;
let mouseDown = false, mouseX = 0, mouseY = 0;
let isPartsView = false;
let isPaused = false;
let defaultCameraPos = { x: 50, y: 40, z: 70 };

function init() {
    // Generate and populate cut list
    const partsOverlay = document.getElementById('parts-overlay');
    partsOverlay.innerHTML = generateCutList();

    // Generate and populate dimensions display
    const dimensionsDisplay = document.getElementById('dimensions-display');
    dimensionsDisplay.innerHTML = generateDimensionsDisplay();

    // Update info display with CONFIG values
    const info = document.getElementById('info');
    info.innerHTML = `
        <strong>Vending Machine Internal Frame</strong><br>
        Dimensions: ${CONFIG.frame.width}"W × ${CONFIG.frame.height}"H × ${CONFIG.frame.depth}"D<br>
        Grid: ${CONFIG.grid.cols} across × ${CONFIG.grid.rows} down = ${CONFIG.grid.cols * CONFIG.grid.rows} slots<br>
        Slot size: ${CONFIG.slot.width}"W × ${CONFIG.slot.height}"H × ${CONFIG.slot.depth}"D<br>
        Collection area: ${CONFIG.collection.height}"H (bottom)
    `;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(50, 40, 70);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Frame group
    frameGroup = new THREE.Group();
    scene.add(frameGroup);

    // External frame group (outer box)
    externalFrame = new THREE.Group();
    frameGroup.add(externalFrame);

    // Internal frame group (shelves and dividers)
    internalFrame = new THREE.Group();
    frameGroup.add(internalFrame);

    // Rack system groups (separate for shelves, rails, dividers)
    shelvesGroup = new THREE.Group();
    frameGroup.add(shelvesGroup);

    railsGroup = new THREE.Group();
    frameGroup.add(railsGroup);

    dividersGroup = new THREE.Group();
    frameGroup.add(dividersGroup);

    // Dispensing mechanism groups (separate for motors, clamps, spirals)
    motorsGroup = new THREE.Group();
    frameGroup.add(motorsGroup);

    clampsGroup = new THREE.Group();
    frameGroup.add(clampsGroup);

    spiralsGroup = new THREE.Group();
    frameGroup.add(spiralsGroup);

    wiringGroup = new THREE.Group();
    frameGroup.add(wiringGroup);

    // Power Box Group
    const powerBoxGroup = new THREE.Group();
    frameGroup.add(powerBoxGroup);

    // Create materials
    const materials = createMaterials();

    // Create external frame
    const frameGeometry = createExternalFrame(materials);
    externalFrame.add(...frameGeometry.children);

    // Create glass front
    glassFront = createGlassFront(materials);
    frameGroup.add(glassFront);

    // Create collection bin
    const binFloor = createCollectionBin(materials);
    internalFrame.add(binFloor);

    // Create Power Box
    const powerBox = createPowerBox(materials);
    powerBoxGroup.add(powerBox);

    // Create Wiring
    const wiring = createWiring(materials);
    wiringGroup.add(wiring);

    // Create shelves for each row
    for (let i = 1; i <= CONFIG.grid.rows; i++) {
        shelvesGroup.add(createShelf(i, materials));
    }

    // Create rails for each row
    for (let i = 1; i <= CONFIG.grid.rows; i++) {
        const rails = createRails(i, materials);
        railsGroup.add(...rails.children);
    }

    // Create dividers for each row
    for (let i = 1; i <= CONFIG.grid.rows; i++) {
        const dividers = createDividers(i, materials);
        dividersGroup.add(...dividers.children);
    }

    // Create dispensing mechanisms for all slots
    for (let row = 1; row <= CONFIG.grid.rows; row++) {
        for (let col = 0; col < CONFIG.grid.cols; col++) {
            const assembly = createMotorAssembly(row, col, materials);
            motorsGroup.add(assembly.motor);
            clampsGroup.add(assembly.bracket);
            spiralsGroup.add(assembly.spiral);
        }
    }

    // Mouse controls
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    window.addEventListener('resize', onWindowResize);

    // Menu controls - dynamic setup
    const menuHeader = document.getElementById('menu-header');
    const menu = document.getElementById('menu');
    const toggleCutlist = document.getElementById('toggle-cutlist');
    const togglePause = document.getElementById('toggle-pause');

    // Menu toggle configuration - maps toggle IDs to their target groups
    const menuToggles = [
        { id: 'toggle-external', target: () => externalFrame },
        { id: 'toggle-shelves', target: () => shelvesGroup },
        { id: 'toggle-rails', target: () => railsGroup },
        { id: 'toggle-dividers', target: () => dividersGroup },
        { id: 'toggle-glass', target: () => glassFront },
        { id: 'toggle-motors', target: () => motorsGroup },
        { id: 'toggle-clamps', target: () => clampsGroup },
        { id: 'toggle-spirals', target: () => spiralsGroup },
        { id: 'toggle-wiring', target: () => wiringGroup }
    ];

    menuHeader.addEventListener('click', () => {
        menu.classList.toggle('collapsed');
    });

    toggleCutlist.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Switch to parts view
            isPartsView = true;
            renderer.domElement.style.display = 'none';
            partsOverlay.classList.add('active');
            document.body.style.background = '#d4a574';

            // Uncheck and hide frame toggles
            menuToggles.forEach(toggle => {
                const element = document.getElementById(toggle.id);
                element.checked = false;
                toggle.target().visible = false;
            });
        } else {
            // Return to 3D view
            isPartsView = false;
            renderer.domElement.style.display = 'block';
            partsOverlay.classList.remove('active');
            document.body.style.background = '';

            // Re-enable and check frame toggles
            menuToggles.forEach(toggle => {
                const element = document.getElementById(toggle.id);
                element.checked = true;
                toggle.target().visible = true;
            });
        }
    });

    // Setup visibility toggles dynamically
    menuToggles.forEach(toggle => {
        const element = document.getElementById(toggle.id);
        element.addEventListener('change', (e) => {
            toggle.target().visible = e.target.checked;
        });
        // Initialize visibility based on checkbox state
        toggle.target().visible = element.checked;
    });

    togglePause.addEventListener('change', (e) => {
        isPaused = e.target.checked;
        if (isPaused) {
            frameGroup.rotation.set(0, Math.PI * 0.25, 0);
        }
    });

    // Ensure state matches checkbox on load (e.g. after refresh)
    if (togglePause.checked) {
        isPaused = true;
        frameGroup.rotation.set(0, Math.PI * 0.25, 0);
    }

    animate();
}

function onMouseDown(e) {
    mouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
}

function onMouseMove(e) {
    if (!mouseDown || isPartsView) return;

    const deltaX = e.clientX - mouseX;
    const deltaY = e.clientY - mouseY;

    frameGroup.rotation.y += deltaX * 0.01;
    frameGroup.rotation.x += deltaY * 0.01;

    mouseX = e.clientX;
    mouseY = e.clientY;
}

function onMouseUp() {
    mouseDown = false;
}

function onWheel(e) {
    e.preventDefault();

    // If shift is held, zoom in/out
    if (e.shiftKey) {
        camera.position.z += e.deltaY * 0.05;
        camera.position.z = Math.max(30, Math.min(150, camera.position.z));
    } else {
        // Otherwise, use scroll to rotate
        // deltaX = horizontal scroll (rotates around Y axis)
        // deltaY = vertical scroll (rotates around X axis)
        frameGroup.rotation.y += e.deltaX * 0.005;
        frameGroup.rotation.x += e.deltaY * 0.005;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (!isPartsView && !isPaused) {
        frameGroup.rotation.y += 0.002; // Slow auto-rotation
    }
    renderer.render(scene, camera);
}

init();
