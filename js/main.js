// Global state variables
let scene, camera, renderer;
let frameGroup, topBottomSidesGroup, backPanelGroup, internalFrame, glassFront, motorsGroup, clampsGroup, spiralsGroup, wiringGroup;
let shelvesGroup, railsGroup, dividersGroup, powerBoxGroup, collectionBinGroup;
let mouseDown = false, mouseX = 0, mouseY = 0;
let isPartsView = false;
let isPaused = false;
let defaultCameraPos = { x: 50, y: 40, z: 70 };
let isAssembling = false;
let assemblyTimeouts = []; // Track assembly animation timeouts
let animationFrameId = null;
let isDirty = true; // Flag to track if scene needs re-render
let eventListeners = []; // Store event listeners for cleanup
let motorsCreated = false; // Flag to track if motor assemblies have been created
let materials = null; // Store materials for lazy loading
// Touch control variables
let touchStartX = 0, touchStartY = 0;
let lastTouchDistance = 0;
// Loading state management
let isMainSceneReady = false;
let areCutListViewersReady = false;
let mainLoadingOverlay = null;
let partsLoadingOverlay = null;

// Helper function to mark scene as needing re-render
function setDirty() {
    isDirty = true;
}

// Helper function to add event listener and track it for cleanup
function addTrackedListener(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
}

// Loading state management functions
function initLoadingOverlays() {
    mainLoadingOverlay = document.getElementById('main-loading-overlay');
    partsLoadingOverlay = document.getElementById('parts-loading-overlay');
}

function hideMainLoading() {
    if (mainLoadingOverlay && !isMainSceneReady) {
        isMainSceneReady = true;
        mainLoadingOverlay.classList.add('hidden');
        // Remove from DOM after transition completes
        setTimeout(() => {
            if (mainLoadingOverlay) {
                mainLoadingOverlay.style.display = 'none';
            }
        }, 300);
    }
}

function showPartsLoading() {
    if (partsLoadingOverlay) {
        partsLoadingOverlay.classList.remove('hidden');
        partsLoadingOverlay.classList.add('active');
    }
}

function hidePartsLoading() {
    if (partsLoadingOverlay) {
        partsLoadingOverlay.classList.add('hidden');
        // Remove active class after transition
        setTimeout(() => {
            if (partsLoadingOverlay) {
                partsLoadingOverlay.classList.remove('active');
                partsLoadingOverlay.classList.remove('hidden');
            }
        }, 300);
    }
}

// Lazy loading function for motor assemblies
function ensureMotorsCreated() {
    if (motorsCreated || !materials) return;

    // Create dispensing mechanisms for all slots
    for (let row = 1; row <= CONFIG.grid.rows; row++) {
        for (let col = 0; col < CONFIG.grid.cols; col++) {
            const assembly = createMotorAssembly(row, col, materials);
            motorsGroup.add(assembly.motor);
            clampsGroup.add(assembly.bracket);
            spiralsGroup.add(assembly.spiral);
        }
    }

    motorsCreated = true;
    setDirty();
}

// Stop assembly animation
function stopAssembly() {
    if (!isAssembling) return;

    // Clear all pending timeouts
    assemblyTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    assemblyTimeouts = [];

    // Reset assembly state
    const assembleButton = document.getElementById('assemble-button');
    if (assembleButton) {
        assembleButton.disabled = false;
        assembleButton.textContent = 'Assemble';
    }
    isAssembling = false;
}

// Assembly animation function - shows components one by one from inner to outer
function assembleAnimation(menuToggles) {
    if (isAssembling) return; // Prevent multiple simultaneous animations
    isAssembling = true;

    // Clear any existing timeouts first
    assemblyTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    assemblyTimeouts = [];

    // Ensure motors are created before assembly
    ensureMotorsCreated();

    const assembleButton = document.getElementById('assemble-button');
    assembleButton.disabled = true;
    assembleButton.textContent = 'Assembling...';

    // First, uncheck all and hide all components
    menuToggles.forEach(toggle => {
        const element = document.getElementById(toggle.id);
        element.checked = false;
        toggle.target().visible = false;
    });
    setDirty();

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
        const timeoutId = setTimeout(() => {
            const toggle = menuToggles.find(t => t.id === toggleId);
            if (toggle) {
                const element = document.getElementById(toggleId);
                element.checked = true;
                toggle.target().visible = true;
                setDirty();
            }

            // Re-enable button after last component
            if (index === assemblyOrder.length - 1) {
                const finalTimeoutId = setTimeout(() => {
                    assembleButton.disabled = false;
                    assembleButton.textContent = 'Assemble';
                    isAssembling = false;
                    assemblyTimeouts = [];
                }, 500);
                assemblyTimeouts.push(finalTimeoutId);
            }
        }, index * delay);

        assemblyTimeouts.push(timeoutId);
    });
}

