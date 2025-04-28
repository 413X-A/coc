const grid = document.getElementById("grid");
let selectedBuilding = null;
let gold = 1000;
let bewohner = 15;
let holz = 0;
let stein = 0;
let eisen = 0;
let smaragde = 0;
const gridArray = [];
let selectedCell = null;

const WIDTH = 101;
const HEIGHT = 75;

// Zähler für Gratis-Gebäude
let freeWegCount = 10;
let freeHausCount = 1;
let freeGoldmineCount = 1;

const buildingInfo = {
    haus: {
        name: "Haus",
        desc: "Ein Haus erhöht die Einwohnerzahl.",
        cost: 150,
        production: null,
    },
    weg: {
        name: "Weg",
        desc: "Verbindet Gebäude miteinander.",
        cost: 10,
        production: null,
    },
    holzfaeller: {
        name: "Holzfäller",
        desc: "Erzeugt Holz über Zeit.",
        cost: 280,
        production: { holz: 2 },
    },
    steinmetz: {
        name: "Steinmetz",
        desc: "Erzeugt Stein über Zeit.",
        cost: 400,
        production: { stein: 2 },
    },
    eisenerz: {
        name: "Eisenerzmine",
        desc: "Fördert Eisen.",
        cost: 1200,
        production: { eisen: 1 },
    },
    goldmine: {
        name: "Goldmine",
        desc: "Fördert Gold über Zeit.",
        cost: 600,
        production: { gold: 5 },
    },
    smaragdmine: {
        name: "Smaragdmine",
        desc: "Fördert Smaragde (langsam).",
        cost: 1500,
        production: { smaragde: 1 },
    }
};

// Grid erstellen
for (let y = 0; y < HEIGHT; y++) {
    gridArray[y] = [];
    for (let x = 0; x < WIDTH; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.addEventListener("click", () => {
            if (selectedBuilding) {
                build(x, y);
            } else if (gridArray[y][x].type) {
                selectedCell = { x: x, y: y };
                openPopup(gridArray[y][x].type);
            }
        });
        grid.appendChild(cell);
        gridArray[y][x] = { type: null, element: cell, level: 1 };
    }
}

// Rathaus setzen
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
    if (cell.type) return; // Nur auf leeren Feldern bauen

    const info = buildingInfo[selectedBuilding];
    if (!info) return;

    let cost = info.cost;

    // Prüfen ob es kostenlos sein soll
    if (selectedBuilding === "weg" && freeWegCount > 0) {
        cost = 0;
    } else if (selectedBuilding === "haus" && freeHausCount > 0) {
        cost = 0;
    } else if (selectedBuilding === "goldmine" && freeGoldmineCount > 0) {
        cost = 0;
    }

    if (gold < cost) {
        alert("Nicht genug Gold!");
        return;
    }

    if (!isConnected(x, y, 1)) {
        alert("Muss an Weg oder Rathaus anschließen!");
        return;
    }

    gold -= cost;

    // Nach Gratis-Bau Zähler verringern
    if (selectedBuilding === "weg" && freeWegCount > 0) {
        freeWegCount--;
    } else if (selectedBuilding === "haus" && freeHausCount > 0) {
        freeHausCount--;
    } else if (selectedBuilding === "goldmine" && freeGoldmineCount > 0) {
        freeGoldmineCount--;
    }

    if (selectedBuilding === "haus") {
        bewohner += 5;
    }
    updateInfo();

    cell.type = selectedBuilding;
    cell.level = 1;
    cell.element.classList.add(selectedBuilding);

    selectedBuilding = null;
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
            if (nx >= 0 && ny >= 0 && nx < WIDTH && ny < HEIGHT) {
                let neighbor = gridArray[ny][nx];
                if (neighbor.type === "weg" || neighbor.type === "rathaus") {
                    return true;
                }
            }
        }
    }
    return false;
}
