function saveGame() {
    const data = {
        gold,
        bewohner,
        holz,
        nahrung,
        stein,
        eisen,
        smaragde,
        selectedBuilding,
        freeBuildings,
        buildingLevels,
        gridArray: gridArray.map(row => row.map(cell => ({
            type: cell.type,
            active: cell.active
        })))
    };

    const blob = new Blob([JSON.stringify(data)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spielstand.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

        // Spielfeld neu aufbauen
        grid.innerHTML = "";
        gridArray.length = 0;

        for (let y = 0; y < data.gridArray.length; y++) {
            gridArray[y] = [];
            for (let x = 0; x < data.gridArray[y].length; x++) {
                const cellData = data.gridArray[y][x];
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.dataset.x = x;
                cell.dataset.y = y;

                if (cellData.type) {
                    cell.classList.add(cellData.type);
                } else if (cellData.type === "wasser") {
                    cell.classList.add("wasser");
                }

                const cellObj = {
                    type: cellData.type,
                    active: cellData.active,
                    element: cell
                };

                cell.addEventListener("click", (e) => onCellClick(e, x, y));
                grid.appendChild(cell);
                gridArray[y][x] = cellObj;
            }
        }

        // checkConnectivity(); // zur Sicherheit, falls Wegverbindungen fehlen
    };

    reader.readAsText(file);
}
