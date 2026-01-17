// Modal State Management
let currentProduct = null;
let selectedColors = [];
let selectedSizes = {};
let basePrice = 0;
let discountType = null;
let discountValue = 0;
let originalPrice = 0;
// Helper function to calculate discounted price
// Helper function to calculate discounted price
function calculateDiscountedPrice(originalPrice, discountType, discountValue) {
    if (discountValue === 0) {
        return originalPrice;
    }

    let discountedPrice = originalPrice;

    // DiscountType enum: 0 = Percentage, 1 = Fixed (C# enum के according)
    if (discountType === 0) { // Percentage discount
        discountedPrice = originalPrice - (originalPrice * discountValue / 100);
    } else if (discountType === 1) { // Fixed discount
        discountedPrice = originalPrice - discountValue;
    }

    // Ensure price doesn't go below 0
    return Math.max(discountedPrice, 0);
}


// Initialize modal functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('Modal script loaded');

    // Set up event listeners for Add to Cart buttons
    document.addEventListener('click', function (e) {
        if (e.target.closest('.cart-btn')) {
            e.preventDefault();
            const cartBtn = e.target.closest('.cart-btn');
            const productId = cartBtn.getAttribute('data-product-id');

            // Check if we're on detail page or collection page
            const isDetailPage = document.querySelector('.product-detail-container');

            console.log('Cart button clicked, Product ID:', productId);
            console.log('Is detail page:', isDetailPage);

            if (isDetailPage) {
                // Detail page
                const productData = getDetailProductData(productId);
                console.log('Detail page product data:', productData);
                openAddToCartModal(productData);
            } else {
                // Collection page
                const productCard = cartBtn.closest('.collection-item');
                const productData = getProductData(productCard, productId);
                console.log('Collection page product data:', productData);
                openAddToCartModal(productData);
            }
        }
    });

    // Close modal when clicking X or overlay
    const closeModalBtn = document.querySelector('.close-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const continueBtn = document.querySelector('.btn-continue');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    if (continueBtn) {
        continueBtn.addEventListener('click', closeModal);
    }

    // Add to Cart button in modal
    const addToCartBtn = document.getElementById('addToCartConfirm');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Function to extract product data from the card
// Function to extract product data from the card
function getProductData(productCard, productId) {
    const productName = productCard.querySelector('h3').textContent;

    // Get data from attributes
    let originalPriceFromAttr = parseFloat(productCard.getAttribute('data-original-price')) || 0;
    let discountTypeAttr = parseInt(productCard.getAttribute('data-discount-type'));
    let discountValueAttr = parseFloat(productCard.getAttribute('data-discount-value')) || 0;

    // Check if discount exists (discountType 0 = Percentage, 1 = Fixed)
    let finalPrice = originalPriceFromAttr;
    if (discountTypeAttr === 0 || discountTypeAttr === 1) {
        finalPrice = calculateDiscountedPrice(originalPriceFromAttr, discountTypeAttr, discountValueAttr);
    }

    console.log('Product data extracted:', {
        originalPrice: originalPriceFromAttr,
        discountType: discountTypeAttr,
        discountValue: discountValueAttr,
        finalPrice: finalPrice
    });

    const imageUrl = productCard.querySelector('.collection-img')
        .style.backgroundImage.replace('url("', '').replace('")', '');

    const colorElements = productCard.querySelectorAll('.color-dot');
    const colors = [];

    colorElements.forEach((colorDot, index) => {
        const colorId = colorDot.dataset.colorId;
        const colorName = colorDot.getAttribute('title');
        const colorCode = colorDot.style.backgroundColor;
        const extraPrice = parseFloat(colorDot.dataset.colorPrice) || 0;
        const stock = parseInt(colorDot.dataset.stock) || 0;

        const sizesString = colorDot.dataset.colorSizes;
        const availableSizes = sizesString
            ? sizesString.split(',').map(s => s.trim())
            : [];

        colors.push({
            id: colorId,
            name: colorName,
            code: colorCode,
            extraPrice: extraPrice,
            stock: stock,
            sizes: availableSizes
        });
    });

    return {
        id: productId,
        name: productName,
        price: finalPrice, // Discounted price
        originalPrice: originalPriceFromAttr,
        discountType: discountTypeAttr,
        discountValue: discountValueAttr,
        image: imageUrl,
        colors: colors
    };
}

