// Nút chuyển giải

document.querySelector('.arrow.left').onclick = function() {
  // Xử lý chuyển giải về trước
  // TODO: Thay đổi nhãn giải thưởng
};
document.querySelector('.arrow.right').onclick = function() {
  // Xử lý chuyển giải về sau
  // TODO: Thay đổi nhãn giải thưởng
};
document.querySelector('.show-btn').onclick = function() {
  document.querySelector('.main-mode').style.display = 'none';
  document.querySelector('.draw-mode').style.display = 'flex';
  document.body.classList.add('draw-active');
  document.body.classList.remove('result-active');
  document.body.classList.add('hide-title-actions'); // Ẩn nút đổi màu và đổi tên
  
  // Đảm bảo dòng "Đang tìm người may mắn..." được ẩn khi bắt đầu
  const searchingDiv = document.querySelector('.draw-searching');
  if (searchingDiv) {
    searchingDiv.style.display = 'none';
  }
};
function showDrawMode() {
  document.querySelector('.main-mode').style.display = 'none';
  document.querySelector('.draw-mode').style.display = 'flex';
  document.body.classList.add('draw-active');
  document.body.classList.remove('result-active');
  document.body.classList.add('hide-title-actions'); // Ẩn nút đổi màu và đổi tên
}
function showResultMode() {
  document.body.classList.add('result-active');
  document.body.classList.add('hide-title-actions'); // Ẩn nút đổi màu và đổi tên
}
document.querySelector('.end-btn').onclick = function() {
  document.querySelector('.draw-mode').style.display = 'none';
  document.querySelector('.main-mode').style.display = 'block';
  document.body.classList.remove('draw-active');
  document.body.classList.remove('result-active');
  document.body.classList.remove('hide-title-actions'); // Hiện lại nút đổi màu và đổi tên
  
  // Ẩn dòng "Đang tìm người may mắn..." khi kết thúc
  const searchingDiv = document.querySelector('.draw-searching');
  if (searchingDiv) {
    searchingDiv.style.display = 'none';
  }
  // Hiện lại dòng "Nhấn nút Quay số để bắt đầu"
  const drawLabel = document.querySelector('.draw-label');
  if (drawLabel) {
    drawLabel.style.display = '';
  }
  const bgMusic = document.getElementById('bg-music');
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
};

// Modal đổi hình nền
const bgBtn = document.getElementById('bg-image-btn');
const bgModal = document.getElementById('bg-modal');
const bgClose = document.querySelector('.bg-modal-close');
const bgUpload = document.getElementById('bg-upload');
const bgDefaultBtn = document.querySelector('.bg-default-btn');
const bgPrevBtn = document.querySelector('.bg-prev-btn');

// Lưu trạng thái nền
let prevBg = '';
let currBg = window.getComputedStyle(document.body).background;
const defaultBg = 'linear-gradient(180deg, #0d2240 0%, #6a223a 100%)';

// Khôi phục nền từ localStorage nếu có
const savedBg = localStorage.getItem('currBg');
if (savedBg) {
  document.body.style.background = savedBg;
  currBg = savedBg;
}

bgBtn && (bgBtn.onclick = function() {
  bgModal.classList.remove('hidden');
});
bgClose && (bgClose.onclick = function() {
  bgModal.classList.add('hidden');
});
bgModal && (bgModal.onclick = function(e) {
  if (e.target === bgModal) bgModal.classList.add('hidden');
});

document.querySelector('.bg-upload-label').onclick = function() {
  bgUpload.click();
};

