// Variablen
const grid = document.getElementById("grid");
let selectedBuilding = null;
let gold = 20000;
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

const buildingLevels = {}; // Speichert Upgrades der Gebäude

const WIDTH = 101;
const HEIGHT = 75;
const gridCenterX = Math.floor(WIDTH / 2);
const gridCenterY = Math.floor(HEIGHT / 2);
const islandRadius = Math.min(WIDTH, HEIGHT) * 0.4;

// Grid erstellen mit Insel-Form
for (let y = 0; y < HEIGHT; y++) {
    gridArray[y] = [];
    for (let x = 0; x < WIDTH; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = x;
        cell.dataset.y = y;

        const dx = x - gridCenterX;
        const dy = y - gridCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // leichte Verzerrung für eine unregelmäßige Insel
        const noise = (Math.sin(x * 0.3) + Math.cos(y * 0.2)) * 3;

        if (distance < islandRadius + noise) {
            // Insel
            gridArray[y][x] = { type: null, element: cell, active: true };
        } else {
            // Wasser
            cell.classList.add("wasser");
            gridArray[y][x] = { type: "wasser", element: cell, active: false };
        }

        cell.addEventListener("click", (e) => onCellClick(e, x, y));
        grid.appendChild(cell);
    }
}

// Rathaus in der Mitte platzieren (7x7)
for (let y = gridCenterY - 3; y <= gridCenterY + 3; y++) {
    for (let x = gridCenterX - 3; x <= gridCenterX + 3; x++) {
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

function build(x, y) {
    if (!selectedBuilding) return;
    const cell = gridArray[y][x];

    // Nur auf leere Felder bauen – außer bei Wegen, die dürfen nur auf leeren Feldern gebaut werden
    if (cell.type) return;

    let cost = 0;
    let sizeX = 1;
    let sizeY = 1;
    let bewohnerChange = 0;
    let isFreeBuilding = false;

    switch (selectedBuilding) {
        case "haus":
            cost = 150;
            sizeX = 2;
            sizeY = 2;
            bewohnerChange = 5;
            break;
        case "weg":
            cost = 10;
            break;
        case "marktplatz":
            cost = 75;
            sizeX = 2;
            sizeY = 2;
            break;
        case "getreidefarm":
            cost = 280;
            sizeX = 3;
            sizeY = 2;
            bewohnerChange = -3;
            break;
        case "fischerhuette":
            cost = 120;
            sizeX = 2;
            sizeY = 1;
            bewohnerChange = -2;
            break;
        case "holzfaeller":
            cost = 150;
            sizeX = 3;
            sizeY = 2;
            bewohnerChange = -4;
            break;
        case "steinmetz":
            cost = 300;
            sizeX = 2;
            sizeY = 2;
            bewohnerChange = -4;
            break;
        case "eisenerz":
            cost = 800;
            sizeX = 2;
            sizeY = 2;
            bewohnerChange = -6;
            break;
        case "goldmine":
            cost = 600;
            sizeX = 2;
            sizeY = 2;
            bewohnerChange = -5;
            break;
        case "smaragdmine":
            cost = 1500;
            sizeX = 2;
            sizeY = 2;
            bewohnerChange = -8;
            break;
    }

    // Platzierungsregel für Wege
    if (selectedBuilding === "weg") {
        const directions = [
            [0, -1], // oben
            [0, 1],  // unten
            [-1, 0], // links
            [1, 0],  // rechts
        ];
        let isNextToValid = false;
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (isInBounds(nx, ny)) {
                const neighborType = gridArray[ny][nx].type;
                if (neighborType === "weg" || neighborType === "rathaus" || neighborType === "marktplatz") {
                    isNextToValid = true;
                    break;
                }
            }
        }
        if (!isNextToValid) {
            alert("Wege dürfen nur neben Straßen, dem Rathaus oder einem Marktplatz gebaut werden!");
            return;
        }
    }

    // Gratis-Bauten prüfen
    if (freeBuildings[selectedBuilding] && freeBuildings[selectedBuilding] > 0) {
        isFreeBuilding = true;
    }

    if (bewohner + bewohnerChange < 0) {
        alert("Nicht genug Einwohner für dieses Gebäude!");
        return;
    }

    // Gratis-Bauten prüfen und sicherstellen, dass das Gebäude nur verbraucht wird, wenn es korrekt platziert wurde
    if (isFreeBuilding) {
        if (selectedBuilding !== "marktplatz" && !isValidPlacement(x, y, sizeX, sizeY)) {
            alert("Das gratis Gebäude wurde falsch platziert und wird nicht verbraucht.");
            return;
        }
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

    // Wenn das Gebäude ein Marktplatz ist, keine angrenzende Prüfung an Weg oder Rathaus
    if (selectedBuilding !== "marktplatz" && selectedBuilding !== "weg" && !isConnected(x, y, sizeX, sizeY)) {
        alert("Gebäude muss an Straße anschließen!");
        return;
    }

    // Ressourcen abziehen und Einwohner anpassen
    gold -= cost;
    bewohner += bewohnerChange;
    updateInfo();

    // Gebäude bauen
    for (let dy = 0; dy < sizeY; dy++) {
        for (let dx = 0; dx < sizeX; dx++) {
            gridArray[y + dy][x + dx].type = selectedBuilding;
            gridArray[y + dy][x + dx].element.classList.add(selectedBuilding);
            buildingLevels[`${x + dx}_${y + dy}`] = 1;
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

// Hilfsfunktionen
function isInBounds(x, y) {
    return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
}

// Funktion für Weg-Verbindung überprüfen
function isConnected(x, y, sizeX, sizeY) {
    // Überprüfen, ob das Gebäude neben einem Weg ist
    let connected = false;

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (isInBounds(x + dx, y + dy) && gridArray[y + dy] && gridArray[y + dy][x + dx].type === "weg") {
                connected = true;
                break;
            }
        }
    }
    return connected;
}

// Update der Anzeige für Ressourcen
function updateInfo() {
    document.getElementById("gold").innerText = gold;
    document.getElementById("bewohner").innerText = bewohner;
    document.getElementById("holz").innerText = holz;
    document.getElementById("stein").innerText = stein;
    document.getElementById("eisen").innerText = eisen;
    document.getElementById("smaragde").innerText = smaragde;
}

// Produktion starten
function startProduction() {
    setInterval(produceGold, 3000);        // Goldminen alle 3 Sekunden
    setInterval(produceHolz, 5000);        // Holzfäller alle 5 Sekunden
    setInterval(produceStein, 6000);       // Steinmetze alle 6 Sekunden
    setInterval(produceEisen, 8000);       // Eisenerzminen alle 8 Sekunden
    setInterval(produceSmaragde, 10000);   // Smaragdmine alle 10 Sekunden
}

// Produktion der Ressourcen
function produceGold() {
    gold += gridArray.flat().reduce((sum, cell) => {
        if (cell.active && cell.type === "goldmine") {
            const key = `${cell.element.dataset.x}_${cell.element.dataset.y}`;
            const level = buildingLevels[key] || 1;
            return sum + 1 * level;  // Beispiel: Goldmine gibt 5 Gold pro Level
        }
        return sum;
    }, 0);
    updateInfo();
}

// Ressourcenproduktion (Holz, Stein, Eisen, Smaragde)
function produceHolz() {
    holz += gridArray.flat().reduce((sum, cell) => {
        if (cell.active && cell.type === "holzfaeller") {
            return sum + 1;
        }
        return sum;
    }, 0);
    updateInfo();
}

function produceStein() {
    stein += gridArray.flat().reduce((sum, cell) => {
        if (cell.active && cell.type === "steinmetz") {
            return sum + 1;
        }
        return sum;
    }, 0);
    updateInfo();
}

function produceEisen() {
    eisen += gridArray.flat().reduce((sum, cell) => {
        if (cell.active && cell.type === "eisenerz") {
            return sum + 1;
        }
        return sum;
    }, 0);
    updateInfo();
}

function produceSmaragde() {
    smaragde += gridArray.flat().reduce((sum, cell) => {
        if (cell.active && cell.type === "smaragdmine") {
            return sum + 1;
        }
        return sum;
    }, 0);
    updateInfo();
}

startProduction();
