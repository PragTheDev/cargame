// Input/Controls Module
export class InputManager {
  constructor(car) {
    this.car = car;
    this.keys = {};
    this.setupKeyboardControls();
    this.setupMouseControls();
    
    // Camera controls
    this.isMouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.cameraAngleX = 0;
    this.cameraAngleY = 5;
  }

  setupKeyboardControls() {
    // Listen for key presses
    document.addEventListener("keydown", (event) => {
      this.keys[event.code] = true;
    });

    // Listen for key releases
    document.addEventListener("keyup", (event) => {
      this.keys[event.code] = false;
    });
  }

  setupMouseControls() {
    // Mouse down event
    document.addEventListener("mousedown", (event) => {
      this.isMouseDown = true;
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
      document.body.style.cursor = "grabbing";
    });

    // Mouse up event
    document.addEventListener("mouseup", () => {
      this.isMouseDown = false;
      document.body.style.cursor = "default";
    });

    // Mouse move event
    document.addEventListener("mousemove", (event) => {
      if (!this.isMouseDown) return;

      const deltaX = event.clientX - this.mouseX;
      const deltaY = event.clientY - this.mouseY;

      // Update camera angles
      this.cameraAngleX += deltaX * 0.01;
      this.cameraAngleY -= deltaY * 0.01;

      // Limit vertical angle to prevent flipping
      this.cameraAngleY = Math.max(-Math.PI / 3, Math.min(Math.PI / 2, this.cameraAngleY));

      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    });
  }

  updateCarMovement(deltaTime) {
    let moveSpeed = 0;
    let turnSpeed = 0;

    // FORWARD - W key or Up arrow
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) {
      moveSpeed = 20;
    }

    // BACKWARD - S key or Down arrow
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) {
      moveSpeed = -12;
    }

    // LEFT TURN - A key or Left arrow
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) {
      turnSpeed = 10;
    }

    // RIGHT TURN - D key or Right arrow
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) {
      turnSpeed = -10;
    }

    const carBody = this.car.getPhysicsBody();

    // Apply rotation first
    if (turnSpeed !== 0) {
      const currentRotation = Math.atan2(
        2 * (carBody.quaternion.w * carBody.quaternion.y + carBody.quaternion.x * carBody.quaternion.z),
        1 - 2 * (carBody.quaternion.y * carBody.quaternion.y + carBody.quaternion.z * carBody.quaternion.z)
      );

      const newRotation = currentRotation + turnSpeed * deltaTime * 0.1;
      carBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), newRotation);
    }

    // Apply movement
    if (moveSpeed !== 0) {
      const currentRotation = Math.atan2(
        2 * (carBody.quaternion.w * carBody.quaternion.y + carBody.quaternion.x * carBody.quaternion.z),
        1 - 2 * (carBody.quaternion.y * carBody.quaternion.y + carBody.quaternion.z * carBody.quaternion.z)
      );

      carBody.position.x += Math.sin(currentRotation) * moveSpeed * deltaTime;
      carBody.position.z += Math.cos(currentRotation) * moveSpeed * deltaTime;
    }

    // Keep car stable on ground
    carBody.position.y = Math.max(carBody.position.y, 0.45);
    carBody.velocity.x = 0;
    carBody.velocity.z = 0;
    carBody.velocity.y = Math.min(carBody.velocity.y, 0);
    carBody.angularVelocity.x = 0;
    carBody.angularVelocity.y = 0;
    carBody.angularVelocity.z = 0;

    // Animate wheels
    this.car.animateWheels(moveSpeed, turnSpeed, deltaTime);

    return { moveSpeed, turnSpeed };
  }

  getCameraAngles() {
    return {
      x: this.cameraAngleX,
      y: this.cameraAngleY
    };
  }
}
