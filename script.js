"use strict";
// Utility functions
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => parent.querySelectorAll(selector);
const getLS = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// JSON File Storage Helper Functions
const JSON_STORAGE = {
  dataFolder: 'vqmm-data',
  
  // Tạo folder data nếu chưa có
  async ensureDataFolder() {
    // Note: Browser không thể tạo folder, sẽ sử dụng filename với prefix
    return Promise.resolve();
  },
  
  // Đọc dữ liệu từ JSON file
  async loadFromFile(filename, defaultValue = null) {
    try {
      // Sử dụng File API để đọc file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      return new Promise((resolve) => {
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) {
            resolve(defaultValue);
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);
              resolve(data);
            } catch (error) {
              console.error('Error parsing JSON file:', error);
              resolve(defaultValue);
            }
          };
          reader.readAsText(file);
        };
        
        // Tự động mở file picker nếu cần
        // input.click();
        
        // Trước tiên thử đọc từ localStorage để migration
        const localData = getLS(filename);
        if (localData !== null) {
          resolve(localData);
        } else {
          resolve(defaultValue);
        }
      });
    } catch (error) {
      console.error('Error loading file:', error);
      return defaultValue;
    }
  },
  
  // Lưu dữ liệu vào JSON file
  async saveToFile(filename, data) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.dataFolder}-${filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Đồng thời lưu vào localStorage để backup
      setLS(filename, data);
      
      console.log(`✅ Đã lưu ${filename} thành công`);
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  },
  
  // Import dữ liệu từ file
  async importFromFile(filename) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            // Lưu vào localStorage để sử dụng ngay
            setLS(filename, data);
            resolve(data);
          } catch (error) {
            console.error('Error parsing imported JSON:', error);
            resolve(null);
          }
        };
        reader.readAsText(file);
      };
      
      input.click();
    });
  },
  
  // Export tất cả dữ liệu
  async exportAllData() {
    const allData = {
      luckyCodes: getLS('luckyCodes') || [],
      luckyNames: getLS('luckyNames') || [],
      luckyPlayers: getLS('luckyPlayers') || [],
      prizes: getLS('prizes') || [],
      winners: getLS('winners') || [],
      currentPrizeIdx: getLS('currentPrizeIdx') || 0,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return this.saveToFile('all-data', allData);
  },
  
  // Import tất cả dữ liệu
  async importAllData() {
    const data = await this.importFromFile('all-data');
    if (data) {
      // Restore tất cả dữ liệu
      if (data.luckyCodes) setLS('luckyCodes', data.luckyCodes);
      if (data.luckyNames) setLS('luckyNames', data.luckyNames);
      if (data.luckyPlayers) setLS('luckyPlayers', data.luckyPlayers);
      if (data.prizes) setLS('prizes', data.prizes);
      if (data.winners) setLS('winners', data.winners);
      if (data.currentPrizeIdx !== undefined) setLS('currentPrizeIdx', data.currentPrizeIdx);
      
      console.log('✅ Đã import tất cả dữ liệu thành công');
      return true;
    }
    return false;
  }
};

// Enhanced storage functions với JSON file support
const getStorageData = async (key, defaultValue = null) => {
  // Trước tiên thử đọc từ localStorage
  const localData = getLS(key);
  return localData !== null ? localData : defaultValue;
};

const setStorageData = async (key, data) => {
  // Lưu vào localStorage
  setLS(key, data);
  
  // Tự động export ra file nếu cần
  if (window.autoExportEnabled) {
    await JSON_STORAGE.saveToFile(key, data);
  }
  
  // Auto backup cho dữ liệu quan trọng
  if (window.autoBackupEnabled && ['winners', 'prizes', 'luckyCodes'].includes(key)) {
    setTimeout(() => {
      JSON_STORAGE.saveToFile(`backup-${key}-${Date.now()}`, data).catch(console.error);
    }, 1000);
  }
  
  return true;
};

// Auto export settings
window.autoExportEnabled = false; // Disabled by default to avoid too many file downloads
window.autoBackupEnabled = false; // Disabled by default

// Toggle functions để người dùng có thể bật/tắt
window.toggleAutoExport = function() {
  window.autoExportEnabled = !window.autoExportEnabled;
  console.log('Auto export:', window.autoExportEnabled ? 'ENABLED' : 'DISABLED');
  showNotification(`Auto export: ${window.autoExportEnabled ? 'BẬT' : 'TẮT'}`, 'info');
  updateStorageStatus();
};

window.toggleAutoBackup = function() {
  window.autoBackupEnabled = !window.autoBackupEnabled;
  console.log('Auto backup:', window.autoBackupEnabled ? 'ENABLED' : 'DISABLED');  
  showNotification(`Auto backup: ${window.autoBackupEnabled ? 'BẬT' : 'TẮT'}`, 'info');
  updateStorageStatus();
};

// Update storage status indicator
function updateStorageStatus() {
  const autoExportStatus = document.getElementById('auto-export-status');
  const autoBackupStatus = document.getElementById('auto-backup-status');
  
  if (autoExportStatus) {
    autoExportStatus.style.display = window.autoExportEnabled ? 'inline' : 'none';
    autoExportStatus.title = 'Auto export đang bật';
  }
  
  if (autoBackupStatus) {
    autoBackupStatus.style.display = window.autoBackupEnabled ? 'inline' : 'none';
    autoBackupStatus.title = 'Auto backup đang bật';
  }
}

