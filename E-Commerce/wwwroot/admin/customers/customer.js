// API Base URL
const API_BASE_URL = '/api';

// DOM Elements
const customersTable = document.getElementById('customersTable');
const customersEmptyState = document.getElementById('customersEmptyState');
const pagination = document.getElementById('pagination');
const customerModal = document.getElementById('customerModal');

// Statistics elements
const totalCustomers = document.getElementById('totalCustomers');
const activeCustomers = document.getElementById('activeCustomers');
const inactiveCustomers = document.getElementById('inactiveCustomers');
const newCustomers = document.getElementById('newCustomers');
const premiumCustomers = document.getElementById('premiumCustomers');

// Current customer for modal
let currentCustomer = null;
let currentCustomers = [];
let currentPage = 1;
const pageSize = 10;
let totalCustomersCount = 0;

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    // Set default date range to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    document.getElementById('startDate').valueAsDate = startDate;
    document.getElementById('endDate').valueAsDate = endDate;

    // Close modal when clicking outside
    customerModal.addEventListener('click', function (e) {
        if (e.target === customerModal) {
            closeCustomerModal();
        }
    });

    // Load initial data
    loadCustomers();
    loadStatistics();
});

// Load customers from API
async function loadCustomers() {
    try {
        showLoading();

        const statusFilter = document.getElementById('statusFilter').value;
        const sortFilter = document.getElementById('sortFilter').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const searchTerm = document.getElementById('customerSearch').value;

        // Build query parameters
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (sortFilter !== 'newest') params.append('sortBy', sortFilter);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (searchTerm) params.append('search', searchTerm);
        params.append('page', currentPage);
        params.append('pageSize', pageSize);

        const response = await fetch(`${API_BASE_URL}/customers?${params}`);

        if (!response.ok) {
            throw new Error('Failed to fetch customers');
        }

        const data = await response.json();
        currentCustomers = data.customers || [];
        totalCustomersCount = data.totalCount || 0;

        updateCustomersTable();
        updatePagination();

    } catch (error) {
        console.error('Error loading customers:', error);
        showNotification('Failed to load customers. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Load statistics from API
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/customers/statistics`);

        if (!response.ok) {
            throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();

        totalCustomers.textContent = data.total || 0;
        activeCustomers.textContent = data.active || 0;
        inactiveCustomers.textContent = data.inactive || 0;
        newCustomers.textContent = data.newThisMonth || 0;
        premiumCustomers.textContent = data.premium || 0;

    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Update customers table
function updateCustomersTable() {
    // Clear current table
    customersTable.innerHTML = '';

    if (currentCustomers.length === 0) {
        customersEmptyState.style.display = 'block';
        pagination.style.display = 'none';
        return;
    }

    customersEmptyState.style.display = 'none';
    pagination.style.display = 'flex';

    // Populate table
    currentCustomers.forEach(customer => {
        const row = document.createElement('tr');

        // Get initials for avatar
        const initials = getInitials(customer.firstName, customer.lastName);

        // Format registration date
        const regDate = new Date(customer.createdAt);
        const formattedDate = regDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        // Calculate days since registration
        const daysSince = Math.floor((new Date() - regDate) / (1000 * 60 * 60 * 24));

        row.innerHTML = `
            <td>#${customer.id}</td>
            <td>
                <div class="customer-profile">
                    <div class="profile-initials">${initials}</div>
                    <div class="profile-info">
                        <div class="profile-name">
                            ${customer.firstName} ${customer.lastName}
                            ${daysSince <= 30 ? '<span class="customer-badge badge-new">NEW</span>' : ''}
                            ${customer.totalSpent > 50000 ? '<span class="customer-badge badge-premium">PREMIUM</span>' : ''}
                        </div>
                        <div class="profile-email">${customer.email}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <div class="contact-email">${customer.email}</div>
                    <div class="contact-phone">${customer.phoneNumber || 'Not provided'}</div>
                </div>
            </td>
            <td>
                <span class="customer-status status-${customer.status ? 'active' : 'inactive'}">
                    ${customer.status ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div class="orders-count">${customer.totalOrders || 0}</div>
            </td>
            <td>
                <div class="total-spent">₹${(customer.totalSpent || 0).toLocaleString('en-IN')}</div>
            </td>
            <td>
                <div class="registration-date">${formattedDate}</div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="viewCustomer(${customer.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-email" onclick="sendEmailToCustomer('${customer.email}')" title="Send Email">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editCustomer(${customer.id})" title="Edit Customer">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${customer.status ?
                `<button class="btn-icon btn-delete" onclick="deactivateCustomer(${customer.id})" title="Deactivate">
                        <i class="fas fa-user-times"></i>
                    </button>` :
                `<button class="btn-icon btn-edit" onclick="activateCustomer(${customer.id})" title="Activate">
                        <i class="fas fa-user-check"></i>
                    </button>`}
                </div>
            </td>
        `;
        customersTable.appendChild(row);
    });
}

// Get initials from name
function getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(totalCustomersCount / pageSize);
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
    if (page < 1 || page > Math.ceil(totalCustomersCount / pageSize)) return;

    currentPage = page;
    loadCustomers();

    // Update active button
    const buttons = pagination.querySelectorAll('button');
    buttons.forEach((button, index) => {
        if (index > 0 && index < buttons.length - 1) {
            button.classList.toggle('active', parseInt(button.textContent) === page);
        }
    });
}

// View customer details
async function viewCustomer(customerId) {
    alert("")
    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch customer details');
        }

        currentCustomer = await response.json();
        updateCustomerModal();

        // Show modal
        customerModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error loading customer details:', error);
        showNotification('Failed to load customer details. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Update customer modal with data
function updateCustomerModal() {
    if (!currentCustomer) return;

    // Personal Information
    document.getElementById('customerId').textContent = `#${currentCustomer.id}`;
    document.getElementById('customerFullName').textContent = `${currentCustomer.firstName} ${currentCustomer.lastName}`;
    document.getElementById('customerEmail').textContent = currentCustomer.email;
    document.getElementById('customerPhone').textContent = currentCustomer.phoneNumber || 'Not provided';

    const statusElement = document.getElementById('customerStatus');
    statusElement.textContent = currentCustomer.status ? 'Active' : 'Inactive';
    statusElement.className = 'detail-value status status-' + (currentCustomer.status ? 'active' : 'inactive');

    // Customer Activity
    document.getElementById('totalOrders').textContent = currentCustomer.totalOrders || 0;
    document.getElementById('totalSpent').textContent = `₹${(currentCustomer.totalSpent || 0).toLocaleString('en-IN')}`;

    const avgOrderValue = currentCustomer.totalOrders > 0 ?
        (currentCustomer.totalSpent / currentCustomer.totalOrders).toFixed(2) : 0;
    document.getElementById('avgOrderValue').textContent = `₹${parseFloat(avgOrderValue).toLocaleString('en-IN')}`;

    if (currentCustomer.lastOrderDate) {
        const lastOrder = new Date(currentCustomer.lastOrderDate);
        document.getElementById('lastOrderDate').textContent = lastOrder.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } else {
        document.getElementById('lastOrderDate').textContent = 'No orders yet';
    }

    const memberSince = new Date(currentCustomer.createdAt);
    document.getElementById('memberSince').textContent = memberSince.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    // Update status select
    document.getElementById('updateCustomerStatus').value = currentCustomer.status.toString();

    // Recent Addresses
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = '';

    if (currentCustomer.addresses && currentCustomer.addresses.length > 0) {
        currentCustomer.addresses.slice(0, 2).forEach(address => {
            const addressItem = document.createElement('div');
            addressItem.className = 'address-item';
            addressItem.innerHTML = `
                <h4><i class="fas fa-map-marker-alt"></i> ${address.type || 'Address'}</h4>
                <p>${address.fullName || currentCustomer.firstName + ' ' + currentCustomer.lastName}</p>
                <p>${address.addressLine}</p>
                <p>${address.city}, ${address.state} - ${address.postalCode}</p>
                <p>Phone: ${address.phone || currentCustomer.phoneNumber || 'Not provided'}</p>
                ${address.isDefault ? '<span class="address-type">Default</span>' : ''}
            `;
            addressList.appendChild(addressItem);
        });
    } else {
        addressList.innerHTML = '<p style="color: #777; text-align: center;">No addresses saved</p>';
    }

    // Recent Orders
    const recentOrdersTable = document.getElementById('recentOrdersTable');
    recentOrdersTable.innerHTML = '';

    if (currentCustomer.recentOrders && currentCustomer.recentOrders.length > 0) {
        currentCustomer.recentOrders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            row.innerHTML = `
                <td><a href="/admin/orders/${order.id}" class="order-id-link">${order.orderNumber}</a></td>
                <td>${formattedDate}</td>
                <td>${order.itemsCount || 1} item${order.itemsCount !== 1 ? 's' : ''}</td>
                <td>₹${order.totalAmount.toLocaleString('en-IN')}</td>
                <td><span class="order-status status-${order.status}">${order.status}</span></td>
                <td><button class="btn-icon btn-view" onclick="viewOrder(${order.id})"><i class="fas fa-eye"></i></button></td>
            `;
            recentOrdersTable.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center; padding: 20px;">No recent orders</td>';
        recentOrdersTable.appendChild(row);
    }
}

// Close customer modal
function closeCustomerModal() {
    customerModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentCustomer = null;
}

// Update customer status
async function updateCustomerStatus() {
    if (!currentCustomer) return;

    const newStatus = document.getElementById('updateCustomerStatus').value === 'true';

    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/customers/${currentCustomer.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update customer status');
        }

        showNotification(`Customer status updated successfully`, 'success');

        // Refresh data
        loadCustomers();
        loadStatistics();

        // Update modal if open
        if (currentCustomer) {
            currentCustomer.status = newStatus;
            updateCustomerModal();
        }

    } catch (error) {
        console.error('Error updating customer status:', error);
        showNotification('Failed to update customer status. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Activate customer
async function activateCustomer(customerId) {
    if (!confirm('Are you sure you want to activate this customer?')) {
        return;
    }

    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/customers/${customerId}/activate`, {
            method: 'PUT'
        });

        if (!response.ok) {
            throw new Error('Failed to activate customer');
        }

        showNotification('Customer activated successfully', 'success');
        loadCustomers();
        loadStatistics();

    } catch (error) {
        console.error('Error activating customer:', error);
        showNotification('Failed to activate customer. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Deactivate customer
async function deactivateCustomer(customerId) {
    if (!confirm('Are you sure you want to deactivate this customer? They will not be able to login.')) {
        return;
    }

    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/customers/${customerId}/deactivate`, {
            method: 'PUT'
        });

        if (!response.ok) {
            throw new Error('Failed to deactivate customer');
        }

        showNotification('Customer deactivated successfully', 'warning');
        loadCustomers();
        loadStatistics();

    } catch (error) {
        console.error('Error deactivating customer:', error);
        showNotification('Failed to deactivate customer. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Send email to customer
function sendEmailToCustomer(email) {
    const customerEmail = email || (currentCustomer ? currentCustomer.email : null);
    if (customerEmail) {
        window.location.href = `mailto:${customerEmail}`;
    } else {
        showNotification('No email address found for this customer', 'warning');
    }
}

// Edit customer (placeholder)
function editCustomer(customerId) {
    showNotification(`Editing customer ${customerId}`, 'info');
    // In a real app, this would open an edit form
    // window.location.href = `/admin/customers/edit/${customerId}`;
}

// View all addresses
function viewAllAddresses() {
    if (currentCustomer && currentCustomer.id) {
        showNotification('Viewing all addresses', 'info');
        // In a real app, this would open addresses page
        // window.location.href = `/admin/customers/${currentCustomer.id}/addresses`;
    }
}

// View order
function viewOrder(orderId) {
    // In a real app, this would open order details
    window.open(`/admin/orders/${orderId}`, '_blank');
}

// Search customers
function searchCustomers() {
    currentPage = 1;
    loadCustomers();
}

// Filter customers
function filterCustomers() {
    currentPage = 1;
    loadCustomers();
}

// Apply filters
function applyFilters() {
    filterCustomers();
    showNotification('Filters applied successfully', 'success');
}

// Clear all filters
function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('sortFilter').value = 'newest';

    // Reset date range to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    document.getElementById('startDate').valueAsDate = startDate;
    document.getElementById('endDate').valueAsDate = endDate;

    document.getElementById('customerSearch').value = '';

    // Reset and load
    currentPage = 1;
    loadCustomers();
    showNotification('Filters cleared', 'info');
}

// Refresh customers
function refreshCustomers() {
    loadCustomers();
    loadStatistics();
    showNotification('Customers refreshed successfully', 'success');
}

// Export customers
async function exportCustomers() {
    try {
        showLoading();

        const statusFilter = document.getElementById('statusFilter').value;
        const sortFilter = document.getElementById('sortFilter').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const searchTerm = document.getElementById('customerSearch').value;

        // Build query parameters
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (sortFilter !== 'newest') params.append('sortBy', sortFilter);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (searchTerm) params.append('search', searchTerm);

        const response = await fetch(`${API_BASE_URL}/customers/export?${params}`);

        if (!response.ok) {
            throw new Error('Failed to export customers');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification('Customers exported successfully', 'success');

    } catch (error) {
        console.error('Error exporting customers:', error);
        showNotification('Failed to export customers. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
}

// Show loading state
function showLoading() {
    const tableBody = document.getElementById('customersTable');
    tableBody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 40px;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #9c27b0; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 10px; color: #666;">Loading customers...</p>
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
    // Loading is handled by updateCustomersTable
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