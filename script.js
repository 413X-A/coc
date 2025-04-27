const gridWidth = 101;
const gridHeight = 75;
let gold = 500;
let population = 0;
let freePopulation = 0;
let selectedBuilding = null;
const cells = [];
const occupied = [];
const goldmines = [];
let rathausPosition = { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) };
let selectedMine = null;

function updateResources() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('population').textContent = population;
    document.getElementById('freePopulation').textContent = freePopulation;
}

function selectBuilding(building) {
    selectedBuilding = building;
    document.getElementById('status').textContent = "Ausgewählt: " + building;
}

function cancelBuilding() {
    selectedBuilding = null;
    document.getElementById('status').textContent = "Bau abgebrochen";
}

function createGrid() {
    const grid = document.getElementById('grid');
    for (let y = 0; y < gridHeight; y++) {
        const row = [];
        const occRow = [];
        for (let x = 0; x < gridWidth; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', (e) => handleCellClick(e, x, y));
            grid.appendChild(cell);
            row.push(cell);
            occRow.push(null);
        }
        cells.push(row);
        occupied.push(occRow);
    }
}

function placeRathaus() {
    const startX = rathausPosition.x - 1;
    const startY = rathausPosition.y - 1;
    for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 3; dx++) {
            cells[startY + dy][startX + dx].classList.add('rathaus');
            occupied[startY + dy][startX + dx] = 'rathaus';
        }
    }
}

function handleCellClick(e, x, y) {
    if (!selectedBuilding) {
        if (occupied[y][x] === 'goldmine') {
            openUpgradePopup(x, y);
        }
        return;
    }
    placeBuilding(x, y);
}

function placeBuilding(x, y) {
    let size = { width: 1, height: 1 };
    let cost = 0;
    let buildingType = '';
    let popChange = 0;

    if (selectedBuilding === 'haus') {
        size = { width: 2, height: 2 };
        cost = 100;
        buildingType = 'haus';
        popChange = 5;
    } else if (selectedBuilding === 'goldmine') {
        size = { width: 2, height: 2 };
        cost = 150;
        buildingType = 'goldmine';
        popChange = -5;
    } else if (selectedBuilding === 'weg') {
        size = { width: 1, height: 1 };
        cost = 5;
        buildingType = 'weg';
    }

    if (!canPlaceBuilding(x, y, size.width, size.height)) {
        alert('Hier passt das Gebäude nicht!');
        return;
    }

    if (gold < cost) {
        alert('Nicht genug Gold!');
        return;
    }

    if (selectedBuilding === 'goldmine' && freePopulation < 5) {
        alert('Nicht genug freie Einwohner für die Mine!');
        return;
    }

    for (let dy = 0; dy < size.height; dy++) {
        for (let dx = 0; dx < size.width; dx++) {
            cells[y + dy][x + dx].classList.add(buildingType);
            occupied[y + dy][x + dx] = buildingType;
        }
    }

    if (buildingType === 'goldmine') {
        goldmines.push({ x: x, y: y, level: 1 });
    }

    gold -= cost;
    population += (popChange > 0 ? popChange : 0);
    freePopulation += popChange;
    if (freePopulation < 0) freePopulation = 0;
    updateResources();
}

function openUpgradePopup(x, y) {
    selectedMine = goldmines.find(m => m.x === x && m.y === y);
    if (!selectedMine) return;
    const upgradeCost = selectedMine.level * 250;
    document.getElementById('popup-text').textContent = `Goldmine Level ${selectedMine.level} verbessern für ${upgradeCost} Gold?`;
    document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    selectedMine = null;
}

function confirmUpgrade() {
    if (!selectedMine) return;
    const upgradeCost = selectedMine.level * 250;
    if (gold >= upgradeCost) {
        gold -= upgradeCost;
        selectedMine.level++;
        alert('Upgrade erfolgreich! Neues Level: ' + selectedMine.level);
    } else {
        alert('Nicht genug Gold!');
    }
    closePopup();
    updateResources();
}

function canPlaceBuilding(x, y, width, height) {
    if (x + width > gridWidth || y + height > gridHeight) {
        return false;
    }
    for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
            if (occupied[y + dy][x + dx]) {
                return false;
            }
        }
    }
    return true;
}

// Goldminen tick alle 5 Sekunden
setInterval(() => {
    goldmines.forEach(mine => {
        if (isConnected(mine.x, mine.y)) {
            const baseProduction = 5;
            const bonus = (mine.level - 1);
            const producedGold = baseProduction + bonus;
            gold += producedGold;
            showGoldEffect(mine.x, mine.y, producedGold);
        }
    });
    updateResources();
}, 5000);

// Animation Effekt bei Gold
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

// BFS-Verbindung prüfen
function isConnected(x, y) {
    const queue = [{ x: rathausPosition.x, y: rathausPosition.y }];
    const visited = new Set();

    while (queue.length > 0) {
        const { x: currX, y: currY } = queue.shift();
        const key = currX + ',' + currY;
        if (visited.has(key)) continue;
        visited.add(key);

        // Wenn wir die Goldmine erreichen (2x2 Fläche)
        for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
                if (currX === x + dx && currY === y + dy) {
                    return true;
                }
            }
        }

        // Prüfe alle angrenzenden Felder (Weg oder Rathaus)
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
    return false;  // Keine Verbindung zum Rathaus über Straße
}

// Goldminenproduktion (alle 5 Sekunden)
setInterval(() => {
    goldmines.forEach(mine => {
        if (isConnected(mine.x, mine.y)) {
            const baseProduction = 5;
            const bonus = (mine.level - 1);
            const producedGold = baseProduction + bonus;
            gold += producedGold;
            showGoldEffect(mine.x, mine.y, producedGold);
        }
    });
    updateResources();
}, 5000);

// Gold-Effekt anzeigen (wenn Gold produziert wird)
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


createGrid();
placeRathaus();
updateResources();
