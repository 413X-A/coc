// Konstanten
const WIDTH = 1000;
const HEIGHT = 750;
const VISIBLE_WIDTH = 100;
const VISIBLE_HEIGHT = 75;

const gridArray = [];
let viewportX = Math.floor(WIDTH / 2 - VISIBLE_WIDTH / 2);
let viewportY = Math.floor(HEIGHT / 2 - VISIBLE_HEIGHT / 2);

const grid = document.getElementById("grid");

function generateWorld() {
    for (let y = 0; y < HEIGHT; y++) {
        gridArray[y] = [];
        for (let x = 0; x < WIDTH; x++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.x = x;
            cell.dataset.y = y;
            gridArray[y][x] = {
                type: "wasser",
                element: cell,
                active: false
            };
        }
    }

    // Hauptinsel
    generateIsland(WIDTH / 2, HEIGHT / 2, 35, true);

    // 10 zusätzliche Inseln
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const distance = 100 + Math.random() * 300;
        const centerX = Math.floor(WIDTH / 2 + Math.cos(angle) * distance);
        const centerY = Math.floor(HEIGHT / 2 + Math.sin(angle) * distance);
        const hasMountains = Math.random() < 0.7;
        const hasKontor = true;
        generateIsland(centerX, centerY, 20 + Math.random() * 10, false, hasMountains, hasKontor);
    }

    renderVisibleGrid();
}

function generateIsland(centerX, centerY, radius, isMain = false, withMountains = true, withKontor = false) {
    for (let y = Math.floor(centerY - radius - 5); y <= centerY + radius + 5; y++) {
        for (let x = Math.floor(centerX - radius - 5); x <= centerX + radius + 5; x++) {
            if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) continue;
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const noise = (Math.sin(x * 0.2) + Math.cos(y * 0.2)) * 2 + (Math.random() - 0.5) * 5;

            if (distance < radius + noise) {
                gridArray[y][x].type = null;
                gridArray[y][x].active = true;
            }
        }
    }

    // Optional 1 (main) oder mehrere (andere) Berge
    const mountainCount = isMain ? 1 : (withMountains ? Math.floor(Math.random() * 2) + 1 : 0);
    for (let i = 0; i < mountainCount; i++) {
        const mx = Math.floor(centerX + (Math.random() - 0.5) * radius);
        const my = Math.floor(centerY + (Math.random() - 0.5) * radius);
        const mRadius = 3 + Math.floor(Math.random() * 3);
        for (let y = my - mRadius; y <= my + mRadius; y++) {
            for (let x = mx - mRadius; x <= mx + mRadius; x++) {
                if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) continue;
                const dx = x - mx;
                const dy = y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= mRadius && gridArray[y][x].active) {
                    gridArray[y][x].type = "berg";
                }
            }
        }
    }

    // Optional Kontor am Rand
    if (withKontor) {
        for (let angle = 0; angle < 360; angle += 10) {
            const rad = angle * Math.PI / 180;
            const x = Math.floor(centerX + Math.cos(rad) * radius);
            const y = Math.floor(centerY + Math.sin(rad) * radius);
            if (x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT && gridArray[y][x].active && !gridArray[y][x].type) {
                gridArray[y][x].type = "kontor";
                break;
            }
        }
    }
}

function renderVisibleGrid() {
    grid.innerHTML = "";
    for (let y = 0; y < VISIBLE_HEIGHT; y++) {
        for (let x = 0; x < VISIBLE_WIDTH; x++) {
            const cellX = viewportX + x;
            const cellY = viewportY + y;
            if (cellY >= HEIGHT || cellX >= WIDTH) continue;

            const cellData = gridArray[cellY][cellX];
            const cell = cellData.element.cloneNode();
            cell.classList.add("cell");

            if (cellData.active) {
                if (cellData.type) cell.classList.add(cellData.type);
            } else {
                cell.classList.add("wasser");
            }

            grid.appendChild(cell);
        }
    }
}

