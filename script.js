let gold = 100;
let elixir = 50;
let troops = 0;

function updateDisplay() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('elixir').textContent = elixir;
    document.getElementById('troops').textContent = troops;
}

function collectResources() {
    gold += 10;
    elixir += 5;
    updateDisplay();
}

function trainTroop() {
    if (gold >= 20) {
        gold -= 20;
        troops += 1;
        updateDisplay();
    } else {
        alert('Nicht genug Gold!');
    }
}

function attack() {
    if (troops > 0) {
        let success = Math.random() > 0.5;
        if (success) {
            alert('Angriff erfolgreich! +50 Gold');
            gold += 50;
        } else {
            alert('Angriff fehlgeschlagen! -1 Truppe');
            troops -= 1;
        }
        updateDisplay();
    } else {
        alert('Keine Truppen zum Angreifen!');
    }
}

updateDisplay();
