import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PlaneEquation, Vector3 } from '../math/types.js';
import { clipPlaneToCube, clipLineToCube } from '../math/planeClipper.js';
import { normalize3 } from '../math/vectors.js';

export class Viewport3D {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  private plane1Mesh: THREE.Mesh | null = null;
  private plane2Mesh: THREE.Mesh | null = null;
  private lineMesh: THREE.Line | null = null;
  private normal1Arrow: THREE.ArrowHelper | null = null;
  private normal2Arrow: THREE.ArrowHelper | null = null;
  private cubeBoxHelper: THREE.Box3Helper | null = null;

  private showNormals = false;

  constructor(container: HTMLElement) {
    this.container = container;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);

    // Camera (Z-up coordinate system)
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.up.set(0, 0, 1);
    this.setCameraPreset('isometric');

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 0, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(20, -20, 30);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight2.position.set(-20, 20, -10);
    this.scene.add(dirLight2);

    // Setup coordinate helpers
    this.buildCoordinateBox();

    // Resize handler
    window.addEventListener('resize', this.onResize);

    // Animation loop
    this.animate();
  }

  private buildCoordinateBox() {
    const bound = 10;
    const box = new THREE.Box3(
      new THREE.Vector3(-bound, -bound, -bound),
      new THREE.Vector3(bound, bound, bound)
    );
    this.cubeBoxHelper = new THREE.Box3Helper(box, new THREE.Color(0x334155));
    this.scene.add(this.cubeBoxHelper);

    // Reference Grid on XY plane (Z = 0)
    const grid = new THREE.GridHelper(bound * 2, 20, 0x475569, 0x1e293b);
    grid.rotation.x = Math.PI / 2; // Orient grid along XY plane with Z-up
    this.scene.add(grid);

    // Custom Axes (X = Red, Y = Green, Z = Blue)
    const axesGroup = new THREE.Group();
    const axisLen = bound + 2;

    const makeAxis = (dir: [number, number, number], color: number) => {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-axisLen * dir[0], -axisLen * dir[1], -axisLen * dir[2]),
        new THREE.Vector3(axisLen * dir[0], axisLen * dir[1], axisLen * dir[2])
      ]);
      const mat = new THREE.LineBasicMaterial({ color, opacity: 0.8, transparent: true });
      return new THREE.Line(geom, mat);
    };

    axesGroup.add(makeAxis([1, 0, 0], 0xef4444)); // X axis
    axesGroup.add(makeAxis([0, 1, 0], 0x10b981)); // Y axis
    axesGroup.add(makeAxis([0, 0, 1], 0x3b82f6)); // Z axis
    this.scene.add(axesGroup);
  }

  public updatePlanes(
    p1: PlaneEquation | null,
    p2: PlaneEquation | null,
    showPlane1 = true,
    showPlane2 = true
  ) {
    // Plane 1 (Cyan)
    if (this.plane1Mesh) {
      this.scene.remove(this.plane1Mesh);
      this.plane1Mesh.geometry.dispose();
      this.plane1Mesh = null;
    }
    if (p1 && showPlane1) {
      const poly = clipPlaneToCube(p1, 10);
      if (poly) {
        this.plane1Mesh = this.createPlaneMesh(poly.vertices, poly.indices, 0x22d3ee);
        this.scene.add(this.plane1Mesh);
      }
    }

    // Plane 2 (Amber)
    if (this.plane2Mesh) {
      this.scene.remove(this.plane2Mesh);
      this.plane2Mesh.geometry.dispose();
      this.plane2Mesh = null;
    }
    if (p2 && showPlane2) {
      const poly = clipPlaneToCube(p2, 10);
      if (poly) {
        this.plane2Mesh = this.createPlaneMesh(poly.vertices, poly.indices, 0xf59e0b);
        this.scene.add(this.plane2Mesh);
      }
    }

    // Normal vectors
    this.updateNormals(p1, p2);
  }

  public updateIntersectionLine(p0: Vector3 | null, d: Vector3 | null, visible = true) {
    if (this.lineMesh) {
      this.scene.remove(this.lineMesh);
      this.lineMesh.geometry.dispose();
      this.lineMesh = null;
    }

    if (!p0 || !d || !visible) return;

    const seg = clipLineToCube(p0, d, 10);
    if (!seg) return;

    // Create highlighted line
    const points = [
      new THREE.Vector3(seg[0][0], seg[0][1], seg[0][2]),
      new THREE.Vector3(seg[1][0], seg[1][1], seg[1][2])
    ];

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0xfde047,
      linewidth: 3,
      depthTest: true
    });

    this.lineMesh = new THREE.Line(geom, mat);
    this.scene.add(this.lineMesh);
  }

  public setShowNormals(show: boolean, p1?: PlaneEquation | null, p2?: PlaneEquation | null) {
    this.showNormals = show;
    this.updateNormals(p1, p2);
  }

  private updateNormals(p1?: PlaneEquation | null, p2?: PlaneEquation | null) {
    if (this.normal1Arrow) {
      this.scene.remove(this.normal1Arrow);
      this.normal1Arrow = null;
    }
    if (this.normal2Arrow) {
      this.scene.remove(this.normal2Arrow);
      this.normal2Arrow = null;
    }

    if (!this.showNormals) return;

    if (p1) {
      const u1 = normalize3([p1.a, p1.b, p1.c]);
      const dir = new THREE.Vector3(u1[0], u1[1], u1[2]);
      this.normal1Arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 4, 0x06b6d4, 0.6, 0.4);
      this.scene.add(this.normal1Arrow);
    }

    if (p2) {
      const u2 = normalize3([p2.a, p2.b, p2.c]);
      const dir = new THREE.Vector3(u2[0], u2[1], u2[2]);
      this.normal2Arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 4, 0xd97706, 0.6, 0.4);
      this.scene.add(this.normal2Arrow);
    }
  }

  private createPlaneMesh(
    vertices: Vector3[],
    indices: number[],
    colorHex: number
  ): THREE.Mesh {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];

    for (const v of vertices) {
      positions.push(v[0], v[1], v[2]);
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      roughness: 0.4,
      metalness: 0.1
    });

    return new THREE.Mesh(geometry, material);
  }

  public setCameraPreset(preset: 'isometric' | 'top' | 'front' | 'side' | 'reset') {
    switch (preset) {
      case 'isometric':
      case 'reset':
        this.camera.position.set(22, -22, 16);
        this.camera.up.set(0, 0, 1);
        break;
      case 'top':
        this.camera.position.set(0, 0, 32);
        this.camera.up.set(0, 1, 0);
        break;
      case 'front':
        this.camera.position.set(0, -32, 0);
        this.camera.up.set(0, 0, 1);
        break;
      case 'side':
        this.camera.position.set(32, 0, 0);
        this.camera.up.set(0, 0, 1);
        break;
    }
    if (this.controls) {
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  public updateTheme(theme: 'dark' | 'light') {
    this.scene.background = new THREE.Color(theme === 'dark' ? 0x0f172a : 0xf8fafc);
    if (this.cubeBoxHelper) {
      const mat = this.cubeBoxHelper.material as THREE.LineBasicMaterial;
      if (mat && mat.color) {
        mat.color.setHex(theme === 'dark' ? 0x334155 : 0xcbd5e1);
      }
    }
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / (height || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
