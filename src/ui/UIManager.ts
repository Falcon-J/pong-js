export class UIManager {
  private startMenuElement: HTMLElement;
  private gameOverElement: HTMLElement;
  private gameOverTextElement: HTMLElement;
  private fpsElement: HTMLElement;
  private pauseElement: HTMLElement;
  private playerScoreElement: HTMLElement;
  private aiScoreElement: HTMLElement;
  private pausedOverlayElement: HTMLElement;

  constructor() {
    this.startMenuElement = document.getElementById("startMenu")!;
    this.gameOverElement = document.getElementById("gameOver")!;
    this.gameOverTextElement = document.getElementById("gameOverText")!;
    this.fpsElement = document.getElementById("fps")!;
    this.pauseElement = document.getElementById("pauseMenu")!;
    this.playerScoreElement = document.getElementById("playerScore")!;
    this.aiScoreElement = document.getElementById("aiScore")!;
    this.pausedOverlayElement = document.getElementById("pausedOverlay")!;
  }

  updateScore(playerScore: number, aiScore: number): void {
    // Color-coded score display
    this.playerScoreElement.textContent = playerScore.toString();
    this.aiScoreElement.textContent = aiScore.toString();

    // Update color based on who's winning (maintain base colors but enhance for winners)
    if (playerScore > aiScore) {
      this.playerScoreElement.style.color = "#00ff88"; // Bright green for winning player
      this.playerScoreElement.style.textShadow = "0 0 30px #00ff88";
      this.aiScoreElement.style.color = "#ff4466"; // Standard red for losing AI
      this.aiScoreElement.style.textShadow = "0 0 20px #ff4466";
    } else if (aiScore > playerScore) {
      this.playerScoreElement.style.color = "#00ff88"; // Standard green for losing player
      this.playerScoreElement.style.textShadow = "0 0 20px #00ff88";
      this.aiScoreElement.style.color = "#ff4466"; // Bright red for winning AI
      this.aiScoreElement.style.textShadow = "0 0 30px #ff4466";
    } else {
      // Tied game - both glow equally
      this.playerScoreElement.style.color = "#00ff88";
      this.playerScoreElement.style.textShadow = "0 0 25px #00ff88";
      this.aiScoreElement.style.color = "#ff4466";
      this.aiScoreElement.style.textShadow = "0 0 25px #ff4466";
    }
  }

  showPauseMenu(show: boolean): void {
    this.pauseElement.style.display = show ? "block" : "none";
    this.pausedOverlayElement.style.display = show ? "block" : "none";
  }

  updateFPS(fps: number): void {
    this.fpsElement.textContent = fps.toString();
  }

  hideStartMenu(): void {
    this.startMenuElement.style.display = "none";
  }

  showGameOver(winner: string): void {
    this.gameOverTextElement.textContent = winner;
    this.gameOverElement.style.display = "block";
  }

  hideGameOver(): void {
    this.gameOverElement.style.display = "none";
  }

  isGameOverVisible(): boolean {
    return this.gameOverElement.style.display === "block";
  }
}
