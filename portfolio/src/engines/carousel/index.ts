import * as THREE from 'three';
import type { Engine, Project } from '@/domain/types';

/**
 * Artemii 3D WebGL Carousel Engine Adapter
 */
export class CarouselGLEngine implements Engine {
  public readonly id = 'carousel-gl';
  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private animId: number | null = null;
  private projects: Project[] = [];

  constructor(projects: Project[]) {
    this.projects = projects;
  }

  public mount(container: HTMLElement): void {
    this.container = container;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.resize);

    this.animate();
  }

  private animate = (): void => {
    this.animId = requestAnimationFrame(this.animate);
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  public resize = (): void => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public getProjects(): Project[] {
    return this.projects;
  }

  public destroy(): void {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.resize);
    if (this.renderer && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
    this.container = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
  }
}
