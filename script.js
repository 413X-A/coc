const grid = document.getElementById("grid");
let selectedBuilding = null;
let gold = 200;
let bewohner = 15;
const gridArray = [];

const WIDTH = 101;
const HEIGHT = 75;

// Grid initialisieren
for (let y = 0; y < HEIGHT; y++) {
    gridArray[y] = [];
    for (let x = 0; x < WIDTH; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.addEventListener("click", () => build(x, y));
        grid.appendChild(cell);
        gridArray[y][x] = { type: null, element: cell };
    }
}

// Rathaus in der Mitte setzen
for (let y = 36; y <= 38; y++) {
    for (let x = 49; x <= 51; x++) {
        gridArray[y][x].type = "rathaus";
        gridArray[y][x].element.classList.add("rathaus");
    }
}

function setBuilding(building) {
    selectedBuilding = building;
}

function build(x, y) {
    if (!selectedBuilding) return;
    const cell = gridArray[y][x];

    if (cell.type) return; // Kann nur auf leere Felder bauen

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

    // Prüfen ob Gebäude Platz hat
    for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
            if (!isInBounds(x + dx, y + dy) || gridArray[y + dy][x + dx].type) {
                alert("Kein Platz für das Gebäude!");
                return;
            }
        }
    }

    // Straßenanbindung prüfen
    if (!isConnected(x, y, size)) {
        alert("Gebäude muss an Straße anschließen!");
        return;
    }

    // Bauen
    gold -= cost;
    bewohner += bewohnerChange;
    updateInfo();

    for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
            gridArray[y + dy][x + dx].type = selectedBuilding;
            gridArray[y + dy][x + dx].element.classList.add(selectedBuilding);
        }
    }
}

function isInBounds(x, y) {
    return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
}

function updateInfo() {
    document.getElementById("gold").innerText = gold;
    document.getElementById("bewohner").innerText = bewohner;
}

function isConnected(x, y, size) {
    for (let dy = -1; dy <= size; dy++) {
        for (let dx = -1; dx <= size; dx++) {
            let nx = x + dx;
            let ny = y + dy;
            if (isInBounds(nx, ny)) {
                let type = gridArray[ny][nx].type;
                if (type === "weg" || type === "rathaus") {
                    return true;
                }
            }
        }
    }
    return false;
}
