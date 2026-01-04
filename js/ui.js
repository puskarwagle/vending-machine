import { CONFIG } from './config.js';

// Generate dimensions display dynamically from CONFIG
export function generateDimensionsDisplay() {
    const { width, height, depth } = CONFIG.frame;
    const widthCm = (width * 2.54).toFixed(0);
    const heightCm = (height * 2.54).toFixed(0);
    const depthCm = (depth * 2.54).toFixed(0);
    const widthFt = (width / 12).toFixed(0);
    const heightFt = (height / 12).toFixed(0);
    const depthFt = (depth / 12).toFixed(0);
    const widthM = (width * 0.0254).toFixed(2);
    const heightM = (height * 0.0254).toFixed(2);
    const depthM = (depth * 0.0254).toFixed(2);

    return `
        <div class="dimension-row">
            <span class="dimension-label">Width:</span>
            <span class="dimension-value">${width}" / ${widthCm}cm / ${widthFt}ft / ${widthM}m</span>
        </div>
        <div class="dimension-row">
            <span class="dimension-label">Height:</span>
            <span class="dimension-value">${height}" / ${heightCm}cm / ${heightFt}ft / ${heightM}m</span>
        </div>
        <div class="dimension-row">
            <span class="dimension-label">Depth:</span>
            <span class="dimension-value">${depth}" / ${depthCm}cm / ${depthFt}ft / ${depthM}m</span>
        </div>
    `;
}

