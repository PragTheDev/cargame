// Step 2: Add ground and lighting
console.log("🚀 Starting Step 2: Adding ground and lighting");

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

  // === CUBE (updated to cast shadows) ===
  const cubeGeometry = new THREE.BoxGeometry();
  const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 }); // Red cube
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.y = 1.5; // Lift it above the ground
  cube.castShadow = true; // Cube creates shadows
  scene.add(cube);
  // Position camera
  camera.position.set(0, 5, 8); // Move camera up and back for better view
  camera.lookAt(0, 0, 0); // Point camera at the center

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Rotate the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
  }

  // Hide loading and start animation
  document.getElementById("loading").style.display = "none";
  console.log("✅ Step 2 complete: Ground and lighting added!");
  animate();
});
