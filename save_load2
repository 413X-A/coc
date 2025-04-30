function isConnectedToCenter(x, y, visited) {
    if (
        x < 0 || y < 0 ||
        y >= gridArray.length || x >= gridArray[0].length ||
        visited[`${x},${y}`]
    ) {
        return false;
    }

    const cell = gridArray[y][x];
    visited[`${x},${y}`] = true;

    if (cell.type === "marktplatz" || cell.type === "rathaus") {
        return true;
    }

    if (cell.type !== "weg") return false;

    // Rekursiv angrenzende Felder prüfen
    return (
        isConnectedToCenter(x + 1, y, visited) ||
        isConnectedToCenter(x - 1, y, visited) ||
        isConnectedToCenter(x, y + 1, visited) ||
        isConnectedToCenter(x, y - 1, visited)
    );
}

function loadGame(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const data = JSON.parse(content);

        // Ressourcen
        gold = data.gold;
        bewohner = data.bewohner;
        holz = data.holz;
        nahrung = data.nahrung;
        stein = data.stein;
        eisen = data.eisen;
        smaragde = data.smaragde;
        selectedBuilding = data.selectedBuilding || null;
        Object.assign(freeBuildings, data.freeBuildings);
        Object.assign(buildingLevels, data.buildingLevels);
        updateInfo();

        // Grid aufbauen
        const grid = document.getElementById("grid");
        grid.innerHTML = "";
        gridArray = [];

        const rawGridArray = data.gridArray;

        for (let y = 0; y < rawGridArray.length; y++) {
            gridArray[y] = [];
            for (let x = 0; x < rawGridArray[y].length; x++) {
                const cellData = rawGridArray[y][x];
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.dataset.x = x;
                cell.dataset.y = y;

                if (cellData.type) {
                    cell.classList.add(cellData.type);
                }

                const cellObj = {
                    type: cellData.type,
                    active: false,
                    element: cell
                };

                cell.addEventListener("click", (e) => onCellClick(e, x, y));
                grid.appendChild(cell);
                gridArray[y][x] = cellObj;
            }
        }

        // Nachträglich aktive Zellen berechnen
        for (let y = 0; y < gridArray.length; y++) {
            for (let x = 0; x < gridArray[y].length; x++) {
                const cell = gridArray[y][x];

                if (cell.type && cell.type !== "wasser") {
                    const visited = {};

                    if (
                        (cell.type !== "weg" && isConnectedToCenter(x, y, visited)) ||
                        (cell.type === "weg" && isConnectedToCenter(x, y, {}))
                    ) {
                        cell.active = true;
                        cell.element.classList.add("active");
                    }
                }
            }
        }
    };

    reader.readAsText(file);
}