// Khi upload ảnh nền, tinh chỉnh để ảnh phù hợp khung trình chiếu
bgUpload && bgUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    document.body.style.backgroundImage = `url('${evt.target.result}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    localStorage.setItem('currBg', document.body.style.backgroundImage);
  };
  reader.readAsDataURL(file);
});

bgDefaultBtn && (bgDefaultBtn.onclick = function() {
  prevBg = currBg;
  document.body.style.background = defaultBg;
  currBg = defaultBg;
  localStorage.setItem('currBg', currBg);
  bgModal.classList.add('hidden');
});

bgPrevBtn && (bgPrevBtn.onclick = function() {
  if (prevBg) {
    const temp = currBg;
    document.body.style.background = prevBg;
    currBg = prevBg;
    prevBg = temp;
    localStorage.setItem('currBg', currBg);
    bgModal.classList.add('hidden');
  }
});

// Đổi tên sự kiện
const editTitleBtn = document.getElementById('edit-title-btn');
const eventTitleModal = document.getElementById('event-title-modal');
const eventTitleInput = document.getElementById('event-title-input');
const eventTitleForm = document.querySelector('.event-title-form');
const mainTitle = document.querySelector('.main-title');
const mainTitleText = document.querySelector('.main-title-text');

// Khôi phục tên sự kiện từ localStorage nếu có
const savedTitle = localStorage.getItem('eventTitle');
if (savedTitle) {
  mainTitleText.textContent = savedTitle;
}

editTitleBtn && (editTitleBtn.onclick = function() {
  eventTitleModal.classList.remove('hidden');
  eventTitleInput.value = mainTitleText.textContent.trim();
  setTimeout(() => eventTitleInput.focus(), 100);
});

eventTitleForm && eventTitleForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const newTitle = eventTitleInput.value.trim();
  if (newTitle) {
    mainTitleText.textContent = newTitle;
    localStorage.setItem('eventTitle', newTitle);
  }
  eventTitleModal.classList.add('hidden');
});

eventTitleModal && eventTitleModal.addEventListener('click', function(e) {
  if (e.target === eventTitleModal) eventTitleModal.classList.add('hidden');
}); 

// Prize Management Logic
(function() {
  const ICONS = ["💎", "🥇", "🥈", "🥉", "🏆", "🎖️", "🎁", "⭐", "🎯", "🎉", "🏅", "👑", "🦄", "🧧", "🎲", "🧿"];
  const leftArrows = document.querySelectorAll('.prize-select .arrow.left');
  const rightArrows = document.querySelectorAll('.prize-select .arrow.right');
  const prizeModal = document.getElementById('prize-modal');
  const prizeListDiv = document.querySelector('.prize-list');
  const addPrizeBtn = document.querySelector('.prize-add-btn');
  const closeBtn = document.querySelector('.prize-modal-close');
  const cancelBtn = document.querySelector('.prize-cancel-btn');
  const saveBtn = document.querySelector('.prize-save-btn');
  const defaultBtn = document.querySelector('.prize-default-btn');
  const modalFooter = document.querySelector('.prize-modal-footer');

  const DEFAULT_PRIZES = [
    {name: "GIẢI ĐẶC BIỆT", icon: "💎"},
    {name: "GIẢI NHẤT", icon: "🥇"},
    {name: "GIẢI NHÌ", icon: "🥈"},
    {name: "GIẢI BA", icon: "🥉"}
  ];
  let prizes = [];
  let currentPrizeIdx = 0;
  function loadPrizes() {
    const saved = localStorage.getItem('prizes');
    if (saved) {
      prizes = JSON.parse(saved);
      if (typeof prizes[0] === 'string') {
        prizes = prizes.map((name, i) => ({name, icon: ICONS[i % ICONS.length]}));
      }
    } else {
      prizes = [...DEFAULT_PRIZES];
    }
    if (!prizes.length) prizes = [...DEFAULT_PRIZES];
  }
  function savePrizes() {
    localStorage.setItem('prizes', JSON.stringify(prizes));
  }
  function saveCurrentPrizeIdx() {
    localStorage.setItem('currentPrizeIdx', currentPrizeIdx);
  }
  function loadCurrentPrizeIdx() {
    const idx = parseInt(localStorage.getItem('currentPrizeIdx'), 10);
    if (!isNaN(idx) && idx >= 0 && idx < prizes.length) {
      currentPrizeIdx = idx;
    } else {
      currentPrizeIdx = 0;
    }
  }

  function showModal() {
    renderPrizeList();
    prizeModal.classList.remove('hidden');
  }
  function hideModal() {
    prizeModal.classList.add('hidden');
  }
  /**
   * Bổ sung input cho mỗi giải: drawLimitPerTurn, maxWinners
   */
  function renderPrizeList() {
    prizeListDiv.innerHTML = '';
    // Thêm header cho các cột
    const header = document.createElement('div');
    header.className = 'prize-item prize-header';
    header.style.fontWeight = 'bold';
    header.style.background = '#ffe066';
    header.style.borderRadius = '8px';
    header.style.marginBottom = '6px';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'center';
    header.innerHTML = `
      <span style="display:inline-block;width:32px;text-align:center;flex-shrink:0;">Icon</span>
      <span style="display:inline-block;width:160px;text-align:center;">Tên giải</span>
      <span style="display:inline-block;width:90px;text-align:center;">Số người/lần</span>
      <span style="display:inline-block;width:90px;text-align:center;">Tổng số</span>
      <span style="display:inline-block;width:32px;text-align:center;"></span>
    `;
    prizeListDiv.appendChild(header);
    prizes.forEach((prize, idx) => {
      const div = document.createElement('div');
      div.className = 'prize-item';
      // Icon
      const iconSpan = document.createElement('span');
      iconSpan.className = 'prize-icon';
      iconSpan.textContent = prize.icon || ICONS[idx % ICONS.length];
      iconSpan.title = 'Click để đổi icon';
      iconSpan.style.display = 'inline-block';
      iconSpan.style.width = '32px';
      iconSpan.style.textAlign = 'center';
      iconSpan.onclick = () => {
        let curIdx = ICONS.indexOf(prizes[idx].icon);
        prizes[idx].icon = ICONS[(curIdx + 1) % ICONS.length];
        iconSpan.textContent = prizes[idx].icon;
      };
      div.appendChild(iconSpan);
      // Tên giải
      const input = document.createElement('input');
      input.type = 'text';
      input.value = prize.name;
      input.placeholder = 'Tên giải';
      input.style.width = '160px';
      input.style.textAlign = 'center';
      input.addEventListener('input', e => {
        prizes[idx].name = e.target.value;
      });
      div.appendChild(input);
      // Số người quay mỗi lần
      const drawLimitInput = document.createElement('input');
      drawLimitInput.type = 'number';
      drawLimitInput.min = 1;
      drawLimitInput.value = prize.drawLimitPerTurn || 1;
      drawLimitInput.placeholder = 'Số người/lần';
      drawLimitInput.title = 'Số người quay mỗi lần';
      drawLimitInput.style.width = '90px';
      drawLimitInput.style.textAlign = 'center';
      drawLimitInput.addEventListener('input', e => {
        prizes[idx].drawLimitPerTurn = Math.max(1, parseInt(e.target.value) || 1);
      });
      div.appendChild(drawLimitInput);
      // Tổng số người đạt giải
      const maxWinnersInput = document.createElement('input');
      maxWinnersInput.type = 'number';
      maxWinnersInput.min = 0;
      maxWinnersInput.value = prize.maxWinners || 0;
      maxWinnersInput.placeholder = 'Tổng số';
      maxWinnersInput.title = 'Tổng số người đạt giải (0 = không giới hạn)';
      maxWinnersInput.style.width = '90px';
      maxWinnersInput.style.textAlign = 'center';
      maxWinnersInput.addEventListener('input', e => {
        prizes[idx].maxWinners = Math.max(0, parseInt(e.target.value) || 0);
      });
      div.appendChild(maxWinnersInput);
      // Xóa
      const delBtn = document.createElement('button');
      delBtn.className = 'prize-delete-btn';
      delBtn.textContent = 'X';
      delBtn.title = 'Xóa giải';
      delBtn.style.width = '32px';
      delBtn.onclick = () => {
        prizes.splice(idx, 1);
        if (currentPrizeIdx >= prizes.length) currentPrizeIdx = prizes.length - 1;
        renderPrizeList();
      };
      div.appendChild(delBtn);
      prizeListDiv.appendChild(div);
    });
  }
  // Prize label click (chỉ ở main-mode)
  const mainPrizeLabel = document.querySelector('.prize-label');
  mainPrizeLabel && mainPrizeLabel.addEventListener('click', showModal);
  closeBtn.addEventListener('click', hideModal);
  cancelBtn.addEventListener('click', hideModal);
  prizeModal.addEventListener('click', function(e) {
    if (e.target === prizeModal) hideModal();
  });
  addPrizeBtn.addEventListener('click', function() {
    prizes.push({name: '', icon: ICONS[prizes.length % ICONS.length]});
    renderPrizeList();
  });
  saveBtn.addEventListener('click', function() {
    prizes = prizes.filter(p => p.name.trim() !== '');
    if (prizes.length === 0) prizes = [...DEFAULT_PRIZES];
    if (currentPrizeIdx >= prizes.length) currentPrizeIdx = prizes.length - 1;
    savePrizes();
    saveCurrentPrizeIdx();
    updateAllPrizeDisplays();
    hideModal();
  });
  defaultBtn.addEventListener('click', function() {
    prizes = [...DEFAULT_PRIZES];
    currentPrizeIdx = 0;
    saveCurrentPrizeIdx();
    renderPrizeList();
  });
  // Chuyển giải trái/phải cho tất cả các bộ nút
  leftArrows.forEach(btn => {
    btn.addEventListener('click', function() {
      if (prizes.length === 0) return;
      currentPrizeIdx = (currentPrizeIdx - 1 + prizes.length) % prizes.length;
      saveCurrentPrizeIdx();
      updateAllPrizeDisplays();
    });
  });
  rightArrows.forEach(btn => {
    btn.addEventListener('click', function() {
      if (prizes.length === 0) return;
      currentPrizeIdx = (currentPrizeIdx + 1) % prizes.length;
      saveCurrentPrizeIdx();
      updateAllPrizeDisplays();
    });
  });
  // Khi chuyển chế độ, cập nhật giải thưởng đang chọn
  document.querySelector('.show-btn').addEventListener('click', function() {
    updateAllPrizeDisplays();
  });
  document.querySelector('.end-btn').addEventListener('click', function() {
    updateAllPrizeDisplays();
  });
  // Khởi tạo
  loadPrizes();
  loadCurrentPrizeIdx();
  updateAllPrizeDisplays();
})(); 

// Đảm bảo hàm updateAllPrizeDisplays ở phạm vi toàn cục
function updateAllPrizeDisplays() {
  const prizeLabels = document.querySelectorAll('.prize-label');
  const prizeIcons = document.querySelectorAll('.prize-label-icon');
  const prizeCounts = document.querySelectorAll('.prize-count-num');
  const badgeSpans = document.querySelectorAll('.draw-badge-glow span, .badge span');
  let prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  let currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx') || '0', 10);
  if (isNaN(currentPrizeIdx) || currentPrizeIdx < 0) currentPrizeIdx = 0;
  let prize = prizes[currentPrizeIdx];
  prizeLabels.forEach(label => { label.textContent = prize?.name || ''; });
  prizeIcons.forEach(icon => { icon.textContent = prize?.icon || ''; });
  // Cập nhật số người đã đạt giải cho tất cả count-num
  let winners = JSON.parse(localStorage.getItem('winners') || '[]');
  let count = winners.filter(w => w.prize === prize?.name).length;
  prizeCounts.forEach(countEl => { countEl.textContent = count; });
  // Cập nhật icon cho badge ở cả main-mode và draw-mode
  badgeSpans.forEach(badge => { badge.textContent = prize?.icon || ''; });
}

// === BẮT ĐẦU LOẠI BỎ HIỆU ỨNG CŨ ===
// Đã loại bỏ các function: startDrawRandom, stopDrawRandom, slowDownAndStopDraw, và các hiệu ứng slot cũ
// === KẾT THÚC LOẠI BỎ HIỆU ỨNG CŨ ===

// Hiển thị màn hình công bố kết quả
function animateWinnerName(code, name) {
  const container = document.getElementById('result-winner-name');
  container.innerHTML = '';
  const displayText = code + ' - ' + name;
  [...displayText].forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'result-winner-char';
    span.style.animationDelay = (i * 0.08) + 's';
    span.style.opacity = '1';
    if (char === ' ') {
      span.style.display = 'inline-block';
      span.style.width = '0.7em';
      span.innerHTML = '&nbsp;';
    }
    container.appendChild(span);
  });
}
// Confetti effect
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  const confettiCount = 180;
  const confetti = [];
  const colors = ['#ffd600','#ff4081','#40c4ff','#69f0ae','#fff','#ffab00','#e040fb'];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: 6 + Math.random() * 8,
      d: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltAngleInc: 0.05 + Math.random() * 0.07
    });
  }
  let frame = 0;
  let running = true;
  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < confetti.length; i++) {
      let c = confetti[i];
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.r, c.r/2, c.tilt, 0, 2 * Math.PI);
      ctx.fillStyle = c.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    update();
    frame++;
    if (frame < 450) {
      requestAnimationFrame(draw);
    } else {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }
  function update() {
    for (let i = 0; i < confetti.length; i++) {
      let c = confetti[i];
      c.y += c.d + Math.sin(frame/10 + i);
      c.x += Math.sin(frame/15 + i) * 1.5;
      c.tilt += c.tiltAngleInc;
      if (c.y > canvas.height + 20) {
        c.y = Math.random() * -20;
        c.x = Math.random() * canvas.width;
      }
    }
  }
  draw();
}

// Paper confetti effect from bottom corners
function launchFireworks() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');

  const confetti = [];
  const colors = ['#ffd600', '#ff4081', '#40c4ff', '#69f0ae', '#fff', '#ffab00', '#e040fb', '#ff6b35', '#4ecdc4', '#45b7d1'];

  function createConfettiFromLeft() {
    const x = 0;
    const y = canvas.height;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6;
    const velocity = 16 + Math.random() * 10;
    return {
      x: x,
      y: y,
      vx: Math.cos(angle) * velocity,
      vy: -Math.sin(angle) * velocity,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 10 + Math.random() * 16,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      type: Math.random() < 0.5 ? 'square' : 'circle',
      life: 1,
      decay: 0.005 + Math.random() * 0.002
    };
  }
  function createConfettiFromRight() {
    const x = canvas.width;
    const y = canvas.height;
    const angle = 3 * Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6;
    const velocity = 16 + Math.random() * 10;
    return {
      x: x,
      y: y,
      vx: Math.cos(angle) * velocity,
      vy: -Math.sin(angle) * velocity,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 10 + Math.random() * 16,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      type: Math.random() < 0.5 ? 'square' : 'circle',
      life: 1,
      decay: 0.005 + Math.random() * 0.002
    };
  }

  let frame = 0;
  let running = true;
  const maxFrames = 83; // ~5s ở 60fps

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Giảm dần số confetti mới ở các frame cuối
    let confettiPerFrame = 6;
    if (frame > maxFrames * 0.7) confettiPerFrame = 4;
    if (frame > maxFrames * 0.85) confettiPerFrame = 2;
    if (frame < maxFrames) {
      for (let k = 0; k < confettiPerFrame; k++) {
        confetti.push(createConfettiFromLeft());
        confetti.push(createConfettiFromRight());
      }
    }

    for (let i = confetti.length - 1; i >= 0; i--) {
      const piece = confetti[i];
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.globalAlpha = piece.life;
      if (piece.type === 'square') {
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size/2, -piece.size/2, piece.size, piece.size);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-piece.size/2, -piece.size/2, piece.size, piece.size);
      } else {
        ctx.fillStyle = piece.color;
        ctx.beginPath();
        ctx.arc(0, 0, piece.size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += 0.09;
      piece.rotation += piece.rotationSpeed;
      piece.life -= piece.decay;
      piece.vx += (Math.random() - 0.5) * 0.2;
      if (piece.life <= 0 || piece.y > canvas.height + 50) {
        confetti.splice(i, 1);
      }
    }
    frame++;
    if (frame < maxFrames || confetti.length > 0) {
      requestAnimationFrame(draw);
    } else {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }
  draw();
}

// Tăng hiệu ứng nổi bật cho tên người may mắn
const style = document.createElement('style');
style.innerHTML = `
#result-winner-name {
  position: relative;
  z-index: 1000;
  padding: 12px 32px;
  border-radius: 18px;
  background: rgba(34,34,58,0.7);
  box-shadow: 0 0 32px 8px #ffd60099, 0 2px 24px #000a;
  border: 3px solid #ffd600;
  filter: drop-shadow(0 0 16px #ffd600cc);
}
`;
document.head.appendChild(style);

// --- Cập nhật showResultScreen để hiển thị danh sách nhiều người may mắn ---
function showResultScreen(pickedList, prizeObj) {
  document.querySelector('.draw-mode').style.display = 'none';
  const resultMode = document.querySelector('.result-mode');
  resultMode.style.display = 'flex';
  const eventTitle = localStorage.getItem('eventTitle') || 'LUCKY DRAW SOFTWARE';
  document.getElementById('result-event-title').textContent = eventTitle;
  document.getElementById('result-prize-label').textContent = prizeObj?.name || '';
  document.getElementById('result-badge').textContent = prizeObj?.icon || '';
  const resultCards = resultMode.querySelector('.result-cards');
  resultCards.innerHTML = '';
  // Hiển thị slot kết quả theo window.currentDrawCode6
  let code6 = window.currentDrawCode6 || (pickedList && pickedList[0] && pickedList[0].code6) || '000000';
  for (let i = 0; i < 6; i++) {
    const div = document.createElement('div');
    div.className = 'draw-card';
    div.style.opacity = '1';
    div.innerHTML = `<span style='font-size:2.2em;color:#fff;font-weight:bold;'>${code6[i] || '0'}</span>`;
    resultCards.appendChild(div);
  }
  // Hiển thị tên người trúng
  let winnerName = (window.currentDrawWinner && window.currentDrawWinner.name) || (pickedList && pickedList[0] && pickedList[0].name) || '';
  animateWinnerName(code6, winnerName);
  document.getElementById('result-winner-name').style.display = '';
  playMusic(resultMusic);
  setTimeout(() => { launchFireworks(); }, 300);
  const extraTitle = resultMode.querySelector('.main-title');
  if (extraTitle) extraTitle.style.display = 'none';
  document.body.classList.remove('draw-active');
  document.body.classList.add('result-active');
  document.querySelectorAll('.draw-card').forEach(card => card.classList.remove('lucky-highlight', 'lucky-blink'));
}
// Nút xác nhận/quay lại
const resultConfirmBtn = document.querySelector('.result-confirm-btn');
const resultBackBtn = document.querySelector('.result-back-btn');
if (resultConfirmBtn) {
  resultConfirmBtn.onclick = function() {
    // Lấy mã số và tên vừa trúng
    const codeEls = document.querySelectorAll('.result-cards .draw-card span');
    let code6 = '';
    codeEls.forEach(el => { code6 += el.textContent; });
    let luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
    let luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
    let prize = document.getElementById('result-prize-label').textContent || '';
    let name = document.getElementById('result-winner-name').textContent || '';
    // Tìm và loại khỏi danh sách
    let idx = luckyCodes.findIndex(c => c.padStart(6, '0') === code6);
    if (idx !== -1) {
      luckyCodes.splice(idx, 1);
      if (idx < luckyNames.length) luckyNames.splice(idx, 1);
      localStorage.setItem('luckyCodes', JSON.stringify(luckyCodes));
      localStorage.setItem('luckyNames', JSON.stringify(luckyNames));
    }
    // Lưu vào danh sách winners
    let winners = JSON.parse(localStorage.getItem('winners') || '[]');
    winners.push({ code: code6, name: name, prize: prize });
    localStorage.setItem('winners', JSON.stringify(winners));
    // Cập nhật số người đã đạt giải
    updateWinnerCount(prize);
    // Quay lại trang draw-mode để bắt đầu quay tiếp
    document.querySelector('.result-mode').style.display = 'none';
    document.querySelector('.draw-mode').style.display = 'flex';
    drawBtn.style.display = '';
    document.body.classList.remove('result-active');
    document.body.classList.add('draw-active');
    document.querySelector('.draw-mode').classList.remove('drawing');
    updateDrawCardsWithPrizeIcon();
  };
}
if (resultBackBtn) {
  resultBackBtn.onclick = function() {
    document.querySelector('.result-mode').style.display = 'none';
    document.querySelector('.draw-mode').style.display = 'flex';
    drawBtn.style.display = '';
    document.body.classList.remove('result-active');
    document.body.classList.add('draw-active');
    document.querySelector('.draw-mode').classList.remove('drawing');
    updateDrawCardsWithPrizeIcon(); // Reset các slot về icon giải thưởng
    // Ẩn tên người trúng
    const nameDiv = document.getElementById('draw-winner-name');
    if (nameDiv) nameDiv.innerHTML = '';
    // Ẩn nút chốt nếu đang hiện
    const lockBtn = document.querySelector('.lock-btn');
    if (lockBtn) lockBtn.style.display = 'none';
    // Ẩn nút xác nhận/quay lại nếu có
    const btnWrap = document.getElementById('draw-confirm-btn-wrap');
    if (btnWrap) btnWrap.style.display = 'none';
  };
}

// Ẩn hoặc loại bỏ phần hiển thị đã có X người đạt giải
function updateWinnerCount(prize) {
  let countDiv = document.getElementById('winner-count-info');
  if (countDiv) countDiv.style.display = 'none';
}

function updatePrizeCount(prize) {
  let winners = JSON.parse(localStorage.getItem('winners') || '[]');
  let count = winners.filter(w => w.prize === prize).length;
  let countNum = document.querySelector('.prize-count-num');
  if (countNum) countNum.textContent = count;
}
// Gọi updatePrizeCount khi chuyển giải hoặc xác nhận
(function() {
  // Prize Management Logic patch
  const prizeLabels = document.querySelectorAll('.prize-label');
  const leftArrows = document.querySelectorAll('.prize-select .arrow.left');
  const rightArrows = document.querySelectorAll('.prize-select .arrow.right');
  function getCurrentPrize() {
    let label = document.querySelector('.draw-mode .prize-label');
    return label ? label.textContent.trim() : '';
  }
  leftArrows.forEach(btn => {
    btn.addEventListener('click', function() {
      setTimeout(() => updatePrizeCount(getCurrentPrize()), 10);
    });
  });
  rightArrows.forEach(btn => {
    btn.addEventListener('click', function() {
      setTimeout(() => updatePrizeCount(getCurrentPrize()), 10);
    });
  });
  // Khi load trang, cập nhật luôn
  document.addEventListener('DOMContentLoaded', function() {
    updatePrizeCount(getCurrentPrize());
  });
})();
// Sau khi xác nhận kết quả, cập nhật lại số lượng
if (resultConfirmBtn) {
  const oldHandler = resultConfirmBtn.onclick;
  resultConfirmBtn.onclick = function() {
    if (oldHandler) oldHandler();
    let prize = document.getElementById('result-prize-label').textContent || '';
    setTimeout(() => updatePrizeCount(prize), 10);
  };
}

// === LOGIC QUAY SỐ VÀ CHỐT MỚI ===
const drawBtn = document.querySelector('.draw-btn');
const lockBtn = document.querySelector('.lock-btn');
let slotIntervals = [];
let isSpinning = false;
let luckyCode = '';
let luckyName = '';

function setSlotNumber(card, num) {
  card.innerHTML = `<span style="font-size:3.5em;font-weight:bold;color:#fff;display:inline-block;width:100%;text-align:center;font-family:'Arial Black','Arial',sans-serif;">${num}</span>`;
}

function startSlotSpin() {
  const drawCards = document.querySelectorAll('.draw-card');
  slotIntervals = [];
  isSpinning = true;
  drawCards.forEach((card, idx) => {
    slotIntervals[idx] = setInterval(() => {
      setSlotNumber(card, Math.floor(Math.random() * 10));
    }, 60);
    card.classList.remove('lucky-highlight', 'lucky-blink');
  });
  // Ẩn tên người trúng nếu có
  const nameDiv = document.getElementById('draw-winner-name');
  if (nameDiv) nameDiv.textContent = '';
}

// === HIỂN THỊ NÚT XÁC NHẬN VÀ QUAY LẠI SAU KHI QUAY ===
function showConfirmButtons(code, name, prize) {
  let btnWrap = document.getElementById('draw-confirm-btn-wrap');
  if (!btnWrap) {
    btnWrap = document.createElement('div');
    btnWrap.id = 'draw-confirm-btn-wrap';
    btnWrap.style = 'display:flex;gap:18px;margin:24px auto 0 auto;justify-content:center;';
    document.querySelector('.draw-mode').appendChild(btnWrap);
  }
  btnWrap.innerHTML = `
    <button id="draw-confirm-btn" style="background:#ffd600;color:#22223a;font-weight:bold;padding:16px 48px;border:none;border-radius:10px;font-size:1.3rem;box-shadow:0 2px 12px #ffd60055;">XÁC NHẬN</button>
    <button id="draw-back-btn" style="background:#b44c4c;color:#fff;font-weight:bold;padding:16px 48px;border:none;border-radius:10px;font-size:1.3rem;box-shadow:0 2px 12px #ffd60055;">QUAY LẠI</button>
  `;
  btnWrap.style.display = '';
  document.getElementById('draw-confirm-btn').onclick = function() {
    // Lưu vào winners
    let winners = JSON.parse(localStorage.getItem('winners') || '[]');
    winners.push({ code, name, prize });
    localStorage.setItem('winners', JSON.stringify(winners));
    // Ẩn nút, reset giao diện về quay số
    btnWrap.style.display = 'none';
    document.querySelector('.draw-mode').classList.remove('drawing');
    document.querySelector('.draw-mode').classList.add('not-picked');
    document.getElementById('draw-winner-name').innerHTML = '';
    document.querySelectorAll('.draw-card').forEach(card => card.classList.remove('lucky-highlight', 'lucky-blink'));
    // KHÔNG hiện lại nút quay số ở đây
    document.querySelector('.lock-btn').style.display = 'none';
  };
  document.getElementById('draw-back-btn').onclick = function() {
    // Không lưu, chỉ reset giao diện về quay số
    btnWrap.style.display = 'none';
    document.querySelector('.draw-mode').classList.remove('drawing');
    document.querySelector('.draw-mode').classList.add('not-picked');
    document.getElementById('draw-winner-name').innerHTML = '';
    document.querySelectorAll('.draw-card').forEach(card => card.classList.remove('lucky-highlight', 'lucky-blink'));
    document.querySelector('.lock-btn').style.display = 'none';
    // KHÔNG hiện lại nút quay số ở đây
  };
}

// Sửa lại stopSlotSpinWithLucky: sau khi quay xong, chuyển sang màn hình kết quả
function stopSlotSpinWithLucky(code, name) {
  stopRollingAudio(); // Dừng rolling.mp3 ngay khi bấm CHỐT
  playSound('slotStop'); // Phát slot-stop.mp3 lặp lại liên tục
  const drawCards = document.querySelectorAll('.draw-card');
  code = (code || '').slice(0, drawCards.length);
  const slotCount = drawCards.length;
  const slotDelay = slotCount > 0 ? 4000 / slotCount : 400; // ms
  drawCards.forEach((card, idx) => {
    clearInterval(slotIntervals[idx]);
    slotIntervals[idx] = setInterval(() => {
      setSlotNumber(card, Math.floor(Math.random() * 10));
    }, 20);
  });
  setTimeout(() => {
    function stopNext(i) {
      if (i >= drawCards.length) {
        stopSlotStopAudio(); // Dừng slot-stop.mp3 khi tất cả slot đã dừng
        let codeOnSlot = '';
        drawCards.forEach(card => {
          const span = card.querySelector('span');
          let val = span ? span.textContent : '';
          if (!/^[0-9]$/.test(val)) val = '';
          codeOnSlot += val;
        });
        window.currentDrawCode6 = codeOnSlot;
        window.currentDrawWinner = { code: codeOnSlot, name: name, code6: codeOnSlot, prize: getCurrentPrize() };
        playSound('result'); // Âm thanh công bố kết quả
        showResultScreen([{ code6: codeOnSlot, name: name }], { name: getCurrentPrize(), icon: getCurrentPrizeIcon() });
        return;
      }
      clearInterval(slotIntervals[i]);
      setSlotNumber(drawCards[i], code[i] || '');
      drawCards[i].classList.add('lucky-highlight');
      setTimeout(() => {
        drawCards[i].classList.remove('lucky-highlight');
        stopNext(i + 1);
      }, slotDelay);
    }
    stopNext(0);
  }, 0); // Không cần delay tổng, delay chia đều cho từng slot
}

// Hàm lấy tên giải và icon hiện tại
function getCurrentPrize() {
  const prizeLabel = document.querySelector('.draw-mode .prize-label');
  return prizeLabel ? prizeLabel.textContent.trim() : '';
}
function getCurrentPrizeIcon() {
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[{"name":"GIẢI ĐẶC BIỆT","icon":"💎"},{"name":"GIẢI NHẤT","icon":"🥇"},{"name":"GIẢI NHÌ","icon":"🥈"},{"name":"GIẢI BA","icon":"🥉"}]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx'), 10) || 0;
  return prizes[currentPrizeIdx]?.icon || '⭐';
}

if (drawBtn && lockBtn) {
  drawBtn.addEventListener('click', function() {
    if (isSpinning) return;
    drawBtn.style.display = 'none';
    lockBtn.style.display = '';
    startSlotSpin();
  });
  lockBtn.addEventListener('click', function() {
    if (!isSpinning) return;
    drawBtn.style.display = 'none'; // Ẩn nút quay số ngay khi bấm chốt
    // Lấy danh sách mã số và tên
    let luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
    let luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
    // Chọn ngẫu nhiên 1 mã số
    let idx = Math.floor(Math.random() * luckyCodes.length);
    luckyCode = (luckyCodes[idx] || '').padStart(6, '0');
    luckyName = luckyNames[idx] || '';
    stopSlotSpinWithLucky(luckyCode, luckyName);
    isSpinning = false;
    lockBtn.style.display = 'none';
    // drawBtn.style.display = ''; // KHÔNG hiện lại nút quay số ở đây
  });
}
// ==== Main Title Color Picker ====
(function() {
  const dot = document.querySelector('.dot');
  const colorInput = document.getElementById('titleColorPicker');
  const mainTitle = document.querySelector('.main-title');
  // Load màu từ localStorage
  function applyTitleColor() {
    const color = localStorage.getItem('mainTitleColor');
    if (color) {
      mainTitle.style.color = color;
      dot.style.background = color;
    } else {
      mainTitle.style.color = '';
      dot.style.background = '#e0e0e0';
    }
  }
  dot.addEventListener('click', function() {
    colorInput.click();
  });
  colorInput.addEventListener('input', function() {
    const color = colorInput.value;
    mainTitle.style.color = color;
    dot.style.background = color;
    localStorage.setItem('mainTitleColor', color);
  });
  applyTitleColor();
})(); 

// ==== Draw Cards Show Prize Icon Instead of Number ====
// Hiển thị icon giải thưởng trong các ô draw-card khi draw-mode chưa quay
function updateDrawCardsWithPrizeIcon() {
  // Lấy icon của giải hiện tại
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[{"name":"GIẢI ĐẶC BIỆT","icon":"💎"},{"name":"GIẢI NHẤT","icon":"🥇"},{"name":"GIẢI NHÌ","icon":"🥈"},{"name":"GIẢI BA","icon":"🥉"}]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx'), 10) || 0;
  const icon = prizes[currentPrizeIdx]?.icon || '⭐';
  document.querySelectorAll('.draw-card').forEach(card => {
    card.innerHTML = `<span>${icon}</span>`;
    card.classList.remove('lucky-highlight', 'lucky-blink');
  });
}
// Gọi hàm này khi vào main-mode hoặc khi đổi giải
updateDrawCardsWithPrizeIcon();
document.querySelector('.show-btn').addEventListener('click', updateDrawCardsWithPrizeIcon);
document.querySelectorAll('.arrow.left, .arrow.right').forEach(btn => btn.addEventListener('click', updateDrawCardsWithPrizeIcon));
// Gọi hàm này khi vào draw-mode và result-mode
function observeDrawMode() {
  const main = document.querySelector('main');
  const observer = new MutationObserver(() => {
    if (main.classList.contains('draw-mode') || main.classList.contains('result-mode')) {
      updateDrawCardsWithPrizeIcon();
    }
  });
  observer.observe(main, { attributes: true, attributeFilter: ['class'] });
}
observeDrawMode(); 

// Music control
const bgMusic = document.getElementById('bg-music');
const spinMusic = document.getElementById('spin-music');
const resultMusic = document.getElementById('result-music');

function playMusic(music) {
  [bgMusic, spinMusic, resultMusic].forEach(m => { if (m && !m.paused) m.pause(); m && (m.currentTime = 0); });
  if (music) {
    music.currentTime = 0;
    music.play();
  }
}

// Biến toàn cục quản lý rolling audio
let rollingAudio = null;

function playSound(key) {
  const ids = {
    bg: 'bg-music',
    spinStart: 'spin-start',
    rolling: 'rolling',
    slotStop: 'slot-stop',
    result: 'result-fanfare',
    save: 'save',
    back: 'back'
  };
  const audio = document.getElementById(ids[key]);
  if (!audio) return;
  if (key === 'rolling') {
    if (!rollingAudio) rollingAudio = audio;
    rollingAudio.currentTime = 0;
    rollingAudio.loop = true;
    rollingAudio.play();
  } else if (key === 'slotStop') {
    if (!slotStopAudio) slotStopAudio = audio;
    slotStopAudio.currentTime = 0;
    slotStopAudio.loop = true;
    slotStopAudio.play();
  } else {
    audio.currentTime = 0;
    audio.play();
  }
}
function stopRollingAudio() {
  if (rollingAudio) {
    rollingAudio.pause();
    rollingAudio.currentTime = 0;
  }
}
function stopSlotStopAudio() {
  if (slotStopAudio) {
    slotStopAudio.pause();
    slotStopAudio.currentTime = 0;
  }
}

// Phát nhạc nền khi vào trang hoặc về draw-mode
window.addEventListener('DOMContentLoaded', function() {
  playSound('bg');
});

// Khi bấm nút quay số
if (drawBtn) {
  drawBtn.addEventListener('click', function() {
    playSound('spinStart');
    playSound('rolling'); // rolling.mp3 lặp lại liên tục
  });
}

// Trong stopSlotSpinWithLucky, dừng rolling khi bấm CHỐT, phát slotStop khi từng slot dừng, result khi công bố kết quả
function stopSlotSpinWithLucky(code, name) {
  stopRollingAudio(); // Dừng rolling.mp3 ngay khi bấm CHỐT
  playSound('slotStop'); // Phát slot-stop.mp3 lặp lại liên tục
  const drawCards = document.querySelectorAll('.draw-card');
  code = (code || '').slice(0, drawCards.length);
  const slotCount = drawCards.length;
  const slotDelay = slotCount > 0 ? 4000 / slotCount : 400; // ms
  drawCards.forEach((card, idx) => {
    clearInterval(slotIntervals[idx]);
    slotIntervals[idx] = setInterval(() => {
      setSlotNumber(card, Math.floor(Math.random() * 10));
    }, 20);
  });
  setTimeout(() => {
    function stopNext(i) {
      if (i >= drawCards.length) {
        stopSlotStopAudio(); // Dừng slot-stop.mp3 khi tất cả slot đã dừng
        let codeOnSlot = '';
        drawCards.forEach(card => {
          const span = card.querySelector('span');
          let val = span ? span.textContent : '';
          if (!/^[0-9]$/.test(val)) val = '';
          codeOnSlot += val;
        });
        window.currentDrawCode6 = codeOnSlot;
        window.currentDrawWinner = { code: codeOnSlot, name: name, code6: codeOnSlot, prize: getCurrentPrize() };
        playSound('result'); // Âm thanh công bố kết quả
        showResultScreen([{ code6: codeOnSlot, name: name }], { name: getCurrentPrize(), icon: getCurrentPrizeIcon() });
        return;
      }
      clearInterval(slotIntervals[i]);
      setSlotNumber(drawCards[i], code[i] || '');
      drawCards[i].classList.add('lucky-highlight');
      setTimeout(() => {
        drawCards[i].classList.remove('lucky-highlight');
        stopNext(i + 1);
      }, slotDelay);
    }
    stopNext(0);
  }, 0); // Không cần delay tổng, delay chia đều cho từng slot
}

// Khi xác nhận lưu kết quả
if (resultConfirmBtn) {
  resultConfirmBtn.onclick = function() {
    playSound('save');
    // Lấy mã số và tên vừa trúng
    const codeEls = document.querySelectorAll('.result-cards .draw-card span');
    let code6 = '';
    codeEls.forEach(el => { code6 += el.textContent; });
    let luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
    let luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
    let prize = document.getElementById('result-prize-label').textContent || '';
    let name = document.getElementById('result-winner-name').textContent || '';
    // Tìm và loại khỏi danh sách
    let idx = luckyCodes.findIndex(c => c.padStart(6, '0') === code6);
    if (idx !== -1) {
      luckyCodes.splice(idx, 1);
      if (idx < luckyNames.length) luckyNames.splice(idx, 1);
      localStorage.setItem('luckyCodes', JSON.stringify(luckyCodes));
      localStorage.setItem('luckyNames', JSON.stringify(luckyNames));
    }
    // Lưu vào danh sách winners
    let winners = JSON.parse(localStorage.getItem('winners') || '[]');
    winners.push({ code: code6, name: name, prize: prize });
    localStorage.setItem('winners', JSON.stringify(winners));
    // Cập nhật số người đã đạt giải
    updateWinnerCount(prize);
    // Quay lại trang draw-mode để bắt đầu quay tiếp
    document.querySelector('.result-mode').style.display = 'none';
    document.querySelector('.draw-mode').style.display = 'flex';
    drawBtn.style.display = '';
    document.body.classList.remove('result-active');
    document.body.classList.add('draw-active');
    document.querySelector('.draw-mode').classList.remove('drawing');
    updateDrawCardsWithPrizeIcon();
  };
}
if (resultBackBtn) {
  resultBackBtn.onclick = function() {
    playSound('back');
    document.querySelector('.result-mode').style.display = 'none';
    document.querySelector('.draw-mode').style.display = 'flex';
    drawBtn.style.display = '';
    document.body.classList.remove('result-active');
    document.body.classList.add('draw-active');
    document.querySelector('.draw-mode').classList.remove('drawing');
    updateDrawCardsWithPrizeIcon(); // Reset các slot về icon giải thưởng
    // Ẩn tên người trúng
    const nameDiv = document.getElementById('draw-winner-name');
    if (nameDiv) nameDiv.innerHTML = '';
    // Ẩn nút chốt nếu đang hiện
    const lockBtn = document.querySelector('.lock-btn');
    if (lockBtn) lockBtn.style.display = 'none';
    // Ẩn nút xác nhận/quay lại nếu có
    const btnWrap = document.getElementById('draw-confirm-btn-wrap');
    if (btnWrap) btnWrap.style.display = 'none';
  };
}

// Ẩn hoặc loại bỏ phần hiển thị đã có X người đạt giải
function updateWinnerCount(prize) {
  let countDiv = document.getElementById('winner-count-info');
  if (countDiv) countDiv.style.display = 'none';
}

function updatePrizeCount(prize) {
  let winners = JSON.parse(localStorage.getItem('winners') || '[]');
  let count = winners.filter(w => w.prize === prize).length;
  let countNum = document.querySelector('.prize-count-num');
  if (countNum) countNum.textContent = count;
}
// Gọi updatePrizeCount khi chuyển giải hoặc xác nhận
(function() {
  // Prize Management Logic patch
  const prizeLabels = document.querySelectorAll('.prize-label');
  const leftArrows = document.querySelectorAll('.prize-select .arrow.left');
  const rightArrows = document.querySelectorAll('.prize-select .arrow.right');
  function getCurrentPrize() {
    let label = document.querySelector('.draw-mode .prize-label');
    return label ? label.textContent.trim() : '';
  }
  leftArrows.forEach(btn => {
    btn.addEventListener('click', function() {
      setTimeout(() => updatePrizeCount(getCurrentPrize()), 10);
    });
  });
  rightArrows.forEach(btn => {
    btn.addEventListener('click', function() {
      setTimeout(() => updatePrizeCount(getCurrentPrize()), 10);
    });
  });
  // Khi load trang, cập nhật luôn
  document.addEventListener('DOMContentLoaded', function() {
    updatePrizeCount(getCurrentPrize());
  });
})(); 
// Sau khi xác nhận kết quả, cập nhật lại số lượng
if (resultConfirmBtn) {
  const oldHandler = resultConfirmBtn.onclick;
  resultConfirmBtn.onclick = function() {
    if (oldHandler) oldHandler();
    let prize = document.getElementById('result-prize-label').textContent || '';
    setTimeout(() => updatePrizeCount(prize), 10);
  };
}

// === LOGIC QUAY SỐ VÀ CHỐT MỚI ===


function setSlotNumber(card, num) {
  card.innerHTML = `<span style="font-size:3.5em;font-weight:bold;color:#fff;display:inline-block;width:100%;text-align:center;font-family:'Arial Black','Arial',sans-serif;">${num}</span>`;
}

function startSlotSpin() {
  const drawCards = document.querySelectorAll('.draw-card');
  slotIntervals = [];
  isSpinning = true;
  drawCards.forEach((card, idx) => {
    slotIntervals[idx] = setInterval(() => {
      setSlotNumber(card, Math.floor(Math.random() * 10));
    }, 60);
    card.classList.remove('lucky-highlight', 'lucky-blink');
  });
  // Ẩn tên người trúng nếu có
  const nameDiv = document.getElementById('draw-winner-name');
  if (nameDiv) nameDiv.textContent = '';
}

// === HIỂN THỊ NÚT XÁC NHẬN VÀ QUAY LẠI SAU KHI QUAY ===
function showConfirmButtons(code, name, prize) {
  let btnWrap = document.getElementById('draw-confirm-btn-wrap');
  if (!btnWrap) {
    btnWrap = document.createElement('div');
    btnWrap.id = 'draw-confirm-btn-wrap';
    btnWrap.style = 'display:flex;gap:18px;margin:24px auto 0 auto;justify-content:center;';
    document.querySelector('.draw-mode').appendChild(btnWrap);
  }
  btnWrap.innerHTML = `
    <button id="draw-confirm-btn" style="background:#ffd600;color:#22223a;font-weight:bold;padding:16px 48px;border:none;border-radius:10px;font-size:1.3rem;box-shadow:0 2px 12px #ffd60055;">XÁC NHẬN</button>
    <button id="draw-back-btn" style="background:#b44c4c;color:#fff;font-weight:bold;padding:16px 48px;border:none;border-radius:10px;font-size:1.3rem;box-shadow:0 2px 12px #ffd60055;">QUAY LẠI</button>
  `;
  btnWrap.style.display = '';
  document.getElementById('draw-confirm-btn').onclick = function() {
    // Lưu vào winners
    let winners = JSON.parse(localStorage.getItem('winners') || '[]');
    winners.push({ code, name, prize });
    localStorage.setItem('winners', JSON.stringify(winners));
    // Ẩn nút, reset giao diện về quay số
    btnWrap.style.display = 'none';
    document.querySelector('.draw-mode').classList.remove('drawing');
    document.querySelector('.draw-mode').classList.add('not-picked');
    document.getElementById('draw-winner-name').innerHTML = '';
    document.querySelectorAll('.draw-card').forEach(card => card.classList.remove('lucky-highlight', 'lucky-blink'));
    // KHÔNG hiện lại nút quay số ở đây
    document.querySelector('.lock-btn').style.display = 'none';
  };
  document.getElementById('draw-back-btn').onclick = function() {
    // Không lưu, chỉ reset giao diện về quay số
    btnWrap.style.display = 'none';
    document.querySelector('.draw-mode').classList.remove('drawing');
    document.querySelector('.draw-mode').classList.add('not-picked');
    document.getElementById('draw-winner-name').innerHTML = '';
    document.querySelectorAll('.draw-card').forEach(card => card.classList.remove('lucky-highlight', 'lucky-blink'));
    document.querySelector('.lock-btn').style.display = 'none';
    // KHÔNG hiện lại nút quay số ở đây
  };
}

// Sửa lại stopSlotSpinWithLucky: sau khi quay xong, chuyển sang màn hình kết quả
function stopSlotSpinWithLucky(code, name) {
  stopRollingAudio(); // Dừng rolling.mp3 ngay khi bấm CHỐT
  playSound('slotStop'); // Phát slot-stop.mp3 lặp lại liên tục
  const drawCards = document.querySelectorAll('.draw-card');
  code = (code || '').slice(0, drawCards.length);
  const slotCount = drawCards.length;
  const slotDelay = slotCount > 0 ? 4000 / slotCount : 400; // ms
  drawCards.forEach((card, idx) => {
    clearInterval(slotIntervals[idx]);
    slotIntervals[idx] = setInterval(() => {
      setSlotNumber(card, Math.floor(Math.random() * 10));
    }, 20);
  });
  setTimeout(() => {
    function stopNext(i) {
      if (i >= drawCards.length) {
        stopSlotStopAudio(); // Dừng slot-stop.mp3 khi tất cả slot đã dừng
        let codeOnSlot = '';
        drawCards.forEach(card => {
          const span = card.querySelector('span');
          let val = span ? span.textContent : '';
          if (!/^[0-9]$/.test(val)) val = '';
          codeOnSlot += val;
        });
        window.currentDrawCode6 = codeOnSlot;
        window.currentDrawWinner = { code: codeOnSlot, name: name, code6: codeOnSlot, prize: getCurrentPrize() };
        playSound('result'); // Âm thanh công bố kết quả
        showResultScreen([{ code6: codeOnSlot, name: name }], { name: getCurrentPrize(), icon: getCurrentPrizeIcon() });
        return;
      }
      clearInterval(slotIntervals[i]);
      setSlotNumber(drawCards[i], code[i] || '');
      drawCards[i].classList.add('lucky-highlight');
      setTimeout(() => {
        drawCards[i].classList.remove('lucky-highlight');
        stopNext(i + 1);
      }, slotDelay);
    }
    stopNext(0);
  }, 0); // Không cần delay tổng, delay chia đều cho từng slot
}

// Hàm lấy tên giải và icon hiện tại
function getCurrentPrize() {
  const prizeLabel = document.querySelector('.draw-mode .prize-label');
  return prizeLabel ? prizeLabel.textContent.trim() : '';
}
function getCurrentPrizeIcon() {
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[{"name":"GIẢI ĐẶC BIỆT","icon":"💎"},{"name":"GIẢI NHẤT","icon":"🥇"},{"name":"GIẢI NHÌ","icon":"🥈"},{"name":"GIẢI BA","icon":"🥉"}]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx'), 10) || 0;
  return prizes[currentPrizeIdx]?.icon || '⭐';
}

if (drawBtn && lockBtn) {
  drawBtn.addEventListener('click', function() {
    if (isSpinning) return;
    drawBtn.style.display = 'none';
    lockBtn.style.display = '';
    startSlotSpin();
  });
  lockBtn.addEventListener('click', function() {
    if (!isSpinning) return;
    drawBtn.style.display = 'none'; // Ẩn nút quay số ngay khi bấm chốt
    // Lấy danh sách mã số và tên
    let luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
    let luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
    // Chọn ngẫu nhiên 1 mã số
    let idx = Math.floor(Math.random() * luckyCodes.length);
    luckyCode = (luckyCodes[idx] || '').padStart(6, '0');
    luckyName = luckyNames[idx] || '';
    stopSlotSpinWithLucky(luckyCode, luckyName);
    isSpinning = false;
    lockBtn.style.display = 'none';
    // drawBtn.style.display = ''; // KHÔNG hiện lại nút quay số ở đây
  });
}
// ==== Main Title Color Picker ====
(function() {
  const dot = document.querySelector('.dot');
  const colorInput = document.getElementById('titleColorPicker');
  const mainTitle = document.querySelector('.main-title');
  // Load màu từ localStorage
  function applyTitleColor() {
    const color = localStorage.getItem('mainTitleColor');
    if (color) {
      mainTitle.style.color = color;
      dot.style.background = color;
    } else {
      mainTitle.style.color = '';
      dot.style.background = '#e0e0e0';
    }
  }
  dot.addEventListener('click', function() {
    colorInput.click();
  });
  colorInput.addEventListener('input', function() {
    const color = colorInput.value;
    mainTitle.style.color = color;
    dot.style.background = color;
    localStorage.setItem('mainTitleColor', color);
  });
  applyTitleColor();
})(); 

// ==== Draw Cards Show Prize Icon Instead of Number ====
// Hiển thị icon giải thưởng trong các ô draw-card khi draw-mode chưa quay
function updateDrawCardsWithPrizeIcon() {
  // Lấy icon của giải hiện tại
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[{"name":"GIẢI ĐẶC BIỆT","icon":"💎"},{"name":"GIẢI NHẤT","icon":"🥇"},{"name":"GIẢI NHÌ","icon":"🥈"},{"name":"GIẢI BA","icon":"🥉"}]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx'), 10) || 0;
  const icon = prizes[currentPrizeIdx]?.icon || '⭐';
  document.querySelectorAll('.draw-card').forEach(card => {
    card.innerHTML = `<span>${icon}</span>`;
    card.classList.remove('lucky-highlight', 'lucky-blink');
  });
}
// Gọi hàm này khi vào main-mode hoặc khi đổi giải
updateDrawCardsWithPrizeIcon();
document.querySelector('.show-btn').addEventListener('click', updateDrawCardsWithPrizeIcon);
document.querySelectorAll('.arrow.left, .arrow.right').forEach(btn => btn.addEventListener('click', updateDrawCardsWithPrizeIcon));
// Gọi hàm này khi vào draw-mode và result-mode
function observeDrawMode() {
  const main = document.querySelector('main');
  const observer = new MutationObserver(() => {
    if (main.classList.contains('draw-mode') || main.classList.contains('result-mode')) {
      updateDrawCardsWithPrizeIcon();
    }
  });
  observer.observe(main, { attributes: true, attributeFilter: ['class'] });
}
observeDrawMode(); 

// Music control


function playMusic(music) {
  [bgMusic, spinMusic, resultMusic].forEach(m => { if (m && !m.paused) m.pause(); m && (m.currentTime = 0); });
  if (music) {
    music.currentTime = 0;
    music.play();
  }
}

// Phát nhạc nền khi vào trang
window.addEventListener('DOMContentLoaded', function() {
  if (bgMusic) {
    bgMusic.volume = 0.4;
    bgMusic.play().catch(()=>{});
  }
});

// Khi bấm nút quay số
if (drawBtn) {
  drawBtn.addEventListener('click', function() {
    playMusic(spinMusic);
  });
}

// Khi hiện kết quả
// (Đã gọi playMusic(resultMusic) trong showResultScreen)

// Khi quay lại draw-mode hoặc xác nhận, phát lại nhạc nền
if (resultConfirmBtn) {
  resultConfirmBtn.addEventListener('click', function() {
    playMusic(bgMusic);
  });
}
if (resultBackBtn) {
  resultBackBtn.addEventListener('click', function() {
    playMusic(bgMusic);
  });
} 

// Theme Picker Logic
const themeBtn = document.getElementById('theme-btn');
const themeModal = document.getElementById('theme-modal');
const themeClose = document.querySelector('.theme-modal-close');
const themeItems = document.querySelectorAll('.theme-item');

function applyTheme(theme) {
  document.body.classList.remove(
    ...[...document.body.classList].filter(cls => cls.startsWith('theme-'))
  );
  if (theme) document.body.classList.add('theme-' + theme);
  localStorage.setItem('luckyTheme', theme);
  // Cập nhật trạng thái chọn
  themeItems.forEach(item => {
    if (item.dataset.theme === theme) item.classList.add('selected');
    else item.classList.remove('selected');
  });
}
// Mở modal
if (themeBtn) themeBtn.onclick = () => themeModal.classList.remove('hidden');
// Đóng modal
if (themeClose) themeClose.onclick = () => themeModal.classList.add('hidden');
themeModal && themeModal.addEventListener('click', e => {
  if (e.target === themeModal) themeModal.classList.add('hidden');
});
// Chọn theme
if (themeItems) themeItems.forEach(item => {
  item.onclick = () => {
    applyTheme(item.dataset.theme);
    themeModal.classList.add('hidden');
  };
});
// Áp dụng theme khi load lại trang
const savedTheme = localStorage.getItem('luckyTheme');
if (savedTheme) applyTheme(savedTheme); 

function resetDrawModeToInitial() {
  // Reset các slot về icon giải thưởng (ép buộc)
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[{"name":"GIẢI ĐẶC BIỆT","icon":"💎"},{"name":"GIẢI NHẤT","icon":"🥇"},{"name":"GIẢI NHÌ","icon":"🥈"},{"name":"GIẢI BA","icon":"🥉"}]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx'), 10) || 0;
  const icon = prizes[currentPrizeIdx]?.icon || '⭐';
  document.querySelectorAll('.draw-card').forEach(card => {
    card.innerHTML = `<span>${icon}</span>`;
    card.classList.remove('lucky-highlight', 'lucky-blink'); // Bỏ mọi hiệu ứng slot
  });
  // Ẩn tên người trúng
  const nameDiv = document.getElementById('draw-winner-name');
  if (nameDiv) nameDiv.innerHTML = '';
  // Ẩn nút chốt nếu đang hiện
  const lockBtn = document.querySelector('.lock-btn');
  if (lockBtn) lockBtn.style.display = 'none';
  // Ẩn nút xác nhận/quay lại nếu có
  const btnWrap = document.getElementById('draw-confirm-btn-wrap');
  if (btnWrap) btnWrap.style.display = 'none';
  // Hiện lại nút quay số
  const drawBtn = document.querySelector('.draw-btn');
  if (drawBtn) drawBtn.style.display = '';
  // Đảm bảo trạng thái class
  document.querySelector('.draw-mode').classList.remove('drawing');
  document.querySelector('.draw-mode').classList.add('not-picked');
}

// Sửa lại các nơi cần reset giao diện
if (resultBackBtn) {
  resultBackBtn.onclick = function() {
    document.querySelector('.result-mode').style.display = 'none';
    document.querySelector('.draw-mode').style.display = 'flex';
    document.body.classList.remove('result-active');
    document.body.classList.add('draw-active');
    resetDrawModeToInitial();
  };
}
if (document.getElementById('draw-back-btn')) {
  document.getElementById('draw-back-btn').onclick = function() {
    resetDrawModeToInitial();
  };
}
// Sau khi xác nhận/quay lại cũng reset lại giao diện
if (document.getElementById('draw-confirm-btn')) {
  document.getElementById('draw-confirm-btn').onclick = function() {
    resetDrawModeToInitial();
  };
}

function clearDrawSlots() {
  // Hàm rỗng để tránh lỗi ReferenceError, có thể bổ sung logic reset slot nếu cần
}

function setupClearDrawSlotsEvents() {
  const showBtn = document.querySelector('.show-btn');
  if (showBtn) showBtn.addEventListener('click', clearDrawSlots);
  if (typeof drawBtn !== 'undefined' && drawBtn) drawBtn.addEventListener('click', clearDrawSlots);
  const endBtn = document.querySelector('.end-btn');
  if (endBtn) endBtn.addEventListener('click', clearDrawSlots);
  const resultBackBtn = document.querySelector('.result-back-btn');
  if (resultBackBtn) resultBackBtn.addEventListener('click', clearDrawSlots);
}
document.addEventListener('DOMContentLoaded', setupClearDrawSlotsEvents); 

// === HIỂN THỊ LỊCH SỬ KẾT QUẢ QUAY SỐ ===
const resultListModal = document.getElementById('result-list-modal');
const resultListClose = document.querySelector('.result-list-modal-close');
const resultListTabs = document.querySelector('.result-list-tabs');
const resultListTableWrap = document.querySelector('.result-list-table-wrap');

// Sự kiện mở modal khi click menu 'Kết quả' ở footer
const footerMenu = document.querySelector('.footer-bar .menu-bar span');
if (footerMenu) {
  footerMenu.onclick = function() {
    renderResultList();
    resultListModal.classList.remove('hidden');
  };
}
// Sự kiện đóng modal
if (resultListClose) {
  resultListClose.onclick = function() {
    resultListModal.classList.add('hidden');
  };
}

// Hàm render danh sách winners theo từng giải
function renderResultList() {
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[{"name":"GIẢI ĐẶC BIỆT","icon":"💎"},{"name":"GIẢI NHẤT","icon":"🥇"},{"name":"GIẢI NHÌ","icon":"🥈"},{"name":"GIẢI BA","icon":"🥉"}]');
  // Tabs
  resultListTabs.innerHTML = '';
  prizes.forEach((prize, idx) => {
    const tab = document.createElement('button');
    tab.className = 'result-list-tab' + (idx === 0 ? ' active' : '');
    tab.textContent = prize.name;
    tab.onclick = function() {
      document.querySelectorAll('.result-list-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTable(prize.name);
    };
    resultListTabs.appendChild(tab);
  });
  // Render bảng đầu tiên
  if (prizes.length > 0) renderTable(prizes[0].name);
  function renderTable(prizeName) {
    const filtered = winners.filter(w => w.prize === prizeName);
    let html = `<table class='result-list-table'><thead><tr><th>#</th><th>ID</th><th>Họ tên</th></tr></thead><tbody>`;
    if (filtered.length === 0) {
      html += `<tr><td colspan='3' style='color:#888;'>Chưa có kết quả nào!</td></tr>`;
    } else {
      filtered.forEach((w, i) => {
        html += `<tr><td>${i + 1}</td><td>${w.code}</td><td>${w.name}</td></tr>`;
      });
    }
    html += '</tbody></table>';
    resultListTableWrap.innerHTML = html;
  }
} 

