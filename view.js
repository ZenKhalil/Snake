class SnakeView {
  constructor(model, canvasId, cellSize = 28) {
    this.model = model;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.cellSize = cellSize;
    
    this.canvas.width = model.gridWidth * cellSize;
    this.canvas.height = model.gridHeight * cellSize;
  }

  draw() {
    // Ryd canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Tegn mad
    this.drawCell(this.model.food.x, this.model.food.y, "red");

    // Tegn slangen
    let index = 0;
    for (const segment of this.model.snake) {
      this.drawCell(segment.x, segment.y, "green");
      console.log(`Drawing Segment ${index}: (${segment.x}, ${segment.y})`);
      index++;
    }

    if (this.model.gameOver) {
      this.drawGameOver();
    }
  }

  drawCell(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      x * this.cellSize,
      y * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }

  drawGameOver() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, this.canvas.height / 2 - 30, this.canvas.width, 60);
    this.ctx.fillStyle = "white";
    this.ctx.font = "30px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Game Over",
      this.canvas.width / 2,
      this.canvas.height / 2 + 10
    );
  }
}
