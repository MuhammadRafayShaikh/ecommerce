// ====== GLOBAL VARIABLES ======
let currentEditProduct = null;
let availableColors = [];
let currentSelections = {};
let productDiscount = null;
let colorStocks = {};

// ====== HELPER FUNCTIONS FOR DISCOUNT ======

// Discount calculation function
function calculateDiscountedPrice(originalPrice, discountType, discountValue) {
    if (!discountValue || discountValue === 0) {
        return originalPrice;
    }

    let discountedPrice = originalPrice;

    // DiscountType enum: 0 = Percentage, 1 = Fixed
    if (discountType === 0) { // Percentage discount
        discountedPrice = originalPrice - (originalPrice * discountValue / 100);
    } else if (discountType === 1) { // Fixed discount
        discountedPrice = originalPrice - discountValue;
    }

    // Ensure price doesn't go below 0
    return Math.max(discountedPrice, 0);
}

// Get price display HTML with discount
function getPriceDisplay(basePrice, originalPrice, discountType, discountValue) {
    if (discountType != null && discountValue > 0 && originalPrice > basePrice) {
        let discountText = '';
        if (discountType === 0) {
            discountText = `${discountValue}% OFF`;
        } else {
            discountText = `₹${discountValue} OFF`;
        }

        return `
            <div class="price-with-discount">
                <span class="original-price" style="text-decoration: line-through; color: #999;">
                    ₹${originalPrice.toLocaleString('en-IN')}
                </span>
                <span class="discounted-price" style="color: #e53935; font-weight: bold;">
                    ₹${basePrice.toLocaleString('en-IN')}
                </span>
                <div class="discount-text" style="font-size: 12px; color: #4CAF50;">
                    ${discountText}
                </div>
            </div>
        `;
    } else {
        return `₹${basePrice.toLocaleString('en-IN')}`;
    }
}

// ====== HELPER FUNCTIONS FOR STOCK MANAGEMENT ======

// Calculate total selected quantity for a color
function getTotalSelectedForColor(colorId) {
    if (!currentSelections[colorId]) return 0;

    let total = 0;
    for (const size in currentSelections[colorId]) {
        total += currentSelections[colorId][size].quantity;
    }
    return total;
}

// Get available stock for a color
function getAvailableStockForColor(colorId) {
    if (!colorStocks[colorId]) return 0;
    return colorStocks[colorId].availableStock;
}

// Get remaining stock for a color
function getRemainingStockForColor(colorId) {
    const totalStock = getAvailableStockForColor(colorId);
    const selected = getTotalSelectedForColor(colorId);
    return Math.max(0, totalStock - selected);
}

// Check if a color has available stock for given quantity
function canAddSizeToColor(colorId, size, requestedQuantity = 1) {
    const currentSizeQuantity = currentSelections[colorId] && currentSelections[colorId][size]
        ? currentSelections[colorId][size].quantity
        : 0;

    const otherSizesTotal = Object.keys(currentSelections[colorId] || {})
        .filter(s => s !== size)
        .reduce((sum, s) => sum + (currentSelections[colorId][s]?.quantity || 0), 0);

    const totalAfterRequest = otherSizesTotal + requestedQuantity;
    return totalAfterRequest <= getAvailableStockForColor(colorId);
}

// Update color stock display in UI
function updateColorStockDisplay(colorId) {
    const colorOption = document.querySelector(`.color-option[data-color-id="${colorId}"]`);
    if (colorOption) {
        const stockElement = colorOption.querySelector('.color-stock-info');
        if (stockElement) {
            const remaining = getRemainingStockForColor(colorId);
            const totalStock = getAvailableStockForColor(colorId);
            stockElement.querySelector('small').innerHTML = `
                Stock: ${totalStock} | Remaining: <span style="color: ${remaining > 0 ? '#4CAF50' : '#ff4444'}">${remaining}</span>
            `;
        }
    }
}

// Update stock display for all quantity inputs of a color
function updateStockDisplayForColor(colorId) {
    const remainingStock = getRemainingStockForColor(colorId);

    // Update in color option
    const colorOption = document.querySelector(`.color-option[data-color-id="${colorId}"]`);
    if (colorOption) {
        const stockElement = colorOption.querySelector('.color-stock-info');
        if (stockElement) {
            const colorData = availableColors.find(c => c.id == colorId);
            const totalStock = colorData?.stock || 0;
            stockElement.querySelector('small').innerHTML = `
                Stock: ${totalStock} | Remaining: <span style="color: ${remainingStock > 0 ? '#4CAF50' : '#ff4444'}">${remainingStock}</span>
            `;
        }
    }

    // Update in size group header
    const availableStockElement = document.querySelector(`#available-stock-${colorId}`);
    if (availableStockElement) {
        availableStockElement.textContent = remainingStock;
        availableStockElement.style.color = remainingStock > 0 ? '#4CAF50' : '#ff4444';
    }

    // Update max values for all quantity inputs of this color
    const quantityInputs = document.querySelectorAll(`.size-quantity-input[data-color-id="${colorId}"]`);
    const colorData = availableColors.find(c => c.id == colorId);
    const totalStock = colorData?.stock || 0;

    quantityInputs.forEach(input => {
        const size = input.dataset.size;
        const currentSizeQuantity = currentSelections[colorId] && currentSelections[colorId][size]
            ? currentSelections[colorId][size].quantity
            : 0;

        // Calculate available for this specific size
        const otherSizesTotal = Object.keys(currentSelections[colorId] || {})
            .filter(s => s !== size)
            .reduce((sum, s) => sum + (currentSelections[colorId][s]?.quantity || 0), 0);

        const maxForThisSize = totalStock - otherSizesTotal;
        input.max = maxForThisSize;

        // Update the stock note
        const stockNote = input.parentElement.querySelector('.stock-note');
        if (stockNote) {
            stockNote.innerHTML = `Max: ${maxForThisSize} (${remainingStock} remaining)`;
        }

        // If current quantity exceeds new max, adjust it
        if (currentSizeQuantity > maxForThisSize) {
            input.value = maxForThisSize;
            if (currentSelections[colorId] && currentSelections[colorId][size]) {
                currentSelections[colorId][size].quantity = maxForThisSize;
            }
        }
    });
}