function init() {
    // Initialize loading overlays
    initLoadingOverlays();

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
    materials = createMaterials();

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

    // Motor assemblies will be created lazily when first needed (see ensureMotorsCreated)

    // Mouse controls
    addTrackedListener(renderer.domElement, 'mousedown', onMouseDown);
    addTrackedListener(renderer.domElement, 'mousemove', onMouseMove);
    addTrackedListener(renderer.domElement, 'mouseup', onMouseUp);
    addTrackedListener(renderer.domElement, 'wheel', onWheel);

    // Touch controls
    addTrackedListener(renderer.domElement, 'touchstart', onTouchStart);
    addTrackedListener(renderer.domElement, 'touchmove', onTouchMove);
    addTrackedListener(renderer.domElement, 'touchend', onTouchEnd);

    addTrackedListener(window, 'resize', onWindowResize);

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

    addTrackedListener(menuHeader, 'click', () => {
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
        setDirty();
    }

    addTrackedListener(zoomSlider, 'input', (e) => {
        updateZoom(e.target.value);
    });

    addTrackedListener(zoomInBtn, 'click', () => {
        const currentSliderValue = parseFloat(zoomSlider.value);
        const newSliderValue = Math.min(150, currentSliderValue + 5);
        zoomSlider.value = newSliderValue;
        updateZoom(newSliderValue);
    });

    addTrackedListener(zoomOutBtn, 'click', () => {
        const currentSliderValue = parseFloat(zoomSlider.value);
        const newSliderValue = Math.max(30, currentSliderValue - 5);
        zoomSlider.value = newSliderValue;
        updateZoom(newSliderValue);
    });

    addTrackedListener(toggleCutlist, 'change', (e) => {
        if (e.target.checked) {
            // Stop any ongoing assembly animation
            stopAssembly();

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

            // Show loading overlay
            showPartsLoading();

            // Initialize cut list 3D viewers after next paint
            requestAnimationFrame(() => {
                initializeCutListViewers();
                areCutListViewersReady = true;
                // Hide loading after a brief moment to ensure all viewers are rendered
                requestAnimationFrame(() => {
                    hidePartsLoading();
                });
            });
        } else {
            // Return to 3D view
            isPartsView = false;
            renderer.domElement.style.display = 'block';
            partsOverlay.classList.remove('active');
            document.body.style.background = '';

            // Clean up cut list viewers
            cleanupCutListViewers();
            areCutListViewersReady = false;

            // Re-enable and check frame toggles
            menuToggles.forEach(toggle => {
                const element = document.getElementById(toggle.id);
                element.checked = true;
                toggle.target().visible = true;
            });
            setDirty();
        }
    });

    // Setup visibility toggles dynamically
    menuToggles.forEach(toggle => {
        const element = document.getElementById(toggle.id);
        addTrackedListener(element, 'change', (e) => {
            // Lazy load motors if needed
            const motorRelatedIds = ['toggle-motors', 'toggle-clamps', 'toggle-spirals'];
            if (motorRelatedIds.includes(toggle.id) && e.target.checked) {
                ensureMotorsCreated();
            }

            toggle.target().visible = e.target.checked;
            setDirty();
        });
        // Initialize visibility based on checkbox state
        // For motor-related components, create them first if they're checked on load
        const motorRelatedIds = ['toggle-motors', 'toggle-clamps', 'toggle-spirals'];
        if (motorRelatedIds.includes(toggle.id) && element.checked) {
            ensureMotorsCreated();
        }
        toggle.target().visible = element.checked;
    });

    addTrackedListener(togglePause, 'change', (e) => {
        isPaused = e.target.checked;
        if (isPaused) {
            frameGroup.rotation.set(0, Math.PI * 0.25, 0);
            setDirty();
        }
    });

    // Ensure state matches checkbox on load (e.g. after refresh)
    if (togglePause.checked) {
        isPaused = true;
        frameGroup.rotation.set(0, Math.PI * 0.25, 0);
    }

    // Assemble button
    addTrackedListener(assembleButton, 'click', () => {
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
    setDirty();
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
    setDirty();
}

function onTouchStart(e) {
    if (isPartsView) return;

    if (e.touches.length === 1) {
        // Single touch - rotation
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        // Two touches - pinch to zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
    }
}

function onTouchMove(e) {
    e.preventDefault(); // Prevent scrolling
    if (isPartsView) return;

    if (e.touches.length === 1) {
        // Single touch - rotate the model
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;

        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;

        frameGroup.rotation.y += deltaX * 0.01;
        frameGroup.rotation.x += deltaY * 0.01;

        touchStartX = touchX;
        touchStartY = touchY;
        setDirty();
    } else if (e.touches.length === 2) {
        // Two touches - pinch to zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (lastTouchDistance > 0) {
            const delta = distance - lastTouchDistance;
            const currentDistance = camera.position.length();
            const newDistance = Math.max(30, Math.min(150, currentDistance - delta * 0.1));
            const ratio = newDistance / currentDistance;

            camera.position.set(
                camera.position.x * ratio,
                camera.position.y * ratio,
                camera.position.z * ratio
            );
            camera.lookAt(0, 0, 0);

            // Update slider to match
            const zoomSlider = document.getElementById('zoom-slider');
            if (zoomSlider) zoomSlider.value = 180 - newDistance;
        }

        lastTouchDistance = distance;
        setDirty();
    }
}

function onTouchEnd(e) {
    if (e.touches.length === 0) {
        lastTouchDistance = 0;
    } else if (e.touches.length === 1) {
        // Reset single touch position when one finger is lifted during pinch
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        lastTouchDistance = 0;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    setDirty();
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);

    // Auto-rotation marks scene as dirty
    if (!isPartsView && !isPaused) {
        frameGroup.rotation.y += 0.002; // Slow auto-rotation
        isDirty = true;
    }

    // Only render if scene has changed
    if (isDirty) {
        renderer.render(scene, camera);
        isDirty = false;

        // Hide main loading overlay after first successful render
        if (!isMainSceneReady) {
            hideMainLoading();
        }
    }
}

// Cleanup function to stop animation and free resources
function cleanup() {
    // Stop animation loop
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Remove all event listeners
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];

    // Dispose Three.js resources
    if (renderer) {
        renderer.dispose();
    }
    if (scene) {
        scene.traverse((object) => {
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
}

// Register cleanup on page unload
window.addEventListener('beforeunload', cleanup);

init();
