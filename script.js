let currentUser = null;
let gold = 0;
let population = 0;
let gridSize = 10;
let grid = [];
let selectedBuilding = null;

const gameArea = document.getElementById('gameArea');
const goldDisplay = document.getElementById('gold');
const populationDisplay = document.getElementById('population');

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
    currentUser = username;
    loadGame();
  } else {
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

function createNewGame() {
  gold = 100;
  population = 0;
  createGrid();
  placeBuilding(5, 5, 'rathaus', 2);
  grid[5][5].element.textContent = '🏰';
  saveGame();
}

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
        cell.textContent = getEmoji(cellData.type, cellData.level);
      }
      grid[y][x] = { ...cellData, element: cell };
      gameArea.appendChild(cell);
    }
  }
}

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
      grid[y][x] = { occupied: false, element: cell, type: null, level: 1 };
    }
  }
}

function selectBuilding(type) {
  selectedBuilding = type;
}

function handleCellClick(event) {
  const x = parseInt(event.target.dataset.x);
  const y = parseInt(event.target.dataset.y);

  if (selectedBuilding) {
    let size = getBuildingSize(selectedBuilding);
    if (canPlace(x, y, size)) {
      build(x, y, selectedBuilding, size);
      selectedBuilding = null;
    } else {
      alert('Hier kann nichts gebaut werden!');
    }
  } else {
    tryUpgrade(x, y);
  }
}

function getBuildingSize(type) {
  if (type === 'weg') return 1;
  if (type === 'haus' || type === 'goldmine' || type === 'rathaus') return 2;
  return 1;
}

function canPlace(x, y, size) {
  if (x + size > gridSize || y + size > gridSize) return false;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[y + i][x + j].occupied) return false;
    }
  }
  return true;
}

function build(x, y, type, size) {
  let cost = getBuildingCost(type);
  if (gold < cost) {
    alert('Nicht genug Gold!');
    return;
  }

  gold -= cost;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      grid[y + i][x + j].occupied = true;
      grid[y + i][x + j].type = type;
      grid[y + i][x + j].level = 1;
      grid[y + i][x + j].element.textContent = getEmoji(type);
    }
  }

  if (type === 'haus') {
    population += 5;
  }
  if (type === 'goldmine') {
    gold += 50; // Sofort Goldbonus
  }

  updateHUD();
  saveGame();
}

function getBuildingCost(type) {
  if (type === 'weg') return 10;
  if (type === 'haus') return 50;
  if (type === 'goldmine') return 100;
  return 0;
}

function tryUpgrade(x, y) {
  const cell = grid[y][x];
  if (cell.type === 'haus') {
    if (gold >= 100) {
      gold -= 100;
      cell.level++;
      cell.element.textContent = getEmoji('haus', cell.level);
      population += 10; // Jeder Upgrade bringt mehr Einwohner
      updateHUD();
      saveGame();
    } else {
      alert('Nicht genug Gold für Upgrade! (100 Gold)');
    }
  }
}

function getEmoji(type, level = 1) {
  if (type === 'weg') return '🛤️';
  if (type === 'haus') return level > 1 ? '🏠🏠' : '🏠';
  if (type === 'goldmine') return '⛏️';
  if (type === 'rathaus') return '🏰';
  return '';
}

function updateHUD() {
  goldDisplay.textContent = `Gold: ${gold}`;
  populationDisplay.textContent = `Einwohner: ${population}`;
}

function saveGame() {
  const users = JSON.parse(localStorage.getItem('users'));
  users[currentUser].game = {
    gold,
    population,
    grid
  };
  localStorage.setItem('users', JSON.stringify(users));
}
