function startDraw() {
  const names = document.getElementById("nameInput").value.trim().split('\n');
  const prize = document.getElementById("prizeName").value;
  const count = parseInt(document.getElementById("winnerCount").value);
  if (names.length === 0 || prize === "" || isNaN(count)) return alert("Vui lòng nhập đầy đủ!");

  const shuffled = names.sort(() => 0.5 - Math.random());
  const winners = shuffled.slice(0, count);
  const resultBox = document.getElementById("resultBox");

  const result = {
    prize: prize,
    winners: winners
  };

  // Lưu vào localStorage
  let history = JSON.parse(localStorage.getItem("drawResults") || "[]");
  history.push(result);
  localStorage.setItem("drawResults", JSON.stringify(history));

  resultBox.innerHTML += `<h2>${prize}</h2><ul>` +
    winners.map(name => `<li>${name}</li>`).join('') + `</ul>`;
}

function clearResults() {
  localStorage.removeItem("drawResults");
  document.getElementById("resultBox").innerHTML = "";
}
