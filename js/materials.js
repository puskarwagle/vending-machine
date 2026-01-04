import * as THREE from 'three';

// Create all materials
export function createMaterials() {
    const textureLoader = new THREE.TextureLoader();

    // Load textures
    const plywoodTexture = textureLoader.load('images/plywood.jpg');
    plywoodTexture.wrapS = THREE.RepeatWrapping;
    plywoodTexture.wrapT = THREE.RepeatWrapping;

    const plywoodSideTexture = textureLoader.load('images/plywood-side.jpg');
    plywoodSideTexture.wrapS = THREE.RepeatWrapping;
    plywoodSideTexture.wrapT = THREE.RepeatWrapping;

    const plywoodPanelTexture = textureLoader.load('images/plywood-3.jpg');
    plywoodPanelTexture.wrapS = THREE.RepeatWrapping;
    plywoodPanelTexture.wrapT = THREE.RepeatWrapping;

    const plywood4Texture = textureLoader.load('public/images/plywood-4.jpg');
    plywood4Texture.wrapS = THREE.RepeatWrapping;
    plywood4Texture.wrapT = THREE.RepeatWrapping;

    return {
        plywood: new THREE.MeshPhongMaterial({
            map: plywoodTexture,
            side: THREE.DoubleSide
        }),
        plywoodSide: new THREE.MeshPhongMaterial({
            map: plywoodSideTexture,
            side: THREE.DoubleSide
        }),
        plywoodPanel: new THREE.MeshPhongMaterial({
            map: plywoodPanelTexture,
            side: THREE.DoubleSide
        }),
        plywood4: new THREE.MeshPhongMaterial({
            map: plywood4Texture,
            side: THREE.DoubleSide
        }),
        edge: new THREE.MeshPhongMaterial({
            color: 0x8b6f47
        }),
        glass: new THREE.MeshPhongMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            shininess: 100
        }),
        rail: new THREE.MeshStandardMaterial({
            color: 0x777777,
            roughness: 0.6,
            metalness: 0.6
        }),
        motor: new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 30
        }),
        bracket: new THREE.MeshPhongMaterial({
            color: 0x666666,
            shininess: 20
        }),
        spiral: new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.2,
            metalness: 0.8
        }),
        aluminumBracket: new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            roughness: 0.4,
            metalness: 0.7
        }),
        screen: new THREE.MeshPhongMaterial({
            color: 0x111111,
            shininess: 100,
            specular: 0x222222
        }),
        pcb: new THREE.MeshStandardMaterial({
            color: 0x0066cc,
            roughness: 0.7,
            metalness: 0.3
        }),
        lock: new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.5,
            metalness: 0.7
        }),
        led: new THREE.MeshStandardMaterial({
            color: 0xffffaa,
            emissive: 0xffffaa,
            emissiveIntensity: 0.8
        }),
        plastic: new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            shininess: 70
        })
    };
}
