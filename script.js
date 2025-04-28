const grid = document.getElementById("grid");
let selectedBuilding = null;
let gold = 200;
let bewohner = 15;
const gridArray = [];
let selectedCell = null;

const WIDTH = 101;
const HEIGHT = 75;

const buildingInfo = {
    haus: {
        name: "Haus",
        desc: "Ein Haus erhöht die Einwohnerzahl.",
        cost: 150,
        production: "+5 Einwohner",
    },
    weg: {
        name: "Weg",
        desc: "Verbindet Gebäude miteinander.",
        cost: 10,
        production: "Keine Produktion",
    },
    holzfaeller: {
        name: "Holzfäller",
        desc: "Erzeugt Holz über Zeit.",
        cost: 280,
        production: "2 Holz pro Minute",
    },
    steinmetz: {
        name: "Steinmetz",
        desc: "Erzeugt Stein über Zeit.",
        cost: 400,
        production: "2 Stein pro Minute",
    },
    eisenerz: {
        name: "Eisenerzmine",
        desc: "Fördert Eisen.",
        cost: 1200,
        production: "1 Eisen pro Minute",
    },
    goldmine: {
        name: "Goldmine",
        desc: "Fördert Gold.",
        cost: 600,
        production: "5 Gold pro Minute",
    },
    smaragdmine: {
        name: "Smaragdmine",
        desc: "Fördert Smaragde.",
        cost: 1500,
        production: "1 Smaragd pro 2 Minuten",
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
        cell.addEventListener("click", (e) => {
            if (selectedBuilding) {
                build(x, y);
            } else if (gridArray[y][x].type) {
                selectedCell = {x: x, y: y};
                openPopup(gridArray[y][x].type);
            }
        });
        grid.appendChild(cell);
        gridArray[y][x] = { type: null, element: cell, level: 1 };
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

    if (cell.type) return; // Nur auf leeren Feldern bauen

    const info = buildingInfo[selectedBuilding];
    if (!info) return;

    if (gold < info.cost) {
        alert("Nicht genug Gold!");
        return;
    }

    if (!isConnected(x, y, 1)) {
        alert("Muss an Weg oder Rathaus anschließen!");
        return;
    }

    // Bauen
    gold -= info.cost;
    bewohner += (selectedBuilding === "haus") ? 5 : 0;
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
                let type = gridArray[ny][nx].type;
                if (type === "weg" || type === "rathaus") {
                    return true;
                }
            }
        }
    }
    return false;
}

// Popup-Handling
function openPopup(type) {
    const info = buildingInfo[type];
    if (!info) return;

    document.getElementById("popupTitle").innerText = info.name;
    document.getElementById("popupDesc").innerText = info.desc;
    document.getElementById("popupCosts").innerText = "Upgrade-Kosten: " + (info.cost * 1.5 | 0) + " Gold";
    document.getElementById("popupProduction").innerText = "Produktion: " + info.production;
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Gebäude verbessern
function improveBuilding() {
    if (!selectedCell) return;
    const cell = gridArray[selectedCell.y][selectedCell.x];
    const info = buildingInfo[cell.type];

    const upgradeCost = Math.floor(info.cost * 1.5);

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

// Gebäude abreißen
function removeBuilding() {
    if (!selectedCell) return;
    const cell = gridArray[selectedCell.y][selectedCell.x];
    cell.type = null;
    cell.level = 1;
    cell.element.className = "cell";
    closePopup();
}
