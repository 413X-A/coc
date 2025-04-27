let gold = 100;
let population = 0;
let mineLevel = 1;
let gridSize = 10;
let grid = [];
let selectedBuilding = null;

const gameArea = document.getElementById('gameArea');
const goldDisplay = document.getElementById('gold');
const populationDisplay = document.getElementById('population');

// Spielfeld erstellen
function createGrid() {
  for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < gridSize; x++) {
      let cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.addEventListener('click', handleCellClick);
      gameArea.appendChild(cell);
      grid[y][x] = { occupied: false, element: cell, type: null };
    }
  }
  // Rathaus in der Mitte platzieren
  placeBuilding(5, 5, 'rathaus', 2);
  grid[5][5].element.textContent = '🏰';
}

function selectBuilding(type) {
  selectedBuilding = type;
}

function handleCellClick(event) {
  if (!selectedBuilding) return;

  const x = parseInt(event.target.dataset.x);
  const y = parseInt(event.target.dataset.y);

  let size = getBuildingSize(selectedBuilding);

  if (canPlace(x, y, size)) {
    build(x, y, selectedBuilding, size);
    selectedBuilding = null; // Nach Bau wieder "nichts ausgewählt"
  } else {
    alert('Hier kann nichts gebaut werden!');
  }
}

function getBuildingSize(type) {
  if (type === 'weg') return 1;
  if (type === 'haus') return 2;
  if (type === 'goldmine') return 2;
  return 1;
}

function getBuildingCost(type) {
  if (type === 'weg') return 10;
  if (type === 'haus') return 50;
  if (type === 'goldmine') return 100;
  return 0;
}

function canPlace(x, y, size) {
  if (x + size - 1 >= gridSize || y + size - 1 >= gridSize) {
    return false;
  }
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      if (grid[y + dy][x + dx].occupied) return false;
    }
  }
  return true;
}

function build(x, y, type, size) {
  const cost = getBuildingCost(type);
  if (gold < cost) {
    alert('Nicht genug Gold!');
    return;
  }

  gold -= cost;
  updateHUD();

  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      grid[y + dy][x + dx].occupied = true;
      grid[y + dy][x + dx].type = type;
      if (dy === 0 && dx === 0) {
        grid[y + dy][x + dx].element.textContent = getEmoji(type);
      } else {
        grid[y + dy][x + dx].element.textContent = ''; // Nur oberstes Feld zeigt Emoji
      }
    }
  }

  if (type === 'haus') {
    population += 5; // jedes Haus bringt 5 Einwohner
    updateHUD();
  }
}

function getEmoji(type) {
  if (type === 'weg') return '🛤️';
  if (type === 'haus') return '🏠';
  if (type === 'goldmine') return '⛏️';
  if (type === 'rathaus') return '🏰';
  return '';
}

function placeBuilding(x, y, type, size) {
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      grid[y + dy][x + dx].occupied = true;
      grid[y + dy][x + dx].type = type;
    }
  }
}

function updateHUD() {
  goldDisplay.textContent = `Gold: ${gold}`;
  populationDisplay.textContent = `Einwohner: ${population}`;
}

function generateGold() {
  let mineCount = 0;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x].type === 'goldmine') {
        mineCount++;
      }
    }
  }
  gold += mineCount * mineLevel;
  updateHUD();
}

// Spiel starten
createGrid();
setInterval(generateGold, 1000);
