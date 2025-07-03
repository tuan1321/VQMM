const drawBtn = document.getElementById("drawBtn");
const registerBtn = document.getElementById("registerBtn");
const registerSection = document.getElementById("registerSection");
const registerName = document.getElementById("registerName");
const addBtn = document.getElementById("addBtn");
const closeRegisterBtn = document.getElementById("closeRegisterBtn");
const participantList = document.getElementById("participantList");
const numberRow = document.getElementById("numberRow");
const prizeLabel = document.getElementById("prizeLabel");
const medal = document.getElementById("medal");
const winnerName = document.getElementById("winnerName");
const winnerPopup = document.getElementById("winnerPopup");
const confirmBtn = document.getElementById("confirmBtn");
const retryBtn = document.getElementById("retryBtn");
const resultActions = document.getElementById("resultActions");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const cheer = document.getElementById("cheer");
const ting = document.getElementById("ting");
const spinMusic = document.getElementById("spinMusic");

let participants = JSON.parse(localStorage.getItem("participants") || "[]");
let currentWinners = [];
let spinning = false;
let prize = prizeLabel.textContent || "GIẢI BA";
let medalValue = medal.textContent || "3";

function saveParticipants() {
  localStorage.setItem("participants", JSON.stringify(participants));
}

function renderParticipants() {
  participantList.innerHTML = participants.length
    ? participants.map((p, idx) => `<span>${p.code} – ${p.name} <button onclick="removeParticipant(${idx})" style="background:none;border:none;color:#ffd700;cursor:pointer;">×</button></span>`).join('')
    : '<span style="opacity:0.7;">Chưa có người tham gia</span>';
}

window.removeParticipant = function(idx) {
  participants.splice(idx, 1);
  saveParticipants();
  renderParticipants();
};

addBtn.addEventListener('click', () => {
  const val = registerName.value.trim();
  if (!val) return;
  let code, name;
  if (val.includes("-")) {
    [code, name] = val.split("-").map(s => s.trim());
  } else {
    code = String(Math.floor(100000 + Math.random() * 900000));
    name = val;
  }
  if (!name) return;
  participants.push({ code, name });
  saveParticipants();
  renderParticipants();
  registerName.value = '';
});

registerBtn.addEventListener('click', () => {
  registerSection.style.display = '';
  renderParticipants();
});

closeRegisterBtn.addEventListener('click', () => {
  registerSection.style.display = 'none';
});

function showNumbers(code) {
  numberRow.innerHTML = '';
  code = code.padStart(6, '0');
  for (let i = 0; i < code.length; i++) {
    const div = document.createElement('div');
    div.className = 'number-box';
    div.textContent = code[i];
    numberRow.appendChild(div);
  }
}

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

drawBtn.addEventListener("click", () => {
  if (spinning) return;
  if (participants.length < 1) {
    alert("Chưa có người tham gia!");
    return;
  }
  let count = 1; // Có thể cho chọn số lượng nếu muốn
  let entries = [...participants];
  entries = entries.sort(() => 0.5 - Math.random());
  let duration = Math.random() * 2000 + 2000;
  let elapsed = 0;
  let i = 0;
  let interval = 60;
  spinning = true;
  function spin() {
    spinMusic.currentTime = 0;
    spinMusic.play();
    const current = entries[i % entries.length];
    showNumbers(current.code);
    winnerName.textContent = current.name;
    i++;
    elapsed += interval;
    if (elapsed < duration) {
      setTimeout(spin, interval);
    } else {
      spinMusic.pause();
      spinMusic.currentTime = 0;
      currentWinners = entries.slice(0, count);
      showNumbers(currentWinners[0].code);
      winnerName.textContent = currentWinners[0].name;
      showPopup(prize, currentWinners);
      ting.play();
      cheer.play();
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      // Lưu lịch sử
      let history = JSON.parse(localStorage.getItem("drawResults") || "[]");
      history.push({ prize, winners: currentWinners });
      localStorage.setItem("drawResults", JSON.stringify(history));
      renderHistory();
      spinning = false;
    }
  }
  spin();
});

confirmBtn.addEventListener('click', () => {
  if (!currentWinners.length) return;
  let history = JSON.parse(localStorage.getItem("drawResults") || "[]");
  history.push({ prize: prize, winners: currentWinners });
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
  renderParticipants();
  renderHistory();
  showNumbers('      ');
});
