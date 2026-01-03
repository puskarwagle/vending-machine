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
            id: 'top-bottom',
            title: 'Top & Bottom Panels',
            qty: 2,
            dimensions: `${width}" × ${depth}" × ${thickness}"`,
            material: 'Plywood',
            description: 'Frame top and bottom'
        },
        {
            id: 'sides',
            title: 'Side Panels',
            qty: 2,
            dimensions: `${thickness}" × ${height}" × ${depth}"`,
            material: 'Plywood',
            description: 'Frame left and right sides'
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
            dimensions: `${shelfWidth}" × ${shelfDepth}" shelf + ${shelfWidth}" × ${backplateHeight}" backplate + ${CONFIG.grid.cols - 1} dividers`,
            material: 'Plywood',
            description: `Horizontal shelf with vertical backplate and ${CONFIG.grid.cols - 1} dividers per shelf`
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
            id: 'motor',
            title: 'Motor Assembly',
            qty: CONFIG.grid.rows * CONFIG.grid.cols,
            dimensions: `Motor: ${CONFIG.motor.radius * 2}" dia × ${CONFIG.motor.length}"L, Spiral: ${CONFIG.spiral.length}"L`,
            material: 'Motor + Bracket + Steel Coil',
            description: 'Complete dispensing mechanism'
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
        }
    ];

    // Generate HTML for component list
    let html = `
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
                { id: 'toggle-topbottomsides', label: 'Top Bottom Sides', checked: true },
                { id: 'toggle-backpanel', label: 'Back Panel', checked: true }
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
                { id: 'toggle-wiring', label: 'Wiring', checked: true },
                { id: 'toggle-powerbox', label: 'Power Box', checked: true },
                { id: 'toggle-collectionbin', label: 'Collection Bin', checked: true }
            ]
        }
    ];

    let html = `
        <ul class="menu w-full grow p-2 gap-1">
            <!-- View Controls Section -->
            <li class="menu-title text-base-content/60 text-xs font-semibold uppercase tracking-wider px-4 py-2">View Controls</li>

            <!-- Zoom Control -->
            <li class="px-2 py-2">
                <div class="flex flex-col gap-2">
                    <label class="text-xs text-base-content/70">Zoom</label>
                    <div class="flex items-center gap-2">
                        <button id="zoom-out" class="btn btn-xs btn-square btn-ghost">−</button>
                        <input type="range" id="zoom-slider" min="30" max="150" value="70" class="range range-xs flex-1" />
                        <button id="zoom-in" class="btn btn-xs btn-square btn-ghost">+</button>
                    </div>
                </div>
            </li>

            <!-- Pause Toggle -->
            <li class="px-2">
                <label class="label cursor-pointer justify-start gap-3 py-2">
                    <input type="checkbox" id="toggle-pause" class="toggle toggle-sm" />
                    <span class="label-text text-sm">Pause & Front View</span>
                </label>
            </li>

            <li><div class="divider my-1"></div></li>

            <!-- Actions Section -->
            <li class="menu-title text-base-content/60 text-xs font-semibold uppercase tracking-wider px-4 py-2">Actions</li>
            <li class="px-2 py-1">
                <div class="flex flex-wrap gap-2">
                    <button id="assemble-button" class="flex-1 basis-[calc(50%-0.25rem)] btn btn-sm btn-neutral h-10" data-active="false">Assemble</button>
                    <button id="show-components-button" class="flex-1 basis-[calc(50%-0.25rem)] btn btn-sm btn-neutral h-10" data-active="false">Show Components</button>
                </div>
            </li>

            <li><div class="divider my-1"></div></li>

            <!-- Component Visibility Section -->
            <li class="menu-title text-base-content/60 text-xs font-semibold uppercase tracking-wider px-4 py-2">Components</li>
    `;

    // Generate groups
    toggleGroups.forEach(group => {
        html += `
            <li>
                <details open class="collapse collapse-arrow bg-base-200 rounded-lg p-0" style="pointer-events: none;">
                    <summary class="collapse-title min-h-0 py-2 px-3 text-sm font-medium" style="opacity: 0; height: 0; min-height: 0; padding: 0; margin: 0; position: absolute;">hidden</summary>
                    <div class="py-2 px-3 text-sm font-medium">${group.title}</div>
                    <div class="collapse-content px-2 pb-2" style="pointer-events: auto;">
                        <div class="flex flex-wrap gap-2">
        `;

        group.toggles.forEach(toggle => {
            html += `
                            <button
                                id="${toggle.id}"
                                class="component-toggle-btn flex-1 basis-[calc(50%-0.25rem)] btn btn-sm ${toggle.checked ? 'btn-primary' : 'btn-outline'}"
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
            <li><div class="divider my-1"></div></li>

            <li class="bg-base-200 rounded-lg p-0 w-full">
                <div class="py-2 px-3 text-sm font-medium">Dimensions</div>
                <div class="px-3 pb-2 w-full">
                    <div class="text-xs space-y-1">
                        ${dimensionsContent}
                    </div>
                </div>
            </li>
        </ul>
    `;

    return html;
}
