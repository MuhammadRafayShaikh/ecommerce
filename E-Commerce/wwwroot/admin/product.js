// Products data storage
let products = [

];

let nextProductId = 7;
//let currentImageUploadIndex = 0;
let productImages = new Array(6).fill(null);
let selectedColors = [];
let colorSectionsData = {};
//let productVideos = [];     // stores blob URLs
let currentVideoUploadIndex = 0;
//const MAX_VIDEOS = 2;
//let productVideos = [];     // stores actual File objects
let videoFilesData = [];    // stores base64 encoded video data
//const MAX_VIDEOS = 2;

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const productForm = document.getElementById('productForm');
const videoUploadInput = document.getElementById('videoUploadInput');
const pageTitle = document.getElementById('pageTitle');
const totalProductsElement = document.getElementById('totalProducts');
const allProductsTable = document.getElementById('allProductsTable');
const productsEmptyState = document.getElementById('productsEmptyState');
const productsPagination = document.getElementById('productsPagination');
const totalProductsCount = document.getElementById('totalProductsCount');
const activeProductsCount = document.getElementById('activeProductsCount');
const inStockCount = document.getElementById('inStockCount');
const totalInventoryValue = document.getElementById('totalInventoryValue');
const colorSectionsContainer = document.getElementById('colorSectionsContainer');

// Page management
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page-container').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    document.getElementById(pageName + 'Page').classList.add('active');

    // Update page title
    if (pageName === 'addProduct') {
        pageTitle.textContent = 'Add New Product';
    } else if (pageName === 'viewProducts') {
        pageTitle.textContent = 'View All Products';
        updateProductsTable();
        updateProductStats();
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    if (pageName === 'addProduct') {
        document.querySelectorAll('.nav-link')[2].classList.add('active');
    } else if (pageName === 'viewProducts') {
        document.querySelectorAll('.nav-link')[3].classList.add('active');
    }
}

function collectColorVariantsData() {

    Object.keys(colorSectionsData).forEach(color => {

        // stock
        const stockInput = document.querySelector(`#stock_${color}`);
        colorSectionsData[color].stock = parseInt(stockInput?.value) || 0;

        // extra price
        const priceInput = document.querySelector(`#extraPrice_${color}`);
        colorSectionsData[color].extraPrice = parseFloat(priceInput?.value) || 0;

        //const colorCode = document.querySelector(`#color-code`);
        //colorSectionsData[color].colorCode = colorCode?.value;

        // sizes
        const sizes = [];
        document
            .querySelectorAll(`.color-sizes[data-color="${color}"] .selection-item.active`)
            .forEach(item => sizes.push(item.dataset.value));

        colorSectionsData[color].sizes = sizes;
    });

    return colorSectionsData;
}


// Initialize
document.addEventListener('DOMContentLoaded', function () {
    updateVideoPreviews();
    // Toggle sidebar for mobile
    menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });

    // Handle product form submission
    //productForm.addEventListener('submit', function (e) {
    //    // Prevent immediate submission
    //    e.preventDefault();

    //    // Validate required fields
    //    if (!validateProductForm()) {
    //        return;
    //    }

    //    // Prepare color variants data
    //    const colorVariants = collectColorVariantsData();
    //    document.getElementById("ColorVariantsJson").value = JSON.stringify(colorVariants);

    //    // Create dynamic file inputs for videos
    //    createDynamicFileInputs();

    //    // Show loading state
    //    const submitBtn = productForm.querySelector('button[type="submit"]');
    //    const originalText = submitBtn.innerHTML;
    //    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Product...';
    //    submitBtn.disabled = true;

    //    // Submit the form
    //    setTimeout(() => {
    //        productForm.submit();
    //    }, 100);
    //});



    // Color selection - create color sections
    document.querySelectorAll('#colorSelection .selection-item').forEach(item => {
        item.addEventListener('click', function () {
            const color = this.getAttribute('data-value');
            const colorCode = this.getAttribute('data-color');
            toggleColorSection(color, colorCode);
        });
    });

    // Auto-generate SKU from product name
    document.getElementById('productName').addEventListener('input', function () {
        const name = this.value;
        if (name.length > 0) {
            const words = name.split(' ');
            let sku = 'LS-';

            if (words.length >= 2) {
                sku += words[0].substring(0, 2).toUpperCase() + '-' +
                    words[1].substring(0, 2).toUpperCase();
            } else {
                sku += name.substring(0, 4).toUpperCase();
            }

            sku += '-' + String(nextProductId).padStart(3, '0');
            document.getElementById('productSKU').value = sku;
        }
    });

    // Initialize tables and stats
    totalProductsElement.textContent = products.length;
    //updateProductStats();
});

