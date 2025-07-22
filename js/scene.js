// Scene Setup Module
export class SceneManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.setupScene();
    this.setupLighting();
  }

  setupScene() {
    // Create basic scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb3d9ff); // Brighter, more vibrant sky blue

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.8;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.gammaFactor = 2.2;
    this.renderer.gammaOutput = true;

    document.body.appendChild(this.renderer.domElement);

    // Set initial camera position
    this.camera.position.set(0, 5, 8);
  }

  setupLighting() {
    // === ENHANCED LIGHTING SYSTEM ===
    // Brighter ambient light for overall scene illumination
    const ambientLight = new THREE.AmbientLight(0x606060, 0.7);
    this.scene.add(ambientLight);

    // Main directional light (sun) - significantly brighter
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(60, 80, 40);
    directionalLight.castShadow = true;

    // Improved shadow quality with better settings for larger world
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.left = -300;
    directionalLight.shadow.camera.right = 300;
    directionalLight.shadow.camera.top = 300;
    directionalLight.shadow.camera.bottom = -300;
    directionalLight.shadow.bias = -0.0005;
    directionalLight.shadow.normalBias = 0.02;
    this.scene.add(directionalLight);

    // Secondary fill light (brighter, warmer tone)
    const fillLight = new THREE.DirectionalLight(0xffd4a3, 0.6);
    fillLight.position.set(-40, 60, -40);
    this.scene.add(fillLight);

    // Third light for better rim lighting
    const rimLight = new THREE.DirectionalLight(0xa3c7ff, 0.4);
    rimLight.position.set(30, 40, -60);
    this.scene.add(rimLight);

    // Brighter hemisphere light for natural sky lighting
    const hemisphereLight = new THREE.HemisphereLight(0xb3d9ff, 0x4a7c59, 0.5);
    this.scene.add(hemisphereLight);

    // Add point lights for extra brightness around the larger scene
    this.addPointLights();
  }

  addPointLights() {
    const pointLights = [
      { pos: [0, 20, 0], color: 0xffffff, intensity: 0.8, range: 200 },
      { pos: [100, 15, 100], color: 0xffd4a3, intensity: 0.5, range: 150 },
      { pos: [-100, 15, -100], color: 0xa3c7ff, intensity: 0.5, range: 150 },
      { pos: [150, 25, 0], color: 0xffffff, intensity: 0.6, range: 120 },
      { pos: [-150, 25, 0], color: 0xffffff, intensity: 0.6, range: 120 },
      { pos: [0, 25, 150], color: 0xffffff, intensity: 0.6, range: 120 },
      { pos: [0, 25, -150], color: 0xffffff, intensity: 0.6, range: 120 },
    ];

    pointLights.forEach((light) => {
      const pointLight = new THREE.PointLight(
        light.color,
        light.intensity,
        light.range
      );
      pointLight.position.set(...light.pos);
      this.scene.add(pointLight);
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  add(object) {
    this.scene.add(object);
  }
}
