// Generate dimensions display dynamically from CONFIG
function generateDimensionsDisplay() {
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
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 13px;">Dimensions</div>
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
function generateCutList() {
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
