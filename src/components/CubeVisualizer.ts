import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class H2RVisualizer {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Group | THREE.Mesh;
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

    // Load H2R model with error handling
    const loader = new GLTFLoader();
    loader.load('/h2r-extracted/scene.gltf', (gltf: GLTF) => {
      this.model = gltf.scene;
      
      // Apply materials to make model fully colored and visible
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Ensure mesh has proper material
          if (child.material) {
            // Make material fully opaque and colored
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.needsUpdate = true;
            
            // If using basic material, convert to standard for better lighting
            if (child.material instanceof THREE.MeshBasicMaterial) {
              const color = child.material.color;
              child.material = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.3,
                roughness: 0.4
              });
            }
          }
        }
      });
      
      // Scale and position the model
      this.model.scale.set(2.5, 2.5, 2.5); // Make model much larger
      this.model.position.set(0, 0, 0);
      
      // Center the model
      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      this.model.position.sub(center);
      
      this.scene.add(this.model);
      console.log('H2R model loaded successfully!');
    }, 
    (progress: any) => {
      console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
    },
    (error: any) => {
      console.error('Error loading H2R model:', error);
      // Fallback to a simple cube if model fails to load
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x22c55e,
        metalness: 0.6,
        roughness: 0.3
      });
      this.model = new THREE.Mesh(geometry, material);
      this.scene.add(this.model);
    });

    // Add comprehensive lighting system for full model illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); // Increased from 1.2 to 2.0
    this.scene.add(ambientLight);

    // Add multiple point lights for complete coverage
    const pointLight1 = new THREE.PointLight(0xffffff, 2.5, 100); // Increased from 1.5 to 2.5
    pointLight1.position.set(5, 5, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 2.5, 100); // Increased from 1.5 to 2.5
    pointLight2.position.set(-5, 5, 5);
    this.scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffffff, 2.5, 100); // Increased from 1.5 to 2.5
    pointLight3.position.set(0, -5, 5);
    this.scene.add(pointLight3);

    // Add directional lights from multiple angles
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2.0); // Increased from 1 to 2.0
    directionalLight1.position.set(5, 5, 5);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2.0); // Increased from 1 to 2.0
    directionalLight2.position.set(-5, 5, -5);
    this.scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1.5); // Increased from 0.8 to 1.5
    directionalLight3.position.set(0, -5, 0);
    this.scene.add(directionalLight3);

    // Add hemisphere light for ambient color variation
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x404040, 1.5); // Increased from 1 to 1.5
    this.scene.add(hemisphereLight);

    // Add additional spotlights for maximum shine
    const spotLight1 = new THREE.SpotLight(0xffffff, 3.0, 100, Math.PI / 6, 0.5);
    spotLight1.position.set(10, 10, 10);
    spotLight1.target.position.set(0, 0, 0);
    this.scene.add(spotLight1);
    this.scene.add(spotLight1.target);

    const spotLight2 = new THREE.SpotLight(0xffffff, 3.0, 100, Math.PI / 6, 0.5);
    spotLight2.position.set(-10, 10, -10);
    spotLight2.target.position.set(0, 0, 0);
    this.scene.add(spotLight2);
    this.scene.add(spotLight2.target);
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