// Function to extract product data from Detail page
function getDetailProductData(productId) {
    const productName = document.querySelector('.product-title h1').textContent;

    // Get price from detail page
    const priceElement = document.querySelector('.current-price');
    let priceText = priceElement ? priceElement.textContent : '';

    // Try to get original price if there's a strike-through price
    const originalPriceElement = document.querySelector('.original-price');
    let originalPrice = 0;
    let discountType = null;
    let discountValue = 0;

    if (originalPriceElement) {
        // If there's an original price with strike-through
        const originalPriceMatch = originalPriceElement.textContent.match(/(\d+(,\d+)*(\.\d+)?)/);
        if (originalPriceMatch) {
            originalPrice = parseFloat(originalPriceMatch[1].replace(/,/g, ''));
        }

        // Get current (discounted) price
        const currentPriceMatch = priceText.match(/(\d+(,\d+)*(\.\d+)?)/);
        if (currentPriceMatch) {
            const discountedPrice = parseFloat(currentPriceMatch[1].replace(/,/g, ''));

            // Calculate discount value
            if (originalPrice > 0 && discountedPrice < originalPrice) {
                // Check if it's percentage or fixed discount
                const discountAmount = originalPrice - discountedPrice;
                const discountPercentage = (discountAmount / originalPrice) * 100;

                // Assuming fixed discount for simplicity
                discountType = 2; // Fixed discount
                discountValue = discountAmount;
            }
        }
    } else {
        // No discount, use regular price
        const priceMatch = priceText.match(/(\d+(,\d+)*(\.\d+)?)/);
        originalPrice = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
    }

    // Calculate final price
    const finalPrice = calculateDiscountedPrice(originalPrice, discountType, discountValue);

    const imageUrl = document.getElementById('mainImage').src;

    const colorElements = document.querySelectorAll('.color-selection .color-option');
    const colors = [];

    console.log('Found color elements:', colorElements.length);

    colorElements.forEach((colorOption, index) => {
        const colorId = colorOption.dataset.colorId;
        const colorName = colorOption.getAttribute('data-color-name');
        const colorCode = colorOption.style.backgroundColor;
        const extraPrice = parseFloat(colorOption.dataset.colorPrice) || 0;
        const stock = parseInt(colorOption.dataset.stock) || 0;

        const sizesString = colorOption.dataset.sizes;
        const availableSizes = sizesString
            ? sizesString.split(',').map(s => s.trim())
            : [];

        colors.push({
            id: colorId,
            name: colorName,
            code: colorCode,
            extraPrice: extraPrice,
            stock: stock,
            sizes: availableSizes,
        });

        console.log(`Color ${index}:`, {
            id: colorId,
            name: colorName,
            extraPrice: extraPrice,
            stock: stock,
            sizes: availableSizes
        });
    });

    return {
        id: productId,
        name: productName,
        price: finalPrice,
        originalPrice: originalPrice,
        discountType: discountType,
        discountValue: discountValue,
        image: imageUrl,
        colors: colors
    };
}

// Open the Add to Cart modal
// Open the Add to Cart modal
function openAddToCartModal(productData) {
    console.log('Opening modal with product data:', productData);

    // Reset all state first
    resetModalState();

    currentProduct = productData;
    selectedColors = [];
    selectedSizes = {};

    // Discount के according base price calculate करें
    basePrice = calculateDiscountedPrice(
        productData.originalPrice,
        productData.discountType,
        productData.discountValue
    );

    discountType = productData.discountType;
    discountValue = productData.discountValue;
    originalPrice = productData.originalPrice;

    // Update modal content
    document.getElementById('modalProductName').textContent = `Customize: ${productData.name}`;
    document.getElementById('modalProductTitle').textContent = productData.name;

    // Update price display with discount if applicable
    updatePriceDisplay();

    document.getElementById('modalProductImage').style.backgroundImage = `url('${productData.image}')`;

    // Populate color options
    populateColorOptions(productData.colors);

    // Reset size selection and summary
    document.getElementById('sizeSelection').style.display = 'none';
    document.getElementById('sizeContainer').innerHTML = '';
    document.getElementById('selectionSummary').innerHTML = '<p class="no-selection">No colors selected yet. Please select at least one color to proceed.</p>';
    document.getElementById('modalTotalPrice').textContent = '₹0';
    document.getElementById('addToCartConfirm').disabled = true;

    // Show modal
    document.getElementById('addToCartModal').style.display = 'block';
    document.body.style.overflow = 'hidden';

    console.log('Modal opened successfully');
}

