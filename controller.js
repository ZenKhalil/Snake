// grid størrelse via konstanter
const GRID_WIDTH = 30;
const GRID_HEIGHT = 20;

class SnakeController {
  constructor(model, view, tickInterval = 500) {
    this.model = model;
    this.view = view;
    this.tickInterval = tickInterval;
    this.intervalId = null;

    this.setupInput();
  }

  setupInput() {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
          this.model.changeDirection("UP");
          break;
        case "ArrowDown":
          this.model.changeDirection("DOWN");
          break;
        case "ArrowLeft":
          this.model.changeDirection("LEFT");
          break;
        case "ArrowRight":
          this.model.changeDirection("RIGHT");
          break;
        case "Enter":
          if (this.model.gameOver) {
            this.restart();
          }
          break;
      }
    });
  }

  start() {
    this.intervalId = setInterval(() => {
      this.model.move();
      this.view.draw();
      if (this.model.gameOver) {
        clearInterval(this.intervalId);
        alert("Game Over! Press Enter to restart.");
      }
    }, this.tickInterval);
  }

  stop() {
    clearInterval(this.intervalId);
  }

  restart() {
    console.log("Restarting game...");
    // Geninitialiser modellen
    const newModel = new SnakeModel(
      this.model.gridWidth,
      this.model.gridHeight
    );
    this.model = newModel;
    this.view.model = newModel;
    this.start();
  }
}

// Initialisering forbliver den samme
window.onload = () => {
  console.log("Window onload triggered");
  const model = new SnakeModel(GRID_WIDTH, GRID_HEIGHT);
  const view = new SnakeView(model, "gameCanvas", 28);
  const controller = new SnakeController(model, view, 500); // 500ms per tick

  // Start spillet
  // controller.start(); // Comment out this line to prevent auto-start
};