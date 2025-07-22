// Physics System Module
export class PhysicsSystem {
  constructor() {
    this.world = null;
    this.materials = {};
    this.setupPhysics();
  }

  setupPhysics() {
    // === CANNON.js PHYSICS SETUP ===
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0); // Realistic gravity
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;

    this.createMaterials();
  }

  createMaterials() {
    // Create physics materials
    this.materials.ground = new CANNON.Material("groundMaterial");
    this.materials.car = new CANNON.Material("carMaterial");
    this.materials.obstacle = new CANNON.Material("obstacleMaterial");

    // Define contact materials (how objects interact)
    const carGroundContact = new CANNON.ContactMaterial(
      this.materials.car,
      this.materials.ground,
      {
        friction: 0.4,
        restitution: 0.3,
      }
    );
    
    const carObstacleContact = new CANNON.ContactMaterial(
      this.materials.car,
      this.materials.obstacle,
      {
        friction: 0.1,
        restitution: 0.9,
      }
    );

    this.world.addContactMaterial(carGroundContact);
    this.world.addContactMaterial(carObstacleContact);
  }

  createGroundBody() {
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      mass: 0, // Static body
      material: this.materials.ground,
    });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );
    this.world.addBody(groundBody);
    return groundBody;
  }

  createCarBody(position = { x: 0, y: 2, z: 0 }) {
    const carShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
    const carBody = new CANNON.Body({
      mass: 500, // Car mass in kg
      position: new CANNON.Vec3(position.x, position.y, position.z),
      material: this.materials.car,
    });
    carBody.addShape(carShape);
    this.world.addBody(carBody);
    return carBody;
  }

  step(timeStep, deltaTime, maxSubSteps) {
    this.world.step(timeStep, deltaTime, maxSubSteps);
  }

  addBody(body) {
    this.world.addBody(body);
  }
}