// Update price display with discount information
// Update price display with discount information
function updatePriceDisplay() {
    const priceElement = document.getElementById('modalProductPrice');

    console.log('Price display check:', {
        discountType: discountType,
        discountValue: discountValue,
        originalPrice: originalPrice,
        basePrice: basePrice
    });

    // Check if discount exists (discountType 0 = Percentage, 1 = Fixed)
    if (discountType === 0 || discountType === 1) {
        if (discountValue > 0 && originalPrice > basePrice) {
            // Show both original and discounted price
            priceElement.innerHTML = `
                <span style="text-decoration: line-through; color: #999; margin-right: 8px;">
                    ₹${originalPrice.toLocaleString('en-IN')}
                </span>
                <span style="color: #e53935; font-weight: bold;">
                    ₹${basePrice.toLocaleString('en-IN')}
                </span>
                <div style="font-size: 12px; color: #4CAF50; margin-top: 4px;">
                    ${discountType === 0 ?
                    `${discountValue}% off` :
                    `₹${discountValue.toLocaleString('en-IN')} off`
                }
                </div>
            `;
        } else {
            // No valid discount, show regular price
            priceElement.textContent = `₹${basePrice.toLocaleString('en-IN')}`;
        }
    } else {
        // No discount, show regular price only
        priceElement.textContent = `₹${basePrice.toLocaleString('en-IN')}`;
    }
}

// Reset all modal state
function resetModalState() {
    console.log('Resetting modal state');

    // Reset all selected colors in modal
    const modalColorOptions = document.querySelectorAll('#modalColorOptions .color-option.selected');
    modalColorOptions.forEach(option => {
        option.classList.remove('selected');
    });

    // Clear size container
    const sizeContainer = document.getElementById('sizeContainer');
    if (sizeContainer) {
        sizeContainer.innerHTML = '';
    }

    // Reset summary
    const summaryContainer = document.getElementById('selectionSummary');
    if (summaryContainer) {
        summaryContainer.innerHTML = '<p class="no-selection">No colors selected yet. Please select at least one color to proceed.</p>';
    }

    // Reset global state
    currentProduct = null;
    selectedColors = [];
    selectedSizes = {};
    basePrice = 0;
    discountType = null;
    discountValue = 0;
    originalPrice = 0;
}

// Populate color options in the modal
// Populate color options in the modal
function populateColorOptions(colors) {
    const colorOptionsContainer = document.getElementById('modalColorOptions');

    if (!colorOptionsContainer) {
        console.error('modalColorOptions container not found!');
        return;
    }

    console.log('Populating color options, total colors:', colors.length);

    // Clear the container COMPLETELY
    colorOptionsContainer.innerHTML = '';

    if (colors.length === 0) {
        colorOptionsContainer.innerHTML = '<p>No colors available</p>';
        return;
    }

    colors.forEach((color, index) => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.dataset.colorId = color.id;
        colorOption.dataset.colorName = color.name;
        colorOption.dataset.extraPrice = color.extraPrice || 0;
        colorOption.dataset.stock = color.stock || 0;
        colorOption.dataset.index = index;

        // Check if color is out of stock
        const isOutOfStock = color.stock <= 0;

        if (isOutOfStock) {
            colorOption.classList.add('out-of-stock');
        }

        // Calculate final price for this color (base price + extra price)
        const colorFinalPrice = basePrice + (color.extraPrice || 0);

        // Extra price display text
        let extraPriceText = '';
        if (color.extraPrice > 0) {
            extraPriceText = ` (+₹${color.extraPrice.toLocaleString('en-IN')})`;
        }

        // Stock display text
        let stockText = '';
        if (color.stock <= 0) {
            stockText = 'Out of Stock';
        } else if (color.stock <= 10) {
            stockText = `Only ${color.stock} left`;
        } else {
            stockText = 'Available';
        }

        colorOption.innerHTML = `
            <div class="color-dot-large" style="background-color: ${color.code}"></div>
            <div class="color-info">
                <div class="color-name">${color.name}${extraPriceText}</div>
                <div class="color-price">
                    ₹${colorFinalPrice.toLocaleString('en-IN')}
                </div>
                <div class="color-stock ${isOutOfStock ? 'stock-out' : ''}">${stockText}</div>
            </div>
        `;

        // Add click event only if color is in stock
        if (!isOutOfStock) {
            colorOption.addEventListener('click', (function (colorData, extraPriceValue, stockValue) {
                return function () {
                    const colorId = this.dataset.colorId;
                    const colorName = this.dataset.colorName;

                    console.log('Color clicked:', colorId, colorName);

                    // Toggle selection
                    if (this.classList.contains('selected')) {
                        this.classList.remove('selected');
                        removeColorSelection(colorId);
                    } else {
                        this.classList.add('selected');
                        addColorSelection(colorId, colorName, colorData, extraPriceValue, stockValue);
                    }
                };
            })(color, color.extraPrice || 0, color.stock || 0));
        }

        colorOptionsContainer.appendChild(colorOption);
    });

    console.log('Color options populated:', colorOptionsContainer.children.length);
}

