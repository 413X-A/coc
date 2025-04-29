const buildingDescriptions = {
    haus: {
        name: "Haus",
        cost: 150,
        bewohnerChange: 5,
        produces: "Erhöht maximale Bevölkerung um 5",
        needs: "2x2 Platz, angrenzend an Straße"
    },
    weg: {
        name: "Weg",
        cost: 10,
        bewohnerChange: 0,
        produces: "Verbindet Gebäude",
        needs: "1x1, angrenzend an Weg/Marktplatz/Rathaus"
    },
    marktplatz: {
        name: "Marktplatz",
        cost: 450,
        bewohnerChange: 0,
        produces: "Zentraler Handelsplatz",
        needs: "2x2 Platz, kann überall gebaut werden"
    },
    getreidefarm: {
        name: "Getreidefarm",
        cost: 280,
        bewohnerChange: -3,
        produces: "Erzeugt Nahrung",
        needs: "3x2 Platz, angrenzend an Straße"
    },
    fischerhuette: {
        name: "Fischerhütte",
        cost: 120,
        bewohnerChange: -2,
        produces: "Erzeugt Nahrung",
        needs: "2x1 Platz, angrenzend an Wasser und Straße"
    },
    holzfaeller: {
        name: "Holzfäller",
        cost: 150,
        bewohnerChange: -4,
        produces: "Erzeugt Holz",
        needs: "3x2 Platz, angrenzend an Straße"
    },
    steinmetz: {
        name: "Steinmetz",
        cost: 300,
        bewohnerChange: -4,
        produces: "Erzeugt Stein",
        needs: "2x2 Platz, angrenzend an Straße"
    },
    eisenerz: {
        name: "Eisenerz",
        cost: 800,
        bewohnerChange: -6,
        produces: "Erzeugt Eisen",
        needs: "2x2 Platz, angrenzend an Straße"
    },
    goldmine: {
        name: "Goldmine",
        cost: 600,
        bewohnerChange: -5,
        produces: "Erzeugt Gold",
        needs: "2x2 Platz, angrenzend an Straße"
    },
    smaragdmine: {
        name: "Smaragdmine",
        cost: 1500,
        bewohnerChange: -8,
        produces: "Erzeugt Smaragde",
        needs: "2x2 Platz, angrenzend an Straße"
    },
};

function showPopup(building) {
    const info = buildingDescriptions[building];
    const popup = document.getElementById("building-popup");
    const popupContent = document.getElementById("popup-content");

    popupContent.innerHTML = `
        <strong>${info.name}</strong><br>
        <b>Kosten:</b> ${info.cost} Gold<br><br>
        <b>Produktion:</b> ${info.produces}<br>
        <b>Platzierung:</b> ${info.needs}<br><br>
    `;

    document.getElementById("confirm-build").onclick = () => {
        setBuilding(building);
        closePopup();
    };

    popup.style.display = "block";
}

function closePopup() {
    document.getElementById("building-popup").style.display = "none";
}

function setBuilding(building) {
    alert(`Das Gebäude ${building} wurde gebaut!`);
    // Hier kommt die Logik zum Bauen des Gebäudes
}

function cancelBuild() {
    alert("Bau abgebrochen");
    closePopup();
}

// Füge Event Listener zu allen "Bauen" Buttons hinzu
document.querySelectorAll(".building-button").forEach(button => {
    button.addEventListener("click", () => {
        const building = button.dataset.building;
        showPopup(building);
    });
});

// Füge Event Listener für "Nichts bauen" Button hinzu
document.getElementById("no-build").addEventListener("click", () => {
    cancelBuild();
    closePopup();
});
