// World/Environment Module - Scenic Roads
export class WorldBuilder {
  constructor(scene, physicsSystem) {
    this.scene = scene;
    this.physics = physicsSystem;
    this.scenery = [];
    
    this.createGround();
    this.createRoadSystem();
    this.createBeautifulScenery();
  }

  createGround() {
    // Create a large flat plane for the ground
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMeshMaterial = new THREE.MeshLambertMaterial({
      color: 0x4a7c59, // Rich forest green
      shininess: 15,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMeshMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add beautiful grass patches
    this.addGrassPatches();

    // Create ground physics body
    this.physics.createGroundBody();
  }

  addGrassPatches() {
    for (let i = 0; i < 80; i++) {
      const patchGeometry = new THREE.CircleGeometry(
        Math.random() * 12 + 6,
        16
      );
      
      // Natural grass color variation
      const hue = 0.25 + (Math.random() - 0.5) * 0.1;
      const saturation = 0.6 + Math.random() * 0.3;
      const lightness = 0.35 + Math.random() * 0.25;
      
      const patchMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color().setHSL(hue, saturation, lightness),
        transparent: true,
        opacity: 0.8,
      });
      
      const patch = new THREE.Mesh(patchGeometry, patchMaterial);
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(
        (Math.random() - 0.5) * 900,
        0.005,
        (Math.random() - 0.5) * 900
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
      { x: 0, z: 160, width: 12, length: 80, rotation: 0 },
      { x: 0, z: -160, width: 12, length: 80, rotation: 0 },

      // Cross highway (east-west)
      { x: 0, z: 0, width: 12, length: 80, rotation: Math.PI / 2 },
      { x: 80, z: 0, width: 12, length: 80, rotation: Math.PI / 2 },
      { x: -80, z: 0, width: 12, length: 80, rotation: Math.PI / 2 },
      { x: 160, z: 0, width: 12, length: 80, rotation: Math.PI / 2 },
      { x: -160, z: 0, width: 12, length: 80, rotation: Math.PI / 2 },

      // Beautiful winding roads
      { x: 120, z: 120, width: 10, length: 100, rotation: Math.PI / 4 },
      { x: -120, z: 120, width: 10, length: 100, rotation: -Math.PI / 4 },
      { x: 120, z: -120, width: 10, length: 100, rotation: -Math.PI / 4 },
      { x: -120, z: -120, width: 10, length: 100, rotation: Math.PI / 4 },

      // Scenic loops
      { x: 200, z: 50, width: 8, length: 60, rotation: Math.PI / 6 },
      { x: -200, z: 50, width: 8, length: 60, rotation: -Math.PI / 6 },
      { x: 200, z: -50, width: 8, length: 60, rotation: -Math.PI / 6 },
      { x: -200, z: -50, width: 8, length: 60, rotation: Math.PI / 6 },

      // Additional scenic roads
      { x: 150, z: 200, width: 8, length: 80, rotation: Math.PI / 8 },
      { x: -150, z: 200, width: 8, length: 80, rotation: -Math.PI / 8 },
      { x: 150, z: -200, width: 8, length: 80, rotation: -Math.PI / 8 },
      { x: -150, z: -200, width: 8, length: 80, rotation: Math.PI / 8 },
    ];

    roadSegments.forEach((road) => {
      this.createRoadSegment(road);
    });
  }

  createRoadSegment(road) {
    // Road surface - nice dark asphalt
    const roadGeometry = new THREE.PlaneGeometry(road.width, road.length);
    const roadMaterial = new THREE.MeshLambertMaterial({
      color: 0x333333,
      shininess: 20,
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
    const lineMaterial = new THREE.MeshLambertMaterial({
      color: 0xffd700,
      emissive: 0x221100,
    });
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.rotation.z = road.rotation;
    centerLine.position.set(road.x, 0.02, road.z);
    this.scene.add(centerLine);

    // Edge lines (white)
    const edgeMaterial = new THREE.MeshLambertMaterial({
      color: 0xf5f5f5,
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

  createBeautifulScenery() {
    this.createTrees();
    this.createMountains();
    this.createRocks();
    this.createLakes();
    this.createFlowerFields();
  }

  createTrees() {
    // Create beautiful trees around the world
    for (let i = 0; i < 150; i++) {
      const treeX = (Math.random() - 0.5) * 900;
      const treeZ = (Math.random() - 0.5) * 900;
      
      // Avoid placing trees on roads by checking distance from road centers
      const tooCloseToRoad = this.isNearRoad(treeX, treeZ, 15);
      if (tooCloseToRoad) continue;
      
      // Create tree trunk
      const trunkHeight = 6 + Math.random() * 8;
      const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.6, trunkHeight, 8);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(treeX, trunkHeight / 2, treeZ);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      this.scene.add(trunk);
      this.scenery.push(trunk);
      
      // Create tree crown
      const crownRadius = 3 + Math.random() * 3;
      const crownGeometry = new THREE.SphereGeometry(crownRadius, 8, 6);
      const crownMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0.25, 0.7, 0.3 + Math.random() * 0.2)
      });
      const crown = new THREE.Mesh(crownGeometry, crownMaterial);
      crown.position.set(treeX, trunkHeight + crownRadius * 0.6, treeZ);
      crown.castShadow = true;
      crown.receiveShadow = true;
      this.scene.add(crown);
      this.scenery.push(crown);
    }
  }

  isNearRoad(x, z, minDistance) {
    // Check if position is too close to any major road intersections
    const roadCenters = [
      { x: 0, z: 0 }, { x: 0, z: 80 }, { x: 0, z: -80 },
      { x: 80, z: 0 }, { x: -80, z: 0 },
      { x: 120, z: 120 }, { x: -120, z: 120 },
      { x: 120, z: -120 }, { x: -120, z: -120 }
    ];
    
    for (const road of roadCenters) {
      const distance = Math.sqrt((x - road.x) ** 2 + (z - road.z) ** 2);
      if (distance < minDistance) return true;
    }
    return false;
  }

  createMountains() {
    // Create distant mountains for scenery
    const mountainPositions = [
      { x: 400, z: 400 }, { x: -400, z: 400 },
      { x: 400, z: -400 }, { x: -400, z: -400 },
      { x: 0, z: 450 }, { x: 450, z: 0 },
      { x: 0, z: -450 }, { x: -450, z: 0 }
    ];
    
    mountainPositions.forEach(pos => {
      const mountainHeight = 40 + Math.random() * 30;
      const mountainWidth = 50 + Math.random() * 40;
      
      const mountainGeometry = new THREE.ConeGeometry(mountainWidth, mountainHeight, 8);
      const mountainMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x696969,
        transparent: true,
        opacity: 0.7
      });
      
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      mountain.position.set(pos.x, mountainHeight / 2, pos.z);
      mountain.castShadow = true;
      mountain.receiveShadow = true;
      this.scene.add(mountain);
      this.scenery.push(mountain);
    });
  }