// Add color selection
function addColorSelection(colorId, colorName, colorData, extraPrice, stock) {
    console.log('Adding color selection:', colorId, colorName, 'Stock:', stock);

    // Check if already selected
    if (selectedColors.find(c => c.id === colorId)) {
        console.log('Color already selected');
        return;
    }

    // Add to selected colors array
    selectedColors.push({
        id: colorId,
        name: colorName,
        code: colorData.code,
        extraPrice: extraPrice || 0,
        stock: stock || 0
    });

    // Initialize sizes for this color
    selectedSizes[colorId] = {};

    // Show size selection section
    document.getElementById('sizeSelection').style.display = 'block';

    // Add size options for this color
    addSizeOptionsForColor(colorId, colorName, colorData.code, colorData.sizes, extraPrice, stock);

    // Update selection summary
    updateSelectionSummary();

    // Enable Add to Cart button if we have selections
    updateAddToCartButton();
}

// Remove color selection
function removeColorSelection(colorId) {
    console.log('Removing color selection:', colorId);

    // Remove from selected colors
    selectedColors = selectedColors.filter(c => c.id !== colorId);

    // Remove from selected sizes
    delete selectedSizes[colorId];

    // Remove size options for this color
    const sizeGroup = document.querySelector(`.color-size-group[data-color-id="${colorId}"]`);
    if (sizeGroup) {
        sizeGroup.remove();
    }

    // Hide size selection if no colors selected
    if (selectedColors.length === 0) {
        document.getElementById('sizeSelection').style.display = 'none';
    }

    // Update selection summary
    updateSelectionSummary();

    // Update Add to Cart button state
    updateAddToCartButton();
}

// Add size options for a specific color
function addSizeOptionsForColor(colorId, colorName, colorCode, sizes, extraPrice, stock) {
    const sizeContainer = document.getElementById('sizeContainer');

    // Check if size group already exists
    if (document.querySelector(`.color-size-group[data-color-id="${colorId}"]`)) {
        console.log('Size group already exists for color:', colorId);
        return;
    }

    console.log('Adding size options for color:', colorId, sizes, 'Stock:', stock);

    // Extra price display
    let extraPriceHtml = '';
    if (extraPrice > 0) {
        extraPriceHtml = `<span class="extra-price-tag">Rs. +${extraPrice}</span>`;
    }

    // Stock display
    let stockHtml = '';
    if (stock <= 0) {
        stockHtml = `<span class="stock-badge out-of-stock-badge">Out of Stock</span>`;
    } else if (stock <= 10) {
        stockHtml = `<span class="stock-badge low-stock-badge">Only ${stock} left</span>`;
    }

    const sizeGroup = document.createElement('div');
    sizeGroup.className = 'color-size-group';
    sizeGroup.dataset.colorId = colorId;
    sizeGroup.dataset.extraPrice = extraPrice || 0;
    sizeGroup.dataset.stock = stock || 0;

    sizeGroup.innerHTML = `
        <div class="color-size-header">
            <div class="color-indicator" style="background-color: ${colorCode}"></div>
            <div>
                <span><h4>${colorName}</h4> (Max Stock: ${stock}) </span>
                ${extraPriceHtml}
                ${stockHtml}
            </div>
        </div>
        <div class="size-options">
            ${sizes.map(size => `
                <div class="size-option" data-size="${size}" data-color-id="${colorId}">
                    ${size}
                </div>
            `).join('')}
        </div>
    `;

    // Add event listeners to size options
    const sizeOptions = sizeGroup.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function () {
            const size = this.dataset.size;
            const colorId = this.dataset.colorId;
            toggleSizeSelection(colorId, size, this);
        });
    });

    sizeContainer.appendChild(sizeGroup);
}

