// Game Manager - Main Module
import { PhysicsSystem } from "./physics.js";
import { SceneManager } from "./scene.js";
import { Car } from "./car.js";
import { WorldBuilder } from "./world.js";
import { InputManager } from "./input.js";
import { CameraController } from "./camera.js";

class GameManager {
  constructor() {
    this.clock = new THREE.Clock();
    this.isInitialized = false;

    // Initialize core systems
    this.physics = null;
    this.scene = null;
    this.car = null;
    this.world = null;
    this.input = null;
    this.cameraController = null;
  }

  async init() {
    console.log("🚀 Starting Car Game...");

    // Wait for libraries to load
    if (typeof THREE === "undefined") {
      console.error("❌ Three.js not loaded");
      document.getElementById("loading").innerHTML =
        "Error: Three.js failed to load";
      return;
    }

    console.log("✅ Three.js loaded, creating scene...");

    if (typeof CANNON === "undefined") {
      console.error("❌ Cannon.js not loaded");
      document.getElementById("loading").innerHTML =
        "Error: Cannon.js failed to load";
      return;
    }

    console.log("✅ Cannon.js loaded, setting up physics...");

    try {
      // Update loading message
      document.getElementById("loading").innerHTML = "Initializing physics...";

      // Initialize systems in order with progress updates
      this.physics = new PhysicsSystem();
      console.log("✅ Physics system created");

      document.getElementById("loading").innerHTML = "Creating scene...";
      this.scene = new SceneManager();
      console.log("✅ Scene manager created");

      document.getElementById("loading").innerHTML =
        "Building world environment...";
      // Add a small delay to let the page breathe
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.world = new WorldBuilder(this.scene, this.physics);
      console.log("✅ World builder created");

      document.getElementById("loading").innerHTML = "Creating car...";
      await new Promise((resolve) => setTimeout(resolve, 50));
      this.car = new Car(this.scene, this.physics);
      console.log("✅ Car created");
      this.input = new InputManager(this.car);
      this.cameraController = new CameraController(this.scene.camera, this.car);

      document.getElementById("loading").innerHTML = "Setting up UI...";
      // Setup UI
      this.setupUI();

      console.log("✅ All systems initialized");
      this.isInitialized = true;
      this.startGameLoop();

      // Hide loading screen
      document.getElementById("loading").style.display = "none";
      console.log("✅ Game initialized successfully!");
      console.log("🎮 Use WASD or Arrow Keys to drive the car!");
      console.log("🎥 Use 1, 2, 3 keys to switch camera modes!");
      console.log("🚧 Car will collide with obstacles - drive carefully!");
    } catch (error) {
      console.error("❌ Error initializing game:", error);
      console.error("❌ Stack trace:", error.stack);
      document.getElementById(
        "loading"
      ).innerHTML = `Error: Failed to initialize game<br><small>${error.message}</small>`;
    }
  }

  setupUI() {
    // Add camera selector UI if it doesn't exist
    if (!document.getElementById("camera-selector")) {
      this.createCameraUI();
    }

    // Initialize speedometer
    this.initializeSpeedometer();
  }

