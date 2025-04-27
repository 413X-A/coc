let currentUser = null;
let gold = 0;
let population = 0;
let mineLevel = 1;
let gridSize = 10;
let grid = [];
let selectedBuilding = null;

const gameArea = document.getElementById('gameArea');
const goldDisplay = document.getElementById('gold');
const populationDisplay = document.getElementById('population');

// Login
function login() {
  const username = document.getElementById('usernameInput').value.trim();
  const password = document.getElementById('passwordInput').value;

  if (!username || !password) {
    showLoginError('Bitte Benutzername und Passwort eingeben!');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '{}');

  if (users[username]) {
    if (users[username].password !== password) {
      showLoginError('Falsches Passwort!');
      return;
    }
    // Login erfolgreich
    currentUser = username;
    loadGame();
  } else {
    // Neuer Benutzer anlegen
    users[username] = { password, game: null };
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = username;
    createNewGame();
  }

  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';
}

function showLoginError(message) {
  document.getElementById('loginError').textContent = message;
}

// Spielstand laden
function loadGame() {
  const users = JSON.parse(localStorage.getItem('users'));
  const userData = users[currentUser];

  if (userData && userData.game) {
    const save = userData.game;
    gold = save.gold;
    population = save.population;
    grid = save.grid;
    setupGridFromSave();
    updateHUD();
  } else {
    createNewGame();
  }
}

// Neues Spiel erstellen
function createNewGame() {
  gold = 100;
  population = 0;
  createGrid();
  placeBuilding(5, 5, 'rathaus', 2);
  grid[5][5].element.textContent = '🏰';
  saveGame();
}

// Spielfeld neu aufbauen aus Save
function setupGridFromSave() {
  gameArea.innerHTML = '';
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      let cellData = grid[y][x];
      let cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.addEventListener('click', handleCellClick);
      if (cellData.type) {
        cell.textContent = getEmoji(cellData.type);
      }
      gameArea.appendChild(cell);
      grid[y][x] = { ...cellData, element: cell };
    }
  }
}

// Spielfeld neu erstellen
function createGrid() {
  gameArea.innerHTML = '';
  grid = [];
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
    selectedBuilding = null;
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
        grid[y + dy][x + dx].element.textContent = '';
      }
    }
  }

  if (type === 'haus') {
    population += 5;
    updateHUD();
  }

  saveGame();
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
  saveGame();
}

function saveGame() {
  const users = JSON.parse(localStorage.getItem('users'));
  users[currentUser].game = {
    gold,
    population,
    grid: grid.map(row => row.map(cell => ({
      occupied: cell.occupied,
      type: cell.type
    })))
  };
  localStorage.setItem('users', JSON.stringify(users));
}

// Gold automatisch generieren
setInterval(() => {
  if (currentUser) {
    generateGold();
  }
}, 1000);
