// ====== GLOBAL VARIABLES ======
let currentOrderId = null;
let selectedPaymentMethod = 'stripe';
let addressSaved = false;

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    initializeFormValidation();

    // Get order ID from hidden input
    const orderIdInput = document.getElementById('orderId');
    if (orderIdInput) {
        currentOrderId = orderIdInput.value;
    }
});

// ====== EVENT LISTENERS ======
function initializeEventListeners() {
    // Address Form Submit
    const addressForm = document.getElementById('addressForm');
    if (addressForm) {
        addressForm.addEventListener('submit', saveAddress);
    }

    // Payment Method Selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function () {
            selectPaymentMethod(this.dataset.provider);
        });
    });

    // Pay Now Button
    const payNowBtn = document.getElementById('payNowBtn');
    if (payNowBtn) {
        payNowBtn.addEventListener('click', processPayment);
    }

    // Input formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }

    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }

    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }
}

// ====== FORM VALIDATION ======
function initializeFormValidation() {
    // Phone number validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function () {
            if (this.value && !isValidPhone(this.value)) {
                showToast('Please enter a valid phone number', 'warning');
            }
        });
    }

    // Card validation
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('blur', function () {
            if (this.value && !isValidCardNumber(this.value)) {
                showToast('Please enter a valid card number', 'warning');
            }
        });
    }

    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('blur', function () {
            if (this.value && !isValidExpiryDate(this.value)) {
                showToast('Please enter a valid expiry date (MM/YY)', 'warning');
            }
        });
    }
}

// ====== ADDRESS SAVING ======
async function saveAddress(e) {
    e.preventDefault();

    // Validate form
    if (!validateAddressForm()) {
        showToast('Please fill all required fields correctly', 'warning');
        return;
    }

    const saveBtn = document.getElementById('saveAddressBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;

    try {
        const addressData = {
            orderId: parseInt(currentOrderId),
            fullName: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            addressLine: document.getElementById('addressLine').value.trim(),
            city: document.getElementById('city').value.trim(),
            postalCode: document.getElementById('postalCode').value.trim()
        };

        const response = await fetch('/Checkout/SaveAddress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]').value
            },
            body: JSON.stringify(addressData)
        });

        const result = await response.json();

        if (result.success) {
            showToast('Address saved successfully!', 'success');
            addressSaved = true;

            // Hide shipping form, show payment section
            document.getElementById('shippingForm').style.display = 'none';
            document.getElementById('paymentSection').style.display = 'block';

            // Update progress steps
            updateProgressSteps(2);
        } else {
            showToast(result.message || 'Error saving address', 'error');
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    } catch (error) {
        console.error('Save address error:', error);
        showToast('Error saving address. Please try again.', 'error');
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

function validateAddressForm() {
    const requiredFields = ['fullName', 'phone', 'addressLine', 'city', 'postalCode'];

    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            return false;
        }
    }

    // Validate phone number
    const phone = document.getElementById('phone').value.trim();
    if (!isValidPhone(phone)) {
        return false;
    }

    return true;
}

