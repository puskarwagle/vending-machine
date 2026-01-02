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
    const { width, height, depth } = CONFIG.frame;
    const widthFt = (width / 12).toFixed(0);
    const heightFt = (height / 12).toFixed(0);
    const depthFt = (depth / 12).toFixed(0);

    return `
        <div class="parts-layout">
            <div class="parts-row">
                <div class="panel panel-2x2">
                    <div class="panel-label">Top</div>
                    <div class="dim-label dim-width">${widthFt}ft</div>
                    <div class="dim-label dim-height">${depthFt}ft</div>
                </div>
                <div class="panel panel-2x2">
                    <div class="panel-label">Bottom</div>
                    <div class="dim-label dim-width">${widthFt}ft</div>
                    <div class="dim-label dim-height">${depthFt}ft</div>
                </div>
            </div>
            <div class="parts-row">
                <div class="panel panel-2x5">
                    <div class="panel-label">Back</div>
                    <div class="dim-label dim-width">${widthFt}ft</div>
                    <div class="dim-label dim-height">${heightFt}ft</div>
                </div>
                <div class="panel panel-2x5">
                    <div class="panel-label">Side</div>
                    <div class="dim-label dim-width">${depthFt}ft</div>
                    <div class="dim-label dim-height">${heightFt}ft</div>
                </div>
                <div class="panel panel-2x5">
                    <div class="panel-label">Side</div>
                    <div class="dim-label dim-width">${depthFt}ft</div>
                    <div class="dim-label dim-height">${heightFt}ft</div>
                </div>
            </div>
            <div class="parts-row">
                <div class="panel-label" style="margin: 20px 0; font-weight: bold;">
                    Shelves: ${CONFIG.grid.rows} @ ${widthFt}ft × ${(CONFIG.shelves.depth / 12).toFixed(1)}ft
                </div>
            </div>
            <div class="parts-row">
                <div class="panel-label" style="margin: 20px 0; font-weight: bold;">
                    Dividers: ${CONFIG.grid.rows * (CONFIG.grid.cols - 1)} @ ${(CONFIG.dividers.height / 12).toFixed(1)}ft × ${(CONFIG.shelves.depth / 12).toFixed(1)}ft
                </div>
            </div>
        </div>
    `;
}
