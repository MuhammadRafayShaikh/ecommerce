// State variables
let selectedColors = [];
let colorSectionsData = {};
let generalImages = [];
let originalProductData = null;
let colorsFromDb = []; // Array to store colors that came from database

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const loadingState = document.getElementById('loadingState');
const editProductContainer = document.getElementById('editProductContainer');
const editProductForm = document.getElementById('editProductForm');
const colorSectionsContainer = document.getElementById('colorSectionsContainer');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imageUploadInput = document.getElementById('imageUploadInput');
const previewSection = document.getElementById('previewSection');
const previewContent = document.getElementById('previewContent');
const productNameTitle = document.getElementById('productNameTitle');
const productSkuTitle = document.getElementById('productSkuTitle');
const productIdTitle = document.getElementById('productIdTitle');

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    // Get colors from database
    const dbColorsInput = document.getElementById('dbColors');
    if (dbColorsInput && dbColorsInput.value) {
        colorsFromDb = JSON.parse(dbColorsInput.value);
    }

    // Toggle sidebar for mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            if (sidebar) sidebar.classList.toggle('active');
        });
    }

    // Color selection - create color sections
    document.querySelectorAll('#colorSelection .selection-item').forEach(item => {
        item.addEventListener('click', function () {
            const color = this.getAttribute('data-value');
            const colorCode = this.getAttribute('data-color');
            toggleColorSection(color, colorCode);
        });
    });

    // Load product data
    loadProductData();
});

// Load product data into form
function loadProductData() {

    if (colorsFromDb && colorsFromDb.length > 0) {

        colorsFromDb.forEach(colorName => {

            const colorItem = document.querySelector(
                `#colorSelection .selection-item[data-value="${colorName}"]`
            );

            if (colorItem) {
                colorItem.classList.add('active');
                selectedColors.push(colorName);

                const colorData = productColorsFromDb.find(
                    c => c.colorName === colorName
                );

                if (colorData) {
                    colorSectionsData[colorName] = {
                        stock: colorData.stock || 0,
                        extraPrice: colorData.extraPrice || 0,
                        colorCode: colorData.colorCode,
                        sizes: colorData.sizes || ['M'],
                        images: colorData.images
                            ? colorData.images.map(img => `/ProductImages/${img.imagePath}`)
                            : new Array(6).fill(null)
                    };

                    createColorSection(colorName, colorData.colorCode, colorData);
                }
            }
        });
    }

    loadingState.style.display = 'none';
    editProductContainer.style.display = 'block';
}


// Custom confirmation modal
function showConfirmationModal(message, onConfirm, onCancel = null) {
    // Remove existing modal if any
    const existingModal = document.getElementById('customConfirmationModal');
    if (existingModal) existingModal.remove();

    // Create modal HTML
    const modalHTML = `
        <div id="customConfirmationModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        ">
            <div style="
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideUp 0.4s ease;
            ">
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="
                        width: 70px;
                        height: 70px;
                        background: linear-gradient(135deg, var(--warning) 0%, #ff9800 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 20px;
                        color: white;
                        font-size: 30px;
                    ">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 style="color: var(--dark); margin-bottom: 10px; font-size: 22px;">Confirm Action</h3>
                    <p style="color: #666; line-height: 1.6;">${message}</p>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="confirmCancelBtn" style="
                        padding: 12px 30px;
                        background: #f5f5f5;
                        border: none;
                        border-radius: 10px;
                        color: #666;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                        flex: 1;
                    " onmouseover="this.style.background='#e0e0e0'" onmouseout="this.style.background='#f5f5f5'">
                        Cancel
                    </button>
                    <button id="confirmOkBtn" style="
                        padding: 12px 30px;
                        background: linear-gradient(135deg, var(--danger) 0%, #d32f2f 100%);
                        border: none;
                        border-radius: 10px;
                        color: white;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                        flex: 1;
                    " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add to document
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add animations to style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Get modal elements
    const modal = document.getElementById('customConfirmationModal');
    const confirmBtn = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');

    // Set up event listeners
    confirmBtn.addEventListener('click', function () {
        if (modal) modal.remove();
        if (style) style.remove();
        if (onConfirm) onConfirm();
    });

    cancelBtn.addEventListener('click', function () {
        if (modal) modal.remove();
        if (style) style.remove();
        if (onCancel) onCancel();
    });

    // Close on outside click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            if (modal) modal.remove();
            if (style) style.remove();
            if (onCancel) onCancel();
        }
    });
}

// Toggle color section
function toggleColorSection(color, colorCode) {
    const colorItem = document.querySelector(`#colorSelection .selection-item[data-value="${color}"]`);

    if (selectedColors.includes(color)) {
        // We are trying to remove a color
        // Check if this color came from database
        if (colorsFromDb.includes(color)) {
            // Show confirmation modal for database colors
            showConfirmationModal(
                `The color "${color}" is currently in the database. Removing it will delete this color variant from the product. Are you sure you want to remove it?`,
                function () {
                    // User confirmed - proceed with removal
                    removeColor(color, colorItem);
                },
                function () {
                    // User cancelled - do nothing
                    console.log('User cancelled removal of database color');
                }
            );
        } else {
            // Color was added by user, just remove it
            removeColor(color, colorItem);
        }
    } else {
        // Add color section
        selectedColors.push(color);
        if (colorItem) colorItem.classList.add('active');

        // Create color section
        createColorSection(color, colorCode);
    }
}

