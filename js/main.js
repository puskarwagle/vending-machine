// Global state variables
let scene, camera, renderer;
let frameGroup, topBottomSidesGroup, backPanelGroup, internalFrame, glassFront, motorsGroup, clampsGroup, spiralsGroup, wiringGroup;
let shelvesGroup, railsGroup, dividersGroup, powerBoxGroup, collectionBinGroup;
let mouseDown = false, mouseX = 0, mouseY = 0;
let isPartsView = false;
let isPaused = false;
let defaultCameraPos = { x: 50, y: 40, z: 70 };
let isAssembling = false;

// Assembly animation function - shows components one by one from inner to outer
function assembleAnimation(menuToggles) {
    if (isAssembling) return; // Prevent multiple simultaneous animations
    isAssembling = true;

    const assembleButton = document.getElementById('assemble-button');
    assembleButton.disabled = true;
    assembleButton.textContent = 'Assembling...';

    // First, uncheck all and hide all components
    menuToggles.forEach(toggle => {
        const element = document.getElementById(toggle.id);
        element.checked = false;
        toggle.target().visible = false;
    });

    // Assembly order (inner to outer)
    const assemblyOrder = [
        'toggle-powerbox',      // 1. Power Box (innermost)
        'toggle-collectionbin', // 2. Collection Bin
        'toggle-backpanel',     // 3. Back Panel
        'toggle-topbottomsides',// 4. Top Bottom Sides
        'toggle-shelves',       // 5. Shelves
        'toggle-rails',         // 6. Rails
        'toggle-dividers',      // 7. Dividers
        'toggle-wiring',        // 8. Wiring
        'toggle-motors',        // 9. Motors
        'toggle-clamps',        // 10. Clamps
        'toggle-spirals',       // 11. Spirals
        'toggle-glass'          // 12. Glass Front (outermost)
    ];

    // Delay between each component (2 seconds)
    const delay = 2000;

    // Show components sequentially
    assemblyOrder.forEach((toggleId, index) => {
        setTimeout(() => {
            const toggle = menuToggles.find(t => t.id === toggleId);
            if (toggle) {
                const element = document.getElementById(toggleId);
                element.checked = true;
                toggle.target().visible = true;
            }

            // Re-enable button after last component
            if (index === assemblyOrder.length - 1) {
                setTimeout(() => {
                    assembleButton.disabled = false;
                    assembleButton.textContent = 'Assemble';
                    isAssembling = false;
                }, 500);
            }
        }, index * delay);
    });
}

