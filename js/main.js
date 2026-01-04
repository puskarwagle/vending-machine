import * as THREE from 'three';
import { CONFIG } from './config.js';
import { createMaterials } from './materials.js';
import {
    createBackPanel,
    createSides,
    createTopBottom,
    createShelf,
    createRails,
    createDividers,
    createCollectionBin,
    createBinFlap,
    createBinFlapBorder,
    createGlassFront,
    createGlassFrontBorder,
    createMotorAssembly,
    createPowerBox,
    createWiring,
    createWheels,
    createTouchscreen,
    createDoorHinges,
    createSecurityLocks,
    createMotorDriverBoard,
    createLEDStrips
} from './components.js';
import { generateMenuHTML, generateCutList } from './ui.js';
import { initializeCutListViewers, cleanupCutListViewers, pauseCutListViewers, playCutListViewers } from './cutlist-viewers.js';

// Module state variables
let scene, camera, renderer;
let frameGroup, sidesGroup, topBottomGroup, backPanelGroup, internalFrame, glassFront, glassFrontBorderGroup, motorsGroup, clampsGroup, spiralsGroup, wiringGroup;
let shelvesGroup, railsGroup, dividersGroup, powerBoxGroup, collectionBinGroup, binFlapGroup, binFlapBorderGroup, wheelsGroup;
let touchscreenGroup, doorHingesGroup, securityLocksGroup, motorDriverGroup, ledStripsGroup;
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
        assembleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Assemble
        `;
        assembleButton.dataset.active = 'false';
        assembleButton.classList.remove('bg-base-content/20', 'border-base-content/40');
        assembleButton.classList.add('border-base-content/20');
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
    assembleButton.innerHTML = `
        <span class="loading loading-spinner loading-sm"></span>
        Assembling...
    `;

    // First, deactivate all and hide all components
    menuToggles.forEach(toggle => {
        const element = document.getElementById(toggle.id);
        element.dataset.active = 'false';
        element.classList.remove('bg-base-content/10', 'border-base-content/30');
        element.classList.add('btn-ghost', 'border', 'border-base-content/10');
        toggle.target().visible = false;
    });
    setDirty();

    // Assembly order (bottom to top, inside to outside)
    const assemblyOrder = [
        'toggle-shelves',       // 1. Shelves
        'toggle-rails',         // 2. Rails
        'toggle-backpanel',     // 3. Back Panel
        'toggle-ledstrips',     // 4. LED Strips
        'toggle-clamps',        // 5. Clamps
        'toggle-motors',        // 6. Motors
        'toggle-dividers',      // 7. Dividers
        'toggle-spirals',       // 8. Spirals
        'toggle-wiring',        // 9. Wiring
        'toggle-motordriver',   // 10. Motor Driver
        'toggle-wheels',        // 11. Wheels
        'toggle-topbottom',     // 12. Bottom Panel
        'toggle-powerbox',      // 13. Power Box
        'toggle-collectionbin', // 14. Collection Bin
        'toggle-binflap',       // 15. Bin Flap
        'toggle-binflapborder', // 16. Flap Border
        'toggle-glass',         // 17. Glass Front
        'toggle-glassfrontborder', // 18. Glass Border
        'toggle-doorhinges',    // 19. Door Hinges
        'toggle-securitylocks', // 20. Security Locks
        'toggle-touchscreen',   // 21. Touchscreen
        'toggle-sides'          // 22. Top and Sides
    ];

    // Delay between each component (0.5 seconds)
    const delay = 500;

    // Show components sequentially
    assemblyOrder.forEach((toggleId, index) => {
        const timeoutId = setTimeout(() => {
            const toggle = menuToggles.find(t => t.id === toggleId);
            if (toggle) {
                const element = document.getElementById(toggleId);
                element.dataset.active = 'true';
                element.classList.remove('btn-ghost', 'border', 'border-base-content/10');
                element.classList.add('bg-base-content/10', 'border-base-content/30');
                toggle.target().visible = true;
                setDirty();
            }

            // Re-enable button after last component
            if (index === assemblyOrder.length - 1) {
                const finalTimeoutId = setTimeout(() => {
                    assembleButton.disabled = false;
                    assembleButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        Assemble
                    `;
                    assembleButton.dataset.active = 'false';
                    assembleButton.classList.remove('bg-base-content/20', 'border-base-content/40');
                    assembleButton.classList.add('border-base-content/20');
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

    // Generate and populate sidebar menu
    const sidebarMenu = document.getElementById('sidebar-menu');
    sidebarMenu.innerHTML = generateMenuHTML();

    // Generate and populate cut list
    const partsOverlay = document.getElementById('parts-overlay');
    partsOverlay.innerHTML = generateCutList();

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
    const canvasContainer = document.getElementById('canvas-container');
    canvasContainer.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Frame group
    frameGroup = new THREE.Group();
    scene.add(frameGroup);

    // Sides group
    sidesGroup = new THREE.Group();
    frameGroup.add(sidesGroup);

    // Top Bottom group
    topBottomGroup = new THREE.Group();
    frameGroup.add(topBottomGroup);

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

    // Motor Driver Group
    motorDriverGroup = new THREE.Group();
    frameGroup.add(motorDriverGroup);

    // LED Strips Group
    ledStripsGroup = new THREE.Group();
    frameGroup.add(ledStripsGroup);

    // Collection Bin Group
    collectionBinGroup = new THREE.Group();
    frameGroup.add(collectionBinGroup);

    // Bin Flap Group
    binFlapGroup = new THREE.Group();
    frameGroup.add(binFlapGroup);

    // Bin Flap Border Group
    binFlapBorderGroup = new THREE.Group();
    frameGroup.add(binFlapBorderGroup);

    // Glass Front Border Group
    glassFrontBorderGroup = new THREE.Group();
    frameGroup.add(glassFrontBorderGroup);

    // Door Hinges Group
    doorHingesGroup = new THREE.Group();
    frameGroup.add(doorHingesGroup);

    // Security Locks Group
    securityLocksGroup = new THREE.Group();
    frameGroup.add(securityLocksGroup);

    // Touchscreen Group
    touchscreenGroup = new THREE.Group();
    frameGroup.add(touchscreenGroup);

    // Wheels Group
    wheelsGroup = new THREE.Group();
    frameGroup.add(wheelsGroup);

    // Create materials
    materials = createMaterials();

    // Create sides
    const sides = createSides(materials);
    sidesGroup.add(...sides.children);

    // Create top and bottom
    const topBottom = createTopBottom(materials);
    topBottomGroup.add(...topBottom.children);

    // Create back panel
    const backPanel = createBackPanel(materials);
    backPanelGroup.add(...backPanel.children);

    // Create glass front
    const glassFrontGroup = createGlassFront(materials);
    glassFront = glassFrontGroup;
    frameGroup.add(glassFront);

    // Create glass front border
    const glassFrontBorder = createGlassFrontBorder(materials);
    glassFrontBorderGroup.add(...glassFrontBorder.children);

    // Create door hinges
    const hinges = createDoorHinges(materials);
    doorHingesGroup.add(hinges);

    // Create security locks
    const locks = createSecurityLocks(materials);
    securityLocksGroup.add(...locks);

    // Create touchscreen
    const touchscreen = createTouchscreen(materials);
    touchscreenGroup.add(touchscreen);

    // Create collection bin
    const binFloor = createCollectionBin(materials);
    collectionBinGroup.add(binFloor);

    // Create bin flap
    const binFlap = createBinFlap(materials);
    binFlapGroup.add(binFlap);

    // Create bin flap border
    const binFlapBorder = createBinFlapBorder(materials);
    binFlapBorderGroup.add(...binFlapBorder.children);

    // Create Power Box
    const powerBox = createPowerBox(materials);
    powerBoxGroup.add(powerBox);

    // Create Motor Driver
    const motorDriver = createMotorDriverBoard(materials);
    motorDriverGroup.add(motorDriver);

    // Create LED Strips
    const ledStrips = createLEDStrips(materials);
    ledStripsGroup.add(ledStrips);

    // Create Wiring
    const wiring = createWiring(materials);
    wiringGroup.add(wiring);

    // Create Wheels
    const wheels = createWheels(materials);
    wheelsGroup.add(wheels);

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
    const showComponentsButton = document.getElementById('show-components-button');
    const togglePause = document.getElementById('toggle-pause');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const assembleButton = document.getElementById('assemble-button');
    const toggleAllComponents = document.getElementById('toggle-all-components');
    const drawerToggle = document.getElementById('drawer-toggle');

    // Initialize slider to current camera distance (inverted scale)
    zoomSlider.value = 180 - camera.position.length();

    // Menu toggle configuration - maps toggle IDs to their target groups
    const menuToggles = [
        { id: 'toggle-sides', target: () => sidesGroup },
        { id: 'toggle-topbottom', target: () => topBottomGroup },
        { id: 'toggle-backpanel', target: () => backPanelGroup },
        { id: 'toggle-wheels', target: () => wheelsGroup },
        { id: 'toggle-shelves', target: () => shelvesGroup },
        { id: 'toggle-rails', target: () => railsGroup },
        { id: 'toggle-dividers', target: () => dividersGroup },
        { id: 'toggle-glass', target: () => glassFront },
        { id: 'toggle-glassfrontborder', target: () => glassFrontBorderGroup },
        { id: 'toggle-doorhinges', target: () => doorHingesGroup },
        { id: 'toggle-securitylocks', target: () => securityLocksGroup },
        { id: 'toggle-motors', target: () => motorsGroup },
        { id: 'toggle-clamps', target: () => clampsGroup },
        { id: 'toggle-spirals', target: () => spiralsGroup },
        { id: 'toggle-wiring', target: () => wiringGroup },
        { id: 'toggle-powerbox', target: () => powerBoxGroup },
        { id: 'toggle-collectionbin', target: () => collectionBinGroup },
        { id: 'toggle-binflap', target: () => binFlapGroup },
        { id: 'toggle-binflapborder', target: () => binFlapBorderGroup },
        { id: 'toggle-touchscreen', target: () => touchscreenGroup },
        { id: 'toggle-motordriver', target: () => motorDriverGroup },
        { id: 'toggle-ledstrips', target: () => ledStripsGroup }
    ];

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

    // Helper function to switch back to 3D view
    function switchTo3DView() {
        if (!isPartsView) return;

        // Return to 3D view
        isPartsView = false;
        renderer.domElement.style.display = 'block';
        partsOverlay.classList.remove('active');
        document.body.style.background = '';

        // Clean up floating menu button event listener
        const partsOverlayMenuBtn = document.getElementById('parts-overlay-menu-btn');
        if (partsOverlayMenuBtn && partsOverlayMenuBtn._toggleDrawerHandler) {
            partsOverlayMenuBtn.removeEventListener('click', partsOverlayMenuBtn._toggleDrawerHandler);
            delete partsOverlayMenuBtn._toggleDrawerHandler;
        }

        // Clean up cut list viewers
        cleanupCutListViewers();
        areCutListViewersReady = false;

        // Re-enable and activate frame toggles
        menuToggles.forEach(toggle => {
            const element = document.getElementById(toggle.id);
            element.dataset.active = 'true';
            element.classList.remove('btn-ghost', 'border', 'border-base-content/10');
            element.classList.add('bg-base-content/10', 'border-base-content/30');
            toggle.target().visible = true;
        });
        setDirty();

        // Update button states
        showComponentsButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Show Components
        `;
        showComponentsButton.dataset.active = 'false';
        showComponentsButton.classList.remove('bg-base-content/20', 'border-base-content/40');
        showComponentsButton.classList.add('border-base-content/20');
    }

    addTrackedListener(showComponentsButton, 'click', () => {
        if (!isPartsView) {
            // Stop any ongoing assembly animation
            stopAssembly();

            // Switch to parts view
            isPartsView = true;
            renderer.domElement.style.display = 'none';
            partsOverlay.classList.add('active');
            document.body.style.background = '#000';

            // Deactivate and hide frame toggles
            menuToggles.forEach(toggle => {
                const element = document.getElementById(toggle.id);
                element.dataset.active = 'false';
                element.classList.remove('bg-base-content/10', 'border-base-content/30');
                element.classList.add('btn-ghost', 'border', 'border-base-content/10');
                toggle.target().visible = false;
            });

            // Show loading overlay
            showPartsLoading();

            // Initialize cut list 3D viewers after next paint
            requestAnimationFrame(() => {
                initializeCutListViewers();
                // Sync rotation state with main view
                if (isPaused) {
                    pauseCutListViewers();
                }
                areCutListViewersReady = true;
                // Hide loading after a brief moment to ensure all viewers are rendered
                requestAnimationFrame(() => {
                    hidePartsLoading();
                });
            });

            // Update button states
            showComponentsButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 18l-6-6 6-6"></path>
                </svg>
                Back to 3D View
            `;
            showComponentsButton.dataset.active = 'true';
            showComponentsButton.classList.remove('border-base-content/20');
            showComponentsButton.classList.add('bg-base-content/20', 'border-base-content/40');

            // Deactivate assemble button
            assembleButton.dataset.active = 'false';
            assembleButton.classList.remove('bg-base-content/20', 'border-base-content/40');
            assembleButton.classList.add('border-base-content/20');

            // Add event listener for floating menu button (created dynamically)
            requestAnimationFrame(() => {
                const partsOverlayMenuBtn = document.getElementById('parts-overlay-menu-btn');
                if (partsOverlayMenuBtn) {
                    const toggleDrawer = () => {
                        drawerToggle.click();
                    };
                    partsOverlayMenuBtn.addEventListener('click', toggleDrawer);
                    // Store the handler for cleanup
                    partsOverlayMenuBtn._toggleDrawerHandler = toggleDrawer;
                }
            });
        } else {
            switchTo3DView();
        }
    });

    // Mapping between toggle buttons and component viewers
    const toggleToComponentMap = {
        'toggle-sides': 'viewer-sides',
        'toggle-topbottom': 'viewer-top-bottom',
        'toggle-backpanel': 'viewer-back',
        'toggle-shelves': 'viewer-shelf',
        'toggle-rails': 'viewer-rails',
        'toggle-dividers': 'viewer-dividers',
        'toggle-glass': 'viewer-glass',
        'toggle-glassfrontborder': 'viewer-glassfrontborder',
        'toggle-motors': 'viewer-motor',
        'toggle-clamps': 'viewer-clamps',
        'toggle-spirals': 'viewer-spirals',
        'toggle-wiring': 'viewer-wiring',
        'toggle-powerbox': 'viewer-powerbox',
        'toggle-collectionbin': 'viewer-bin',
        'toggle-binflap': 'viewer-binflap',
        'toggle-binflapborder': 'viewer-binflapborder',
        'toggle-wheels': 'viewer-wheels',
        'toggle-touchscreen': 'viewer-touchscreen',
        'toggle-doorhinges': 'viewer-doorhinges',
        'toggle-securitylocks': 'viewer-securitylocks',
        'toggle-motordriver': 'viewer-motordriver',
        'toggle-ledstrips': 'viewer-ledstrips'
    };

    // Setup visibility toggles dynamically
    menuToggles.forEach(toggle => {
        const element = document.getElementById(toggle.id);
        addTrackedListener(element, 'click', (e) => {
            // If in parts view, scroll to the corresponding component
            if (isPartsView) {
                const componentId = toggleToComponentMap[toggle.id];
                if (componentId) {
                    const componentElement = document.getElementById(componentId);
                    if (componentElement) {
                        componentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
                return; // Don't toggle visibility in parts view
            }

            // Toggle button state
            const isActive = element.dataset.active === 'true';
            const newActive = !isActive;
            element.dataset.active = newActive;

            // Update button styling
            if (newActive) {
                element.classList.remove('btn-ghost', 'border', 'border-base-content/10');
                element.classList.add('bg-base-content/10', 'border-base-content/30');
            } else {
                element.classList.remove('bg-base-content/10', 'border-base-content/30');
                element.classList.add('btn-ghost', 'border', 'border-base-content/10');
            }

            // Lazy load motors if needed
            const motorRelatedIds = ['toggle-motors', 'toggle-clamps', 'toggle-spirals'];
            if (motorRelatedIds.includes(toggle.id) && newActive) {
                ensureMotorsCreated();
            }

            toggle.target().visible = newActive;
            setDirty();
        });
        // Initialize visibility based on button state
        // For motor-related components, create them first if they're active on load
        const motorRelatedIds = ['toggle-motors', 'toggle-clamps', 'toggle-spirals'];
        const isActive = element.dataset.active === 'true';
        if (motorRelatedIds.includes(toggle.id) && isActive) {
            ensureMotorsCreated();
        }
        toggle.target().visible = isActive;
    });

    // Helper function to toggle play/pause
    function togglePlayPause() {
        isPaused = !isPaused;
        const isPlaying = !isPaused;

        // Update button state
        togglePause.dataset.playing = isPlaying;

        // Toggle icon visibility
        const pauseIcon = document.getElementById('pause-icon');
        const playIcon = document.getElementById('play-icon');
        if (isPlaying) {
            pauseIcon.style.display = 'block';
            playIcon.style.display = 'none';
            // Resume cutlist viewers rotation
            playCutListViewers();
        } else {
            pauseIcon.style.display = 'none';
            playIcon.style.display = 'block';
            // Pause cutlist viewers rotation
            pauseCutListViewers();
        }

        setDirty();
    }

    addTrackedListener(togglePause, 'click', togglePlayPause);

    // Spacebar to toggle play/pause (except when typing in inputs)
    addTrackedListener(document, 'keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ') {
            const activeElement = document.activeElement;
            const isTyping = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable
            );

            if (!isTyping) {
                e.preventDefault();
                togglePlayPause();
            }
        }
    });

    // Toggle all components handler
    addTrackedListener(toggleAllComponents, 'change', (e) => {
        const showAll = e.target.checked;

        menuToggles.forEach(toggle => {
            const element = document.getElementById(toggle.id);
            element.dataset.active = showAll;

            // Update button styling
            if (showAll) {
                element.classList.remove('btn-ghost', 'border', 'border-base-content/10');
                element.classList.add('bg-base-content/10', 'border-base-content/30');
            } else {
                element.classList.remove('bg-base-content/10', 'border-base-content/30');
                element.classList.add('btn-ghost', 'border', 'border-base-content/10');
            }

            // Lazy load motors if needed
            const motorRelatedIds = ['toggle-motors', 'toggle-clamps', 'toggle-spirals'];
            if (motorRelatedIds.includes(toggle.id) && showAll) {
                ensureMotorsCreated();
            }

            toggle.target().visible = showAll;
        });

        setDirty();
    });

    // Assemble button
    addTrackedListener(assembleButton, 'click', () => {
        // If in parts view, switch back to 3D view first
        if (isPartsView) {
            switchTo3DView();
        }

        // Close drawer on mobile/tablet (when screen width < 1024px lg breakpoint)
        if (window.innerWidth < 1024) {
            drawerToggle.checked = false;
        }

        // Update button states
        assembleButton.dataset.active = 'true';
        assembleButton.classList.remove('border-base-content/20');
        assembleButton.classList.add('bg-base-content/20', 'border-base-content/40');

        showComponentsButton.dataset.active = 'false';
        showComponentsButton.classList.remove('bg-base-content/20', 'border-base-content/40');
        showComponentsButton.classList.add('border-base-content/20');

        // Start assembly animation
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