// ====== TOAST AND CONFIRMATION FUNCTIONS ======

//function showToast(message, type = 'info') {
//    const toast = document.getElementById('toast');
//    const toastMessage = document.getElementById('toastMessage');

//    if (!toast || !toastMessage) return;

//    toastMessage.textContent = message;
//    toast.className = `toast show ${type}`;

//    setTimeout(() => {
//        toast.className = toast.className.replace('show', '');
//    }, 3000);
//}

//function hideToast() {
//    const toast = document.getElementById('toast');
//    if (toast) {
//        toast.className = toast.className.replace('show', '');
//    }
//}

//async function showConfirm(title, message) {
//    return new Promise((resolve) => {
//        const modal = document.getElementById('confirmationModal');
//        const modalTitle = document.getElementById('modalTitle');
//        const modalMessage = document.getElementById('modalMessage');
//        const confirmBtn = document.getElementById('confirmBtn');
//        const cancelBtn = document.getElementById('cancelBtn');

//        if (!modal || !modalTitle || !modalMessage) {
//            resolve(false);
//            return;
//        }

//        modalTitle.textContent = title;
//        modalMessage.textContent = message;
//        modal.style.display = 'block';
//        document.body.style.overflow = 'hidden';

//        const handleConfirm = () => {
//            cleanup();
//            resolve(true);
//        };

//        const handleCancel = () => {
//            cleanup();
//            resolve(false);
//        };

//        const handleOverlayClick = (e) => {
//            if (e.target === modal || e.target.classList.contains('modal-overlay')) {
//                handleCancel();
//            }
//        };

//        const handleEscape = (e) => {
//            if (e.key === 'Escape') {
//                handleCancel();
//            }
//        };

//        function cleanup() {
//            modal.style.display = 'none';
//            document.body.style.overflow = 'auto';
//            confirmBtn.removeEventListener('click', handleConfirm);
//            cancelBtn.removeEventListener('click', handleCancel);
//            modal.removeEventListener('click', handleOverlayClick);
//            document.removeEventListener('keydown', handleEscape);
//        }

//        confirmBtn.addEventListener('click', handleConfirm);
//        cancelBtn.addEventListener('click', handleCancel);
//        modal.addEventListener('click', handleOverlayClick);
//        document.addEventListener('keydown', handleEscape);
//    });
//}

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    updateCartDisplay();
});

// ====== EVENT LISTENERS ======
function initializeEventListeners() {
    // Edit Modal Events
    document.querySelector('.close-edit-modal')?.addEventListener('click', closeEditModal);
    document.querySelector('#editCartModal .modal-overlay')?.addEventListener('click', closeEditModal);
    document.querySelector('#editCartModal .btn-continue')?.addEventListener('click', closeEditModal);
    document.getElementById('updateCartBtn')?.addEventListener('click', updateCart);

    // Toast Close
    document.querySelector('.toast-close')?.addEventListener('click', hideToast);

    // Escape Key Support for edit modal
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeEditModal();
        }
    });

    // Continue Shopping
    document.querySelector('.continue-shopping')?.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = "/Collections";
    });

    // Shop Now (empty cart)
    document.querySelector('.shop-now-btn')?.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = "/Collections";
    });

    // Coupon Code Enter Key
    const couponInput = document.getElementById('couponCode');
    if (couponInput) {
        couponInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyCoupon();
            }
        });
    }
}

// ====== EDIT MODAL FUNCTIONS ======

// Open edit modal
function openEditModal(productId) {
    fetchProductData(productId);
}

