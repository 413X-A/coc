// Variablen
const grid = document.getElementById("grid");
let selectedBuilding = null;
let bewohner = 15;
let nahrung = 0;
let holz = 0;
let stein = 0;
let eisen = 0;
let gold = 20000;
let smaragde = 0;

let freeBuildings = {
    haus: 1,
    weg: 10,
    goldmine: 1
};

const gridArray = [];
const buildingLevels = {};
const WIDTH = 101;
const HEIGHT = 75;
const gridCenterX = Math.floor(WIDTH / 2);
const gridCenterY = Math.floor(HEIGHT / 2);
const islandRadius = Math.min(WIDTH, HEIGHT) * 0.4;

const rathausCoords = [];

// Grid erstellen mit Insel-Form
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

// Rathaus in der Mitte platzieren (3x3)
for (let y = gridCenterY - 1; y <= gridCenterY + 1; y++) {
    for (let x = gridCenterX - 1; x <= gridCenterX + 1; x++) {
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
    if (cell.type) {
        alert("Hier steht bereits ein Gebäude!");
        return;
    }

    let cost = 0, sizeX = 1, sizeY = 1, bewohnerChange = 0;

    switch (selectedBuilding) {
        case "haus":
            cost = 100; sizeX = 2; sizeY = 2; bewohnerChange = 5; break;
        case "weg":
            cost = 5; break;
        case "marktplatz":
            cost = 75; bewohnerChange = 0; sizeX = 4; sizeY = 4; break;
        case "getreidefarm":
            cost = 280; bewohnerChange = -5; sizeX = 2; sizeY = 2; break;
        case "fischerhuette":
            cost = 120; bewohnerChange = 0; sizeX = 1; sizeY = 1; break;
        case "holzfaeller":
            cost = 150; bewohnerChange = -3; sizeX = 3; sizeY = 3; break;
        case "steinmetz":
            cost = 300; bewohnerChange = -8; sizeX = 2; sizeY = 2; break;
        case "eisenerz":
            cost = 600; bewohnerChange = -15; sizeX = 2; sizeY = 1; break;
        case "goldmine":
            cost = 800; bewohnerChange = -25; sizeX = 2; sizeY = 2; break;
        case "smaragdmine":
            cost = 2500; bewohnerChange = -35; sizeX = 1; sizeY = 1; break;
    }

    if (gold < cost) {
        alert("Nicht genug Gold!");
        return;
    }

    if (bewohner + bewohnerChange < 0) {
        alert("Nicht genug Einwohner!");
        return;
    }

    // Platz prüfen
    for (let dy = 0; dy < sizeY; dy++) {
        for (let dx = 0; dx < sizeX; dx++) {
            if (!isInBounds(x + dx, y + dy) || gridArray[y + dy][x + dx].type) {
                alert("Kein Platz für dieses Gebäude!");
                return;
            }
        }
    }

    // Straßenzugang prüfen
    if (selectedBuilding !== "weg" && !isAdjacentTo("weg", x, y, sizeX, sizeY)) {
        alert("Gebäude muss an einer Straße liegen!");
        return;
    }

    // Wegverbindung zum Rathaus prüfen
    if (selectedBuilding !== "weg" && !isNearMarketplaceOrRathaus(x, y, sizeX, sizeY)) {
        alert("Zu weit vom Rathaus oder Marktplatz entfernt!");
        return;
    }

    if (selectedBuilding === "weg" && !isConnectedToRathaus(x, y)) {
        alert("Straße muss mit Rathaus verbunden sein!");
        return;
    }

    gold -= cost;
    bewohner += bewohnerChange;
    updateInfo();

    for (let dy = 0; dy < sizeY; dy++) {
        for (let dx = 0; dx < sizeX; dx++) {
            gridArray[y + dy][x + dx].type = selectedBuilding;
            gridArray[y + dy][x + dx].element.classList.add(selectedBuilding);
        }
    }
}

// Menü anzeigen
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
    const lvl = buildingLevels[key] || 1;

    if (lvl >= 5) {
        alert("Maximale Stufe erreicht!");
        return;
    }

    const upgradeCosts = [150, 300, 450, 600, 750];
    const cost = upgradeCosts[lvl - 1]; // lvl-1, da Index bei 0 startet

    if (gold >= cost) {
        gold -= cost;
        buildingLevels[key] = lvl + 1;
        alert(`Gebäude auf Stufe ${buildingLevels[key]} verbessert!`);
        updateInfo();
    } else {
        alert(`Nicht genug Gold für Upgrade! (${cost} Gold benötigt)`);
    }
}

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

function isInBounds(x, y) {
    return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
}

