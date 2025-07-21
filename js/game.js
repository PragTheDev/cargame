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
  const renderer = new THREE.WebGLRenderer({ antialias: true }); // Smooth edges

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // Enable shadows
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
  document.body.appendChild(renderer.domElement);

  // === LIGHTING ===
  // Ambient light (soft light from all directions)
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6); // Dim gray light
  scene.add(ambientLight);

  // Directional light (like the sun)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light
  directionalLight.position.set(10, 10, 5); // Position it above and to the side
  directionalLight.castShadow = true; // This light creates shadows
  scene.add(directionalLight);

  // === GROUND ===
  // Create a large flat plane for the ground
  const groundGeometry = new THREE.PlaneGeometry(100, 100); // Larger ground
  const groundMeshMaterial = new THREE.MeshLambertMaterial({ color: 0x90ee90 }); // Light green
  const ground = new THREE.Mesh(groundGeometry, groundMeshMaterial);
  ground.rotation.x = -Math.PI / 2; // Rotate 90 degrees to make it horizontal
  ground.receiveShadow = true; // Ground can receive shadows
  scene.add(ground);

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

  // === CAR CREATION ===
  // Create a group to hold all car parts together
  const car = new THREE.Group();

  // Car body (main rectangle) - make it sit properly on wheels
  const bodyGeometry = new THREE.BoxGeometry(2, 0.6, 4); // Made slightly taller
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 }); // Red
  const carBodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  carBodyMesh.position.y = 0.6; // Lift body above wheels
  carBodyMesh.castShadow = true;
  car.add(carBodyMesh);

  // Car roof/cabin (smaller box on top)
  const roofGeometry = new THREE.BoxGeometry(1.5, 0.5, 2.5); // Better proportions
  const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark gray
  const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
  carRoof.position.y = 1.15; // On top of the body
  carRoof.castShadow = true;
  car.add(carRoof);

  // Create 4 wheels - bigger and properly positioned
  const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 8); // Bigger wheels
  const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 }); // Dark gray/black

  // Wheel positions: [x, z] relative to car center
  const wheelPositions = [
    [-0.9, 1.3], // Front left
    [0.9, 1.3], // Front right
    [-0.9, -1.3], // Rear left
    [0.9, -1.3], // Rear right
  ];

  // Create each wheel - positioned to touch the ground
  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(pos[0], 0.35, pos[1]); // Wheels at ground level
    wheel.rotation.z = Math.PI / 2; // Rotate wheel to be vertical
    wheel.castShadow = true;
    car.add(wheel);
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

  // === OBSTACLES ===
  // Create some obstacles to drive around
  const obstacles = [];
  const obstaclePhysicsBodies = [];

  // Create box obstacles
  const boxPositions = [
    { x: 5, z: 5, width: 1, height: 2, depth: 1, color: 0x8b4513 }, // Brown box
    { x: -3, z: 8, width: 1.5, height: 1.5, depth: 1.5, color: 0x696969 }, // Gray box
    { x: 7, z: -4, width: 2, height: 1, depth: 2, color: 0x654321 }, // Dark brown box
    { x: -6, z: -2, width: 1, height: 3, depth: 1, color: 0x8b4513 }, // Tall brown box
    { x: 2, z: -7, width: 1.2, height: 1.2, depth: 1.2, color: 0x708090 }, // Slate gray box
  ];

  boxPositions.forEach((obstacle) => {
    // Create visual mesh
    const geometry = new THREE.BoxGeometry(
      obstacle.width,
      obstacle.height,
      obstacle.depth
    );
    const material = new THREE.MeshLambertMaterial({ color: obstacle.color });
    const box = new THREE.Mesh(geometry, material);
    box.position.set(obstacle.x, obstacle.height / 2, obstacle.z);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
    obstacles.push(box);

    // Create physics body
    const boxShape = new CANNON.Box(
      new CANNON.Vec3(
        obstacle.width / 2,
        obstacle.height / 2,
        obstacle.depth / 2
      )
    );
    const boxBody = new CANNON.Body({
      mass: 0, // Static obstacle
      position: new CANNON.Vec3(obstacle.x, obstacle.height / 2, obstacle.z),
      material: obstacleMaterial,
    });
    boxBody.addShape(boxShape);
    world.addBody(boxBody);
    obstaclePhysicsBodies.push(boxBody);
  });

  // Create cylinder obstacles (like pillars)
  const cylinderPositions = [
    { x: -8, z: 4, radius: 0.5, height: 3, color: 0x2f4f4f }, // Dark slate gray
    { x: 4, z: -9, radius: 0.8, height: 2, color: 0x556b2f }, // Dark olive green
    { x: -1, z: 6, radius: 0.3, height: 4, color: 0x8b4513 }, // Brown
  ];

  cylinderPositions.forEach((obstacle) => {
    // Create visual mesh
    const geometry = new THREE.CylinderGeometry(
      obstacle.radius,
      obstacle.radius,
      obstacle.height,
      8
    );
    const material = new THREE.MeshLambertMaterial({ color: obstacle.color });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(obstacle.x, obstacle.height / 2, obstacle.z);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    scene.add(cylinder);
    obstacles.push(cylinder);

    // Create physics body
    const cylinderShape = new CANNON.Cylinder(
      obstacle.radius,
      obstacle.radius,
      obstacle.height,
      8
    );
    const cylinderBody = new CANNON.Body({
      mass: 0, // Static obstacle
      position: new CANNON.Vec3(obstacle.x, obstacle.height / 2, obstacle.z),
      material: obstacleMaterial,
    });
    cylinderBody.addShape(cylinderShape);
    world.addBody(cylinderBody);
    obstaclePhysicsBodies.push(cylinderBody);
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
    carBody.position.y = Math.max(carBody.position.y, 0.5); // Force stay above ground
    carBody.velocity.x = 0; // Stop all physics velocity
    carBody.velocity.z = 0;
    carBody.velocity.y = Math.min(carBody.velocity.y, 0); // Only allow falling, not jumping
    carBody.angularVelocity.x = 0; // No pitch
    carBody.angularVelocity.y = 0; // No yaw momentum (prevents wobble)
    carBody.angularVelocity.z = 0; // No roll
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

    // Make camera follow the car (simple follow camera)
    const cameraOffset = 8; // Distance behind car
    const cameraHeight = 5; // Height above car

    // Calculate camera position based on car position and rotation
    const cameraTarget = new THREE.Vector3();
    const offset = new THREE.Vector3(0, cameraHeight, -cameraOffset);
    cameraTarget.copy(car.position).add(offset.applyQuaternion(car.quaternion));

    camera.position.lerp(cameraTarget, 0.1);

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