// Fetch product data with current selections
function fetchProductData(productId) {
    $.ajax({
        url: '/Cart/GetProductWithSelections',
        type: 'GET',
        data: { productId: productId },
        success: function (response) {
            console.log('Product data response:', response);

            if (response.success) {
                currentEditProduct = response.data;
                availableColors = response.data.colors || [];
                productDiscount = response.data.discount || null;

                // Safely initialize current selections
                const selections = response.data.currentSelections || [];
                console.log('Current selections:', selections);
                initializeCurrentSelections(selections);

                populateEditModal();
                document.getElementById('editCartModal').style.display = 'block';
                document.body.style.overflow = 'hidden';
            } else {
                showToast('Error loading product details: ' + (response.message || 'Unknown error'), 'error');
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error:', error);
            showToast('Error loading product details. Please try again.', 'error');
        }
    });
}

// Initialize current selections from cart
function initializeCurrentSelections(selections) {
    currentSelections = {};
    colorStocks = {};

    if (!Array.isArray(selections)) {
        console.warn('Selections is not an array:', selections);
        selections = [];
    }

    // Initialize color stocks
    if (Array.isArray(availableColors)) {
        availableColors.forEach(color => {
            if (color && color.id) {
                colorStocks[color.id] = {
                    availableStock: color.stock || 0
                };
            }
        });
    }

    selections.forEach(selection => {
        if (!selection) return;

        const colorId = selection.colorId || selection.ColorId;
        const size = selection.size || selection.Size;
        const quantity = selection.quantity || selection.Quantity || 1;
        const unitPrice = selection.unitPrice || selection.UnitPrice || 0;

        if (!colorId || !size) {
            console.warn('Invalid selection data:', selection);
            return;
        }

        if (!currentSelections[colorId]) {
            currentSelections[colorId] = {};
        }

        // Check if we can add this selection based on stock
        if (canAddSizeToColor(colorId, size, quantity)) {
            currentSelections[colorId][size] = {
                quantity: parseInt(quantity) || 1,
                unitPrice: parseFloat(unitPrice) || 0
            };
        } else {
            console.warn(`Cannot add selection: color ${colorId}, size ${size}, quantity ${quantity} exceeds stock`);
        }
    });

    console.log('Initialized currentSelections:', currentSelections);
    console.log('Color stocks:', colorStocks);
}

// Populate edit modal with discount information
function populateEditModal() {
    if (!currentEditProduct) return;

    document.getElementById('editProductName').textContent = `Edit: ${currentEditProduct.name}`;
    document.getElementById('editProductTitle').textContent = currentEditProduct.name;

    // Calculate prices with discount
    const originalPrice = currentEditProduct.originalPrice || currentEditProduct.price || 0;
    const discountType = productDiscount?.type ?? null;
    const discountValue = productDiscount?.value || 0;

    // Calculate discounted base price
    const discountedBasePrice = calculateDiscountedPrice(
        originalPrice,
        discountType,
        discountValue
    );

    // Set base price for calculations
    currentEditProduct.basePrice = discountedBasePrice;
    currentEditProduct.originalPrice = originalPrice;
    currentEditProduct.discountType = discountType;
    currentEditProduct.discountValue = discountValue;

    // Display price with discount
    const priceDisplay = getPriceDisplay(
        discountedBasePrice,
        originalPrice,
        discountType,
        discountValue
    );
    document.getElementById('editProductPrice').innerHTML = priceDisplay;

    if (currentEditProduct.image) {
        document.getElementById('editProductImage').style.backgroundImage = `url('${currentEditProduct.image}')`;
    }

    populateEditColorOptions();
    updateSizeSelection();
    updateEditSelectionSummary();
    updateEditTotalPrice();
}

// Populate color options in edit modal with discount-aware pricing and stock info
function populateEditColorOptions() {
    const container = document.getElementById('editColorOptions');
    if (!container) return;

    container.innerHTML = '';

    if (!Array.isArray(availableColors)) {
        console.warn('availableColors is not an array:', availableColors);
        availableColors = [];
    }

    const basePrice = currentEditProduct.basePrice || 0;
    const originalPrice = currentEditProduct.originalPrice || 0;
    const discountType = currentEditProduct.discountType;
    const discountValue = currentEditProduct.discountValue;

    availableColors.forEach(color => {
        if (!color) return;

        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.dataset.colorId = color.id;
        colorOption.dataset.colorName = color.name;
        colorOption.dataset.extraPrice = color.extraPrice || 0;
        colorOption.dataset.stock = color.stock || 0;

        const isSelected = currentSelections[color.id] && Object.keys(currentSelections[color.id]).length > 0;
        if (isSelected) colorOption.classList.add('selected');

        // Disable if out of stock
        if (color.stock <= 0) {
            colorOption.classList.add('out-of-stock');
            colorOption.style.opacity = '0.5';
            colorOption.style.pointerEvents = 'none';
        }

        const extraPrice = color.extraPrice || 0;
        const finalPrice = basePrice + extraPrice;
        const originalItemPrice = originalPrice + extraPrice;

        let extraPriceHtml = '';
        if (extraPrice > 0) {
            extraPriceHtml = `<span class="extra-price-tag">+₹${extraPrice}</span>`;
        }

        const sizes = Array.isArray(color.sizes) ? color.sizes :
            (typeof color.sizes === 'string' ? color.sizes.split(',').map(s => s.trim()) : []);

        const colorPriceDisplay = getPriceDisplay(
            finalPrice,
            originalItemPrice,
            discountType,
            discountValue
        );

        const remainingStock = getRemainingStockForColor(color.id);
        const stockDisplay = remainingStock <= 0 && color.stock > 0
            ? `<span style="color: #ff4444;">Out of stock</span>`
            : `Stock: ${color.stock} | Remaining: <span style="color: #4CAF50;">${remainingStock}</span>`;

        colorOption.innerHTML = `
            <div class="color-dot-large" style="background-color: ${color.code || '#ccc'}"></div>
            <div class="color-info">
                <div class="color-name">${color.name || 'Unknown Color'}</div>
                <div class="color-price">
                    ${colorPriceDisplay}
                </div>
                <div class="color-stock-info">
                    ${extraPriceHtml}
                    <br>
                    <small>${stockDisplay}</small>
                    <br>
                    <small>Available sizes: ${sizes.join(', ') || 'N/A'}</small>
                </div>
            </div>
        `;

        // Only add click event if not out of stock
        if (color.stock > 0) {
            colorOption.addEventListener('click', function () {
                const colorId = this.dataset.colorId;
                toggleColorSelection(colorId);
            });
        }

        container.appendChild(colorOption);
    });
}

// Toggle color selection
function toggleColorSelection(colorId) {
    const colorOption = document.querySelector(`.color-option[data-color-id="${colorId}"]`);
    if (!colorOption) return;

    const totalStock = parseInt(colorOption.dataset.stock) || 0;

    if (colorOption.classList.contains('selected')) {
        colorOption.classList.remove('selected');
        delete currentSelections[colorId];
        const sizeGroup = document.querySelector(`.color-size-group[data-color-id="${colorId}"]`);
        if (sizeGroup) sizeGroup.remove();
    } else {
        // Check if there's any remaining stock
        const remainingStock = getRemainingStockForColor(colorId);
        if (remainingStock <= 0) {
            showToast('No stock available for this color', 'warning');
            return;
        }

        colorOption.classList.add('selected');
        if (!currentSelections[colorId]) currentSelections[colorId] = {};
        document.getElementById('editSizeSelection').style.display = 'block';
        addSizeOptionsForEditColor(colorId);
    }

    updateStockDisplayForColor(colorId);
    updateEditSelectionSummary();
    updateEditTotalPrice();
}

// Add size options for color in edit mode with discount pricing and stock info
function addSizeOptionsForEditColor(colorId) {
    const colorData = availableColors.find(c => c.id == colorId);
    if (!colorData) return;

    if (document.querySelector(`.color-size-group[data-color-id="${colorId}"]`)) return;

    const sizeContainer = document.getElementById('editSizeContainer');
    const extraPrice = colorData.extraPrice || 0;
    const basePrice = currentEditProduct.basePrice || 0;
    const finalPrice = basePrice + extraPrice;
    const originalItemPrice = (currentEditProduct.originalPrice || 0) + extraPrice;
    const discountType = currentEditProduct.discountType;
    const discountValue = currentEditProduct.discountValue;

    let extraPriceHtml = '';
    if (extraPrice > 0) {
        extraPriceHtml = `<span class="extra-price-tag">+₹${extraPrice}</span>`;
    }

    const priceDisplay = getPriceDisplay(
        finalPrice,
        originalItemPrice,
        discountType,
        discountValue
    );

    const sizes = Array.isArray(colorData.sizes) ? colorData.sizes :
        (typeof colorData.sizes === 'string' ? colorData.sizes.split(',').map(s => s.trim()) : []);

    const totalStock = colorData.stock || 0;
    const remainingStock = getRemainingStockForColor(colorId);

    const sizeGroup = document.createElement('div');
    sizeGroup.className = 'color-size-group';
    sizeGroup.dataset.colorId = colorId;
    sizeGroup.dataset.extraPrice = extraPrice;
    sizeGroup.dataset.unitPrice = finalPrice;
    sizeGroup.dataset.totalStock = totalStock;

    sizeGroup.innerHTML = `
        <div class="color-size-header">
            <div class="color-indicator" style="background-color: ${colorData.code || '#ccc'}"></div>
            <div>
                <h4>${colorData.name || 'Unknown Color'}</h4>
                <div class="color-price-info">
                    ${priceDisplay}
                </div>
                ${extraPriceHtml}
                <div class="stock-info">
                    Total Stock: ${totalStock} | Available: <span id="available-stock-${colorId}" style="color: #4CAF50;">${remainingStock}</span>
                </div>
            </div>
        </div>
        <div class="size-options">
            ${sizes.map(size => {
        const isSelected = currentSelections[colorId] && currentSelections[colorId][size];
        const selectedClass = isSelected ? 'selected' : '';
        return `<div class="size-option ${selectedClass}" data-size="${size}">${size}</div>`;
    }).join('')}
        </div>
    `;

    sizeGroup.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', function () {
            const size = this.dataset.size;
            toggleEditSizeSelection(colorId, size, this);
        });
    });

    sizeContainer.appendChild(sizeGroup);
}

