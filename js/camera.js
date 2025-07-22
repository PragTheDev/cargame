// Camera Module
export class CameraController {
  constructor(camera, car) {
    this.camera = camera;
    this.car = car;
    this.currentMode = 1; // 1: Follow, 2: Chase, 3: First Person
    this.setupCameraSwitching();
  }

  setupCameraSwitching() {
    // Camera switching with number keys
    document.addEventListener("keydown", (event) => {
      if (event.code === "Digit1") {
        this.switchCamera(1);
      } else if (event.code === "Digit2") {
        this.switchCamera(2);
      } else if (event.code === "Digit3") {
        this.switchCamera(3);
      }
    });

    // Camera button controls (if UI exists)
    try {
      document
        .getElementById("camera-1")
        ?.addEventListener("click", () => this.switchCamera(1));
      document
        .getElementById("camera-2")
        ?.addEventListener("click", () => this.switchCamera(2));
      document
        .getElementById("camera-3")
        ?.addEventListener("click", () => this.switchCamera(3));
    } catch (e) {
      // UI elements don't exist yet, that's okay
    }
  }

  switchCamera(mode) {
    this.currentMode = mode;

    // Update button states if they exist
    try {
      document
        .querySelectorAll(".camera-btn")
        .forEach((btn) => btn.classList.remove("active"));
      document.getElementById(`camera-${mode}`)?.classList.add("active");
    } catch (e) {
      // UI elements don't exist, that's okay
    }
  }

  update(inputManager) {
    switch (this.currentMode) {
      case 1: // Follow Camera (mouse-controlled)
        this.updateFollowCamera(inputManager);
        break;
      case 2: // Chase Camera (fixed behind car)
        this.updateChaseCamera();
        break;
      case 3: // First Person Camera
        this.updateFirstPersonCamera();
        break;
    }
  }

  updateFollowCamera(inputManager) {
    const cameraDistance = 12;
    const angles = inputManager.getCameraAngles();
    const carPosition = this.car.getPosition();

    // Calculate camera position using spherical coordinates
    const cameraX =
      carPosition.x + Math.sin(angles.x) * Math.cos(angles.y) * cameraDistance;
    const cameraY = carPosition.y + Math.sin(angles.y) * cameraDistance + 2;
    const cameraZ =
      carPosition.z + Math.cos(angles.x) * Math.cos(angles.y) * cameraDistance;

    // Smoothly move camera to target position
    const targetPosition = new THREE.Vector3(cameraX, cameraY, cameraZ);
    this.camera.position.lerp(targetPosition, 0.1);
    this.camera.lookAt(carPosition);
  }

  updateChaseCamera() {
    const carBody = this.car.getPhysicsBody();
    const carPosition = this.car.getPosition();

    // Get car's rotation for positioning camera behind it
    const carRotation = Math.atan2(
      2 *
        (carBody.quaternion.w * carBody.quaternion.y +
          carBody.quaternion.x * carBody.quaternion.z),
      1 -
        2 *
          (carBody.quaternion.y * carBody.quaternion.y +
            carBody.quaternion.z * carBody.quaternion.z)
    );

    // Position camera behind the car
    const distance = 10;
    const height = 5;
    const cameraX = carPosition.x - Math.sin(carRotation) * distance;
    const cameraY = carPosition.y + height;
    const cameraZ = carPosition.z - Math.cos(carRotation) * distance;

    const targetPosition = new THREE.Vector3(cameraX, cameraY, cameraZ);
    this.camera.position.lerp(targetPosition, 0.1);
    this.camera.lookAt(carPosition);
  }

  updateFirstPersonCamera() {
    const carBody = this.car.getPhysicsBody();
    const carPosition = this.car.getPosition();

    // Position camera inside the car, slightly forward and up
    const carRotation = Math.atan2(
      2 *
        (carBody.quaternion.w * carBody.quaternion.y +
          carBody.quaternion.x * carBody.quaternion.z),
      1 -
        2 *
          (carBody.quaternion.y * carBody.quaternion.y +
            carBody.quaternion.z * carBody.quaternion.z)
    );

    const cameraX = carPosition.x + Math.sin(carRotation) * 0.5;
    const cameraY = carPosition.y + 1.2; // Inside car height
    const cameraZ = carPosition.z + Math.cos(carRotation) * 0.5;

    // Look ahead in the direction the car is facing
    const lookAheadDistance = 20;
    const lookAtX = carPosition.x + Math.sin(carRotation) * lookAheadDistance;
    const lookAtY = carPosition.y + 0.5;
    const lookAtZ = carPosition.z + Math.cos(carRotation) * lookAheadDistance;

    this.camera.position.set(cameraX, cameraY, cameraZ);
    this.camera.lookAt(new THREE.Vector3(lookAtX, lookAtY, lookAtZ));
  }
}
