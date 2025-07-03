const drawBtn = document.getElementById("drawBtn");
const nameInput = document.getElementById("nameInput");
const prizeInput = document.getElementById("prizeName");
const winnerCountInput = document.getElementById("winnerCount");
const numberRow = document.getElementById("numberRow");
const prizeLabel = document.getElementById("prizeLabel");
const winnerPopup = document.getElementById("winnerPopup");
const confirmBtn = document.getElementById("confirmBtn");
const retryBtn = document.getElementById("retryBtn");
const resultActions = document.getElementById("resultActions");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const cheer = document.getElementById("cheer");
const ting = document.getElementById("ting");
const spinMusic = document.getElementById("spinMusic");

let currentWinners = [];
let currentPrize = '';
let spinning = false;

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("drawResults") || "[]");
  historyList.innerHTML = history.map((item, idx) => {
    const names = item.winners.map(w => `${w.code} – ${w.name}`).join(', ');
    return `<li><b>${item.prize}</b>: ${names}</li>`;
  }).join('');
}

function showPopup(prize, winners) {
  const namesPopup = winners.map(w => `${w.code} – ${w.name}`).join('<br>');
  winnerPopup.innerHTML = `🎉 ${prize}<br><br>${namesPopup}`;
  winnerPopup.classList.remove("hidden");
  setTimeout(() => {
    winnerPopup.classList.add("hidden");
  }, 4000);
}

function showNumbers(winners) {
  numberRow.innerHTML = '';
  const code = winners[0].code.padStart(6, '0');
  for (let i = 0; i < code.length; i++) {
    const div = document.createElement('div');
    div.className = 'number-box';
    div.textContent = code[i];
    numberRow.appendChild(div);
  }
  numberRow.style.display = '';
}

drawBtn.addEventListener("click", () => {
  if (spinning) return;
  const raw = nameInput.value.trim();
  const prize = prizeInput.value.trim();
  const count = parseInt(winnerCountInput.value);
  if (!raw || !prize || isNaN(count) || count < 1) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }
  let entries = raw.split("\n").map(line => {
    if (line.includes("-")) {
      const [code, name] = line.split("-");
      return { code: code.trim(), name: name.trim() };
    } else {
      return { code: String(Math.floor(100000 + Math.random() * 900000)), name: line.trim() };
    }
  }).filter(e => e.name);
  if (entries.length < count) {
    alert("Không đủ người để quay!");
    return;
  }
  entries = entries.sort(() => 0.5 - Math.random());
  let duration = Math.random() * 2000 + 2000;
  let elapsed = 0;
  let i = 0;
  let interval = 60;
  spinning = true;
  numberRow.style.display = '';
  prizeLabel.style.display = '';
  prizeLabel.textContent = prize;
  resultActions.style.display = 'none';
  winnerPopup.classList.add('hidden');
  function spin() {
    spinMusic.currentTime = 0;
    spinMusic.play();
    const current = entries[i % entries.length];
    showNumbers([current]);
    i++;
    elapsed += interval;
    if (elapsed < duration) {
      setTimeout(spin, interval);
    } else {
      spinMusic.pause();
      spinMusic.currentTime = 0;
      currentWinners = entries.slice(0, count);
      currentPrize = prize;
      showNumbers([currentWinners[0]]);
      showPopup(prize, currentWinners);
      ting.play();
      cheer.play();
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      resultActions.style.display = '';
      spinning = false;
    }
  }
  spin();
});

confirmBtn.addEventListener('click', () => {
  if (!currentWinners.length) return;
  let history = JSON.parse(localStorage.getItem("drawResults") || "[]");
  history.push({ prize: currentPrize, winners: currentWinners });
  localStorage.setItem("drawResults", JSON.stringify(history));
  renderHistory();
  numberRow.style.display = 'none';
  prizeLabel.style.display = 'none';
  resultActions.style.display = 'none';
  currentWinners = [];
  currentPrize = '';
});

retryBtn.addEventListener('click', () => {
  numberRow.style.display = 'none';
  prizeLabel.style.display = 'none';
  resultActions.style.display = 'none';
  currentWinners = [];
  currentPrize = '';
});

clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem("drawResults");
  renderHistory();
});

window.addEventListener('DOMContentLoaded', () => {
  renderHistory();
});
