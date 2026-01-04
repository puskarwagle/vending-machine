# Vending Machine Visualizer

A comprehensive 3D interactive visualizer for planning the construction of a vending machine frame. This project uses Three.js to render a detailed, rotatable, and zoomable model of the vending machine, allowing users to inspect every component, from the plywood frame to the wiring and motors.

## Key Features

*   **Interactive 3D Model:** Full 360-degree rotation, zoom, and pan capabilities.
*   **Modular Visibility Controls:** Toggle the visibility of individual components (sides, shelves, motors, wiring, etc.) to inspect internal details.
*   **Assembly Animation:** An automated animation sequence that builds the machine piece by piece, demonstrating the assembly order.
*   **Detailed Cut List:** A dedicated view showing each component individually with dimensions, quantities, and material specifications.
*   **Mini 3D Viewers:** The cut list includes interactive mini 3D scenes for each specific part.
*   **Mobile Responsive:** Touch controls for rotation and pinch-to-zoom, with a responsive UI layout.

## Vending Machine Components

The visualizer breaks down the machine into logical parts, each modeled with realistic dimensions and textures:

*   **External Frame:** Includes the side panels, top, bottom, and back. These are the primary structural elements made of plywood.
*   **Shelving System:**
    *   **Shelves:** Horizontal platforms with a vertical backplate to prevent items from falling behind.
    *   **Rails:** Metal supports that allow the shelves to slide or stay securely in place.
    *   **Dividers:** Vertical panels that create individual product slots (3 columns per row).
*   **Dispensing Mechanisms:**
    *   **Motors:** DC motors mounted on brackets at the back of each slot.
    *   **Brackets:** Secure the motors to the shelf's vertical backplate.
    *   **Spirals:** Steel coils connected to the motors that rotate to push products forward.
*   **Collection Area:**
    *   **Collection Bin:** A slanted plywood floor at the bottom that guides dispensed items toward the front.
    *   **Bin Flap & Border:** A transparent acrylic flap with an aluminum border for user access to the dispensed items.
*   **Glass Door:** A large transparent front panel with a structural aluminum border, allowing users to see the inventory.
*   **Electronics:**
    *   **Power Box:** A central enclosure at the bottom for the main control board and power supply.
    *   **Wiring System:** A detailed model of the electrical distribution, featuring a vertical main trunk and flexible "service loops" for each shelf to allow for maintenance and shelf movement. It includes color-coded wires for Power (+/-) and Control signals.
*   **Mobility:** Four caster wheels mounted at the corners of the bottom panel.

## Menu & Controls

The sidebar menu (built with DaisyUI) provides powerful tools to interact with the model:

### View Controls
*   **Zoom:** Use the slider or the `+`/`-` buttons to get a closer look. You can also use the mouse wheel (Shift + Scroll) or pinch-to-zoom on touch devices.
*   **Play/Pause:** Toggles the slow auto-rotation of the model. This can also be controlled using the **Spacebar**.

### Actions
*   **Assemble Button:** Triggers a scripted animation that clears the scene and rebuilds the machine part-by-part from the inside out. This is useful for understanding the construction sequence.
*   **Show Components Button:** Switches the entire application to the "Cut List" view. 
    *   In this view, the main 3D model is replaced by a vertical list of individual parts.
    *   Each part has its own **mini 3D viewer** that can be rotated independently.
    *   Clicking the button again returns you to the main 3D scene.

### Component Visibility
The "Components" section is organized into collapsible groups:
*   **Structure:** Frame panels and wheels.
*   **Shelving System:** Shelves, rails, and dividers.
*   **Mechanisms:** Motors, clamps, and spirals.
*   **Additional Parts:** Glass front, wiring, power box, and collection bin.

**Interactive Feature:** When in the "Show Components" view, clicking any component toggle in the menu will automatically scroll the page to that specific part's entry in the list.

### Dimensions
Displays the real-time calculated dimensions of the machine in **Inches**, **Centimeters**, **Feet**, and **Meters**, synced directly from the `config.js` file.

## File Structure & Detailed Description

### Core Files

#### `index.html`
The main entry point of the application.
*   **Structure:** Sets up the layout including the main 3D canvas container, the sidebar menu (using DaisyUI drawer), and the overlay for the component list.
*   **Loading States:** Includes HTML for "Main Loading" and "Parts Loading" overlays to provide feedback during asset initialization.
*   **Styles:** Contains critical inline CSS for immediate rendering (preventing FOUC) and imports the main script module.

