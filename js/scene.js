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

    // Create beautiful sunset sky gradient
    this.createSunsetSky();

    // Add atmospheric fog for depth and beauty with sunset colors
    this.scene.fog = new THREE.Fog(0xffa366, 100, 800);

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
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.gammaFactor = 2.2;
    this.renderer.gammaOutput = true;

    document.body.appendChild(this.renderer.domElement);

    // Set initial camera position - higher and further back to avoid being under the car
    this.camera.position.set(0, 8, 15);
    this.camera.lookAt(0, 0, 0);
  }

  createSunsetSky() {
    // Create a beautiful sunset sky using a sphere geometry with gradient material
    const skyGeometry = new THREE.SphereGeometry(500, 32, 15);

    // Create gradient texture for sunset sky
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 256;

    // Create vertical gradient from top to bottom
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0.0, "#1e3c72"); // Deep blue at top
    gradient.addColorStop(0.2, "#2a5298"); // Blue
    gradient.addColorStop(0.4, "#ffa366"); // Orange
    gradient.addColorStop(0.6, "#ffcc80"); // Light orange
    gradient.addColorStop(0.8, "#ffd4a3"); // Pale orange
    gradient.addColorStop(1.0, "#ffe6cc"); // Almost white at horizon

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const skyTexture = new THREE.CanvasTexture(canvas);
    skyTexture.mapping = THREE.EquirectangularReflectionMapping;

    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide, // Render on the inside of the sphere
    });

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(skyMesh);

    // Also set scene background to complement the sky
    this.scene.background = skyTexture;
  }

  setupLighting() {
    // === ENHANCED GOLDEN HOUR LIGHTING ===
    // Warm ambient light for magical atmosphere
    const ambientLight = new THREE.AmbientLight(0xffd4a3, 0.4);
    this.scene.add(ambientLight);

    // Main directional light (golden sun) - warm and beautiful
    const directionalLight = new THREE.DirectionalLight(0xffa366, 1.5);
    directionalLight.position.set(80, 60, 30);
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

    // Secondary fill light (soft blue for natural contrast)
    const fillLight = new THREE.DirectionalLight(0xa3c7ff, 0.3);
    fillLight.position.set(-60, 40, -50);
    this.scene.add(fillLight);

    // Third light for beautiful rim lighting (golden)
    const rimLight = new THREE.DirectionalLight(0xffcc80, 0.5);
    rimLight.position.set(40, 30, -80);
    this.scene.add(rimLight);

    // Enhanced hemisphere light for natural sky gradient
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x5a8a3a, 0.6);
    this.scene.add(hemisphereLight);

    // Add magical point lights for extra atmosphere
    this.addAtmosphericLights();
  }

  addAtmosphericLights() {
    // Magical atmospheric point lights with warm golden tones
    const atmosphericLights = [
      { pos: [0, 25, 0], color: 0xffd700, intensity: 0.4, range: 250 },
      { pos: [120, 20, 120], color: 0xffa366, intensity: 0.3, range: 180 },
      { pos: [-120, 20, -120], color: 0xffcc80, intensity: 0.3, range: 180 },
      { pos: [180, 30, 0], color: 0xffd4a3, intensity: 0.25, range: 150 },
      { pos: [-180, 30, 0], color: 0xffd4a3, intensity: 0.25, range: 150 },
      { pos: [0, 30, 180], color: 0xffe6cc, intensity: 0.25, range: 150 },
      { pos: [0, 30, -180], color: 0xffe6cc, intensity: 0.25, range: 150 },
      { pos: [90, 15, -90], color: 0xffa366, intensity: 0.2, range: 120 },
      { pos: [-90, 15, 90], color: 0xffa366, intensity: 0.2, range: 120 },
    ];

    atmosphericLights.forEach((light) => {
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
    // Enforce camera height constraints before rendering
    this.updateCameraConstraints();
    this.renderer.render(this.scene, this.camera);
  }

  updateCameraConstraints() {
    // Prevent camera from going below ground level
    const minHeight = 1.0; // Minimum height above ground
    if (this.camera.position.y < minHeight) {
      this.camera.position.y = minHeight;
    }
  }

  add(object) {
    this.scene.add(object);
  }
}