// Get total quantity selected for a color
function getTotalQuantityForColor(colorId) {
    const colorSizes = selectedSizes[colorId] || {};
    let total = 0;
    Object.keys(colorSizes).forEach(size => {
        total += colorSizes[size];
    });
    return total;
}

// Get remaining stock for a color
function getRemainingStockForColor(colorId) {
    const color = selectedColors.find(c => c.id === colorId);
    if (!color) return 0;

    const totalSelected = getTotalQuantityForColor(colorId);
    return Math.max(0, color.stock - totalSelected);
}

// Toggle size selection for a color
function toggleSizeSelection(colorId, size, element) {
    console.log('Toggling size selection:', colorId, size);

    const color = selectedColors.find(c => c.id === colorId);
    if (!color) return;

    // Check remaining stock
    const remainingStock = getRemainingStockForColor(colorId);

    if (selectedSizes[colorId][size]) {
        // Deselect size
        delete selectedSizes[colorId][size];
        element.classList.remove('selected');

        // Remove quantity input
        const quantityDiv = element.nextElementSibling;
        if (quantityDiv && quantityDiv.classList.contains('size-quantity')) {
            quantityDiv.remove();
        }
    } else {
        // Check if we can add this size (stock available)
        if (remainingStock <= 0) {
            alert(`Cannot add size ${size}. Only ${color.stock} units available for ${color.name} color.`);
            return;
        }

        // Select size with default quantity 1
        selectedSizes[colorId][size] = 1;
        element.classList.add('selected');

        // Add quantity input
        addQuantityInput(colorId, size, element);
    }

    // Update selection summary and total
    updateSelectionSummary();
    updateTotalPrice();
    updateAddToCartButton();

    // Update all quantity inputs max values for this color
    updateAllQuantityInputsForColor(colorId);
}

// Update all quantity inputs max values for a specific color
function updateAllQuantityInputsForColor(colorId) {
    const remainingStock = getRemainingStockForColor(colorId);

    // Update all quantity inputs for this color
    const quantityInputs = document.querySelectorAll(`.size-quantity-input[data-color-id="${colorId}"]`);

    quantityInputs.forEach(input => {
        const currentValue = parseInt(input.value) || 1;
        const size = input.dataset.size;

        // Calculate max for this specific size input
        // Max = current value + remaining stock
        const maxValue = currentValue + remainingStock;
        input.max = maxValue;

        // If current value exceeds max, adjust it
        if (currentValue > maxValue) {
            input.value = maxValue;
            selectedSizes[colorId][size] = maxValue;
        }
    });
}

// Add quantity input for a selected size
function addQuantityInput(colorId, size, sizeElement) {
    // Check if quantity input already exists
    if (sizeElement.nextElementSibling &&
        sizeElement.nextElementSibling.classList.contains('size-quantity')) {
        return;
    }

    const color = selectedColors.find(c => c.id === colorId);
    const remainingStock = getRemainingStockForColor(colorId);

    // Set initial max value
    const initialMax = Math.min(10, 1 + remainingStock);

    const quantityDiv = document.createElement('div');
    quantityDiv.className = 'size-quantity';
    quantityDiv.innerHTML = `
        <label>Quantity:</label>
        <input type="number" class="size-quantity-input" 
               value="1" min="1" max="${initialMax}"
               data-color-id="${colorId}" data-size="${size}">
        <span class="max-quantity-hint"></span>
    `;

    // Add event listener to quantity input
    const quantityInput = quantityDiv.querySelector('.size-quantity-input');
    const maxHint = quantityDiv.querySelector('.max-quantity-hint');

    quantityInput.addEventListener('input', function () {
        const colorId = this.dataset.colorId;
        const size = this.dataset.size;
        let quantity = parseInt(this.value) || 1;

        // Get current remaining stock
        const currentRemainingStock = getRemainingStockForColor(colorId);
        const currentValue = selectedSizes[colorId][size] || 0;

        // Calculate total if we change to new quantity
        const totalWithoutThisSize = getTotalQuantityForColor(colorId) - currentValue;
        const potentialTotal = totalWithoutThisSize + quantity;

        // Check if exceeds stock
        const color = selectedColors.find(c => c.id === colorId);
        if (potentialTotal > color.stock) {
            // Adjust to maximum possible
            quantity = Math.max(1, color.stock - totalWithoutThisSize);
            this.value = quantity;
        }

        // Ensure quantity is within limits
        if (quantity < 1) this.value = 1;

        // Update max value
        const newRemainingStock = getRemainingStockForColor(colorId);
        const newMax = quantity + newRemainingStock;
        this.max = newMax;

        selectedSizes[colorId][size] = quantity;

        // Update all quantity inputs for this color
        updateAllQuantityInputsForColor(colorId);

        // Update summary and total
        updateSelectionSummary();
        updateTotalPrice();
        updateAddToCartButton();
    });

    // Insert after the size element
    sizeElement.parentNode.insertBefore(quantityDiv, sizeElement.nextSibling);
}

