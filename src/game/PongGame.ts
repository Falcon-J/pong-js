import * as THREE from "three";
import { Ball } from "../entities/Ball";
import { Paddle } from "../entities/Paddle";
import { AI } from "../ai/AI";
import { ParticleSystem } from "../effects/ParticleSystem";
import { SoundManager } from "../audio/SoundManager";

export class PongGame {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  private ball!: Ball;
  private playerPaddle!: Paddle;
  private aiPaddle!: Paddle;
  private ai!: AI;
  private particleSystem!: ParticleSystem;
  private soundManager!: SoundManager;

  private playerScore = 0;
  private aiScore = 0;
  private gameStarted = false;
  private gameOver = false;
  private isPaused = false;

  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;

  // Game boundaries
  private readonly FIELD_WIDTH = 12;
  private readonly FIELD_HEIGHT = 8;
  private readonly PADDLE_OFFSET = 5.5;

  constructor() {
    this.clock = new THREE.Clock();
    this.initThreeJS();
    this.createScene();
    this.initGameObjects();
    this.setupLighting();
  }

  private initThreeJS(): void {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const container = document.getElementById("gameContainer")!;
    container.appendChild(this.renderer.domElement);
  }

  private createScene(): void {
    // Create field boundaries
    this.createField();

    // Create center line
    this.createCenterLine();

    // Add background elements
    this.createBackground();
  }

