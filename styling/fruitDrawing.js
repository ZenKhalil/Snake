
// Central drawFruit funktion
export function drawFruit(ctx, food, cellSize) {
  switch (food.type) {
    case "apple":
      drawApple(ctx, food.x, food.y, cellSize);
      break;
    case "banana":
      drawBanana(ctx, food.x, food.y, cellSize);
      break;
    case "cherry":
      drawCherry(ctx, food.x, food.y, cellSize);
      break;
    case "grape":
      drawGrape(ctx, food.x, food.y, cellSize);
      break;
    case "orange":
      drawOrange(ctx, food.x, food.y, cellSize);
      break;
    case "speedUp":
    case "speedDown":
    case "passThrough":
      drawSpecialFood(ctx, food, cellSize);
      break;
    default:
      drawDefaultFruit(ctx, food.x, food.y, cellSize);
  }
}

// Specifikke tegnefunktioner for hver frugt

function drawApple(ctx, x, y, cellSize) {
  ctx.fillStyle = "#FF0000"; // Rød farve
  ctx.beginPath();
  ctx.arc(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#8B0000"; // Mørkerød
  ctx.fillRect(x * cellSize + cellSize / 2 - 1, y * cellSize, 2, 5);
}

function drawBanana(ctx, x, y, cellSize) {
  ctx.fillStyle = "#FFE135"; // Bananfarve
  ctx.beginPath();
  ctx.ellipse(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 2 - 2,
    cellSize / 4,
    Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawCherry(ctx, x, y, cellSize) {
  for (let i = -1; i <= 1; i += 2) {
    ctx.fillStyle = "#FF0000"; // Rød farve
    ctx.beginPath();
    ctx.arc(
      (x + 0.5 + i * 0.2) * cellSize,
      (y + 0.5) * cellSize,
      cellSize / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#8B0000"; // Mørkerød
    ctx.fillRect((x + 0.5 + i * 0.2) * cellSize - 0.5, y * cellSize, 1, 5);
  }
}

function drawGrape(ctx, x, y, cellSize) {
  ctx.fillStyle = "#800080"; // Lilla farve
  ctx.beginPath();
  ctx.arc(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#D8BFD8"; // Thistle farve
  ctx.beginPath();
  ctx.arc(
    x * cellSize + cellSize / 3,
    y * cellSize + cellSize / 3,
    cellSize / 10,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x * cellSize + (2 * cellSize) / 3,
    y * cellSize + cellSize / 3,
    cellSize / 10,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x * cellSize + cellSize / 2,
    y * cellSize + (2 * cellSize) / 3,
    cellSize / 10,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawOrange(ctx, x, y, cellSize) {
  ctx.fillStyle = "#FFA500"; // Orange farve
  ctx.beginPath();
  ctx.arc(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = "#FF8C00"; // Mørk orange
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x * cellSize + cellSize / 2, y * cellSize + 2);
  ctx.lineTo(x * cellSize + cellSize / 2, y * cellSize + cellSize - 2);
  ctx.stroke();
}

// Generisk tegnefunktion for specielle fødevarer
function drawSpecialFood(ctx, food, cellSize) {
  const { x, y, type } = food;
  let color;

  switch (type) {
    case "speedUp":
      color = "cyan";
      break;
    case "speedDown":
      color = "magenta";
      break;
    case "passThrough":
      color = "blue";
      break;
    default:
      color = "red";
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 2 - 2,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

// Generisk tegnefunktion for ukendte typer
function drawDefaultFruit(ctx, x, y, cellSize) {
  ctx.fillStyle = "red";
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}
