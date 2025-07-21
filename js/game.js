// Step 5: Add simple gravity
console.log("🚀 Starting Step 5: Adding simple gravity");

// Wait for libraries to load
window.addEventListener("load", () => {
  // Check if Three.js is available
  if (typeof THREE === "undefined") {
    console.error("❌ Three.js not loaded");
    document.getElementById("loading").innerHTML =
      "Error: Three.js failed to load";
    return;
  }

  console.log("✅ Three.js loaded, creating scene...");

  // Check if Cannon.js is available
  if (typeof CANNON === "undefined") {
    console.error("❌ Cannon.js not loaded");
    document.getElementById("loading").innerHTML =
      "Error: Cannon.js failed to load";
    return;
  }

  console.log("✅ Cannon.js loaded, setting up physics...");

  // === CANNON.js PHYSICS SETUP ===
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0); // Realistic gravity
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 10;

  // Create physics materials
  const groundMaterial = new CANNON.Material("groundMaterial");
  const carMaterial = new CANNON.Material("carMaterial");
  const obstacleMaterial = new CANNON.Material("obstacleMaterial");

  // Define contact materials (how objects interact)
  const carGroundContact = new CANNON.ContactMaterial(
    carMaterial,
    groundMaterial,
    {
      friction: 0.4,
      restitution: 0.3,
    }
  );
  const carObstacleContact = new CANNON.ContactMaterial(
    carMaterial,
    obstacleMaterial,
    {
      friction: 0.1,
      restitution: 0.9,
    }
  );

  world.addContactMaterial(carGroundContact);
  world.addContactMaterial(carObstacleContact);

  // Create basic scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Light blue sky color

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Better quality on high-DPI displays
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft, high-quality shadows
  renderer.outputEncoding = THREE.sRGBEncoding; // Better color rendering
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // Professional tone mapping
  renderer.toneMappingExposure = 1.2; // Slight exposure adjustment
  renderer.physicallyCorrectLights = true; // More realistic lighting
  document.body.appendChild(renderer.domElement);

  // === LIGHTING ===
  // Ambient light (soft environmental lighting)
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4); // Reduced ambient for better contrast
  scene.add(ambientLight);

  // Main directional light (sun)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Brighter main light
  directionalLight.position.set(50, 50, 25); // Higher and further for better shadows
  directionalLight.castShadow = true;

  // Improve shadow quality
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  directionalLight.shadow.bias = -0.0001;
  scene.add(directionalLight);

  // Secondary fill light (softer, opposite direction)
  const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3); // Sky blue fill light
  fillLight.position.set(-30, 30, -30);
  scene.add(fillLight);

  // Hemisphere light for natural sky lighting
  const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x228b22, 0.3); // Sky to ground
  scene.add(hemisphereLight);

  // === GROUND ===
  // Create a large flat plane for the ground (professional grass texture)
  const groundGeometry = new THREE.PlaneGeometry(200, 200);
  const groundMeshMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a4a1a, // Darker, more realistic grass green
    shininess: 5,
    specular: 0x111111,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMeshMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Add some texture variation to the ground
  const grassPatches = [];
  for (let i = 0; i < 15; i++) {
    const patchGeometry = new THREE.CircleGeometry(Math.random() * 8 + 3, 16);
    const patchMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.25, 0.6, 0.2 + Math.random() * 0.2),
      transparent: true,
      opacity: 0.7,
    });
    const patch = new THREE.Mesh(patchGeometry, patchMaterial);
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(
      (Math.random() - 0.5) * 180,
      0.005,
      (Math.random() - 0.5) * 180
    );
    patch.receiveShadow = true;
    scene.add(patch);
  }

  // Create ground physics body
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({
    mass: 0, // Static body
    material: groundMaterial,
  });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(1, 0, 0),
    -Math.PI / 2
  );
  world.addBody(groundBody);

  // === ROAD SYSTEM ===
  // Create main road segments with better materials
  const roadSegments = [
    // Main straight road
    { x: 0, z: 0, width: 8, length: 40, rotation: 0 },
    // Cross road
    { x: 0, z: 0, width: 8, length: 30, rotation: Math.PI / 2 },
    // Curved sections (simulated with angled segments)
    { x: 20, z: 15, width: 8, length: 20, rotation: Math.PI / 4 },
    { x: -20, z: 15, width: 8, length: 20, rotation: -Math.PI / 4 },
    // Additional straight segments
    { x: 30, z: 25, width: 8, length: 25, rotation: 0 },
    { x: -30, z: 25, width: 8, length: 25, rotation: 0 },
  ];

  roadSegments.forEach((road) => {
    const roadGeometry = new THREE.PlaneGeometry(road.width, road.length);
    const roadMaterial = new THREE.MeshPhongMaterial({
      color: 0x2d2d2d, // Professional dark asphalt
      shininess: 10,
      specular: 0x111111,
    });
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.rotation.z = road.rotation;
    roadMesh.position.set(road.x, 0.01, road.z);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Add road markings (yellow lines) - more professional
    const lineGeometry = new THREE.PlaneGeometry(0.15, road.length * 0.8); // Slightly shorter lines
    const lineMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd700, // Gold yellow
      emissive: 0x221100,
      shininess: 50,
    });
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.rotation.z = road.rotation;
    centerLine.position.set(road.x, 0.02, road.z);
    scene.add(centerLine);

    // Add road edge lines (white)
    const edgeMaterial = new THREE.MeshPhongMaterial({
      color: 0xf5f5f5, // Off-white
      shininess: 30,
    });

    // Left edge
    const leftEdgeGeometry = new THREE.PlaneGeometry(0.1, road.length * 0.9);
    const leftEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
    leftEdge.rotation.x = -Math.PI / 2;
    leftEdge.rotation.z = road.rotation;
    const leftOffset = road.width / 2 - 0.3;
    leftEdge.position.set(
      road.x - leftOffset * Math.cos(road.rotation),
      0.015,
      road.z + leftOffset * Math.sin(road.rotation)
    );
    scene.add(leftEdge);

    // Right edge
    const rightEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
    rightEdge.rotation.x = -Math.PI / 2;
    rightEdge.rotation.z = road.rotation;
    rightEdge.position.set(
      road.x + leftOffset * Math.cos(road.rotation),
      0.015,
      road.z - leftOffset * Math.sin(road.rotation)
    );
    scene.add(rightEdge);
  });

  // === CAR CREATION ===
  // Create a group to hold all car parts together
  const car = new THREE.Group();

  // Car body (main rectangle) - sleeker design
  const bodyGeometry = new THREE.BoxGeometry(1.8, 0.5, 4.2);
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: 0xdc143c, // Crimson red
    shininess: 100,
    specular: 0x222222,
  });
  const carBodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  carBodyMesh.position.y = 0;
  carBodyMesh.castShadow = true;
  carBodyMesh.receiveShadow = true;
  car.add(carBodyMesh);

  // Car hood (front section)
  const hoodGeometry = new THREE.BoxGeometry(1.6, 0.3, 1.2);
  const hoodMaterial = new THREE.MeshPhongMaterial({
    color: 0xb71c1c, // Darker red
    shininess: 120,
  });
  const carHood = new THREE.Mesh(hoodGeometry, hoodMaterial);
  carHood.position.set(0, 0.15, 1.8);
  carHood.castShadow = true;
  car.add(carHood);

  // Car roof/cabin (rounded edges)
  const roofGeometry = new THREE.BoxGeometry(1.4, 0.6, 2.2);
  const roofMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a1a1a, // Very dark gray
    shininess: 80,
  });
  const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
  carRoof.position.y = 0.55;
  carRoof.castShadow = true;
  car.add(carRoof);

  // Windshield (front glass)
  const windshieldGeometry = new THREE.PlaneGeometry(1.3, 0.5);
  const windshieldMaterial = new THREE.MeshPhongMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
  windshield.position.set(0, 0.6, 1.1);
  windshield.rotation.x = -0.2;
  car.add(windshield);

  // Side windows
  const sideWindowGeometry = new THREE.PlaneGeometry(1.8, 0.4);
  const sideWindowMaterial = new THREE.MeshPhongMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });

  const leftWindow = new THREE.Mesh(sideWindowGeometry, sideWindowMaterial);
  leftWindow.position.set(-0.71, 0.6, 0);
  leftWindow.rotation.y = Math.PI / 2;
  car.add(leftWindow);

  const rightWindow = new THREE.Mesh(sideWindowGeometry, sideWindowMaterial);
  rightWindow.position.set(0.71, 0.6, 0);
  rightWindow.rotation.y = -Math.PI / 2;
  car.add(rightWindow);

  // Headlights
  const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
  const headlightMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffcc,
    emissive: 0x444422,
    shininess: 100,
  });

  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  leftHeadlight.position.set(-0.6, 0.1, 2.0);
  car.add(leftHeadlight);

  const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  rightHeadlight.position.set(0.6, 0.1, 2.0);
  car.add(rightHeadlight);

  // Taillights
  const taillightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const taillightMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    emissive: 0x220000,
    shininess: 100,
  });

  const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
  leftTaillight.position.set(-0.6, 0.1, -2.0);
  car.add(leftTaillight);

  const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
  rightTaillight.position.set(0.6, 0.1, -2.0);
  car.add(rightTaillight);

  // Create 4 wheels - professional design
  const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16); // More segments for smoother wheels
  const wheelMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a1a1a, // Very dark
    shininess: 30,
  });

  // Wheel rim (inner part)
  const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.27, 16);
  const rimMaterial = new THREE.MeshPhongMaterial({
    color: 0x888888, // Silver
    shininess: 100,
    specular: 0x444444,
  });

  // Wheel positions: [x, z] relative to car center
  const wheelPositions = [
    [-0.9, 1.3], // Front left
    [0.9, 1.3], // Front right
    [-0.9, -1.3], // Rear left
    [0.9, -1.3], // Rear right
  ];

  // Store wheels for animation
  const wheels = [];

  // Create each wheel with rim - positioned to actually touch the ground
  wheelPositions.forEach((pos) => {
    // Main wheel (tire)
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(pos[0], -0.25, pos[1]); // Raised wheels slightly above ground
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    car.add(wheel);
    wheels.push(wheel);

    // Wheel rim (decorative)
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.set(pos[0], -0.25, pos[1]); // Raised rims to match wheels
    rim.rotation.z = Math.PI / 2;
    rim.castShadow = true;
    car.add(rim);
  });

  // Position the entire car above ground so it falls down
  car.position.y = 2; // Start higher
  scene.add(car);

  // Create car physics body
  const carShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)); // Simpler physics body
  const carBody = new CANNON.Body({
    mass: 500, // Car mass in kg
    position: new CANNON.Vec3(0, 2, 0), // Start above ground
    material: carMaterial,
  });
  carBody.addShape(carShape);
  world.addBody(carBody);

  // === OBSTACLE COURSE ===
  // Create some obstacles to drive around
  const obstacles = [];
  const obstaclePhysicsBodies = [];

  // Road barriers (concrete barriers along roads)
  const barriers = [
    { x: 4.5, z: -15, width: 1, height: 1.2, depth: 8, color: 0xc0c0c0 }, // Right side barrier
    { x: -4.5, z: -15, width: 1, height: 1.2, depth: 8, color: 0xc0c0c0 }, // Left side barrier
    { x: 4.5, z: 15, width: 1, height: 1.2, depth: 8, color: 0xc0c0c0 }, // Right side barrier
    { x: -4.5, z: 15, width: 1, height: 1.2, depth: 8, color: 0xc0c0c0 }, // Left side barrier
  ];

  barriers.forEach((barrier) => {
    const geometry = new THREE.BoxGeometry(
      barrier.width,
      barrier.height,
      barrier.depth
    );
    const material = new THREE.MeshLambertMaterial({ color: barrier.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(barrier.x, barrier.height / 2, barrier.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    obstacles.push(mesh);

    // Physics body
    const shape = new CANNON.Box(
      new CANNON.Vec3(barrier.width / 2, barrier.height / 2, barrier.depth / 2)
    );
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(barrier.x, barrier.height / 2, barrier.z),
      material: obstacleMaterial,
    });
    body.addShape(shape);
    world.addBody(body);
    obstaclePhysicsBodies.push(body);
  });

  // Traffic cones for slalom course
  const cones = [
    { x: -2, z: -25, color: 0xff4500 }, // Orange cone
    { x: 2, z: -30, color: 0xff4500 },
    { x: -2, z: -35, color: 0xff4500 },
    { x: 2, z: -40, color: 0xff4500 },
    { x: -2, z: -45, color: 0xff4500 },
    { x: 2, z: -50, color: 0xff4500 },
  ];

  cones.forEach((cone) => {
    const coneGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
    const coneMaterial = new THREE.MeshLambertMaterial({ color: cone.color });
    const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    coneMesh.position.set(cone.x, 0.4, cone.z);
    coneMesh.castShadow = true;
    scene.add(coneMesh);
    obstacles.push(coneMesh);

    // Physics body
    const coneShape = new CANNON.Cylinder(0.3, 0.1, 0.8, 8);
    const coneBody = new CANNON.Body({
      mass: 5, // Light weight so they can be knocked over
      position: new CANNON.Vec3(cone.x, 0.4, cone.z),
      material: obstacleMaterial,
    });
    coneBody.addShape(coneShape);
    world.addBody(coneBody);
    obstaclePhysicsBodies.push(coneBody);
  });

  // Large obstacles (buildings/structures)
  const buildings = [
    { x: 15, z: -10, width: 3, height: 4, depth: 3, color: 0x8b4513 }, // Brown building
    { x: -15, z: -10, width: 2.5, height: 3, depth: 2.5, color: 0x696969 }, // Gray building
    { x: 25, z: 5, width: 4, height: 2, depth: 4, color: 0x654321 }, // Wide brown building
    { x: -25, z: 5, width: 2, height: 5, depth: 2, color: 0x8b4513 }, // Tall building
    { x: 12, z: 35, width: 3, height: 3, depth: 3, color: 0x708090 }, // Slate gray
    { x: -12, z: 35, width: 2, height: 4, depth: 2, color: 0x2f4f4f }, // Dark slate
  ];

  buildings.forEach((building) => {
    const geometry = new THREE.BoxGeometry(
      building.width,
      building.height,
      building.depth
    );
    const material = new THREE.MeshLambertMaterial({ color: building.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(building.x, building.height / 2, building.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    obstacles.push(mesh);

    // Physics body
    const shape = new CANNON.Box(
      new CANNON.Vec3(
        building.width / 2,
        building.height / 2,
        building.depth / 2
      )
    );
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(building.x, building.height / 2, building.z),
      material: obstacleMaterial,
    });
    body.addShape(shape);
    world.addBody(body);
    obstaclePhysicsBodies.push(body);
  });

  // Cylindrical obstacles (pillars/poles)
  const pillars = [
    { x: -8, z: 25, radius: 0.5, height: 3, color: 0x2f4f4f }, // Dark slate gray
    { x: 8, z: 25, radius: 0.5, height: 3, color: 0x2f4f4f },
    { x: -20, z: -25, radius: 0.4, height: 4, color: 0x8b4513 }, // Brown pole
    { x: 20, z: -25, radius: 0.4, height: 4, color: 0x8b4513 },
    { x: 0, z: 50, radius: 0.6, height: 2.5, color: 0x556b2f }, // Dark olive green
  ];

  pillars.forEach((pillar) => {
    const geometry = new THREE.CylinderGeometry(
      pillar.radius,
      pillar.radius,
      pillar.height,
      8
    );
    const material = new THREE.MeshLambertMaterial({ color: pillar.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pillar.x, pillar.height / 2, pillar.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    obstacles.push(mesh);

    // Physics body
    const shape = new CANNON.Cylinder(
      pillar.radius,
      pillar.radius,
      pillar.height,
      8
    );
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(pillar.x, pillar.height / 2, pillar.z),
      material: obstacleMaterial,
    });
    body.addShape(shape);
    world.addBody(body);
    obstaclePhysicsBodies.push(body);
  });

  // Ramps for jumping (optional fun elements)
  const ramps = [
    { x: 35, z: -5, width: 6, height: 0.5, depth: 3, rotation: Math.PI / 12 }, // Small ramp
    { x: -35, z: -5, width: 6, height: 0.5, depth: 3, rotation: -Math.PI / 12 }, // Small ramp
  ];

  ramps.forEach((ramp) => {
    const geometry = new THREE.BoxGeometry(ramp.width, ramp.height, ramp.depth);
    const material = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown ramp
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(ramp.x, ramp.height / 2, ramp.z);
    mesh.rotation.x = ramp.rotation;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    obstacles.push(mesh);

    // Physics body
    const shape = new CANNON.Box(
      new CANNON.Vec3(ramp.width / 2, ramp.height / 2, ramp.depth / 2)
    );
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(ramp.x, ramp.height / 2, ramp.z),
      material: obstacleMaterial,
    });
    body.addShape(shape);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), ramp.rotation);
    world.addBody(body);
    obstaclePhysicsBodies.push(body);
  });

  // === KEYBOARD CONTROLS ===
  // Object to track which keys are currently pressed
  const keys = {};

  // Car movement variables
  const maxForce = 3000;
  const maxSteerVal = 2.0;

  // Listen for key presses
  document.addEventListener("keydown", (event) => {
    keys[event.code] = true; // Mark this key as pressed
  });

  // Listen for key releases
  document.addEventListener("keyup", (event) => {
    keys[event.code] = false; // Mark this key as not pressed
  });

  // === MOUSE CAMERA CONTROLS ===
  let isMouseDown = false;
  let mouseX = 0;
  let mouseY = 0;
  let cameraAngleX = 0; // Horizontal rotation around car
  let cameraAngleY = 5; // Vertical angle (start slightly above)

  // Mouse down event
  document.addEventListener("mousedown", (event) => {
    isMouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
    document.body.style.cursor = "grabbing";
  });

  // Mouse up event
  document.addEventListener("mouseup", () => {
    isMouseDown = false;
    document.body.style.cursor = "default";
  });

  // Mouse move event
  document.addEventListener("mousemove", (event) => {
    if (!isMouseDown) return;

    const deltaX = event.clientX - mouseX;
    const deltaY = event.clientY - mouseY;

    // Update camera angles
    cameraAngleX += deltaX * 0.01; // Horizontal rotation
    cameraAngleY -= deltaY * 0.01; // Vertical rotation (inverted for natural feel)

    // Limit vertical angle to prevent flipping
    cameraAngleY = Math.max(-Math.PI / 3, Math.min(Math.PI / 2, cameraAngleY));

    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  // Function to update car movement based on pressed keys
  function updateCarMovement(deltaTime) {
    // More fun car variables
    let moveSpeed = 0;
    let turnSpeed = 0;

    // FORWARD - W key or Up arrow
    if (keys["KeyW"] || keys["ArrowUp"]) {
      moveSpeed = 15; // Faster forward speed
    }

    // BACKWARD - S key or Down arrow
    if (keys["KeyS"] || keys["ArrowDown"]) {
      moveSpeed = -8; // Faster reverse speed
    }

    // LEFT TURN - A key or Left arrow
    if (keys["KeyA"] || keys["ArrowLeft"]) {
      turnSpeed = 10; // Even faster turning
    }

    // RIGHT TURN - D key or Right arrow
    if (keys["KeyD"] || keys["ArrowRight"]) {
      turnSpeed = -10; // Even faster turning
    }

    // Apply rotation first (direct quaternion rotation for smooth control)
    if (turnSpeed !== 0) {
      // Get current Y rotation from the physics body
      const currentRotation = Math.atan2(
        2 *
          (carBody.quaternion.w * carBody.quaternion.y +
            carBody.quaternion.x * carBody.quaternion.z),
        1 -
          2 *
            (carBody.quaternion.y * carBody.quaternion.y +
              carBody.quaternion.z * carBody.quaternion.z)
      );

      // Apply turn rotation directly (no momentum/wobble)
      const newRotation = currentRotation + turnSpeed * deltaTime * 0.1;
      carBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(0, 1, 0),
        newRotation
      );
    }

    // Apply movement - use the updated rotation
    if (moveSpeed !== 0) {
      // Get current Y rotation after potential turning
      const currentRotation = Math.atan2(
        2 *
          (carBody.quaternion.w * carBody.quaternion.y +
            carBody.quaternion.x * carBody.quaternion.z),
        1 -
          2 *
            (carBody.quaternion.y * carBody.quaternion.y +
              carBody.quaternion.z * carBody.quaternion.z)
      );

      // Move in the direction the car is facing
      carBody.position.x += Math.sin(currentRotation) * moveSpeed * deltaTime;
      carBody.position.z += Math.cos(currentRotation) * moveSpeed * deltaTime;
    }

    // Keep car completely stable on ground - stop all unwanted movement
    carBody.position.y = Math.max(carBody.position.y, 0.45); // Raised car physics body to match wheel position
    carBody.velocity.x = 0; // Stop all physics velocity
    carBody.velocity.z = 0;
    carBody.velocity.y = Math.min(carBody.velocity.y, 0); // Only allow falling, not jumping
    carBody.angularVelocity.x = 0; // No pitch
    carBody.angularVelocity.y = 0; // No yaw momentum (prevents wobble)
    carBody.angularVelocity.z = 0; // No roll

    // Animate wheel rotation based on movement - FIXED rotation axis
    if (moveSpeed !== 0) {
      const wheelRotationSpeed = moveSpeed * deltaTime * 0.8; // Adjust rotation speed
      wheels.forEach((wheel, index) => {
        // Front wheels (index 0 and 1) also turn with steering
        if (index < 2 && turnSpeed !== 0) {
          // Front wheels turn for steering - use Y axis for steering
          wheel.rotation.y = turnSpeed * 0.02; // Much more subtle steering angle
        } else if (index >= 2) {
          // Reset rear wheel steering
          wheel.rotation.y = 0;
        }

        // All wheels rotate when moving - use Y-axis for rolling motion since wheels are rotated
        wheel.rotation.x += wheelRotationSpeed;
      });
    } else {
      // Reset front wheel steering when not turning
      wheels[0].rotation.y = 0;
      wheels[1].rotation.y = 0;
    }
  }
  // Position camera
  camera.position.set(0, 5, 8); // Move camera up and back for better view

  const clock = new THREE.Clock();

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    // Step the physics simulation
    world.step(1 / 60, deltaTime, 3);

    // Update car movement based on keyboard input
    updateCarMovement(deltaTime);

    // Sync Three.js car with Cannon.js physics body
    car.position.copy(carBody.position);
    car.quaternion.copy(carBody.quaternion);

    // Make camera follow the car with mouse-controlled rotation
    const cameraDistance = 8; // Distance from car

    // Calculate camera position using spherical coordinates
    const cameraX =
      car.position.x +
      Math.sin(cameraAngleX) * Math.cos(cameraAngleY) * cameraDistance;
    const cameraY =
      car.position.y + Math.sin(cameraAngleY) * cameraDistance + 2; // Add base height
    const cameraZ =
      car.position.z +
      Math.cos(cameraAngleX) * Math.cos(cameraAngleY) * cameraDistance;

    // Smoothly move camera to target position
    const targetPosition = new THREE.Vector3(cameraX, cameraY, cameraZ);
    camera.position.lerp(targetPosition, 0.1);

    // Point camera at the car
    camera.lookAt(car.position);

    // Update speedometer
    const speed = carBody.velocity.length();
    document.getElementById("speed").innerText = (speed * 3.6).toFixed(0); // Convert m/s to km/h

    renderer.render(scene, camera);
  }

  // Hide loading and start animation
  document.getElementById("loading").style.display = "none";
  console.log("✅ Cannon.js physics enabled with collidable obstacles!");
  console.log("🎮 Use WASD or Arrow Keys to drive the car!");
  console.log("🚧 Car will collide with obstacles - drive carefully!");
  animate();
});
