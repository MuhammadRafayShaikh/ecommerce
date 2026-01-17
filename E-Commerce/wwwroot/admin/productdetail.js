
// Notification function
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                animation: fadeInUp 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            `;

    // Set color based on type
    if (type === 'success') {
        notification.style.backgroundColor = 'var(--success)';
    } else if (type === 'warning') {
        notification.style.backgroundColor = 'var(--warning)';
    } else if (type === 'info') {
        notification.style.backgroundColor = 'var(--info)';
    } else {
        notification.style.backgroundColor = 'var(--primary)';
    }

    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-circle';

    notification.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;

    // Add to document
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);

    // Add fadeOut animation
    if (!document.querySelector('style[data-notification]')) {
        const style = document.createElement('style');
        style.setAttribute('data-notification', 'true');
        style.textContent = `
                    @keyframes fadeOut {
                        from { opacity: 1; transform: translateY(0); }
                        to { opacity: 0; transform: translateY(-20px); }
                    }
                `;
        document.head.appendChild(style);
    }
}