// Drag + Touch Scroll
let isDragging = false;
let startX, startY;

const gridContainer = document.getElementById("grid-container");

gridContainer.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) >= 8 || Math.abs(dy) >= 8) {
        const moveX = Math.sign(-dx);
        const moveY = Math.sign(-dy);
        scrollViewport(moveX, moveY);
        startX = e.clientX;
        startY = e.clientY;
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// Touch
let touchStartX, touchStartY;
gridContainer.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: false });

gridContainer.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.abs(dx) >= 8 || Math.abs(dy) >= 8) {
        const moveX = Math.sign(-dx);
        const moveY = Math.sign(-dy);
        scrollViewport(moveX, moveY);
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }
}, { passive: false });

function scrollViewport(dx, dy) {
    viewportX = Math.max(0, Math.min(WIDTH - VISIBLE_WIDTH, viewportX + dx));
    viewportY = Math.max(0, Math.min(HEIGHT - VISIBLE_HEIGHT, viewportY + dy));
    renderVisibleGrid();
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
        "minenschacht": { cost: 1500, sizeX: 1, sizeY: 1, bewohnerChange: 0 },
    };

    const building = buildingData[selectedBuilding];
    if (!building) return;

    let { cost, sizeX: baseSizeX, sizeY: baseSizeY, bewohnerChange } = building;
    let isFreeBuilding = false;

    if (bewohner + bewohnerChange < 0) {
        alert("Nicht genug Einwohner!");
        return;
    }

    if (freeBuildings[selectedBuilding] && freeBuildings[selectedBuilding] > 0) {
        isFreeBuilding = true;
    }

    if (selectedBuilding === "minenschacht") {
        if (!cell.element.classList.contains("berg")) {
            alert("Minenschächte dürfen nur auf Bergen gebaut werden!");
            return;
        }
    }

    function isAreaFree(startX, startY, w, h) {
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                const nx = startX + dx;
                const ny = startY + dy;
                if (!isInBounds(nx, ny)) return false;

                const tile = gridArray[ny][nx];
                if (tile.type) return false;
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

                    if (neighborType === "weg") adjacentToStreet = true;
                    if (["weg", "marktplatz", "rathaus"].includes(neighborType)) adjacentToValidWegTarget = true;
                    if (neighborType === "wasser") adjacentToWater = true;
                }
            }
        }

        // Bau-Regeln
        if (selectedBuilding === "marktplatz") {
            // Immer erlaubt
        } else if (selectedBuilding === "weg") {
            if (!adjacentToValidWegTarget) continue;
        } else if (selectedBuilding === "fischerhuette") {
            if (!adjacentToStreet || !adjacentToWater) {
                alert("Fischerhütten müssen an Straße und Wasser angrenzen!");
                continue;
            }
        } else if (["steinmetz", "goldschmiede", "eisenschmiede", "smaragdschmiede"].includes(selectedBuilding)) {
            if (!isNearbyRohstoff(x, y, 5, "minenschacht")) {
                alert(`${selectedBuilding.charAt(0).toUpperCase() + selectedBuilding.slice(1)} benötigt einen Minenschacht in der Nähe!`);
                continue;
            }
            if (selectedBuilding === "smaragdschmiede" && !adjacentToStreet) continue;
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
                const tile = gridArray[tileY][tileX];
                tile.element.classList.remove("berg");
                tile.type = selectedBuilding;
                tile.element.classList.add(selectedBuilding);
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
    
    nahrungProduced = Math.floor(nahrungProduced / 3); // Nahrung von Getreidefarm
    nahrungProduced += Math.floor(fischerhuetten / 2); // Nahrung von Fischerhütten

    nahrung += nahrungProduced; // Wert zu Nahrung hinzufügen
    updateInfo();
}


// Aufrufe
generateWorld();
startProduction();
