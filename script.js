const gridWidth = 101;
const gridHeight = 75;
let gold = 500;
let population = 0;
let freePopulation = 0;
let selectedBuilding = null;
const cells = [];
const occupied = [];
const goldmines = [];
const houses = [];
let rathausPosition = { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) };

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
            cell.addEventListener('click', () => placeBuilding(x, y));
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

function placeBuilding(x, y) {
    if (!selectedBuilding) {
        alert('Wähle zuerst ein Gebäude aus!');
        return;
    }

    let size = { width: 1, height: 1 };
    let cost = 0;
    let buildingType = '';
    let popGain = 0;

    if (selectedBuilding === 'haus') {
        size = { width: 2, height: 2 };
        cost = 100;
        buildingType = 'haus';
        popGain = 5;
    } else if (selectedBuilding === 'goldmine') {
        size = { width: 2, height: 2 };
        cost = 150;
        buildingType = 'goldmine';
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

    gold -= cost;

    if (buildingType === 'goldmine') {
        goldmines.push({ x, y, level: 1, connected: false });
        addUpgradeButton(x, y);
        freePopulation -= 5;
    }

    if (buildingType === 'haus') {
        houses.push({ x, y, popGain, connected: false });
    }

    updateResources();
}

function addUpgradeButton(x, y) {
    const cell = cells[y][x];
    const btn = document.createElement('button');
    btn.textContent = "+";
    btn.className = "upgrade-btn";
    btn.onclick = (e) => {
        e.stopPropagation();
        upgradeGoldmine(x, y);
    };
    cell.appendChild(btn);
}

function upgradeGoldmine(x, y) {
    const mine = goldmines.find(m => m.x === x && m.y === y);
    if (!mine) return;
    const upgradeCost = mine.level * 100;
    if (gold >= upgradeCost) {
        gold -= upgradeCost;
        mine.level++;
        updateResources();
        alert('Goldmine verbessert! Neuer Level: ' + mine.level);
    } else {
        alert('Nicht genug Gold für Upgrade!');
    }
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

function isConnected(x, y) {
    const visited = new Set();
    const queue = [{ x: rathausPosition.x, y: rathausPosition.y }];

    while (queue.length > 0) {
        const { x: currX, y: currY } = queue.shift();
        const key = `${currX},${currY}`;
        if (visited.has(key)) continue;
        visited.add(key);

        if (currX >= x && currX <= x + 1 && currY >= y && currY <= y + 1) {
            return true;
        }

        const neighbors = [
            { x: currX + 1, y: currY },
            { x: currX - 1, y: currY },
            { x: currX, y: currY + 1 },
            { x: currX, y: currY - 1 }
        ];

        neighbors.forEach(n => {
            if (n.x >= 0 && n.x < gridWidth && n.y >= 0 && n.y < gridHeight) {
                if ((occupied[n.y][n.x] === 'weg' || occupied[n.y][n.x] === 'rathaus') && !visited.has(`${n.x},${n.y}`)) {
                    queue.push({ x: n.x, y: n.y });
                }
            }
        });
    }

    return false;
}

// Jede Sekunde:
setInterval(() => {
    // Häuser: prüfen ob verbunden
    houses.forEach(house => {
        if (!house.connected && isConnected(house.x, house.y)) {
            population += house.popGain;
            freePopulation += house.popGain;
            house.connected = true;
        }
    });

    // Goldminen: prüfen ob verbunden
    goldmines.forEach(mine => {
        if (isConnected(mine.x, mine.y)) {
            mine.connected = true;
            gold += mine.level * 5;
        } else {
            mine.connected = false;
        }
    });

    updateResources();
}, 1000);

createGrid();
placeRathaus();
updateResources();