function isAdjacentTo(type, x, y, sizeX, sizeY) {
    for (let dy = -1; dy <= sizeY; dy++) {
        for (let dx = -1; dx <= sizeX; dx++) {
            const nx = x + dx, ny = y + dy;
            if (isInBounds(nx, ny) && gridArray[ny][nx].type === type) {
                return true;
            }
        }
    }
    return false;
}

function isConnectedToRathaus(x, y) {
    const visited = new Set();
    const queue = [{ x, y }];

    while (queue.length) {
        const current = queue.shift();
        const key = `${current.x},${current.y}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const cell = gridArray[current.y][current.x];
        if (cell.type === "rathaus") return true;

        for (let [dx, dy] of [[0,1],[1,0],[-1,0],[0,-1]]) {
            const nx = current.x + dx, ny = current.y + dy;
            if (isInBounds(nx, ny) && gridArray[ny][nx].type === "weg") {
                queue.push({ x: nx, y: ny });
            }
        }
    }

    return false;
}

function isNearMarketplaceOrRathaus(x, y, sizeX, sizeY) {
    const rangeToRathaus = 25;
    const rangeToMarktplatz = 15;

    for (let dy = 0; dy < sizeY; dy++) {
        for (let dx = 0; dx < sizeX; dx++) {
            const cx = x + dx, cy = y + dy;

            // Check Marktplatz-Nähe
            for (let oy = -rangeToMarktplatz; oy <= rangeToMarktplatz; oy++) {
                for (let ox = -rangeToMarktplatz; ox <= rangeToMarktplatz; ox++) {
                    const nx = cx + ox, ny = cy + oy;
                    if (isInBounds(nx, ny) && gridArray[ny][nx].type === "marktplatz") {
                        return true;
                    }
                }
            }

            // Check Rathaus-Nähe
            for (let oy = -rangeToRathaus; oy <= rangeToRathaus; oy++) {
                for (let ox = -rangeToRathaus; ox <= rangeToRathaus; ox++) {
                    const nx = cx + ox, ny = cy + oy;
                    if (isInBounds(nx, ny) && gridArray[ny][nx].type === "rathaus") {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

// Produktionsfunktionen
function produceNahrung() {
    gold += gridArray.flat().reduce((sum, cell) =>
        cell.active && cell.type === "getreidefarm" ? sum + 1 * (buildingLevels[`${cell.element.dataset.x}_${cell.element.dataset.y}`] || 1) : sum, 0);
        cell.active && cell.type === "fischerhuette" ? sum + 1 * (buildingLevels[`${cell.element.dataset.x}_${cell.element.dataset.y}`] || 1) : sum, 0);
    updateInfo();
}

function produceGold() {
    gold += gridArray.flat().reduce((sum, cell) =>
        cell.active && cell.type === "goldmine" ? sum + 1 * (buildingLevels[`${cell.element.dataset.x}_${cell.element.dataset.y}`] || 1) : sum, 0);
    updateInfo();
}

function produceHolz() {
    holz += gridArray.flat().reduce((sum, cell) =>
        cell.active && cell.type === "holzfaeller" ? sum + 1* (buildingLevels[`${cell.element.dataset.x}_${cell.element.dataset.y}`] || 1) : sum, 0);
    updateInfo();
}

function produceStein() {
    stein += gridArray.flat().reduce((sum, cell) =>
        cell.active && cell.type === "steinmetz" ? sum + 1 * (buildingLevels[`${cell.element.dataset.x}_${cell.element.dataset.y}`] || 1) : sum, 0);
    updateInfo();
}

function produceEisen() {
    eisen += gridArray.flat().reduce((sum, cell) =>
        cell.active && cell.type === "eisenerz" ? sum + 1 * (buildingLevels[`${cell.element.dataset.x}_${cell.element.dataset.y}`] || 1) : sum, 0);
    updateInfo();
}

function produceSmaragde() {
    smaragde += gridArray.flat().reduce((sum, cell) =>
        cell.active && cell.type === "smaragdmine" ? sum + 1 * (buildingLevels[`${cell.element.dataset.x}_${cell.element.dataset.y}`] || 1) : sum, 0);
    updateInfo();
}

function startProduction() {
    setInterval(produceGold, 3000);
    setInterval(produceHolz, 5000);
    setInterval(produceStein, 6000);
    setInterval(produceEisen, 8000);
    setInterval(produceSmaragde, 10000);
    setInterval(produceNahrung, 15000);
}

function updateInfo() {
    document.getElementById("bewohner").innerText = bewohner;
    document.getElementById("nahrung").innerText = nahrung;
    document.getElementById("holz").innerText = holz;
    document.getElementById("stein").innerText = stein;
    document.getElementById("eisen").innerText = eisen;
    document.getElementById("gold").innerText = gold;
    document.getElementById("smaragde").innerText = smaragde;
}

startProduction();
