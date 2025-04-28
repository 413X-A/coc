// Variablen
const grid = document.getElementById("grid");
let selectedBuilding = null;
let gold = 200;
let bewohner = 15;
let holz = 0;
let stein = 0;
let eisen = 0;
let smaragde = 0;

let freeBuildings = {
    haus: 1,
    weg: 10,
    goldmine: 1
};

const gridArray = [];

const WIDTH = 101;
const HEIGHT = 75;

const buildingLevels = {}; // Speichert Upgrades der Gebäude

// Grid erstellen
for (let y = 0; y < HEIGHT; y++) {
    gridArray[y] = [];
    for (let x = 0; x < WIDTH; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.addEventListener("click", (e) => onCellClick(e, x, y));
        grid.appendChild(cell);
        gridArray[y][x] = { type: null, element: cell, active: true };
    }
}

// Rathaus platzieren
for (let y = 36; y <= 38; y++) {
    for (let x = 49; x <= 51; x++) {
        gridArray[y][x].type = "rathaus";
        gridArray[y][x].element.classList.add("rathaus");
    }
}

// Gebäude auswählen
function setBuilding(building) {
    selectedBuilding = building;
}

// Beim Klicken auf Zelle
function onCellClick(e, x, y) {
    const cell = gridArray[y][x];

    if (cell.type && !selectedBuilding) {
        openBuildingMenu(x, y);
    } else {
        build(x, y);
    }
}

// Gebäude bauen
function build(x, y) {
    if (!selectedBuilding) return;
    const cell = gridArray[y][x];

    if (cell.type) return; // Nur leere Felder

    let cost = 0;
    let sizeX = 1;
    let sizeY = 1;
    let bewohnerChange = 0;

    if (selectedBuilding === "haus") {
        cost = 150;
        sizeX = 2;
        sizeY = 2;
        bewohnerChange = 5;
    } else if (selectedBuilding === "weg") {
        cost = 10;
    } else if (selectedBuilding === "goldmine") {
        cost = 250;
        bewohnerChange = -5;
    } else if (selectedBuilding === "smaragdmine") {
        cost = 780;
        bewohnerChange = -25;
    } else if (selectedBuilding === "holzfaeller") {
        cost = 280;
        sizeX = 3;
        sizeY = 3;
    } else if (selectedBuilding === "steinmetz") {
        cost = 400;
        sizeX = 2;
        sizeY = 2;
    } else if (selectedBuilding === "eisenerz") {
        cost = 1200;
        sizeX = 2;
        sizeY = 1;
    }

    // Gratis Bauten?
    if (freeBuildings[selectedBuilding] && freeBuildings[selectedBuilding] > 0) {
        freeBuildings[selectedBuilding]--;
        cost = 0;
    }

    if (gold < cost) {
        alert("Nicht genug Gold!");
        return;
    }

    // Platz prüfen
    for (let dy = 0; dy < sizeY; dy++) {
        for (let dx = 0; dx < sizeX; dx++) {
            if (!isInBounds(x + dx, y + dy) || gridArray[y + dy][x + dx].type) {
                alert("Kein Platz für das Gebäude!");
                return;
            }
        }
    }

    // Anschluss prüfen
    if (!isConnected(x, y, sizeX, sizeY)) {
        alert("Gebäude muss an Straße anschließen!");
        return;
    }

    gold -= cost;
    bewohner += bewohnerChange;
    updateInfo();

    for (let dy = 0; dy < sizeY; dy++) {
        for (let dx = 0; dx < sizeX; dx++) {
            gridArray[y + dy][x + dx].type = selectedBuilding;
            gridArray[y + dy][x + dx].element.classList.add(selectedBuilding);
            buildingLevels[`${x+dx}_${y+dy}`] = 1; // Stufe 1 bei Bau
        }
    }
}

// Menü beim Klick auf Gebäude
function openBuildingMenu(x, y) {
    const options = document.createElement("div");
    options.className = "popup";
    options.style.left = `${x * 11}px`;
    options.style.top = `${y * 11}px`;

    const abreißen = document.createElement("button");
    abreißen.innerText = "Abreißen";
    abreißen.onclick = () => {
        removeBuilding(x, y);
        document.body.removeChild(options);
    };

    const verbessern = document.createElement("button");
    verbessern.innerText = "Verbessern";
    verbessern.onclick = () => {
        upgradeBuilding(x, y);
        document.body.removeChild(options);
    };

    options.appendChild(abreißen);
    options.appendChild(verbessern);
    document.body.appendChild(options);
}

// Gebäude entfernen
function removeBuilding(x, y) {
    const type = gridArray[y][x].type;
    if (!type) return;

    for (let row of gridArray) {
        for (let cell of row) {
            if (cell.type === type && cell.element.classList.contains(type)) {
                cell.type = null;
                cell.active = true;
                cell.element.className = "cell";
            }
        }
    }

    if (type === "weg") {
        checkConnectivity();
    }
}

// Gebäude verbessern
function upgradeBuilding(x, y) {
    const key = `${x}_${y}`;
    if (!buildingLevels[key]) return;

    const lvl = buildingLevels[key];
    let costType = null;
    let costAmount = 0;

    if (lvl <= 3) {
        costType = "holz";
        costAmount = 10 * lvl;
    } else if (lvl <= 5) {
        costType = "stein";
        costAmount = 20 * (lvl - 3);
    } else if (lvl <= 7) {
        costType = "eisen";
        costAmount = 30 * (lvl - 5);
    } else {
        costType = "smaragde";
        costAmount = 50 * (lvl - 7);
    }

    if (window[costType] >= costAmount) {
        window[costType] -= costAmount;
        buildingLevels[key]++;
        alert(`Gebäude auf Stufe ${buildingLevels[key]} verbessert!`);
    } else {
        alert(`Nicht genug ${costType}!`);
    }
}

// Verbindung prüfen nach Abriss
function checkConnectivity() {
    for (let row of gridArray) {
        for (let cell of row) {
            if (cell.type && cell.type !== "weg" && !isConnected(parseInt(cell.element.dataset.x), parseInt(cell.element.dataset.y), 1, 1)) {
                cell.active = false;
                cell.element.style.filter = "brightness(50%)";
            } else if (cell.type) {
                cell.active = true;
                cell.element.style.filter = "";
            }
        }
    }
}

// Gold generieren alle paar Sekunden
setInterval(() => {
    let income = 0;
    for (let row of gridArray) {
        for (let cell of row) {
            if (cell.type === "goldmine" && cell.active) {
                income += 5;
            }
            if (cell.type === "smaragdmine" && cell.active) {
                income += 15;
            }
        }
    }
    gold += income;
    updateInfo();
}, 3000);

// Hilfsfunktionen
function isInBounds(x, y) {
    return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
}

function updateInfo() {
    document.getElementById("gold").innerText = gold;
    document.getElementById("bewohner").innerText = bewohner;
}

function isConnected(x, y, sizeX, sizeY) {
    for (let dy = -1; dy <= sizeY; dy++) {
        for (let dx = -1; dx <= sizeX; dx++) {
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
