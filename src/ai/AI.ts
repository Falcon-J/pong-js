import * as THREE from "three";

export class AI {
  private difficulty = 0.7; // 0-1, where 1 is perfect
  private speed = 4;
  private reactionTime = 0.1; // seconds
  private predictionAccuracy = 0.8;
  private lastReactionTime = 0;
  private predictedBallY = 0;

  constructor(difficulty: number = 0.7) {
    this.difficulty = Math.max(0.1, Math.min(1, difficulty));
    this.speed = 2 + this.difficulty * 6; // Speed increases with difficulty
    this.predictionAccuracy = 0.5 + this.difficulty * 0.5;
    this.reactionTime = 0.3 - this.difficulty * 0.2;
  }

  calculateMove(
    ballPosition: THREE.Vector3,
    paddlePosition: THREE.Vector3,
    deltaTime: number
  ): number {
    this.lastReactionTime += deltaTime;

    // Only react after reaction time delay
    if (this.lastReactionTime >= this.reactionTime) {
      this.predictBallPosition(ballPosition);
      this.lastReactionTime = 0;
    }

    // Calculate desired position
    let targetY = this.predictedBallY;

    // Add some randomness based on difficulty (lower difficulty = more random)
    const randomOffset = (Math.random() - 0.5) * (2 - this.difficulty * 2);
    targetY += randomOffset;

    // Calculate movement towards target
    const currentY = paddlePosition.y;
    const difference = targetY - currentY;
    const maxMove = this.speed * deltaTime;

    if (Math.abs(difference) <= maxMove) {
      return targetY;
    } else {
      return currentY + Math.sign(difference) * maxMove;
    }
  }

  private predictBallPosition(ballPosition: THREE.Vector3): void {
    // Simple prediction: assume ball continues in current direction
    // In a real scenario, we'd predict where the ball will be when it reaches our paddle

    // Add some inaccuracy based on difficulty
    const accuracy = this.predictionAccuracy;
    const inaccuracy = (1 - accuracy) * (Math.random() - 0.5) * 4;

    this.predictedBallY = ballPosition.y + inaccuracy;

    // Clamp to field boundaries
    this.predictedBallY = Math.max(-3, Math.min(3, this.predictedBallY));
  }

  setDifficulty(difficulty: number): void {
    this.difficulty = Math.max(0.1, Math.min(1, difficulty));
    this.speed = 2 + this.difficulty * 6;
    this.predictionAccuracy = 0.5 + this.difficulty * 0.5;
    this.reactionTime = 0.3 - this.difficulty * 0.2;
  }

  getDifficulty(): number {
    return this.difficulty;
  }
}