// Update size selection UI
function updateSizeSelection() {
    const sizeContainer = document.getElementById('editSizeContainer');
    if (!sizeContainer) return;

    sizeContainer.innerHTML = '';

    if (typeof currentSelections !== 'object' || currentSelections === null) {
        currentSelections = {};
    }

    for (const colorId in currentSelections) {
        const colorData = availableColors.find(c => c.id == colorId);
        if (colorData) addSizeOptionsForEditColor(colorId);
    }

    if (Object.keys(currentSelections).length > 0) {
        document.getElementById('editSizeSelection').style.display = 'block';
    } else {
        document.getElementById('editSizeSelection').style.display = 'none';
    }
}

// Toggle size selection in edit mode
function toggleEditSizeSelection(colorId, size, element) {
    const colorData = availableColors.find(c => c.id == colorId);
    const extraPrice = colorData?.extraPrice || 0;
    const basePrice = currentEditProduct.basePrice || 0;
    const unitPrice = basePrice + extraPrice;
    const totalStock = colorData?.stock || 0;

    if (currentSelections[colorId] && currentSelections[colorId][size]) {
        // Remove size selection
        delete currentSelections[colorId][size];
        element.classList.remove('selected');
        const quantityDiv = element.nextElementSibling;
        if (quantityDiv?.classList.contains('size-quantity')) {
            quantityDiv.remove();
        }

        // If no sizes left for this color, remove color selection
        if (Object.keys(currentSelections[colorId]).length === 0) {
            const colorOption = document.querySelector(`.color-option[data-color-id="${colorId}"]`);
            if (colorOption) colorOption.classList.remove('selected');
            delete currentSelections[colorId];
        }
    } else {
        // Check if we can add this size based on available stock
        const remainingStock = getRemainingStockForColor(colorId);
        if (remainingStock <= 0) {
            showToast('No stock available for this color', 'warning');
            return;
        }

        if (!currentSelections[colorId]) currentSelections[colorId] = {};

        // Set initial quantity (minimum of remaining stock and 1)
        const initialQuantity = Math.min(1, remainingStock);

        currentSelections[colorId][size] = {
            quantity: initialQuantity,
            unitPrice: unitPrice
        };

        element.classList.add('selected');
        addEditQuantityInput(colorId, size, element, initialQuantity);
    }

    updateStockDisplayForColor(colorId);
    updateEditSelectionSummary();
    updateEditTotalPrice();
}