// Update selection summary
// Update selection summary
function updateSelectionSummary() {
    const summaryContainer = document.getElementById('selectionSummary');

    if (selectedColors.length === 0) {
        summaryContainer.innerHTML = '<p class="no-selection">No colors selected yet. Please select at least one color to proceed.</p>';
        return;
    }

    let summaryHTML = '';
    let hasSelections = false;

    selectedColors.forEach(color => {
        const colorSizes = selectedSizes[color.id];
        const selectedSizeKeys = Object.keys(colorSizes);
        const colorExtraPrice = color.extraPrice || 0;

        // Calculate total quantity for this color
        const totalQuantityForColor = getTotalQuantityForColor(color.id);
        const remainingStock = Math.max(0, color.stock - totalQuantityForColor);

        if (selectedSizeKeys.length > 0) {
            hasSelections = true;

            // Calculate item price: discounted base price + extra price
            const itemPrice = basePrice + colorExtraPrice;

            // Show original and discounted price if discount exists
            let priceDisplay = '';

            // Show discount if applicable
            if (discountType !== null && discountValue > 0 && originalPrice > basePrice) {
                const originalItemPrice = originalPrice + colorExtraPrice;
                priceDisplay = `
                    <span style="text-decoration: line-through; color: #999; margin-right: 4px;">
                        ₹${originalItemPrice.toLocaleString('en-IN')}
                    </span>
                    ₹${itemPrice.toLocaleString('en-IN')}
                `;
            } else {
                priceDisplay = `₹${itemPrice.toLocaleString('en-IN')}`;
            }

            const sizeList = selectedSizeKeys.map(size => {
                const quantity = colorSizes[size];
                const itemTotal = itemPrice * quantity;
                return `${size} (${quantity} × <span style="display: inline-block;">${priceDisplay}</span>) = ₹${itemTotal.toLocaleString('en-IN')}`;
            }).join('<br>');

            // Extra price indicator
            let extraPriceHtml = '';
            if (colorExtraPrice > 0) {
                extraPriceHtml = `<span class="extra-price-badge">+₹${colorExtraPrice}</span>`;
            }

            // Stock indicator
            let stockHtml = '';
            if (remainingStock <= 0) {
                stockHtml = `<span class="stock-warning">No more available</span>`;
            } else if (remainingStock <= 5) {
                stockHtml = `<span class="stock-warning">Only ${remainingStock} left</span>`;
            }

            summaryHTML += `
                <div class="selection-item" data-color-id="${color.id}">
                    <div class="selection-color">
                        <div class="selection-color-dot" style="background-color: ${color.code}"></div>
                        <div class="selection-details">
                            <div>
                                <strong>${color.name}</strong>
                                ${extraPriceHtml}
                                ${stockHtml}
                            </div>
                            <div class="size-list">${sizeList}</div>
                            <div class="color-total">
                                Total for ${color.name}: ₹${(itemPrice * totalQuantityForColor).toLocaleString('en-IN')} (${totalQuantityForColor} units)
                            </div>
                        </div>
                    </div>
                    <div class="selection-quantity">
                        <button class="remove-selection" data-color-id="${color.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    });

    if (!hasSelections) {
        summaryHTML = '<p class="no-selection">Colors selected but no sizes chosen. Please select sizes for each color.</p>';
    }

    summaryContainer.innerHTML = summaryHTML;

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-selection').forEach(button => {
        button.addEventListener('click', function () {
            const colorId = this.dataset.colorId;
            removeColorSelection(colorId);

            const colorOption = document.querySelector(`.color-option[data-color-id="${colorId}"]`);
            if (colorOption) {
                colorOption.classList.remove('selected');
            }
        });
    });
}

// Update total price
function updateTotalPrice() {
    let total = 0;

    // Calculate total based on selections
    selectedColors.forEach(color => {
        const colorSizes = selectedSizes[color.id];
        const colorExtraPrice = color.extraPrice || 0;

        // Calculate item price: discounted base price + extra price (no discount on extra price)
        const itemBasePrice = basePrice + colorExtraPrice;

        Object.keys(colorSizes).forEach(size => {
            const quantity = colorSizes[size];
            total += itemBasePrice * quantity;
        });
    });

    // Update display
    document.getElementById('modalTotalPrice').textContent = `₹${total.toLocaleString('en-IN')}`;
}

// Update Add to Cart button state
function updateAddToCartButton() {
    const addToCartBtn = document.getElementById('addToCartConfirm');
    let hasSelections = false;

    // Check if we have at least one color with at least one size selected
    for (const colorId in selectedSizes) {
        if (Object.keys(selectedSizes[colorId]).length > 0) {
            hasSelections = true;
            break;
        }
    }

    addToCartBtn.disabled = !hasSelections;
}

// Add to Cart function
// Add to Cart function
// Add to Cart function
function addToCart() {
    if (!currentProduct) {
        console.error('No current product!');
        return;
    }

    // Check stock for each color
    let hasStockIssue = false;
    selectedColors.forEach(color => {
        const totalQuantity = getTotalQuantityForColor(color.id);
        if (totalQuantity > color.stock) {
            hasStockIssue = true;
            alert(`Cannot add ${color.name} - requested ${totalQuantity} but only ${color.stock} available.`);
        }
    });

    if (hasStockIssue) {
        return;
    }

    // Prepare cart data including discount information
    const cartData = {
        productId: currentProduct.id,
        productName: currentProduct.name,
        originalPrice: originalPrice,
        discountType: discountType,
        discountValue: discountValue,
        basePrice: basePrice, // This is the discounted base price
        selections: []
    };

    // Build selections array
    selectedColors.forEach(color => {
        const colorSizes = selectedSizes[color.id];
        const colorExtraPrice = color.extraPrice || 0;

        // Calculate price per item: discounted base price + extra price (no discount on extra price)
        const pricePerItem = basePrice + colorExtraPrice;

        const sizes = Object.keys(colorSizes).map(size => ({
            size: size,
            quantity: colorSizes[size],
            pricePerItem: pricePerItem
        }));

        if (sizes.length > 0) {
            cartData.selections.push({
                colorId: color.id,
                colorName: color.name,
                colorCode: color.code,
                extraPrice: colorExtraPrice,
                sizes: sizes
            });
        }
    });

    if (cartData.selections.length === 0) {
        alert('Please select at least one color and size');
        return;
    }

    console.log('Sending cart data:', cartData);

    $.ajax({
        url: '/Cart/Index',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(cartData),
        success: function (res) {
            console.log('AJAX response:', res);
            if (res.success) {
                showToast('Added to cart successfully!', 'success')

                // Update cart count
                let countElement = document.getElementById('count-text');
                if (countElement) {
                    let count = parseInt(countElement.textContent) || 0;
                    countElement.textContent = count + 1;
                }

                let productId = currentProduct.id;

                // Hide Add to Cart button and show View Cart button
                const cartBtn = document.querySelector('.cart-btn[data-product-id="' + productId + '"]');
                const viewCartBtn = document.querySelector('.view-cart[data-product-id="' + productId + '"]');

                if (cartBtn) cartBtn.style.display = 'none';
                if (viewCartBtn) viewCartBtn.style.display = 'block';

                // Close modal
                closeModal();

            } else {
                console.log("response else" + res)
                showToast('Please login first!', 'error')
                setTimeout(() => {
                    window.location.href = '/Account/Login'
                }, 1500)
            }
        },
        error: function (err) {
            console.error('AJAX error:', err);
            alert('Error while adding to cart');
        }
    });
}

// Close modal
function closeModal() {
    console.log('Closing modal');

    const modal = document.getElementById('addToCartModal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';

    // Reset all modal state
    resetModalState();
}