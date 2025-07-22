// World/Environment Module
export class WorldBuilder {
  constructor(scene, physicsSystem) {
    this.scene = scene;
    this.physics = physicsSystem;
    this.obstacles = [];
    this.obstaclePhysicsBodies = [];
    
    this.createGround();
    this.createRoadSystem();
    this.createObstacleCourse();
  }

  createGround() {
    // Create a much larger flat plane for the ground
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMeshMaterial = new THREE.MeshPhongMaterial({
      color: 0x2d5a2d,
      shininess: 15,
      specular: 0x333333,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMeshMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add grass patches for texture variation
    this.addGrassPatches();

    // Create ground physics body
    this.physics.createGroundBody();
  }

  addGrassPatches() {
    for (let i = 0; i < 50; i++) {
      const patchGeometry = new THREE.CircleGeometry(Math.random() * 15 + 8, 16);
      const patchMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(0.25, 0.7, 0.35 + Math.random() * 0.25),
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
      this.scene.add(patch);
    }
  }

  createRoadSystem() {
    const roadSegments = [
      // Main highway (north-south)
      { x: 0, z: 0, width: 12, length: 80, rotation: 0 },
      { x: 0, z: 80, width: 12, length: 80, rotation: 0 },
      { x: 0, z: -80, width: 12, length: 80, rotation: 0 },

      // Cross highway (east-west)
      { x: 0, z: 0, width: 12, length: 80, rotation: Math.PI / 2 },
      { x: 80, z: 0, width: 12, length: 80, rotation: Math.PI / 2 },
      { x: -80, z: 0, width: 12, length: 80, rotation: Math.PI / 2 },

      // Secondary roads
      { x: 40, z: 40, width: 10, length: 60, rotation: 0 },
      { x: -40, z: 40, width: 10, length: 60, rotation: 0 },
      { x: 40, z: -40, width: 10, length: 60, rotation: 0 },
      { x: -40, z: -40, width: 10, length: 60, rotation: 0 },

      // Diagonal roads
      { x: 60, z: 60, width: 8, length: 50, rotation: Math.PI / 4 },
      { x: -60, z: 60, width: 8, length: 50, rotation: -Math.PI / 4 },
      { x: 60, z: -60, width: 8, length: 50, rotation: -Math.PI / 4 },
      { x: -60, z: -60, width: 8, length: 50, rotation: Math.PI / 4 },

      // Outer ring roads
      { x: 120, z: 0, width: 8, length: 40, rotation: 0 },
      { x: -120, z: 0, width: 8, length: 40, rotation: 0 },
      { x: 0, z: 120, width: 8, length: 40, rotation: Math.PI / 2 },
      { x: 0, z: -120, width: 8, length: 40, rotation: Math.PI / 2 },

      // Additional sections
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
      this.createRoadSegment(road);
    });
  }

  createRoadSegment(road) {
    // Road surface
    const roadGeometry = new THREE.PlaneGeometry(road.width, road.length);
    const roadMaterial = new THREE.MeshPhongMaterial({
      color: 0x404040,
      shininess: 20,
      specular: 0x222222,
    });
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.rotation.z = road.rotation;
    roadMesh.position.set(road.x, 0.01, road.z);
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);

    // Road markings
    this.addRoadMarkings(road);
  }

