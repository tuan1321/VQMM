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
  // Xử lý trình chiếu kết quả
  // TODO: Hiển thị người may mắn
};

// Modal đổi hình nền
const bgBtn = document.getElementById('bg-image-btn');
const bgModal = document.getElementById('bg-modal');
const bgClose = document.querySelector('.bg-modal-close');
const bgUpload = document.getElementById('bg-upload');

gbBtn && (bgBtn.onclick = function() {
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
    document.body.style.background = `url('${evt.target.result}') center center/cover no-repeat fixed`;
    bgModal.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}; 