// DOM cache
const dom = {
  mainMode: $('.main-mode'),
  drawMode: $('.draw-mode'),
  resultMode: $('.result-mode'),
  showBtn: $('.show-btn'),
  endBtn: $('.end-btn'),
  drawBtn: $('.draw-btn'),
  lockBtn: $('.lock-btn'),
  resultConfirmBtn: $('.result-confirm-btn'),
  resultBackBtn: $('.result-back-btn'),
  bgMusic: $('#bg-music'),
  spinMusic: $('#spin-music'),
  resultMusic: $('#result-music'),
  mainTitle: $('.main-title'),
  mainTitleText: $('.main-title-text'),
  dot: $('.dot'),
  colorInput: $('#titleColorPicker'),
  eventTitleModal: $('#event-title-modal'),
  eventTitleInput: $('#event-title-input'),
  eventTitleForm: $('.event-title-form'),
  // ... add more as needed ...
};

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
  console.log('=== BẮT ĐẦU button clicked ===');
  
  // Debug: Check data first
  const luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
  const luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
  console.log('DEBUG - luckyCodes:', luckyCodes);
  console.log('DEBUG - luckyNames:', luckyNames);
  
  // Simple validation - chỉ kiểm tra có số hay không
  if (luckyCodes.length === 0) {
    console.log('❌ Không có mã số - hiện warning');
    showEmptyListWarning();
    return;
  }
  
  // Warning if names missing but allow continue
  if (luckyNames.length === 0) {
    console.log('⚠️ Warning: Thiếu tên nhưng vẫn cho phép tiếp tục');
    alert('Cảnh báo: Chưa có danh sách tên. Hệ thống sẽ dùng mã số làm tên.');
  }
  
  // Warning if mismatch but allow continue  
  if (luckyCodes.length !== luckyNames.length) {
    console.log('⚠️ Warning: Dữ liệu không khớp nhưng vẫn cho phép tiếp tục');
    alert(`Cảnh báo: Có ${luckyCodes.length} mã số nhưng ${luckyNames.length} tên. Hệ thống sẽ tự động điều chỉnh.`);
  }
  
  console.log('✅ Cho phép vào draw mode');
  
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
  
  // Cập nhật icon giải thưởng trên cards
  updateDrawCardsWithPrizeIcon();
  
  // Cập nhật số người đã trúng thưởng
  updateWinnerCount();
  
  console.log('✅ Chuyển sang draw mode thành công');
};
function showDrawMode() {
  document.querySelector('.main-mode').style.display = 'none';
  document.querySelector('.draw-mode').style.display = 'flex';
  document.body.classList.add('draw-active');
  document.body.classList.remove('result-active');
  document.body.classList.add('hide-title-actions'); // Ẩn nút đổi màu và đổi tên
  
  // Clear result cards nếu có
  const resultCards = document.querySelector('.result-cards');
  if (resultCards) {
    resultCards.innerHTML = '';
  }
  
  // Cập nhật icon giải thưởng trên cards
  updateDrawCardsWithPrizeIcon();
  
  // Cập nhật số người đã trúng thưởng
  updateWinnerCount();
  
  // Log số lượng draw cards để debug
  const drawCards = document.querySelectorAll('.draw-mode .draw-card:not(.result-draw-card)');
  console.log('Draw mode activated. Number of draw cards:', drawCards.length);
}
function showResultMode() {
  document.body.classList.add('result-active');
  document.body.classList.add('hide-title-actions'); // Ẩn nút đổi màu và đổi tên
}
document.querySelector('.end-btn').onclick = function() {
  // Clear tất cả intervals trước khi kết thúc
  clearAllSlotIntervals();
  isSpinning = false;
  
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
    {name: "GIẢI ĐẶC BIỆT", icon: "💎", drawLimitPerTurn: 1},
    {name: "GIẢI NHẤT", icon: "🥇", drawLimitPerTurn: 1},
    {name: "GIẢI NHÌ", icon: "🥈", drawLimitPerTurn: 1},
    {name: "GIẢI BA", icon: "🥉", drawLimitPerTurn: 1}
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
      // Đảm bảo tất cả prizes đều có drawLimitPerTurn
      prizes = prizes.map(prize => ({
        ...prize,
        drawLimitPerTurn: prize.drawLimitPerTurn || 1
      }));
    } else {
      prizes = [...DEFAULT_PRIZES];
    }
    if (!prizes.length) prizes = [...DEFAULT_PRIZES];
  }
  async function savePrizes() {
    await setStorageData('prizes', prizes);
    console.log('✅ Prizes saved to storage');
  }
  async function saveCurrentPrizeIdx() {
    await setStorageData('currentPrizeIdx', currentPrizeIdx);
    console.log('✅ Current prize index saved to storage');
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
    console.log('=== OPENING PRIZE MODAL ===');
    console.log('prizeModal:', prizeModal);
    console.log('prizes:', prizes);
    renderPrizeList();
    prizeModal.classList.remove('hidden');
  }
  function hideModal() {
    console.log('=== CLOSING PRIZE MODAL ===');
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
  console.log('Setting up prize modal event listener:', mainPrizeLabel);
  mainPrizeLabel && mainPrizeLabel.addEventListener('click', function() {
    console.log('Prize label clicked!');
    showModal();
  });
  closeBtn.addEventListener('click', hideModal);
  cancelBtn.addEventListener('click', hideModal);
  prizeModal.addEventListener('click', function(e) {
    if (e.target === prizeModal) hideModal();
  });
  addPrizeBtn.addEventListener('click', function() {
    prizes.push({
      name: '', 
      icon: ICONS[prizes.length % ICONS.length],
      drawLimitPerTurn: 1
    });
    renderPrizeList();
  });
  saveBtn.addEventListener('click', function() {
    console.log('=== SAVE BUTTON CLICKED ===');
    console.log('prizes before save:', prizes);
    prizes = prizes.filter(p => p.name.trim() !== '');
    if (prizes.length === 0) prizes = [...DEFAULT_PRIZES];
    if (currentPrizeIdx >= prizes.length) currentPrizeIdx = prizes.length - 1;
    savePrizes();
    saveCurrentPrizeIdx();
    updateAllPrizeDisplays();
    console.log('prizes after save:', prizes);
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
      console.log('Left arrow clicked');
      if (prizes.length === 0) return;
      currentPrizeIdx = (currentPrizeIdx - 1 + prizes.length) % prizes.length;
      saveCurrentPrizeIdx();
      updateAllPrizeDisplays();
    });
  });
  rightArrows.forEach(btn => {
    btn.addEventListener('click', function() {
      console.log('Right arrow clicked');
      if (prizes.length === 0) return;
      currentPrizeIdx = (currentPrizeIdx + 1) % prizes.length;
      saveCurrentPrizeIdx();
      updateAllPrizeDisplays();
    });
  });
  
  // Thêm double click để mở modal settings
  leftArrows.forEach(btn => {
    btn.addEventListener('dblclick', function() {
      console.log('Left arrow double clicked - opening modal');
      showModal();
    });
  });
  rightArrows.forEach(btn => {
    btn.addEventListener('dblclick', function() {
      console.log('Right arrow double clicked - opening modal');
      showModal();
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
  console.log('=== INITIALIZING PRIZE MANAGEMENT ===');
  loadPrizes();
  loadCurrentPrizeIdx();
  updateAllPrizeDisplays();
  // Cập nhật icon trên draw cards khi load trang
  updateDrawCardsWithPrizeIcon();
  
  // Cập nhật số người trúng thưởng khi load trang
  updateWinnerCount();
  
  console.log('Initialized with prizes:', prizes);
  console.log('Current prize index:', currentPrizeIdx);
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
  updateWinnerCount(prize?.name);
  // Cập nhật icon cho badge ở cả main-mode và draw-mode
  badgeSpans.forEach(badge => { badge.textContent = prize?.icon || ''; });
  
  // Cập nhật icon trên draw cards nếu đang ở draw mode
  if (document.body.classList.contains('draw-active')) {
    updateDrawCardsWithPrizeIcon();
    updateWinnerCount();
  }
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
  console.log('=== showResultScreen called ===');
  console.log('pickedList:', pickedList);
  console.log('pickedList.length:', pickedList ? pickedList.length : 'null');
  
  document.querySelector('.draw-mode').style.display = 'none';
  const resultMode = document.querySelector('.result-mode');
  resultMode.style.display = 'flex';
  const eventTitle = localStorage.getItem('eventTitle') || 'LUCKY DRAW SOFTWARE';
  document.getElementById('result-event-title').textContent = eventTitle;
  document.getElementById('result-prize-label').textContent = prizeObj?.name || '';
  document.getElementById('result-badge').textContent = prizeObj?.icon || '';
  const resultCards = resultMode.querySelector('.result-cards');
  resultCards.innerHTML = '';
  
  // Hiển thị slot kết quả với priority: window.currentDrawCode6 > pickedList[0] > fallback
  let code6 = window.currentDrawCode6 || (pickedList && pickedList[0] && (pickedList[0].code6 || pickedList[0].code)) || '000000';
  
  // Đảm bảo code6 có đủ 6 ký tự
  if (code6 && code6.length < 6) {
    code6 = code6.padStart(6, '0');
  }
  
  console.log('🎯 showResultScreen code consistency:', {
    windowCurrentDrawCode6: window.currentDrawCode6,
    pickedListFirstCode: pickedList && pickedList[0] && (pickedList[0].code6 || pickedList[0].code),
    finalCode6: code6,
    pickedList: pickedList
  });
  for (let i = 0; i < 6; i++) {
    const div = document.createElement('div');
    div.className = 'draw-card result-draw-card'; // Thêm class riêng cho result mode
    div.style.opacity = '1';
    div.innerHTML = `<span style='font-size:2.2em;color:#fff;font-weight:bold;'>${code6[i] || '0'}</span>`;
    resultCards.appendChild(div);
  }
  
  // Hiển thị danh sách tên người trúng (hỗ trợ nhiều winners)
  let winnerNamesDisplay = '';
  if (pickedList && pickedList.length > 1) {
    console.log('=== MULTIPLE WINNERS DETECTED ===');
    console.log('Calling showMultipleWinnersModal with:', pickedList);
    
    // Đảm bảo tất cả winners có đầy đủ thông tin
    pickedList.forEach(winner => {
      if (winner && !winner.code6) {
        winner.code6 = winner.code || '';
      }
    });
    
    // Ẩn result mode trước khi hiển thị modal
    resultMode.style.display = 'none';
    
    // Nhiều winners - hiển thị modal thay vì inline
    showMultipleWinnersModal(pickedList, prizeObj);
    return; // Không tiếp tục hiển thị result screen thông thường
  } else {
    console.log('=== SINGLE WINNER ===');
    // Hiển thị 1 winner với player ID
    const winner = window.currentDrawWinner || (pickedList && pickedList[0]) || {};
    const winnerName = winner.name || '';
    const playerId = winner.playerId || '';
    winnerNamesDisplay = playerId ? `${winnerName} (${playerId})` : winnerName;
    
    // Đảm bảo single winner cũng có đầy đủ thông tin
    if (winner && !winner.code6) {
      winner.code6 = winner.code || '';
    }
  }
  
  const winnerNameEl = document.getElementById('result-winner-name');
  winnerNameEl.innerHTML = winnerNamesDisplay;
  winnerNameEl.style.display = '';
  
  // Phát nhạc và hiệu ứng
  playMusic('result');
  setTimeout(() => { launchFireworks(); }, 300); // Chuyển lại về 300ms như cũ
  const extraTitle = resultMode.querySelector('.main-title');
  if (extraTitle) extraTitle.style.display = 'none';
  document.body.classList.remove('draw-active');
  document.body.classList.add('result-active');
  document.querySelectorAll('.draw-mode .draw-card:not(.result-draw-card)').forEach(card => card.classList.remove('lucky-highlight', 'lucky-blink'));
}

// Function hiển thị modal multiple winners
function showMultipleWinnersModal(winners, prizeObj) {
  console.log('=== showMultipleWinnersModal called ===');
  console.log('winners:', winners);
  console.log('prizeObj:', prizeObj);
  
  const modal = document.getElementById('multiple-winners-modal');
  const prizeTitle = document.getElementById('multiple-winners-prize-title');
  const winnersList = document.querySelector('.multiple-winners-list');
  
  console.log('modal:', modal);
  console.log('modal.classList before:', modal ? modal.classList.toString() : 'null');
  console.log('prizeTitle:', prizeTitle);
  console.log('winnersList:', winnersList);
  
  if (!modal || !prizeTitle || !winnersList) {
    console.error('Modal elements not found!');
    console.error('Missing elements:', {
      modal: !!modal,
      prizeTitle: !!prizeTitle, 
      winnersList: !!winnersList
    });
    return;
  }
  
  // Cập nhật tiêu đề giải
  prizeTitle.textContent = `🎉 ${prizeObj?.name || 'GIẢI THƯỞNG'} - ${winners.length} NGƯỜI TRÚNG 🎉`;
  
  // Tạo danh sách winners với thiết kế mới
  winnersList.innerHTML = '';
  winners.forEach((winner, index) => {
    const item = document.createElement('div');
    item.className = 'multiple-winner-item';
    const playerId = winner.playerId || '';
    const displayName = playerId ? `${winner.name || 'Không có tên'} (${playerId})` : (winner.name || 'Không có tên');
    
    // Đảm bảo winner có đầy đủ thông tin
    const winnerCode = winner.code || winner.code6 || 'N/A';
    const winnerName = winner.name || 'Không có tên';
    
    item.innerHTML = `
      <div class="multiple-winner-info" style="background:linear-gradient(135deg,#2c3e50,#34495e);border:2px solid #ffd600;border-radius:15px;padding:12px;text-align:left;box-shadow:0 8px 24px rgba(0,0,0,0.3),0 0 20px #ffd60055;display:flex;align-items:center;gap:12px;">
        <div class="multiple-winner-rank" style="font-size:1.8rem;font-weight:bold;color:#ffd600;text-shadow:0 2px 8px #000a;min-width:40px;text-align:center;">${index + 1}</div>
        <div class="multiple-winner-details" style="flex:1;display:flex;align-items:center;gap:15px;">
          <div class="multiple-winner-code" style="font-size:1.5rem;font-weight:bold;color:#fff;text-shadow:0 2px 8px #000a;letter-spacing:2px;min-width:110px;">${winnerCode}</div>
          <div class="multiple-winner-name" style="font-size:1.3rem;font-weight:bold;color:#ffd600;text-shadow:0 2px 8px #000a;background:linear-gradient(45deg,#ffd600,#ffed4e);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;flex:1;">${winnerName}</div>
        </div>
      </div>
    `;
    winnersList.appendChild(item);
  });
  
  // Hiển thị modal
  console.log('About to show modal...');
  modal.classList.remove('hidden');
  console.log('modal.classList after remove hidden:', modal.classList.toString());
  console.log('modal.style.display:', modal.style.display);
  
  // Đảm bảo modal được hiển thị
  modal.style.display = 'flex';
  console.log('modal.style.display after set flex:', modal.style.display);
  
  // Phát nhạc và hiệu ứng
  playMusic('result');
  setTimeout(() => { launchFireworks(); }, 500); // Chuyển lại về 500ms như cũ
  
  // Ẩn draw mode và result mode
  console.log('Hiding draw mode and result mode...');
  document.querySelector('.draw-mode').style.display = 'none';
  document.querySelector('.result-mode').style.display = 'none';
  document.body.classList.remove('draw-active');
  document.body.classList.remove('result-active');
  
  console.log('showMultipleWinnersModal completed');
  
  // Debug: kiểm tra modal có hiển thị không sau 1 giây
  setTimeout(() => {
    console.log('=== MODAL STATUS CHECK (1s later) ===');
    console.log('modal.classList:', modal.classList.toString());
    console.log('modal.style.display:', modal.style.display);
    console.log('modal visible?', modal.offsetHeight > 0);
  }, 1000);
}
// Nút xác nhận/quay lại
const resultConfirmBtn = document.querySelector('.result-confirm-btn');
const resultBackBtn = document.querySelector('.result-back-btn');
if (resultConfirmBtn) {
  resultConfirmBtn.onclick = function() {
    console.log('=== resultConfirmBtn clicked ===');
    
    // Sử dụng function mới để lưu winners một cách nhất quán
    saveWinnersToStorage();
    
    // Clear tất cả intervals trước khi quay lại
    clearAllSlotIntervals();
    isSpinning = false;
    
    // Clear result cards trước khi quay lại draw mode
    const resultCards = document.querySelector('.result-cards');
    if (resultCards) {
      resultCards.innerHTML = '';
    }
    
    // Reset giao diện
    document.querySelector('.draw-mode').style.display = 'flex';
    document.querySelector('.result-mode').style.display = 'none';
    document.querySelector('.multiple-winners-modal').classList.add('hidden');
    drawBtn.style.display = '';
    document.body.classList.remove('result-active');
    document.body.classList.add('draw-active');
    document.querySelector('.draw-mode').classList.remove('drawing');
    updateDrawCardsWithPrizeIcon();
    
    // Reset các biến global
    window.currentBatchWinners = null;
    window.currentDrawCode6 = null;
    window.currentDrawWinner = null;
    
    console.log('✅ Single winner confirmed and saved, returned to draw mode');
  };
}
if (resultBackBtn) {
  resultBackBtn.onclick = function() {
    console.log('=== resultBackBtn clicked ===');
    
    // Clear tất cả intervals trước khi quay lại
    clearAllSlotIntervals();
    isSpinning = false;
    
    // Reset các biến global
    window.currentBatchWinners = null;
    window.currentDrawCode6 = null;
    window.currentDrawWinner = null;
    
    // Clear result cards trước khi quay lại draw mode
    const resultCards = document.querySelector('.result-cards');
    if (resultCards) {
      resultCards.innerHTML = '';
    }
    
    // Reset giao diện
    document.querySelector('.result-mode').style.display = 'none';
    document.querySelector('.draw-mode').style.display = 'flex';
    document.querySelector('.multiple-winners-modal').classList.add('hidden');
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
    
    console.log('✅ Multiple winners cancelled, returned to draw mode');
  };
}

// Cập nhật số người đã đạt giải
function updateWinnerCount(prizeName) {
  console.log('=== UPDATING WINNER COUNT ===');
  console.log('Prize name:', prizeName);
  
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx') || '0', 10);
  
  // Tìm prize hiện tại để lấy maxWinners
  const currentPrize = prizes[currentPrizeIdx];
  const prizeWinners = winners.filter(w => w.prize === (prizeName || currentPrize?.name));
  const currentCount = prizeWinners.length;
  const maxWinners = currentPrize?.maxWinners || 0;
  
  console.log('Current winners:', currentCount);
  console.log('Max winners:', maxWinners);
  
  // Cập nhật tất cả các prize-count-num elements
  const countElements = document.querySelectorAll('.prize-count-num');
  countElements.forEach(countEl => {
    if (maxWinners > 0) {
      // Hiển thị dạng "3/10"
      countEl.textContent = `${currentCount}/${maxWinners}`;
      countEl.title = `${currentCount} người đã trúng / ${maxWinners} người tối đa`;
    } else {
      // Hiển thị chỉ số hiện tại nếu không giới hạn
      countEl.textContent = currentCount;
      countEl.title = `${currentCount} người đã trúng (không giới hạn)`;
    }
  });
  
  // Thêm màu sắc và class để phân biệt trạng thái
  countElements.forEach(countEl => {
    // Reset classes
    countEl.classList.remove('full', 'warning', 'normal');
    
    if (maxWinners > 0 && currentCount >= maxWinners) {
      countEl.classList.add('full');
      countEl.style.color = '#ff6b6b'; // Đỏ khi đã đủ
      countEl.style.fontWeight = 'bold';
    } else if (maxWinners > 0 && currentCount >= maxWinners * 0.8) {
      countEl.classList.add('warning');
      countEl.style.color = '#ffa726'; // Cam khi gần đủ
      countEl.style.fontWeight = 'bold';
    } else {
      countEl.classList.add('normal');
      countEl.style.color = '#4caf50'; // Xanh khi còn có thể quay
      countEl.style.fontWeight = 'normal';
    }
  });
  
  console.log('Winner count updated:', currentCount, '/', maxWinners);
}

function updatePrizeCount(prizeName) {
  console.log('=== UPDATING PRIZE COUNT ===');
  updateWinnerCount(prizeName); // Sử dụng function mới
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
  card.innerHTML = `<span style="font-size:2.8em;font-weight:bold;color:#fff;display:inline-block;width:100%;text-align:center;font-family:'Arial Black','Arial',sans-serif;">${num}</span>`;
}

// Central validation and spin function  
function validateAndStartSpin() {
  console.log('=== validateAndStartSpin called ===');
  
  // Kiểm tra đang spinning
  if (isSpinning) {
    console.log('Already spinning, ignoring request');
    return false;
  }
  
  // Đảm bảo clear tất cả intervals trước khi bắt đầu
  clearAllSlotIntervals();
  
  // Kiểm tra số lượng draw cards
  const drawCards = document.querySelectorAll('.draw-mode .draw-card:not(.result-draw-card)');
  console.log('Number of draw cards found:', drawCards.length);
  
  // Simple validation - chỉ cần có số là được
  const luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
  if (luckyCodes.length === 0) {
    console.log('❌ Không có mã số để quay');
    showEmptyListWarning();
    return false;
  }
  
  console.log('✅ Có mã số - bắt đầu quay số');
  
  // Phát âm thanh khi bắt đầu quay
  playSound('spinStart');
  playSound('rolling');
  
  // Bắt đầu quay
  startSlotSpin();
  
  // Cập nhật UI
  const drawBtn = document.querySelector('.draw-btn');
  const lockBtn = document.querySelector('.lock-btn');
  if (drawBtn) drawBtn.style.display = 'none';
  if (lockBtn) lockBtn.style.display = '';
  
  return true;
}

function startSlotSpin() {
  console.log('=== startSlotSpin called ===');
  const drawCards = document.querySelectorAll('.draw-mode .draw-card:not(.result-draw-card)');
  
  // Clear tất cả intervals cũ trước khi tạo mới
  clearAllSlotIntervals();
  
  // Đảm bảo tất cả intervals được clear hoàn toàn trước khi tạo mới
  setTimeout(() => {
    isSpinning = true;
    console.log('Set isSpinning = true');
    console.log('Creating new intervals with 60ms delay');
    console.log('Found', drawCards.length, 'draw cards to animate');
    
    drawCards.forEach((card, idx) => {
      slotIntervals[idx] = setInterval(() => {
        setSlotNumber(card, Math.floor(Math.random() * 10));
      }, 60); // Chuyển lại về 60ms như cũ
      console.log(`Created interval ${idx} with ID:`, slotIntervals[idx]);
      card.classList.remove('lucky-highlight', 'lucky-blink');
    });
    // Ẩn tên người trúng nếu có
    const nameDiv = document.getElementById('draw-winner-name');
    if (nameDiv) nameDiv.textContent = '';
  }, 10); // Delay nhỏ để đảm bảo clear hoàn toàn
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
    // Clear tất cả intervals trước khi reset
    clearAllSlotIntervals();
    isSpinning = false;
    
    // Lưu vào winners - sử dụng logic mới để xử lý cả single và batch
    saveWinnersToStorage();
    
    // Ẩn nút, reset giao diện về quay số
    btnWrap.style.display = 'none';
    document.querySelector('.draw-mode').classList.remove('drawing');
    document.querySelector('.draw-mode').classList.add('not-picked');
    document.getElementById('draw-winner-name').innerHTML = '';
    document.querySelectorAll('.draw-mode .draw-card:not(.result-draw-card)').forEach(card => card.classList.remove('lucky-highlight', 'lucky-blink'));
    // KHÔNG hiện lại nút quay số ở đây
    document.querySelector('.lock-btn').style.display = 'none';
  };
  document.getElementById('draw-back-btn').onclick = function() {
    // Clear tất cả intervals trước khi reset
    clearAllSlotIntervals();
    isSpinning = false;
    
    // Không lưu, chỉ reset giao diện về quay số
    btnWrap.style.display = 'none';
    document.querySelector('.draw-mode').classList.remove('drawing');
    document.querySelector('.draw-mode').classList.add('not-picked');
    document.getElementById('draw-winner-name').innerHTML = '';
    document.querySelectorAll('.draw-mode .draw-card:not(.result-draw-card)').forEach(card => card.classList.remove('lucky-highlight', 'lucky-blink'));
    document.querySelector('.lock-btn').style.display = 'none';
    // KHÔNG hiện lại nút quay số ở đây
  };
}

// Function mới để lưu winners vào storage một cách nhất quán
async function saveWinnersToStorage() {
  console.log('=== saveWinnersToStorage called ===');
  
  let winners = await getStorageData('winners', []);
  const currentPrize = getCurrentPrize();
  
  // Xử lý batch winners nếu có
  if (window.currentBatchWinners && window.currentBatchWinners.length > 0) {
    console.log(`🏆 Saving ${window.currentBatchWinners.length} batch winners`);
    console.log('currentBatchWinners:', window.currentBatchWinners);
    
    let savedCount = 0;
    window.currentBatchWinners.forEach((winner, index) => {
      const rawCode = winner.code || winner.code6 || '';
      const formattedCode = rawCode.padStart(6, '0');
      
      const winnerData = {
        code: formattedCode,
        name: winner.name || '',
        playerId: winner.playerId || '',
        prize: currentPrize,
        timestamp: new Date().toISOString(),
        datetime: new Date().toLocaleString('vi-VN'),
        originalCode: winner.originalCode || rawCode
      };
      
      console.log(`🔍 Saving batch winner ${index + 1}/${window.currentBatchWinners.length}:`, {
        inputCode: rawCode,
        formattedCode: formattedCode,
        winnerData: winnerData
      });
      
      winners.push(winnerData);
      savedCount++;
      console.log(`✅ Added winner ${index + 1}: ${winnerData.name} (${winnerData.code})`);
    });
    
    console.log(`🏁 Batch save completed: ${savedCount}/${window.currentBatchWinners.length} winners saved`);
    
    // Clear batch winners sau khi lưu
    window.currentBatchWinners = null;
    
  } else {
    // Xử lý single winner
    console.log('Saving single winner');
    
    const rawCode = window.currentDrawCode6 || '';
    const formattedCode = rawCode.padStart(6, '0');
    
    const winnerData = {
      code: formattedCode,
      name: window.currentDrawWinner?.name || '',
      playerId: window.currentDrawWinner?.playerId || '',
      prize: currentPrize,
      timestamp: new Date().toISOString(),
      datetime: new Date().toLocaleString('vi-VN'),
      originalCode: window.currentDrawWinner?.originalCode || rawCode
    };
    
    console.log('🔍 Saving single winner:', {
      inputCode: rawCode,
      formattedCode: formattedCode,
      winnerData: winnerData
    });
    
    winners.push(winnerData);
    console.log('Added single winner:', winnerData);
  }
  
  // Lưu vào enhanced storage
  await setStorageData('winners', winners);
  
  // Cập nhật số người đã đạt giải
  updateWinnerCount();
  
  // Kiểm tra và tự động chuyển giải nếu cần
  const autoSwitched = checkAndAutoSwitchPrize();
  
  if (autoSwitched) {
    console.log('🔄 Prize auto-switched after saving winners');
  }
  
  console.log('✅ Winners saved successfully. Total winners:', winners.length);
  
  // Show notification với số lượng batch winners chính xác
  const batchCount = window.currentBatchWinners ? window.currentBatchWinners.length : 1;
  showNotification(`✅ Đã lưu ${batchCount} người thắng cuộc`, 'success');
}

// Sửa lại stopSlotSpinWithLucky: sau khi quay xong, chuyển sang màn hình kết quả
function stopSlotSpinWithLucky(code, name) {
  console.log('=== stopSlotSpinWithLucky called ===');
  console.log('Input code:', code, 'name:', name);
  stopRollingAudio(); // Dừng rolling.mp3 ngay khi bấm CHỐT
  playSound('slotStop'); // Phát slot-stop.mp3 lặp lại liên tục
  const drawCards = document.querySelectorAll('.draw-mode .draw-card:not(.result-draw-card)');
  code = (code || '').slice(0, drawCards.length);
  const slotCount = drawCards.length;
  const slotDelay = slotCount > 0 ? 4000 / slotCount : 400; // ms - Chuyển lại như cũ
  drawCards.forEach((card, idx) => {
    // Clear interval cũ nếu có
    if (slotIntervals[idx]) {
      console.log(`Clearing old interval ${idx} with ID:`, slotIntervals[idx]);
      clearInterval(slotIntervals[idx]);
    }
    slotIntervals[idx] = setInterval(() => {
      setSlotNumber(card, Math.floor(Math.random() * 10));
    }, 20); // Chuyển lại về 20ms như cũ
    console.log(`Created new fast interval ${idx} with ID:`, slotIntervals[idx], 'at 20ms');
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
        // Ensure code is properly formatted as 6 digits
        const formattedCode = codeOnSlot.padStart(6, '0');
        window.currentDrawCode6 = formattedCode;
        window.currentDrawWinner = { 
          code: formattedCode, 
          name: name, 
          code6: formattedCode, 
          originalCode: code, // Keep original for reference
          prize: getCurrentPrize() 
        };
        
        console.log('🔍 Code display consistency check:', {
          inputCode: code,
          codeOnSlot: codeOnSlot,
          formattedCode: formattedCode,
          finalDrawCode6: window.currentDrawCode6
        });
        console.log('Set window.currentDrawCode6:', window.currentDrawCode6);
        console.log('Set window.currentDrawWinner:', window.currentDrawWinner);
        playSound('result'); // Âm thanh công bố kết quả
        
        // Sử dụng toàn bộ winners nếu có quay hàng loạt
        const winnersToShow = window.currentBatchWinners || [{ 
          code6: formattedCode, 
          code: formattedCode,
          name: name 
        }];
        console.log('=== CALLING showResultScreen ===');
        console.log('winnersToShow:', winnersToShow);
        console.log('winnersToShow.length:', winnersToShow.length);
        console.log('window.currentBatchWinners:', window.currentBatchWinners);
        console.log('Current prize info:', { name: getCurrentPrize(), icon: getCurrentPrizeIcon() });
        
        try {
          showResultScreen(winnersToShow, { name: getCurrentPrize(), icon: getCurrentPrizeIcon() });
        } catch (error) {
          console.error('Error in showResultScreen:', error);
        }
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

// Biến toàn cục quản lý audio
let rollingAudio = null;
let slotStopAudio = null;

// Function để clear tất cả slot intervals
function clearAllSlotIntervals() {
  console.log('=== clearAllSlotIntervals called ===');
  if (slotIntervals && slotIntervals.length > 0) {
    console.log('Clearing', slotIntervals.length, 'intervals');
    slotIntervals.forEach((interval, idx) => {
      if (interval) {
        console.log(`Clearing interval ${idx} with ID:`, interval);
        clearInterval(interval);
      }
    });
    slotIntervals = [];
    console.log('All intervals cleared, slotIntervals reset to:', slotIntervals);
  } else {
    console.log('No intervals to clear');
  }
}



// Function update draw cards with prize icon
function updateDrawCardsWithPrizeIcon() {
  console.log('=== updateDrawCardsWithPrizeIcon called ===');
  // Lấy icon của giải hiện tại
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[{"name":"GIẢI ĐẶC BIỆT","icon":"💎"},{"name":"GIẢI NHẤT","icon":"🥇"},{"name":"GIẢI NHÌ","icon":"🥈"},{"name":"GIẢI BA","icon":"🥉"}]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx'), 10) || 0;
  const icon = prizes[currentPrizeIdx]?.icon || '⭐';
  
  console.log('Current prize:', prizes[currentPrizeIdx]);
  console.log('Using icon:', icon);
  
  document.querySelectorAll('.draw-mode .draw-card:not(.result-draw-card)').forEach((card, index) => {
    card.innerHTML = `<span style="font-size:2.5em;font-weight:bold;color:#fff;display:inline-block;width:100%;text-align:center;">${icon}</span>`;
    card.classList.remove('lucky-highlight', 'lucky-blink');
    console.log(`Updated card ${index} with icon:`, icon);
  });
}

// Các function âm thanh
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
    rollingAudio.play().catch(() => {});
  } else if (key === 'slotStop') {
    if (!slotStopAudio) slotStopAudio = audio;
    slotStopAudio.currentTime = 0;
    slotStopAudio.loop = true;
    slotStopAudio.play().catch(() => {});
  } else {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

function stopRollingAudio() {
  if (rollingAudio) {
    rollingAudio.pause();
    rollingAudio.currentTime = 0;
    rollingAudio.loop = false;
  }
}

function stopSlotStopAudio() {
  if (slotStopAudio) {
    slotStopAudio.pause();
    slotStopAudio.currentTime = 0;
    slotStopAudio.loop = false;
  }
}

// Function playMusic
function playMusic(key) {
  const audio = document.getElementById(key === 'result' ? 'result-fanfare' : 'bg-music');
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

// Disable old event listener - sẽ được thay thế bởi enhanced version bên dưới
// if (drawBtn && lockBtn) {
//   drawBtn.addEventListener('click', function() {
//     if (isSpinning) return;
//     drawBtn.style.display = 'none';
//     lockBtn.style.display = '';
//     
//     // Phát âm thanh khi bắt đầu quay
//     playSound('spinStart');
//     playSound('rolling');
//     
//     startSlotSpin();
//   });
// }

// ==== LOGIC MODAL LUCKY LIST ====
// Click vào các card để mở modal nhập mã số
document.addEventListener('DOMContentLoaded', function() {
  const mainModeCards = document.querySelectorAll('.main-mode .card');
  const luckyListModal = document.getElementById('lucky-list-modal');
  const luckyListClose = document.querySelector('.lucky-list-modal-close');
  const luckyListCancel = document.querySelector('.lucky-list-cancel-btn');
  const luckyListSave = document.querySelector('.lucky-list-save-btn');
  const luckyListDraw = document.querySelector('.lucky-list-draw-btn');
  const autoGenBtn = document.getElementById('auto-generate-btn');
  const luckyCodeList = document.getElementById('lucky-code-list');
  const luckyNameList = document.getElementById('lucky-name-list');
  const luckyPlayerList = document.getElementById('lucky-player-list');
  const luckyCodeCount = document.getElementById('lucky-code-count');
  const luckyNameCount = document.getElementById('lucky-name-count');
  const luckyPlayerCount = document.getElementById('lucky-player-count');
  const autoFrom = document.getElementById('auto-from');
  const autoTo = document.getElementById('auto-to');

  // Event listener cho click vào card
  mainModeCards.forEach(card => {
    card.addEventListener('click', function() {
      openLuckyListModal();
    });
  });

  function openLuckyListModal() {
    if (luckyListModal) {
      luckyListModal.classList.remove('hidden');
      loadExistingData();
      updateCounts();
    }
  }

  function closeLuckyListModal() {
    if (luckyListModal) {
      luckyListModal.classList.add('hidden');
    }
  }

  function loadExistingData() {
    const codes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
    const names = JSON.parse(localStorage.getItem('luckyNames') || '[]');
    const players = JSON.parse(localStorage.getItem('luckyPlayers') || '[]');
    if (luckyCodeList) luckyCodeList.value = codes.join('\n');
    if (luckyNameList) luckyNameList.value = names.join('\n');
    if (luckyPlayerList) luckyPlayerList.value = players.join('\n');
  }

  function updateCounts() {
    if (!luckyCodeList || !luckyNameList) return;
    const codes = luckyCodeList.value.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    const names = luckyNameList.value.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    const players = luckyPlayerList ? luckyPlayerList.value.split(/\n|,/).map(s => s.trim()).filter(Boolean) : [];
    
    if (luckyCodeCount) luckyCodeCount.textContent = codes.length;
    if (luckyNameCount) luckyNameCount.textContent = names.length;
    if (luckyPlayerCount) {
      // Đếm số người chơi unique
      const uniquePlayers = [...new Set(players)];
      luckyPlayerCount.textContent = uniquePlayers.length;
    }
  }

  async function saveLuckyList() {
    if (!luckyCodeList || !luckyNameList) return;
    const codes = luckyCodeList.value.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    const names = luckyNameList.value.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    const players = luckyPlayerList ? luckyPlayerList.value.split(/\n|,/).map(s => s.trim()).filter(Boolean) : [];
    
    // Tự động tạo player IDs nếu không có
    if (players.length === 0 && codes.length > 0) {
      const uniqueNames = [...new Set(names)];
      const nameToPlayerMap = {};
      uniqueNames.forEach((name, index) => {
        nameToPlayerMap[name] = `P${(index + 1).toString().padStart(3, '0')}`;
      });
      
      // Tạo player list dựa trên tên
      for (let i = 0; i < names.length; i++) {
        players.push(nameToPlayerMap[names[i]] || `P${(i + 1).toString().padStart(3, '0')}`);
      }
      
      // Cập nhật textarea
      if (luckyPlayerList) {
        luckyPlayerList.value = players.join('\n');
      }
    }
    
    // Sử dụng enhanced storage functions
    await setStorageData('luckyCodes', codes);
    await setStorageData('luckyNames', names);
    await setStorageData('luckyPlayers', players);
    
    console.log('✅ Đã lưu:', codes.length, 'mã số,', names.length, 'tên, và', players.length, 'player IDs');
    
    // Show notification
    showNotification(`✅ Đã lưu ${codes.length} mã số và ${names.length} tên`, 'success');
  }

  // Event listeners
  if (luckyCodeList && luckyNameList) {
    luckyCodeList.addEventListener('input', updateCounts);
    luckyNameList.addEventListener('input', updateCounts);
    if (luckyPlayerList) {
      luckyPlayerList.addEventListener('input', updateCounts);
    }
  }

  if (autoGenBtn) {
    autoGenBtn.addEventListener('click', function() {
      let from = parseInt(autoFrom.value, 10) || 1;
      let to = parseInt(autoTo.value, 10) || 1;
      if (from > to) [from, to] = [to, from];
      const codes = [];
      for (let i = from; i <= to; ++i) codes.push(i.toString().padStart(6, '0'));
      luckyCodeList.value = codes.join('\n');
      updateCounts();
    });
  }

  if (luckyListClose) luckyListClose.addEventListener('click', closeLuckyListModal);
  if (luckyListCancel) luckyListCancel.addEventListener('click', closeLuckyListModal);

  if (luckyListSave) {
    luckyListSave.addEventListener('click', function() {
      saveLuckyList();
      closeLuckyListModal();
    });
  }

  if (luckyListDraw) {
    luckyListDraw.addEventListener('click', function() {
      console.log('=== Lucky List QUAY SỐ button clicked ===');
      
      // Lưu dữ liệu trước
      saveLuckyList();
      
      // Kiểm tra đơn giản - chỉ cần có mã số
      const codes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
      if (codes.length === 0) {
        console.log('❌ Không có mã số');
        alert('Vui lòng nhập ít nhất 1 mã số!');
        return;
      }
      
      console.log('✅ Có mã số - cho phép chuyển mode');
      
      closeLuckyListModal();
      // Chuyển sang draw mode
      document.querySelector('.main-mode').style.display = 'none';
      document.querySelector('.draw-mode').style.display = 'flex';
      document.body.classList.add('draw-active');
      
      // Cập nhật displays
      updateDrawCardsWithPrizeIcon();
      updateWinnerCount();
      
      console.log('✅ Lucky list → draw mode thành công');
    });
  }
});

// ==== MULTIPLE WINNERS MODAL LOGIC ====
document.addEventListener('DOMContentLoaded', function() {
  console.log('=== SETTING UP MULTIPLE WINNERS MODAL LOGIC ===');
  const multipleWinnersModal = document.getElementById('multiple-winners-modal');
  const multipleWinnersClose = document.querySelector('.multiple-winners-modal-close');
  const multipleWinnersConfirm = document.querySelector('.multiple-winners-confirm-btn');
  const multipleWinnersBack = document.querySelector('.multiple-winners-back-btn');
  
  console.log('Modal elements found:');
  console.log('multipleWinnersModal:', multipleWinnersModal);
  console.log('multipleWinnersClose:', multipleWinnersClose);
  console.log('multipleWinnersConfirm:', multipleWinnersConfirm);
  console.log('multipleWinnersBack:', multipleWinnersBack);

  // Đóng modal
  if (multipleWinnersClose) {
    console.log('Setting up close button event listener');
    multipleWinnersClose.onclick = function() {
      console.log('=== CLOSE BUTTON CLICKED ===');
      // Clear tất cả intervals trước khi quay lại
      clearAllSlotIntervals();
      isSpinning = false;
      
      // Clear result cards trước khi quay lại draw mode
      const resultCards = document.querySelector('.result-cards');
      if (resultCards) {
        resultCards.innerHTML = '';
      }
      
      multipleWinnersModal.classList.add('hidden');
      multipleWinnersModal.style.display = 'none';
      // Quay lại draw mode
      document.querySelector('.draw-mode').style.display = 'flex';
      document.querySelector('.draw-btn').style.display = '';
      document.body.classList.add('draw-active');
      document.body.classList.remove('result-active');
      updateDrawCardsWithPrizeIcon();
    };
  } else {
    console.warn('multipleWinnersClose button not found!');
  }

  // Xác nhận tất cả winners
  if (multipleWinnersConfirm) {
    console.log('Setting up confirm button event listener');
    multipleWinnersConfirm.onclick = function() {
      console.log('=== CONFIRM BUTTON CLICKED ===');
      console.log('window.currentBatchWinners:', window.currentBatchWinners);
      // Lấy tên prize từ localStorage thay vì DOM để tránh bị cắt
      const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
      const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx') || '0', 10);
      const currentPrize = prizes[currentPrizeIdx];
      const prizeName = currentPrize?.name || 'Không xác định';
      
      console.log('🎯 Prize name extraction:', {
        currentPrizeIdx: currentPrizeIdx,
        currentPrize: currentPrize,
        prizeName: prizeName,
        fullPrizeName: currentPrize?.name
      });
      
    let luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
    let luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
      let winners = JSON.parse(localStorage.getItem('winners') || '[]');
      
      // Xử lý tất cả winners từ currentBatchWinners
      if (window.currentBatchWinners && window.currentBatchWinners.length > 0) {
        console.log(`🏆 Multiple winners confirm: Processing ${window.currentBatchWinners.length} winners`);
        
        let processedCount = 0;
        window.currentBatchWinners.forEach((winner, index) => {
          const code6 = winner.code || winner.code6 || '';
          const name = winner.name || `User_${code6}` || 'Không có tên'; // Fallback tên nếu bị thiếu
          const playerId = winner.playerId || '';
          
          console.log(`📝 Processing winner ${index + 1}/${window.currentBatchWinners.length}:`, {
            winner: winner,
            code: code6,
            name: name,
            playerId: playerId
          });
          
          // Lưu vào danh sách winners với timestamp
          const winnerData = {
            code: code6, 
            name: name, 
            playerId: playerId,
            prize: prizeName,
            timestamp: new Date().toISOString(),
            datetime: new Date().toLocaleString('vi-VN')
          };
          
          console.log(`💾 Saving winner ${index + 1}:`, winnerData);
          winners.push(winnerData);
          processedCount++;
        });
        
        console.log(`✅ Multiple winners processed: ${processedCount}/${window.currentBatchWinners.length} saved`);
        
        // Clear batch winners sau khi xử lý
        window.currentBatchWinners = null;
      }
      
      // Lưu thay đổi vào localStorage
      localStorage.setItem('luckyCodes', JSON.stringify(luckyCodes));
      localStorage.setItem('luckyNames', JSON.stringify(luckyNames));
    localStorage.setItem('winners', JSON.stringify(winners));
      
      console.log('Saved multiple winners:', winners.length, 'total winners');
      
      // Cập nhật số người trúng thưởng với tên prize chính xác
      console.log('🔄 Updating winner count after batch confirm...');
      updateWinnerCount(prizeName);
      
      // Kiểm tra và tự động chuyển giải nếu cần
      const autoSwitched = checkAndAutoSwitchPrize();
      
      // ❌ REMOVED: saveWinnersToStorage() - đã save manual ở trên rồi
      // Tránh duplicate save gây ra duplicate winners
      
      // Clear tất cả intervals trước khi quay lại
      clearAllSlotIntervals();
      isSpinning = false;
      
      // Reset các biến global
      window.currentBatchWinners = null;
      window.currentDrawCode6 = null;
      window.currentDrawWinner = null;
      
      // Clear result cards trước khi quay lại draw mode
      const resultCards = document.querySelector('.result-cards');
      if (resultCards) {
        resultCards.innerHTML = '';
      }
      
      // Đóng modal và quay lại draw mode
      multipleWinnersModal.classList.add('hidden');
      multipleWinnersModal.style.display = 'none';
      document.querySelector('.draw-mode').style.display = 'flex';
      document.querySelector('.draw-btn').style.display = '';
      document.body.classList.add('draw-active');
      document.body.classList.remove('result-active');
      
      // Reset draw mode
      updateDrawCardsWithPrizeIcon();
      
      if (autoSwitched) {
        console.log('🔄 Prize auto-switched after multiple winners confirm');
      }
      
      console.log('✅ Multiple winners confirmed and saved successfully');
    };
  } else {
    console.warn('multipleWinnersConfirm button not found!');
  }

  // Quay lại
  if (multipleWinnersBack) {
    console.log('Setting up back button event listener');
    multipleWinnersBack.onclick = function() {
      console.log('=== BACK BUTTON CLICKED ===');
      
      // Clear tất cả intervals trước khi quay lại
      clearAllSlotIntervals();
      isSpinning = false;
      
      // Reset các biến global
      window.currentBatchWinners = null;
      window.currentDrawCode6 = null;
      window.currentDrawWinner = null;
      
      // Clear result cards trước khi quay lại draw mode
      const resultCards = document.querySelector('.result-cards');
      if (resultCards) {
        resultCards.innerHTML = '';
      }
      
      // Không lưu, chỉ quay lại draw mode
      multipleWinnersModal.classList.add('hidden');
      multipleWinnersModal.style.display = 'none';
      document.querySelector('.draw-mode').style.display = 'flex';
      document.querySelector('.draw-btn').style.display = '';
      document.body.classList.add('draw-active');
      document.body.classList.remove('result-active');
      
      // Reset draw mode
      updateDrawCardsWithPrizeIcon();
      
      console.log('✅ Multiple winners cancelled, returned to draw mode');
    };
  } else {
    console.warn('multipleWinnersBack button not found!');
  }

  // Click ngoài modal để đóng
  if (multipleWinnersModal) {
    multipleWinnersModal.addEventListener('click', function(e) {
      if (e.target === multipleWinnersModal) {
        multipleWinnersClose.click();
      }
    });
  }
});

// Function để lấy thông tin giải đầy đủ bao gồm drawLimitPerTurn
function getCurrentPrizeInfo() {
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx') || '0', 10);
  return prizes[currentPrizeIdx] || null;
}

// DEBUG FUNCTION - Có thể xóa sau khi test xong
function debugBatchDraw() {
  console.log('=== DEBUG BATCH DRAW INFO ===');
  console.log('localStorage prizes:', localStorage.getItem('prizes'));
  console.log('localStorage currentPrizeIdx:', localStorage.getItem('currentPrizeIdx'));
  console.log('localStorage luckyCodes:', localStorage.getItem('luckyCodes'));
  console.log('localStorage luckyNames:', localStorage.getItem('luckyNames'));
  const currentPrize = getCurrentPrizeInfo();
  console.log('currentPrize object:', currentPrize);
  if (currentPrize) {
    console.log('drawLimitPerTurn:', currentPrize.drawLimitPerTurn);
  }
  
  // Test với giải hiện tại
  const prizeLabel = document.querySelector('.draw-mode .prize-label');
  console.log('Current prize label:', prizeLabel ? prizeLabel.textContent : 'Not found');
  
  return currentPrize;
}

// Thêm event listener cho shortcut key để debug
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    debugBatchDraw();
  }
});

// Clear intervals khi trang được unload để tránh memory leak
window.addEventListener('beforeunload', function() {
  clearAllSlotIntervals();
});

// Enhanced lockBtn event listener with batch drawing capability
if (drawBtn && lockBtn) {
  console.log('=== SETTING UP DRAW AND LOCK BUTTONS ===');
  console.log('drawBtn:', drawBtn);
  console.log('lockBtn:', lockBtn);
  
  // Backup original click handler if exists
  const originalLockHandler = lockBtn.onclick;
  
  // Thêm drawBtn handler nếu chưa có
  if (!drawBtn.onclick) {
    drawBtn.onclick = function() {
      console.log('=== DRAW BUTTON CLICKED ===');
      
      // Force clear tất cả intervals trước khi bắt đầu
      clearAllSlotIntervals();
      
      if (isSpinning) {
        console.log('Already spinning, ignoring click');
        return;
      }
      
            // Sử dụng central validation function
      if (!validateAndStartSpin()) {
        return;
      }
    };
  }
  
  // Replace with new enhanced handler
  lockBtn.onclick = function() {
    console.log('=== CHỐT button clicked ===');
    console.log('isSpinning:', isSpinning);
    console.log('drawBtn.style.display:', drawBtn.style.display);
    console.log('lockBtn.style.display:', lockBtn.style.display);
    
    // Force clear tất cả intervals trước khi chốt
    clearAllSlotIntervals();
    
    if (!isSpinning) {
      console.log('CHỐT bị block vì isSpinning = false');
        return;
    }
    
    drawBtn.style.display = 'none'; // Ẩn nút quay số ngay khi bấm chốt
    
    // Lấy thông tin giải hiện tại
    const currentPrize = getCurrentPrizeInfo();
    const drawLimit = currentPrize ? (currentPrize.drawLimitPerTurn || 1) : 1;
    
    // Debug log - có thể xóa sau khi test xong
    console.log('=== DEBUG QUAY HÀNG LOẠT ===');
    console.log('currentPrize:', currentPrize);
    console.log('drawLimit:', drawLimit);
    
    // Lấy danh sách mã số, tên và player IDs
    let luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
    let luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
    let luckyPlayers = JSON.parse(localStorage.getItem('luckyPlayers') || '[]');
    
    // Đảm bảo có đủ mã để quay
    const availableCount = luckyCodes.length;
    const actualDrawCount = Math.min(drawLimit, availableCount);
    
    console.log('availableCount:', availableCount, 'actualDrawCount:', actualDrawCount);
    
    if (actualDrawCount === 0) {
      showEmptyListWarning('Đã hết số để quay!', 'Danh sách mã số đã được sử dụng hết. Hãy thêm thêm số mới để tiếp tục.');
    isSpinning = false;
    lockBtn.style.display = 'none';
      drawBtn.style.display = '';
      return;
    }
    
    if (actualDrawCount === 1) {
      // Single draw - use new player-based logic
      let idx = Math.floor(Math.random() * luckyCodes.length);
      const originalCode = luckyCodes[idx] || '';
      luckyCode = originalCode.padStart(6, '0');
      luckyName = luckyNames[idx] || '';
      const selectedPlayerId = luckyPlayers[idx] || '';
      
      console.log('🎯 Single draw picked:', {
        originalCode: originalCode,
        formattedCode: luckyCode,
        name: luckyName,
        playerId: selectedPlayerId,
        index: idx
      });
      window.currentBatchWinners = null; // Clear batch winners
      
      // Loại bỏ tất cả mã của người chơi này
      const codesToRemove = [];
      const namesToRemove = [];
      const playersToRemove = [];
      
      for (let i = 0; i < luckyCodes.length; i++) {
        if (luckyPlayers[i] === selectedPlayerId) {
          codesToRemove.push(i);
        }
      }
      
      // Xóa từ cuối lên để không ảnh hưởng đến index
      for (let i = codesToRemove.length - 1; i >= 0; i--) {
        const removeIdx = codesToRemove[i];
        luckyCodes.splice(removeIdx, 1);
        if (removeIdx < luckyNames.length) luckyNames.splice(removeIdx, 1);
        if (removeIdx < luckyPlayers.length) luckyPlayers.splice(removeIdx, 1);
      }
      
      // Lưu lại danh sách đã cập nhật
      localStorage.setItem('luckyCodes', JSON.stringify(luckyCodes));
      localStorage.setItem('luckyNames', JSON.stringify(luckyNames));
      localStorage.setItem('luckyPlayers', JSON.stringify(luckyPlayers));
      
      console.log(`Người chơi ${selectedPlayerId} (${luckyName}) đã trúng. Đã loại bỏ ${codesToRemove.length} mã của người này.`);
      
    } else {
      // Batch draw - fixed logic with proper player consideration
      const selectedWinners = [];
      const tempCodes = [...luckyCodes];
      const tempNames = [...luckyNames];
      const tempPlayers = [...luckyPlayers];
      const selectedPlayerIds = new Set(); // Track selected players to avoid duplicates
      
      console.log(`🎯 Starting batch draw for ${actualDrawCount} winners`);
      console.log(`📊 Available: ${tempCodes.length} codes, ${tempNames.length} names, ${tempPlayers.length} players`);
      
      let attempts = 0;
      const maxAttempts = actualDrawCount * 10; // Prevent infinite loop
      
      while (selectedWinners.length < actualDrawCount && tempCodes.length > 0 && attempts < maxAttempts) {
        attempts++;
        const idx = Math.floor(Math.random() * tempCodes.length);
        const originalCode = tempCodes[idx] || '';
        const code = originalCode.padStart(6, '0');
        const name = tempNames[idx] || '';
        const playerId = tempPlayers[idx] || `UNIQUE_${Date.now()}_${attempts}`;
        
        // Skip if this player is already selected
        if (selectedPlayerIds.has(playerId)) {
          console.log(`⏭️ Skipping duplicate player: ${playerId}`);
          continue;
        }
        
        console.log(`🎯 Batch draw ${selectedWinners.length + 1}/${actualDrawCount} picked:`, {
          originalCode: originalCode,
          formattedCode: code,
          name: name,
          playerId: playerId,
          index: idx,
          attempt: attempts
        });
        
        selectedWinners.push({ 
          code, 
          code6: code,
          originalCode: originalCode,
          name, 
          playerId 
        });
        
        selectedPlayerIds.add(playerId);
        
        // Loại bỏ tất cả mã của người chơi này khỏi temp arrays
        const codesToRemove = [];
        for (let j = tempCodes.length - 1; j >= 0; j--) { // Iterate backwards
          if (tempPlayers[j] === playerId) {
            codesToRemove.push(j);
          }
        }
        
        // Remove all codes of this player (backwards to maintain indices)
        codesToRemove.forEach(removeIdx => {
          tempCodes.splice(removeIdx, 1);
          if (removeIdx < tempNames.length) tempNames.splice(removeIdx, 1);
          if (removeIdx < tempPlayers.length) tempPlayers.splice(removeIdx, 1);
        });
        
        console.log(`📋 Removed ${codesToRemove.length} codes for player ${playerId}. Remaining: ${tempCodes.length} codes`);
      }
      
      // Validation và logging kết quả
      console.log(`🏁 Batch draw completed: ${selectedWinners.length}/${actualDrawCount} winners selected`);
      console.log('selectedWinners:', selectedWinners);
      
      if (selectedWinners.length !== actualDrawCount) {
        console.warn(`⚠️ WARNING: Expected ${actualDrawCount} winners, got ${selectedWinners.length}`);
        console.warn('This may indicate insufficient unique players or data issues');
      }
      
      // Lưu danh sách winners vào global variable để sử dụng sau
      window.currentBatchWinners = selectedWinners;
        
        // Đảm bảo tất cả winners có đầy đủ thông tin
        window.currentBatchWinners.forEach(winner => {
          if (!winner.code6) winner.code6 = winner.code || '';
          if (!winner.code) winner.code = winner.code6 || '';
          if (!winner.name) winner.name = '';
          if (!winner.playerId) winner.playerId = '';
        });
      
              // Sử dụng mã đầu tiên cho animation và đảm bảo format đúng
        const firstWinner = selectedWinners[0];
        luckyCode = firstWinner.code || firstWinner.code6 || '';
        luckyName = firstWinner.name || '';
        
        // Đảm bảo luckyCode có đủ 6 ký tự
        if (luckyCode && luckyCode.length < 6) {
          luckyCode = luckyCode.padStart(6, '0');
        }
      
                // Đảm bảo tất cả winners có code6 property và đầy đủ thông tin
        window.currentBatchWinners = window.currentBatchWinners.map(winner => ({
          ...winner,
          code: winner.code || winner.code6 || '',
          code6: winner.code || winner.code6 || '',
          name: winner.name || '',
          playerId: winner.playerId || ''
        }));
      
      // Cập nhật danh sách gốc - loại bỏ tất cả mã của các người chơi đã trúng
      const winnersPlayerIds = selectedWinners.map(w => w.playerId);
      const codesToRemove = [];
      
      for (let i = 0; i < luckyCodes.length; i++) {
        if (winnersPlayerIds.includes(luckyPlayers[i])) {
          codesToRemove.push(i);
        }
      }
      
      // Xóa từ cuối lên
      for (let i = codesToRemove.length - 1; i >= 0; i--) {
        const removeIdx = codesToRemove[i];
        luckyCodes.splice(removeIdx, 1);
        if (removeIdx < luckyNames.length) luckyNames.splice(removeIdx, 1);
        if (removeIdx < luckyPlayers.length) luckyPlayers.splice(removeIdx, 1);
      }
      
      // Lưu lại danh sách đã cập nhật
      localStorage.setItem('luckyCodes', JSON.stringify(luckyCodes));
      localStorage.setItem('luckyNames', JSON.stringify(luckyNames));
      localStorage.setItem('luckyPlayers', JSON.stringify(luckyPlayers));
      
      console.log(`Đã loại bỏ ${codesToRemove.length} mã của ${winnersPlayerIds.length} người chơi đã trúng.`);
    }
    
    console.log('Calling stopSlotSpinWithLucky with:', luckyCode, luckyName);
    stopSlotSpinWithLucky(luckyCode, luckyName);
    isSpinning = false;
    lockBtn.style.display = 'none';
    console.log('CHỐT process completed');
  };
}

// ==== THEME PICKER LOGIC ====
document.addEventListener('DOMContentLoaded', function() {
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
  if (themeBtn) themeBtn.onclick = () => {
    console.log('Theme button clicked');
    themeModal.classList.remove('hidden');
  };

// Đóng modal
if (themeClose) themeClose.onclick = () => themeModal.classList.add('hidden');
  if (themeModal) {
    themeModal.addEventListener('click', e => {
  if (e.target === themeModal) themeModal.classList.add('hidden');
});
  }

// Chọn theme
  if (themeItems) {
    themeItems.forEach(item => {
  item.onclick = () => {
        console.log('Selected theme:', item.dataset.theme);
    applyTheme(item.dataset.theme);
    themeModal.classList.add('hidden');
  };
});
  }

// Áp dụng theme khi load lại trang
const savedTheme = localStorage.getItem('luckyTheme');
if (savedTheme) applyTheme(savedTheme); 
});

// ==== RESULT LIST LOGIC ====
document.addEventListener('DOMContentLoaded', function() {
const resultListModal = document.getElementById('result-list-modal');
const resultListClose = document.querySelector('.result-list-modal-close');
const resultListTabs = document.querySelector('.result-list-tabs');
const resultListTableWrap = document.querySelector('.result-list-table-wrap');

// Sự kiện mở modal khi click menu 'Kết quả' ở footer
  const footerMenuSpans = document.querySelectorAll('.footer-bar .menu-bar span');
  if (footerMenuSpans.length > 0) {
    footerMenuSpans[0].onclick = function() { // "Kết quả" là span đầu tiên
      console.log('Result menu clicked');
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
    
    console.log('Rendering result list - winners:', winners.length, 'prizes:', prizes.length);
    
  // Tabs
    if (resultListTabs) {
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
    }

  // Render bảng đầu tiên
  if (prizes.length > 0) renderTable(prizes[0].name);

  function renderTable(prizeName) {
    const filtered = winners.filter(w => w.prize === prizeName);
    let html = `<table class='result-list-table'><thead><tr><th>#</th><th>Mã số</th><th>Họ tên</th><th>Thời gian</th></tr></thead><tbody>`;
    if (filtered.length === 0) {
        html += `<tr><td colspan='4' style='color:#888;text-align:center;'>Chưa có kết quả nào!</td></tr>`;
    } else {
      filtered.forEach((w, i) => {
        const datetime = w.datetime || (w.timestamp ? new Date(w.timestamp).toLocaleString('vi-VN') : 'Không có');
        html += `<tr><td>${i + 1}</td><td>${w.code}</td><td>${w.name}</td><td style="font-size:0.9em;color:#666;">${datetime}</td></tr>`;
      });
    }
    html += '</tbody></table>';
      if (resultListTableWrap) {
    resultListTableWrap.innerHTML = html;
      }
  }
} 

// Thêm event listener cho download button
const downloadBtn = document.querySelector('.result-list-download-btn');
if (downloadBtn) {
  downloadBtn.onclick = function() {
    console.log('Download button clicked');
    downloadExcel();
  };
} 

// Bổ sung nút xóa kết quả vào modal kết quả
  const downloadWrap = document.querySelector('.result-list-download-wrap');
  if (downloadWrap) {
  let clearBtn = document.createElement('button');
  clearBtn.textContent = '🗑️ XÓA KẾT QUẢ';
  clearBtn.className = 'result-list-clear-btn';
  clearBtn.style = 'margin-left:18px;background:#ff4444;color:#fff;font-weight:bold;font-size:1.1em;border:none;border-radius:8px;padding:10px 32px;cursor:pointer;box-shadow:0 2px 12px #ff444455;transition:background 0.2s,color 0.2s;';
  downloadWrap.appendChild(clearBtn);
  clearBtn.onclick = function() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ kết quả quay số?')) {
      localStorage.removeItem('winners');
      renderResultList();
        console.log('Cleared all results');
      }
    };
  }
});

// === DEBUG TEST FUNCTION ===
window.debugTest = function() {
  console.log('=== DEBUG TEST RESULTS ===');
  console.log('isSpinning:', isSpinning);
  console.log('drawBtn:', document.querySelector('.draw-btn'));
  console.log('lockBtn:', document.querySelector('.lock-btn'));
  console.log('drawBtn.style.display:', document.querySelector('.draw-btn').style.display);
  console.log('lockBtn.style.display:', document.querySelector('.lock-btn').style.display);
  console.log('drawBtn.onclick:', document.querySelector('.draw-btn').onclick);
  console.log('lockBtn.onclick:', document.querySelector('.lock-btn').onclick);
  console.log('Lucky codes:', JSON.parse(localStorage.getItem('luckyCodes') || '[]').length);
  console.log('Current prize:', getCurrentPrizeInfo());
  console.log('window.currentBatchWinners:', window.currentBatchWinners);
  console.log('result-mode element:', document.querySelector('.result-mode'));
  console.log('multiple-winners-modal element:', document.getElementById('multiple-winners-modal'));
};

// === DEBUG QUAY HÀNG LOẠT ===

// === TEST FORCE SHOW MODAL ===
window.testShowModal = function() {
  console.log('=== TESTING FORCE SHOW MODAL ===');
  const modal = document.getElementById('multiple-winners-modal');
  const prizeTitle = document.getElementById('multiple-winners-prize-title');
  const winnersList = document.querySelector('.multiple-winners-list');
  
  console.log('Modal elements check:');
  console.log('modal:', modal);
  console.log('prizeTitle:', prizeTitle);
  console.log('winnersList:', winnersList);
  
  if (!modal) {
    console.error('Modal not found!');
    return;
  }
  
  // Force setup modal
  prizeTitle.textContent = '🎉 TEST MODAL - 5 NGƯỜI TRÚNG 🎉';
  winnersList.innerHTML = '<div>Test winner 1</div><div>Test winner 2</div>';
  
  // Force show
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  modal.style.zIndex = '9999';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.8)';
  
  console.log('Modal forced to show');
  console.log('modal.style.display:', modal.style.display);
  console.log('modal.classList:', modal.classList.toString());
  console.log('modal.offsetHeight:', modal.offsetHeight);
  console.log('modal.offsetWidth:', modal.offsetWidth);
};

// === DEBUG QUAY HÀNG LOẠT ===

// === TEST MODAL BUTTONS ===
window.testModalButtons = function() {
  console.log('=== TESTING MODAL BUTTONS ===');
  const modal = document.getElementById('multiple-winners-modal');
  const closeBtn = document.querySelector('.multiple-winners-modal-close');
  const confirmBtn = document.querySelector('.multiple-winners-confirm-btn');
  const backBtn = document.querySelector('.multiple-winners-back-btn');
  
  console.log('Modal:', modal);
  console.log('Close button:', closeBtn);
  console.log('Confirm button:', confirmBtn);
  console.log('Back button:', backBtn);
  
  if (closeBtn) {
    console.log('Close button onclick:', closeBtn.onclick);
    console.log('Close button addEventListener:', typeof closeBtn.addEventListener);
  }
  
  if (confirmBtn) {
    console.log('Confirm button onclick:', confirmBtn.onclick);
    console.log('Confirm button addEventListener:', typeof confirmBtn.addEventListener);
  }
  
  if (backBtn) {
    console.log('Back button onclick:', backBtn.onclick);
    console.log('Back button addEventListener:', typeof backBtn.addEventListener);
  }
  
  // Test manual click
  console.log('Testing manual clicks...');
  if (closeBtn) {
    console.log('Triggering close button click...');
    closeBtn.click();
  }
};

// === TEST FORCE SHOW MODAL ===

// === TEST UPDATE ICONS ===
window.testUpdateIcons = function() {
  console.log('=== TESTING UPDATE ICONS ===');
  updateDrawCardsWithPrizeIcon();
  
  // Kiểm tra cards hiện tại
  const cards = document.querySelectorAll('.draw-card');
  console.log('Found', cards.length, 'cards');
  cards.forEach((card, index) => {
    console.log(`Card ${index}:`, card.innerHTML);
  });
  
  // Kiểm tra badge
  const badge = document.querySelector('.draw-badge-glow span');
  console.log('Badge:', badge ? badge.textContent : 'not found');
  
  // Kiểm tra current prize
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx'), 10) || 0;
  console.log('Current prize info:', prizes[currentPrizeIdx]);
  
  console.log('✅ Icons updated with smaller size (2.5em)');
};

// === TEST MODAL BUTTONS ===

// === AUTO SWITCH PRIZE LOGIC ===
function checkAndAutoSwitchPrize() {
  console.log('=== CHECKING AUTO SWITCH PRIZE ===');
  
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  let currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx') || '0', 10);
  
  if (!prizes.length) return;
  
  const currentPrize = prizes[currentPrizeIdx];
  if (!currentPrize || !currentPrize.maxWinners || currentPrize.maxWinners === 0) {
    console.log('Current prize has no maxWinners limit, no auto switch needed');
    return;
  }
  
  // Đếm số winners của giải hiện tại
  const currentPrizeWinners = winners.filter(w => w.prize === currentPrize.name);
  const currentWinnerCount = currentPrizeWinners.length;
  
  console.log('Current prize:', currentPrize.name);
  console.log('Current winners count:', currentWinnerCount);
  console.log('Max winners limit:', currentPrize.maxWinners);
  
  // Kiểm tra nếu đã đủ số lượng
  if (currentWinnerCount >= currentPrize.maxWinners) {
    console.log('🎯 Prize limit reached! Auto switching to next prize...');
    
    // Tìm giải tiếp theo chưa đủ người
    let nextPrizeIdx = currentPrizeIdx + 1;
    
    // Tìm giải tiếp theo có thể quay (chưa đủ người hoặc không giới hạn)
    while (nextPrizeIdx < prizes.length) {
      const nextPrize = prizes[nextPrizeIdx];
      const nextPrizeWinners = winners.filter(w => w.prize === nextPrize.name);
      
      // Nếu giải này không giới hạn hoặc chưa đủ người
      if (!nextPrize.maxWinners || nextPrize.maxWinners === 0 || nextPrizeWinners.length < nextPrize.maxWinners) {
        console.log('✅ Found next available prize:', nextPrize.name);
        currentPrizeIdx = nextPrizeIdx;
        break;
      }
      
      nextPrizeIdx++;
    }
    
    // Nếu không tìm được giải tiếp theo, kiểm tra từ đầu
    if (nextPrizeIdx >= prizes.length) {
      console.log('🔄 Checking from beginning...');
      for (let i = 0; i < currentPrizeIdx; i++) {
        const checkPrize = prizes[i];
        const checkPrizeWinners = winners.filter(w => w.prize === checkPrize.name);
        
        if (!checkPrize.maxWinners || checkPrize.maxWinners === 0 || checkPrizeWinners.length < checkPrize.maxWinners) {
          console.log('✅ Found available prize from beginning:', checkPrize.name);
          currentPrizeIdx = i;
          break;
        }
      }
    }
    
    // Lưu chỉ số giải mới
    localStorage.setItem('currentPrizeIdx', currentPrizeIdx);
    
    // Cập nhật giao diện
    updateAllPrizeDisplays();
    
    // Hiển thị thông báo
    const newPrize = prizes[currentPrizeIdx];
    showAutoSwitchNotification(currentPrize.name, newPrize.name);
    
    console.log('🎉 Auto switched from', currentPrize.name, 'to', newPrize.name);
    
    return true; // Đã chuyển giải
  }
  
  return false; // Không cần chuyển giải
}

function showAutoSwitchNotification(fromPrize, toPrize) {
  // Tạo notification đẹp
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    font-size: 1.2em;
    font-weight: bold;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: fadeInOut 3s ease-in-out; /* Chuyển lại về 3s như cũ */
  `;
  
  notification.innerHTML = `
    <div style="margin-bottom: 10px;">🎯 Đã đủ người cho</div>
    <div style="color: #ffd600; margin-bottom: 10px;">${fromPrize}</div>
    <div style="margin-bottom: 10px;">📋 Chuyển sang giải:</div>
    <div style="color: #ffd600; font-size: 1.3em;">${toPrize}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Tự động ẩn sau 3 giây
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000); // Chuyển lại về 3s như cũ
}

