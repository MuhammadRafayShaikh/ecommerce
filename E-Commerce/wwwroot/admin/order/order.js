// API Base URL - adjust according to your backend
const API_BASE_URL = '/api';

// DOM Elements
const ordersTable = document.getElementById('ordersTable');
const ordersEmptyState = document.getElementById('ordersEmptyState');
const pagination = document.getElementById('pagination');
const orderModal = document.getElementById('orderModal');

// Statistics elements
const pendingCount = document.getElementById('pendingCount');
const confirmedCount = document.getElementById('confirmedCount');
const shippedCount = document.getElementById('shippedCount');
const deliveredCount = document.getElementById('deliveredCount');
const cancelledCount = document.getElementById('cancelledCount');

// Current order for modal
let currentOrder = null;
let currentOrders = [];
let currentPage = 1;
const pageSize = 10;
let totalOrders = 0;

// Status mapping
const orderStatusMap = {
    0: { text: 'Pending', class: 'pending' },
    1: { text: 'Confirmed', class: 'confirmed' },
    2: { text: 'Cancelled', class: 'cancelled' },
    3: { text: 'Shipped', class: 'shipped' },
    4: { text: 'Delivered', class: 'delivered' }
};

const paymentStatusMap = {
    0: { text: 'Pending', class: 'pending' },
    1: { text: 'Success', class: 'success' },
    2: { text: 'Failed', class: 'failed' }
};

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    // Set default date range to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    document.getElementById('startDate').valueAsDate = startDate;
    document.getElementById('endDate').valueAsDate = endDate;

    // Close modal when clicking outside
    orderModal.addEventListener('click', function (e) {
        if (e.target === orderModal) {
            closeOrderModal();
        }
    });

    // Load initial data
    loadOrders();
    loadStatistics();
});