// ====== PAYMENT METHODS ======
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;

    // Update UI
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('active');
    });

    const selectedOption = document.querySelector(`.payment-option[data-provider="${method}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }

    // Show/hide details based on method
    document.getElementById('cardDetails').style.display = method === 'stripe' ? 'block' : 'none';
    document.getElementById('walletDetails').style.display =
        (method === 'jazzcash' || method === 'easypaisa') ? 'block' : 'none';
    document.getElementById('codNote').style.display = method === 'cod' ? 'block' : 'none';
}

// ====== PAYMENT PROCESSING ======
async function processPayment() {
    if (!addressSaved) {
        showToast('Please save your address first', 'warning');
        return;
    }

    // Validate payment details based on method
    if (!validatePaymentDetails()) {
        return;
    }

    // Show loading
    showLoading('Processing payment...');

    try {
        let transactionId = '';

        // Generate transaction ID based on payment method
        switch (selectedPaymentMethod) {
            case 'stripe':
                transactionId = 'STRIPE-' + generateTransactionId();
                break;
            case 'jazzcash':
                transactionId = 'JAZZ-' + generateTransactionId();
                break;
            case 'easypaisa':
                transactionId = 'EASY-' + generateTransactionId();
                break;
            case 'cod':
                transactionId = 'COD-' + generateTransactionId();
                break;
        }

        // For demo purposes, we'll simulate payment
        // In production, integrate with actual payment gateway
        const paymentData = {
            orderId: parseInt(currentOrderId),
            provider: selectedPaymentMethod,
            transactionId: transactionId,
            isSuccess: true // For demo, always success. In production, get from gateway response
        };

        const response = await fetch('/Checkout/ProcessPayment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]').value
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();
        hideLoading();

        if (result.success) {
            showToast('Payment successful! Thank you for your order.', 'success');

            // Update progress steps
            updateProgressSteps(3);
            // Redirect to orders page after delay
            setTimeout(() => {
                window.location.href = result.redirectUrl || '/Order/MyOrders';
            }, 2000);
        } else {
            showToast(result.message || 'Payment failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Payment error:', error);
        hideLoading();
        showToast('Error processing payment. Please try again.', 'error');
    }
}

function validatePaymentDetails() {
    switch (selectedPaymentMethod) {
        case 'stripe':
            return validateCardDetails();
        case 'jazzcash':
        case 'easypaisa':
            return validateWalletDetails();
        case 'cod':
            return true; // COD requires no validation
        default:
            return false;
    }
}

function validateCardDetails() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const cardHolder = document.getElementById('cardHolder').value;

    if (!cardNumber || !isValidCardNumber(cardNumber)) {
        showToast('Please enter a valid card number', 'warning');
        return false;
    }

    if (!expiryDate || !isValidExpiryDate(expiryDate)) {
        showToast('Please enter a valid expiry date (MM/YY)', 'warning');
        return false;
    }

    if (!cvv || cvv.length < 3) {
        showToast('Please enter a valid CVV', 'warning');
        return false;
    }

    if (!cardHolder || cardHolder.trim().length < 2) {
        showToast('Please enter card holder name', 'warning');
        return false;
    }

    return true;
}

function validateWalletDetails() {
    const mobileNumber = document.getElementById('mobileNumber').value;
    const pinCode = document.getElementById('pinCode').value;

    if (!mobileNumber || !isValidPhone(mobileNumber)) {
        showToast('Please enter a valid mobile number', 'warning');
        return false;
    }

    if (!pinCode || pinCode.length !== 4) {
        showToast('Please enter a valid 4-digit PIN', 'warning');
        return false;
    }

    return true;
}

// ====== HELPER FUNCTIONS ======
function updateProgressSteps(step) {
    const steps = document.querySelectorAll('.checkout-steps .step');
    steps.forEach((stepElement, index) => {
        if (index + 1 <= step) {
            stepElement.classList.add('active');
        } else {
            stepElement.classList.remove('active');
        }
    });
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 0) {
        value = value.match(/.{1,4}/g).join('-');
    }

    e.target.value = value;
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 0) {
        value = value.match(/.{1,4}/g).join(' ');
    }

    e.target.value = value;
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }

    e.target.value = value;
}

function isValidPhone(phone) {
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
}

function isValidCardNumber(cardNumber) {
    // Remove spaces
    const digits = cardNumber.replace(/\s/g, '');
    return digits.length >= 15 && digits.length <= 16;
}

function isValidExpiryDate(expiry) {
    const parts = expiry.split('/');
    if (parts.length !== 2) return false;

    const month = parseInt(parts[0]);
    const year = parseInt(parts[1]);

    if (isNaN(month) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;

    // Check if date is not in the past
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
}

function generateTransactionId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function showLoading(message = 'Processing...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');

    if (text) text.textContent = message;
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

// Toast function (from cart.js)
//function showToast(message, type = 'info') {
//    // This should be already defined in your _Toast partial
//    // If not, implement it here
//    console.log(`${type}: ${message}`);
//}