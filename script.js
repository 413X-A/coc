const grid = document.getElementById("grid");
let selectedBuilding = null;
let gold = 20000;
let bewohner = 15;
const gridArray = [];

const WIDTH = 101;
const HEIGHT = 75;

// Spielfeld aufbauen
for (let y = 0; y < HEIGHT; y++) {
    gridArray[y] = [];
    for (let x = 0; x < WIDTH; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.addEventListener("click", () => build(x, y));
        grid.appendChild(cell);
        gridArray[y][x] = { type: null, element: cell, active: false };
    }
}

// Rathaus initialisieren (3x3)
for (let y = 36; y <= 38; y++) {
    for (let x = 49; x <= 51; x++) {
        gridArray[y][x].type = "rathaus";
        gridArray[y][x].active = true;
        gridArray[y][x].element.classList.add("rathaus");
    }
}

function setBuilding(building) {
    selectedBuilding = building;
}

function build(x, y) {
    if (!selectedBuilding) return;
    const cell = gridArray[y][x];

    if (cell.type) return;

    let cost = 0;
    let size = 1;
    let bewohnerChange = 0;

    if (selectedBuilding === "haus") {
        cost = 150;
        size = 2;
        bewohnerChange = 5;
    } else if (selectedBuilding === "weg") {
        cost = 10;
    } else if (selectedBuilding === "goldmine") {
        cost = 250;
        bewohnerChange = -5;
    } else if (selectedBuilding === "smaragdmine") {
        cost = 780;
        bewohnerChange = -25;
    }

    if (gold < cost) {
        alert("Nicht genug Gold!");
        return;
    }

    for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
            if (!isInBounds(x + dx, y + dy) || gridArray[y + dy][x + dx].type) {
                alert("Kein Platz für das Gebäude!");
                return;
            }
        }
    }

    if (!isConnected(x, y, size)) {
        alert("Gebäude muss an Straße anschließen!");
        return;
    }

    gold -= cost;
    updateInfo();

    for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
            gridArray[y + dy][x + dx].type = selectedBuilding;
            gridArray[y + dy][x + dx].active = false;
            gridArray[y + dy][x + dx].element.classList.add(selectedBuilding);
        }
    }

    checkConnections();
}

function isInBounds(x, y) {
    return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
}

function updateInfo() {
    document.getElementById("gold").innerText = gold;
    document.getElementById("bewohner").innerText = bewohner;
}

// VERBESSERT: nur orthogonale Nachbarn prüfen
function isConnected(x, y, size) {
    const directions = [
        {dx: 1, dy: 0},
        {dx: -1, dy: 0},
        {dx: 0, dy: 1},
        {dx: 0, dy: -1}
    ];

    for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
            for (let dir of directions) {
                let nx = x + dx + dir.dx;
                let ny = y + dy + dir.dy;
                if (isInBounds(nx, ny)) {
                    let type = gridArray[ny][nx].type;
                    if (type === "weg" || type === "rathaus") {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

// Floodfill: Wege & Gebäude verbinden
function checkConnections() {
    for (let row of gridArray) {
        for (let cell of row) {
            cell.active = false;
        }
    }

    const queue = [];
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            if (gridArray[y][x].type === "rathaus") {
                queue.push({x, y});
                gridArray[y][x].active = true;
            }
        }
    }

    while (queue.length > 0) {
        const {x, y} = queue.shift();
        const directions = [
            {dx: 1, dy: 0},
            {dx: -1, dy: 0},
            {dx: 0, dy: 1},
            {dx: 0, dy: -1}
        ];

        for (let dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (isInBounds(nx, ny) && !gridArray[ny][nx].active) {
                const type = gridArray[ny][nx].type;
                if (type === "weg" || type === "haus" || type === "goldmine" || type === "smaragdmine") {
                    gridArray[ny][nx].active = true;
                    queue.push({x: nx, y: ny});
                }
            }
        }
    }

    recalculatePopulation();
}

function recalculatePopulation() {
    let newBewohner = 15; // Startbewohner durch Rathaus
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const cell = gridArray[y][x];
            if (cell.type === "haus" && cell.active) {
                newBewohner += 5;
            } else if (cell.type === "goldmine" && cell.active) {
                gold += 2;
            } else if (cell.type === "smaragdmine" && cell.active) {
                gold += 6;
            }
        }
    }
    bewohner = newBewohner;
    updateInfo();
}