// Add quantity input for edit mode with stock validation
function addEditQuantityInput(colorId, size, sizeElement, currentQuantity) {
    const existingQuantityDiv = sizeElement.nextElementSibling;
    if (existingQuantityDiv?.classList.contains('size-quantity')) {
        existingQuantityDiv.remove();
    }

    const colorData = availableColors.find(c => c.id == colorId);
    const totalStock = colorData?.stock || 0;
    const remainingStock = getRemainingStockForColor(colorId);

    // Calculate max quantity based on remaining stock + current selection
    const currentSizeQuantity = currentSelections[colorId] && currentSelections[colorId][size]
        ? currentSelections[colorId][size].quantity
        : 0;

    const otherSizesTotal = Object.keys(currentSelections[colorId] || {})
        .filter(s => s !== size)
        .reduce((sum, s) => sum + (currentSelections[colorId][s]?.quantity || 0), 0);

    const maxQuantity = totalStock - otherSizesTotal;

    const quantityDiv = document.createElement('div');
    quantityDiv.className = 'size-quantity';
    quantityDiv.innerHTML = `
        <label>Quantity:</label>
        <input type="number" class="size-quantity-input" 
               value="${currentQuantity}" min="1" max="${maxQuantity}"
               data-color-id="${colorId}" data-size="${size}">
        <div class="stock-note" style="font-size: 11px; color: #666; margin-top: 2px;">
            Max: ${maxQuantity} (${remainingStock} remaining)
        </div>
    `;

    const quantityInput = quantityDiv.querySelector('.size-quantity-input');

    quantityInput.addEventListener('input', function () {
        let quantity = parseInt(this.value) || 1;
        const max = parseInt(this.max) || 1;

        // Validate against max
        if (quantity > max) {
            quantity = max;
            this.value = max;
            showToast(`Maximum ${max} allowed for this size`, 'warning');
        }

        if (quantity < 1) {
            quantity = 1;
            this.value = 1;
        }

        if (currentSelections[colorId] && currentSelections[colorId][size]) {
            currentSelections[colorId][size].quantity = quantity;
        }

        updateStockDisplayForColor(colorId);
        updateEditSelectionSummary();
        updateEditTotalPrice();
    });

    quantityInput.addEventListener('change', function () {
        let quantity = parseInt(this.value) || 1;
        if (quantity < 1) {
            this.value = 1;
            if (currentSelections[colorId] && currentSelections[colorId][size]) {
                currentSelections[colorId][size].quantity = 1;
            }
        }
    });

    sizeElement.parentNode.insertBefore(quantityDiv, sizeElement.nextSibling);
}