// Toggle color section
function toggleColorSection(color, colorCode) {
    const colorItem = document.querySelector(`#colorSelection .selection-item[data-value="${color}"]`);

    if (selectedColors.includes(color)) {
        // Remove color section
        selectedColors = selectedColors.filter(c => c !== color);
        colorItem.classList.remove('active');

        // Remove section from DOM
        const section = document.querySelector(`.color-section[data-color="${color}"]`);
        if (section) {
            section.remove();
        }

        // Remove from colorSectionsData
        delete colorSectionsData[color];
    } else {
        // Add color section
        selectedColors.push(color);
        colorItem.classList.add('active');

        // Create color section
        createColorSection(color, colorCode);

        // Move color selection below added sections
        updateColorSelectionPosition();
    }
}

// Create color section with fields
function createColorSection(color, colorCode) {
    const sectionId = `color-section-${color.toLowerCase()}`;

    const colorSection = document.createElement('div');
    colorSection.className = 'color-section';
    colorSection.setAttribute('data-color', color);
    colorSection.id = sectionId;

    // Initialize color section data
    colorSectionsData[color] = {
        stock: 0,
        extraPrice: 0,
        colorCode: colorCode,
        sizes: ['M'],
        images: new Array(6).fill(null)
    };

    colorSection.innerHTML = `
                <div class="color-section-header">
                    <div class="color-section-title">
                        <div class="color-box" style="background-color: ${colorCode};"></div>
                        <span>${color} Variant</span>
                    </div>
                    <button type="button" class="remove-color-section" onclick="removeColorSection('${color}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="stock_${color}">Stock for ${color} <span class="required">*</span></label>
                        <input type="number" id="stock_${color}" class="form-control color-stock" data-color="${color}" placeholder="e.g., 50" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="extraPrice_${color}">Extra Price for ${color} (₹)</label>
                        <input type="number" id="extraPrice_${color}" class="form-control color-extra-price" data-color="${color}" placeholder="e.g., 500" min="0" step="0.01">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Available Sizes for ${color}</label>
                    <div class="selection-container color-sizes" data-color="${color}">
                        <div class="selection-item" data-value="S">S</div>
                        <div class="selection-item active" data-value="M">M</div>
                        <div class="selection-item" data-value="L">L</div>
                        <div class="selection-item" data-value="XL">XL</div>
                        <div class="selection-item" data-value="XXL">XXL</div>
                    </div>
                    <input type="hidden" id="selectedSizes_${color}" class="selected-sizes" data-color="${color}" value="M">
                </div>
                
                <div class="form-group">
                    <label>Images for ${color} (4-6 images recommended)</label>
                    <div class="image-upload-section">
                        <div class="image-preview-container color-image-preview-container" id="colorImagePreview_${color}" data-color="${color}">
                            <div class="image-preview-item color-image-preview-item" onclick="triggerColorImageUpload('${color}', 0)">
                                <div class="image-preview-placeholder">
                                    <i class="fas fa-plus"></i>
                                    <span>Add Image</span>
                                </div>
                            </div>
                            <div class="image-preview-item color-image-preview-item" onclick="triggerColorImageUpload('${color}', 1)">
                                <div class="image-preview-placeholder">
                                    <i class="fas fa-plus"></i>
                                    <span>Add Image</span>
                                </div>
                            </div>
                            <div class="image-preview-item color-image-preview-item" onclick="triggerColorImageUpload('${color}', 2)">
                                <div class="image-preview-placeholder">
                                    <i class="fas fa-plus"></i>
                                    <span>Add Image</span>
                                </div>
                            </div>
                            <div class="image-preview-item color-image-preview-item" onclick="triggerColorImageUpload('${color}', 3)">
                                <div class="image-preview-placeholder">
                                    <i class="fas fa-plus"></i>
                                    <span>Add Image</span>
                                </div>
                            </div>
                            <div class="image-preview-item color-image-preview-item" onclick="triggerColorImageUpload('${color}', 4)">
                                <div class="image-preview-placeholder">
                                    <i class="fas fa-plus"></i>
                                    <span>Add Image</span>
                                </div>
                            </div>
                            <div class="image-preview-item color-image-preview-item" onclick="triggerColorImageUpload('${color}', 5)">
                                <div class="image-preview-placeholder">
                                    <i class="fas fa-plus"></i>
                                    <span>Add Image</span>
                                </div>
                            </div>
                        </div>
                        <input type="file" class="color-image-upload" data-color="${color}" accept="image/*" multiple style="display: none;" onchange="handleColorImageUpload(event, '${color}')">
                    </div>
                </div>
            `;

    colorSectionsContainer.appendChild(colorSection);

    // Add event listeners for size selection
    const sizeContainer = colorSection.querySelector(`.color-sizes[data-color="${color}"]`);
    sizeContainer.querySelectorAll('.selection-item').forEach(item => {
        item.addEventListener('click', function () {
            this.classList.toggle('active');
            updateSelectedSizesForColor(color);
        });
    });

    // Add event listeners for stock and extra price
    const stockInput = colorSection.querySelector(`#stock_${color}`);
    const extraPriceInput = colorSection.querySelector(`#extraPrice_${color}`);

    stockInput.addEventListener('input', function () {
        colorSectionsData[color].stock = parseInt(this.value) || 0;
    });

    extraPriceInput.addEventListener('input', function () {
        colorSectionsData[color].extraPrice = parseFloat(this.value) || 0;
    });
}

