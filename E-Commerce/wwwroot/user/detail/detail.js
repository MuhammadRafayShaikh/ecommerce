// Product Detail Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Image Thumbnail Navigation
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function () {
            // Update main image
            const imageSrc = this.getAttribute('data-image');
            mainImage.src = imageSrc;

            // Update active thumbnail
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Color Selection
    const colorOptions = document.querySelectorAll('.color-option');
    const sizeOptionsContainer = document.getElementById('sizeOptions');
    let selectedColorId = colorOptions[0]?.getAttribute('data-color-id');

    // Get AJAX URL from hidden input
    const getColorDataUrl = document.getElementById('getColorDataUrl')?.value || '/Detail/GetColorData';

    colorOptions.forEach(option => {
        option.addEventListener('click', function () {
            if (this.classList.contains('selected')) return;

            // Update selected color
            colorOptions.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');

            selectedColorId = this.getAttribute('data-color-id');
            const colorName = this.getAttribute('data-color-name');
            const stock = parseInt(this.getAttribute('data-stock'));
            const sizes = this.getAttribute('data-sizes');

            // Update stock status
            const stockStatus = document.querySelector('.stock-status span');
            if (stock > 10) {
                stockStatus.textContent = `${stock} items in stock`;
                stockStatus.className = 'in-stock';
            } else if (stock > 0) {
                stockStatus.textContent = `Only ${stock} items left`;
                stockStatus.className = 'low-stock';
            } else {
                stockStatus.textContent = 'Out of stock';
                stockStatus.className = '';
            }

            // Update sizes based on selected color
            updateSizesForColor(sizes);

            // Update product images for selected color via AJAX
            updateImagesForColor(selectedColorId);
        });
    });

    // Size Selection
    function updateSizesForColor(sizesString) {
        // Clear existing sizes
        sizeOptionsContainer.innerHTML = '';

        // Split the sizes string (e.g., "M, XL") into array
        const sizes = sizesString.split(',').map(size => size.trim());

        // Create size options
        sizes.forEach((size, index) => {
            const sizeOption = document.createElement('div');
            sizeOption.className = `size-option ${index === 0 ? 'selected' : ''}`;
            sizeOption.setAttribute('data-size', size);
            sizeOption.textContent = size;

            sizeOption.addEventListener('click', function () {
                if (this.classList.contains('selected')) return;

                document.querySelectorAll('.size-option').forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
            });

            sizeOptionsContainer.appendChild(sizeOption);
        });
    }

    // Update images for selected color via AJAX
    function updateImagesForColor(colorId) {
        // Show loading indicator
        const imageThumbnails = document.getElementById('imageThumbnails');
        const mainImageContainer = document.querySelector('.main-image-container');

        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="spinner"></div>';
        mainImageContainer.appendChild(loadingOverlay);

        // Make AJAX call to get color data
        $.ajax({
            url: getColorDataUrl,
            type: 'GET',
            data: { colorId: colorId },
            success: function (response) {
                if (response.success) {
                    // Update images
                    updateProductImages(response.images);

                    // Remove loading overlay
                    mainImageContainer.removeChild(loadingOverlay);
                } else {
                    console.error('Error loading color data:', response.message);
                    showToast('Error loading product images', 'error');
                    mainImageContainer.removeChild(loadingOverlay);
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX error:', error);
                showToast('Error loading product data', 'error');
                mainImageContainer.removeChild(loadingOverlay);
            }
        });
    }

    // Update product images
    function updateProductImages(images) {
        const imageThumbnails = document.getElementById('imageThumbnails');
        const mainImage = document.getElementById('mainImage');

        // Clear existing thumbnails
        imageThumbnails.innerHTML = '';

        // Update main image with first image
        if (images && images.length > 0) {
            mainImage.src = images[0];

            // Create thumbnails
            images.forEach((imageUrl, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
                thumbnail.setAttribute('data-image', imageUrl);
                thumbnail.innerHTML = `<img src="${imageUrl}" alt="Thumbnail ${index + 1}" loading="lazy">`;

                thumbnail.addEventListener('click', function () {
                    mainImage.src = imageUrl;

                    // Update active thumbnail
                    imageThumbnails.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                });

                imageThumbnails.appendChild(thumbnail);
            });
        }
    }

    // Quantity Controls
    const quantityInput = document.querySelector('.quantity-input');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');

    minusBtn.addEventListener('click', function () {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });

    plusBtn.addEventListener('click', function () {
        let value = parseInt(quantityInput.value);
        if (value < 10) {
            quantityInput.value = value + 1;
        }
    });

    quantityInput.addEventListener('input', function () {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 1) this.value = 1;
        if (value > 10) this.value = 10;
    });

    // Tab Navigation
    const tabHeaders = document.querySelectorAll('.tab-header');
    const tabContents = document.querySelectorAll('.tab-content');

    tabHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // Update active tab header
            tabHeaders.forEach(h => h.classList.remove('active'));
            this.classList.add('active');

            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Buy Now Button
    document.getElementById('buyNowBtn').addEventListener('click', function () {
        const selectedColorElement = document.querySelector('.color-option.selected');
        const selectedSizeElement = document.querySelector('.size-option.selected');
        const quantity = parseInt(quantityInput.value);

        if (!selectedColorElement || !selectedSizeElement) {
            showToast('Please select color and size', 'warning');
            return;
        }

        showToast('Proceeding to checkout...', 'info');
        // window.location.href = '/checkout?productId=@Model.Id&colorId=' + selectedColorId + '&size=' + selectedSize + '&quantity=' + quantity;
    });

    // Wishlist Button
    document.getElementById('wishlistBtn').addEventListener('click', function () {
        const isActive = this.classList.contains('active');

        if (isActive) {
            this.classList.remove('active');
            this.innerHTML = '<i class="far fa-heart"></i>';
            showToast('Removed from wishlist', 'info');
        } else {
            this.classList.add('active');
            this.innerHTML = '<i class="fas fa-heart"></i>';
            showToast('Added to wishlist', 'success');
        }
    });

});