// Update selection summary for edit mode with discount and stock info
function updateEditSelectionSummary() {
    const summaryContainer = document.getElementById('editSelectionSummary');
    if (!summaryContainer) return;

    let summaryHTML = '';
    let hasSelections = false;

    const originalPrice = currentEditProduct.originalPrice || 0;
    const discountType = currentEditProduct.discountType;
    const discountValue = currentEditProduct.discountValue;

    for (const colorId in currentSelections) {
        const colorSizes = currentSelections[colorId];
        const colorData = availableColors.find(c => c.id == colorId);

        if (!colorData || Object.keys(colorSizes).length === 0) continue;

        hasSelections = true;
        const extraPrice = colorData.extraPrice || 0;
        const discountedBasePrice = currentEditProduct.basePrice || 0;
        const finalPrice = discountedBasePrice + extraPrice;
        const originalItemPrice = originalPrice + extraPrice;

        const sizeList = Object.keys(colorSizes).map(size => {
            const item = colorSizes[size];
            const itemTotal = item.unitPrice * item.quantity;

            let priceDisplay = `₹${item.unitPrice.toLocaleString('en-IN')}`;
            if (discountType != null && discountValue > 0 && originalItemPrice > finalPrice) {
                priceDisplay = `
                    <span style="text-decoration: line-through; color: #999; margin-right: 4px;">
                        ₹${originalItemPrice.toLocaleString('en-IN')}
                    </span>
                    ₹${item.unitPrice.toLocaleString('en-IN')}
                `;
            }

            return `${size}: ${item.quantity} × ${priceDisplay} = ₹${itemTotal.toLocaleString('en-IN')}`;
        }).join('<br>');

        let extraPriceHtml = '';
        if (extraPrice > 0) {
            extraPriceHtml = `<span class="extra-price-badge">+₹${extraPrice}</span>`;
        }

        // Calculate totals and savings
        const totalQuantity = Object.values(colorSizes).reduce((sum, item) => sum + item.quantity, 0);
        const totalOriginal = originalItemPrice * totalQuantity;
        const totalDiscounted = finalPrice * totalQuantity;
        const savings = totalOriginal - totalDiscounted;
        const remainingStock = getRemainingStockForColor(colorId);

        let savingsHtml = '';
        if (savings > 0) {
            savingsHtml = `<div class="savings-info">Saved: ₹${savings.toLocaleString('en-IN')}</div>`;
        }

        summaryHTML += `
            <div class="selection-item" data-color-id="${colorId}">
                <div class="selection-color">
                    <div class="selection-color-dot" style="background-color: ${colorData.code || '#ccc'}"></div>
                    <div class="selection-details">
                        <div>
                            <strong>${colorData.name || 'Unknown Color'}</strong>
                            ${extraPriceHtml}
                            <span class="stock-badge" style="background-color: ${remainingStock > 0 ? '#4CAF50' : '#ff4444'}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px;">
                                ${remainingStock} left
                            </span>
                            <button class="remove-color-btn" data-color-id="${colorId}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="size-list">${sizeList}</div>
                        <div class="selection-total">
                            Total: ₹${totalDiscounted.toLocaleString('en-IN')}
                            ${savingsHtml}
                        </div>
                    </div>
                </div>
                <div class="selection-actions">
                    ${Object.keys(colorSizes).map(size => `
                        <button class="remove-size-btn" 
                                data-color-id="${colorId}" 
                                data-size="${size}">
                            <i class="fas fa-times"></i> Remove ${size}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (!hasSelections) {
        summaryHTML = '<p class="no-selection">No selections made. Please select at least one color and size.</p>';
    }

    summaryContainer.innerHTML = summaryHTML;

    document.querySelectorAll('.remove-color-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const colorId = this.dataset.colorId;
            removeEditColor(colorId);
        });
    });

    document.querySelectorAll('.remove-size-btn').forEach(button => {
        button.addEventListener('click', function () {
            const colorId = this.dataset.colorId;
            const size = this.dataset.size;
            removeEditSize(colorId, size);
        });
    });
}

// Remove color in edit mode
function removeEditColor(colorId) {
    delete currentSelections[colorId];

    const colorOption = document.querySelector(`.color-option[data-color-id="${colorId}"]`);
    if (colorOption) colorOption.classList.remove('selected');

    const sizeGroup = document.querySelector(`.color-size-group[data-color-id="${colorId}"]`);
    if (sizeGroup) sizeGroup.remove();

    updateStockDisplayForColor(colorId);
    updateEditSelectionSummary();
    updateEditTotalPrice();
}

// Remove specific size in edit mode
function removeEditSize(colorId, size) {
    if (!currentSelections[colorId] || !currentSelections[colorId][size]) return;

    delete currentSelections[colorId][size];

    const sizeOption = document.querySelector(
        `.color-size-group[data-color-id="${colorId}"] .size-option[data-size="${size}"]`
    );

    if (sizeOption) {
        sizeOption.classList.remove('selected');
        const quantityDiv = sizeOption.nextElementSibling;
        if (quantityDiv?.classList.contains('size-quantity')) {
            quantityDiv.remove();
        }
    }

    if (Object.keys(currentSelections[colorId]).length === 0) {
        removeEditColor(colorId);
    }

    updateStockDisplayForColor(colorId);
    updateEditSelectionSummary();
    updateEditTotalPrice();
}

