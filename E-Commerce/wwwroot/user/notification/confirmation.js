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
}

function hideConfirm() {
    document.getElementById('customConfirmModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    setTimeout(() => confirmResolve = null, 0);
}


document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('confirmOkBtn')?.addEventListener('click', () => {
        confirmResolve?.(true);   // ✅ pehle resolve
        hideConfirm();            // phir close
    });

    document.getElementById('confirmCancelBtn')?.addEventListener('click', () => {
        confirmResolve?.(false);  // ✅ pehle resolve
        hideConfirm();
    });

    document.querySelector('.close-confirm-modal')?.addEventListener('click', () => {
        confirmResolve?.(false);
        hideConfirm();
    });

    document.querySelector('#customConfirmModal .modal-overlay')?.addEventListener('click', () => {
        confirmResolve?.(false);
        hideConfirm();
    });


    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (document.getElementById('customConfirmModal').style.display === 'block') {
                hideConfirm();
                confirmResolve?.(false);
            }
        }
    });

});
