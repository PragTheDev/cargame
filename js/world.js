// World/Environment Module
export class WorldBuilder {
  constructor(scene, physicsSystem) {
    this.scene = scene;
    this.physics = physicsSystem;
    this.obstacles = [];
    this.obstaclePhysicsBodies = [];
    this.grassBlades = []; // Store grass blades for animation
    this.windTime = 0; // For wind animation

    this.createGround();
    this.createRoadSystem();
    this.createScenery(); // Replace obstacle course with scenery
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

    // Add realistic waving grass
    this.addWavingGrass();

    // Create ground physics body
    this.physics.createGroundBody();
  }

  addGrassPatches() {
    for (let i = 0; i < 50; i++) {
      const patchGeometry = new THREE.CircleGeometry(
        Math.random() * 15 + 8,
        16
      );
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

  addWavingGrass() {
    // Create grass in bunches/clusters for more realistic distribution
    // Reduced count for better performance
    const grassClusterCount = 150; // Reduced from 400
    const grassAreaSize = 400;

    for (let cluster = 0; cluster < grassClusterCount; cluster++) {
      const clusterX = (Math.random() - 0.5) * grassAreaSize;
      const clusterZ = (Math.random() - 0.5) * grassAreaSize;

      // Avoid roads - simple check for main roads
      if (this.isNearRoad(clusterX, clusterZ)) continue;

      // Create fewer grass blades per cluster for performance
      const bladesPerCluster = 4 + Math.floor(Math.random() * 6); // 4-10 blades per cluster (reduced from 8-20)
      const clusterRadius = 0.8 + Math.random() * 1.2; // Cluster spread radius

      for (let blade = 0; blade < bladesPerCluster; blade++) {
        // Position blades within the cluster radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * clusterRadius;
        const bladeX = clusterX + Math.cos(angle) * distance;
        const bladeZ = clusterZ + Math.sin(angle) * distance;

        this.createGrassBlade(bladeX, bladeZ);
      }
    }
  }

  createGrassBlade(x, z) {
    // Create individual grass blade geometry with fewer segments for performance
    const grassHeight = 0.8 + Math.random() * 1.2;
    const grassWidth = 0.05 + Math.random() * 0.03;

    // Reduced segments for better performance
    const segments = 2; // Reduced from 4
    const grassGeometry = new THREE.PlaneGeometry(
      grassWidth,
      grassHeight,
      1,
      segments
    );

    // Modify vertices to create a more natural grass shape (narrower at top)
    const vertices = grassGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const y = vertices[i + 1]; // Y coordinate
      const normalizedY = (y + grassHeight / 2) / grassHeight; // 0 to 1 from bottom to top
      const widthMultiplier = 1 - normalizedY * 0.7; // Narrows toward top
      vertices[i] *= widthMultiplier; // X coordinate
    }
    grassGeometry.attributes.position.needsUpdate = true;

    // Simpler grass material for performance
    const hue = 0.25 + (Math.random() - 0.5) * 0.1; // Green with slight variation
    const saturation = 0.6 + Math.random() * 0.3;
    const lightness = 0.2 + Math.random() * 0.4;

    const grassMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(hue, saturation, lightness),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });

    const grassBlade = new THREE.Mesh(grassGeometry, grassMaterial);

    // Position the grass blade
    grassBlade.position.set(x, grassHeight / 2, z);
    grassBlade.rotation.y = Math.random() * Math.PI * 2; // Random rotation

    // Store original position and properties for animation
    grassBlade.userData = {
      originalY: grassHeight / 2,
      windPhase: Math.random() * Math.PI * 2,
      windStrength: 0.2 + Math.random() * 0.3, // Reduced wind strength for less computation
      originalRotationY: grassBlade.rotation.y,
    };

    // Disable shadows for grass to improve performance
    grassBlade.receiveShadow = false;
    grassBlade.castShadow = false;