// Update total price in edit mode with discount
function updateEditTotalPrice() {
    let total = 0;
    let originalTotal = 0;

    const basePrice = currentEditProduct.basePrice || 0;
    const originalBasePrice = currentEditProduct.originalPrice || 0;
    const discountType = currentEditProduct.discountType;
    const discountValue = currentEditProduct.discountValue;

    for (const colorId in currentSelections) {
        const colorSizes = currentSelections[colorId];
        const colorData = availableColors.find(c => c.id == colorId);
        const extraPrice = colorData?.extraPrice || 0;
        const unitPrice = basePrice + extraPrice;
        const originalUnitPrice = originalBasePrice + extraPrice;

        Object.keys(colorSizes).forEach(size => {
            const item = colorSizes[size];
            total += unitPrice * item.quantity;
            originalTotal += originalUnitPrice * item.quantity;
        });
    }

    const totalPriceElement = document.getElementById('editTotalPrice');
    if (totalPriceElement) {
        let displayHTML = '';

        if (discountType != null && discountValue > 0 && originalTotal > total) {
            const savings = originalTotal - total;
            displayHTML = `
                <span style="text-decoration: line-through; color: #999; margin-right: 8px;">
                    ₹${originalTotal.toLocaleString('en-IN')}
                </span>
                <span style="color: #e53935; font-weight: bold;">
                    ₹${total.toLocaleString('en-IN')}
                </span>
                <div style="font-size: 12px; color: #4CAF50;">
                    Saved: ₹${savings.toLocaleString('en-IN')}
                </div>
            `;
        } else {
            displayHTML = `₹${total.toLocaleString('en-IN')}`;
        }

        totalPriceElement.innerHTML = displayHTML;
    }
}