// Remove color (helper function)
function removeColor(color, colorItem) {
    // Remove from selected colors
    selectedColors = selectedColors.filter(c => c !== color);

    // Remove from database colors array if it was there
    colorsFromDb = colorsFromDb.filter(c => c !== color);

    // Remove active class
    if (colorItem) colorItem.classList.remove('active');

    // Remove section from DOM
    const section = document.querySelector(`.color-section[data-color="${color}"]`);
    if (section) section.remove();

    // Remove from colorSectionsData
    delete colorSectionsData[color];
}

// Create color section with fields
function createColorSection(color, colorCode, existingData = null) {
    const sectionId = `color-section-${color.toLowerCase().replace(' ', '-')}`;

    // Check if section already exists
    if (document.getElementById(sectionId)) return;

    // Initialize color section data if not exists
    if (!colorSectionsData[color]) {
        colorSectionsData[color] = {
            stock: existingData?.stock || 0,
            extraPrice: existingData?.extraPrice || 0,
            colorCode: colorCode,
            sizes: existingData?.sizes || ['M'],
            images: existingData?.images || new Array(6).fill(null)
        };
    }

    const colorSection = document.createElement('div');
    colorSection.className = 'color-section';
    colorSection.setAttribute('data-color', color);
    colorSection.id = sectionId;

    // Determine if this is a database color
    const isFromDb = colorsFromDb.includes(color);

    colorSection.innerHTML += `
        <div class="color-section-header">
            <div class="color-section-title">
                <div class="color-box" style="background-color: ${colorCode};"></div>
                <span>${color} Variant ${isFromDb ? '<span style="font-size:12px; color:#666;">(From Database)</span>' : ''}</span>
            </div>
            <button type="button" class="remove-color-section" onclick="removeColorSection('${color}', ${isFromDb})">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="stock_${color}">Stock for ${color} <span class="required">*</span></label>
                <input type="number" id="stock_${color}" class="form-control color-stock" data-color="${color}" 
                       value="${colorSectionsData[color].stock}" placeholder="e.g., 50" min="0" required>
            </div>
            <div class="form-group">
                <label for="extraPrice_${color}">Extra Price for ${color} (₹)</label>
                <input type="number" id="extraPrice_${color}" class="form-control color-extra-price" data-color="${color}" 
                       value="${colorSectionsData[color].extraPrice}" placeholder="e.g., 500" min="0" step="0.01">
            </div>
        </div>
        
        <div class="form-group">
            <label>Available Sizes for ${color}</label>
            <div class="selection-container color-sizes" data-color="${color}" id="sizes_${color}">
                <div class="selection-item" data-value="S">S</div>
                <div class="selection-item" data-value="M">M</div>
                <div class="selection-item" data-value="L">L</div>
                <div class="selection-item" data-value="XL">XL</div>
                <div class="selection-item" data-value="XXL">XXL</div>
            </div>
            <input type="hidden" id="selectedSizes_${color}" class="selected-sizes" data-color="${color}" 
                   value="${colorSectionsData[color].sizes.join(',')}">
        </div>
        
        <div class="form-group">
            <label>Images for ${color} (4-6 images recommended)</label>
            <div class="image-upload-section">
                <div class="image-preview-container color-image-preview-container" id="colorImagePreview_${color}" data-color="${color}">
                    ${generateColorImagesPreviewHTML(color)}
                </div>
                <input type="file" class="color-image-upload" data-color="${color}" accept="image/*" multiple 
                       style="display: none;" onchange="handleColorImageUpload(event, '${color}')">
            </div>
        </div>
    `;

    colorSectionsContainer.appendChild(colorSection);

    // Set up event listeners after DOM is ready
    setTimeout(() => {
        // Set active sizes
        const sizesContainer = colorSection.querySelector(`.color-sizes[data-color="${color}"]`);

        if (sizesContainer) {
            sizesContainer.querySelectorAll('.selection-item').forEach(item => {
                const size = item.getAttribute('data-value');
                if (colorSectionsData[color].sizes.includes(size)) {
                    item.classList.add('active');
                }

                item.addEventListener('click', function () {
                    this.classList.toggle('active');
                    updateSelectedSizesForColor(color);
                });
            });
        }

        // Add event listeners for stock and extra price
        const stockInput = document.getElementById(`stock_${color}`);
        const extraPriceInput = document.getElementById(`extraPrice_${color}`);

        if (stockInput) {
            stockInput.addEventListener('input', function () {
                colorSectionsData[color].stock = parseInt(this.value) || 0;
            });
        }

        if (extraPriceInput) {
            extraPriceInput.addEventListener('input', function () {
                colorSectionsData[color].extraPrice = parseFloat(this.value) || 0;
            });
        }

        // Set up remove image buttons
        setupColorImageRemoveButtons(color);
    }, 0);
}

