const grid = document.getElementById("grid");

const WIDTH = 101;
const HEIGHT = 75;

let selectedBuilding = null;
let selectedCell = null;
let gold = 1000;
let bewohner = 15;
let holz = 0;
let stein = 0;
let eisen = 0;
let smaragde = 0;

const gridArray = [];

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
        desc: "Fördert Gold.",
        cost: 600,
        production: { gold: 5 },
    },
    smaragdmine: {
        name: "Smaragdmine",
        desc: "Fördert Smaragde.",
        cost: 1500,
        production: { smaragde: 1 },
    }
};

// ---------------------------
// GRID ERSTELLEN
// ---------------------------
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
                return; // Popup verhindern
            }
            if (gridArray[y][x].type) {
                selectedCell = { x, y };
                openPopup(gridArray[y][x].type);
            }
        });
        grid.appendChild(cell);
        gridArray[y][x] = { type: null, element: cell, level: 1 };
    }
}

// ---------------------------
// RATHAUS IN DIE MITTE
// ---------------------------
for (let y = 36; y <= 38; y++) {
    for (let x = 49; x <= 51; x++) {
        gridArray[y][x].type = "rathaus";
        gridArray[y][x].element.classList.add("rathaus");
    }
}

// ---------------------------
// BUILDING-AUSWAHL
// ---------------------------
function setBuilding(building) {
    selectedBuilding = building;
}

// ---------------------------
// BAUEN
// ---------------------------
function build(x, y) {
    const cell = gridArray[y][x];
    if (cell.type) return; // Nur auf freie Felder bauen
    const info = buildingInfo[selectedBuilding];
    if (!info) return;

    let effectiveCost = info.cost;

    // Hier kannst du später Freikarten einbauen (freeHouse, freeWay etc.)

    if (gold < effectiveCost) {
        alert("Nicht genug Gold!");
        return;
    }

    gold -= effectiveCost;
    if (selectedBuilding === "haus") {
        bewohner += 5;
    }

    cell.type = selectedBuilding;
    cell.level = 1;
    cell.element.classList.add(selectedBuilding);

    updateInfo();
}

// ---------------------------
// INFO AKTUALISIEREN
// ---------------------------
function updateInfo() {
    document.getElementById("gold").innerText = gold;
    document.getElementById("bewohner").innerText = bewohner;
    document.getElementById("holz").innerText = holz;
    document.getElementById("stein").innerText = stein;
    document.getElementById("eisen").innerText = eisen;
    document.getElementById("smaragde").innerText = smaragde;
}

// ---------------------------
// POPUP ÖFFNEN
// ---------------------------
function openPopup(type) {
    const info = buildingInfo[type];
    if (!info) return;

    document.getElementById("popupTitle").innerText = info.name;
    document.getElementById("popupDesc").innerText = info.desc;
    document.getElementById("popupCosts").innerText = info.production
        ? "Upgrade-Kosten: " + (info.cost * 1.5 | 0) + " Gold"
        : "Keine Upgrades";
    document.getElementById("popupProduction").innerText = info.production
        ? "Produktion: " + Object.entries(info.production).map(([res, amount]) => `${amount} ${res}`).join(", ")
        : "Keine Produktion";
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// ---------------------------
// GEBÄUDE VERBESSERN
// ---------------------------
function improveBuilding() {
    if (!selectedCell) return;
    const { x, y } = selectedCell;
    const cell = gridArray[y][x];
    const info = buildingInfo[cell.type];
    const upgradeCost = Math.floor(info.cost * 1.5 * cell.level);

    if (gold >= upgradeCost) {
        gold -= upgradeCost;
        cell.level++;
        updateInfo();
        alert("Gebäude verbessert auf Level " + cell.level + "!");
    } else {
        alert("Nicht genug Gold für Upgrade!");
    }
    closePopup();
}

// ---------------------------
// GEBÄUDE ABREISSEN
// ---------------------------
function removeBuilding() {
    if (!selectedCell) return;
    const { x, y } = selectedCell;
    const cell = gridArray[y][x];
    cell.type = null;
    cell.level = 1;
    cell.element.className = "cell";
    closePopup();
}

// ---------------------------
// PRODUKTION ALLE 5 SEKUNDEN
// ---------------------------
let tick = 0;
setInterval(() => {
    tick++;
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const cell = gridArray[y][x];
            if (cell.type && buildingInfo[cell.type] && buildingInfo[cell.type].production) {
                const production = buildingInfo[cell.type].production;
                for (const resource in production) {
                    let amount = production[resource] * cell.level;
                    if (cell.type === "smaragdmine" && tick % 2 !== 0) continue;
                    if (resource === "gold") gold += amount;
                    if (resource === "holz") holz += amount;
                    if (resource === "stein") stein += amount;
                    if (resource === "eisen") eisen += amount;
                    if (resource === "smaragde") smaragde += amount;
                }
            }
        }
    }
    updateInfo();
}, 5000);