#### `css/style.css`
Contains custom styling for the application.
*   **Loading Overlays:** Styles for the loading spinners and transitions.
*   **UI Components:** Custom styling for the floating menu, zoom controls, and toggle buttons.
*   **Component List:** Defines the layout for the cut list view, specifically the `component-item` classes which handle the alternating text/canvas layout (`layout-left`, `layout-right`) and the component card styling.
*   **Responsiveness:** Handles layout adjustments for different screen sizes.

### JavaScript Modules (`js/`)

The application logic is modularized into several ES6 modules:

#### `js/config.js`
The central configuration file.
*   **Purpose:** Stores all dimensions, measurements, and constants in a single `CONFIG` object.
*   **Content:** Defines dimensions for the frame, grid (rows/cols), slots, shelves, wiring, rails, glass, and motors. Changing values here automatically updates the entire 3D model and the calculated dimensions in the UI.

#### `js/utils.js`
Utility helper functions.
*   **Purpose:** Provides calculations for positioning components based on the `CONFIG`.
*   **Functions:**
    *   `getShelfY(rowIndex)`: Calculates the vertical position of a shelf.
    *   `getBackZ()`: Calculates the Z-position for the back of the shelves, accounting for wiring gaps.
    *   `getSlotCenter(row, col)`: Returns the exact `{x, y, z}` coordinates for the center of a product slot.

#### `js/materials.js`
Material definition and texture loading.
*   **Purpose:** Creates and exports Three.js materials used throughout the scene.
*   **Details:** Loads textures (plywood, metal, etc.) and defines materials like `plywood`, `glass` (transparent), `rail` (metallic), `motor`, and `wiring` (colored basic materials).

#### `js/components.js`
3D Component Factory.
*   **Purpose:** Contains functions to generate the geometries and meshes for every part of the machine.
*   **Exports:** Functions like `createBackPanel`, `createShelves`, `createMotorAssembly`, `createWiring`, `createPowerBox`, etc. Each function returns a `THREE.Group` or `THREE.Mesh` ready to be added to the scene.

#### `js/ui.js`
User Interface Generator.
*   **Purpose:** Dynamically generates HTML content for the UI.
*   **Functions:**
    *   `generateMenuHTML()`: Builds the sidebar menu with collapsible groups and toggle buttons.
    *   `generateCutList()`: Constructs the detailed list of parts, calculating dimensions dynamically from `CONFIG`. It creates the structure for the mini 3D viewers in the parts view.
    *   `generateDimensionsDisplay()`: formats and displays the overall machine dimensions.

#### `js/cutlist-viewers.js`
Mini 3D Viewer Manager.
*   **Purpose:** Manages the independent Three.js scenes used in the "Show Components" view.
*   **Functionality:**
    *   `initializeCutListViewers()`: Creates a separate scene, camera, and renderer for each item in the cut list.
    *   **Interaction:** Handles independent rotation and zoom for each mini-viewer.
    *   **Performance:** Manages the animation loop for these viewers and handles cleanup (`cleanupCutListViewers`) to free resources when switching back to the main view.

#### `js/main.js`
The Application Controller.
*   **Purpose:** Orchestrates the entire application.
*   **Responsibilities:**
    *   **Initialization:** Sets up the main Three.js scene, camera, renderer, and lights.
    *   **Scene Building:** Calls functions from `components.js` to build the full model and adds them to the scene groups.
    *   **Interaction:** Implements the main orbit controls (mouse drag to rotate, scroll to zoom) and touch gestures.
    *   **State Management:** Handles switching between "3D View" and "Component View", toggling visibility of groups (using the UI toggles), and managing the "Assemble" animation.
    *   **Optimization:** Implements lazy loading for complex parts (like motors) and uses a dirty-flag render loop to save battery/performance when the model is static.

## Setup & Usage

1.  **Clone the repository.**
2.  **Serve the files:** Because the project uses ES modules, you must serve it using a local web server (e.g., VS Code Live Server, `python3 -m http.server`, `npx serve`).
    *   *Note: Opening `index.html` directly via `file://` protocol will result in CORS errors due to module imports.*
3.  **Open in Browser:** Navigate to the local server address (e.g., `http://localhost:5500`).

## Development

To make changes to dimensions:
1.  Open `js/config.js`.
2.  Update the values in the `CONFIG` object.
3.  Refresh the browser to see the 3D model and cut list dimensions update automatically.
