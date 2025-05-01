// Variablen
const grid = document.getElementById("grid");
let selectedBuilding = null;
let gold = 20000;
let bewohner = 15;
let holz = 0;
let nahrung = 100;
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

function generateIsland() {
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

            // Insel-Form mit Verzerrung + Rauschen
            const noise = (Math.sin(x * 0.3) + Math.cos(y * 0.2)) * 3 + (Math.random() - 0.5) * 6;

            if (distance < islandRadius + noise) {
                gridArray[y] = gridArray[y] || [];
                gridArray[y][x] = {
                    type: null,
                    element: cell,
                    active: true
                };
            } else {
                cell.classList.add("wasser");
                gridArray[y] = gridArray[y] || [];
                gridArray[y][x] = {
                    type: "wasser",
                    element: cell,
                    active: false
                };
            }

            cell.addEventListener("click", (e) => onCellClick(e, x, y));
            grid.appendChild(cell);
        }
    }

    // Rathaus (3x3) in der Mitte platzieren
    for (let y = gridCenterY - 3; y <= gridCenterY + 3; y++) {
        for (let x = gridCenterX - 3; x <= gridCenterX + 3; x++) {
            gridArray[y][x].type = "rathaus";
            gridArray[y][x].element.classList.add("rathaus");
            gridArray[y][x].active = true;
        }
    }

    // Berge generieren – mit Abstand zum Rathaus
    const mountainCount = 3;
    const minDistanceToTownhall = 15;

    for (let i = 0; i < mountainCount; i++) {
        let mountainX, mountainY, distanceToTownhall;
        let tries = 0;

        // Suche nach geeignetem Ort mit Abstand
        do {
            mountainX = Math.floor(Math.random() * WIDTH);
            mountainY = Math.floor(Math.random() * HEIGHT);

            const dx = mountainX - gridCenterX;
            const dy = mountainY - gridCenterY;
            distanceToTownhall = Math.sqrt(dx * dx + dy * dy);
            tries++;
        } while (
            tries < 100 &&
            (
                distanceToTownhall < minDistanceToTownhall ||
                !gridArray[mountainY][mountainX].active ||
                gridArray[mountainY][mountainX].type
            )
        );

        const mountainRadius = Math.floor(Math.random() * 5) + 4; // 4–8 Felder Radius

        for (let y = mountainY - mountainRadius; y <= mountainY + mountainRadius; y++) {
            for (let x = mountainX - mountainRadius; x <= mountainX + mountainRadius; x++) {
                if (
                    x >= 0 && x < WIDTH &&
                    y >= 0 && y < HEIGHT &&
                    gridArray[y][x].active &&
                    !gridArray[y][x].type
                ) {
                    const dx = x - mountainX;
                    const dy = y - mountainY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Jede Berg-Zelle muss ebenfalls Abstand zum Rathaus haben
                    const distToTownhall = Math.sqrt((x - gridCenterX) ** 2 + (y - gridCenterY) ** 2);

                    if (distance <= mountainRadius && distToTownhall >= minDistanceToTownhall) {
                        gridArray[y][x].type = "berg";
                        gridArray[y][x].element.classList.add("berg");
                    }
                }
            }
        }
    }
}


// Hilfsfunktion zum Mischen eines Arrays
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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


// Funktion, um zu überprüfen, ob der entsprechende Bruch (Steinbruch, Eisenbruch, Goldbruch oder Smaragdbruch) in der Nähe ist
function isNearbyRohstoff(x, y, range, resourceType) {
    for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (isInBounds(nx, ny) && gridArray[ny][nx].type === resourceType) {
                return true;
            }
        }
    }
    return false;
}