  createRocks() {
    // Scatter decorative rocks
    for (let i = 0; i < 60; i++) {
      const rockX = (Math.random() - 0.5) * 800;
      const rockZ = (Math.random() - 0.5) * 800;
      
      // Avoid roads
      if (this.isNearRoad(rockX, rockZ, 10)) continue;
      
      const rockSize = 1 + Math.random() * 2;
      const rockGeometry = new THREE.DodecahedronGeometry(rockSize);
      const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(rockX, rockSize, rockZ);
      rock.rotation.x = Math.random() * Math.PI;
      rock.rotation.y = Math.random() * Math.PI;
      rock.rotation.z = Math.random() * Math.PI;
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
      this.scenery.push(rock);
    }
  }

  createLakes() {
    // Create a few beautiful lakes
    const lakePositions = [
      { x: 250, z: 250, radius: 25 },
      { x: -250, z: 250, radius: 20 },
      { x: 250, z: -250, radius: 30 },
      { x: -250, z: -250, radius: 18 }
    ];
    
    lakePositions.forEach(lake => {
      const lakeGeometry = new THREE.CircleGeometry(lake.radius, 32);
      const lakeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4169E1,
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });
      
      const lakeMesh = new THREE.Mesh(lakeGeometry, lakeMaterial);
      lakeMesh.rotation.x = -Math.PI / 2;
      lakeMesh.position.set(lake.x, 0.02, lake.z);
      lakeMesh.receiveShadow = true;
      this.scene.add(lakeMesh);
      this.scenery.push(lakeMesh);
    });
  }

  createFlowerFields() {
    // Create colorful flower fields
    for (let i = 0; i < 30; i++) {
      const fieldX = (Math.random() - 0.5) * 700;
      const fieldZ = (Math.random() - 0.5) * 700;
      
      // Avoid roads
      if (this.isNearRoad(fieldX, fieldZ, 20)) continue;
      
      const fieldRadius = 8 + Math.random() * 12;
      const flowerColors = [0xff69b4, 0xff1493, 0xffd700, 0xff4500, 0x9370db, 0x00ced1, 0xff6347];
      const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      
      const fieldGeometry = new THREE.CircleGeometry(fieldRadius, 16);
      const fieldMaterial = new THREE.MeshLambertMaterial({
        color: flowerColor,
        transparent: true,
        opacity: 0.7,
      });
      
      const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
      field.rotation.x = -Math.PI / 2;
      field.position.set(fieldX, 0.01, fieldZ);
      this.scene.add(field);
      this.scenery.push(field);
    }
  }
}