    this.scene.add(grassBlade);
    this.grassBlades.push(grassBlade);
  }

  // Helper function to check if position is near roads
  isNearRoad(x, z) {
    const roadThreshold = 15;

    // Check main north-south highway
    if (Math.abs(x) < roadThreshold && Math.abs(z) < 200) return true;

    // Check main east-west highway
    if (Math.abs(z) < roadThreshold && Math.abs(x) < 200) return true;

    // Check some secondary roads (simplified)
    const secondaryRoads = [
      { x: 40, z: 40 },
      { x: -40, z: 40 },
      { x: 40, z: -40 },
      { x: -40, z: -40 },
    ];

    for (let road of secondaryRoads) {
      const distance = Math.sqrt((x - road.x) ** 2 + (z - road.z) ** 2);
      if (distance < roadThreshold) return true;
    }

    return false;
  }

  // Update grass animation (call this in the game loop)
  updateGrassAnimation(deltaTime) {
    this.windTime += deltaTime;

    // Only update every few frames for better performance
    if (this.windTime % 0.1 < deltaTime) {
      for (let grass of this.grassBlades) {
        const userData = grass.userData;

        // Calculate wind effect with reduced complexity
        const windEffect =
          Math.sin(this.windTime * 2 + userData.windPhase) *
          userData.windStrength;

        // Apply simpler wind rotation (only Z axis swaying)
        grass.rotation.z = windEffect * 0.15;
      }
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

  createScenery() {
    this.createNaturalTrees();
    this.createScenicBuildings();
    this.createRocks();
    this.createFlowerFields();
  }

  createNaturalTrees() {
    // Add many more trees for a forest-like environment
    const treeCount = 120;
    const treeAreaSize = 450;

    for (let i = 0; i < treeCount; i++) {
      const treeX = (Math.random() - 0.5) * treeAreaSize;
      const treeZ = (Math.random() - 0.5) * treeAreaSize;

      // Avoid roads
      if (this.isNearRoad(treeX, treeZ)) continue;

      this.createDetailedTree(treeX, treeZ);
    }
  }

  createDetailedTree(x, z) {
    // Create more detailed and varied trees
    const treeType = Math.floor(Math.random() * 3);

    if (treeType === 0) {
      // Pine tree
      this.createPineTree(x, z);
    } else if (treeType === 1) {
      // Oak tree
      this.createOakTree(x, z);
    } else {
      // Birch tree
      this.createBirchTree(x, z);
    }
  }

  createPineTree(x, z) {
    const trunkHeight = 4 + Math.random() * 6;
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, trunkHeight / 2, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    this.scene.add(trunk);

    // Cone-shaped foliage for pine
    const foliageHeight = 6 + Math.random() * 4;
    const foliageGeometry = new THREE.ConeGeometry(
      2 + Math.random() * 2,
      foliageHeight,
      8
    );
    const foliageMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(0.25, 0.8, 0.15 + Math.random() * 0.25),
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.set(x, trunkHeight + foliageHeight / 2, z);
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    this.scene.add(foliage);
  }

  createOakTree(x, z) {
    const trunkHeight = 3 + Math.random() * 4;
    const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.6, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, trunkHeight / 2, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    this.scene.add(trunk);

    // Spherical foliage for oak
    const foliageRadius = 2.5 + Math.random() * 2;
    const foliageGeometry = new THREE.SphereGeometry(foliageRadius, 8, 6);
    const foliageMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(0.25, 0.7, 0.2 + Math.random() * 0.3),
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.set(x, trunkHeight + foliageRadius * 0.7, z);
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    this.scene.add(foliage);
  }

  createBirchTree(x, z) {
    const trunkHeight = 5 + Math.random() * 4;
    const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.2, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5dc }); // Beige for birch
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, trunkHeight / 2, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    this.scene.add(trunk);

    // Small spherical foliage for birch
    const foliageRadius = 1.5 + Math.random() * 1;
    const foliageGeometry = new THREE.SphereGeometry(foliageRadius, 6, 4);
    const foliageMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(0.25, 0.6, 0.3 + Math.random() * 0.3),
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.set(x, trunkHeight + foliageRadius * 0.5, z);
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    this.scene.add(foliage);
  }

  createScenicBuildings() {
    // Create scenic buildings like houses, barns, etc.
    const buildings = [
      // Cozy houses
      {
        x: 60,
        z: 80,
        width: 8,
        height: 6,
        depth: 10,
        color: 0xcd853f,
        type: "house",
      },
      {
        x: -70,
        z: 90,
        width: 6,
        height: 5,
        depth: 8,
        color: 0xdaa520,
        type: "house",
      },
      {
        x: 90,
        z: -60,
        width: 7,
        height: 5,
        depth: 9,
        color: 0xb8860b,
        type: "house",
      },
      {
        x: -80,
        z: -70,
        width: 9,
        height: 6,
        depth: 11,
        color: 0xd2691e,
        type: "house",
      },

      // Barns and farm buildings
      {
        x: 120,
        z: 40,
        width: 12,
        height: 8,
        depth: 16,
        color: 0x8b4513,
        type: "barn",
      },
      {
        x: -110,
        z: 50,
        width: 10,
        height: 7,
        depth: 14,
        color: 0xa0522d,
        type: "barn",
      },

      // Small cabins
      {
        x: 40,
        z: 120,
        width: 5,
        height: 4,
        depth: 6,
        color: 0x654321,
        type: "cabin",
      },
      {
        x: -50,
        z: 130,
        width: 4,
        height: 4,
        depth: 5,
        color: 0x8b4513,
        type: "cabin",
      },
      {
        x: 130,
        z: -40,
        width: 6,
        height: 5,
        depth: 7,
        color: 0x696969,
        type: "cabin",
      },
    ];

    buildings.forEach((building) => {
      this.createScenicBuilding(building);
    });
  }

  createScenicBuilding(params) {
    // Main building structure
    const geometry = new THREE.BoxGeometry(
      params.width,
      params.height,
      params.depth
    );
    const material = new THREE.MeshLambertMaterial({ color: params.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(params.x, params.height / 2, params.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Add roof based on building type
    if (params.type === "house" || params.type === "cabin") {
      this.addRoof(
        params.x,
        params.height,
        params.z,
        params.width,
        params.depth
      );
    } else if (params.type === "barn") {
      this.addBarnRoof(
        params.x,
        params.height,
        params.z,
        params.width,
        params.depth
      );
    }
  }

  addRoof(x, y, z, width, depth) {
    const roofGeometry = new THREE.ConeGeometry(
      Math.max(width, depth) * 0.7,
      2,
      4
    );
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 }); // Dark red roof
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(x, y + 1, z);
    roof.rotation.y = Math.PI / 4; // Diamond shape
    roof.castShadow = true;
    this.scene.add(roof);
  }

  addBarnRoof(x, y, z, width, depth) {
    const roofGeometry = new THREE.BoxGeometry(width + 1, 0.5, depth + 1);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x2f4f4f }); // Dark slate gray
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(x, y + 0.25, z);
    roof.castShadow = true;
    this.scene.add(roof);
  }

  createRocks() {
    // Add natural rock formations
    for (let i = 0; i < 60; i++) {
      const rockX = (Math.random() - 0.5) * 400;
      const rockZ = (Math.random() - 0.5) * 400;

      // Avoid roads
      if (this.isNearRoad(rockX, rockZ)) continue;

      const rockSize = 0.5 + Math.random() * 3;
      const rockGeometry = new THREE.SphereGeometry(rockSize, 6, 4);
      const rockMaterial = new THREE.MeshLambertMaterial({
        color: 0x696969 + Math.floor(Math.random() * 0x111111), // Slight color variation
      });

      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(rockX, rockSize * 0.7, rockZ);
      rock.rotation.x = Math.random() * Math.PI;
      rock.rotation.z = Math.random() * Math.PI;
      rock.scale.set(1, 0.6 + Math.random() * 0.8, 1); // Flatten slightly
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
    }
  }

  createFlowerFields() {
    // Add colorful flower patches throughout the landscape
    for (let i = 0; i < 80; i++) {
      const fieldX = (Math.random() - 0.5) * 350;
      const fieldZ = (Math.random() - 0.5) * 350;

      // Avoid roads
      if (this.isNearRoad(fieldX, fieldZ)) continue;

      const fieldRadius = 3 + Math.random() * 8;
      const fieldGeometry = new THREE.CircleGeometry(fieldRadius, 12);

      // More flower colors
      const colors = [
        0xff69b4, 0x9370db, 0xffd700, 0xff6347, 0x98fb98, 0xff1493, 0x00ced1,
        0xffa500,
      ];
      const flowerColor = colors[Math.floor(Math.random() * colors.length)];

      const fieldMaterial = new THREE.MeshLambertMaterial({
        color: flowerColor,
        transparent: true,
        opacity: 0.8,
      });

      const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
      field.rotation.x = -Math.PI / 2;
      field.position.set(fieldX, 0.02, fieldZ);
      this.scene.add(field);
    }
  }

  createSimpleRamps() {
    // Add a few simple ramps for driving fun
    const ramps = [
      { x: 50, z: 0, width: 15, length: 25, height: 4, rotation: 0 },
      { x: -50, z: 0, width: 15, length: 25, height: 4, rotation: Math.PI },
      { x: 0, z: 50, width: 12, length: 20, height: 3, rotation: Math.PI / 2 },
      {
        x: 0,
        z: -50,
        width: 12,
        length: 20,
        height: 3,
        rotation: -Math.PI / 2,
      },
      { x: 80, z: 80, width: 10, length: 18, height: 5, rotation: Math.PI / 4 },
      {
        x: -80,
        z: -80,
        width: 10,
        length: 18,
        height: 5,
        rotation: Math.PI / 4,
      },
    ];

    ramps.forEach((ramp) => {
      // Create ramp visual
      const rampGeometry = new THREE.BoxGeometry(
        ramp.width,
        ramp.height,
        ramp.length
      );
      const rampMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
      const rampMesh = new THREE.Mesh(rampGeometry, rampMaterial);

      rampMesh.position.set(ramp.x, ramp.height / 2, ramp.z);
      rampMesh.rotation.y = ramp.rotation;
      rampMesh.rotation.x = -Math.PI / 12; // Slight angle for ramp effect
      rampMesh.castShadow = true;
      rampMesh.receiveShadow = true;
      this.scene.add(rampMesh);

      // Create physics body for ramp
      this.physics.createObstacleBody(
        { x: ramp.x, y: ramp.height / 2, z: ramp.z },
        { width: ramp.width, height: ramp.height, depth: ramp.length },
        { x: -Math.PI / 12, y: ramp.rotation, z: 0 }
      );
    });
  }
}