// Remove color section
function removeColorSection(color) {
    selectedColors = selectedColors.filter(c => c !== color);
    const colorItem = document.querySelector(`#colorSelection .selection-item[data-value="${color}"]`);
    if (colorItem) {
        colorItem.classList.remove('active');
    }

    const section = document.querySelector(`.color-section[data-color="${color}"]`);
    if (section) {
        section.remove();
    }

    delete colorSectionsData[color];
    updateColorSelectionPosition();
}

// Update color selection position (move it below added sections)
function updateColorSelectionPosition() {
    // This function ensures the color selection stays below all color sections
    // The color selection container is already in the right place in the DOM
}

// Update selected sizes for a specific color
function updateSelectedSizesForColor(color) {
    const selectedSizes = [];
    const sizeContainer = document.querySelector(`.color-sizes[data-color="${color}"]`);

    if (sizeContainer) {
        sizeContainer.querySelectorAll('.selection-item.active').forEach(item => {
            selectedSizes.push(item.getAttribute('data-value'));
        });

        const hiddenInput = document.getElementById(`selectedSizes_${color}`);
        if (hiddenInput) {
            hiddenInput.value = selectedSizes.join(',');
        }

        // Update colorSectionsData
        if (colorSectionsData[color]) {
            colorSectionsData[color].sizes = selectedSizes;
        }
    }
}