// Bổ sung nút xóa kết quả vào modal kết quả
(function() {
  const downloadWrap = document.querySelector('.result-list-download-wrap');
  if (!downloadWrap) return;
  let clearBtn = document.createElement('button');
  clearBtn.textContent = '🗑️ XÓA KẾT QUẢ';
  clearBtn.className = 'result-list-clear-btn';
  clearBtn.style = 'margin-left:18px;background:#ff4444;color:#fff;font-weight:bold;font-size:1.1em;border:none;border-radius:8px;padding:10px 32px;cursor:pointer;box-shadow:0 2px 12px #ff444455;transition:background 0.2s,color 0.2s;';
  downloadWrap.appendChild(clearBtn);
  clearBtn.onclick = function() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ kết quả quay số?')) {
      localStorage.removeItem('winners');
      renderResultList();
    }
  };
})(); 

// Phát nhạc nền khi bấm nút TRÌNH CHIẾU (show-btn)
const showBtn = document.querySelector('.show-btn');
if (showBtn) {
  showBtn.addEventListener('click', function() {
    playSound('bg');
  });
}

let slotStopAudio = null;
// Lấy duration của slot-stop.mp3 để dùng làm delay dừng slot
let slotStopDuration = 400; // fallback mặc định nếu chưa load được
window.addEventListener('DOMContentLoaded', function() {
  slotStopAudio = document.getElementById('slot-stop');
  if (slotStopAudio) {
    slotStopAudio.addEventListener('loadedmetadata', function() {
      slotStopDuration = Math.floor(slotStopAudio.duration * 1000) || 400;
    });
  }
});