// Thêm CSS animation cho notification
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  }
`;
document.head.appendChild(notificationStyle);

// === TEST UPDATE ICONS ===

// === TEST AUTO SWITCH PRIZE ===
window.testAutoSwitch = function() {
  console.log('=== TESTING AUTO SWITCH PRIZE ===');
  
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx') || '0', 10);
  
  console.log('Current setup:');
  console.log('Total prizes:', prizes.length);
  
  prizes.forEach((prize, idx) => {
    const prizeWinners = winners.filter(w => w.prize === prize.name);
    console.log(`${idx === currentPrizeIdx ? '👉' : '  '} ${idx}: ${prize.name}`);
    console.log(`     Winners: ${prizeWinners.length}/${prize.maxWinners || '∞'}`);
    console.log(`     Draw per turn: ${prize.drawLimitPerTurn || 1}`);
  });
  
  console.log('\nCurrent prize index:', currentPrizeIdx);
  console.log('Current prize:', prizes[currentPrizeIdx]?.name);
  
  // Test manual switch
  console.log('\n🧪 Testing manual auto switch...');
  const switched = checkAndAutoSwitchPrize();
  console.log('Auto switch result:', switched ? 'SWITCHED' : 'NO SWITCH NEEDED');
};

// Setup demo data cho test
window.setupDemoForAutoSwitch = function() {
  console.log('=== SETTING UP DEMO DATA ===');
  
  // Tạo prizes demo với maxWinners
  const demoPrizes = [
    {name: "GIẢI ĐẶC BIỆT", icon: "💎", drawLimitPerTurn: 1, maxWinners: 2},
    {name: "GIẢI NHẤT", icon: "🥇", drawLimitPerTurn: 2, maxWinners: 4}, 
    {name: "GIẢI NHÌ", icon: "🥈", drawLimitPerTurn: 3, maxWinners: 6},
    {name: "GIẢI BA", icon: "🥉", drawLimitPerTurn: 5, maxWinners: 0} // Không giới hạn
  ];
  
  localStorage.setItem('prizes', JSON.stringify(demoPrizes));
  localStorage.setItem('currentPrizeIdx', '0');
  
  // Tạo demo winners (giải đặc biệt đã có 1 người)
  const demoWinners = [
    {code: "000001", name: "Người demo 1", prize: "GIẢI ĐẶC BIỆT"}
  ];
  
  localStorage.setItem('winners', JSON.stringify(demoWinners));
  
  // Tạo lucky codes demo
  const demoCodes = [];
  const demoNames = [];
  for (let i = 2; i <= 20; i++) {
    demoCodes.push(i.toString());
    demoNames.push(`Người demo ${i}`);
  }
  
  localStorage.setItem('luckyCodes', JSON.stringify(demoCodes));
  localStorage.setItem('luckyNames', JSON.stringify(demoNames));
  
  updateAllPrizeDisplays();
  
  console.log('✅ Demo data created:');
  console.log('- GIẢI ĐẶC BIỆT: 1/2 người (cần thêm 1 để switch)');
  console.log('- GIẢI NHẤT: 0/4 người');
  console.log('- GIẢI NHÌ: 0/6 người'); 
  console.log('- GIẢI BA: 0/∞ người');
  console.log('');
  console.log('📋 Hướng dẫn test:');
  console.log('1. Quay 1 người cho GIẢI ĐẶC BIỆT → sẽ auto switch sang GIẢI NHẤT');
  console.log('2. Quay 4 người cho GIẢI NHẤT → sẽ auto switch sang GIẢI NHÌ');
  console.log('3. Run testAutoSwitch() để kiểm tra trạng thái');
};

// === TEST UPDATE ICONS ===

// === TEST WINNER COUNT DISPLAY ===
window.testWinnerCount = function() {
  console.log('=== TESTING WINNER COUNT DISPLAY ===');
  
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx') || '0', 10);
  
  console.log('Total prizes:', prizes.length);
  console.log('Total winners:', winners.length);
  console.log('Current prize index:', currentPrizeIdx);
  
  if (prizes.length > 0) {
    prizes.forEach((prize, idx) => {
      const prizeWinners = winners.filter(w => w.prize === prize.name);
      const status = idx === currentPrizeIdx ? '👉 CURRENT' : '  ';
      console.log(`${status} ${prize.name}: ${prizeWinners.length}/${prize.maxWinners || '∞'} winners`);
    });
  }
  
  // Check DOM elements
  const countElements = document.querySelectorAll('.prize-count-num');
  console.log('Found', countElements.length, 'count elements in DOM');
  
  countElements.forEach((el, idx) => {
    console.log(`Count element ${idx}:`, el.textContent, '| Color:', el.style.color);
  });
  
  // Test manual update
  console.log('\n🔄 Manually updating winner count...');
  updateWinnerCount();
  
  console.log('✅ Winner count test completed');
};

// Force refresh winner count periodically
setInterval(() => {
  if (document.body.classList.contains('draw-active')) {
    updateWinnerCount();
  }
}, 5000); // Cập nhật mỗi 5 giây khi ở draw mode

// === TEST AUTO SWITCH PRIZE ===

// === QUICK DEMO DATA FOR WINNER COUNT ===
window.setupWinnerCountDemo = function() {
  console.log('=== SETTING UP WINNER COUNT DEMO ===');
  
  // Tạo prizes với maxWinners khác nhau
  const demoPrizes = [
    {name: "GIẢI ĐẶC BIỆT", icon: "💎", drawLimitPerTurn: 1, maxWinners: 1},
    {name: "GIẢI NHẤT", icon: "🥇", drawLimitPerTurn: 2, maxWinners: 3}, 
    {name: "GIẢI NHÌ", icon: "🥈", drawLimitPerTurn: 3, maxWinners: 5},
    {name: "GIẢI BA", icon: "🥉", drawLimitPerTurn: 5, maxWinners: 0} // Không giới hạn
  ];
  
  // Tạo demo winners với số lượng khác nhau
  const demoWinners = [
    {code: "000001", name: "Winner 1", prize: "GIẢI ĐẶC BIỆT"}, // 1/1 - FULL
    {code: "000002", name: "Winner 2", prize: "GIẢI NHẤT"},    // 2/3 - WARNING  
    {code: "000003", name: "Winner 3", prize: "GIẢI NHẤT"},    
    {code: "000004", name: "Winner 4", prize: "GIẢI NHÌ"},     // 1/5 - NORMAL
    {code: "000005", name: "Winner 5", prize: "GIẢI BA"},      // 1/∞ - NORMAL
    {code: "000006", name: "Winner 6", prize: "GIẢI BA"}
  ];
  
  localStorage.setItem('prizes', JSON.stringify(demoPrizes));
  localStorage.setItem('winners', JSON.stringify(demoWinners));
  localStorage.setItem('currentPrizeIdx', '0'); // Start với GIẢI ĐẶC BIỆT (đã full)
  
  // Tạo thêm lucky codes
  const demoCodes = [];
  const demoNames = [];
  for (let i = 7; i <= 30; i++) {
    demoCodes.push(i.toString().padStart(6, '0'));
    demoNames.push(`Person ${i}`);
  }
  
  localStorage.setItem('luckyCodes', JSON.stringify(demoCodes));
  localStorage.setItem('luckyNames', JSON.stringify(demoNames));
  
  // Cập nhật display
  updateAllPrizeDisplays();
  updateWinnerCount();
  
  console.log('✅ Winner Count Demo Setup Complete!');
  console.log('');
  console.log('📊 Expected display:');
  console.log('👉 GIẢI ĐẶC BIỆT: 1/1 (ĐỎ - đã đủ)');
  console.log('   GIẢI NHẤT: 2/3 (CAM - gần đủ)');
  console.log('   GIẢI NHÌ: 1/5 (XANH - bình thường)');
  console.log('   GIẢI BA: 2/∞ (XANH - không giới hạn)');
  console.log('');
  console.log('🧪 Test instructions:');
  console.log('1. Chạy testWinnerCount() để kiểm tra');
  console.log('2. Vào draw mode để xem hiển thị realtime');
  console.log('3. Bấm mũi tên để chuyển giải và xem thay đổi màu sắc');
  console.log('4. Quay thêm người để test auto-switch');
};

// === TEST PLAYER-BASED DRAWING ===
window.testPlayerBasedDrawing = function() {
  console.log('=== TESTING PLAYER-BASED DRAWING ===');
  
  // Tạo dữ liệu test
  const testCodes = ['001', '002', '003', '004', '005', '006', '007', '008'];
  const testNames = ['Nguyễn Văn A', 'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Lê Văn C', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E'];
  const testPlayers = ['P001', 'P001', 'P002', 'P003', 'P003', 'P003', 'P004', 'P005'];
  
  localStorage.setItem('luckyCodes', JSON.stringify(testCodes));
  localStorage.setItem('luckyNames', JSON.stringify(testNames));
  localStorage.setItem('luckyPlayers', JSON.stringify(testPlayers));
  
  console.log('Test data created:');
  console.log('- Codes:', testCodes);
  console.log('- Names:', testNames);
  console.log('- Players:', testPlayers);
  
  // Phân tích tỷ lệ
  const playerCounts = {};
  testPlayers.forEach(player => {
    playerCounts[player] = (playerCounts[player] || 0) + 1;
  });
  
  console.log('Player counts:', playerCounts);
  console.log('Tỷ lệ trúng dự kiến:');
  Object.entries(playerCounts).forEach(([player, count]) => {
    const percentage = ((count / testCodes.length) * 100).toFixed(1);
    console.log(`- ${player} (${count} mã): ${percentage}%`);
  });
  
  console.log('✅ Test data ready. Bạn có thể bắt đầu quay số để test!');
};

// === TEST WINNER COUNT DISPLAY ===

// === EMPTY LIST WARNING MODAL ===
function showEmptyListWarning(customTitle = null, customMessage = null) {
  console.log('=== SHOWING EMPTY LIST WARNING ===');
  
  const modal = document.getElementById('empty-list-warning-modal');
  const titleEl = document.querySelector('.empty-list-warning-title');
  const messageEl = document.querySelector('.empty-list-warning-message p:first-child');
  
  if (!modal) {
    console.error('Empty list warning modal not found!');
    // Fallback to alert
    alert(customTitle || 'Chưa có mã số nào để quay! Hãy thêm danh sách mã số trước.');
        return;
      }
  
  // Update title and message if provided
  if (customTitle && titleEl) {
    titleEl.textContent = customTitle;
  }
  
  if (customMessage && messageEl) {
    messageEl.innerHTML = `<strong>${customMessage}</strong>`;
  }
  
  // Show modal
  modal.classList.remove('hidden');
  
  // Play sound
  playSound('back'); // Use back sound for warning
  
  console.log('Empty list warning modal displayed');
}

function hideEmptyListWarning() {
  const modal = document.getElementById('empty-list-warning-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Setup empty list warning modal event listeners
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('empty-list-warning-modal');
  const closeBtn = document.querySelector('.empty-list-warning-close');
  const closeBtnFooter = document.querySelector('.empty-list-close-btn');
  const addBtn = document.querySelector('.empty-list-add-btn');
  
  // Close modal handlers
  if (closeBtn) {
    closeBtn.addEventListener('click', hideEmptyListWarning);
  }
  
  if (closeBtnFooter) {
    closeBtnFooter.addEventListener('click', hideEmptyListWarning);
  }
  
  // Click outside to close
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        hideEmptyListWarning();
      }
    });
  }
  
  // Add numbers button - open lucky list modal
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      console.log('Opening lucky list modal from warning...');
      hideEmptyListWarning();
      
      // Open lucky list modal
  const luckyListModal = document.getElementById('lucky-list-modal');
  if (luckyListModal) {
    luckyListModal.classList.remove('hidden');
        
        // Load existing data and update counts
        const codes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
        const names = JSON.parse(localStorage.getItem('luckyNames') || '[]');
        
  const luckyCodeList = document.getElementById('lucky-code-list');
  const luckyNameList = document.getElementById('lucky-name-list');
        
        if (luckyCodeList) luckyCodeList.value = codes.join('\n');
        if (luckyNameList) luckyNameList.value = names.join('\n');
        
        // Update counts
        const updateCounts = window.updateCounts || function() {
  const luckyCodeCount = document.getElementById('lucky-code-count');
  const luckyNameCount = document.getElementById('lucky-name-count');
          if (luckyCodeCount) luckyCodeCount.textContent = codes.length;
          if (luckyNameCount) luckyNameCount.textContent = names.length;
        };
        updateCounts();
        
        // Focus on code input
          setTimeout(() => {
    if (luckyCodeList) luckyCodeList.focus();
  }, 300); // Chuyển lại về 300ms như cũ
      }
    });
  }
});

// Enhanced validation for various empty scenarios
function validateLuckyList() {
  console.log('=== VALIDATING LUCKY LIST ===');
  
  const luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
  const luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
  
  console.log('luckyCodes.length:', luckyCodes.length);
  console.log('luckyNames.length:', luckyNames.length);
  
  // Chỉ check số - bỏ qua check tên để dễ dàng hơn
  if (luckyCodes.length === 0) {
    console.log('❌ Không có mã số');
    showEmptyListWarning();
    return false;
  }
  
  console.log('✅ Validation passed - có mã số');
  return true;
}

// Strict validation for testing only
function validateLuckyListStrict() {
  console.log('=== STRICT VALIDATION ===');
  
  const luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
  const luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
  
  if (luckyCodes.length === 0) {
    showEmptyListWarning();
    return false;
  }
  
  if (luckyNames.length === 0) {
    showEmptyListWarning(
      'Thiếu danh sách tên!', 
      'Bạn đã có mã số nhưng chưa có danh sách tên tương ứng.'
    );
    return false;
  }
  
  if (luckyCodes.length !== luckyNames.length) {
    showEmptyListWarning(
      'Dữ liệu không khớp!', 
      `Số lượng mã số (${luckyCodes.length}) và tên (${luckyNames.length}) không bằng nhau.`
    );
    return false;
  }
  
  // Kiểm tra có đủ số để quay không
  const currentPrize = getCurrentPrizeInfo();
  const drawLimit = currentPrize ? (currentPrize.drawLimitPerTurn || 1) : 1;
  
  if (luckyCodes.length < drawLimit) {
    showEmptyListWarning(
      'Không đủ số để quay!', 
      `Giải hiện tại cần ${drawLimit} người nhưng chỉ còn ${luckyCodes.length} số.`
    );
    return false;
  }
  
  return true;
}

// === EXCEL DOWNLOAD LOGIC ===
function downloadExcel() {
  console.log('=== DOWNLOADING EXCEL ===');
  
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  
  if (winners.length === 0) {
    alert('Chưa có kết quả nào để tải xuống!');
    return;
  }
  
  // Tạo workbook mới
  const wb = XLSX.utils.book_new();
  
  // Tạo sheet tổng hợp
  const summaryData = [
    ['STT', 'Mã số', 'Họ tên', 'Mã người chơi', 'Giải thưởng', 'Thời gian']
  ];
  
  winners.forEach((winner, index) => {
    const datetime = winner.datetime || (winner.timestamp ? new Date(winner.timestamp).toLocaleString('vi-VN') : 'Không có');
    summaryData.push([
      index + 1,
      winner.code,
      winner.name,
      winner.playerId || '',
      winner.prize,
      datetime
    ]);
  });
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Styling cho headers
  const range = XLSX.utils.decode_range(summaryWs['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!summaryWs[address]) continue;
    summaryWs[address].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center" }
    };
  }
  
  // Set column widths
  summaryWs['!cols'] = [
    { width: 8 },   // STT
    { width: 15 },  // Mã số
    { width: 25 },  // Họ tên
    { width: 15 },  // Mã người chơi
    { width: 20 },  // Giải thưởng
    { width: 20 }   // Thời gian
  ];
  
  XLSX.utils.book_append_sheet(wb, summaryWs, "Tổng hợp");
  
  // Tạo sheet cho từng giải
  prizes.forEach(prize => {
    const prizeWinners = winners.filter(w => w.prize === prize.name);
    if (prizeWinners.length === 0) return;
    
    const prizeData = [
      ['STT', 'Mã số', 'Họ tên', 'Mã người chơi', 'Thời gian']
    ];
    
    prizeWinners.forEach((winner, index) => {
      const datetime = winner.datetime || (winner.timestamp ? new Date(winner.timestamp).toLocaleString('vi-VN') : 'Không có');
      prizeData.push([
        index + 1,
        winner.code,
        winner.name,
        winner.playerId || '',
        datetime
      ]);
    });
    
    const prizeWs = XLSX.utils.aoa_to_sheet(prizeData);
    
    // Styling cho headers
    const prizeRange = XLSX.utils.decode_range(prizeWs['!ref']);
    for (let C = prizeRange.s.c; C <= prizeRange.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!prizeWs[address]) continue;
      prizeWs[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "70AD47" } },
        alignment: { horizontal: "center" }
      };
    }
    
    // Set column widths
    prizeWs['!cols'] = [
      { width: 8 },   // STT
      { width: 15 },  // Mã số
      { width: 25 },  // Họ tên
      { width: 15 },  // Mã người chơi
      { width: 20 }   // Thời gian
    ];
    
    XLSX.utils.book_append_sheet(wb, prizeWs, prize.name);
  });
  
  // Tạo sheet thống kê
  const statsData = [
    ['Giải thưởng', 'Số người trúng', 'Tỷ lệ (%)'],
  ];
  
  const totalWinners = winners.length;
  prizes.forEach(prize => {
    const prizeWinners = winners.filter(w => w.prize === prize.name);
    const count = prizeWinners.length;
    const percentage = totalWinners > 0 ? ((count / totalWinners) * 100).toFixed(1) : '0';
    statsData.push([prize.name, count, percentage + '%']);
  });
  
  statsData.push(['Tổng cộng', totalWinners, '100%']);
  
  const statsWs = XLSX.utils.aoa_to_sheet(statsData);
  
  // Styling cho stats headers
  const statsRange = XLSX.utils.decode_range(statsWs['!ref']);
  for (let C = statsRange.s.c; C <= statsRange.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!statsWs[address]) continue;
    statsWs[address].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "E74C3C" } },
      alignment: { horizontal: "center" }
    };
  }
  
  statsWs['!cols'] = [
    { width: 20 },  // Giải thưởng
    { width: 15 },  // Số người trúng
    { width: 12 }   // Tỷ lệ
  ];
  
  XLSX.utils.book_append_sheet(wb, statsWs, "Thống kê");
  
  // Tạo filename với timestamp
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `KetQua_QuaySo_${timestamp}.xlsx`;
  
  // Download file
  try {
    XLSX.writeFile(wb, filename);
    console.log('✅ Excel file downloaded:', filename);
    
    // Hiển thị thông báo thành công
    showDownloadNotification(filename, winners.length);
  } catch (error) {
    console.error('❌ Error downloading Excel:', error);
    alert('Có lỗi khi tải file Excel. Vui lòng thử lại!');
  }
}

function showDownloadNotification(filename, count) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    font-weight: bold;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.5s ease-out; /* Chuyển lại về 0.5s như cũ */
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 1.5em;">📊</span>
      <div>
        <div style="font-size: 1.1em;">Tải xuống thành công!</div>
        <div style="font-size: 0.9em; opacity: 0.9;">${filename}</div>
        <div style="font-size: 0.8em; opacity: 0.8;">${count} kết quả đã được xuất</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.5s ease-in'; // Chuyển lại về 0.5s
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500); // Chuyển lại về 500ms
    }
  }, 4000); // Chuyển lại về 4s như cũ
}

// Thêm CSS animations
if (!document.getElementById('download-animations')) {
  const style = document.createElement('style');
  style.id = 'download-animations';
  style.textContent = `
    @keyframes slideIn {
      0% { transform: translateX(100%); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      0% { transform: translateX(0); opacity: 1; }
      100% { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// === RESULT LIST LOGIC ====

// === TEST EXCEL DOWNLOAD ===
window.testExcelDownload = function() {
  console.log('=== TESTING EXCEL DOWNLOAD ===');
  
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  console.log('Current winners count:', winners.length);
  
  if (winners.length === 0) {
    console.log('No winners found, creating demo data...');
    setupExcelDemoData();
  }
  
  console.log('Testing download...');
  downloadExcel();
};

// Setup demo data với timestamps cho test Excel
window.setupExcelDemoData = function() {
  console.log('=== SETTING UP EXCEL DEMO DATA ===');
  
  const demoPrizes = [
    {name: "GIẢI ĐẶC BIỆT", icon: "💎", drawLimitPerTurn: 1, maxWinners: 2},
    {name: "GIẢI NHẤT", icon: "🥇", drawLimitPerTurn: 2, maxWinners: 4},
    {name: "GIẢI NHÌ", icon: "🥈", drawLimitPerTurn: 3, maxWinners: 6},
    {name: "GIẢI BA", icon: "🥉", drawLimitPerTurn: 5, maxWinners: 0}
  ];
  
  // Tạo demo winners với timestamps khác nhau
  const now = new Date();
  const demoWinners = [
    // GIẢI ĐẶC BIỆT
    {
      code: "000001", 
      name: "Nguyễn Văn A", 
      prize: "GIẢI ĐẶC BIỆT",
      timestamp: new Date(now.getTime() - 3600000).toISOString(), // 1 giờ trước
      datetime: new Date(now.getTime() - 3600000).toLocaleString('vi-VN')
    },
    {
      code: "000015", 
      name: "Trần Thị B", 
      prize: "GIẢI ĐẶC BIỆT",
      timestamp: new Date(now.getTime() - 1800000).toISOString(), // 30 phút trước
      datetime: new Date(now.getTime() - 1800000).toLocaleString('vi-VN')
    },
    
    // GIẢI NHẤT
    {
      code: "000003", 
      name: "Lê Văn C", 
      prize: "GIẢI NHẤT",
      timestamp: new Date(now.getTime() - 2700000).toISOString(), // 45 phút trước
      datetime: new Date(now.getTime() - 2700000).toLocaleString('vi-VN')
    },
    {
      code: "000007", 
      name: "Phạm Thị D", 
      prize: "GIẢI NHẤT",
      timestamp: new Date(now.getTime() - 900000).toISOString(), // 15 phút trước
      datetime: new Date(now.getTime() - 900000).toLocaleString('vi-VN')
    },
    {
      code: "000012", 
      name: "Hoàng Văn E", 
      prize: "GIẢI NHẤT",
      timestamp: new Date(now.getTime() - 600000).toISOString(), // 10 phút trước
      datetime: new Date(now.getTime() - 600000).toLocaleString('vi-VN')
    },
    
    // GIẢI NHÌ  
    {
      code: "000002", 
      name: "Vũ Thị F", 
      prize: "GIẢI NHÌ",
      timestamp: new Date(now.getTime() - 3000000).toISOString(), // 50 phút trước
      datetime: new Date(now.getTime() - 3000000).toLocaleString('vi-VN')
    },
    {
      code: "000009", 
      name: "Đỗ Văn G", 
      prize: "GIẢI NHÌ",
      timestamp: new Date(now.getTime() - 1200000).toISOString(), // 20 phút trước
      datetime: new Date(now.getTime() - 1200000).toLocaleString('vi-VN')
    },
    {
      code: "000014", 
      name: "Bùi Thị H", 
      prize: "GIẢI NHÌ",
      timestamp: new Date(now.getTime() - 300000).toISOString(), // 5 phút trước
      datetime: new Date(now.getTime() - 300000).toLocaleString('vi-VN')
    },
    
    // GIẢI BA
    {
      code: "000005", 
      name: "Ngô Văn I", 
      prize: "GIẢI BA",
      timestamp: new Date(now.getTime() - 2400000).toISOString(), // 40 phút trước
      datetime: new Date(now.getTime() - 2400000).toLocaleString('vi-VN')
    },
    {
      code: "000008", 
      name: "Đinh Thị K", 
      prize: "GIẢI BA",
      timestamp: new Date(now.getTime() - 1500000).toISOString(), // 25 phút trước
      datetime: new Date(now.getTime() - 1500000).toLocaleString('vi-VN')
    },
    {
      code: "000011", 
      name: "Lý Văn L", 
      prize: "GIẢI BA",
      timestamp: new Date(now.getTime() - 120000).toISOString(), // 2 phút trước
      datetime: new Date(now.getTime() - 120000).toLocaleString('vi-VN')
    },
    {
      code: "000018", 
      name: "Mai Thị M", 
      prize: "GIẢI BA",
      timestamp: now.toISOString(), // Vừa mới
      datetime: now.toLocaleString('vi-VN')
    }
  ];
  
  localStorage.setItem('prizes', JSON.stringify(demoPrizes));
  localStorage.setItem('winners', JSON.stringify(demoWinners));
  localStorage.setItem('currentPrizeIdx', '0');
  
  // Update displays
  updateAllPrizeDisplays();
  updateWinnerCount();
  
  console.log('✅ Excel Demo Data Created!');
  console.log(`📊 Total: ${demoWinners.length} winners across ${demoPrizes.length} prizes`);
  console.log('🕐 Timeline: Từ 1 giờ trước đến hiện tại');
  console.log('');
  console.log('📋 Test instructions:');
  console.log('1. Mở modal "Kết quả" để xem bảng với thời gian');
  console.log('2. Click "📊 Download" để tải Excel');
  console.log('3. Check file Excel có 4 sheets:');
  console.log('   - Tổng hợp (tất cả kết quả)');
  console.log('   - GIẢI ĐẶC BIỆT (2 người)');
  console.log('   - GIẢI NHẤT (3 người)'); 
  console.log('   - GIẢI NHÌ (3 người)');
  console.log('   - GIẢI BA (4 người)');
  console.log('   - Thống kê (số lượng & tỷ lệ)');
  console.log('4. Chạy testExcelDownload() để test trực tiếp');
};

// === TEST EMPTY LIST WARNING ===
window.testEmptyListWarning = function() {
  console.log('=== TESTING EMPTY LIST WARNING ===');
  
  // Clear data to trigger warning
  localStorage.removeItem('luckyCodes');
  localStorage.removeItem('luckyNames');
  
  console.log('✅ Cleared all data');
  console.log('📋 Test scenarios:');
  console.log('1. Click nút "BẮT ĐẦU" → bị block, hiện warning');
  console.log('2. Click nút "QUAY SỐ" → bị block, hiện warning');
  console.log('3. Lucky list "QUAY SỐ" → bị block, hiện warning');
  console.log('4. Click "➕ THÊM SỐ NGAY" → tự động mở modal nhập số');
  console.log('5. Test các scenario khác:');
  console.log('   - testEmptyNames() : Có mã số nhưng không có tên');
  console.log('   - testMismatchData() : Số lượng mã và tên không khớp');
  console.log('   - testNotEnoughNumbers() : Không đủ số để quay theo setting');
  
  // Test warning immediately
  showEmptyListWarning();
};

window.testEmptyNames = function() {
  console.log('=== TEST EMPTY NAMES SCENARIO ===');
  
  // Set only codes, no names
  localStorage.setItem('luckyCodes', JSON.stringify(['001', '002', '003']));
  localStorage.removeItem('luckyNames');
  
  console.log('✅ Set codes only, no names');
  console.log('📋 Click "QUAY SỐ" để xem cảnh báo thiếu tên');
};

window.testMismatchData = function() {
  console.log('=== TEST MISMATCH DATA SCENARIO ===');
  
  // Set different lengths
  localStorage.setItem('luckyCodes', JSON.stringify(['001', '002', '003']));
  localStorage.setItem('luckyNames', JSON.stringify(['Nguyễn A', 'Trần B'])); // chỉ 2 tên
  
  console.log('✅ Set 3 codes but only 2 names');
  console.log('📋 Click "QUAY SỐ" để xem cảnh báo dữ liệu không khớp');
};

window.testEmptyAfterDraw = function() {
  console.log('=== TEST EMPTY AFTER DRAW SCENARIO ===');
  
  // Set only 1 code to simulate running out
  localStorage.setItem('luckyCodes', JSON.stringify(['001']));
  localStorage.setItem('luckyNames', JSON.stringify(['Nguyễn A']));
  
  // Set current prize to draw more than available
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  if (prizes.length > 0) {
    prizes[0].drawLimitPerTurn = 5; // Muốn quay 5 nhưng chỉ có 1
    localStorage.setItem('prizes', JSON.stringify(prizes));
  }
  
  updateAllPrizeDisplays();
  
  console.log('✅ Set giải hiện tại quay 5 người nhưng chỉ có 1 số');
  console.log('📋 Click "QUAY SỐ" rồi "CHỐT" để xem cảnh báo hết số');
};

window.testNotEnoughNumbers = function() {
  console.log('=== TEST NOT ENOUGH NUMBERS SCENARIO ===');
  
  // Set 3 numbers but current prize needs 5
  localStorage.setItem('luckyCodes', JSON.stringify(['001', '002', '003']));
  localStorage.setItem('luckyNames', JSON.stringify(['Nguyễn A', 'Trần B', 'Lê C']));
  
  // Set current prize to need 5 people
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  if (prizes.length > 0) {
    prizes[0].drawLimitPerTurn = 5; // Cần 5 người
    localStorage.setItem('prizes', JSON.stringify(prizes));
  }
  
  updateAllPrizeDisplays();
  
  console.log('✅ Set 3 số nhưng giải hiện tại cần 5 người');
  console.log('📋 Click "BẮT ĐẦU" hoặc "QUAY SỐ" để xem cảnh báo không đủ số');
};

// === COMPREHENSIVE FUNCTION CHECK ===
window.checkAllFunctions = function() {
  console.log('🔍 === KIỂM TRA TẤT CẢ CHỨC NĂNG ===');
  console.log('');
  
  console.log('📋 DANH SÁCH CÁC CHỨC NĂNG CHÍNH:');
  console.log('1. ✅ Quay hàng loạt (Batch Drawing)');
  console.log('2. ✅ Multiple Winners Modal');
  console.log('3. ✅ Auto-switch Prize khi đủ người');
  console.log('4. ✅ Winner Count Display với màu sắc');
  console.log('5. ✅ Excel Export với timestamp');
  console.log('6. ✅ Empty List Warning Modal');
  console.log('7. ✅ Validation toàn diện');
  console.log('8. ✅ Theme Picker');
  console.log('9. ✅ Result List Modal');
  console.log('10. ✅ Lucky List Modal');
  console.log('');
  
  console.log('🧪 QUICK TEST COMMANDS:');
  console.log('');
  console.log('▶️ VALIDATION TESTS:');
  console.log('   testEmptyListWarning()     - Test cảnh báo không có số');
  console.log('   testEmptyNames()           - Test thiếu tên');
  console.log('   testMismatchData()         - Test dữ liệu không khớp');
  console.log('   testNotEnoughNumbers()     - Test không đủ số');
  console.log('');
  console.log('▶️ BATCH DRAWING TESTS:');
  console.log('   setupDemoForAutoSwitch()   - Setup demo cho auto-switch');
  console.log('   debugBatchDraw()           - Test quay hàng loạt');
  console.log('   testAutoSwitch()           - Test auto-switch giải');
  console.log('');
  console.log('▶️ DISPLAY TESTS:');
  console.log('   setupWinnerCountDemo()     - Test winner count display');
  console.log('   testUpdateIcons()          - Test update icons');
  console.log('   testShowModal()            - Test multiple winners modal');
  console.log('');
  console.log('▶️ EXPORT TESTS:');
  console.log('   setupExcelDemoData()       - Setup data cho Excel');
  console.log('   testExcelDownload()        - Test Excel export');
  console.log('');
  console.log('▶️ MANUAL TESTS:');
  console.log('   - Click footer "Kết quả" → Test Result List Modal');
  console.log('   - Click "🎨 Chủ đề" → Test Theme Picker');
  console.log('   - Click card ở main mode → Test Lucky List Modal');
  console.log('   - Click "BẮT ĐẦU" → Test validation');
  console.log('');
  
  console.log('🎯 COMPREHENSIVE TEST SEQUENCE:');
  console.log('   runFullTest()              - Chạy test toàn bộ hệ thống');
  console.log('   quickHealthCheck()         - Kiểm tra trạng thái hiện tại');
  console.log('');
};

window.runFullTest = function() {
  console.log('🚀 === CHẠY TEST TOÀN BỘ HỆ THỐNG ===');
  console.log('');
  
  // Test 1: Empty List Warning
  console.log('1️⃣ Testing Empty List Warning...');
  localStorage.removeItem('luckyCodes');
  localStorage.removeItem('luckyNames');
  console.log('   ✅ Cleared data');
  
  // Test 2: Setup Demo Data
  console.log('2️⃣ Setting up demo data...');
  setupDemoForAutoSwitch();
  console.log('   ✅ Demo data created');
  
  // Test 3: Winner Count Display
  console.log('3️⃣ Testing winner count display...');
  updateWinnerCount();
  console.log('   ✅ Winner count updated');
  
  // Test 4: Icons
  console.log('4️⃣ Testing prize icons...');
  updateDrawCardsWithPrizeIcon();
  console.log('   ✅ Icons updated');
  
  // Test 5: Check modals exist
  console.log('5️⃣ Checking modals...');
  const modals = [
    'multiple-winners-modal',
    'empty-list-warning-modal', 
    'result-list-modal',
    'lucky-list-modal',
    'theme-modal'
  ];
  
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      console.log(`   ✅ ${modalId} exists`);
    } else {
      console.log(`   ❌ ${modalId} missing`);
    }
  });
  
  // Test 6: Check validation functions
  console.log('6️⃣ Testing validation functions...');
  const validationFunctions = [
    'validateLuckyList',
    'validateAndStartSpin', 
    'showEmptyListWarning',
    'hideEmptyListWarning'
  ];
  
  validationFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function' || typeof eval(funcName) === 'function') {
      console.log(`   ✅ ${funcName} exists`);
    } else {
      console.log(`   ❌ ${funcName} missing`);
    }
  });
  
  // Test 7: Check UI elements
  console.log('7️⃣ Checking UI elements...');
  const elements = [
    '.draw-btn',
    '.lock-btn', 
    '.result-list-download-btn',
    '.empty-list-add-btn',
    '.multiple-winners-confirm-btn'
  ];
  
  elements.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) {
      console.log(`   ✅ ${selector} exists`);
    } else {
      console.log(`   ❌ ${selector} missing`);
    }
  });
  
  console.log('');
  console.log('🎉 === TEST HOÀN THÀNH ===');
  console.log('');
  console.log('📝 NEXT STEPS:');
  console.log('1. Test validation: testEmptyListWarning()');
  console.log('2. Test batch draw: setupDemoForAutoSwitch() → quay số');
  console.log('3. Test Excel: setupExcelDemoData() → click Download');
  console.log('4. Test các modal thủ công');
  console.log('');
};

