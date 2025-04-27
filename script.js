const loginPage = document.getElementById('loginPage');
const gamePage = document.getElementById('gamePage');
const gridElement = document.getElementById('grid');
const goldCountElement = document.getElementById('goldCount');
const resourcesElement = document.getElementById('resources');
let currentUser = null;
let gold = 0;
let resources = 0;
let grid = [];
let buildMode = null;

// Initialisiere das Spielfeld
function initGrid() {
    grid = [];
    for (let i = 0; i < 101; i++) {
        const row = [];
        for (let j = 0; j < 75; j++) {
            row.push(null); // Kein Gebäude, Platz leer
        }
        grid.push(row);
    }

    gridElement.innerHTML = '';
    for (let i = 0; i < 101; i++) {
        for (let j = 0; j < 75; j++) {
            const cell = document.createElement('div');
            cell.addEventListener('click', () => placeBuilding(i, j));
            gridElement.appendChild(cell);
        }
    }
}

// Login-Logik
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (localStorage.getItem(username)) {
        const storedData = JSON.parse(localStorage.getItem(username));
        if (storedData.password === password) {
            currentUser = username;
            gold = storedData.gold;
            resources = storedData.resources;
            initGrid();
            loginPage.style.display = 'none';
            gamePage.style.display = 'block';
            goldCountElement.textContent = gold;
            resourcesElement.textContent = resources;
        } else {
            document.getElementById('loginMessage').textContent = 'Falsches Passwort!';
        }
    } else {
        document.getElementById('loginMessage').textContent = 'Benutzername existiert nicht!';
    }
}

// Neuen Benutzer registrieren
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!localStorage.getItem(username)) {
        localStorage.setItem(username, JSON.stringify({
            username: username,
            password: password,
            gold: 0,
            resources: 0
        }));
        loginPage.style.display = 'none';
        gamePage.style.display = 'block';
        currentUser = username;
        goldCountElement.textContent = gold;
        resourcesElement.textContent = resources;
        initGrid();
    } else {
        document.getElementById('loginMessage').textContent = 'Benutzername bereits vergeben!';
    }
}

// Gebäude auf das Spielfeld platzieren
function placeBuilding(x, y) {
    if (buildMode === 'way' && grid[x][y] === null) {
        grid[x][y] = 'way';
        updateGrid();
    } else if (buildMode === 'house' && grid[x][y] === null && x + 1 < 101 && y + 1 < 75) {
        if (grid[x + 1][y] === null && grid[x][y + 1] === null && grid[x + 1][y + 1] === null) {
            grid[x][y] = 'house';
            grid[x + 1][y] = 'house';
            grid[x][y + 1] = 'house';
            grid[x + 1][y + 1] = 'house';
            updateGrid();
        }
    } else if (buildMode === 'goldmine' && grid[x][y] === null && x + 1 < 101 && y + 1 < 75) {
        if (grid[x + 1][y] === null && grid[x][y + 1] === null && grid[x + 1][y + 1] === null) {
            grid[x][y] = 'goldmine';
            grid[x + 1][y] = 'goldmine';
            grid[x][y + 1] = 'goldmine';
            grid[x + 1][y + 1] = 'goldmine';
            updateGrid();
        }
    }
}

// Grid-Ansicht aktualisieren
function updateGrid() {
    gridElement.innerHTML = '';
    for (let i = 0; i < 101; i++) {
        for (let j = 0; j < 75; j++) {
            const cell = document.createElement('div');
            if (grid[i][j] !== null) {
                cell.classList.add(grid[i][j]);
            }
            gridElement.appendChild(cell);
        }
    }
}

// Baumenü aufbauen
function build(buildingType) {
    buildMode = buildingType;
}

// Speicher Spielstand im LocalStorage
function saveGame() {
    localStorage.setItem(currentUser, JSON.stringify({
        username: currentUser,
        password: '*****', // Passwort nicht speichern
        gold: gold,
        resources: resources,
        grid: grid
    }));
}

// Event-Listener für Login und Registrierung
document.getElementById('loginButton').addEventListener('click', login);
document.getElementById('registerButton').addEventListener('click', register);

// Start-Setup
window.onload = function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
    }
}
