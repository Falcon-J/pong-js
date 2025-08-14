import * as THREE from "three";

export class Ball {
  private mesh!: THREE.Mesh;
  private velocity: THREE.Vector3;
  private initialSpeed = 5;
  private maxSpeed = 12;

  constructor() {
    this.createMesh();
    this.velocity = new THREE.Vector3();
    this.reset();
  }

  private createMesh(): void {
    const geometry = new THREE.SphereGeometry(0.15, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x222222,
      roughness: 0.1,
      metalness: 0.8,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0.3,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(glow);
  }

  reset(): void {
    this.mesh.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
  }

  launch(): void {
    const angle = ((Math.random() - 0.5) * Math.PI) / 3; // ±30 degrees
    const direction = Math.random() > 0.5 ? 1 : -1;

    this.velocity.set(
      direction * this.initialSpeed * Math.cos(angle),
      this.initialSpeed * Math.sin(angle),
      0
    );
  }

  update(deltaTime: number): void {
    // Apply velocity
    this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    // Add rotation for visual effect
    this.mesh.rotation.x += this.velocity.length() * deltaTime * 0.5;
    this.mesh.rotation.y += this.velocity.length() * deltaTime * 0.3;

    // Limit maximum speed
    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.normalize().multiplyScalar(this.maxSpeed);
    }
  }

  setVelocity(x: number, y: number): void {
    this.velocity.set(x, y, 0);
  }

  getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }
}
