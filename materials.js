// Create all materials
function createMaterials() {
    const textureLoader = new THREE.TextureLoader();

    // Load textures
    const plywoodTexture = textureLoader.load('plywood.jpg');
    plywoodTexture.wrapS = THREE.RepeatWrapping;
    plywoodTexture.wrapT = THREE.RepeatWrapping;

    const plywoodSideTexture = textureLoader.load('plywood-side.jpg');
    plywoodSideTexture.wrapS = THREE.RepeatWrapping;
    plywoodSideTexture.wrapT = THREE.RepeatWrapping;

    return {
        plywood: new THREE.MeshPhongMaterial({
            map: plywoodTexture,
            side: THREE.DoubleSide
        }),
        plywoodSide: new THREE.MeshPhongMaterial({
            map: plywoodSideTexture,
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
        rail: new THREE.MeshPhongMaterial({
            color: 0x777777,
            shininess: 40,
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
        spiral: new THREE.MeshPhongMaterial({
            color: 0xaaaaaa,
            shininess: 80,
            metalness: 0.8
        })
    };
}