  private createField(): void {
    // Field geometry
    const fieldGeometry = new THREE.PlaneGeometry(
      this.FIELD_WIDTH,
      this.FIELD_HEIGHT
    );
    const fieldMaterial = new THREE.MeshLambertMaterial({
      color: 0x001122,
      transparent: true,
      opacity: 0.3,
    });
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.position.z = -0.5;
    this.scene.add(field);

    // Boundaries
    const boundaryMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x004422,
    });

    // Top and bottom boundaries
    const horizontalBoundary = new THREE.BoxGeometry(
      this.FIELD_WIDTH,
      0.2,
      0.5
    );

    const topBoundary = new THREE.Mesh(horizontalBoundary, boundaryMaterial);
    topBoundary.position.set(0, this.FIELD_HEIGHT / 2, 0);
    topBoundary.castShadow = true;
    this.scene.add(topBoundary);

    const bottomBoundary = new THREE.Mesh(horizontalBoundary, boundaryMaterial);
    bottomBoundary.position.set(0, -this.FIELD_HEIGHT / 2, 0);
    bottomBoundary.castShadow = true;
    this.scene.add(bottomBoundary);
  }

  private createCenterLine(): void {
    const dashCount = 10;
    const dashHeight = 0.3;
    const dashSpacing = this.FIELD_HEIGHT / dashCount;

    for (let i = 0; i < dashCount; i++) {
      if (i % 2 === 0) continue; // Create dashed effect

      const dashGeometry = new THREE.BoxGeometry(0.1, dashHeight, 0.1);
      const dashMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x002244,
      });
      const dash = new THREE.Mesh(dashGeometry, dashMaterial);
      dash.position.set(0, -this.FIELD_HEIGHT / 2 + i * dashSpacing, 0);
      this.scene.add(dash);
    }
  }

  private createBackground(): void {
    // Animated background particles
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x66ccff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
  }

  private initGameObjects(): void {
    // Ball
    this.ball = new Ball();
    this.scene.add(this.ball.getMesh());

    // Player paddle (right side)
    this.playerPaddle = new Paddle(0x00ff88);
    this.playerPaddle.setPosition(this.PADDLE_OFFSET, 0);
    this.scene.add(this.playerPaddle.getMesh());

    // AI paddle (left side)
    this.aiPaddle = new Paddle(0xff4466);
    this.aiPaddle.setPosition(-this.PADDLE_OFFSET, 0);
    this.scene.add(this.aiPaddle.getMesh());

    // AI
    this.ai = new AI();

    // Particle system
    this.particleSystem = new ParticleSystem();
    this.scene.add(this.particleSystem.getMesh());

    // Sound manager
    this.soundManager = new SoundManager();
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Colored accent lights
    const leftLight = new THREE.PointLight(0xff4466, 0.5, 10);
    leftLight.position.set(-6, 0, 2);
    this.scene.add(leftLight);

    const rightLight = new THREE.PointLight(0x00ff88, 0.5, 10);
    rightLight.position.set(6, 0, 2);
    this.scene.add(rightLight);
  }

  start(): void {
    this.gameStarted = true;
    this.ball.reset();
    this.ball.launch();
  }

  restart(): void {
    this.playerScore = 0;
    this.aiScore = 0;
    this.gameOver = false;
    this.ball.reset();
    this.ball.launch();
  }

  updatePlayerPaddle(mouseY: number): void {
    const clampedY = Math.max(
      -this.FIELD_HEIGHT / 2 + 1,
      Math.min(this.FIELD_HEIGHT / 2 - 1, mouseY)
    );
    this.playerPaddle.setPosition(this.PADDLE_OFFSET, clampedY);
  }

  getPlayerPaddlePosition(): THREE.Vector3 {
    return this.playerPaddle.getPosition();
  }

  setPlayerPaddlePosition(y: number): void {
    const clampedY = Math.max(
      -this.FIELD_HEIGHT / 2 + 1,
      Math.min(this.FIELD_HEIGHT / 2 - 1, y)
    );
    this.playerPaddle.setPosition(this.PADDLE_OFFSET, clampedY);
  }

  update(): void {
    if (!this.gameStarted || this.gameOver || this.isPaused) return;

    const deltaTime = this.clock.getDelta();

    // Update ball
    this.ball.update(deltaTime);

    // Update paddles
    this.playerPaddle.update(deltaTime);
    this.aiPaddle.update(deltaTime);

    // Update AI
    const ballPosition = this.ball.getPosition();
    const aiMove = this.ai.calculateMove(
      ballPosition,
      this.aiPaddle.getPosition(),
      deltaTime
    );
    const clampedAIY = Math.max(
      -this.FIELD_HEIGHT / 2 + 1,
      Math.min(this.FIELD_HEIGHT / 2 - 1, aiMove)
    );
    this.aiPaddle.setPosition(-this.PADDLE_OFFSET, clampedAIY);

    // Check collisions
    this.checkCollisions();

    // Update particles
    this.particleSystem.update(deltaTime);

    // Update FPS counter
    this.updateFPS();
  }

  private checkCollisions(): void {
    const ballPos = this.ball.getPosition();
    const ballVel = this.ball.getVelocity();

    // Top and bottom boundaries
    if (
      ballPos.y >= this.FIELD_HEIGHT / 2 - 0.2 ||
      ballPos.y <= -this.FIELD_HEIGHT / 2 + 0.2
    ) {
      this.ball.setVelocity(ballVel.x, -ballVel.y);
      this.soundManager.playBoundaryHit();
      this.particleSystem.createBurst(ballPos, 0x66ccff);
    }

    // Paddle collisions
    const playerPaddlePos = this.playerPaddle.getPosition();
    const aiPaddlePos = this.aiPaddle.getPosition();

    // Player paddle collision
    if (
      ballPos.x >= this.PADDLE_OFFSET - 0.5 &&
      ballPos.x <= this.PADDLE_OFFSET + 0.5 &&
      ballPos.y >= playerPaddlePos.y - 1 &&
      ballPos.y <= playerPaddlePos.y + 1 &&
      ballVel.x > 0
    ) {
      const relativeIntersectY = (ballPos.y - playerPaddlePos.y) / 1;
      const newVelX = -Math.abs(ballVel.x) * 1.05; // Increase speed slightly
      const newVelY = ballVel.y + relativeIntersectY * 2;

      this.ball.setVelocity(newVelX, newVelY);
      this.soundManager.playPaddleHit();
      this.particleSystem.createBurst(ballPos, 0x00ff88);
    }

    // AI paddle collision
    if (
      ballPos.x <= -this.PADDLE_OFFSET + 0.5 &&
      ballPos.x >= -this.PADDLE_OFFSET - 0.5 &&
      ballPos.y >= aiPaddlePos.y - 1 &&
      ballPos.y <= aiPaddlePos.y + 1 &&
      ballVel.x < 0
    ) {
      const relativeIntersectY = (ballPos.y - aiPaddlePos.y) / 1;
      const newVelX = Math.abs(ballVel.x) * 1.05; // Increase speed slightly
      const newVelY = ballVel.y + relativeIntersectY * 2;

      this.ball.setVelocity(newVelX, newVelY);
      this.soundManager.playPaddleHit();
      this.particleSystem.createBurst(ballPos, 0xff4466);
    }

    // Scoring
    if (ballPos.x > this.FIELD_WIDTH / 2) {
      this.aiScore++;
      this.soundManager.playScore();
      this.resetBall();
    } else if (ballPos.x < -this.FIELD_WIDTH / 2) {
      this.playerScore++;
      this.soundManager.playScore();
      this.resetBall();
    }

    // Check game over
    if (this.playerScore >= 5 || this.aiScore >= 5) {
      this.gameOver = true;
    }
  }

  private resetBall(): void {
    this.ball.reset();
    // Add slight delay before next serve
    setTimeout(() => {
      if (!this.gameOver) {
        this.ball.launch();
      }
    }, 1000);
  }

  private updateFPS(): void {
    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastTime)
      );
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  getScores() {
    return { player: this.playerScore, ai: this.aiScore };
  }

  isGameOver() {
    return this.gameOver;
  }

  isPausedState() {
    return this.isPaused;
  }

  setPaused(paused: boolean) {
    this.isPaused = paused;

    // When unpausing, we need to reset the clock to prevent time jump
    if (!paused && this.gameStarted) {
      this.clock.getDelta(); // This call resets the delta time
    }
  }

  getFPS() {
    return this.fps;
  }
}