// Generate color images preview HTML
function generateColorImagesPreviewHTML(color) {
    const images = colorSectionsData[color]?.images || [];
    let html = '';

    // Add existing images
    images.forEach((image, index) => {
        if (image) {
            html += `
                <div class="image-preview-item color-image-preview-item">
                    <img src="${image}" alt="${color} Image ${index + 1}">
                    <div class="remove-image" onclick="removeColorImage('${color}', ${index})">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
            `;
        }
    });

    // Add placeholder for new images
    const existingImageCount = images.filter(img => img).length;
    const remainingSlots = 6 - existingImageCount;

    for (let i = 0; i < remainingSlots; i++) {
        html += `
            <div class="image-preview-item color-image-preview-item" onclick="triggerColorImageUpload('${color}')">
                <div class="image-preview-placeholder">
                    <i class="fas fa-plus"></i>
                    <span>Add Image</span>
                </div>
            </div>
        `;
    }

    return html;
}

// Set up color image remove buttons
function setupColorImageRemoveButtons(color) {
    const container = document.getElementById(`colorImagePreview_${color}`);
    if (!container) return;

    container.querySelectorAll('.remove-image').forEach(btn => {
        btn.addEventListener('click', function () {
            const imgIndex = parseInt(this.getAttribute('onclick').match(/\d+/)[0]);
            removeColorImage(color, imgIndex);
        });
    });
}

// Remove color section (called from remove button)
function removeColorSection(color, isFromDb) {
    if (isFromDb) {
        // Show confirmation for database colors
        showConfirmationModal(
            `The color "${color}" is currently in the database. Removing it will delete this color variant from the product. Are you sure you want to remove it?`,
            function () {
                performColorRemoval(color);
            }
        );
    } else {
        // Just remove without confirmation for user-added colors
        performColorRemoval(color);
    }
}

// Perform the actual color removal
function performColorRemoval(color) {
    // Remove from selected colors
    selectedColors = selectedColors.filter(c => c !== color);

    // Remove from database colors array
    colorsFromDb = colorsFromDb.filter(c => c !== color);

    // Remove active class from color selection
    const colorItem = document.querySelector(`#colorSelection .selection-item[data-value="${color}"]`);
    if (colorItem) {
        colorItem.classList.remove('active');
    }

    // Remove section from DOM
    const section = document.querySelector(`.color-section[data-color="${color}"]`);
    if (section) {
        section.remove();
    }

    // Remove from colorSectionsData
    delete colorSectionsData[color];
}

// Update selected sizes for a color
function updateSelectedSizesForColor(color) {
    const sizesContainer = document.querySelector(`.color-sizes[data-color="${color}"]`);
    if (!sizesContainer) return;

    const selectedSizes = [];

    sizesContainer.querySelectorAll('.selection-item.active').forEach(item => {
        selectedSizes.push(item.getAttribute('data-value'));
    });

    colorSectionsData[color].sizes = selectedSizes;
    const hiddenInput = document.getElementById(`selectedSizes_${color}`);
    if (hiddenInput) {
        hiddenInput.value = selectedSizes.join(',');
    }
}

// Handle color image upload
function handleColorImageUpload(event, color) {
    const files = event.target.files;
    if (files.length > 0) {
        // Initialize images array if not exists
        if (!colorSectionsData[color].images) {
            colorSectionsData[color].images = new Array(6).fill(null);
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = function (e) {
                // Find first empty slot and add image
                const emptyIndex = colorSectionsData[color].images.findIndex(img => !img);
                if (emptyIndex !== -1) {
                    colorSectionsData[color].images[emptyIndex] = e.target.result;
                } else {
                    // Add to end if all slots are full
                    colorSectionsData[color].images.push(e.target.result);
                }
                updateColorImagesPreview(color);
            };

            reader.readAsDataURL(file);
        }
    }

    // Reset input
    event.target.value = '';
}

// Update color images preview
function updateColorImagesPreview(color) {
    const container = document.getElementById(`colorImagePreview_${color}`);
    if (!container) return;

    container.innerHTML = generateColorImagesPreviewHTML(color);

    // Set up remove buttons for new images
    setTimeout(() => setupColorImageRemoveButtons(color), 0);
}

// Trigger color image upload
function triggerColorImageUpload(color) {
    const input = document.querySelector(`.color-image-upload[data-color="${color}"]`);
    if (input) {
        input.click();
    }
}

// Remove color image
function removeColorImage(color, index) {
    if (colorSectionsData[color] && colorSectionsData[color].images[index]) {
        colorSectionsData[color].images[index] = null;
        updateColorImagesPreview(color);
    }
}

// Show notification function (you already have this)
function showNotification(message, type) {
    // ... your existing notification code ...
}

// Other functions (goBack, cancelEdit, etc.) remain the same
function goBack() {
    window.history.back();
}

function cancelEdit() {
    if (confirm('Are you sure you want to cancel editing? All unsaved changes will be lost.')) {
        goBack();
    }
}