function stopSlotSpinWithLucky(code, name) {
  stopRollingAudio(); // Dừng rolling.mp3 ngay khi bấm CHỐT
  playSound('slotStop'); // Phát slot-stop.mp3 lặp lại liên tục
  const drawCards = document.querySelectorAll('.draw-card');
  code = (code || '').slice(0, drawCards.length);
  const slotCount = drawCards.length;
  const slotDelay = slotCount > 0 ? 4000 / slotCount : 400; // ms
  drawCards.forEach((card, idx) => {
    clearInterval(slotIntervals[idx]);
    slotIntervals[idx] = setInterval(() => {
      setSlotNumber(card, Math.floor(Math.random() * 10));
    }, 20);
  });
  setTimeout(() => {
    function stopNext(i) {
      if (i >= drawCards.length) {
        stopSlotStopAudio(); // Dừng slot-stop.mp3 khi tất cả slot đã dừng
        let codeOnSlot = '';
        drawCards.forEach(card => {
          const span = card.querySelector('span');
          let val = span ? span.textContent : '';
          if (!/^[0-9]$/.test(val)) val = '';
          codeOnSlot += val;
        });
        window.currentDrawCode6 = codeOnSlot;
        window.currentDrawWinner = { code: codeOnSlot, name: name, code6: codeOnSlot, prize: getCurrentPrize() };
        playSound('result'); // Âm thanh công bố kết quả
        showResultScreen([{ code6: codeOnSlot, name: name }], { name: getCurrentPrize(), icon: getCurrentPrizeIcon() });
        return;
      }
      clearInterval(slotIntervals[i]);
      setSlotNumber(drawCards[i], code[i] || '');
      drawCards[i].classList.add('lucky-highlight');
      setTimeout(() => {
        drawCards[i].classList.remove('lucky-highlight');
        stopNext(i + 1);
      }, slotDelay);
    }
    stopNext(0);
  }, 0); // Không cần delay tổng, delay chia đều cho từng slot
}