// Anpassen der bestehenden build Funktion
function build(x, y) {
    if (!selectedBuilding) return;
    const cell = gridArray[y][x];
    if (cell.type) return;

    let cost = 0;
    let baseSizeX = 1;
    let baseSizeY = 1;
    let bewohnerChange = 0;
    let isFreeBuilding = false;

    const buildingData = {
        "haus": { cost: 150, sizeX: 2, sizeY: 2, bewohnerChange: 5 },
        "weg": { cost: 10, sizeX: 1, sizeY: 1, bewohnerChange: 0 },
        "marktplatz": { cost: 450, sizeX: 4, sizeY: 4, bewohnerChange: 0 },
        "getreidefarm": { cost: 280, sizeX: 3, sizeY: 2, bewohnerChange: -3 },
        "fischerhuette": { cost: 120, sizeX: 2, sizeY: 1, bewohnerChange: -2 },
        "holzfaeller": { cost: 150, sizeX: 3, sizeY: 2, bewohnerChange: -4 },
        "steinmetz": { cost: 300, sizeX: 2, sizeY: 2, bewohnerChange: -4 },
        "eisenschmiede": { cost: 800, sizeX: 2, sizeY: 2, bewohnerChange: -6 },
        "goldschmiede": { cost: 600, sizeX: 2, sizeY: 2, bewohnerChange: -5 },
        "smaragdschmiede": { cost: 1500, sizeX: 2, sizeY: 2, bewohnerChange: -8 },
        "steinbruch": { cost: 500, sizeX: 1, sizeY: 1, bewohnerChange: 0 },
        "eisenbruch": { cost: 800, sizeX: 1, sizeY: 1, bewohnerChange: 0 },
        "goldbruch": { cost: 600, sizeX: 1, sizeY: 1, bewohnerChange: 0 },
        "smaragdbruch": { cost: 1500, sizeX: 1, sizeY: 1, bewohnerChange: 0 },
    };

    const building = buildingData[selectedBuilding];
    if (!building) return;

    cost = building.cost;
    baseSizeX = building.sizeX;
    baseSizeY = building.sizeY;
    bewohnerChange = building.bewohnerChange;

    if (bewohner + bewohnerChange < 0) {
        alert("Nicht genug Einwohner!");
        return;
    }

    if (freeBuildings[selectedBuilding] && freeBuildings[selectedBuilding] > 0) {
        isFreeBuilding = true;
    }

    function isAreaFree(startX, startY, w, h) {
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                const nx = startX + dx;
                const ny = startY + dy;
                if (!isInBounds(nx, ny) || gridArray[ny][nx].type) {
                    return false;
                }
            }
        }
        return true;
    }

    const rotations = [
        { dx: 0, dy: 0, sx: baseSizeX, sy: baseSizeY },
        { dx: -(baseSizeY - 1), dy: 0, sx: baseSizeY, sy: baseSizeX },
        { dx: -(baseSizeX - 1), dy: -(baseSizeY - 1), sx: baseSizeX, sy: baseSizeY },
        { dx: 0, dy: -(baseSizeX - 1), sx: baseSizeY, sy: baseSizeX }
    ];

    let placed = false;

    for (let rot of rotations) {
        const startX = x + rot.dx;
        const startY = y + rot.dy;

        if (!isAreaFree(startX, startY, rot.sx, rot.sy)) continue;

        let adjacentToStreet = false;
        let adjacentToValidWegTarget = false;
        let adjacentToWater = false;

        for (let dy = 0; dy < rot.sy; dy++) {
            for (let dx = 0; dx < rot.sx; dx++) {
                const nx = startX + dx;
                const ny = startY + dy;

                const neighbors = [
                    { x: nx, y: ny - 1 },
                    { x: nx + 1, y: ny },
                    { x: nx, y: ny + 1 },
                    { x: nx - 1, y: ny }
                ];

                for (let n of neighbors) {
                    if (!isInBounds(n.x, n.y)) continue;
                    const neighborType = gridArray[n.y][n.x].type;

                    if (neighborType === "weg") {
                        adjacentToStreet = true;
                    }

                    if (["weg", "marktplatz", "rathaus"].includes(neighborType)) {
                        adjacentToValidWegTarget = true;
                    }

                    if (gridArray[n.y][n.x].type === "wasser") {
                        adjacentToWater = true;
                    }
                }
            }
        }

        // Regeln prüfen:
        if (selectedBuilding === "marktplatz") {
            // darf überall
        } else if (selectedBuilding === "weg") {
            if (!adjacentToValidWegTarget) continue;
        } else if (selectedBuilding === "fischerhuette") {
            if (!adjacentToStreet || !adjacentToWater) {
                alert("Fischerhütten müssen an Straße und Wasser angrenzen!");
                continue;
            }
        } else if (selectedBuilding === "steinmetz") {
            // Nur wenn ein Steinbruch in der Nähe ist
            if (!isNearbyRohstoff(x, y, 5, "steinbruch")) {
                alert("Der Steinmetz benötigt einen Steinbruch in der Nähe!");
                continue;
            }
        } else if (selectedBuilding === "eisenschmiede") {
            // Nur wenn ein Eisenbruch in der Nähe ist
            if (!isNearbyRohstoff(x, y, 5, "eisenbruch")) {
                alert("Die Eisenschmiede benötigt einen Eisenbruch in der Nähe!");
                continue;
            }
        } else if (selectedBuilding === "goldschmiede") {
            // Nur wenn ein Goldbruch in der Nähe ist
            if (!isNearbyRohstoff(x, y, 5, "goldbruch")) {
                alert("Die Goldschmiede benötigt einen Goldbruch in der Nähe!");
                continue;
            }
        } else if (selectedBuilding === "smaragdschmiede") {
            // Nur wenn ein Smaragdbruch in der Nähe ist
            if (!isNearbyRohstoff(x, y, 5, "smaragdbruch")) {
                alert("Die Smaragdschmiede benötigt einen Smaragdbruch in der Nähe!");
                continue;
            }
        } else {
            if (!adjacentToStreet) continue;
        }

        if (!isFreeBuilding && gold < cost) {
            alert("Nicht genug Gold!");
            return;
        }

        if (isFreeBuilding) {
            freeBuildings[selectedBuilding]--;
            cost = 0;
        }

        gold -= cost;
        bewohner += bewohnerChange;
        updateInfo();

        for (let dy = 0; dy < rot.sy; dy++) {
            for (let dx = 0; dx < rot.sx; dx++) {
                const tileX = startX + dx;
                const tileY = startY + dy;
                gridArray[tileY][tileX].type = selectedBuilding;
                gridArray[tileY][tileX].element.classList.add(selectedBuilding);
                buildingLevels[`${tileX}_${tileY}`] = 1;
            }
        }

        placed = true;
        break;
    }

    if (!placed) {
        alert("Kein Platz oder keine gültige Anbindung!");
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
    document.getElementById("nahrung").innerText = nahrung;
}