function init() {
    // Generate and populate cut list
    const partsOverlay = document.getElementById('parts-overlay');
    partsOverlay.innerHTML = generateCutList();

    // Generate and populate dimensions display
    const dimensionsDisplay = document.getElementById('dimensions-display');
    dimensionsDisplay.innerHTML = generateDimensionsDisplay();

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

    // Top Bottom Sides group
    topBottomSidesGroup = new THREE.Group();
    frameGroup.add(topBottomSidesGroup);

    // Back Panel group
    backPanelGroup = new THREE.Group();
    frameGroup.add(backPanelGroup);

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
    powerBoxGroup = new THREE.Group();
    frameGroup.add(powerBoxGroup);

    // Collection Bin Group
    collectionBinGroup = new THREE.Group();
    frameGroup.add(collectionBinGroup);

    // Create materials
    const materials = createMaterials();

    // Create top bottom sides
    const topBottomSides = createTopBottomSides(materials);
    topBottomSidesGroup.add(...topBottomSides.children);

    // Create back panel
    const backPanel = createBackPanel(materials);
    backPanelGroup.add(...backPanel.children);

    // Create glass front
    glassFront = createGlassFront(materials);
    frameGroup.add(glassFront);

    // Create collection bin
    const binFloor = createCollectionBin(materials);
    collectionBinGroup.add(binFloor);

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
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const assembleButton = document.getElementById('assemble-button');

    // Initialize slider to current camera distance (inverted scale)
    zoomSlider.value = 180 - camera.position.length();

    // Menu toggle configuration - maps toggle IDs to their target groups
    const menuToggles = [
        { id: 'toggle-topbottomsides', target: () => topBottomSidesGroup },
        { id: 'toggle-backpanel', target: () => backPanelGroup },
        { id: 'toggle-shelves', target: () => shelvesGroup },
        { id: 'toggle-rails', target: () => railsGroup },
        { id: 'toggle-dividers', target: () => dividersGroup },
        { id: 'toggle-glass', target: () => glassFront },
        { id: 'toggle-motors', target: () => motorsGroup },
        { id: 'toggle-clamps', target: () => clampsGroup },
        { id: 'toggle-spirals', target: () => spiralsGroup },
        { id: 'toggle-wiring', target: () => wiringGroup },
        { id: 'toggle-powerbox', target: () => powerBoxGroup },
        { id: 'toggle-collectionbin', target: () => collectionBinGroup }
    ];

    menuHeader.addEventListener('click', () => {
        menu.classList.toggle('collapsed');
    });

    // Zoom controls - maintains camera angle while zooming
    function updateZoom(zoomValue) {
        // Invert slider value to distance: higher slider = closer camera
        const distance = 180 - parseFloat(zoomValue);
        // Calculate current direction vector from camera to origin
        const direction = new THREE.Vector3(0, 0, 0).sub(camera.position).normalize();
        // Get current distance
        const currentDistance = camera.position.length();
        // Calculate ratio to maintain x, y proportions
        const ratio = distance / currentDistance;
        // Update camera position maintaining direction
        camera.position.set(
            camera.position.x * ratio,
            camera.position.y * ratio,
            camera.position.z * ratio
        );
        camera.lookAt(0, 0, 0);
    }

    zoomSlider.addEventListener('input', (e) => {
        updateZoom(e.target.value);
    });

    zoomInBtn.addEventListener('click', () => {
        const currentSliderValue = parseFloat(zoomSlider.value);
        const newSliderValue = Math.min(150, currentSliderValue + 5);
        zoomSlider.value = newSliderValue;
        updateZoom(newSliderValue);
    });

    zoomOutBtn.addEventListener('click', () => {
        const currentSliderValue = parseFloat(zoomSlider.value);
        const newSliderValue = Math.max(30, currentSliderValue - 5);
        zoomSlider.value = newSliderValue;
        updateZoom(newSliderValue);
    });

    toggleCutlist.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Switch to parts view
            isPartsView = true;
            renderer.domElement.style.display = 'none';
            partsOverlay.classList.add('active');
            document.body.style.background = '#000';

            // Uncheck and hide frame toggles
            menuToggles.forEach(toggle => {
                const element = document.getElementById(toggle.id);
                element.checked = false;
                toggle.target().visible = false;
            });

            // Initialize cut list 3D viewers
            setTimeout(() => {
                initializeCutListViewers();
            }, 100); // Small delay to ensure DOM is ready
        } else {
            // Return to 3D view
            isPartsView = false;
            renderer.domElement.style.display = 'block';
            partsOverlay.classList.remove('active');
            document.body.style.background = '';

            // Clean up cut list viewers
            cleanupCutListViewers();

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

    // Assemble button
    assembleButton.addEventListener('click', () => {
        assembleAnimation(menuToggles);
    });

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
        const currentDistance = camera.position.length();
        const newDistance = Math.max(30, Math.min(150, currentDistance + e.deltaY * 0.05));
        const ratio = newDistance / currentDistance;
        camera.position.set(
            camera.position.x * ratio,
            camera.position.y * ratio,
            camera.position.z * ratio
        );
        camera.lookAt(0, 0, 0);
        // Update slider to match (invert: distance to slider value)
        const zoomSlider = document.getElementById('zoom-slider');
        if (zoomSlider) zoomSlider.value = 180 - newDistance;
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
