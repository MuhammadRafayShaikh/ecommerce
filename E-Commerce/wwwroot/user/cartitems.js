// Current product being edited
let currentEditProduct = null;
let availableColors = [];
let currentSelections = {};

// Open edit modal
function openEditModal(productId) {
    // Fetch product data with current selections
    fetchProductData(productId);
}

// Fetch product data and current selections
function fetchProductData(productId) {
    $.ajax({
        url: '/Cart/GetProductWithSelections',
        type: 'GET',
        data: { productId: productId },
        success: function (response) {
            if (response.success) {
                currentEditProduct = response.data;
                availableColors = response.data.colors;

                // Initialize current selections from cart
                initializeCurrentSelections(response.data.currentSelections);

                // Populate modal
                populateEditModal();

                // Show modal
                document.getElementById('editCartModal').style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        },
        error: function () {
            alert('Error loading product details');
        }
    });
}

// Initialize current selections from cart
function initializeCurrentSelections(selections) {
    currentSelections = {};

    selections.forEach(selection => {
        if (!currentSelections[selection.colorId]) {
            currentSelections[selection.colorId] = {};
        }

        // Store size and quantity
        currentSelections[selection.colorId][selection.size] = {
            quantity: selection.quantity,
            unitPrice: selection.unitPrice
        };
    });
}

// Populate edit modal
function populateEditModal() {
    if (!currentEditProduct) return;

    // Update basic product info
    document.getElementById('editProductName').textContent = `Edit: ${currentEditProduct.name}`;
    document.getElementById('editProductTitle').textContent = currentEditProduct.name;
    document.getElementById('editProductPrice').textContent = `₹${currentEditProduct.price.toLocaleString('en-IN')}`;
    document.getElementById('editProductImage').style.backgroundImage =
        `url('${currentEditProduct.image}')`;

    // Populate color options
    populateEditColorOptions();

    // Update size selection
    updateSizeSelection();

    // Update summary and total
    updateEditSelectionSummary();
    updateEditTotalPrice();
}

// Populate color options in edit modal
function populateEditColorOptions() {
    const container = document.getElementById('editColorOptions');
    container.innerHTML = '';

    availableColors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.dataset.colorId = color.id;
        colorOption.dataset.colorName = color.name;
        colorOption.dataset.extraPrice = color.extraPrice || 0;

        // Check if this color has selections
        const isSelected = currentSelections[color.id] &&
            Object.keys(currentSelections[color.id]).length > 0;

        if (isSelected) {
            colorOption.classList.add('selected');
        }

        // Extra price display
        let extraPriceText = '';
        if (color.extraPrice > 0) {
            extraPriceText = `<span class="extra-price-tag">+${color.extraPrice}</span>`;
        }

        colorOption.innerHTML = `
                <div class="color-dot-large" style="background-color: ${color.code}"></div>
                <div class="color-info">
                    <div class="color-name">${color.name}</div>
                    <div class="color-stock">
                        ${extraPriceText}
                        <br>
                        <small>Available sizes: ${color.sizes.join(', ')}</small>
                    </div>
                </div>
            `;

        // Add click event
        colorOption.addEventListener('click', function () {
            const colorId = this.dataset.colorId;
            toggleColorSelection(colorId);
        });

        container.appendChild(colorOption);
    });
}

// Toggle color selection
function toggleColorSelection(colorId) {
    const colorOption = document.querySelector(`.color-option[data-color-id="${colorId}"]`);

    if (colorOption.classList.contains('selected')) {
        // Deselect color - remove all its sizes
        colorOption.classList.remove('selected');

        // Remove color from current selections
        delete currentSelections[colorId];

        // Remove size group from UI
        const sizeGroup = document.querySelector(`.color-size-group[data-color-id="${colorId}"]`);
        if (sizeGroup) {
            sizeGroup.remove();
        }
    } else {
        // Select color
        colorOption.classList.add('selected');

        // Initialize empty selections for this color
        if (!currentSelections[colorId]) {
            currentSelections[colorId] = {};
        }

        // Show size selection section if hidden
        document.getElementById('editSizeSelection').style.display = 'block';

        // Add size options for this color
        addSizeOptionsForEditColor(colorId);
    }

    // Update UI
    updateEditSelectionSummary();
    updateEditTotalPrice();
}

