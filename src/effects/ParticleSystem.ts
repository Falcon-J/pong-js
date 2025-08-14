import * as THREE from "three";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private geometry!: THREE.BufferGeometry;
  private material!: THREE.PointsMaterial;
  private mesh!: THREE.Points;
  private maxParticles = 500;

  constructor() {
    this.createSystem();
  }

  private createSystem(): void {
    this.geometry = new THREE.BufferGeometry();

    // Create buffers for positions and colors
    const positions = new Float32Array(this.maxParticles * 3);
    const colors = new Float32Array(this.maxParticles * 3);

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
  }

  createBurst(
    position: THREE.Vector3,
    color: number,
    count: number = 15
  ): void {
    const baseColor = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const spread = 0.5;

      const particle: Particle = {
        position: position.clone(),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed + (Math.random() - 0.5) * spread,
          Math.sin(angle) * speed + (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread
        ),
        life: 1.0,
        maxLife: 0.5 + Math.random() * 0.5,
        color: baseColor.clone(),
      };

      this.particles.push(particle);
    }
  }

  createTrail(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    color: number
  ): void {
    if (Math.random() > 0.7) {
      // Only create trail particles occasionally
      const particle: Particle = {
        position: position.clone(),
        velocity: velocity
          .clone()
          .multiplyScalar(0.1)
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.5
            )
          ),
        life: 1.0,
        maxLife: 0.3,
        color: new THREE.Color(color),
      };

      this.particles.push(particle);
    }
  }

  update(deltaTime: number): void {
    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update position
      particle.position.add(
        particle.velocity.clone().multiplyScalar(deltaTime)
      );

      // Update life
      particle.life -= deltaTime / particle.maxLife;

      // Apply gravity and friction
      particle.velocity.multiplyScalar(0.98);
      particle.velocity.y -= 2 * deltaTime;

      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Remove excess particles
    if (this.particles.length > this.maxParticles) {
      this.particles.splice(0, this.particles.length - this.maxParticles);
    }

    this.updateBuffers();
  }

  private updateBuffers(): void {
    const positions = this.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const colors = this.geometry.getAttribute("color") as THREE.BufferAttribute;

    // Clear buffers
    for (let i = 0; i < this.maxParticles; i++) {
      positions.setXYZ(i, 0, 0, 0);
      colors.setXYZ(i, 0, 0, 0);
    }

    // Update with current particles
    for (
      let i = 0;
      i < Math.min(this.particles.length, this.maxParticles);
      i++
    ) {
      const particle = this.particles[i];
      const alpha = particle.life;

      positions.setXYZ(
        i,
        particle.position.x,
        particle.position.y,
        particle.position.z
      );

      colors.setXYZ(
        i,
        particle.color.r * alpha,
        particle.color.g * alpha,
        particle.color.b * alpha
      );
    }

    positions.needsUpdate = true;
    colors.needsUpdate = true;

    // Update draw range
    this.geometry.setDrawRange(
      0,
      Math.min(this.particles.length, this.maxParticles)
    );
  }

  getMesh(): THREE.Points {
    return this.mesh;
  }
}
