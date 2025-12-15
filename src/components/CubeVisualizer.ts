import * as THREE from 'three';

export class H2RVisualizer {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Mesh;
  private animationId: number | null = null;
  private container: HTMLElement | null = null;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetRotationY: number = 0;
  private isDragging: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
    this.setupMouseControls();
  }

  private init() {
    if (!this.container) return;

    // Scene setup
    this.scene = new THREE.Scene();
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    // Create and add the cube
    this.loadH2RModel();
    
    // Add lighting
    this.setupLights();
    
    // Start animation loop
    this.animate();
  }

  private setupLights() {
    // Add comprehensive lighting system for the cube
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    this.scene.add(ambientLight);

    // Add multiple point lights for complete coverage
    const pointLight1 = new THREE.PointLight(0xffffff, 2.5, 100);
    pointLight1.position.set(5, 5, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 2.5, 100);
    pointLight2.position.set(-5, 5, 5);
    this.scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffffff, 2.5, 100);
    pointLight3.position.set(0, -5, 5);
    this.scene.add(pointLight3);
  }

  private loadH2RModel() {
    // Create a simple cube for visualization
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      shininess: 100,
      specular: 0xffffff,
      flatShading: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    
    this.model = new THREE.Mesh(geometry, material);
    this.scene.add(this.model);
    
    // Scale and position the cube
    this.model.scale.set(2.5, 2.5, 2.5);
    this.model.position.set(0, -0.2, 0); // Slightly lower the cube
  }

  public start() {
    this.animate();
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public dispose() {
    this.stop();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }

  private setupMouseControls() {
    if (!this.container) return;

    const handleMouseDown = (event: MouseEvent) => {
      this.isDragging = true;
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!this.isDragging) return;

      const deltaX = event.clientX - this.mouseX;
      // Only update horizontal rotation
      this.targetRotationY += deltaX * 0.01;

      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      this.isDragging = false;
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        this.isDragging = true;
        this.mouseX = event.touches[0].clientX;
        this.mouseY = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!this.isDragging || event.touches.length !== 1) return;

      const deltaX = event.touches[0].clientX - this.mouseX;
      // Only update horizontal rotation
      this.targetRotationY += deltaX * 0.01;

      this.mouseX = event.touches[0].clientX;
      this.mouseY = event.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      this.isDragging = false;
    };

    // Mouse events
    this.container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch events for mobile
    this.container.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Smooth rotation towards target (horizontal only)
    if (this.model) {
      // Only rotate around Y axis (horizontal)
      this.model.rotation.y += (this.targetRotationY - this.model.rotation.y) * 0.1;
      // Keep X rotation fixed
      this.model.rotation.x = 0;
      this.model.rotation.z = 0;

      // Auto-rotation when not dragging (horizontal only)
      if (!this.isDragging) {
        this.targetRotationY += 0.02; // Increased from 0.005 to 0.02 for faster rotation
      }

      // Remove pulse effect - keep constant scale
      this.model.scale.set(2.5, 2.5, 2.5);
      
      // Maintain downward position in animation loop
      if (this.model.position.y > -0.2) {
        this.model.position.y = -0.2;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  public handleResize() {
    if (!this.container) return;
    
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}