// Add size options for color in edit mode
function addSizeOptionsForEditColor(colorId) {
    const colorData = availableColors.find(c => c.id == colorId);
    if (!colorData) return;

    // Check if size group already exists
    if (document.querySelector(`.color-size-group[data-color-id="${colorId}"]`)) {
        return;
    }

    const sizeContainer = document.getElementById('editSizeContainer');
    const extraPrice = colorData.extraPrice || 0;

    // Extra price display
    let extraPriceHtml = '';
    if (extraPrice > 0) {
        extraPriceHtml = `<span class="extra-price-tag">+${extraPrice}</span>`;
    }

    const sizeGroup = document.createElement('div');
    sizeGroup.className = 'color-size-group';
    sizeGroup.dataset.colorId = colorId;
    sizeGroup.dataset.extraPrice = extraPrice;

    sizeGroup.innerHTML = `
            <div class="color-size-header">
                <div class="color-indicator" style="background-color: ${colorData.code}"></div>
                <div>
                    <h4>${colorData.name}</h4>
                    ${extraPriceHtml}
                </div>
            </div>
            <div class="size-options">
                ${colorData.sizes.map(size => {
        // Check if this size is currently selected
        const isSelected = currentSelections[colorId] && currentSelections[colorId][size];
        const selectedClass = isSelected ? 'selected' : '';
        const disabledClass = ''; // No sizes are disabled in edit mode

        return `
                        <div class="size-option ${selectedClass} ${disabledClass}" 
                             data-size="${size}">
                            ${size}
                        </div>
                    `;
    }).join('')}
            </div>
        `;

    // Add event listeners to size options
    const sizeOptions = sizeGroup.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
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
    sizeContainer.innerHTML = '';

    // Add size groups for all selected colors
    for (const colorId in currentSelections) {
        const colorData = availableColors.find(c => c.id == colorId);
        if (colorData) {
            addSizeOptionsForEditColor(colorId);
        }
    }

    // Show/hide size selection section
    if (Object.keys(currentSelections).length > 0) {
        document.getElementById('editSizeSelection').style.display = 'block';
    } else {
        document.getElementById('editSizeSelection').style.display = 'none';
    }
}

// Toggle size selection in edit mode
function toggleEditSizeSelection(colorId, size, element) {
    const colorData = availableColors.find(c => c.id == colorId);
    const extraPrice = colorData.extraPrice || 0;

    if (currentSelections[colorId] && currentSelections[colorId][size]) {
        // Deselect size
        delete currentSelections[colorId][size];
        element.classList.remove('selected');

        // Remove quantity input
        const quantityDiv = element.nextElementSibling;
        if (quantityDiv && quantityDiv.classList.contains('size-quantity')) {
            quantityDiv.remove();
        }
    } else {
        // Select size
        if (!currentSelections[colorId]) {
            currentSelections[colorId] = {};
        }

        // Set default quantity to existing value or 1
        const existingQuantity = currentSelections[colorId][size] ?
            currentSelections[colorId][size].quantity : 1;

        currentSelections[colorId][size] = {
            quantity: existingQuantity,
            unitPrice: currentEditProduct.price + extraPrice
        };

        element.classList.add('selected');

        // Add quantity input
        addEditQuantityInput(colorId, size, element, existingQuantity);
    }

    // Update UI
    updateEditSelectionSummary();
    updateEditTotalPrice();
}

// Add quantity input for edit mode
function addEditQuantityInput(colorId, size, sizeElement, currentQuantity) {
    // Remove existing quantity input
    const existingQuantityDiv = sizeElement.nextElementSibling;
    if (existingQuantityDiv && existingQuantityDiv.classList.contains('size-quantity')) {
        existingQuantityDiv.remove();
    }

    const quantityDiv = document.createElement('div');
    quantityDiv.className = 'size-quantity';
    quantityDiv.innerHTML = `
            <label>Quantity:</label>
            <input type="number" class="size-quantity-input" 
                   value="${currentQuantity}" min="1" max="10"
                   data-color-id="${colorId}" data-size="${size}">
        `;

    // Add event listener
    const quantityInput = quantityDiv.querySelector('.size-quantity-input');
    quantityInput.addEventListener('input', function () {
        const quantity = parseInt(this.value) || 1;

        // Ensure quantity is within limits
        if (quantity < 1) this.value = 1;
        if (quantity > 10) this.value = 10;

        if (currentSelections[colorId] && currentSelections[colorId][size]) {
            currentSelections[colorId][size].quantity = quantity;
        }

        updateEditSelectionSummary();
        updateEditTotalPrice();
    });

    // Insert after size element
    sizeElement.parentNode.insertBefore(quantityDiv, sizeElement.nextSibling);
}