// ====== CART UPDATE FUNCTION ======
async function updateCart() {
    if (!currentEditProduct) return;

    // Final stock validation before updating
    let hasSelections = false;
    for (const colorId in currentSelections) {
        const colorData = availableColors.find(c => c.id == colorId);
        if (!colorData) continue;

        const totalSelected = getTotalSelectedForColor(colorId);
        if (totalSelected > colorData.stock) {
            showToast(`Total quantity for ${colorData.name} exceeds available stock (${colorData.stock})`, 'error');
            return;
        }

        if (totalSelected <= 0) {
            showToast(`Please select at least one item for ${colorData.name}`, 'warning');
            return;
        }

        hasSelections = true;
    }

    if (!hasSelections) {
        showToast('Please select at least one color and size', 'warning');
        return;
    }

    const updateData = {
        productId: currentEditProduct.id,
        originalPrice: currentEditProduct.originalPrice,
        discountType: currentEditProduct.discountType,
        discountValue: currentEditProduct.discountValue,
        basePrice: currentEditProduct.basePrice,
        selections: []
    };

    for (const colorId in currentSelections) {
        const colorSizes = currentSelections[colorId];
        const colorData = availableColors.find(c => c.id == colorId);
        const extraPrice = colorData?.extraPrice || 0;
        const unitPrice = (currentEditProduct.basePrice || 0) + extraPrice;

        const sizes = Object.keys(colorSizes).map(size => ({
            size: size,
            quantity: colorSizes[size].quantity,
            unitPrice: unitPrice
        }));

        if (sizes.length > 0) {
            updateData.selections.push({
                colorId: colorId,
                colorName: colorData?.name || '',
                colorCode: colorData?.code || '',
                extraPrice: extraPrice,
                stock: colorData?.stock || 0,
                sizes: sizes
            });
        }
    }

    // Show loading on button
    const updateBtn = document.getElementById('updateCartBtn');
    const originalText = updateBtn.innerHTML;
    updateBtn.classList.add('loading');
    updateBtn.disabled = true;

    try {
        const response = await fetch('/Cart/UpdateCartItem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();

        updateBtn.classList.remove('loading');
        updateBtn.innerHTML = originalText;
        updateBtn.disabled = false;

        if (result.success) {
            showToast('Cart updated successfully!', 'success');
            setTimeout(() => {
                closeEditModal();
                setTimeout(() => location.reload(), 300);
            }, 1000);
        } else {
            showToast(result.message || 'Error updating cart', 'error');
        }
    } catch (error) {
        console.error('Update cart error:', error);
        updateBtn.classList.remove('loading');
        updateBtn.innerHTML = originalText;
        updateBtn.disabled = false;
        showToast('Error updating cart. Please try again.', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editCartModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentEditProduct = null;
    currentSelections = {};
    productDiscount = null;
    colorStocks = {};
}

// ====== CART MANAGEMENT FUNCTIONS ======

// Clear entire cart
async function clearCart() {
    const confirmed = await showConfirm(
        'Clear Cart',
        'Are you sure you want to clear your entire shopping cart? This action cannot be undone.'
    );

    if (!confirmed) return;

    const clearBtn = document.querySelector('.clear-cart');
    const originalText = clearBtn.innerHTML;
    clearBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Clearing...';
    clearBtn.disabled = true;

    try {
        $.ajax({
            url: '/Cart/ClearCart',
            type: 'POST',
            success: function (response) {
                if (response.success) {
                    showToast('Your cart has been cleared successfully!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showToast('Failed to clear cart. Please try again.', 'error');
                }
            }
        })
        
        clearBtn.innerHTML = originalText;
        clearBtn.disabled = false;

        
    } catch (error) {
        console.error('Clear cart error:', error);
        clearBtn.innerHTML = originalText;
        clearBtn.disabled = false;
        showToast('Error clearing cart. Please try again.', 'error');
    }
}

// Apply coupon code
async function applyCoupon() {
    const couponCode = document.getElementById('couponCode')?.value.trim();

    if (!couponCode) {
        showToast('Please enter a coupon code', 'warning');
        return;
    }

    const applyBtn = document.querySelector('.discount-input button');
    const originalText = applyBtn.textContent;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    applyBtn.disabled = true;

    try {
        const response = await fetch('/Cart/ApplyCoupon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ couponCode: couponCode })
        });

        const result = await response.json();

        applyBtn.innerHTML = originalText;
        applyBtn.disabled = false;

        if (result.success) {
            showToast(`Coupon "${couponCode}" applied successfully! Discount: ₹${result.discount}`, 'success');
            if (result.newTotal) {
                document.getElementById('total').textContent = result.newTotal;
            }
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('Apply coupon error:', error);
        applyBtn.innerHTML = originalText;
        applyBtn.disabled = false;
        showToast('Error applying coupon. Please try again.', 'error');
    }
}

// Proceed to checkout
// Replace the existing proceedToCheckout function with this:
async function proceedToCheckout() {
    const confirmed = await showConfirm(
        'Proceed to Checkout',
        'Are you ready to complete your purchase? You will be redirected to the secure checkout page.'
    );

    if (!confirmed) return;

    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    checkoutBtn.disabled = true;

    try {
        // Check if cart is empty
        const cartItems = document.querySelectorAll('.cart-item');
        if (cartItems.length === 0) {
            showToast('Your cart is empty!', 'error');
            checkoutBtn.innerHTML = originalText;
            checkoutBtn.disabled = false;
            return;
        }

        // Create order first
        const response = await fetch('/Order/Index', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]').value
            }
        });

        const result = await response.json();

        if (result.success) {
            showToast('Order created successfully! Redirecting to checkout...', 'success');

            // Redirect to checkout page with order ID
            setTimeout(() => {
                window.location.href = `/Checkout?orderId=${result.orderId}`;
            }, 1500);
        } else {
            showToast(result.message || 'Error creating order', 'error');
            checkoutBtn.innerHTML = originalText;
            checkoutBtn.disabled = false;
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Error processing checkout. Please try again.', 'error');
        checkoutBtn.innerHTML = originalText;
        checkoutBtn.disabled = false;
    }
}

// Update cart display with discount calculations
function updateCartDisplay() {
    let subtotal = 0;
    let originalSubtotal = 0;

    document.querySelectorAll('.cart-item').forEach(item => {
        // Get the current price (already includes discount)
        const priceElement = item.querySelector('.current-price');
        if (priceElement) {
            const priceText = priceElement.textContent || priceElement.innerText;
            const priceMatch = priceText.match(/₹(\d+(,\d+)*)/);
            if (priceMatch) {
                const price = parseFloat(priceMatch[1].replace(/,/g, '')) || 0;
                subtotal += price;
            }
        }

        // Get original price if available
        const originalPriceElement = item.querySelector('.original-price');
        if (originalPriceElement) {
            const originalPriceText = originalPriceElement.textContent || originalPriceElement.innerText;
            const originalPriceMatch = originalPriceText.match(/₹(\d+(,\d+)*)/);
            if (originalPriceMatch) {
                const originalPrice = parseFloat(originalPriceMatch[1].replace(/,/g, '')) || 0;
                originalSubtotal += originalPrice;
            }
        }
    });

    // Update summary elements
    const subtotalElement = document.getElementById('subtotal');
    if (subtotalElement) {
        subtotalElement.textContent = subtotal.toLocaleString('en-IN');
    }

    // Calculate and update tax (12% GST)
    const tax = subtotal * 0.12;
    const taxElement = document.getElementById('tax');
    if (taxElement) {
        taxElement.textContent = Math.round(tax).toLocaleString('en-IN');
    }

    // Update savings if available
    const savingsElement = document.getElementById('totalSavings');
    if (savingsElement) {
        const savings = originalSubtotal - subtotal;
        savingsElement.textContent = savings.toLocaleString('en-IN');
    }

    // Update total
    const delivery = 99; // Fixed delivery charge
    const discount = document.getElementById('discount') ?
        parseFloat(document.getElementById('discount').textContent.replace(/,/g, '')) || 0 : 0;
    const total = subtotal + delivery + tax - discount;

    const totalElement = document.getElementById('total');
    if (totalElement) {
        totalElement.textContent = Math.round(total).toLocaleString('en-IN');
    }
}

// Update cart count in header
function updateCartCount() {
    const cartItems = document.querySelectorAll('.cart-item');
    const totalItems = cartItems.length;
    const cartCountElement = document.getElementById('cartCount');

    if (cartCountElement) {
        if (totalItems === 0) {
            cartCountElement.textContent = "Cart is Empty";
        } else {
            // Calculate total quantity from all items
            let totalQuantity = 0;
            cartItems.forEach(item => {
                const quantityElement = item.querySelector('.quantity-value');
                if (quantityElement) {
                    totalQuantity += parseInt(quantityElement.textContent) || 0;
                }
            });
            cartCountElement.textContent = `${totalQuantity} Item${totalQuantity !== 1 ? 's' : ''}`;
        }
    }
}

// Call on page load
updateCartCount();