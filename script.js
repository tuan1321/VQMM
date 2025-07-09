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
};
document.querySelector('.end-btn').onclick = function() {
  document.querySelector('.draw-mode').style.display = 'none';
  document.querySelector('.main-mode').style.display = 'block';
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

bgUpload.onchange = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    prevBg = currBg;
    document.body.style.background = `url('${evt.target.result}') center center/cover no-repeat fixed`;
    currBg = document.body.style.background;
    localStorage.setItem('currBg', currBg);
    bgModal.classList.add('hidden');
  };
  reader.readAsDataURL(file);
};

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
function drawAllCards() {
  let luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
  let luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
  let drawCards = document.querySelectorAll('.draw-card');
  // Random 1 mã thưởng và tên
  let idx = luckyCodes.length > 0 ? Math.floor(Math.random() * luckyCodes.length) : -1;
  let code = idx >= 0 ? luckyCodes[idx] : '';
  let name = (idx >= 0 && idx < luckyNames.length) ? luckyNames[idx] : '';
  let code6 = code ? code.padStart(6, '0') : '000000';
  // Hiệu ứng chuyển số
  let effectDuration = 1500;
  let interval = 50;
  let effectIntervals = [];
  for (let i = 0; i < drawCards.length; i++) {
    effectIntervals[i] = setInterval(() => {
      let randDigit = Math.floor(Math.random() * 10).toString();
      drawCards[i].innerHTML = `<span style='font-size:2.2em;color:#ffd600;'>${randDigit}</span>`;
    }, interval);
  }
  // Hiển thị tên bên dưới dãy số (chỉ 1 lần)
  let nameDiv = document.getElementById('draw-winner-name');
  if (!nameDiv) {
    nameDiv = document.createElement('div');
    nameDiv.id = 'draw-winner-name';
    nameDiv.style = 'margin-top:12px;font-size:1.3em;color:#fff;text-align:center;font-weight:bold;text-shadow:0 2px 8px #000a;';
    drawCards[0].parentNode.parentNode.appendChild(nameDiv);
  }
  nameDiv.textContent = '';
  setTimeout(() => {
    for (let i = 0; i < drawCards.length; i++) {
      clearInterval(effectIntervals[i]);
      drawCards[i].innerHTML = `<span style='font-size:2.2em;color:#ffd600;'>${code6[i] || '0'}</span>`;
    }
    nameDiv.textContent = name || '';
    // Hiển thị màn hình công bố kết quả
    showResultScreen(code6, name);
  }, effectDuration);
}

// Hiển thị màn hình công bố kết quả
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
  // Hiển thị tên
  document.getElementById('result-winner-name').textContent = name || '';
  // Hiển thị giải thưởng và icon
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  let prizeLabel = document.querySelector('.draw-mode .prize-label');
  let prizeName = prizeLabel ? prizeLabel.textContent : '';
  let prizeObj = prizes.find(p => p.name === prizeName);
  document.getElementById('result-prize-label').textContent = prizeName;
  // Hiển thị icon badge
  document.getElementById('result-badge').textContent = prizeObj && prizeObj.icon ? prizeObj.icon : '';
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
  };
}
if (resultBackBtn) {
  resultBackBtn.onclick = function() {
    document.querySelector('.result-mode').style.display = 'none';
    document.querySelector('.draw-mode').style.display = 'flex';
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
const drawBtn = document.querySelector('.draw-btn');
drawBtn && drawBtn.addEventListener('click', function() {
  drawAllCards();
});

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
function updateDrawCardsWithPrizeIcon() {
  const cards = document.querySelectorAll('.draw-card');
  // Lấy icon của giải hiện tại
  let prizes = JSON.parse(localStorage.getItem('prizes'));
  let idx = parseInt(localStorage.getItem('currentPrizeIdx'), 10);
  if (!prizes || !prizes.length) return;
  if (isNaN(idx) || idx < 0 || idx >= prizes.length) idx = 0;
  let icon = prizes[idx].icon || '';
  cards.forEach(card => {
    card.textContent = icon;
    card.classList.add('prize-icon-card');
  });
}
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