// Update selection summary for edit mode
function updateEditSelectionSummary() {
    const summaryContainer = document.getElementById('editSelectionSummary');

    let summaryHTML = '';
    let hasSelections = false;

    for (const colorId in currentSelections) {
        const colorSizes = currentSelections[colorId];
        const colorData = availableColors.find(c => c.id == colorId);

        if (!colorData || Object.keys(colorSizes).length === 0) continue;

        hasSelections = true;
        const sizeList = Object.keys(colorSizes).map(size => {
            const item = colorSizes[size];
            const itemTotal = item.unitPrice * item.quantity;
            return `${size} (${item.quantity} × ${item.unitPrice.toLocaleString('en-IN')}) = ${itemTotal.toLocaleString('en-IN')}`;
        }).join('<br>');

        // Extra price indicator
        let extraPriceHtml = '';
        if (colorData.extraPrice > 0) {
            extraPriceHtml = `<span class="extra-price-badge">+${colorData.extraPrice}</span>`;
        }

        summaryHTML += `
                <div class="selection-item" data-color-id="${colorId}">
                    <div class="selection-color">
                        <div class="selection-color-dot" style="background-color: ${colorData.code}"></div>
                        <div class="selection-details">
                            <div>
                                <strong>${colorData.name}</strong>
                                ${extraPriceHtml}
                                <button class="remove-color-btn" data-color-id="${colorId}">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="size-list">${sizeList}</div>
                        </div>
                    </div>
                    <div class="selection-actions">
                        ${Object.keys(colorSizes).map(size => {
            const item = colorSizes[size];
            return `
                                <button class="remove-size-btn" 
                                        data-color-id="${colorId}" 
                                        data-size="${size}">
                                    <i class="fas fa-times"></i> Remove ${size}
                                </button>
                            `;
        }).join('')}
                    </div>
                </div>
            `;
    }

    if (!hasSelections) {
        summaryHTML = '<p class="no-selection">No selections made. Please select at least one color and size.</p>';
    }

    summaryContainer.innerHTML = summaryHTML;

    // Add event listeners to remove buttons
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
    // Remove from selections
    delete currentSelections[colorId];

    // Update color option UI
    const colorOption = document.querySelector(`.color-option[data-color-id="${colorId}"]`);
    if (colorOption) {
        colorOption.classList.remove('selected');
    }

    // Remove size group
    const sizeGroup = document.querySelector(`.color-size-group[data-color-id="${colorId}"]`);
    if (sizeGroup) {
        sizeGroup.remove();
    }

    // Update UI
    updateEditSelectionSummary();
    updateEditTotalPrice();
}

// Remove specific size in edit mode
function removeEditSize(colorId, size) {
    if (currentSelections[colorId] && currentSelections[colorId][size]) {
        delete currentSelections[colorId][size];

        // Update size option UI
        const sizeOption = document.querySelector(
            `.color-size-group[data-color-id="${colorId}"] .size-option[data-size="${size}"]`
        );
        if (sizeOption) {
            sizeOption.classList.remove('selected');

            // Remove quantity input
            const quantityDiv = sizeOption.nextElementSibling;
            if (quantityDiv && quantityDiv.classList.contains('size-quantity')) {
                quantityDiv.remove();
            }
        }

        // If no more sizes for this color, remove the color too
        if (Object.keys(currentSelections[colorId]).length === 0) {
            removeEditColor(colorId);
        }

        updateEditSelectionSummary();
        updateEditTotalPrice();
    }
}

// Update total price in edit mode
function updateEditTotalPrice() {
    let total = 0;

    for (const colorId in currentSelections) {
        const colorSizes = currentSelections[colorId];
        const colorData = availableColors.find(c => c.id == colorId);
        const extraPrice = colorData ? (colorData.extraPrice || 0) : 0;

        Object.keys(colorSizes).forEach(size => {
            const item = colorSizes[size];
            total += item.unitPrice * item.quantity;
        });
    }

    document.getElementById('editTotalPrice').textContent = `₹${total.toLocaleString('en-IN')}`;
}

// Update cart
function updateCart() {
    if (!currentEditProduct) return;

    // Prepare update data
    const updateData = {
        productId: currentEditProduct.id,
        selections: []
    };

    for (const colorId in currentSelections) {
        const colorSizes = currentSelections[colorId];
        const colorData = availableColors.find(c => c.id == colorId);
        const extraPrice = colorData ? (colorData.extraPrice || 0) : 0;

        const sizes = Object.keys(colorSizes).map(size => ({
            size: size,
            quantity: colorSizes[size].quantity,
            unitPrice: currentEditProduct.price + extraPrice
        }));

        if (sizes.length > 0) {
            updateData.selections.push({
                colorId: colorId,
                sizes: sizes
            });
        }
    }

    // Send update request
    $.ajax({
        url: '/Cart/UpdateCartItem',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(updateData),
        success: function (response) {
            if (response.success) {
                alert('Cart updated successfully!');
                location.reload(); // Reload page to show updated cart
            } else {
                alert('Error updating cart: ' + response.message);
            }
        },
        error: function () {
            alert('Error updating cart. Please try again.');
        }
    });
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editCartModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentEditProduct = null;
    currentSelections = {};
}

// Initialize modal events
document.addEventListener('DOMContentLoaded', function () {
    // Close modal events
    document.querySelector('.close-edit-modal').addEventListener('click', closeEditModal);
    document.querySelector('#editCartModal .modal-overlay').addEventListener('click', closeEditModal);
    document.querySelector('#editCartModal .btn-continue').addEventListener('click', closeEditModal);

    // Update cart button
    document.getElementById('updateCartBtn').addEventListener('click', updateCart);

    // Escape key to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeEditModal();
        }
    });
});
