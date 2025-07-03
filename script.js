const drawBtn = document.getElementById("drawBtn");
const spinner = document.getElementById("spinner");
const resultBox = document.getElementById("resultBox");

drawBtn.addEventListener("click", () => {
  const raw = document.getElementById("nameInput").value.trim();
  const prize = document.getElementById("prizeName").value;
  const count = parseInt(document.getElementById("winnerCount").value);

  if (!raw || !prize || isNaN(count)) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  const entries = raw.split("\n").map(line => {
    const [code, name] = line.split(" - ");
    return { code: code?.trim(), name: name?.trim() };
  }).filter(e => e.code && e.name);

  if (entries.length < count) {
    alert("Không đủ người để quay!");
    return;
  }

  let duration = Math.random() * 5000 + 5000; // 5–10s
  let interval = 100;
  let elapsed = 0;

  const shuffled = [...entries].sort(() => 0.5 - Math.random());
  let i = 0;

  const spin = setInterval(() => {
    const current = shuffled[i % shuffled.length];
    spinner.textContent = `${current.code} – ${current.name}`;
    i++;
    elapsed += interval;
    if (elapsed >= duration) {
      clearInterval(spin);
      const winners = shuffled.slice(0, count);
      showResult(prize, winners);
    }
  }, interval);
});

function showResult(prize, winners) {
  let html = `<h2>🎁 ${prize}</h2><ul>`;
  winners.forEach(w => {
    html += `<li>${w.code} – ${w.name}</li>`;
  });
  html += `</ul>`;
  resultBox.innerHTML += html;

  // Lưu vào localStorage
  const history = JSON.parse(localStorage.getItem("drawResults") || "[]");
  history.push({ prize, winners });
  localStorage.setItem("drawResults", JSON.stringify(history));
}

function clearResults() {
  localStorage.removeItem("drawResults");
  resultBox.innerHTML = "";
  spinner.textContent = "";
}
