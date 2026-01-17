// Toggle sidebar for mobile
document.getElementById('menuToggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('active');
});

// Initialize charts
document.addEventListener('DOMContentLoaded', function () {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    const revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Revenue (₹)',
                data: [52000, 62000, 58000, 72000, 68000, 92000, 88000],
                borderColor: 'rgb(156, 39, 176)',
                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(156, 39, 176)',
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        callback: function (value) {
                            return '₹' + (value / 1000) + 'k';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });

    // Category Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    const categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Anarkali', 'Lehenga', 'Sharara', 'Palazzo', 'Saree', 'Gown'],
            datasets: [{
                data: [25, 20, 15, 12, 18, 10],
                backgroundColor: [
                    'rgba(156, 39, 176, 0.8)',
                    'rgba(255, 64, 129, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(103, 58, 183, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            cutout: '65%'
        }
    });

    // Populate recent orders table
    const ordersData = [
        { id: 'ORD-7821', customer: 'Priya Sharma', date: '12 Nov 2023', amount: '₹4,599', status: 'delivered' },
        { id: 'ORD-7820', customer: 'Anjali Patel', date: '11 Nov 2023', amount: '₹6,299', status: 'processing' },
        { id: 'ORD-7819', customer: 'Ritu Singh', date: '10 Nov 2023', amount: '₹3,899', status: 'delivered' },
        { id: 'ORD-7818', customer: 'Meera Kapoor', date: '9 Nov 2023', amount: '₹5,499', status: 'pending' },
        { id: 'ORD-7817', customer: 'Sneha Reddy', date: '8 Nov 2023', amount: '₹7,999', status: 'delivered' },
        { id: 'ORD-7816', customer: 'Pooja Verma', date: '7 Nov 2023', amount: '₹2,999', status: 'cancelled' },
        { id: 'ORD-7815', customer: 'Divya Nair', date: '6 Nov 2023', amount: '₹8,499', status: 'processing' }
    ];

    const ordersTableBody = document.getElementById('ordersTableBody');

    ordersData.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
                            <td><strong>${order.id}</strong></td>
                            <td>
                                <div class="customer-cell">
                                    <div class="customer-avatar">${order.customer.charAt(0)}</div>
                                    <div>${order.customer}</div>
                                </div>
                            </td>
                            <td>${order.date}</td>
                            <td><strong>${order.amount}</strong></td>
                            <td><span class="status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                            <td><button class="view-btn"><i class="fas fa-eye"></i></button></td>
                        `;
        ordersTableBody.appendChild(row);
    });

    // Animate stats counter
    function animateCounter(elementId, targetValue, duration = 1500) {
        const element = document.getElementById(elementId);
        const startValue = 0;
        const increment = targetValue / (duration / 16); // 60fps
        let currentValue = startValue;

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                clearInterval(timer);
                element.textContent = formatNumber(targetValue);
            } else {
                element.textContent = formatNumber(Math.floor(currentValue));
            }
        }, 16);
    }

    function formatNumber(num) {
        if (num >= 1000) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        return num.toString();
    }

    // Start counter animations after page loads
    setTimeout(() => {
        animateCounter('revenue', 482560);
        animateCounter('orders', 1248);
        animateCounter('customers', 8420);
    }, 800);

    // Add hover animation to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.animation = 'pulse 0.5s ease';
        });

        card.addEventListener('animationend', function () {
            this.style.animation = '';
        });
    });
});



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

// Remove after 3 seconds (with hover pause)
let removeTimeout;

function startRemoveTimer() {
    removeTimeout = setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// start timer initially
startRemoveTimer();

// pause on hover
notification.addEventListener('mouseenter', () => {
    clearTimeout(removeTimeout);
});

// resume on mouse leave
notification.addEventListener('mouseleave', () => {
    startRemoveTimer();
});
