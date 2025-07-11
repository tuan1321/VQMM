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
  
  // Đảm bảo dòng "Đang tìm người may mắn..." được ẩn khi bắt đầu
  const searchingDiv = document.querySelector('.draw-searching');
  if (searchingDiv) {
    searchingDiv.style.display = 'none';
  }
};
document.querySelector('.end-btn').onclick = function() {
  document.querySelector('.draw-mode').style.display = 'none';
  document.querySelector('.main-mode').style.display = 'block';
  document.body.classList.remove('draw-active');
  document.body.classList.remove('result-active');
  
  // Ẩn dòng "Đang tìm người may mắn..." khi kết thúc
  const searchingDiv = document.querySelector('.draw-searching');
  if (searchingDiv) {
    searchingDiv.style.display = 'none';
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

// Khôi phục tên sự kiện từ localStorage nếu có
const savedTitle = localStorage.getItem('eventTitle');
if (savedTitle) {
  mainTitle.childNodes[0].textContent = savedTitle + ' ';
}

editTitleBtn && (editTitleBtn.onclick = function() {
  eventTitleModal.classList.remove('hidden');
  eventTitleInput.value = mainTitle.childNodes[0].textContent.trim();
  setTimeout(() => eventTitleInput.focus(), 100);
});

eventTitleForm && eventTitleForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const newTitle = eventTitleInput.value.trim();
  if (newTitle) {
    mainTitle.childNodes[0].textContent = newTitle + ' ';
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
  function updateAllPrizeDisplays() {
    const prizeLabels = document.querySelectorAll('.prize-label');
    const prizeIcons = document.querySelectorAll('.prize-label-icon');
    const prizeCounts = document.querySelectorAll('.prize-count-num');
    const badgeSpans = document.querySelectorAll('.draw-badge-glow span, .badge span');
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
  function showModal() {
    renderPrizeList();
    prizeModal.classList.remove('hidden');
  }
  function hideModal() {
    prizeModal.classList.add('hidden');
  }
  function renderPrizeList() {
    prizeListDiv.innerHTML = '';
    prizes.forEach((prize, idx) => {
      const div = document.createElement('div');
      div.className = 'prize-item';
      // Icon
      const iconSpan = document.createElement('span');
      iconSpan.className = 'prize-icon';
      iconSpan.textContent = prize.icon || ICONS[idx % ICONS.length];
      iconSpan.title = 'Click để đổi icon';
      iconSpan.onclick = () => {
        let curIdx = ICONS.indexOf(prizes[idx].icon);
        prizes[idx].icon = ICONS[(curIdx + 1) % ICONS.length];
        iconSpan.textContent = prizes[idx].icon;
      };
      div.appendChild(iconSpan);
      // Input
      const input = document.createElement('input');
      input.type = 'text';
      input.value = prize.name;
      input.addEventListener('input', e => {
        prizes[idx].name = e.target.value;
      });
      div.appendChild(input);
      // Xóa
      const delBtn = document.createElement('button');
      delBtn.className = 'prize-delete-btn';
      delBtn.textContent = 'X';
      delBtn.title = 'Xóa giải';
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

// Quay số: mỗi ô draw-card là 1 số của mã thưởng, tên hiển thị bên dưới
let drawIntervalIds = [];
let isDrawing = false;
let lockedIndex = -1;
function startDrawRandom() {
  let drawCards = document.querySelectorAll('.draw-card');
  let nameDiv = document.getElementById('draw-winner-name');
  if (!nameDiv) {
    nameDiv = document.createElement('div');
    nameDiv.id = 'draw-winner-name';
    nameDiv.style = 'margin-top:12px;font-size:1.3em;color:#fff;text-align:center;font-weight:bold;text-shadow:0 2px 8px #000a;';
    drawCards[0].parentNode.parentNode.appendChild(nameDiv);
  }
  nameDiv.textContent = '';
  
  // Hiển thị dòng "Đang tìm người may mắn..."
  const searchingDiv = document.querySelector('.draw-searching');
  if (searchingDiv) {
    searchingDiv.style.display = 'block';
  }
  
  isDrawing = true;
  lockedIndex = -1;
  drawIntervalIds = [];
  
  // Tạo hiệu ứng slot machine cho từng ô số
  for (let i = 0; i < drawCards.length; i++) {
    // Tạo container cho slot machine
    const slotContainer = document.createElement('div');
    slotContainer.className = 'slot-container';
    slotContainer.style.cssText = `
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Tạo dãy số cuộn
    const slotReel = document.createElement('div');
    slotReel.className = 'slot-reel';
    slotReel.style.cssText = `
      display: flex;
      flex-direction: column;
      transition: transform 0.03s linear;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    `;
    
    // Xác định chiều cao dựa trên kích thước màn hình
    let digitHeight = 140;
    let fontSize = '2.2em';
    
    if (window.innerWidth <= 600) {
      digitHeight = 50;
      fontSize = '0.8em';
    } else if (window.innerWidth <= 900) {
      digitHeight = 90;
      fontSize = '1.2em';
    }
    
    // Tạo infinite scroll với 60 số (30 + 30 duplicate để seamless)
    const digits = [];
    for (let j = 0; j < 30; j++) {
      digits.push(Math.floor(Math.random() * 10).toString());
    }
    
    // Tạo 60 spans với 30 số đầu + 30 số duplicate
    for (let j = 0; j < 60; j++) {
      const digitSpan = document.createElement('span');
      digitSpan.textContent = digits[j % 30];
      digitSpan.style.cssText = `
        font-size: ${fontSize};
        color: #ffd600;
        font-weight: bold;
        height: ${digitHeight}px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-shadow: 0 2px 8px #000a;
        user-select: none;
      `;
      slotReel.appendChild(digitSpan);
    }
    
    slotContainer.appendChild(slotReel);
    drawCards[i].innerHTML = '';
    drawCards[i].appendChild(slotContainer);
    
    // Thêm hiệu ứng fade in cho slot container
    slotContainer.style.opacity = '0';
    slotContainer.style.transform = 'scale(0.9)';
    slotContainer.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    setTimeout(() => {
      slotContainer.style.opacity = '1';
      slotContainer.style.transform = 'scale(1)';
    }, i * 50);
    
    // Sử dụng CSS animation thay vì JavaScript interval để mượt hơn
    const animationDuration = (3 + i * 0.3).toFixed(1); // 3s đến 4.5s
    slotReel.style.animation = `slotScroll ${animationDuration}s linear infinite`;
    
    // Lưu reference để có thể dừng animation
    drawIntervalIds[i] = slotReel;
  }
}
function stopDrawRandom() {
  // Dừng tất cả CSS animations
  drawIntervalIds.forEach(slotReel => {
    if (slotReel && slotReel.style) {
      slotReel.style.animation = 'none';
    }
  });
  drawIntervalIds = [];
  isDrawing = false;
  
  // Ẩn dòng "Đang tìm người may mắn..."
  const searchingDiv = document.querySelector('.draw-searching');
  if (searchingDiv) {
    searchingDiv.style.display = 'none';
  }
}
function lockDraw() {
  // Khi bấm CHỐT, bắt đầu hiệu ứng giảm tốc độ
  // Phát âm thanh khi bắt đầu giảm tốc độ
  const spinMusic = document.getElementById('spin-music');
  if (spinMusic) {
    spinMusic.play().catch(e => console.log('Audio play failed:', e));
  }
  
  let luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
  let luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
  let drawCards = document.querySelectorAll('.draw-card');
  let idx = luckyCodes.length > 0 ? Math.floor(Math.random() * luckyCodes.length) : -1;
  lockedIndex = idx;
  let code = idx >= 0 ? luckyCodes[idx] : '';
  let name = (idx >= 0 && idx < luckyNames.length) ? luckyNames[idx] : '';
  let code6 = code ? code.padStart(6, '0') : '000000';
  
  // Bắt đầu hiệu ứng giảm tốc độ từng reel một
  for (let i = 0; i < drawCards.length; i++) {
    setTimeout(() => {
      const slotReel = drawIntervalIds[i];
      if (slotReel && slotReel.style) {
        // Thêm hiệu ứng visual feedback khi bắt đầu giảm tốc độ
        const drawCard = drawCards[i];
        drawCard.style.boxShadow = '0 0 20px #ffd600, inset 0 0 20px #ffd600';
        drawCard.style.transform = 'scale(1.05)';
        drawCard.style.transition = 'all 0.3s ease-out';
        
        // Giảm tốc độ dần dần với hiệu ứng slow motion
        const slowDownDuration = (2 + i * 0.5).toFixed(1); // 2s đến 4.5s
        slotReel.style.animation = `slotSlowDown ${slowDownDuration}s ease-out infinite`;
        
        // Sau khi giảm tốc độ, dừng hẳn và hiển thị kết quả
        setTimeout(() => {
          slotReel.style.animation = 'none';
          
          // Reset visual feedback
          drawCard.style.boxShadow = '';
          drawCard.style.transform = '';
          drawCard.style.transition = '';
          
          // Hiển thị số cuối cùng với hiệu ứng
          const finalDigit = code6[i] || '0';
          const resultSpan = document.createElement('span');
          resultSpan.textContent = finalDigit;
          
          // Xác định font size phù hợp với kích thước màn hình
          let finalFontSize = '2.2em';
          if (window.innerWidth <= 600) {
            finalFontSize = '0.8em';
          } else if (window.innerWidth <= 900) {
            finalFontSize = '1.2em';
          }
          
          resultSpan.style.cssText = `
            font-size: ${finalFontSize};
            color: #ffd600;
            font-weight: bold;
            text-shadow: 0 2px 8px #000a;
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          `;
          
          drawCards[i].innerHTML = '';
          drawCards[i].appendChild(resultSpan);
          
          // Trigger animation với delay nhỏ
          setTimeout(() => {
            resultSpan.style.opacity = '1';
            resultSpan.style.transform = 'scale(1)';
          }, 100);
          
        }, parseFloat(slowDownDuration) * 1000); // Đợi animation chậm kết thúc
      }
    }, i * 300); // Bắt đầu giảm tốc độ từng reel với delay 300ms
  }
  
  // Hiển thị màn hình kết quả sau khi tất cả reel đã dừng
  const totalSlowDownTime = (2 + (drawCards.length - 1) * 0.5) * 1000; // Thời gian giảm tốc độ của reel cuối
  const totalStopTime = totalSlowDownTime + 500; // Thêm 500ms cho việc hiển thị số cuối
  setTimeout(() => {
    stopDrawRandom(); // Dọn dẹp
    showResultScreen(code6, name);
  }, totalStopTime + 1000); // Thêm 1s để người dùng xem kết quả
}
// Khai báo nút quay số và nút chốt chỉ một lần
const drawBtn = document.querySelector('.draw-btn');
const lockBtn = document.querySelector('.lock-btn');
if (drawBtn && lockBtn) {
  drawBtn.addEventListener('click', function() {
    if (isDrawing) return;
    document.querySelector('.draw-mode').classList.remove('not-picked');
    document.querySelector('.draw-mode').classList.add('drawing');
    startDrawRandom();
    drawBtn.style.display = 'none';
    lockBtn.style.display = '';
  });
  lockBtn.addEventListener('click', function() {
    if (!isDrawing) return;
    lockDraw();
    lockBtn.style.display = 'none';
    // drawBtn.style.display = ''; // Không hiện lại nút quay số ở đây
    document.querySelector('.draw-mode').classList.remove('drawing');
  });
}

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
  
  // Tạo confetti từ góc dưới trái
  function createConfettiFromLeft() {
    const x = 0;
    const y = canvas.height;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6; // 45° ± 15°
    const velocity = 8 + Math.random() * 6;
    
    return {
      x: x,
      y: y,
      vx: Math.cos(angle) * velocity,
      vy: -Math.sin(angle) * velocity,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 12,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      type: Math.random() < 0.5 ? 'square' : 'circle',
      life: 1,
      decay: 0.008 + Math.random() * 0.004
    };
  }
  
  // Tạo confetti từ góc dưới phải
  function createConfettiFromRight() {
    const x = canvas.width;
    const y = canvas.height;
    const angle = 3 * Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6; // 135° ± 15°
    const velocity = 8 + Math.random() * 6;
    
    return {
      x: x,
      y: y,
      vx: Math.cos(angle) * velocity,
      vy: -Math.sin(angle) * velocity,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 12,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      type: Math.random() < 0.5 ? 'square' : 'circle',
      life: 1,
      decay: 0.008 + Math.random() * 0.004
    };
  }
  
  let frame = 0;
  let running = true;
  
  function draw() {
    if (!running) return;
    
    // Xóa canvas sạch sẽ để chỉ hiển thị confetti
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Tạo confetti mới từ cả hai góc
    if (frame % 3 === 0) {
      confetti.push(createConfettiFromLeft());
      confetti.push(createConfettiFromRight());
    }
    
    // Vẽ confetti
    for (let i = confetti.length - 1; i >= 0; i--) {
      const piece = confetti[i];
      
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.globalAlpha = piece.life;
      
      if (piece.type === 'square') {
        // Vẽ hình vuông (giấy vuông)
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size/2, -piece.size/2, piece.size, piece.size);
        
        // Thêm viền nhẹ
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-piece.size/2, -piece.size/2, piece.size, piece.size);
      } else {
        // Vẽ hình tròn (giấy tròn)
        ctx.fillStyle = piece.color;
        ctx.beginPath();
        ctx.arc(0, 0, piece.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Thêm viền nhẹ
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      ctx.restore();
      
      // Update confetti position
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += 0.15; // Gravity
      piece.rotation += piece.rotationSpeed;
      piece.life -= piece.decay;
      
      // Thêm hiệu ứng bay theo gió
      piece.vx += (Math.random() - 0.5) * 0.2;
      
      // Remove dead confetti
      if (piece.life <= 0 || piece.y > canvas.height + 50) {
        confetti.splice(i, 1);
      }
    }
    
    frame++;
    if (frame < 300) {
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

// Gọi confetti khi hiện kết quả
function showResultScreen(code6, name) {
  // Ẩn draw-mode, hiện result-mode
  document.querySelector('.draw-mode').style.display = 'none';
  const resultMode = document.querySelector('.result-mode');
  resultMode.style.display = 'flex';
  // Hiển thị tên sự kiện
  const eventTitle = localStorage.getItem('eventTitle') || 'LUCKY DRAW SOFTWARE';
  document.getElementById('result-event-title').textContent = eventTitle;
  // Hiển thị dãy số
  const resultCards = resultMode.querySelector('.result-cards');
  resultCards.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const div = document.createElement('div');
    div.className = 'draw-card';
    div.style.opacity = '1';
    div.innerHTML = `<span style='font-size:2.2em;color:#fff;font-weight:bold;'>${code6[i] || '0'}</span>`;
    resultCards.appendChild(div);
  }
  // Hiển thị mã - tên
  animateWinnerName(code6.join ? code6.join('') : code6, name || '');
  // Hiển thị giải thưởng và icon
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  let prizeLabel = document.querySelector('.draw-mode .prize-label');
  let prizeName = prizeLabel ? prizeLabel.textContent : '';
  let prizeObj = prizes.find(p => p.name === prizeName);
  document.getElementById('result-prize-label').textContent = prizeName;
  // Hiển thị icon badge
  document.getElementById('result-badge').textContent = prizeObj && prizeObj.icon ? prizeObj.icon : '';
  playMusic(resultMusic);
  
  // Delay nhỏ để đồng bộ với âm thanh và tạo hiệu ứng pháo hoa giấy
  setTimeout(() => {
    launchFireworks(); // Pháo hoa giấy từ 2 góc dưới
  }, 300);
  // Xóa hoặc ẩn tiêu đề VÒNG QUAY MAY MẮN ở result-mode nếu có
  const extraTitle = resultMode.querySelector('.main-title');
  if (extraTitle) extraTitle.style.display = 'none';
  document.body.classList.remove('draw-active');
  document.body.classList.add('result-active');
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
    updateDrawCardsWithPrizeIcon();
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

// Gán sự kiện cho nút draw-btn ngoài draw-mode
// drawBtn && drawBtn.addEventListener('click', function() { // This line was removed as per the edit hint
//   drawAllCards();
// });

// Lucky List Modal Logic
(function() {
  const luckyListModal = document.getElementById('lucky-list-modal');
  const luckyListClose = document.querySelector('.lucky-list-modal-close');
  const luckyListCancel = document.querySelector('.lucky-list-cancel-btn');
  const luckyListSave = document.querySelector('.lucky-list-save-btn');
  const luckyListDraw = document.querySelector('.lucky-list-draw-btn');
  const luckyCodeList = document.getElementById('lucky-code-list');
  const luckyNameList = document.getElementById('lucky-name-list');
  const luckyCodeCount = document.getElementById('lucky-code-count');
  const luckyNameCount = document.getElementById('lucky-name-count');
  const autoFrom = document.getElementById('auto-from');
  const autoTo = document.getElementById('auto-to');
  const autoGenBtn = document.getElementById('auto-generate-btn');

  let lastClickedCard = null;
  let luckyCodes = [];
  let luckyNames = [];

  // Load từ localStorage
  function loadLuckyList() {
    luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
    luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
    luckyCodeList.value = luckyCodes.join('\n');
    luckyNameList.value = luckyNames.join('\n');
    updateCounts();
  }
  function saveLuckyList() {
    luckyCodes = luckyCodeList.value.split(/\r?\n/).map(x => x.trim()).filter(x => x);
    luckyNames = luckyNameList.value.split(/\r?\n/).map(x => x.trim()).filter(x => x);
    localStorage.setItem('luckyCodes', JSON.stringify(luckyCodes));
    localStorage.setItem('luckyNames', JSON.stringify(luckyNames));
    updateCounts();
  }
  function updateCounts() {
    luckyCodeCount.textContent = luckyCodeList.value.split(/\r?\n/).filter(x => x.trim()).length;
    luckyNameCount.textContent = luckyNameList.value.split(/\r?\n/).filter(x => x.trim()).length;
  }
  luckyCodeList.addEventListener('input', updateCounts);
  luckyNameList.addEventListener('input', updateCounts);

  // Tạo số tự động
  autoGenBtn.addEventListener('click', function() {
    let from = parseInt(autoFrom.value, 10);
    let to = parseInt(autoTo.value, 10);
    if (isNaN(from) || isNaN(to) || from > to) return;
    let arr = [];
    for (let i = from; i <= to; ++i) arr.push(i.toString());
    luckyCodeList.value = arr.join('\n');
    updateCounts();
  });

  // Đóng modal
  function closeModal() {
    luckyListModal.classList.add('hidden');
    lastClickedCard = null;
  }
  luckyListClose.addEventListener('click', closeModal);
  luckyListCancel.addEventListener('click', closeModal);
  luckyListModal.addEventListener('click', function(e) {
    if (e.target === luckyListModal) closeModal();
  });

  // Lưu danh sách
  luckyListSave.addEventListener('click', function() {
    saveLuckyList();
    closeModal();
  });

  // Mở modal khi click card
  function openModalForCard(card) {
    lastClickedCard = card;
    loadLuckyList();
    luckyListModal.classList.remove('hidden');
  }
  document.querySelectorAll('.card, .draw-card').forEach(card => {
    card.addEventListener('click', function() {
      openModalForCard(card);
    });
  });

  // Quay số cho tất cả draw-card
  luckyListDraw.addEventListener('click', function() {
    saveLuckyList();
    drawAllCards();
    closeModal();
  });

  // Khi load trang, tự động load danh sách
  loadLuckyList();
})(); 

// Result List Modal Logic
(function() {
  const resultBtn = Array.from(document.querySelectorAll('.menu-bar span')).find(e => e.textContent.trim().toLowerCase() === 'kết quả');
  const modal = document.getElementById('result-list-modal');
  const closeBtn = document.querySelector('.result-list-modal-close');
  const tabsDiv = document.querySelector('.result-list-tabs');
  const tableWrap = document.querySelector('.result-list-table-wrap');
  const downloadBtn = document.querySelector('.result-list-download-btn');

  let currentPrize = '';

  function getWinners() {
    return JSON.parse(localStorage.getItem('winners') || '[]');
  }
  function getPrizeList() {
    const winners = getWinners();
    return Array.from(new Set(winners.map(w => w.prize))).filter(Boolean);
  }
  function renderTabs() {
    const prizes = getPrizeList();
    tabsDiv.innerHTML = '';
    prizes.forEach(prize => {
      const btn = document.createElement('button');
      btn.className = 'result-list-tab' + (prize === currentPrize ? ' active' : '');
      btn.textContent = prize;
      btn.onclick = () => {
        currentPrize = prize;
        renderTabs();
        renderTable();
      };
      tabsDiv.appendChild(btn);
    });
    if (!currentPrize && prizes.length) {
      currentPrize = prizes[0];
    }
  }
  function renderTable() {
    const winners = getWinners().filter(w => w.prize === currentPrize);
    let html = '<table class="result-list-table">';
    html += '<tr><th>#</th><th>ID</th><th>Họ tên</th></tr>';
    winners.forEach((w, i) => {
      html += `<tr><td>${i+1}</td><td>${w.code}</td><td>${w.name||''}</td></tr>`;
    });
    html += '</table>';
    tableWrap.innerHTML = html;
  }
  function showModal() {
    renderTabs();
    renderTable();
    modal.classList.remove('hidden');
  }
  function hideModal() {
    modal.classList.add('hidden');
  }
  resultBtn && resultBtn.addEventListener('click', showModal);
  closeBtn && closeBtn.addEventListener('click', hideModal);
  modal && modal.addEventListener('click', function(e) {
    if (e.target === modal) hideModal();
  });
  // Download CSV
  downloadBtn && downloadBtn.addEventListener('click', function() {
    const winners = getWinners().filter(w => w.prize === currentPrize);
    let csv = 'STT,ID,Họ tên\n';
    winners.forEach((w, i) => {
      csv += `${i+1},${w.code},${w.name||''}\n`;
    });
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ketqua_${currentPrize.replace(/\s+/g,'_')}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  });
})(); 

// Thêm nút xóa kết quả vào modal kết quả
(function() {
  const modal = document.getElementById('result-list-modal');
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
      // Nếu modal đang mở, cập nhật lại giao diện
      if (!modal.classList.contains('hidden')) {
        const tabsDiv = document.querySelector('.result-list-tabs');
        const tableWrap = document.querySelector('.result-list-table-wrap');
        tabsDiv.innerHTML = '';
        tableWrap.innerHTML = '<div style="text-align:center;color:#888;margin:32px 0;">Chưa có kết quả nào!</div>';
      }
    }
  };
})(); 

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
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx') || '0', 10);
  const icon = prizes[currentPrizeIdx]?.icon || '🎁';
  let allIcon = true;
  document.querySelectorAll('.draw-mode .draw-card').forEach(card => {
    card.innerHTML = `<span>${icon}</span>`;
    if (card.textContent !== icon) allIcon = false;
  });
  document.querySelector('.draw-mode').classList.add('not-picked');
}
// Gọi hàm này khi vào draw-mode và khi chuyển giải
const showBtn = document.querySelector('.show-btn');
showBtn && showBtn.addEventListener('click', function() {
  updateDrawCardsWithPrizeIcon();
});
document.querySelectorAll('.draw-mode .arrow.left, .draw-mode .arrow.right').forEach(btn => {
  btn.addEventListener('click', function() {
    setTimeout(updateDrawCardsWithPrizeIcon, 10);
  });
});
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
