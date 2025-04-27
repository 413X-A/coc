const gridWidth = 101;
const gridHeight = 75;
let gold = 500;
let population = 0;
let selectedBuilding = null;
const cells = [];
const occupied = []; // neue Tabelle für belegte Felder

function updateResources() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('population').textContent = population;
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
            occRow.push(false); // Anfangs alle Felder frei
        }
        cells.push(row);
        occupied.push(occRow);
    }
}

function placeRathaus() {
    const startX = Math.floor(gridWidth / 2) - 1;
    const startY = Math.floor(gridHeight / 2) - 1;
    for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 3; dx++) {
            cells[startY + dy][startX + dx].classList.add('rathaus');
            occupied[startY + dy][startX + dx] = true;
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
    let buildingClass = '';
    let populationIncrease = 0;

    if (selectedBuilding === 'haus') {
        size = { width: 2, height: 2 };
        cost = 100;
        buildingClass = 'haus';
        populationIncrease = 5;
    } else if (selectedBuilding === 'goldmine') {
        size = { width: 2, height: 2 };
        cost = 150;
        buildingClass = 'goldmine';
    } else if (selectedBuilding === 'weg') {
        size = { width: 1, height: 1 };
        cost = 5;
        buildingClass = 'weg';
    }

    if (!canPlaceBuilding(x, y, size.width, size.height)) {
        alert('Hier passt das Gebäude nicht!');
        return;
    }

    if (gold < cost) {
        alert('Nicht genug Gold!');
        return;
    }

    for (let dy = 0; dy < size.height; dy++) {
        for (let dx = 0; dx < size.width; dx++) {
            cells[y + dy][x + dx].classList.add(buildingClass);
            occupied[y + dy][x + dx] = true;
        }
    }

    gold -= cost;
    population += populationIncrease;
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

createGrid();
placeRathaus();
updateResources();
