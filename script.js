const drawBtn = document.getElementById("drawBtn");
const spinner = document.getElementById("spinner");
const resultBox = document.getElementById("resultBox");
const popup = document.getElementById("popup");
const ting = document.getElementById("ting");
const cheer = document.getElementById("cheer");

drawBtn.addEventListener("click", () => {
  const raw = document.getElementById("nameInput").value.trim();
  const prize = document.getElementById("prizeName").value;
  const count = parseInt(document.getElementById("winnerCount").value);

  if (!raw || !prize || isNaN(count)) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  let entries = raw.split("\n").map((line, i) => {
    if (line.includes("-")) {
      const [code, name] = line.split("-");
      return { code: code.trim(), name: name.trim() };
    } else {
      return { code: String(Math.floor(1000 + Math.random() * 9000)), name: line.trim() };
    }
  });

  if (entries.length < count) {
    alert("Không đủ người để quay!");
    return;
  }

  entries = entries.sort(() => 0.5 - Math.random());
  let duration = Math.random() * 5000 + 5000;
  let elapsed = 0;
  let i = 0;
  let interval = 80;

  const spin = setInterval(() => {
    const current = entries[i % entries.length];
    spinner.textContent = `${current.code} – ${current.name}`;
    i++;
    elapsed += interval;
    if (elapsed >= duration) {
      clearInterval(spin);
      const winners = entries.slice(0, count);
      showResult(prize, winners);
    }
  }, interval);
});

function showResult(prize, winners) {
  const namesPopup = winners.map(w => `${w.code} – ${w.name}`).join('<br>');
  popup.innerHTML = `🎉 ${prize}<br><br>${namesPopup}`;
  popup.classList.remove("hidden");

setTimeout(() => {
  popup.classList.add("hidden");
}, 5000);

spinner.textContent = `${winners[0].code} – ${winners[0].name}`;


  ting.play();
  cheer.play();

  confetti({
    particleCount: 200,
    spread: 90,
    origin: { y: 0.6 }
  });

  let html = `<h2>🎁 ${prize}</h2><ul>`;
  winners.forEach(w => {
    html += `<li>${w.code} – ${w.name}</li>`;
  });
  html += `</ul>`;
  resultBox.innerHTML += html;

  let history = JSON.parse(localStorage.getItem("drawResults") || "[]");
  history.push({ prize, winners });
  localStorage.setItem("drawResults", JSON.stringify(history));
}

function clearResults() {
  localStorage.removeItem("drawResults");
  resultBox.innerHTML = "";
  spinner.textContent = "Sẵn sàng quay...";
}
