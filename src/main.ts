import * as THREE from "three";
import { PongGame } from "./game/PongGame";
import { UIManager } from "./ui/UIManager";

/**
 * Main Application Controller
 *
 * Manages the overall game state, user input, and UI coordination.
 * Implements the main game loop with proper separation of concerns.
 *
 * Features:
 * - Smooth keyboard and mouse input handling
 * - Pause/resume functionality
 * - Professional game state management
 * - Performance monitoring
 *
 * @author MAANG-Ready Developer
 */
class App {
  private game: PongGame;
  private ui: UIManager;
  private isGameStarted = false;
  private isPaused = false;

  // Keyboard state tracking
  private keys: { [key: string]: boolean } = {};
  private paddleSpeed = 15;
  private paddleVelocity = 0;
  private paddleAcceleration = 50;
  private paddleFriction = 0.9;

  constructor() {
    this.ui = new UIManager();
    this.game = new PongGame();
    this.setupEventListeners();
    this.animate();
  }

  private setupEventListeners(): void {
    const startButton = document.getElementById("startButton");
    if (startButton) {
      startButton.addEventListener("click", () => this.startGame());
    }

    // Keyboard event listeners
    document.addEventListener("keydown", (event) => {
      this.keys[event.key.toLowerCase()] = true;

      // Game controls
      if (event.key.toLowerCase() === "r" && this.game.isGameOver()) {
        this.restartGame();
      }

      // Pause/Unpause with Space or P key
      if (
        (event.code === "Space" || event.key.toLowerCase() === "p") &&
        this.isGameStarted
      ) {
        this.togglePause();
        event.preventDefault(); // Prevent page scroll with spacebar
      }

      // Escape key also pauses
      if (event.key === "Escape" && this.isGameStarted) {
        this.togglePause();
      }
    });

    document.addEventListener("keyup", (event) => {
      this.keys[event.key.toLowerCase()] = false;
    });

    // Mouse movement for paddle control
    document.addEventListener("mousemove", (event) => {
      if (this.isGameStarted && !this.game.isGameOver() && !this.isPaused) {
        // Convert mouse Y position to game coordinates
        const rect = document
          .getElementById("gameContainer")
          ?.getBoundingClientRect();
        if (rect) {
          const mouseY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
          // Reset keyboard velocity when using mouse
          this.paddleVelocity = 0;
          this.game.updatePlayerPaddle(-mouseY * 3.5); // Smooth mouse control
        }
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.game.handleResize();
    });

    // Prevent context menu on right click
    document.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  private startGame(): void {
    this.isGameStarted = true;
    this.isPaused = false;
    this.paddleVelocity = 0; // Reset paddle movement
    this.ui.hideStartMenu();
    this.game.start();
  }

  private restartGame(): void {
    this.isPaused = false;
    this.paddleVelocity = 0; // Reset paddle movement
    this.game.setPaused(false); // Ensure game is not paused
    this.game.restart();
    this.ui.hideGameOver();
  }

  private togglePause(): void {
    if (this.game.isGameOver()) return;

    this.isPaused = !this.isPaused;
    this.game.setPaused(this.isPaused); // Sync with game state
    this.ui.showPauseMenu(this.isPaused);

    if (this.isPaused) {
      this.paddleVelocity = 0; // Stop paddle movement when paused
    }
  }
  private animate = (): void => {
    requestAnimationFrame(this.animate);

    if (this.isGameStarted && !this.isPaused) {
      // Handle keyboard input for paddle movement
      this.handleKeyboardInput();

      this.game.update();
      this.game.render();

      // Update UI
      const scores = this.game.getScores();
      this.ui.updateScore(scores.player, scores.ai);
      this.ui.updateFPS(this.game.getFPS());

      // Check game over
      if (this.game.isGameOver() && !this.ui.isGameOverVisible()) {
        const winner = scores.player >= 5 ? "YOU WIN!" : "AI WINS!";
        this.ui.showGameOver(winner);
      }
    } else if (this.isGameStarted) {
      // Game is paused, still render but don't update
      this.game.render();
      const scores = this.game.getScores();
      this.ui.updateScore(scores.player, scores.ai);
      this.ui.updateFPS(this.game.getFPS());
    }
  };

  private handleKeyboardInput(): void {
    if (this.game.isGameOver() || this.isPaused) return;

    const deltaTime = 0.016; // Approximate 60 FPS
    let acceleration = 0;

    // Arrow keys or WASD - apply acceleration
    if (this.keys["arrowup"] || this.keys["w"]) {
      acceleration += this.paddleAcceleration;
    }
    if (this.keys["arrowdown"] || this.keys["s"]) {
      acceleration -= this.paddleAcceleration;
    }

    // Update velocity with acceleration
    this.paddleVelocity += acceleration * deltaTime;

    // Apply friction when no input
    if (acceleration === 0) {
      this.paddleVelocity *= this.paddleFriction;
    }

    // Clamp velocity
    this.paddleVelocity = Math.max(
      -this.paddleSpeed,
      Math.min(this.paddleSpeed, this.paddleVelocity)
    );

    // Update position
    if (Math.abs(this.paddleVelocity) > 0.01) {
      const currentPaddlePos = this.game.getPlayerPaddlePosition();
      let newY = currentPaddlePos.y + this.paddleVelocity * deltaTime;

      // Clamp to field boundaries
      const fieldHeight = 8;
      newY = Math.max(
        -fieldHeight / 2 + 1,
        Math.min(fieldHeight / 2 - 1, newY)
      );

      this.game.setPlayerPaddlePosition(newY);
    }
  }
}

// Initialize the application
new App();