// Produktion starten
function startProduction() {
    setInterval(produceGold, 3000);        // Goldminen alle 3 Sekunden
    setInterval(produceHolz, 5000);        // Holzfäller alle 5 Sekunden
    setInterval(produceStein, 6000);       // Steinmetze alle 6 Sekunden
    setInterval(produceEisen, 8000);       // Eisenerzminen alle 8 Sekunden
    setInterval(produceSmaragde, 10000);   // Smaragdmine alle 10 Sekunden
    setInterval(produceNahrung, 15000);   // Nahrung alle 15 Sekunden
}

// Produktion der Ressourcen
function produceGold() {
    let goldProduced = gridArray.flat().reduce((sum, cell) => {
        if (cell.active && cell.type === "goldmine") {
            const key = `${cell.element.dataset.x}_${cell.element.dataset.y}`;
            const level = buildingLevels[key] || 1;
            return sum + 1 * level;  // Beispiel: Goldmine gibt Gold pro Level
        }
        return sum;
    }, 0);
    goldProduced = Math.floor(goldProduced / 4); // Zwischenwert geteilt durch 4
    gold += goldProduced; // Wert zu Gold hinzufügen
    updateInfo();
}

function produceHolz() {
    let holzProduced = gridArray.flat().reduce((sum, cell) => {
        if (cell.active && cell.type === "holzfaeller") {
            return sum + 1;
        }
        return sum;
    }, 0);
    holzProduced = Math.floor(holzProduced / 6); // Zwischenwert geteilt durch 6
    holz += holzProduced; // Wert zu Holz hinzufügen
    updateInfo();
}

function produceStein() {
    let steinProduced = gridArray.flat().reduce((sum, cell) => {
        if (cell.active && cell.type === "steinmetz") {
            return sum + 1;
        }
        return sum;
    }, 0);
    steinProduced = Math.floor(steinProduced / 4); // Zwischenwert geteilt durch 4
    stein += steinProduced; // Wert zu Stein hinzufügen
    updateInfo();
}

function produceEisen() {
    let eisenProduced = gridArray.flat().reduce((sum, cell) => {
        if (cell.active && cell.type === "eisenerz") {
            return sum + 1;
        }
        return sum;
    }, 0);
    eisenProduced = Math.floor(eisenProduced / 4); // Zwischenwert geteilt durch 4
    eisen += eisenProduced; // Wert zu Eisen hinzufügen
    updateInfo();
}

function produceSmaragde() {
    let smaragdeProduced = gridArray.flat().reduce((sum, cell) => {
        if (cell.active && cell.type === "smaragdmine") {
            return sum + 1;
        }
        return sum;
    }, 0);
    smaragdeProduced = Math.floor(smaragdeProduced / 4); // Keine Division, da es durch 1 geteilt wird
    smaragde += smaragdeProduced; // Wert zu Smaragden hinzufügen
    updateInfo();
}

function produceNahrung() {
    let nahrungProduced = gridArray.flat().reduce((sum, cell) => {
        if (cell.active) {
            if (cell.type === "getreidefarm") {
                return sum + 1; // 1 für jede Getreidefarm
            }
            if (cell.type === "fischerhuette") {
                return sum + 1; // 1 für jede Fischerhütte
            }
        }
        return sum;
    }, 0);

    // Nahrung von Getreidefarm geteilt durch 2 und von Fischerhütten geteilt durch 2
    let getreideFarms = gridArray.flat().filter(cell => cell.active && cell.type === "getreidefarm").length;
    let fischerhuetten = gridArray.flat().filter(cell => cell.active && cell.type === "fischerhuette").length;
    
    nahrungProduced = Math.floor(nahrungProduced / 2); // Nahrung von Getreidefarm
    nahrungProduced += Math.floor(fischerhuetten / 2); // Nahrung von Fischerhütten

    nahrung += nahrungProduced; // Wert zu Nahrung hinzufügen
    updateInfo();
}


generateIsland();
startProduction();