// === BATCH DRAW DEBUGGER ===
window.debugBatchDraw = function() {
  console.log('🎯 === BATCH DRAW DEBUGGER ===');
  
  const currentPrize = getCurrentPrizeInfo();
  const drawLimit = currentPrize ? (currentPrize.drawLimitPerTurn || 1) : 1;
  
  console.log('🎮 Draw Settings:');
  console.log(`  Current Prize: ${currentPrize?.name || 'N/A'}`);
  console.log(`  Draw Limit Per Turn: ${drawLimit}`);
  
  console.log('📊 Current Batch State:');
  console.log('  window.currentBatchWinners:', window.currentBatchWinners);
  console.log('  Batch Winners Count:', window.currentBatchWinners?.length || 0);
  
  if (window.currentBatchWinners && window.currentBatchWinners.length > 0) {
    console.log('🏆 Batch Winners Detail:');
    window.currentBatchWinners.forEach((winner, i) => {
      console.log(`  [${i+1}] ${winner.name || 'NO_NAME'} (${winner.code || 'NO_CODE'}) - Player: ${winner.playerId || 'NO_PLAYER'}`);
    });
  }
  
  const luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
  const luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
  const luckyPlayers = JSON.parse(localStorage.getItem('luckyPlayers') || '[]');
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  
  console.log('📋 Available Data:');
  console.log(`  Lucky Codes: ${luckyCodes.length}`);
  console.log(`  Lucky Names: ${luckyNames.length}`);
  console.log(`  Lucky Players: ${luckyPlayers.length}`);
  console.log(`  Total Winners: ${winners.length}`);
  
  // Check current prize winners
  const currentPrizeWinners = winners.filter(w => w.prize === currentPrize?.name);
  console.log(`  Current Prize Winners: ${currentPrizeWinners.length}/${currentPrize?.maxWinners || '∞'}`);
  
  // Check unique players
  const uniquePlayers = [...new Set(luckyPlayers)];
  console.log(`  Unique Players: ${uniquePlayers.length}`);
  
  if (drawLimit > uniquePlayers.length) {
    console.warn(`⚠️ WARNING: Draw limit (${drawLimit}) > Unique players (${uniquePlayers.length})`);
    console.warn('This may cause insufficient winners in batch draw');
  }
  
  // Validate recent winners data
  console.log('🔍 Recent Winners Validation:');
  const recentWinners = winners.slice(-5);
  recentWinners.forEach((winner, i) => {
    const issues = [];
    if (!winner.name || winner.name.trim() === '') issues.push('NO_NAME');
    if (!winner.code || winner.code.trim() === '') issues.push('NO_CODE');
    if (!winner.prize || winner.prize.trim() === '') issues.push('NO_PRIZE');
    
    console.log(`  [${i+1}] ${winner.name || 'EMPTY'} (${winner.code || 'EMPTY'}) - ${winner.prize || 'EMPTY'} ${issues.length > 0 ? '❌ ' + issues.join(', ') : '✅'}`);
  });
  
  console.log('');
};

