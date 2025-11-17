import * as THREE from 'three';

export class CubeVisualizer {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: THREE.Mesh;
  private animationId: number | null = null;
  private container: HTMLElement | null = null;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetRotationX: number = 0;
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

    // Create cube with texture material
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/texture.jpg');
    
    const material = new THREE.MeshBasicMaterial({
      map: texture
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add point light
    const pointLight = new THREE.PointLight(0x22c55e, 1, 100);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);
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
      const deltaY = event.clientY - this.mouseY;

      this.targetRotationY += deltaX * 0.01;
      this.targetRotationX += deltaY * 0.01;

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
      const deltaY = event.touches[0].clientY - this.mouseY;

      this.targetRotationY += deltaX * 0.01;
      this.targetRotationX += deltaY * 0.01;

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

    // Smooth rotation towards target
    this.cube.rotation.x += (this.targetRotationX - this.cube.rotation.x) * 0.1;
    this.cube.rotation.y += (this.targetRotationY - this.cube.rotation.y) * 0.1;

    // Auto-rotation when not dragging
    if (!this.isDragging) {
      this.targetRotationX += 0.005;
      this.targetRotationY += 0.005;
    }

    // Pulse effect
    const scale = 1 + Math.sin(Date.now() * 0.001) * 0.1;
    this.cube.scale.set(scale, scale, scale);

    this.renderer.render(this.scene, this.camera);
  }

  public handleResize() {
    if (!this.container) return;
    
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}