  addRoadMarkings(road) {
    // Center line (yellow)
    const lineGeometry = new THREE.PlaneGeometry(0.15, road.length * 0.8);
    const lineMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      emissive: 0x221100,
      shininess: 50,
    });
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.rotation.z = road.rotation;
    centerLine.position.set(road.x, 0.02, road.z);
    this.scene.add(centerLine);

    // Edge lines (white)
    const edgeMaterial = new THREE.MeshPhongMaterial({
      color: 0xf5f5f5,
      shininess: 30,
    });

    const leftEdgeGeometry = new THREE.PlaneGeometry(0.1, road.length * 0.9);
    const leftOffset = road.width / 2 - 0.3;

    // Left edge
    const leftEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
    leftEdge.rotation.x = -Math.PI / 2;
    leftEdge.rotation.z = road.rotation;
    leftEdge.position.set(
      road.x - leftOffset * Math.cos(road.rotation),
      0.015,
      road.z + leftOffset * Math.sin(road.rotation)
    );
    this.scene.add(leftEdge);

    // Right edge
    const rightEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
    rightEdge.rotation.x = -Math.PI / 2;
    rightEdge.rotation.z = road.rotation;
    rightEdge.position.set(
      road.x + leftOffset * Math.cos(road.rotation),
      0.015,
      road.z - leftOffset * Math.sin(road.rotation)
    );
    this.scene.add(rightEdge);
  }

  createObstacleCourse() {
    this.createBarriers();
    this.createTrafficCones();
    this.createBuildings();
    this.createPillars();
    this.createRamps();
  }

  createBarriers() {
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
      this.createObstacle('box', barrier);
    });
  }

  createTrafficCones() {
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

      // Additional areas
      { x: 35, z: 60, color: 0xff4500 },
      { x: 45, z: 65, color: 0xff4500 },
      { x: 35, z: 70, color: 0xff4500 },
      { x: 45, z: 75, color: 0xff4500 },
      { x: 120, z: 25, color: 0xff4500 },
      { x: 115, z: 30, color: 0xff4500 },
      { x: 120, z: 35, color: 0xff4500 },
      { x: -120, z: -25, color: 0xff4500 },
      { x: -115, z: -30, color: 0xff4500 },
      { x: -120, z: -35, color: 0xff4500 },
    ];

    cones.forEach((cone) => {
      this.createCone(cone);
    });
  }

  createBuildings() {
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

      // Additional districts
      { x: 30, z: 80, width: 5, height: 6, depth: 5, color: 0x8b4513 },
      { x: 50, z: 90, width: 3, height: 4, depth: 3, color: 0x708090 },
      { x: 20, z: 100, width: 4, height: 7, depth: 4, color: 0x2f4f4f },
      { x: -30, z: 80, width: 6, height: 5, depth: 4, color: 0x654321 },
      { x: -50, z: 90, width: 3, height: 6, depth: 5, color: 0x696969 },
      { x: 30, z: -80, width: 4, height: 5, depth: 4, color: 0x708090 },
      { x: 50, z: -90, width: 5, height: 7, depth: 3, color: 0x8b4513 },
      { x: 20, z: -100, width: 3, height: 4, depth: 6, color: 0x2f4f4f },
      { x: -30, z: -80, width: 6, height: 6, depth: 4, color: 0x654321 },
      { x: -50, z: -90, width: 4, height: 8, depth: 4, color: 0x696969 },

      // Suburban areas
      { x: 130, z: 60, width: 8, height: 3, depth: 6, color: 0x8b4513 },
      { x: -130, z: 60, width: 6, height: 4, depth: 8, color: 0x696969 },
      { x: 130, z: -60, width: 7, height: 5, depth: 5, color: 0x708090 },
      { x: -130, z: -60, width: 5, height: 6, depth: 7, color: 0x654321 },
    ];

    buildings.forEach((building) => {
      this.createObstacle('box', building);
    });
  }

  createPillars() {
    const pillars = [
      { x: -15, z: 60, radius: 0.5, height: 3, color: 0x2f4f4f },
      { x: 15, z: 60, radius: 0.5, height: 3, color: 0x2f4f4f },
      { x: -15, z: -60, radius: 0.4, height: 4, color: 0x8b4513 },
      { x: 15, z: -60, radius: 0.4, height: 4, color: 0x8b4513 },
      { x: 65, z: 0, radius: 0.6, height: 3.5, color: 0x556b2f },
      { x: 85, z: 25, radius: 0.5, height: 4, color: 0x2f4f4f },
      { x: 105, z: -15, radius: 0.4, height: 2.5, color: 0x8b4513 },
      { x: 125, z: 35, radius: 0.7, height: 3, color: 0x556b2f },
      { x: -65, z: 0, radius: 0.6, height: 3.5, color: 0x556b2f },
      { x: -85, z: 25, radius: 0.5, height: 4, color: 0x2f4f4f },
      { x: -105, z: -15, radius: 0.4, height: 2.5, color: 0x8b4513 },
      { x: -125, z: 35, radius: 0.7, height: 3, color: 0x556b2f },
    ];

    pillars.forEach((pillar) => {
      this.createCylinder(pillar);
    });
  }

  createRamps() {
    const ramps = [
      { x: 70, z: -10, width: 8, height: 0.8, depth: 4, rotation: Math.PI / 12 },
      { x: -70, z: -10, width: 8, height: 0.8, depth: 4, rotation: -Math.PI / 12 },
      { x: 40, z: 110, width: 6, height: 0.6, depth: 3, rotation: Math.PI / 15 },
      { x: -40, z: 110, width: 6, height: 0.6, depth: 3, rotation: -Math.PI / 15 },
      { x: 40, z: -110, width: 6, height: 0.6, depth: 3, rotation: Math.PI / 15 },
      { x: -40, z: -110, width: 6, height: 0.6, depth: 3, rotation: -Math.PI / 15 },
      { x: 140, z: 20, width: 10, height: 1.0, depth: 5, rotation: Math.PI / 10 },
      { x: -140, z: 20, width: 10, height: 1.0, depth: 5, rotation: -Math.PI / 10 },
    ];

    ramps.forEach((ramp) => {
      this.createRamp(ramp);
    });
  }

  createObstacle(type, params) {
    const geometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
    const material = new THREE.MeshLambertMaterial({ color: params.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(params.x, params.height / 2, params.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.obstacles.push(mesh);

    // Physics body
    const shape = new CANNON.Box(
      new CANNON.Vec3(params.width / 2, params.height / 2, params.depth / 2)
    );
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(params.x, params.height / 2, params.z),
      material: this.physics.materials.obstacle,
    });
    body.addShape(shape);
    this.physics.addBody(body);
    this.obstaclePhysicsBodies.push(body);
  }

  createCone(params) {
    const coneGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
    const coneMaterial = new THREE.MeshLambertMaterial({ color: params.color });
    const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    coneMesh.position.set(params.x, 0.4, params.z);
    coneMesh.castShadow = true;
    this.scene.add(coneMesh);
    this.obstacles.push(coneMesh);

    // Physics body
    const coneShape = new CANNON.Cylinder(0.3, 0.1, 0.8, 8);
    const coneBody = new CANNON.Body({
      mass: 5,
      position: new CANNON.Vec3(params.x, 0.4, params.z),
      material: this.physics.materials.obstacle,
    });
    coneBody.addShape(coneShape);
    this.physics.addBody(coneBody);
    this.obstaclePhysicsBodies.push(coneBody);
  }

  createCylinder(params) {
    const geometry = new THREE.CylinderGeometry(params.radius, params.radius, params.height, 8);
    const material = new THREE.MeshLambertMaterial({ color: params.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(params.x, params.height / 2, params.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.obstacles.push(mesh);

    // Physics body
    const shape = new CANNON.Cylinder(params.radius, params.radius, params.height, 8);
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(params.x, params.height / 2, params.z),
      material: this.physics.materials.obstacle,
    });
    body.addShape(shape);
    this.physics.addBody(body);
    this.obstaclePhysicsBodies.push(body);
  }

  createRamp(params) {
    const geometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
    const material = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(params.x, params.height / 2, params.z);
    mesh.rotation.x = params.rotation;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.obstacles.push(mesh);

    // Physics body
    const shape = new CANNON.Box(
      new CANNON.Vec3(params.width / 2, params.height / 2, params.depth / 2)
    );
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(params.x, params.height / 2, params.z),
      material: this.physics.materials.obstacle,
    });
    body.addShape(shape);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), params.rotation);
    this.physics.addBody(body);
    this.obstaclePhysicsBodies.push(body);
  }
}