// Verify batch consistency after save
window.verifyBatchSave = function() {
  console.log('🔍 === BATCH SAVE VERIFICATION ===');
  
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  const currentPrize = getCurrentPrizeInfo();
  const currentPrizeWinners = winners.filter(w => w.prize === currentPrize?.name);
  
  console.log('📊 Save Results:');
  console.log(`  Total Winners: ${winners.length}`);
  console.log(`  Current Prize Winners: ${currentPrizeWinners.length}`);
  console.log(`  Max Winners for Prize: ${currentPrize?.maxWinners || 'Unlimited'}`);
  
  // Check winner count display
  const countElements = document.querySelectorAll('.prize-count-num');
  console.log('🖥️ UI Display:');
  countElements.forEach((el, i) => {
    console.log(`  Count Element ${i}: "${el.textContent}"`);
  });
  
  console.log('');
};

// === NUMBER CONSISTENCY DEBUGGER ===
window.debugNumberFlow = function() {
  console.log('🔍 === NUMBER CONSISTENCY DEBUGGER ===');
  
  console.log('📊 Current State:');
  console.log('  window.currentDrawCode6:', window.currentDrawCode6);
  console.log('  window.currentDrawWinner:', window.currentDrawWinner);
  console.log('  window.currentBatchWinners:', window.currentBatchWinners);
  
  const luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  
  console.log('📋 Lucky Codes Format Check:');
  luckyCodes.slice(0, 5).forEach((code, i) => {
    console.log(`  [${i}] "${code}" → formatted: "${code.padStart(6, '0')}"`);
  });
  
  console.log('🏆 Recent Winners Format Check:');
  winners.slice(-3).forEach((winner, i) => {
    console.log(`  [${i}] code: "${winner.code}", originalCode: "${winner.originalCode || 'N/A'}"`);
  });
  
  // Check display elements
  const resultCards = document.querySelectorAll('.result-cards .draw-card span');
  if (resultCards.length > 0) {
    let displayedCode = '';
    resultCards.forEach(span => displayedCode += span.textContent);
    console.log('🖥️ Currently Displayed Code:', displayedCode);
  }
  
  console.log('');
};

