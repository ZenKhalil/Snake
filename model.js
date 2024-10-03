class SnakeModel {
  constructor(gridWidth, gridHeight) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.snake = new Queue();

    const startX = Math.floor(gridWidth / 2);
    const startY = Math.floor(gridHeight / 2);

    // Start slangen med 3 segmenter korrekt fra hale til hoved
    this.snake.enqueue({ x: startX - 2, y: startY }); // Hale
    this.snake.enqueue({ x: startX - 1, y: startY }); // Mellem
    this.snake.enqueue({ x: startX, y: startY }); // Hoved

    this.direction = "RIGHT"; // Initial retning
    this.nextDirection = "RIGHT"; // Næste retning
    this.food = this.generateFood(false); // Generer initial frugt uden forsinkelse
    this.foodVisible = true; // Initial frugt er synlig
    this.gameOver = false;
  }

  generateFood(withDelay = true) {
    let position;
    do {
      position = {
        x: Math.floor(Math.random() * this.gridWidth),
        y: Math.floor(Math.random() * this.gridHeight),
      };
    } while (this.isSnakePosition(position));

    if (withDelay) {
      this.foodVisible = false; // Skjul frugten initialt
      const newFood = { ...position };

      // Sæt en timeout for at gøre frugten synlig efter 2 sekunder
      setTimeout(() => {
        this.foodVisible = true;
        this.food = newFood;
      }, 2000);

      return null; // Frugten er endnu ikke synlig
    } else {
      this.foodVisible = true; // Gør den initiale frugt synlig straks
      return position;
    }
  }

  isSnakePosition(position) {
    for (const segment of this.snake) {
      if (segment.x === position.x && segment.y === position.y) {
        return true;
      }
    }
    return false;
  }

  changeDirection(newDirection) {
    const oppositeDirections = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };
    if (oppositeDirections[newDirection] !== this.direction) {
      this.nextDirection = newDirection; // Opdater til næste retning
    }
  }

  move() {
    console.log("Move kaldt");

    // Opdater retningen til næste retning
    this.direction = this.nextDirection;

    // Identificer slangens hoved
    const head = this.snake.tail.data;
    let newHead;

    switch (this.direction) {
      case "UP":
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case "DOWN":
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case "LEFT":
        newHead = { x: head.x - 1, y: head.y };
        break;
      case "RIGHT":
        newHead = { x: head.x + 1, y: head.y };
        break;
      default:
        newHead = { x: head.x, y: head.y };
    }

    console.log(`Ny Hoved: (${newHead.x}, ${newHead.y})`);

    // Håndtering af grid-grænser
    if (
      newHead.x < 0 ||
      newHead.x >= this.gridWidth ||
      newHead.y < 0 ||
      newHead.y >= this.gridHeight
    ) {
      this.gameOver = true;
      console.log("Game Over: Ramte væggen");
      return;
    }

    // Tjek for kollision med kroppen
    if (this.isSnakePosition(newHead)) {
      this.gameOver = true;
      console.log("Game Over: Kolliderede med sig selv");
      return;
    }

    // Tilføj det nye hoved til slangen
    this.snake.enqueue(newHead);

    // Tjek om mad er spist
    if (
      this.foodVisible &&
      newHead.x === this.food.x &&
      newHead.y === this.food.y
    ) {
      // Generer ny mad med forsinkelse
      this.food = this.generateFood(true);
      console.log("Spiste mad, slangen vokser");
      // Slangen vokser ved ikke at fjerne halen
    } else {
      // Flyt slangen ved at fjerne halen
      const removed = this.snake.dequeue();
      console.log(`Fjernet Hale: (${removed.x}, ${removed.y})`);
    }

    // Log slangen for debugging
    console.log("Nuværende Slange:");
    let index = 0;
    for (const segment of this.snake) {
      console.log(`Segment ${index}: (${segment.x}, ${segment.y})`);
      index++;
    }
  }

  // Valgfri: Getter for at tjekke om mad er synlig
  isFoodVisible() {
    return this.foodVisible;
  }
}
