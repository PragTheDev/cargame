// Step 4: Add keyboard controls
console.log("🚀 Starting Step 4: Adding keyboard controls");

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
  const groundGeometry = new THREE.PlaneGeometry(20, 20); // 20x20 units
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90ee90 }); // Light green
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // Rotate 90 degrees to make it horizontal
  ground.receiveShadow = true; // Ground can receive shadows
  scene.add(ground);

  // === CAR CREATION ===
  // Create a group to hold all car parts together
  const car = new THREE.Group();

  // Car body (main rectangle)
  const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 4); // width, height, length
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 }); // Red
  const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
  carBody.position.y = 0.25; // Lift body above ground
  carBody.castShadow = true;
  car.add(carBody);

  // Car roof/cabin (smaller box on top)
  const roofGeometry = new THREE.BoxGeometry(1.5, 0.6, 2); // Smaller than body
  const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark gray
  const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
  carRoof.position.y = 0.8; // On top of the body
  carRoof.castShadow = true;
  car.add(carRoof);

  // Create 4 wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8); // radius, radius, height, segments
  const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 }); // Dark gray/black

  // Wheel positions: [x, z] relative to car center
  const wheelPositions = [
    [-0.8, 1.2], // Front left
    [0.8, 1.2], // Front right
    [-0.8, -1.2], // Rear left
    [0.8, -1.2], // Rear right
  ];

  // Create each wheel
  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(pos[0], 0.3, pos[1]); // x, y, z position
    wheel.rotation.z = Math.PI / 2; // Rotate wheel to be vertical
    wheel.castShadow = true;
    car.add(wheel);
  });

  // Position the entire car above ground
  car.position.y = 0.7;
  scene.add(car);

  // === KEYBOARD CONTROLS ===
  // Object to track which keys are currently pressed
  const keys = {};

  // Car movement variables
  let carSpeed = 0; // How fast the car is moving
  let carRotation = 0; // Which direction the car is facing
  const maxSpeed = 0.1; // Maximum speed
  const acceleration = 0.005; // How quickly it speeds up
  const friction = 0.95; // How quickly it slows down (0.95 = loses 5% speed each frame)
  const turnSpeed = 0.03; // How fast it turns

  // Listen for key presses
  document.addEventListener("keydown", (event) => {
    keys[event.code] = true; // Mark this key as pressed
  });

  // Listen for key releases
  document.addEventListener("keyup", (event) => {
    keys[event.code] = false; // Mark this key as not pressed
  });

  // Function to update car movement based on pressed keys
  function updateCarMovement() {
    // FORWARD - W key or Up arrow
    if (keys["KeyW"] || keys["ArrowUp"]) {
      carSpeed = Math.min(carSpeed + acceleration, maxSpeed); // Speed up, but don't exceed max
    }

    // BACKWARD - S key or Down arrow
    if (keys["KeyS"] || keys["ArrowDown"]) {
      carSpeed = Math.max(carSpeed - acceleration, -maxSpeed * 0.5); // Reverse slower than forward
    }

    // LEFT TURN - A key or Left arrow (only when moving)
    if (keys["KeyA"] || keys["ArrowLeft"]) {
      if (Math.abs(carSpeed) > 0.001) {
        // Only turn if car is moving
        carRotation += turnSpeed * (carSpeed > 0 ? 1 : -1); // Reverse steering when going backward
      }
    }

    // RIGHT TURN - D key or Right arrow (only when moving)
    if (keys["KeyD"] || keys["ArrowRight"]) {
      if (Math.abs(carSpeed) > 0.001) {
        // Only turn if car is moving
        carRotation -= turnSpeed * (carSpeed > 0 ? 1 : -1); // Reverse steering when going backward
      }
    }

    // Apply friction - car gradually slows down when no keys pressed
    carSpeed *= friction;

    // Stop very slow movement (prevents tiny jittery movements)
    if (Math.abs(carSpeed) < 0.001) {
      carSpeed = 0;
    }

    // Update car rotation
    car.rotation.y = carRotation;

    // Move car forward/backward in the direction it's facing
    car.position.x += Math.sin(carRotation) * carSpeed;
    car.position.z += Math.cos(carRotation) * carSpeed;
  }
  // Position camera
  camera.position.set(0, 5, 8); // Move camera up and back for better view

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Update car movement based on keyboard input
    updateCarMovement();

    // Make camera follow the car (simple follow camera)
    const cameraOffset = 8; // Distance behind car
    const cameraHeight = 5; // Height above car

    // Calculate camera position based on car position and rotation
    camera.position.x = car.position.x - Math.sin(carRotation) * cameraOffset;
    camera.position.z = car.position.z - Math.cos(carRotation) * cameraOffset;
    camera.position.y = car.position.y + cameraHeight;

    // Point camera at the car
    camera.lookAt(car.position);

    renderer.render(scene, camera);
  }

  // Hide loading and start animation
  document.getElementById("loading").style.display = "none";
  console.log("✅ Step 4 complete: Keyboard controls added!");
  console.log("🎮 Use WASD or Arrow Keys to drive the car!");
  animate();
});