window.quickHealthCheck = function() {
  console.log('⚡ === QUICK HEALTH CHECK ===');
  
  // Check localStorage
  const luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
  const luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
  const winners = JSON.parse(localStorage.getItem('winners') || '[]');
  const prizes = JSON.parse(localStorage.getItem('prizes') || '[]');
  
  console.log('📊 CURRENT STATE:');
  console.log(`   Lucky Codes: ${luckyCodes.length} items`);
  console.log(`   Lucky Names: ${luckyNames.length} items`);
  console.log(`   Winners: ${winners.length} items`);
  console.log(`   Prizes: ${prizes.length} items`);
  
  // Check if validation works
  const isValid = validateLuckyList();
  console.log(`   Validation Status: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  
  // Check current prize
  const currentPrizeIdx = parseInt(localStorage.getItem('currentPrizeIdx') || '0', 10);
  const currentPrize = prizes[currentPrizeIdx];
  console.log(`   Current Prize: ${currentPrize?.name || 'N/A'} (index: ${currentPrizeIdx})`);
  
  if (currentPrize) {
    console.log(`   Draw Limit: ${currentPrize.drawLimitPerTurn || 1} people`);
    console.log(`   Max Winners: ${currentPrize.maxWinners || 'Unlimited'}`);
  }
  
  console.log('');
  console.log('🔧 SUGGESTIONS:');
  if (luckyCodes.length === 0) {
    console.log('   - Run setupDemoForAutoSwitch() for demo data');
  }
  if (winners.length === 0) {
    console.log('   - Run setupExcelDemoData() for winner data');
  }
  console.log('   - Run checkAllFunctions() for full menu');
  console.log('   - Run runFullTest() for comprehensive test');
  console.log('');
  console.log('🚨 DEBUGGING COMMANDS:');
  console.log('   debugDataIssue()           - Debug vấn đề không vào được draw mode');
  console.log('   fixDataAndEnter()          - Fix data và tự động vào draw mode');
  console.log('   debugNumberFlow()          - Debug số được quay/hiển thị/lưu');
  console.log('   debugBatchDraw()           - Debug batch draw logic và winners');
  console.log('   verifyBatchSave()          - Verify winners after batch save');
  console.log('🔍 BATCH VERIFICATION:');
  console.log('   - Kiểm tra count display (X/Y format)');
  console.log('   - Validate tên user không bị trống');
  console.log('   - Validate tên prize không bị cắt đứt');
  console.log('   - Đảm bảo số lượng lưu = số lượng pick');
};

// Debug function for data issues
window.debugDataIssue = function() {
  console.log('🚨 === DEBUGGING DATA ISSUE ===');
  
  const luckyCodes = JSON.parse(localStorage.getItem('luckyCodes') || '[]');
  const luckyNames = JSON.parse(localStorage.getItem('luckyNames') || '[]');
  
  console.log('📊 CURRENT DATA STATE:');
  console.log('   luckyCodes:', luckyCodes);
  console.log('   luckyNames:', luckyNames);
  console.log('   luckyCodes.length:', luckyCodes.length);
  console.log('   luckyNames.length:', luckyNames.length);
  
  console.log('🔍 VALIDATION CHECK:');
  const isValid = validateLuckyList();
  console.log('   validateLuckyList():', isValid);
  
  console.log('');
  console.log('🔧 SUGGESTIONS:');
  if (luckyCodes.length === 0) {
    console.log('   ❌ PROBLEM: Không có mã số nào');
    console.log('   💡 SOLUTION: Chạy fixDataAndEnter() hoặc thêm số thủ công');
  } else {
    console.log('   ✅ OK: Có mã số');
    if (luckyNames.length === 0) {
      console.log('   ⚠️ WARNING: Không có tên (nhưng vẫn có thể hoạt động)');
    }
    if (luckyCodes.length !== luckyNames.length) {
      console.log('   ⚠️ WARNING: Số lượng mã và tên không khớp (nhưng vẫn có thể hoạt động)');
    }
    console.log('   💡 TRY: Click "BẮT ĐẦU" lại - should work now!');
  }
};

window.fixDataAndEnter = function() {
  console.log('🔧 === FIXING DATA AND AUTO ENTER ===');
  
  // Create minimal working data
  const testCodes = ['001', '002', '003', '004', '005'];
  const testNames = ['Nguyễn A', 'Trần B', 'Lê C', 'Phạm D', 'Hoàng E'];
  
  localStorage.setItem('luckyCodes', JSON.stringify(testCodes));
  localStorage.setItem('luckyNames', JSON.stringify(testNames));
  
  console.log('✅ Fixed data:', testCodes);
  
  // Auto enter draw mode
  document.querySelector('.main-mode').style.display = 'none';
  document.querySelector('.draw-mode').style.display = 'flex';
  document.body.classList.add('draw-active');
  document.body.classList.remove('result-active');
  
  // Update displays
  updateDrawCardsWithPrizeIcon();
  updateWinnerCount();
  
  console.log('🎉 SUCCESS: Đã vào draw mode với data test!');
  console.log('📋 Bây giờ có thể click "QUAY SỐ" để test');
};

// === TIMING STATUS CHECK ===
window.checkCurrentTiming = function() {
  console.log('⏱️ === TRẠNG THÁI TIMING HIỆN TẠI ===');
  console.log('');
  console.log('✅ ĐÃ CHUYỂN LẠI VỀ TIMING GỐC THEO YÊU CẦU:');
  console.log('');
  console.log('🎰 SLOT SPINNING:');
  console.log('   ✅ Tốc độ quay: 60ms (nhanh, rõ nét)');
  console.log('   ✅ Tốc độ dừng: 20ms (nhanh, sắc bén)');
  console.log('   ✅ Delay dừng: 4000ms (timing gốc)');
  console.log('');
  console.log('🎆 HIỆU ỨNG:');
  console.log('   ✅ Fireworks delay: 300ms & 500ms (xuất hiện nhanh)');
  console.log('   ✅ Lucky highlight: 1.2s (nhanh và năng động)');
  console.log('   ✅ Lucky blink: 0.5s (nhấp nháy nhanh)');
  console.log('   ✅ Slot pop: 0.5s (pop nhanh)');
  console.log('');
  console.log('🪟 MODAL & TRANSITIONS:');
  console.log('   ✅ Modal fade in: 0.2s (xuất hiện nhanh)');
  console.log('   ✅ Color transitions: 0.2s (chuyển màu nhanh)');
  console.log('   ✅ Background transitions: 0.2s (chuyển nền nhanh)');
  console.log('');
  console.log('📢 NOTIFICATIONS:');
  console.log('   ✅ Download notification: 4s (hiển thị ngắn)');
  console.log('   ✅ Auto-switch notification: 3s (ngắn gọn)');
  console.log('   ✅ Searching pulse: 1.5s (nhịp nhanh)');
  console.log('   ✅ Glow effect: 1.2s (sáng nhanh)');
  console.log('');
  console.log('🧪 TEST TIMING GỐC:');
  console.log('   1. fixDataAndEnter() - Setup và vào draw mode');
  console.log('   2. Click "QUAY SỐ" - Slot quay nhanh 60ms');
  console.log('   3. Click "CHỐT" - Dừng nhanh 20ms');
  console.log('   4. Fireworks xuất hiện sau 300ms-500ms');
  console.log('   5. Modal popup nhanh 0.2s');
  console.log('');
  console.log('🎯 ƯU ĐIỂM TIMING GỐC:');
  console.log('   ⚡ Phản hồi nhanh');
  console.log('   🎮 Cảm giác game arcade');
  console.log('   ⏰ Tiết kiệm thời gian');
  console.log('   🚀 Hiệu ứng sắc bén');
  console.log('');
};

// Functions để điều chỉnh timing realtime
window.adjustSlotSpeed = function(intervalMs = 100) {
  console.log(`⚙️ Setting slot speed to ${intervalMs}ms`);
  
  // Update the constant for future spins
  window.SLOT_SPIN_INTERVAL = intervalMs;
  
  console.log(`✅ Slot speed set to ${intervalMs}ms`);
  console.log('📋 Click "QUAY SỐ" để test tốc độ mới');
};

window.adjustStopDelay = function(totalMs = 6000) {
  console.log(`⚙️ Setting stop delay to ${totalMs}ms total`);
  
  // Update the constant for future spins
  window.SLOT_STOP_TOTAL_DELAY = totalMs;
  
  console.log(`✅ Stop delay set to ${totalMs}ms total`);
  console.log('📋 Click "QUAY SỐ" → "CHỐT" để test delay mới');
};

// Constants for easy adjustment
window.SLOT_SPIN_INTERVAL = 100; // Default spin speed
window.SLOT_STOP_TOTAL_DELAY = 6000; // Default stop delay

// === JSON STORAGE EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', function() {
  // Initialize storage status
  updateStorageStatus();
  
  // Add click handlers for status indicators
  const autoExportStatus = document.getElementById('auto-export-status');
  const autoBackupStatus = document.getElementById('auto-backup-status');
  const storageMode = document.getElementById('storage-mode');
  
  if (autoExportStatus) {
    autoExportStatus.addEventListener('click', window.toggleAutoExport);
    autoExportStatus.style.cursor = 'pointer';
  }
  
  if (autoBackupStatus) {
    autoBackupStatus.addEventListener('click', window.toggleAutoBackup);
    autoBackupStatus.style.cursor = 'pointer';
  }
  
  if (storageMode) {
    storageMode.addEventListener('click', function() {
      console.log('📊 JSON Storage Commands:');
      console.log('  toggleAutoExport() - Bật/tắt auto export');
      console.log('  toggleAutoBackup() - Bật/tắt auto backup');
      console.log('  JSON_STORAGE.exportAllData() - Export tất cả');
      console.log('  JSON_STORAGE.importAllData() - Import tất cả');
      showNotification('📊 Xem console để biết thêm lệnh JSON storage', 'info');
    });
    storageMode.style.cursor = 'pointer';
    storageMode.title = 'Click để xem lệnh JSON storage';
  }
  
  // Export Data Button
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async function() {
      try {
        const success = await JSON_STORAGE.exportAllData();
        if (success) {
          showNotification('✅ Đã export dữ liệu thành công!', 'success');
        } else {
          showNotification('❌ Lỗi khi export dữ liệu', 'error');
        }
      } catch (error) {
        console.error('Export error:', error);
        showNotification('❌ Lỗi khi export dữ liệu', 'error');
      }
    });
  }
  
  // Import Data Button
  const importBtn = document.getElementById('import-data-btn');
  if (importBtn) {
    importBtn.addEventListener('click', async function() {
      try {
        const success = await JSON_STORAGE.importAllData();
        if (success) {
          showNotification('✅ Đã import dữ liệu thành công!', 'success');
          // Reload page để cập nhật UI
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showNotification('❌ Không thể import dữ liệu', 'error');
        }
      } catch (error) {
        console.error('Import error:', error);
        showNotification('❌ Lỗi khi import dữ liệu', 'error');
      }
    });
  }
  
  // Backup All Data Button
  const backupBtn = document.getElementById('backup-data-btn');
  if (backupBtn) {
    backupBtn.addEventListener('click', async function() {
      try {
        // Backup individual files
        const luckyCodes = getLS('luckyCodes');
        const luckyNames = getLS('luckyNames');
        const luckyPlayers = getLS('luckyPlayers');
        const prizes = getLS('prizes');
        const winners = getLS('winners');
        
        if (luckyCodes) await JSON_STORAGE.saveToFile('luckyCodes', luckyCodes);
        if (luckyNames) await JSON_STORAGE.saveToFile('luckyNames', luckyNames);
        if (luckyPlayers) await JSON_STORAGE.saveToFile('luckyPlayers', luckyPlayers);
        if (prizes) await JSON_STORAGE.saveToFile('prizes', prizes);
        if (winners) await JSON_STORAGE.saveToFile('winners', winners);
        
        // Backup all data
        await JSON_STORAGE.exportAllData();
        
        showNotification('✅ Đã backup tất cả dữ liệu thành công!', 'success');
      } catch (error) {
        console.error('Backup error:', error);
        showNotification('❌ Lỗi khi backup dữ liệu', 'error');
      }
    });
  }
});

// Notification function
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.json-notification');
  if (existing) {
    existing.remove();
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'json-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  // Set color based on type
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#4CAF50';
      break;
    case 'error':
      notification.style.backgroundColor = '#f44336';
      break;
    default:
      notification.style.backgroundColor = '#2196F3';
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
}

// Add CSS for notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(notificationStyles);

// === QUICK DEMO DATA FOR WINNER COUNT ===
