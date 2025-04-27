let playerData = {};
let selectedBuilding = null;
let gameGrid = [];
const gridWidth = 101;
const gridHeight = 75;

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (localStorage.getItem(username)) {
        playerData = JSON.parse(localStorage.getItem(username));

        // Einfaches Passwort-Check
        if (playerData.password === password) {
            startGame(username);
        } else {
            alert("Falsches Passwort!");
        }
    } else {
        alert("Benutzername existiert nicht. Erstelle einen neuen Benutzer.");
    }
}

function createNewUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!localStorage.getItem(username)) {
        playerData = {
            username: username,
            password: password,
            gold: 0,
            buildings: {
                goldmine: 0,
                house: 0,
                path: 0
            }
        };
        localStorage.setItem(username, JSON.stringify(playerData));
        startGame(username);
    } else {
        alert("Benutzername existiert bereits.");
    }
}

function startGame(username) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('player-name').innerText = username;
    document.getElementById('gold').innerText = playerData.gold;

    createGrid();
}

function createGrid() {
    for (let row = 0; row < gridHeight; row++) {
        gameGrid[row] = [];
        for (let col = 0; col < gridWidth; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.onclick = () => placeBuilding(row, col);
            document.getElementById('grid-container').appendChild(cell);
            gameGrid[row][col] = null;
        }
    }

    // Platz für das Rathaus (3x3)
    for (let i = 37; i < 40; i++) {
        for (let j = 35; j < 38; j++) {
            gameGrid[i][j] = 'rathaus';
            document.querySelector(`.grid-cell[data-row="${i}"][data-col="${j}"]`).classList.add('occupied');
        }
    }
}

function selectBuilding(building) {
    if (playerData.gold < 50 && building === 'goldmine') {
        alert("Nicht genug Gold!");
        return;
    } else if (playerData.gold < 100 && building === 'house') {
        alert("Nicht genug Gold!");
        return;
    } else if (playerData.gold < 10 && building === 'path') {
        alert("Nicht genug Gold!");
        return;
    }

    selectedBuilding = building;
}

function placeBuilding(row, col) {
    if (selectedBuilding === null) {
        alert("Wähle ein Gebäude aus.");
        return;
    }

    // Überprüfen, ob der Platz bereits belegt ist
    if (gameGrid[row][col] !== null) {
        alert("Platz ist bereits belegt!");
        return;
    }

    const buildingSize = selectedBuilding === 'goldmine' || selectedBuilding === 'house' ? 2 : 1;

    // Überprüfen, ob genügend Platz für das Gebäude ist
    if (row + buildingSize <= gridHeight && col + buildingSize <= gridWidth) {
        for (let i = 0; i < buildingSize; i++) {
            for (let j = 0; j < buildingSize; j++) {
                if (gameGrid[row + i][col + j] !== null) {
                    alert("Platz ist nicht frei!");
                    return;
                }
            }
        }

        // Gebäude platzieren
        for (let i = 0; i < buildingSize; i++) {
            for (let j = 0; j < buildingSize; j++) {
                gameGrid[row + i][col + j] = selectedBuilding;
                document.querySelector(`.grid-cell[data-row="${row + i}"][data-col="${col + j}"]`).classList.add('occupied');
            }
        }

        // Gold abziehen
        if (selectedBuilding === 'goldmine') {
            playerData.gold -= 50;
        } else if (selectedBuilding === 'house') {
            playerData.gold -= 100;
        } else if (selectedBuilding === 'path') {
            playerData.gold -= 10;
        }

        // Update gold
        document.getElementById('gold').innerText = playerData.gold;

        // Fortschritt speichern
        localStorage.setItem(playerData.username, JSON.stringify(playerData));
    }
}