function validateProductForm() {
    const productName = document.getElementById('productName').value.trim();
    const productPrice = document.getElementById('productPrice').value;
    const productSKU = document.getElementById('productSKU').value.trim();

    let isValid = true;
    let errorMessages = [];

    // Validate required fields
    if (!productName) {
        isValid = false;
        errorMessages.push('Product name is required');
    }

    if (!productPrice || parseFloat(productPrice) <= 0) {
        isValid = false;
        errorMessages.push('Valid price is required');
    }

    if (!productSKU) {
        isValid = false;
        errorMessages.push('Product SKU is required');
    }

    // Validate at least one color is selected
    if (selectedColors.length === 0) {
        isValid = false;
        errorMessages.push('Please select at least one color');
    }

    // Validate each color has required fields
    selectedColors.forEach(color => {
        const stockInput = document.getElementById(`stock_${color}`);
        const sizes = document.querySelectorAll(`.color-sizes[data-color="${color}"] .selection-item.active`);

        if (!stockInput || parseInt(stockInput.value) < 0) {
            isValid = false;
            errorMessages.push(`Valid stock required for ${color}`);
        }

        if (sizes.length === 0) {
            isValid = false;
            errorMessages.push(`At least one size required for ${color}`);
        }
    });

    if (!isValid) {
        showNotification(errorMessages.join('<br>'), 'error');
    }

    return isValid;
}

// Color image upload functions
function triggerColorImageUpload(color, index) {
    const input = document.querySelector(`.color-image-upload[data-color="${color}"]`);
    if (input) {
        input.setAttribute('data-index', index);
        input.click();
    }
}

function handleColorImageUpload(event, color) {
    const files = event.target.files;
    const index = parseInt(event.target.getAttribute('data-index'));

    if (files.length > 0 && colorSectionsData[color]) {
        const file = files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            colorSectionsData[color].images[index] = e.target.result;
            updateColorImagePreviews(color);

            // If there are more files and next slot is empty, upload to next slot
            if (files.length > 1 && index + 1 < 6 && !colorSectionsData[color].images[index + 1]) {
                const nextFile = files[1];
                const nextReader = new FileReader();

                nextReader.onload = function (e) {
                    colorSectionsData[color].images[index + 1] = e.target.result;
                    updateColorImagePreviews(color);
                };

                nextReader.readAsDataURL(nextFile);
            }
        };

        reader.readAsDataURL(file);
    }

    // Reset input
    event.target.value = '';
}

function updateColorImagePreviews(color) {
    const container = document.getElementById(`colorImagePreview_${color}`);
    if (!container || !colorSectionsData[color]) return;

    container.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-preview-item color-image-preview-item';
        imageItem.onclick = () => triggerColorImageUpload(color, i);

        if (colorSectionsData[color].images[i]) {
            imageItem.innerHTML = `
                        <img src="${colorSectionsData[color].images[i]}" alt="${color} Image ${i + 1}">
                        <div class="remove-image" onclick="removeColorImage('${color}', ${i}); event.stopPropagation();">
                            <i class="fas fa-times"></i>
                        </div>
                    `;
        } else {
            imageItem.innerHTML = `
                        <div class="image-preview-placeholder">
                            <i class="fas fa-plus"></i>
                            <span>Add Image</span>
                        </div>
                    `;
        }

        container.appendChild(imageItem);
    }
}

function removeColorImage(color, index) {
    if (colorSectionsData[color]) {
        colorSectionsData[color].images[index] = null;
        updateColorImagePreviews(color);
    }
}
let productVideos = []; // stores File objects
const MAX_VIDEOS = 2;

// Initialize video previews
document.addEventListener('DOMContentLoaded', function () {
    updateVideoPreviews();
});

// Trigger video upload
function triggerVideoUpload(index) {
    currentVideoUploadIndex = index;
    videoUploadInput.click();
}

// Handle video upload
function handleVideoUpload(event) {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // Check if we can add more videos
    const availableSlots = MAX_VIDEOS - productVideos.length;
    if (availableSlots <= 0) {
        showNotification('Maximum 2 videos allowed', 'warning');
        event.target.value = "";
        return;
    }

    // Process only the number of files we can add
    const filesToProcess = Math.min(files.length, availableSlots);

    for (let i = 0; i < filesToProcess; i++) {
        const file = files[i];

        if (!file.type.startsWith("video/")) {
            showNotification(`File ${file.name} is not a valid video file`, 'error');
            continue;
        }

        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            showNotification(`Video ${file.name} is too large. Max size is 50MB`, 'error');
            continue;
        }

        // Add to productVideos array
        productVideos.push(file);
    }

    // Update previews
    updateVideoPreviews();

    // Reset input
    event.target.value = "";
}

