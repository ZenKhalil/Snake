// enhancements.js
import { drawFruit } from "./fruitDrawing.js";

// Antag at SnakeModel, SnakeView og SnakeController er tilgængelige globalt

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");
  const speedControl = document.getElementById("speedControl");
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  let controllerInstance; // Til at holde SnakeController instansen

  // Overskriv window.onload for at forhindre original auto-start
  window.onload = () => {};

  // Forbedret SnakeModel med alle enhancements
  class EnhancedSnakeModel extends SnakeModel {
    constructor(gridWidth, gridHeight) {
      super(gridWidth, gridHeight);
      this.score = 0;
      this.highScore = this.loadHighScore();
      this.level = 1;
      this.obstacleCounts = { 1: 10, 2: 20, 3: 30 }; // Antal forhindringer pr. niveau
      this.obstacles = this.generateObstacles(this.obstacleCounts[this.level]);
      this.lives = 3; // Antal liv
      this.abilities = {
        passThrough: false,
        passThroughTimer: null,
      };
      this.foodTimeLimit = 5000; // 5 sekunder
      this.foodTimer = null;
      this.onCollision = null; // Callback for collision

      // Sørg for, at this.obstacles er initialiseret før generateFood kaldes
      // Dette er allerede håndteret ved at kalde generateObstacles før generateFood
      this.food = this.generateFood(false); // Initial food
      this.foodVisible = true;
    }

    resetSnakePosition() {
      // Bevar slangens længde
      const length = this.snake.size(); // Hent den nuværende længde
      this.snake = new Queue();
      const startX = Math.floor(this.gridWidth / 2);
      const startY = Math.floor(this.gridHeight / 2);

      // Placer slangen centreret med den samme længde
      for (let i = length - 1; i >= 0; i--) {
        this.snake.enqueue({ x: startX - i, y: startY });
      }

      this.direction = "RIGHT";
      this.nextDirection = "RIGHT";

      // Bevar eksisterende forhindringer og mad
      // this.obstacles og this.food ændres ikke
    }

    loadHighScore() {
      return parseInt(localStorage.getItem("snakeHighScore")) || 0;
    }

    saveHighScore() {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem("snakeHighScore", this.highScore);
      }
    }

    generateObstacles(count) {
      const obstacles = [];
      let attempts = 0;
      const maxAttempts = 1000;

      while (obstacles.length < count && attempts < maxAttempts) {
        attempts++;
        const position = {
          x: Math.floor(Math.random() * this.gridWidth),
          y: Math.floor(Math.random() * this.gridHeight),
        };
        if (
          !this.isSnakePosition(position) &&
          !(
            this.food &&
            this.food.x === position.x &&
            this.food.y === position.y
          ) &&
          !obstacles.some((obs) => obs.x === position.x && obs.y === position.y)
        ) {
          obstacles.push(position);
        }
      }

      if (attempts >= maxAttempts) {
        console.warn("Maksimale forsøg nået for at generere forhindringer.");
      }

      return obstacles;
    }

    generateFood(withDelay = true) {
      const types = ["apple", "banana", "cherry", "grape", "orange"];
      let position;
      do {
        position = {
          x: Math.floor(Math.random() * this.gridWidth),
          y: Math.floor(Math.random() * this.gridHeight),
        };
      } while (this.isSnakePosition(position));

      const type = types[Math.floor(Math.random() * types.length)];
      const newFood = { ...position, type };

      if (withDelay) {
        this.foodVisible = false; // Hide the fruit initially
        setTimeout(() => {
          this.foodVisible = true;
          this.food = newFood;
        }, 2000);
        return null; // Food is not visible yet
      } else {
        this.foodVisible = true; // Make the initial food visible immediately
        return newFood;
      }
    }

    // Getter for at se om food er visible
    isFoodVisible() {
      return this.foodVisible;
    }

    startFoodTimer() {
      if (this.foodTimer) {
        clearTimeout(this.foodTimer);
      }
      this.foodTimer = setTimeout(() => {
        this.foodVisible = false;
        // Implementer straf eller anden handling her
        console.log("Mad forsvandt! Tidsbegrænsning overskredet.");
        this.food = null;
      }, this.foodTimeLimit);
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
        this.handleCollision();
        return;
      }

      // Tjek for kollision med forhindringer
      if (
        this.obstacles.some((obs) => obs.x === newHead.x && obs.y === newHead.y)
      ) {
        this.handleCollision();
        return;
      }

      // Tjek for kollision med kroppen, med undtagelse hvis evnen er aktiv
      if (!this.abilities.passThrough && this.isSnakePosition(newHead)) {
        this.handleCollision();
        return;
      }

      // Tilføj det nye hoved til slangen
      this.snake.enqueue(newHead);

      // Tjek om mad er spist
      if (
        this.foodVisible &&
        this.food &&
        newHead.x === this.food.x &&
        newHead.y === this.food.y
      ) {
        clearTimeout(this.foodTimer);
        this.applyFoodEffect(this.food.type);
        this.food = this.generateFood(true);
        this.score += 10; // Øg score
        this.saveHighScore();
        console.log("Spiste mad, slangen vokser");

        // Øg hastigheden efter hver madspisning
        this.increaseSpeed();

        // Eventuelt tjek om niveauet skal øges
        this.checkLevelUp();
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

    handleCollision() {
      this.lives--;
      if (this.lives > 0) {
        console.log(`Kollision! Liv tilbage: ${this.lives}`);
        if (this.onCollision) {
          this.onCollision();
        }
      } else {
        this.gameOver = true;
        console.log("Game Over: Ingen forsøg tilbage");
        this.saveHighScore();
      }
    }

    resetSnake() {
      // Genstart slangen i midten
      this.snake = new Queue();
      const startX = Math.floor(this.gridWidth / 2);
      const startY = Math.floor(this.gridHeight / 2);

      this.snake.enqueue({ x: startX - 2, y: startY }); // Hale
      this.snake.enqueue({ x: startX - 1, y: startY }); // Mellem
      this.snake.enqueue({ x: startX, y: startY }); // Hoved

      this.direction = "RIGHT";
      this.nextDirection = "RIGHT";
      this.score = 0; // Reset score
      this.level = 1; // Reset niveau

      // Generer forhindringer først
      this.obstacles = this.generateObstacles(this.obstacleCounts[this.level]);

      // Generer mad efter forhindringerne er genereret
      this.food = this.generateFood(false);
      this.foodVisible = true;
    }

    applyFoodEffect(type) {
      switch (type) {
        case "apple":
          // Standard mad, ingen ekstra effekt
          break;
        case "banana":
          // Øg slangen med et ekstra segment
          this.snake.enqueue({ ...this.snake.tail.data });
          break;
        case "cherry":
          // Øg hastigheden med 10%
          if (this.onSpeedChange) {
            this.onSpeedChange(0.9); // Reducer intervallet med 10%
          }
          break;
        case "grape":
          // Reducer hastigheden med 10%
          if (this.onSpeedChange) {
            this.onSpeedChange(1.1); // Øg intervallet med 10%
          }
          break;
        case "orange":
          // Tilføj 2 ekstra segmenter
          this.snake.enqueue({ ...this.snake.tail.data });
          this.snake.enqueue({ ...this.snake.tail.data });
          break;
        case "speedUp":
          if (this.onSpeedChange) {
            this.onSpeedChange(0.9); // Reducer intervallet med 10%
          }
          break;
        case "speedDown":
          if (this.onSpeedChange) {
            this.onSpeedChange(1.1); // Øg intervallet med 10%
          }
          break;
        case "passThrough":
          this.applyAbility("passThrough");
          break;
        default:
          break;
      }
    }

    applyAbility(type) {
      switch (type) {
        case "passThrough":
          this.abilities.passThrough = true;
          this.abilities.passThroughTimer = setTimeout(() => {
            this.abilities.passThrough = false;
          }, 5000); // 5 sekunders evne
          break;
        // Kan tilføje flere evner her
        default:
          break;
      }
    }

    checkLevelUp() {
      // Eksempel: Øg niveau hver 50 point
      if (this.score > 0 && this.score % 50 === 0 && this.level < 3) {
        this.level++;
        console.log(`Niveau op! Nu på niveau ${this.level}`);
        this.obstacles = this.generateObstacles(
          this.obstacleCounts[this.level]
        );
      }
    }

    increaseSpeed() {
      // Denne funktion kan signalere controlleren til at øge hastigheden
      if (this.onSpeedChange) {
        this.onSpeedChange(0.95); // Reducer intervallet med 5%
      }
    }

    isFoodVisible() {
      return this.foodVisible;
    }
  }

  // Forbedret SnakeView med alle enhancements
  class EnhancedSnakeView extends SnakeView {
    constructor(model, canvasId, cellSize = 28) {
      super(model, canvasId, cellSize);
      this.scoreElement = document.getElementById("score");
      this.highScoreElement = document.getElementById("highScore");
      this.levelElement = document.getElementById("level");
      this.livesContainer = document.getElementById("lives");
      this.draw();
    }

    draw() {
      // Ryd canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Tegn forhindringer
      for (const obstacle of this.model.obstacles) {
        this.drawCell(obstacle.x, obstacle.y, "gray");
      }

      // Tegn frugten kun hvis den er synlig
      if (this.model.isFoodVisible() && this.model.food) {
        drawFruit(this.ctx, this.model.food, this.cellSize);
      }

      // Tegn slangen med forbedret stil
      for (const segment of this.model.snake) {
        this.drawCell(segment.x, segment.y, "snake");
      }

      // Opdater HUD
      this.updateHUD();

      if (this.model.gameOver) {
        this.drawGameOver();
      }
    }

    drawCell(x, y, type) {
      if (type === "snake") {
        const cell = this.cellSize;
        const gradient = this.ctx.createLinearGradient(
          x * cell,
          y * cell,
          (x + 1) * cell,
          (y + 1) * cell
        );
        gradient.addColorStop(0, "#27ae60");
        gradient.addColorStop(1, "#2ecc71");
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
      } else if (type === "gray") {
        this.ctx.fillStyle = "gray";
        this.ctx.fillRect(
          x * this.cellSize + 1,
          y * this.cellSize + 1,
          this.cellSize - 2,
          this.cellSize - 2
        );
      }
    }

    updateHUD() {
      // Opdater score, highscore og level
      this.scoreElement.textContent = this.model.score;
      this.highScoreElement.textContent = this.model.highScore;
      this.levelElement.textContent = this.model.level;

      // Opdater lives
      this.updateLives();
    }

    updateLives() {
      // Ryd eksisterende hjerter
      this.livesContainer.innerHTML = "";

      // Tilføj hjerter baseret på antallet af liv
      for (let i = 0; i < this.model.lives; i++) {
        const heart = document.createElement("img");
        heart.src = "./styling/heart.png";
        heart.alt = "Life";
        heart.classList.add("life");
        this.livesContainer.appendChild(heart);
      }
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

  // Forbedret SnakeController med alle enhancements
  class EnhancedSnakeController extends SnakeController {
    constructor(model, view, tickInterval = 500) {
      super(model, view, tickInterval);
      this.originalTickInterval = tickInterval;
      this.currentTickInterval = tickInterval;
      this.intervalId = null; // Sørg for at ingen interval kører initialt
      this.isPaused = false;
      this.setupControls();

      // Bind callback for speed changes
      this.model.onSpeedChange = this.adjustSpeed.bind(this);

      // Bind callback for collision
      this.model.onCollision = this.pauseGame.bind(this);
    }
    pauseGame() {
      this.stop();
      this.isPaused = true;
      this.showCountdownModal(5);
    }

    resumeGame() {
      this.isPaused = false; // Nulstil paused flag
      this.start();
      this.view.draw();
    }

    showCountdownModal(seconds) {
      const modal = document.getElementById("countdownModal");
      const countdownElement = document.getElementById("countdown");
      modal.style.display = "block";
      let remaining = seconds;

      countdownElement.textContent = remaining;
      const countdownInterval = setInterval(() => {
        remaining--;
        countdownElement.textContent = remaining;
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          modal.style.display = "none";
          if (this.model.gameOver) {
            this.stop();
            this.showGameOverModal();
          } else {
            this.model.resetSnakePosition();
            this.isPaused = false; 
            this.start();
          }
        }
      }, 1000);
    }

    setupControls() {
      startButton.addEventListener("click", () => {
        if (!this.intervalId && !this.model.gameOver) {
          this.start();
        }
      });

      speedControl.addEventListener("change", (e) => {
        const newSpeed = parseInt(e.target.value, 10);
        this.currentTickInterval = newSpeed;
        if (this.intervalId) {
          this.stop();
          this.start();
        }
        speedControl.blur();
      });

      document.addEventListener("keydown", (e) => {
         if (this.isPaused) return;
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          if (!this.intervalId && !this.model.gameOver) {
            this.start();
          }
        }
      });
    }

    start() {
      if (this.intervalId) return;

      this.intervalId = setInterval(() => {
        this.model.move();
        this.view.draw();
        if (this.model.gameOver) {
          this.stop();
          showGameOverModal();
        }
      }, this.currentTickInterval);
    }

    stop() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    restart() {
      this.stop();

      // Geninitialiser modellen
      const newModel = new EnhancedSnakeModel(
        this.model.gridWidth,
        this.model.gridHeight
      );
      this.model = newModel;
      this.view.model = newModel;
      this.view.draw();

      // Nulstil hastigheden til den oprindelige værdi (Normal)
      this.currentTickInterval = this.originalTickInterval;

      // Opdater speedControl UI til 'Normal'
      const speedControl = document.getElementById("speedControl");
      speedControl.value = this.originalTickInterval.toString(); // '300'

      // Start intervalet igen med den oprindelige hastighed
      this.stop(); // Sikrer, at ingen gamle intervaller kører
      if (!this.model.gameOver) {
        this.stop();
      }

      // Bind callbacks igen
      this.model.onSpeedChange = this.adjustSpeed.bind(this);
      this.model.onCollision = this.pauseGame.bind(this);
    }

    adjustSpeed(factor) {
      clearInterval(this.intervalId);
      this.currentTickInterval = Math.max(
        50,
        Math.floor(this.currentTickInterval * factor)
      );
      this.intervalId = setInterval(() => {
        this.model.move();
        this.view.draw();
        if (this.model.gameOver) {
          this.stop();
          showGameOverModal();
        }
      }, this.currentTickInterval);
    }
  }

  // Initialiser den forbedrede model og view
  const enhancedModel = new EnhancedSnakeModel(30, 20);
  const enhancedView = new EnhancedSnakeView(enhancedModel, "gameCanvas", 28);
  controllerInstance = new EnhancedSnakeController(
    enhancedModel,
    enhancedView,
    300
  ); // Standard hastighed

  // Funktion til at vise Game Over modal
  function showGameOverModal() {
    const modal = document.getElementById("gameOverModal");
    modal.style.display = "block";

    const modalOkButton = document.getElementById("modalOkButton");
    modalOkButton.focus();

    // Når brugeren klikker på OK, skjul modal og nulstil spillet
    const okHandler = () => {
      modal.style.display = "none";
      controllerInstance.restart();
      modalOkButton.removeEventListener("click", okHandler);
      closeModal.removeEventListener("click", closeHandler);
    };

    modalOkButton.addEventListener("click", okHandler);

    // Tillad lukning af modal ved at klikke på "close" elementet
    const closeModal = document.getElementById("closeModal");
    const closeHandler = () => {
      modal.style.display = "none";
      controllerInstance.restart();
      modalOkButton.removeEventListener("click", okHandler);
      closeModal.removeEventListener("click", closeHandler);
    };

    closeModal.addEventListener("click", closeHandler);
  }
});