// Load orders from API
async function loadOrders() {
    try {
        showLoading();

        const statusFilter = document.getElementById('statusFilter').value;
        const paymentFilter = document.getElementById('paymentFilter').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const searchTerm = document.getElementById('orderSearch').value;

        // Build query parameters
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (searchTerm) params.append('search', searchTerm);
        params.append('page', currentPage);
        params.append('pageSize', pageSize);

        const response = await fetch(`${API_BASE_URL}/orders?${params}`);

        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        currentOrders = data.orders || [];
        totalOrders = data.totalCount || 0;

        updateOrdersTable();
        updatePagination();

    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Failed to load orders. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Load statistics from API
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/statistics`);

        if (!response.ok) {
            throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();

        pendingCount.textContent = data.pending || 0;
        confirmedCount.textContent = data.confirmed || 0;
        shippedCount.textContent = data.shipped || 0;
        deliveredCount.textContent = data.delivered || 0;
        cancelledCount.textContent = data.cancelled || 0;

    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Update orders table
function updateOrdersTable() {
    // Clear current table
    ordersTable.innerHTML = '';

    if (currentOrders.length === 0) {
        ordersEmptyState.style.display = 'block';
        pagination.style.display = 'none';
        return;
    }

    ordersEmptyState.style.display = 'none';
    pagination.style.display = 'flex';

    // Populate table
    currentOrders.forEach(order => {
        const row = document.createElement('tr');
        const payment = order.payments && order.payments.length > 0 ? order.payments[0] : null;
        const itemCount = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;

        // Format date
        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        // Get status info
        const orderStatusInfo = orderStatusMap[order.status] || { text: 'Unknown', class: 'pending' };
        const paymentStatusInfo = payment ? paymentStatusMap[payment.status] : { text: 'N/A', class: 'pending' };

        row.innerHTML = `
            <td class="order-id">${order.orderNumber || 'N/A'}</td>
            <td>
                <div class="customer-info">
                    <div class="customer-name">${order.user?.name || 'N/A'}</div>
                    <div class="customer-email">${order.user?.email || 'N/A'}</div>
                </div>
            </td>
            <td>${formattedDate}</td>
            <td>
                <span class="order-status status-${orderStatusInfo.class}">
                    ${orderStatusInfo.text}
                </span>
            </td>
            <td>
                <span class="payment-status payment-${paymentStatusInfo.class}">
                    ${paymentStatusInfo.text}
                </span>
            </td>
            <td>${itemCount} item${itemCount !== 1 ? 's' : ''}</td>
            <td class="order-total">₹${(order.grandTotal || 0).toLocaleString('en-IN')}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="viewOrder(${order.id})" title="View Order">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editOrder(${order.id})" title="Edit Order">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-print" onclick="printOrder(${order.id})" title="Print Invoice">
                        <i class="fas fa-print"></i>
                    </button>
                    ${order.status !== 2 && order.status !== 4 ?
                `<button class="btn-icon btn-cancel" onclick="cancelOrder(${order.id})" title="Cancel Order">
                        <i class="fas fa-times"></i>
                    </button>` : ''}
                </div>
            </td>
        `;
        ordersTable.appendChild(row);
    });
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(totalOrders / pageSize);
    const paginationContainer = document.getElementById('pagination');

    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';

    // Clear existing buttons except first and last
    const buttons = paginationContainer.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.querySelector('.fa-chevron-left') && !button.querySelector('.fa-chevron-right')) {
            button.remove();
        }
    });

    // Add page number buttons
    const leftArrow = paginationContainer.querySelector('button:first-child');
    const rightArrow = paginationContainer.querySelector('button:last-child');

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.onclick = () => changePage(i);

        if (i === 1) {
            paginationContainer.insertBefore(button, rightArrow);
        } else {
            rightArrow.parentNode.insertBefore(button, rightArrow);
        }
    }
}

// Change page
function changePage(page) {
    if (page < 1 || page > Math.ceil(totalOrders / pageSize)) return;

    currentPage = page;
    loadOrders();

    // Update active button
    const buttons = pagination.querySelectorAll('button');
    buttons.forEach((button, index) => {
        if (index > 0 && index < buttons.length - 1) {
            button.classList.toggle('active', parseInt(button.textContent) === page);
        }
    });
}

// View order details
async function viewOrder(orderId) {
    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        currentOrder = await response.json();

        // Update modal with order data
        updateOrderModal();

        // Show modal
        orderModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error loading order details:', error);
        showNotification('Failed to load order details. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Update order modal with data
function updateOrderModal() {
    if (!currentOrder) return;

    document.getElementById('modalOrderId').textContent = currentOrder.orderNumber || 'N/A';

    // Customer information
    document.getElementById('customerName').textContent = currentOrder.user?.name || 'N/A';
    document.getElementById('customerEmail').textContent = currentOrder.user?.email || 'N/A';
    document.getElementById('customerPhone').textContent = currentOrder.orderAddress?.phone || 'N/A';

    if (currentOrder.user?.joinDate) {
        const customerSince = new Date(currentOrder.user.joinDate);
        document.getElementById('customerSince').textContent = customerSince.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } else {
        document.getElementById('customerSince').textContent = 'N/A';
    }

    // Shipping address
    document.getElementById('shippingName').textContent = currentOrder.orderAddress?.fullName || 'N/A';
    document.getElementById('shippingPhone').textContent = currentOrder.orderAddress?.phone || 'N/A';
    document.getElementById('shippingAddress').textContent = currentOrder.orderAddress?.addressLine || 'N/A';
    document.getElementById('shippingCity').textContent = `${currentOrder.orderAddress?.city || 'N/A'}, ${currentOrder.orderAddress?.postalCode || 'N/A'}`;

    // Order info
    if (currentOrder.createdAt) {
        const orderDate = new Date(currentOrder.createdAt);
        document.getElementById('orderDate').textContent = orderDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } else {
        document.getElementById('orderDate').textContent = 'N/A';
    }

    // Status
    const orderStatusInfo = orderStatusMap[currentOrder.status] || { text: 'Unknown', class: 'pending' };
    const statusElement = document.getElementById('orderStatus');
    statusElement.textContent = orderStatusInfo.text;
    statusElement.className = 'detail-value status status-' + orderStatusInfo.class;

    // Payment
    const payment = currentOrder.payments && currentOrder.payments.length > 0 ? currentOrder.payments[0] : null;
    if (payment) {
        const paymentStatusInfo = paymentStatusMap[payment.status] || { text: 'Unknown', class: 'pending' };
        document.getElementById('paymentStatus').textContent = paymentStatusInfo.text;
        document.getElementById('paymentStatus').className = 'detail-value status payment-' + paymentStatusInfo.class;
        document.getElementById('paymentMethod').textContent = payment.provider || 'N/A';
    } else {
        document.getElementById('paymentStatus').textContent = 'N/A';
        document.getElementById('paymentStatus').className = 'detail-value status';
        document.getElementById('paymentMethod').textContent = 'N/A';
    }

    // Update status select
    document.getElementById('updateStatus').value = currentOrder.status;

    // Order items
    const orderItemsTable = document.getElementById('orderItemsTable');
    orderItemsTable.innerHTML = '';

    if (currentOrder.items && currentOrder.items.length > 0) {
        currentOrder.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="item-name">${item.product?.name || 'Unknown Product'}</div>
                    <div class="item-details">SKU: ${item.productId || 'N/A'}</div>
                </td>
                <td>
                    <div style="display: flex; align-items: center;">
                        ${item.productColor?.hex ?
                    `<div class="item-color" style="background-color: ${item.productColor.hex};"></div>` : ''}
                        ${item.productColor?.name || 'N/A'}
                    </div>
                </td>
                <td>${item.size || 'N/A'}</td>
                <td>${item.quantity || 0}</td>
                <td>₹${(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                <td><strong>₹${(item.totalPrice || 0).toLocaleString('en-IN')}</strong></td>
            `;
            orderItemsTable.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center; padding: 20px;">No items found</td>';
        orderItemsTable.appendChild(row);
    }

    // Order summary
    document.getElementById('subTotal').textContent = `₹${(currentOrder.subTotal || 0).toLocaleString('en-IN')}`;
    document.getElementById('discountTotal').textContent = `-₹${(currentOrder.discountTotal || 0).toLocaleString('en-IN')}`;
    document.getElementById('shippingFee').textContent = `₹${(currentOrder.shipping || 0).toLocaleString('en-IN')}`;
    document.getElementById('grandTotal').textContent = `₹${(currentOrder.grandTotal || 0).toLocaleString('en-IN')}`;
}

