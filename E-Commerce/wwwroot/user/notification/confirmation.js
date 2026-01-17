let confirmResolve = null;

// Custom Confirmation Modal
function showConfirm(title, message) {
    return new Promise((resolve) => {
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        document.getElementById('customConfirmModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        confirmResolve = resolve;
    });
}// Confirmation Modal Events
document.querySelector('.close-confirm-modal')?.addEventListener('click', () => {
    hideConfirm();
    if (confirmResolve) confirmResolve(false);
});

document.querySelector('#customConfirmModal .modal-overlay')?.addEventListener('click', () => {
    hideConfirm();
    if (confirmResolve) confirmResolve(false);
});

document.getElementById('confirmCancelBtn')?.addEventListener('click', () => {
    hideConfirm();
    if (confirmResolve) confirmResolve(false);
});

document.getElementById('confirmOkBtn')?.addEventListener('click', () => {
    hideConfirm();
    if (confirmResolve) confirmResolve(true);
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        if (document.getElementById('customConfirmModal').style.display === 'block') {
            hideConfirm();
            if (confirmResolve) confirmResolve(false);
        }

        if (document.getElementById('customToast')?.classList.contains('show')) {
            hideToast();
        }

        if (document.getElementById('editCartModal').style.display === 'block') {
            closeEditModal();
        }
    }
});

function hideConfirm() {
    document.getElementById('customConfirmModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    confirmResolve = null;
}
