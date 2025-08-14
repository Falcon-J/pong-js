import * as THREE from "three";

export class Paddle {
  private mesh!: THREE.Mesh;
  private targetY = 0;
  private currentY = 0;
  private smoothingFactor = 0.25; // Increased for more responsiveness
  constructor(color: number = 0x00ff88) {
    this.createMesh(color);
  }

  private createMesh(color: number): void {
    const geometry = new THREE.BoxGeometry(0.3, 2, 0.3);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: new THREE.Color(color).multiplyScalar(0.2),
      roughness: 0.3,
      metalness: 0.7,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Add glow effect
    const glowGeometry = new THREE.BoxGeometry(0.4, 2.2, 0.4);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(glow);

    // Add edge lighting
    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 2,
    });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    this.mesh.add(edges);
  }

  setPosition(x: number, y: number): void {
    this.mesh.position.x = x;
    this.targetY = y;
    // Initialize currentY on first call if it's 0
    if (this.currentY === 0) {
      this.currentY = y;
      this.mesh.position.y = y;
    }
  }

  update(_deltaTime: number): void {
    // Smooth movement with easing
    const diff = this.targetY - this.currentY;
    this.currentY += diff * this.smoothingFactor;
    this.mesh.position.y = this.currentY;

    // Add subtle floating animation
    const time = Date.now() * 0.001;
    this.mesh.position.z = Math.sin(time * 2) * 0.05; // Reduced amplitude

    // Smooth rotation based on movement speed
    const movement = diff * this.smoothingFactor;
    this.mesh.rotation.z += (movement * 0.2 - this.mesh.rotation.z) * 0.1;
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }
}