// Close order modal
function closeOrderModal() {
    orderModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentOrder = null;
}

// Update order status
async function updateOrderStatus() {
    if (!currentOrder) return;

    const newStatus = parseInt(document.getElementById('updateStatus').value);

    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/orders/${currentOrder.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update order status');
        }

        showNotification(`Order ${currentOrder.orderNumber} status updated successfully`, 'success');

        // Refresh data
        loadOrders();
        loadStatistics();

        // Close modal
        closeOrderModal();

    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Failed to update order status. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Edit order (placeholder)
function editOrder(orderId) {
    showNotification(`Editing order ${orderId}`, 'info');
    // In a real app, this would open an edit form
}

// Print order invoice
function printOrder(orderId) {
    const order = orderId ? currentOrders.find(o => o.id === orderId) : currentOrder;
    if (order) {
        showNotification(`Printing invoice for order ${order.orderNumber}`, 'info');
        // In a real app, this would generate a printable invoice
        window.open(`${API_BASE_URL}/orders/${order.id}/invoice`, '_blank');
    }
}

// Cancel order
async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
        return;
    }

    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'PUT'
        });

        if (!response.ok) {
            throw new Error('Failed to cancel order');
        }

        showNotification('Order cancelled successfully', 'warning');

        // Refresh data
        loadOrders();
        loadStatistics();

    } catch (error) {
        console.error('Error cancelling order:', error);
        showNotification('Failed to cancel order. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Search orders
function searchOrders() {
    currentPage = 1;
    loadOrders();
}

// Filter orders
function filterOrders() {
    currentPage = 1;
    loadOrders();
}

// Apply filters (same as filterOrders but with notification)
function applyFilters() {
    filterOrders();
    showNotification('Filters applied successfully', 'success');
}

// Clear all filters
function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('paymentFilter').value = 'all';

    // Reset date range to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    document.getElementById('startDate').valueAsDate = startDate;
    document.getElementById('endDate').valueAsDate = endDate;

    document.getElementById('orderSearch').value = '';

    // Reset and load
    currentPage = 1;
    loadOrders();
    showNotification('Filters cleared', 'info');
}

// Refresh orders
function refreshOrders() {
    loadOrders();
    loadStatistics();
    showNotification('Orders refreshed successfully', 'success');
}

// Export orders
async function exportOrders() {
    try {
        showLoading();

        const statusFilter = document.getElementById('statusFilter').value;
        const paymentFilter = document.getElementById('paymentFilter').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const searchTerm = document.getElementById('orderSearch').value;

        // Build query parameters
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (searchTerm) params.append('search', searchTerm);

        const response = await fetch(`${API_BASE_URL}/orders/export?${params}`);

        if (!response.ok) {
            throw new Error('Failed to export orders');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification('Orders exported successfully', 'success');

    } catch (error) {
        console.error('Error exporting orders:', error);
        showNotification('Failed to export orders. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Show loading state
function showLoading() {
    // You can add a loading spinner here
    const tableBody = document.getElementById('ordersTable');
    tableBody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 40px;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #9c27b0; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 10px; color: #666;">Loading orders...</p>
            </td>
        </tr>
    `;

    // Add spin animation
    if (!document.querySelector('style[data-spin]')) {
        const style = document.createElement('style');
        style.setAttribute('data-spin', 'true');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Hide loading
function hideLoading() {
    // Loading is handled by updateOrdersTable
}

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
        notification.style.color = '#333';
    } else if (type === 'danger') {
        notification.style.backgroundColor = 'var(--danger)';
    } else if (type === 'info') {
        notification.style.backgroundColor = 'var(--info)';
    } else {
        notification.style.backgroundColor = 'var(--primary)';
    }

    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning' || type === 'danger') icon = 'exclamation-circle';

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