// Update video previews
function updateVideoPreviews() {
    const container = document.getElementById('videoPreviewContainer');
    container.innerHTML = "";

    // Show existing videos
    productVideos.forEach((file, index) => {
        const item = document.createElement("div");
        item.className = "image-preview-item";
        const videoUrl = URL.createObjectURL(file);

        item.innerHTML = `
            <video src="${videoUrl}"
                   muted
                   loop
                   playsinline
                   onmouseover="this.play()"
                   onmouseout="this.pause()">
            </video>
            <div class="remove-image"
                 onclick="removeVideo(${index}); event.stopPropagation();">
                <i class="fas fa-times"></i>
            </div>
        `;

        container.appendChild(item);
    });

    // Show add buttons for remaining slots
    for (let i = productVideos.length; i < MAX_VIDEOS; i++) {
        const item = document.createElement("div");
        item.className = "image-preview-item";
        item.onclick = () => triggerVideoUpload(i);

        item.innerHTML = `
            <div class="image-preview-placeholder">
                <i class="fas fa-plus"></i>
                <span>Add Video</span>
            </div>
        `;

        container.appendChild(item);
    }
}

// Remove video
function removeVideo(index) {
    // Revoke object URL to free memory
    if (productVideos[index]) {
        const videoUrl = URL.createObjectURL(productVideos[index]);
        URL.revokeObjectURL(videoUrl);
    }

    // Remove from array
    productVideos.splice(index, 1);

    // Update previews
    updateVideoPreviews();
}

// FORM SUBMISSION - AJAX METHOD
function submitForm(e) {
    e.preventDefault();

    // Validate form
    if (!validateProductForm()) {
        return false;
    }

    // Prepare color variants data
    const colorVariants = collectColorVariantsData();

    // IMPORTANT: Set the hidden field value
    document.getElementById("ColorVariantsJson").value = JSON.stringify(colorVariants);

    // Create FormData from the actual form
    const form = document.getElementById('productForm');
    const formData = new FormData(form);

    // Append video files separately (if not already included in the FormData)
    productVideos.forEach((file, index) => {
        formData.append('EcommerceProductVideos', file, file.name);
    });

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Product...';
    submitBtn.disabled = true;

    // Submit via AJAX
    fetch(form.action, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header when using FormData - browser sets it automatically
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showNotification(data.message || 'Product added successfully!', 'success');
                setTimeout(() => {
                    window.location.href = '/Product/Index';
                }, 2000)

                //resetProductForm();
            } else {
                showNotification(data.message || 'Error adding product', 'error');
            }
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error adding product. Please try again.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });

    return false;
}

// Helper function to convert base64 to Blob
function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}

// Reset product form
function resetProductForm() {
    document.getElementById('productForm').reset();
    productImages = new Array(6).fill(null);
    productVideos = [];

    // Reset color sections
    selectedColors = [];
    colorSectionsData = {};
    colorSectionsContainer.innerHTML = '';

    // Reset color selection
    document.querySelectorAll('#colorSelection .selection-item').forEach(item => {
        item.classList.remove('active');
    });

    // Update previews
    updateVideoPreviews();
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);

    // Add some CSS for notifications
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .notification-success {
                background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
                border-left: 4px solid #2E7D32;
            }
            .notification-error {
                background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                border-left: 4px solid #c62828;
            }
            .notification-warning {
                background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
                border-left: 4px solid #ef6c00;
            }
            .notification-info {
                background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
                border-left: 4px solid #1565C0;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .notification-content i {
                font-size: 1.2rem;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function toggleProductStatus(id) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        const newStatus = products[index].status === 'active' ? 'inactive' : 'active';
        products[index].status = newStatus;

        updateProductsTable();
        updateProductStats();

        showNotification(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'info');
    }
}