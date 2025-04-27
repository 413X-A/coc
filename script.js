let gold = 100;
let mineLevel = 1;
let buildings = [];
let gameArea = document.getElementById('gameArea');
let goldDisplay = document.getElementById('gold');

function updateGoldDisplay() {
  goldDisplay.textContent = `Gold: ${gold}`;
}

function randomPosition() {
  return {
    top: Math.random() * 350,
    left: Math.random() * 550
  };
}

function build(type) {
  let cost = 0;
  let emoji = '';

  if (type === 'weg') {
    cost = 10;
    emoji = '🛤️';
  } else if (type === 'haus') {
    cost = 50;
    emoji = '🏠';
  } else if (type === 'goldmine') {
    cost = 100;
    emoji = '⛏️';
  }

  if (gold >= cost) {
    gold -= cost;
    const pos = randomPosition();
    const div = document.createElement('div');
    div.className = 'building';
    div.style.top = `${pos.top}px`;
    div.style.left = `${pos.left}px`;
    div.textContent = emoji;
    gameArea.appendChild(div);

    buildings.push({ type: type, element: div });

    updateGoldDisplay();
  } else {
    alert('Nicht genug Gold!');
  }
}

function upgradeMine() {
  const cost = 200;
  if (gold >= cost) {
    gold -= cost;
    mineLevel++;
    updateGoldDisplay();
    alert('Goldmine verbessert! Goldproduktion erhöht.');
  } else {
    alert('Nicht genug Gold für Upgrade!');
  }
}

function generateGold() {
  // Jede Sekunde
  let mines = buildings.filter(b => b.type === 'goldmine').length;
  gold += mines * mineLevel;
  updateGoldDisplay();
}

setInterval(generateGold, 1000);
