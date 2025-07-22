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
  scene.background = new THREE.Color(0xb3d9ff); // Brighter, more vibrant sky blue

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
  renderer.toneMappingExposure = 1.8; // Increased exposure for brighter scene
  renderer.physicallyCorrectLights = true; // More realistic lighting
  renderer.gammaFactor = 2.2; // Better gamma correction
  renderer.gammaOutput = true; // Enable gamma output
  document.body.appendChild(renderer.domElement);

  // === ENHANCED LIGHTING SYSTEM ===
  // Brighter ambient light for overall scene illumination
  const ambientLight = new THREE.AmbientLight(0x606060, 0.7); // Much brighter ambient
  scene.add(ambientLight);

  // Main directional light (sun) - significantly brighter
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0); // Much brighter main light
  directionalLight.position.set(60, 80, 40); // Higher position for better coverage
  directionalLight.castShadow = true;

  // Improved shadow quality with better settings for larger world
  directionalLight.shadow.mapSize.width = 4096; // Higher resolution shadows
  directionalLight.shadow.mapSize.height = 4096;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 1000; // Increased far distance for bigger world
  directionalLight.shadow.camera.left = -300; // Expanded shadow coverage
  directionalLight.shadow.camera.right = 300;
  directionalLight.shadow.camera.top = 300;
  directionalLight.shadow.camera.bottom = -300;
  directionalLight.shadow.bias = -0.0005;
  directionalLight.shadow.normalBias = 0.02;
  scene.add(directionalLight);

  // Secondary fill light (brighter, warmer tone)
  const fillLight = new THREE.DirectionalLight(0xffd4a3, 0.6); // Warm fill light
  fillLight.position.set(-40, 60, -40);
  scene.add(fillLight);

  // Third light for better rim lighting
  const rimLight = new THREE.DirectionalLight(0xa3c7ff, 0.4); // Cool rim light
  rimLight.position.set(30, 40, -60);
  scene.add(rimLight);

  // Brighter hemisphere light for natural sky lighting
  const hemisphereLight = new THREE.HemisphereLight(0xb3d9ff, 0x4a7c59, 0.5); // Brighter sky to ground
  scene.add(hemisphereLight);

  // Add point lights for extra brightness around the larger scene
  const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 200); // Increased range for bigger world
  pointLight1.position.set(0, 20, 0); // Central overhead light
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xffd4a3, 0.5, 150);
  pointLight2.position.set(100, 15, 100); // Warm accent light (further out)
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xa3c7ff, 0.5, 150);
  pointLight3.position.set(-100, 15, -100); // Cool accent light (further out)
  scene.add(pointLight3);

  // Additional lights for better coverage in the expanded world
  const pointLight4 = new THREE.PointLight(0xffffff, 0.6, 120);
  pointLight4.position.set(150, 25, 0); // East light
  scene.add(pointLight4);

  const pointLight5 = new THREE.PointLight(0xffffff, 0.6, 120);
  pointLight5.position.set(-150, 25, 0); // West light
  scene.add(pointLight5);

  const pointLight6 = new THREE.PointLight(0xffffff, 0.6, 120);
  pointLight6.position.set(0, 25, 150); // North light
  scene.add(pointLight6);

  const pointLight7 = new THREE.PointLight(0xffffff, 0.6, 120);
  pointLight7.position.set(0, 25, -150); // South light
  scene.add(pointLight7);

  // === ENHANCED GROUND ===
  // Create a much larger flat plane for the ground (expanded world)
  const groundGeometry = new THREE.PlaneGeometry(500, 500); // Much bigger world
  const groundMeshMaterial = new THREE.MeshPhongMaterial({
    color: 0x2d5a2d, // Brighter, more vibrant grass green
    shininess: 15,
    specular: 0x333333,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMeshMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Add brighter texture variation to the ground (more patches for bigger world)
  const grassPatches = [];
  for (let i = 0; i < 50; i++) {
    // More patches for better coverage in bigger world
    const patchGeometry = new THREE.CircleGeometry(Math.random() * 15 + 8, 16);
    const patchMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.25, 0.7, 0.35 + Math.random() * 0.25), // Brighter patches
      transparent: true,
      opacity: 0.8,
    });
    const patch = new THREE.Mesh(patchGeometry, patchMaterial);
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(
      (Math.random() - 0.5) * 450,
      0.005,
      (Math.random() - 0.5) * 450
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

  // === EXPANDED ROAD SYSTEM ===
  // Create a comprehensive road network with multiple highways and intersections
  const roadSegments = [
    // Main highway (north-south)
    { x: 0, z: 0, width: 12, length: 80, rotation: 0 },
    { x: 0, z: 80, width: 12, length: 80, rotation: 0 },
    { x: 0, z: -80, width: 12, length: 80, rotation: 0 },

    // Cross highway (east-west)
    { x: 0, z: 0, width: 12, length: 80, rotation: Math.PI / 2 },
    { x: 80, z: 0, width: 12, length: 80, rotation: Math.PI / 2 },
    { x: -80, z: 0, width: 12, length: 80, rotation: Math.PI / 2 },

    // Secondary roads branching out
    { x: 40, z: 40, width: 10, length: 60, rotation: 0 },
    { x: -40, z: 40, width: 10, length: 60, rotation: 0 },
    { x: 40, z: -40, width: 10, length: 60, rotation: 0 },
    { x: -40, z: -40, width: 10, length: 60, rotation: 0 },

    // Connecting diagonal roads
    { x: 60, z: 60, width: 8, length: 50, rotation: Math.PI / 4 },
    { x: -60, z: 60, width: 8, length: 50, rotation: -Math.PI / 4 },
    { x: 60, z: -60, width: 8, length: 50, rotation: -Math.PI / 4 },
    { x: -60, z: -60, width: 8, length: 50, rotation: Math.PI / 4 },

    // Outer ring road segments
    { x: 120, z: 0, width: 8, length: 40, rotation: 0 },
    { x: -120, z: 0, width: 8, length: 40, rotation: 0 },
    { x: 0, z: 120, width: 8, length: 40, rotation: Math.PI / 2 },
    { x: 0, z: -120, width: 8, length: 40, rotation: Math.PI / 2 },

    // Additional curved sections (simulated with angled segments)
    { x: 100, z: 80, width: 8, length: 30, rotation: Math.PI / 6 },
    { x: -100, z: 80, width: 8, length: 30, rotation: -Math.PI / 6 },
    { x: 100, z: -80, width: 8, length: 30, rotation: -Math.PI / 6 },
    { x: -100, z: -80, width: 8, length: 30, rotation: Math.PI / 6 },

    // Long distance highways
    { x: 0, z: 160, width: 10, length: 60, rotation: 0 },
    { x: 0, z: -160, width: 10, length: 60, rotation: 0 },
    { x: 160, z: 0, width: 10, length: 60, rotation: Math.PI / 2 },
    { x: -160, z: 0, width: 10, length: 60, rotation: Math.PI / 2 },
  ];

  roadSegments.forEach((road) => {
    const roadGeometry = new THREE.PlaneGeometry(road.width, road.length);
    const roadMaterial = new THREE.MeshPhongMaterial({
      color: 0x404040, // Lighter asphalt for better visibility
      shininess: 20,
      specular: 0x222222,
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

  // Headlights - brighter and more visible
  const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
  const headlightMaterial = new THREE.MeshPhongMaterial({
    color: 0xfffff0, // Brighter white
    emissive: 0x888844, // Much brighter emission
    shininess: 150,
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

  // === EXPANDED OBSTACLE COURSE ===
  // Create obstacles distributed across the larger world
  const obstacles = [];
  const obstaclePhysicsBodies = [];

  // Road barriers (concrete barriers along major roads) - more distributed
  const barriers = [
    // Main highway barriers
    { x: 6.5, z: -40, width: 1, height: 1.2, depth: 15, color: 0xc0c0c0 },
    { x: -6.5, z: -40, width: 1, height: 1.2, depth: 15, color: 0xc0c0c0 },
    { x: 6.5, z: 40, width: 1, height: 1.2, depth: 15, color: 0xc0c0c0 },
    { x: -6.5, z: 40, width: 1, height: 1.2, depth: 15, color: 0xc0c0c0 },

    // Cross highway barriers
    { x: 40, z: 6.5, width: 15, height: 1.2, depth: 1, color: 0xc0c0c0 },
    { x: 40, z: -6.5, width: 15, height: 1.2, depth: 1, color: 0xc0c0c0 },
    { x: -40, z: 6.5, width: 15, height: 1.2, depth: 1, color: 0xc0c0c0 },
    { x: -40, z: -6.5, width: 15, height: 1.2, depth: 1, color: 0xc0c0c0 },

    // Outer area barriers
    { x: 90, z: 90, width: 2, height: 1.5, depth: 20, color: 0xa0a0a0 },
    { x: -90, z: 90, width: 2, height: 1.5, depth: 20, color: 0xa0a0a0 },
    { x: 90, z: -90, width: 2, height: 1.5, depth: 20, color: 0xa0a0a0 },
    { x: -90, z: -90, width: 2, height: 1.5, depth: 20, color: 0xa0a0a0 },
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

  // Traffic cones for slalom course - distributed across multiple areas
  const cones = [
    // Main highway slalom
    { x: -3, z: -60, color: 0xff4500 },
    { x: 3, z: -70, color: 0xff4500 },
    { x: -3, z: -80, color: 0xff4500 },
    { x: 3, z: -90, color: 0xff4500 },

    // Cross road slalom
    { x: -60, z: -3, color: 0xff4500 },
    { x: -70, z: 3, color: 0xff4500 },
    { x: -80, z: -3, color: 0xff4500 },
    { x: -90, z: 3, color: 0xff4500 },

    // Secondary road cones
    { x: 35, z: 60, color: 0xff4500 },
    { x: 45, z: 65, color: 0xff4500 },
    { x: 35, z: 70, color: 0xff4500 },
    { x: 45, z: 75, color: 0xff4500 },

    // Outer area challenge cones
    { x: 120, z: 25, color: 0xff4500 },
    { x: 115, z: 30, color: 0xff4500 },
    { x: 120, z: 35, color: 0xff4500 },
    { x: -120, z: -25, color: 0xff4500 },
    { x: -115, z: -30, color: 0xff4500 },
    { x: -120, z: -35, color: 0xff4500 },
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

  // Large obstacles (buildings/structures) - expanded city-like layout
  const buildings = [
    // Central city area
    { x: 25, z: 25, width: 4, height: 6, depth: 4, color: 0x8b4513 },
    { x: -25, z: 25, width: 3, height: 5, depth: 3, color: 0x696969 },
    { x: 25, z: -25, width: 5, height: 4, depth: 5, color: 0x654321 },
    { x: -25, z: -25, width: 3, height: 7, depth: 3, color: 0x8b4513 },

    // Eastern district
    { x: 70, z: 30, width: 6, height: 8, depth: 4, color: 0x708090 },
    { x: 80, z: 50, width: 4, height: 6, depth: 6, color: 0x2f4f4f },
    { x: 90, z: 20, width: 3, height: 5, depth: 3, color: 0x696969 },
    { x: 75, z: 70, width: 5, height: 4, depth: 4, color: 0x8b4513 },

    // Western district
    { x: -70, z: 30, width: 4, height: 7, depth: 5, color: 0x654321 },
    { x: -80, z: 50, width: 6, height: 5, depth: 3, color: 0x708090 },
    { x: -90, z: 20, width: 3, height: 6, depth: 4, color: 0x2f4f4f },
    { x: -75, z: 70, width: 4, height: 8, depth: 4, color: 0x696969 },

    // Northern district
    { x: 30, z: 80, width: 5, height: 6, depth: 5, color: 0x8b4513 },
    { x: 50, z: 90, width: 3, height: 4, depth: 3, color: 0x708090 },
    { x: 20, z: 100, width: 4, height: 7, depth: 4, color: 0x2f4f4f },
    { x: -30, z: 80, width: 6, height: 5, depth: 4, color: 0x654321 },
    { x: -50, z: 90, width: 3, height: 6, depth: 5, color: 0x696969 },

    // Southern district
    { x: 30, z: -80, width: 4, height: 5, depth: 4, color: 0x708090 },
    { x: 50, z: -90, width: 5, height: 7, depth: 3, color: 0x8b4513 },
    { x: 20, z: -100, width: 3, height: 4, depth: 6, color: 0x2f4f4f },
    { x: -30, z: -80, width: 6, height: 6, depth: 4, color: 0x654321 },
    { x: -50, z: -90, width: 4, height: 8, depth: 4, color: 0x696969 },

    // Outer suburban areas
    { x: 130, z: 60, width: 8, height: 3, depth: 6, color: 0x8b4513 },
    { x: -130, z: 60, width: 6, height: 4, depth: 8, color: 0x696969 },
    { x: 130, z: -60, width: 7, height: 5, depth: 5, color: 0x708090 },
    { x: -130, z: -60, width: 5, height: 6, depth: 7, color: 0x654321 },
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

  // Cylindrical obstacles (pillars/poles) - distributed across the expanded world
  const pillars = [
    // Central area pillars
    { x: -15, z: 60, radius: 0.5, height: 3, color: 0x2f4f4f },
    { x: 15, z: 60, radius: 0.5, height: 3, color: 0x2f4f4f },
    { x: -15, z: -60, radius: 0.4, height: 4, color: 0x8b4513 },
    { x: 15, z: -60, radius: 0.4, height: 4, color: 0x8b4513 },

    // Eastern area pillars
    { x: 65, z: 0, radius: 0.6, height: 3.5, color: 0x556b2f },
    { x: 85, z: 25, radius: 0.5, height: 4, color: 0x2f4f4f },
    { x: 105, z: -15, radius: 0.4, height: 2.5, color: 0x8b4513 },
    { x: 125, z: 35, radius: 0.7, height: 3, color: 0x556b2f },

    // Western area pillars
    { x: -65, z: 0, radius: 0.6, height: 3.5, color: 0x556b2f },
    { x: -85, z: 25, radius: 0.5, height: 4, color: 0x2f4f4f },
    { x: -105, z: -15, radius: 0.4, height: 2.5, color: 0x8b4513 },
    { x: -125, z: 35, radius: 0.7, height: 3, color: 0x556b2f },

    // Northern area pillars
    { x: 0, z: 110, radius: 0.8, height: 4, color: 0x2f4f4f },
    { x: 25, z: 125, radius: 0.5, height: 3.5, color: 0x8b4513 },
    { x: -25, z: 125, radius: 0.5, height: 3.5, color: 0x8b4513 },
    { x: 50, z: 140, radius: 0.6, height: 3, color: 0x556b2f },
    { x: -50, z: 140, radius: 0.6, height: 3, color: 0x556b2f },

    // Southern area pillars
    { x: 0, z: -110, radius: 0.8, height: 4, color: 0x2f4f4f },
    { x: 25, z: -125, radius: 0.5, height: 3.5, color: 0x8b4513 },
    { x: -25, z: -125, radius: 0.5, height: 3.5, color: 0x8b4513 },
    { x: 50, z: -140, radius: 0.6, height: 3, color: 0x556b2f },
    { x: -50, z: -140, radius: 0.6, height: 3, color: 0x556b2f },
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

  // Ramps for jumping (optional fun elements) - distributed across the world
  const ramps = [
    // Central area ramps
    { x: 70, z: -10, width: 8, height: 0.8, depth: 4, rotation: Math.PI / 12 },
    {
      x: -70,
      z: -10,
      width: 8,
      height: 0.8,
      depth: 4,
      rotation: -Math.PI / 12,
    },

    // Northern ramps
    { x: 40, z: 110, width: 6, height: 0.6, depth: 3, rotation: Math.PI / 15 },
    {
      x: -40,
      z: 110,
      width: 6,
      height: 0.6,
      depth: 3,
      rotation: -Math.PI / 15,
    },

    // Southern ramps
    { x: 40, z: -110, width: 6, height: 0.6, depth: 3, rotation: Math.PI / 15 },
    {
      x: -40,
      z: -110,
      width: 6,
      height: 0.6,
      depth: 3,
      rotation: -Math.PI / 15,
    },

    // Eastern and Western challenge ramps
    { x: 140, z: 20, width: 10, height: 1.0, depth: 5, rotation: Math.PI / 10 },
    {
      x: -140,
      z: 20,
      width: 10,
      height: 1.0,
      depth: 5,
      rotation: -Math.PI / 10,
    },

    // Diagonal ramps for advanced driving
    { x: 90, z: 80, width: 7, height: 0.7, depth: 4, rotation: Math.PI / 8 },
    { x: -90, z: 80, width: 7, height: 0.7, depth: 4, rotation: -Math.PI / 8 },
    { x: 90, z: -80, width: 7, height: 0.7, depth: 4, rotation: Math.PI / 8 },
    { x: -90, z: -80, width: 7, height: 0.7, depth: 4, rotation: -Math.PI / 8 },
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
      moveSpeed = 20; // Even faster for the bigger world
    }

    // BACKWARD - S key or Down arrow
    if (keys["KeyS"] || keys["ArrowDown"]) {
      moveSpeed = -12; // Faster reverse for bigger distances
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

    // Make camera follow the car with mouse-controlled rotation (adjusted for bigger world)
    const cameraDistance = 12; // Increased distance for better view of the larger world

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
