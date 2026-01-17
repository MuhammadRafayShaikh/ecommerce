// Custom Toast Notification
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('customToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast?.querySelector('.toast-icon i');

    if (!toast || !toastMessage || !toastIcon) {
        console.warn('Toast elements not found');
        return;
    }

    toastMessage.textContent = message;
    toast.className = 'custom-toast show';
    toast.querySelector('.toast-content').className = `toast-content toast-${type}`;

    switch (type) {
        case 'success':
            toastIcon.className = 'fas fa-check-circle';
            break;
        case 'error':
            toastIcon.className = 'fas fa-exclamation-circle';
            break;
        case 'info':
            toastIcon.className = 'fas fa-info-circle';
            break;
        case 'warning':
            toastIcon.className = 'fas fa-exclamation-triangle';
            break;
    }

    if (duration > 0) {
        setTimeout(hideToast, duration);
    }
}

function hideToast() {
    const toast = document.getElementById('customToast');
    if (toast) toast.classList.remove('show');
}