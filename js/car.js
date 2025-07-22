// Car Module
export class Car {
  constructor(scene, physicsSystem) {
    this.scene = scene;
    this.physics = physicsSystem;
    this.group = new THREE.Group();
    this.wheels = [];
    this.physicsBody = null;
    
    this.createVisualModel();
    this.createPhysicsBody();
  }

  createVisualModel() {
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
    this.group.add(carBodyMesh);

    // Car hood (front section)
    const hoodGeometry = new THREE.BoxGeometry(1.6, 0.3, 1.2);
    const hoodMaterial = new THREE.MeshPhongMaterial({
      color: 0xb71c1c, // Darker red
      shininess: 120,
    });
    const carHood = new THREE.Mesh(hoodGeometry, hoodMaterial);
    carHood.position.set(0, 0.15, 1.8);
    carHood.castShadow = true;
    this.group.add(carHood);

    // Car roof/cabin
    const roofGeometry = new THREE.BoxGeometry(1.4, 0.6, 2.2);
    const roofMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a, // Very dark gray
      shininess: 80,
    });
    const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
    carRoof.position.y = 0.55;
    carRoof.castShadow = true;
    this.group.add(carRoof);

    this.addWindows();
    this.addLights();
    this.createWheels();

    // Position the entire car above ground so it falls down
    this.group.position.y = 2;
    this.scene.add(this.group);
  }

  addWindows() {
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
    this.group.add(windshield);

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
    this.group.add(leftWindow);

    const rightWindow = new THREE.Mesh(sideWindowGeometry, sideWindowMaterial);
    rightWindow.position.set(0.71, 0.6, 0);
    rightWindow.rotation.y = -Math.PI / 2;
    this.group.add(rightWindow);
  }

  addLights() {
    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const headlightMaterial = new THREE.MeshPhongMaterial({
      color: 0xfffff0,
      emissive: 0x888844,
      shininess: 150,
    });

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.6, 0.1, 2.0);
    this.group.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.6, 0.1, 2.0);
    this.group.add(rightHeadlight);

    // Taillights
    const taillightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const taillightMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0x220000,
      shininess: 100,
    });

    const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
    leftTaillight.position.set(-0.6, 0.1, -2.0);
    this.group.add(leftTaillight);

    const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
    rightTaillight.position.set(0.6, 0.1, -2.0);
    this.group.add(rightTaillight);
  }

  createWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
    const wheelMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      shininess: 30,
    });

    const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.27, 16);
    const rimMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      shininess: 100,
      specular: 0x444444,
    });

    const wheelPositions = [
      [-0.9, 1.3], // Front left
      [0.9, 1.3], // Front right
      [-0.9, -1.3], // Rear left
      [0.9, -1.3], // Rear right
    ];

    wheelPositions.forEach((pos) => {
      // Main wheel (tire)
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(pos[0], -0.25, pos[1]);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      this.group.add(wheel);
      this.wheels.push(wheel);

      // Wheel rim (decorative)
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.position.set(pos[0], -0.25, pos[1]);
      rim.rotation.z = Math.PI / 2;
      rim.castShadow = true;
      this.group.add(rim);
    });
  }

  createPhysicsBody() {
    this.physicsBody = this.physics.createCarBody({ x: 0, y: 2, z: 0 });
  }

  update() {
    // Sync Three.js car with Cannon.js physics body
    this.group.position.copy(this.physicsBody.position);
    this.group.quaternion.copy(this.physicsBody.quaternion);
  }

  animateWheels(moveSpeed, turnSpeed, deltaTime) {
    if (moveSpeed !== 0) {
      const wheelRotationSpeed = moveSpeed * deltaTime * 0.8;
      this.wheels.forEach((wheel, index) => {
        // Front wheels (index 0 and 1) also turn with steering
        if (index < 2 && turnSpeed !== 0) {
          wheel.rotation.y = turnSpeed * 0.02;
        } else if (index >= 2) {
          wheel.rotation.y = 0;
        }

        // All wheels rotate when moving
        wheel.rotation.x += wheelRotationSpeed;
      });
    } else {
      // Reset front wheel steering when not turning
      this.wheels[0].rotation.y = 0;
      this.wheels[1].rotation.y = 0;
    }
  }

  getPosition() {
    return this.group.position;
  }

  getPhysicsBody() {
    return this.physicsBody;
  }
}