  createCameraUI() {
    // Create camera selector UI
    const cameraSelector = document.createElement("div");
    cameraSelector.id = "camera-selector";
    cameraSelector.innerHTML = `
      <strong>Camera:</strong>
      <button id="camera-1" class="camera-btn active">Follow</button>
      <button id="camera-2" class="camera-btn">Chase</button>
      <button id="camera-3" class="camera-btn">First Person</button>
    `;

    // Add CSS styling
    cameraSelector.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 1150px;
      color: white;
      font-size: 14px;
      z-index: 100;
      background: rgba(0, 0, 0, 0.5);
      padding: 15px;
      border-radius: 10px;
      backdrop-filter: blur(10px);
    `;

    document.body.appendChild(cameraSelector);

    // Style the buttons
    const buttons = cameraSelector.querySelectorAll(".camera-btn");
    buttons.forEach((btn) => {
      btn.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 8px 12px;
        margin: 0 5px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
      `;

      btn.addEventListener("mouseover", () => {
        if (!btn.classList.contains("active")) {
          btn.style.background = "rgba(255, 255, 255, 0.2)";
          btn.style.borderColor = "rgba(255, 255, 255, 0.5)";
        }
      });

      btn.addEventListener("mouseout", () => {
        if (!btn.classList.contains("active")) {
          btn.style.background = "rgba(255, 255, 255, 0.1)";
          btn.style.borderColor = "rgba(255, 255, 255, 0.3)";
        }
      });
    });

    // Set active button style
    const activeBtn = cameraSelector.querySelector(".active");
    if (activeBtn) {
      activeBtn.style.background = "rgba(0, 255, 136, 0.3)";
      activeBtn.style.borderColor = "#00ff88";
      activeBtn.style.color = "#00ff88";
    }

    // Setup button click handlers
    document
      .getElementById("camera-1")
      .addEventListener("click", () => this.switchCameraButton(1));
    document
      .getElementById("camera-2")
      .addEventListener("click", () => this.switchCameraButton(2));
    document
      .getElementById("camera-3")
      .addEventListener("click", () => this.switchCameraButton(3));

    // Add keyboard event listeners for 1, 2, 3 keys
    document.addEventListener("keydown", (event) => {
      if (event.code === "Digit1") {
        this.switchCameraButton(1);
      } else if (event.code === "Digit2") {
        this.switchCameraButton(2);
      } else if (event.code === "Digit3") {
        this.switchCameraButton(3);
      }
    });

    // Update controls text
    const controlsElement = document.getElementById("controls");
    if (controlsElement) {
      controlsElement.innerHTML = `
        <strong>Controls:</strong><br />
        WASD or Arrow Keys - Drive<br />
        Mouse - Look Around (Follow cam)<br />
        1, 2, 3 - Camera Modes
      `;
    }
  }

  initializeSpeedometer() {
    const speedElement = document.getElementById("speed");
    if (speedElement) {
      speedElement.innerText = "0";
      console.log("✅ Speedometer initialized");
    } else {
      console.warn("⚠️ Speed element not found in DOM");
    }
  }

  switchCameraButton(mode) {
    // Update button states
    document.querySelectorAll(".camera-btn").forEach((btn) => {
      btn.classList.remove("active");
      btn.style.background = "rgba(255, 255, 255, 0.1)";
      btn.style.borderColor = "rgba(255, 255, 255, 0.3)";
      btn.style.color = "white";
    });

    const activeBtn = document.getElementById(`camera-${mode}`);
    activeBtn.classList.add("active");
    activeBtn.style.background = "rgba(0, 255, 136, 0.3)";
    activeBtn.style.borderColor = "#00ff88";
    activeBtn.style.color = "#00ff88";

    // Switch camera mode
    this.cameraController.switchCamera(mode);
  }

  startGameLoop() {
    this.animate();
  }

  animate() {
    if (!this.isInitialized) return;

    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();

    // Step physics simulation
    this.physics.step(1 / 60, deltaTime, 3);

    // Update car movement
    this.input.updateCarMovement(deltaTime);

    // Update car visual representation
    this.car.update();

    // Update camera
    this.cameraController.update(this.input);

    // Update grass animation
    this.world.updateGrassAnimation(deltaTime);

    // Update speedometer
    if (this.car) {
      this.updateSpeedometer();
    }

    // Render the scene
    this.scene.render();
  }

  updateSpeedometer() {
    try {
      const physicsBody = this.car.getPhysicsBody();
      if (!physicsBody || !physicsBody.velocity) {
        // Set speedometer to 0 if no physics body
        const speedElement = document.getElementById("speed");
        if (speedElement) {
          speedElement.innerText = "0";
        }
        return;
      }

      const speed = physicsBody.velocity.length();
      const speedElement = document.getElementById("speed");
      if (speedElement) {
        const speedKmh = Math.round(speed * 3.6); // Convert m/s to km/h
        speedElement.innerText = speedKmh.toString();
      } else {
        console.warn("Speed element not found in DOM");
      }
    } catch (error) {
      console.error("Error updating speedometer:", error);
      // Fallback to 0 speed
      const speedElement = document.getElementById("speed");
      if (speedElement) {
        speedElement.innerText = "0";
      }
    }
  }

  // Handle window resize
  onWindowResize() {
    if (!this.scene) return;

    this.scene.camera.aspect = window.innerWidth / window.innerHeight;
    this.scene.camera.updateProjectionMatrix();
    this.scene.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Initialize game when page loads
window.addEventListener("load", () => {
  const game = new GameManager();
  game.init();

  // Handle window resize
  window.addEventListener("resize", () => game.onWindowResize());

  // Make game globally accessible for debugging
  window.game = game;
});

export default GameManager;
