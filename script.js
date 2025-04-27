const gridWidth = 101;
const gridHeight = 75;
let gold = 0;
let population = 0;
let cells = [];
let occupied = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));
let goldmines = [];
let rathausPosition = { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) };

// Spielfeld erstellen
function createGrid() {
    const gridContainer = document.getElementById("grid");
    for (let y = 0; y < gridHeight; y++) {
        const row = [];
        for (let x = 0; x < gridWidth; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;

            // Event für Klick auf Zelle
            cell.addEventListener('click', () => handleCellClick(x, y));
            gridContainer.appendChild(cell);
            row.push(cell);
        }
        cells.push(row);
    }
    createRathaus();
}

// Rathaus positionieren
function createRathaus() {
    const rathausCell = cells[rathausPosition.y][rathausPosition.x];
    rathausCell.classList.add('rathaus');
    occupied[rathausPosition.y][rathausPosition.x] = 'rathaus';
}

function handleCellClick(x, y) {
    const cell = cells[y][x];
    if (occupied[y][x]) return; // Zelle ist bereits belegt

    // Goldmine setzen
    if (gold >= 100 && !goldmines.some(mine => mine.x === x && mine.y === y)) {
        placeBuilding(x, y, 'goldmine');
    }
}

function placeBuilding(x, y, type) {
    if (type === 'goldmine' && isConnected(x, y)) {
        const mine = { x, y, level: 1 };
        goldmines.push(mine);
        occupied[y][x] = 'goldmine';
        const cell = cells[y][x];
        cell.classList.add('goldmine');
        gold -= 100; // Gold abziehen für das Setzen der Mine
        population -= 1; // Einen Arbeiter abziehen
        alert("Goldmine platziert!");
    }
}

function isConnected(x, y) {
    const queue = [{ x: rathausPosition.x, y: rathausPosition.y }];
    const visited = new Set();

    while (queue.length > 0) {
        const { x: currX, y: currY } = queue.shift();
        const key = currX + ',' + currY;

        if (visited.has(key)) continue;
        visited.add(key);

        // Goldmine gefunden
        if (currX === x && currY === y) {
            return true;
        }

        // Angrenzende Felder auf Straßen überprüfen
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        directions.forEach(({ dx, dy }) => {
            const nx = currX + dx;
            const ny = currY + dy;

            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                if ((occupied[ny][nx] === 'weg' || occupied[ny][nx] === 'rathaus') && !visited.has(nx + ',' + ny)) {
                    queue.push({ x: nx, y: ny });
                }
            }
        });
    }
    return false;
}

// Goldmine Produktion
setInterval(() => {
    goldmines.forEach(mine => {
        if (isConnected(mine.x, mine.y)) { // Wenn die Goldmine verbunden ist
            const baseProduction = 5;
            const bonus = (mine.level - 1);
            const producedGold = baseProduction + bonus;
            gold += producedGold;
            showGoldEffect(mine.x, mine.y, producedGold);
        }
    });
    updateResources();
}, 5000);

function showGoldEffect(x, y, amount) {
    const cell = cells[y][x];
    const effect = document.createElement('div');
    effect.className = 'gold-float';
    effect.textContent = `+${amount}`;
    cell.appendChild(effect);

    setTimeout(() => {
        effect.remove();
    }, 1000);
}

function updateResources() {
    document.getElementById("gold").textContent = gold;
    document.getElementById("population").textContent = population;
}

createGrid();
