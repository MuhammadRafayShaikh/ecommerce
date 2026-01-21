// ====== GLOBAL VARIABLES ======
let currentFilter = 'all';

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    initializeFiltering();
});

// ====== EVENT LISTENERS ======
function initializeEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function () {
            setActiveFilter(this.dataset.filter);
        });
    });

    // Retry payment buttons
    document.querySelectorAll('.btn-retry-payment').forEach(button => {
        button.addEventListener('click', function () {
            const orderId = this.dataset.orderId;
            retryPayment(orderId);
        });
    });

    // Cancel order buttons
    document.querySelectorAll('.btn-cancel-order').forEach(button => {
        button.addEventListener('click', function () {
            const orderId = this.dataset.orderId;
            cancelOrder(orderId);
        });
    });

    // View details buttons (for modal)
    document.querySelectorAll('.btn-view-details').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            // href se orderId nikalo
            const href = this.getAttribute('href'); // /Orders/Details/12
            const orderId = href.split('/').pop();

            if (!orderId) {
                showToast('Invalid order id', 'error');
                return;
            }

            loadOrderDetails(orderId);
        });
    });

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function () {
            closeModal(this.closest('.modal'));
        });
    });

    // Modal overlay clicks
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function () {
            closeModal(this.closest('.modal'));
        });
    });

    // Escape key to close modals
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'block') {
                    closeModal(modal);
                }
            });
        }
    });
}

// ====== FILTERING ======
function initializeFiltering() {
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');

    if (filter) {
        setActiveFilter(filter);
    }
}

function setActiveFilter(filter) {
    currentFilter = filter;

    // Update UI
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.filter === filter) {
            button.classList.add('active');
        }
    });

    // Filter orders
    filterOrders();

    // Update URL
    const url = new URL(window.location);
    if (filter === 'all') {
        url.searchParams.delete('filter');
    } else {
        url.searchParams.set('filter', filter);
    }
    window.history.pushState({}, '', url);
}

function filterOrders() {
    const orders = document.querySelectorAll('.order-card');

    orders.forEach(order => {
        if (currentFilter === 'all') {
            order.style.display = 'block';
        } else {
            const status = order.dataset.status;
            //alert(status)
            //alert(currentFilter)
            if (status.toLowerCase() === currentFilter.toLowerCase()) {
                order.style.display = 'block';
            } else {
                order.style.display = 'none';
            }
        }
    });

    // Show/hide empty state
    const visibleOrders = Array.from(orders).filter(order =>
        order.style.display !== 'none'
    );

    const emptyState = document.querySelector('.empty-orders');
    if (emptyState) {
        if (visibleOrders.length === 0 && currentFilter !== 'all') {
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <div class="empty-icon">
                    <i class="fas fa-filter"></i>
                </div>
                <h3>No ${currentFilter} Orders</h3>
                <p>You don't have any ${currentFilter} orders.</p>
                <button class="btn-shop-now" onclick="setActiveFilter('all')">
                    <i class="fas fa-eye"></i> View All Orders
                </button>
            `;
        } else {
            emptyState.style.display = 'none';
        }
    }
}

// ====== ORDER ACTIONS ======
async function retryPayment(orderId) {
    const confirmed = await showConfirm(
        'Retry Payment',
        'Do you want to retry payment for this order? You will be redirected to the checkout page.'
    );

    if (!confirmed) return;

    showLoading('Processing...');

    try {
        $.ajax({
            url: '/Order/RetryPayment',
            type: 'POST',
            data: { orderId: orderId },
            success: function (response) {
                hideLoading();
                if (response.success) {
                    showToast('Redirecting to payment page...', 'success');
                    setTimeout(() => {
                        window.location.href = response.redirectUrl;
                    }, 1500);
                } else {
                    showToast(response.message, 'error');
                }
            }
        })

        
    } catch (error) {
        console.error('Retry payment error:', error);
        hideLoading();
        showToast('Error processing request. Please try again.', 'error');
    }
}

async function cancelOrder(orderId) {
    const confirmed = await showConfirm(
        'Cancel Order',
        'Are you sure you want to cancel this order? This action cannot be undone.'
    );

    if (!confirmed) return;

    showLoading('Cancelling order...');

    try {
        $.ajax({
            url: "/Order/CancelOrder",
            type: "POST",
            data: { orderId: orderId },
            success: function (result) {
                hideLoading();
                if (result.success) {
                    showToast('Order cancelled successfully!', 'success');
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    showToast(result.message, 'error');
                }
            }
        })
        //const response = await fetch('/Order/CancelOrder', {
        //    method: 'POST',
        //    headers: {
        //        'Content-Type': 'application/json',
        //        'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]').value
        //    },
        //    body: JSON.stringify({ orderId: parseInt(orderId) })
        //});

        //const result = await response.json();
        

        
    } catch (error) {
        console.error('Cancel order error:', error);
        hideLoading();
        showToast('Error cancelling order. Please try again.', 'error');
    }
}

// ====== ORDER DETAILS MODAL ======
async function loadOrderDetails(orderId) {
    showLoading('Loading order details...');

    try {
        const response = await fetch(`/Order/Details/${orderId}`);
        const html = await response.text();
        hideLoading();

        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Extract just the content
        const content = tempDiv.querySelector('.order-details-container') ||
            tempDiv.querySelector('body');

        if (content) {
            const modal = document.getElementById('orderDetailsModal');
            const modalContent = document.getElementById('orderDetailsContent');

            modalContent.innerHTML = content.innerHTML;

            // Reinitialize event listeners in modal
            modalContent.querySelectorAll('.btn-retry-payment').forEach(button => {
                button.addEventListener('click', function () {
                    const orderId = this.dataset.orderId;
                    closeModal(modal);
                    retryPayment(orderId);
                });
            });

            modalContent.querySelectorAll('.btn-cancel-order').forEach(button => {
                button.addEventListener('click', function () {
                    const orderId = this.dataset.orderId;
                    closeModal(modal);
                    cancelOrder(orderId);
                });
            });

            // Show modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } else {
            showToast('Error loading order details', 'error');
        }
    } catch (error) {
        console.error('Load order details error:', error);
        hideLoading();
        showToast('Error loading order details', 'error');
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ====== HELPER FUNCTIONS ======
function showLoading(message = 'Loading...') {
    let overlay = document.getElementById('loadingOverlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin fa-3x"></i>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('p').textContent = message;
    }

    overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Toast function (reuse from cart.js)
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) {
        // Create toast if not exists
        const toastDiv = document.createElement('div');
        toastDiv.id = 'toast';
        toastDiv.className = 'toast';
        toastDiv.innerHTML = `
            <div class="toast-content">
                <span id="toastMessage">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;
        document.body.appendChild(toastDiv);

        toastDiv.querySelector('.toast-close').addEventListener('click', () => {
            toastDiv.classList.remove('show');
        });

        toastDiv.classList.add('show', type);

        setTimeout(() => {
            toastDiv.classList.remove('show');
        }, 3000);
    } else {
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Confirmation modal (reuse from cart.js)
async function showConfirm(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmationModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        if (!modal || !modalTitle || !modalMessage) {
            console.error('Confirmation modal elements not found');
            resolve(false);
            return;
        }

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        const handleOverlayClick = (e) => {
            if (e.target === modal || e.target.classList.contains('modal-overlay')) {
                handleCancel();
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };

        function cleanup() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            modal.removeEventListener('click', handleOverlayClick);
            document.removeEventListener('keydown', handleEscape);
        }

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        modal.addEventListener('click', handleOverlayClick);
        document.addEventListener('keydown', handleEscape);
    });
}