// Generate cut list dynamically from CONFIG
export function generateCutList() {
    const { width, height, depth, thickness } = CONFIG.frame;
    const shelfWidth = width;
    const shelfDepth = CONFIG.shelves.depth;
    const backplateHeight = CONFIG.shelves.backplateHeight;

    // Component data
    const components = [
        {
            id: 'sides',
            title: 'Side Panels',
            qty: 2,
            dimensions: `${thickness}" × ${height}" × ${depth}"`,
            material: 'Plywood',
            description: 'Frame left and right sides'
        },
        {
            id: 'top-bottom',
            title: 'Top & Bottom Panels',
            qty: 2,
            dimensions: `${width}" × ${depth}" × ${thickness}"`,
            material: 'Plywood',
            description: 'Frame top and bottom'
        },
        {
            id: 'back',
            title: 'Back Panel',
            qty: 1,
            dimensions: `${width}" × ${height}" × ${thickness}"`,
            material: 'Plywood',
            description: 'Frame back wall'
        },
        {
            id: 'shelf',
            title: 'Shelf Assembly',
            qty: CONFIG.grid.rows,
            dimensions: `${shelfWidth}" × ${shelfDepth}" shelf + ${shelfWidth}" × ${backplateHeight}" backplate`,
            material: 'Plywood',
            description: `Horizontal shelf with vertical backplate per row`
        },
        {
            id: 'dividers',
            title: 'Dividers',
            qty: CONFIG.grid.rows * (CONFIG.grid.cols - 1),
            dimensions: `${CONFIG.frame.thickness}" × ${CONFIG.dividers.height}" × ${CONFIG.shelves.depth - CONFIG.shelves.backplateThickness}"`,
            material: 'Plywood',
            description: `Vertical dividers to separate product slots`
        },
        {
            id: 'rails',
            title: 'Rail Pairs',
            qty: CONFIG.grid.rows,
            dimensions: `${CONFIG.rails.width}" × ${CONFIG.rails.height}" × ${shelfDepth}"`,
            material: 'Metal',
            description: 'Left and right rails per shelf'
        },
        {
            id: 'glass',
            title: 'Glass Front',
            qty: 1,
            dimensions: `${width}" × ${CONFIG.grid.rows * CONFIG.slot.height}" × ${CONFIG.glass.thickness}"`,
            material: 'Acrylic/Glass',
            description: 'Transparent front panel'
        },
        {
            id: 'glassfrontborder',
            title: 'Glass Front Border',
            qty: 1,
            dimensions: `Frame with 1.5" thick aluminum borders`,
            material: 'Aluminum',
            description: 'Border frame for glass front door'
        },
        {
            id: 'motor',
            title: 'Motors',
            qty: CONFIG.grid.rows * CONFIG.grid.cols,
            dimensions: `${CONFIG.motor.radius * 2}" dia × ${CONFIG.motor.length}"L`,
            material: 'DC Motor',
            description: 'Electric motors for dispensing mechanism'
        },
        {
            id: 'clamps',
            title: 'Motor Clamps',
            qty: CONFIG.grid.rows * CONFIG.grid.cols,
            dimensions: `${CONFIG.bracket.width}" × ${CONFIG.bracket.height}" × ${CONFIG.bracket.thickness}"`,
            material: 'Metal Bracket',
            description: 'Mounting brackets to hold motors'
        },
        {
            id: 'spirals',
            title: 'Spiral Coils',
            qty: CONFIG.grid.rows * CONFIG.grid.cols,
            dimensions: `${CONFIG.spiral.radius * 2}" dia × ${CONFIG.spiral.length}"L`,
            material: 'Steel Coil',
            description: 'Spiral dispensing mechanism'
        },
        {
            id: 'bin',
            title: 'Collection Bin',
            qty: 1,
            dimensions: `${width}" × ${thickness}" × ${depth - 6}"`,
            material: 'Plywood',
            description: 'Slanted floor for item collection'
        },
        {
            id: 'binflap',
            title: 'Bin Flap',
            qty: 1,
            dimensions: `${width - 4}" × variable height × ${CONFIG.glass.thickness}"`,
            material: 'Acrylic/Glass',
            description: 'Front access flap for collection bin'
        },
        {
            id: 'binflapborder',
            title: 'Bin Flap Border',
            qty: 1,
            dimensions: `Frame with 1.5" thick aluminum borders`,
            material: 'Aluminum',
            description: 'Border frame for bin flap'
        },
        {
            id: 'powerbox',
            title: 'Power Box',
            qty: 1,
            dimensions: `${CONFIG.powerbox.width}" × ${CONFIG.powerbox.height}" × ${CONFIG.powerbox.depth}"`,
            material: 'Metal Enclosure',
            description: 'Electrical control box'
        },
        {
            id: 'wiring',
            title: 'Wiring System',
            qty: 1,
            dimensions: 'Main trunk + distribution to all motors',
            material: 'Electrical wire',
            description: 'Complete power distribution'
        },
        {
            id: 'wheels',
            title: 'Wheels',
            qty: 4,
            dimensions: `${1 * 2}" dia × ${0.75}" thick`,
            material: 'Metal/Rubber',
            description: 'Corner-mounted caster wheels for mobility'
        }
    ];

    // Generate HTML for component list
    let html = `
        <!-- Floating menu button for mobile -->
        <button id="parts-overlay-menu-btn" aria-label="open menu">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="inline-block" style="width: 24px; height: 24px;">
                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                <path d="M9 4v16"></path>
                <path d="M14 10l2 2l-2 2"></path>
            </svg>
        </button>
        <div class="component-list" id="component-list">
    `;

    components.forEach((comp, index) => {
        const layoutClass = index % 2 === 0 ? 'layout-left' : 'layout-right';
        html += `
            <div class="component-item ${layoutClass}">
                <div class="component-viewer" id="viewer-${comp.id}">
                    <canvas id="canvas-${comp.id}"></canvas>
                </div>
                <div class="component-card">
                    <h3 class="component-title">${comp.title}</h3>
                    <div class="component-specs">
                        <div class="spec-row">
                            <span class="spec-label">Quantity:</span>
                            <span class="spec-value">${comp.qty}</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-label">Dimensions:</span>
                            <span class="spec-value">${comp.dimensions}</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-label">Material:</span>
                            <span class="spec-value">${comp.material}</span>
                        </div>
                        <div class="component-description">${comp.description}</div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
        </div>
    `;

    return html;
}

// Generate menu controls HTML for DaisyUI drawer
export function generateMenuHTML() {
    // Define toggle groups with their components
    const toggleGroups = [
        {
            id: 'structure-group',
            title: 'Structure',
            toggles: [
                { id: 'toggle-topbottom', label: 'Top & Bottom', checked: true },
                { id: 'toggle-sides', label: 'Sides', checked: true },
                { id: 'toggle-backpanel', label: 'Back Panel', checked: true },
                { id: 'toggle-wheels', label: 'Wheels', checked: true }
            ]
        },
        {
            id: 'shelving-group',
            title: 'Shelving System',
            toggles: [
                { id: 'toggle-shelves', label: 'Shelves', checked: true },
                { id: 'toggle-rails', label: 'Rails', checked: true },
                { id: 'toggle-dividers', label: 'Dividers', checked: true }
            ]
        },
        {
            id: 'mechanisms-group',
            title: 'Mechanisms',
            toggles: [
                { id: 'toggle-motors', label: 'Motors', checked: true },
                { id: 'toggle-clamps', label: 'Clamps', checked: true },
                { id: 'toggle-spirals', label: 'Spirals', checked: true }
            ]
        },
        {
            id: 'additional-group',
            title: 'Additional Parts',
            toggles: [
                { id: 'toggle-glass', label: 'Glass Front', checked: false },
                { id: 'toggle-glassfrontborder', label: 'Glass Border', checked: true },
                { id: 'toggle-wiring', label: 'Wiring', checked: true },
                { id: 'toggle-powerbox', label: 'Power Box', checked: true },
                { id: 'toggle-collectionbin', label: 'Collection Bin', checked: true },
                { id: 'toggle-binflap', label: 'Bin Flap', checked: true },
                { id: 'toggle-binflapborder', label: 'Flap Border', checked: true }
            ]
        }
    ];

    let html = `
        <ul class="menu w-full grow p-2 gap-1">
            <!-- View Controls Section -->
            <!-- Zoom Control -->
            <li class="px-2 py-2">
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                        <button id="zoom-out" class="btn btn-xs btn-square btn-ghost">−</button>
                        <input type="range" id="zoom-slider" min="30" max="150" value="70" class="range range-xs flex-1" />
                        <button id="zoom-in" class="btn btn-xs btn-square btn-ghost">+</button>
                    </div>
                </div>
            </li>

            <!-- Play/Pause Button -->
            <li class="px-2">
                <button id="toggle-pause" class="flex justify-center items-center w-full py-3 transition-opacity hover:opacity-60 cursor-pointer" data-playing="true">
                    <svg id="pause-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                    <svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                </button>
            </li>

            <li><div class="divider my-2"></div></li>

            <!-- Actions Section -->
            <li class="px-2 py-1">
                <div class="flex flex-col gap-2">
                    <button id="assemble-button" class="btn btn-md btn-ghost border border-base-content/20 hover:border-base-content/40 w-full" data-active="false">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        Assemble
                    </button>
                    <button id="show-components-button" class="btn btn-md btn-ghost border border-base-content/20 hover:border-base-content/40 w-full" data-active="false">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Show Components
                    </button>
                </div>
            </li>

            <li><div class="divider my-2"></div></li>

            <!-- Component Visibility Section -->
            <li class="px-4 pt-1 pb-2">
                <div class="flex items-center justify-between">
                    <div class="text-sm font-bold text-base-content/90">Components</div>
                    <input type="checkbox" id="toggle-all-components" class="toggle toggle-sm" checked />
                </div>
            </li>
    `;

    // Generate groups
    toggleGroups.forEach(group => {
        html += `
            <li>
                <details open class="collapse collapse-arrow bg-base-200/50 rounded-lg p-0" style="pointer-events: none;">
                    <summary class="collapse-title min-h-0 py-2 px-3 text-sm font-medium" style="opacity: 0; height: 0; min-height: 0; padding: 0; margin: 0; position: absolute;">hidden</summary>
                    <div class="py-2 px-3 text-xs font-semibold text-base-content/50 uppercase tracking-wide">${group.title}</div>
                    <div class="collapse-content px-2 pb-2" style="pointer-events: auto;">
                        <div class="flex flex-wrap gap-2">
        `;

        group.toggles.forEach(toggle => {
            html += `
                            <button
                                id="${toggle.id}"
                                class="component-toggle-btn flex-1 basis-[calc(50%-0.25rem)] btn btn-sm ${toggle.checked ? 'bg-base-content/10 border-base-content/30' : 'btn-ghost border border-base-content/10'} hover:bg-base-content/20"
                                data-active="${toggle.checked}"
                            >
                                ${toggle.label}
                            </button>
            `;
        });

        html += `
                        </div>
                    </div>
                </details>
            </li>
        `;
    });

    // Dimensions section
    const dimensionsContent = generateDimensionsDisplay();
    html += `
            <li><div class="divider my-2"></div></li>

            <li class="bg-base-200/50 rounded-lg p-0 w-full">
                <div class="py-2 px-3 text-xs font-semibold text-base-content/50 uppercase tracking-wide">Dimensions</div>
                <div class="px-3 pb-2 w-full">
                    <div class="text-xs space-y-1 text-base-content/70">
                        ${dimensionsContent}
                    </div>
                </div>
            </li>
        </ul>
    `;

    return html;
}
