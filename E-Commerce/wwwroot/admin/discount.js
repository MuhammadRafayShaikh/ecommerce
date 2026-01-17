// Products data storage - Add discount properties
let products = [
    {
        id: 1,
        name: "Royal Blue Anarkali Suit",
        category: "Anarkali Suits",
        price: 4599,
        discountType: "percentage",
        discountValue: 10,
        sku: "LS-AN-001",
        availability: "in-stock",
        brand: "Luxe Suits",
        shortDescription: "Elegant royal blue anarkali with intricate zari work",
        fullDescription: "Beautiful royal blue anarkali suit with intricate zari work, silk fabric, perfect for weddings and special occasions. Comes with matching dupatta.",
        sizes: ["S", "M", "L"],
        colors: ["Blue"],
        weight: 850,
        fabric: "Silk",
        stock: 25,
        status: "active",
        images: [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YW5hcmthbGklMjBzdWl0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YW5hcmthbGklMjBzdWl0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
        ],
        addedOn: "2023-10-15"
    },
    {
        id: 2,
        name: "Red Bridal Lehenga",
        category: "Lehenga Choli",
        price: 12500,
        discountType: "fixed",
        discountValue: 1500,
        sku: "LS-LH-001",
        availability: "in-stock",
        brand: "Luxe Suits",
        shortDescription: "Stunning red bridal lehenga with heavy embroidery",
        fullDescription: "Exquisite red bridal lehenga with heavy embroidery, stone work, and zari detailing. Perfect for weddings and grand celebrations.",
        sizes: ["M", "L", "XL"],
        colors: ["Red"],
        weight: 2200,
        fabric: "Velvet",
        stock: 8,
        status: "active",
        images: [
            "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bGVoZW5nYSUyMGNob2xpfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1585487000160-6eb9ce6b5aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGVoZW5nYSUyMGNob2xpfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
        ],
        addedOn: "2023-10-12"
    },
    {
        id: 3,
        name: "Pink Sharara Set",
        category: "Sharara Suits",
        price: 6999,
        discountType: "percentage",
        discountValue: 15,
        sku: "LS-SH-001",
        availability: "in-stock",
        brand: "Luxe Suits",
        shortDescription: "Beautiful pink sharara set with mirror work",
        fullDescription: "Elegant pink sharara set with intricate mirror work, perfect for festivals and weddings. Comes with matching dupatta and blouse.",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Pink"],
        weight: 1200,
        fabric: "Georgette",
        stock: 15,
        status: "active",
        images: [
            "https://images.unsplash.com/photo-1585487000160-6eb9ce6b5aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hhcmFyYSUyMHN1aXRzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
        ],
        addedOn: "2023-10-10"
    },
    {
        id: 4,
        name: "White Palazzo Suit",
        category: "Palazzo Suits",
        price: 3299,
        discountType: null,
        discountValue: 0,
        sku: "LS-PL-001",
        availability: "out-of-stock",
        brand: "Luxe Suits",
        shortDescription: "Casual white palazzo suit for daily wear",
        fullDescription: "Comfortable white palazzo suit made from cotton, perfect for casual outings and daily wear. Easy to maintain and comfortable fit.",
        sizes: ["S", "M", "L"],
        colors: ["White"],
        weight: 750,
        fabric: "Cotton",
        stock: 0,
        status: "active",
        images: [
            "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGFsYXp6byUyMHN1aXRzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
        ],
        addedOn: "2023-10-05"
    },
    {
        id: 5,
        name: "Green Saree Gown",
        category: "Saree Gown",
        price: 5599,
        discountType: "percentage",
        discountValue: 20,
        sku: "LS-SG-001",
        availability: "in-stock",
        brand: "Luxe Suits",
        shortDescription: "Modern green saree gown fusion",
        fullDescription: "Contemporary green saree gown fusion that combines traditional elegance with modern style. Perfect for parties and formal events.",
        sizes: ["M", "L"],
        colors: ["Green"],
        weight: 1100,
        fabric: "Chiffon",
        stock: 12,
        status: "inactive",
        images: [
            "https://images.unsplash.com/photo-1583391721167-9de6b1d5e5a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2FyZWUlMjBnb3dufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
        ],
        addedOn: "2023-09-28"
    },
    {
        id: 6,
        name: "Black Cape Gown",
        category: "Cape Gown",
        price: 8999,
        discountType: "fixed",
        discountValue: 1000,
        sku: "LS-CG-001",
        availability: "in-stock",
        brand: "Luxe Suits",
        shortDescription: "Elegant black cape gown for parties",
        fullDescription: "Stylish black cape gown with sequin work, perfect for cocktail parties and evening events. Makes a bold fashion statement.",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black"],
        weight: 1400,
        fabric: "Crepe",
        stock: 6,
        status: "active",
        images: [
            "https://images.unsplash.com/photo-1585487000160-6eb9ce6b5aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2FwZSUyMGdvd258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
        ],
        addedOn: "2023-09-25"
    }
];

let nextProductId = 7;
let currentImageUploadIndex = 0;
let productImages = new Array(6).fill(null);

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const productForm = document.getElementById('productForm');
const imageUploadInput = document.getElementById('imageUploadInput');
const pageTitle = document.getElementById('pageTitle');
const totalProductsElement = document.getElementById('totalProducts');
const allProductsTable = document.getElementById('allProductsTable');
const productsEmptyState = document.getElementById('productsEmptyState');
const productsPagination = document.getElementById('productsPagination');
const totalProductsCount = document.getElementById('totalProductsCount');
const activeProductsCount = document.getElementById('activeProductsCount');
const inStockCount = document.getElementById('inStockCount');
const totalInventoryValue = document.getElementById('totalInventoryValue');

// Discount page elements
const discountProductsTable = document.getElementById('discountProductsTable');
const discountEmptyState = document.getElementById('discountEmptyState');
const discountPagination = document.getElementById('discountPagination');
const discountedProductsCount = document.getElementById('discountedProductsCount');
const totalDiscountValue = document.getElementById('totalDiscountValue');
const avgDiscountPercentage = document.getElementById('avgDiscountPercentage');

// Helper function to calculate discounted price
function calculateDiscountedPrice(product) {
    if (!product.discountType || !product.discountValue || product.discountValue <= 0) {
        return product.price;
    }

    if (product.discountType === "percentage") {
        return product.price - (product.price * product.discountValue / 100);
    } else if (product.discountType === "fixed") {
        return product.price - product.discountValue;
    }

    return product.price;
}

// Helper function to update discount statistics
function updateDiscountStats() {
    const discountedProducts = products.filter(p => p.discountType && p.discountValue > 0);
    discountedProductsCount.textContent = discountedProducts.length;

    let totalDiscount = 0;
    let totalPercentageDiscount = 0;
    let countPercentageDiscount = 0;

    discountedProducts.forEach(product => {
        if (product.discountType === "percentage") {
            const discountAmount = product.price * product.discountValue / 100;
            totalDiscount += discountAmount;
            totalPercentageDiscount += product.discountValue;
            countPercentageDiscount++;
        } else if (product.discountType === "fixed") {
            totalDiscount += product.discountValue;
        }
    });

    totalDiscountValue.textContent = `₹${Math.round(totalDiscount).toLocaleString()}`;

    const avgPercentage = countPercentageDiscount > 0 ?
        Math.round(totalPercentageDiscount / countPercentageDiscount) : 0;
    avgDiscountPercentage.textContent = `${avgPercentage}%`;
}

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
    } else if (pageName === 'discountManagement') {
        pageTitle.textContent = 'Discount Management';
        updateDiscountProductsTable();
        updateDiscountStats();
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    if (pageName === 'addProduct') {
        document.querySelectorAll('.nav-link')[2].classList.add('active');
    } else if (pageName === 'viewProducts') {
        document.querySelectorAll('.nav-link')[3].classList.add('active');
    } else if (pageName === 'discountManagement') {
        document.querySelectorAll('.nav-link')[4].classList.add('active');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    // Toggle sidebar for mobile
    menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });

    // Handle product form submission
    productForm.addEventListener('submit', function (e) {
        e.preventDefault();
        addNewProduct();
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

    // Update stock availability based on stock quantity
    document.getElementById('productStock').addEventListener('input', function () {
        const stock = parseInt(this.value) || 0;
        const availabilitySelect = document.getElementById('productAvailability');

        if (stock > 10) {
            availabilitySelect.value = 'in-stock';
        } else if (stock > 0) {
            availabilitySelect.value = 'in-stock';
        } else {
            availabilitySelect.value = 'out-of-stock';
        }
    });

    // Initialize tables and stats
    totalProductsElement.textContent = products.length;
    updateProductStats();
    updateDiscountStats();
});

// Add new product (simplified version)
function addNewProduct() {
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const categoryText = document.getElementById('productCategory').options[document.getElementById('productCategory').selectedIndex].text;
    const price = parseFloat(document.getElementById('productPrice').value);
    const sku = document.getElementById('productSKU').value;
    const availability = document.getElementById('productAvailability').value;
    const brand = document.getElementById('productBrand').value;
    const shortDescription = document.getElementById('shortDescription').value;
    const fullDescription = document.getElementById('fullDescription').value;
    const weight = parseInt(document.getElementById('productWeight').value) || 0;
    const fabric = document.getElementById('productFabric').value;
    const status = document.getElementById('productStatus').value;

    // Use uploaded images or default images
    let images = productImages.filter(img => img !== null);
    if (images.length === 0) {
        // Add default image based on category
        if (categoryText === "Anarkali Suits") {
            images = ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YW5hcmthbGklMjBzdWl0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"];
        } else if (categoryText === "Lehenga Choli") {
            images = ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bGVoZW5nYSUyMGNob2xpfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"];
        } else if (categoryText === "Sharara Suits") {
            images = ["https://images.unsplash.com/photo-1585487000160-6eb9ce6b5aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hhcmFyYSUyMHN1aXRzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"];
        } else {
            images = ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YW5hcmthbGklMjBzdWl0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"];
        }
    }

    // Create new product object
    const newProduct = {
        id: nextProductId++,
        name: name,
        category: categoryText,
        price: price,
        discountType: null,
        discountValue: 0,
        sku: sku,
        availability: availability,
        brand: brand,
        shortDescription: shortDescription || "No description provided",
        fullDescription: fullDescription || "No details provided",
        sizes: ["S", "M", "L"],
        colors: ["Red", "Blue"],
        weight: weight,
        fabric: fabric,
        stock: 10, // Default stock
        status: status,
        images: images,
        addedOn: new Date().toISOString().split('T')[0]
    };

    // Add to products array
    products.unshift(newProduct);

    // Update UI
    totalProductsElement.textContent = products.length;
    updateProductStats();
    updateDiscountStats();

    // Show success message
    showNotification('Product added successfully!', 'success');

    // Reset form
    resetProductForm();

    // Switch to view products page
    showPage('viewProducts');
}

// Reset product form
function resetProductForm() {
    productForm.reset();
    productImages = new Array(6).fill(null);
    updateImagePreviews();
}

// Image upload functions
function triggerImageUpload(index) {
    currentImageUploadIndex = index;
    imageUploadInput.click();
}

function handleImageUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            productImages[currentImageUploadIndex] = e.target.result;
            updateImagePreviews();

            // If there are more files and next slot is empty, upload to next slot
            if (files.length > 1 && currentImageUploadIndex + 1 < 6) {
                const nextFile = files[1];
                const nextReader = new FileReader();

                nextReader.onload = function (e) {
                    productImages[currentImageUploadIndex + 1] = e.target.result;
                    updateImagePreviews();
                };

                nextReader.readAsDataURL(nextFile);
            }
        };

        reader.readAsDataURL(file);
    }

    // Reset input
    event.target.value = '';
}

function updateImagePreviews() {
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-preview-item';
        imageItem.onclick = () => triggerImageUpload(i);

        if (productImages[i]) {
            imageItem.innerHTML = `
                        <img src="${productImages[i]}" alt="Product Image ${i + 1}">
                        <div class="remove-image" onclick="removeImage(${i}); event.stopPropagation();">
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

function removeImage(index) {
    productImages[index] = null;
    updateImagePreviews();
}

// Update products table
function updateProductsTable(filteredProducts = null) {
    const productsToShow = filteredProducts || products;

    // Clear current table
    allProductsTable.innerHTML = '';

    if (productsToShow.length === 0) {
        productsEmptyState.style.display = 'block';
        productsPagination.style.display = 'none';
        return;
    }

    productsEmptyState.style.display = 'none';
    productsPagination.style.display = 'flex';

    // Populate table
    productsToShow.forEach(product => {
        // Determine stock indicator
        let stockClass = 'stock-out';
        let stockText = 'Out of Stock';

        if (product.stock > 10) {
            stockClass = 'stock-in';
            stockText = `${product.stock} in stock`;
        } else if (product.stock > 0) {
            stockClass = 'stock-low';
            stockText = `Low stock (${product.stock})`;
        }

        // Calculate discounted price
        const discountedPrice = calculateDiscountedPrice(product);

        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>
                        <div class="product-image-cell">
                            <img src="${product.images[0]}" class="product-image" alt="${product.name}">
                        </div>
                    </td>
                    <td>
                        <div class="product-name">${product.name}</div>
                        <div class="product-sku">${product.sku}</div>
                    </td>
                    <td>${product.category}</td>
                    <td class="product-price">
                        ${product.discountType && product.discountValue > 0 ?
                `<span class="original-price">₹${product.price.toLocaleString()}</span>` : ''}
                        ₹${discountedPrice.toLocaleString()}
                    </td>
                    <td>${product.sku}</td>
                    <td>
                        <div class="product-stock">
                            <div class="stock-indicator ${stockClass}"></div>
                            <span>${stockText}</span>
                        </div>
                    </td>
                    <td><span class="product-status status-${product.status}">${product.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-view" onclick="viewProduct(${product.id})" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon btn-edit" onclick="editProduct(${product.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-toggle" onclick="toggleProductStatus(${product.id})" title="${product.status === 'active' ? 'Deactivate' : 'Activate'}">
                                <i class="fas fa-power-off"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
        allProductsTable.appendChild(row);
    });
}

// Update discount products table
function updateDiscountProductsTable(filteredProducts = null) {
    const productsToShow = filteredProducts || products;

    // Clear current table
    discountProductsTable.innerHTML = '';

    if (productsToShow.length === 0) {
        discountEmptyState.style.display = 'block';
        discountPagination.style.display = 'none';
        return;
    }

    discountEmptyState.style.display = 'none';
    discountPagination.style.display = 'flex';

    // Populate table
    productsToShow.forEach(product => {
        const discountedPrice = calculateDiscountedPrice(product);
        const hasDiscount = product.discountType && product.discountValue > 0;

        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>
                        <input type="checkbox" class="product-discount-checkbox" data-id="${product.id}">
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${product.images[0]}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                            <div>
                                <div style="font-weight: 600;">${product.name}</div>
                                <div style="font-size: 13px; color: #777;">${product.sku}</div>
                            </div>
                        </div>
                    </td>
                    <td class="product-price">₹${product.price.toLocaleString()}</td>
                    <td>
                        ${hasDiscount ?
                `<span class="discount-badge">
                                ${product.discountType === 'percentage' ?
                    `${product.discountValue}%` :
                    `₹${product.discountValue}`}
                            </span>` :
                `<span class="no-discount-badge">No Discount</span>`
            }
                    </td>
                    <td class="discounted-price">₹${discountedPrice.toLocaleString()}</td>
                    <td>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <select class="discount-input-small discount-type-select" data-id="${product.id}" style="flex: 1;">
                                <option value="" ${!product.discountType ? 'selected' : ''}>Select Type</option>
                                <option value="percentage" ${product.discountType === 'percentage' ? 'selected' : ''}>Percentage</option>
                                <option value="fixed" ${product.discountType === 'fixed' ? 'selected' : ''}>Fixed Amount</option>
                            </select>
                            <input type="number" class="discount-input-small discount-value-input" data-id="${product.id}" 
                                   value="${product.discountValue || ''}" placeholder="Value" min="0" 
                                   ${product.discountType === 'percentage' ? 'max="100"' : ''} style="flex: 1;">
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-success" onclick="applyDiscountToProduct(${product.id})" title="Apply Discount">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-icon btn-danger" onclick="removeDiscountFromProduct(${product.id})" title="Remove Discount">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </td>
                `;
        discountProductsTable.appendChild(row);
    });

    // Add event listeners for discount inputs
    document.querySelectorAll('.discount-type-select').forEach(select => {
        select.addEventListener('change', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            const valueInput = document.querySelector(`.discount-value-input[data-id="${productId}"]`);

            if (this.value === 'percentage') {
                valueInput.max = 100;
                valueInput.placeholder = '0-100%';
            } else {
                valueInput.removeAttribute('max');
                valueInput.placeholder = 'Amount';
            }
        });
    });
}

// Update product statistics
function updateProductStats() {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const inStockProducts = products.filter(p => p.stock > 0).length;

    // Calculate total inventory value
    let totalValue = 0;
    products.forEach(product => {
        totalValue += product.price * product.stock;
    });

    // Update DOM elements
    totalProductsCount.textContent = totalProducts;
    activeProductsCount.textContent = activeProducts;
    inStockCount.textContent = inStockProducts;
    totalInventoryValue.textContent = `₹${totalValue.toLocaleString()}`;
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
    );

    // Update table with filtered results
    updateProductsTable(filteredProducts);
}

// Search discount products
function searchDiscountProducts() {
    const searchTerm = document.getElementById('discountSearch').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );

    // Update table with filtered results
    updateDiscountProductsTable(filteredProducts);
}

// Filter discount products
function filterDiscountProducts() {
    const categoryFilter = document.getElementById('discountCategoryFilter').value;
    const discountFilter = document.getElementById('discountStatusFilter').value;

    let filteredProducts = products;

    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }

    if (discountFilter === 'with-discount') {
        filteredProducts = filteredProducts.filter(p => p.discountType && p.discountValue > 0);
    } else if (discountFilter === 'without-discount') {
        filteredProducts = filteredProducts.filter(p => !p.discountType || p.discountValue <= 0);
    }

    updateDiscountProductsTable(filteredProducts);
}

// Product actions
function viewProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        alert(`Viewing: ${product.name}\nCategory: ${product.category}\nPrice: ₹${product.price}\nDiscount: ${product.discountType ? `${product.discountValue}${product.discountType === 'percentage' ? '%' : '₹'}` : 'None'}\nSKU: ${product.sku}\nStock: ${product.stock}\nStatus: ${product.status}\n\nDescription: ${product.shortDescription}`);
    }
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        // Populate form with product data
        document.getElementById('productName').value = product.name;

        // Find and select the category
        const categorySelect = document.getElementById('productCategory');
        for (let i = 0; i < categorySelect.options.length; i++) {
            if (categorySelect.options[i].text === product.category) {
                categorySelect.selectedIndex = i;
                break;
            }
        }

        document.getElementById('productPrice').value = product.price;
        document.getElementById('productSKU').value = product.sku;
        document.getElementById('productAvailability').value = product.availability;
        document.getElementById('productBrand').value = product.brand;
        document.getElementById('shortDescription').value = product.shortDescription;
        document.getElementById('fullDescription').value = product.fullDescription;
        document.getElementById('productWeight').value = product.weight;
        document.getElementById('productFabric').value = product.fabric;
        document.getElementById('productStatus').value = product.status;

        // Set images
        productImages = [...product.images, ...new Array(6 - product.images.length).fill(null)];
        updateImagePreviews();

        // Show add product page
        showPage('addProduct');

        // Change form submit button text and action
        const submitButton = productForm.querySelector('.btn-success');
        submitButton.innerHTML = '<i class="fas fa-save"></i> Update Product';

        // Change form handler
        productForm.onsubmit = function (e) {
            e.preventDefault();
            updateExistingProduct(id);
        };

        showNotification(`Editing product: ${product.name}`, 'info');
    }
}

function updateExistingProduct(id) {
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const categoryText = document.getElementById('productCategory').options[document.getElementById('productCategory').selectedIndex].text;
    const price = parseFloat(document.getElementById('productPrice').value);
    const sku = document.getElementById('productSKU').value;
    const availability = document.getElementById('productAvailability').value;
    const brand = document.getElementById('productBrand').value;
    const shortDescription = document.getElementById('shortDescription').value;
    const fullDescription = document.getElementById('fullDescription').value;
    const weight = parseInt(document.getElementById('productWeight').value) || 0;
    const fabric = document.getElementById('productFabric').value;
    const status = document.getElementById('productStatus').value;

    // Use uploaded images or existing images
    let images = productImages.filter(img => img !== null);
    if (images.length === 0) {
        // Keep existing images if no new ones uploaded
        const existingProduct = products.find(p => p.id === id);
        images = existingProduct ? existingProduct.images : [];
    }

    // Find product index
    const index = products.findIndex(p => p.id === id);

    if (index !== -1) {
        // Keep existing discount
        const existingDiscountType = products[index].discountType;
        const existingDiscountValue = products[index].discountValue;

        // Update product
        products[index] = {
            ...products[index],
            name: name,
            category: categoryText,
            price: price,
            sku: sku,
            availability: availability,
            brand: brand,
            shortDescription: shortDescription,
            fullDescription: fullDescription,
            weight: weight,
            fabric: fabric,
            status: status,
            images: images,
            discountType: existingDiscountType,
            discountValue: existingDiscountValue
        };

        // Update UI
        updateProductsTable();
        updateProductStats();
        updateDiscountStats();

        // Reset form and button
        resetProductForm();
        const submitButton = productForm.querySelector('.btn-success');
        submitButton.innerHTML = '<i class="fas fa-check"></i> Add Product';
        productForm.onsubmit = function (e) {
            e.preventDefault();
            addNewProduct();
        };

        // Switch to view products page
        showPage('viewProducts');

        showNotification('Product updated successfully!', 'success');
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

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        // Remove product from array
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            const productName = products[index].name;
            products.splice(index, 1);

            // Update UI
            totalProductsElement.textContent = products.length;
            updateProductsTable();
            updateProductStats();
            updateDiscountStats();

            showNotification(`Product "${productName}" deleted successfully!`, 'warning');
        }
    }
}

// Discount functions
function applyDiscountToProduct(productId) {
    //const productId = parseInt(checkbox.getAttribute('data-id'));
    //alert(productId);
    //const index = products.findIndex(p => p.id === productId);

    const typeSelect = document.querySelector(`.discount-type-select[data-id="${productId}"]`);
    const valueInput = document.querySelector(`.discount-value-input[data-id="${productId}"]`);

    const discountType = typeSelect.value;
    const discountValue = parseFloat(valueInput.value) || 0;

    // Validate inputs
    if (!discountType) {
        showNotification('Please select a discount type', 'warning');
        return;
    }

    if (discountValue <= 0) {
        showNotification('Please enter a valid discount value', 'warning');
        return;
    }

    if (discountType === 'percentage' && discountValue > 100) {
        showNotification('Percentage discount cannot exceed 100%', 'warning');
        return;
    }

    $.ajax({
        url: "/Product/ApplySingleDiscount",
        type: "POST",
        data: { productId: productId, discountType: discountType, discountValue: discountValue },
        success: function (html) {

            $('#discountProductsTable').html(html);
            //if (@TempData["error"] == null) {

            //showNotification('Discount applied successfully', 'success');
            //}
        }
    })

}

function removeDiscountFromProduct(productId) {

    $.ajax({
        url: "/Product/RemoveDiscount",
        type: "POST",
        data: { productId: productId },
        success: function (html) {
            $("#discountProductsTable").html(html);
        }
    })
}

function toggleSelectAllDiscounts(checkbox) {
    const isChecked = checkbox.checked;
    document.querySelectorAll('.product-discount-checkbox').forEach(cb => {
        cb.checked = isChecked;
    });
}

function applyBulkDiscount() {
    const discountType = document.getElementById('bulkDiscountType').value;
    const discountValue = parseFloat(document.getElementById('bulkDiscountValue').value) || 0;

    // Validate inputs
    if (!discountType) {
        showNotification('Please select a discount type', 'warning');
        return;
    }

    if (discountValue <= 0) {
        showNotification('Please enter a valid discount value', 'warning');
        return;
    }

    if (discountType === 'percentage' && discountValue > 100) {
        showNotification('Percentage discount cannot exceed 100%', 'warning');
        return;
    }

    // Get selected products
    const selectedCheckboxes = document.querySelectorAll('.product-discount-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        showNotification('Please select at least one product', 'warning');
        return;
    }
    // ✅ collect product ids
    const productIds = Array.from(selectedCheckboxes)
        .map(cb => parseInt(cb.getAttribute('data-id')));
    //let count = 0;
    //selectedCheckboxes.forEach(checkbox => {
    //    const productId = parseInt(checkbox.getAttribute('data-id'));
    //alert(productIds);
    $.ajax({
        url: "/Product/ApplyBulkDiscount",
        type: "POST",
        traditional: true, // important for List<int>
        data: { productIds: productIds, discountType: discountType, discountValue: discountValue },
        success: function (html) {

            // Partial view ke HTML se table update
            $('#discountProductsTable').html(html);

            showNotification('Discount applied successfully', 'success');

            // Clear selection
            document.getElementById('bulkDiscountValue').value = '';
            document.getElementById('selectAllDiscounts').checked = false;
        }
    });
    //});

    // Clear bulk discount form
    document.getElementById('bulkDiscountValue').value = '';
    document.getElementById('selectAllDiscounts').checked = false;
    document.querySelectorAll('.product-discount-checkbox').forEach(cb => {
        cb.checked = false;
    });
}

// Pagination
function changeProductsPage(direction) {
    // Simple pagination logic
    const buttons = productsPagination.querySelectorAll('button');
    let activeIndex = 0;

    buttons.forEach((button, index) => {
        if (button.classList.contains('active')) {
            activeIndex = index;
        }
    });

    const newIndex = activeIndex + direction;

    if (newIndex >= 1 && newIndex < buttons.length - 1) {
        buttons.forEach(button => button.classList.remove('active'));
        buttons[newIndex].classList.add('active');
    }
}

function changeDiscountPage(direction) {
    // Simple pagination logic
    const buttons = discountPagination.querySelectorAll('button');
    let activeIndex = 0;

    buttons.forEach((button, index) => {
        if (button.classList.contains('active')) {
            activeIndex = index;
        }
    });

    const newIndex = activeIndex + direction;

    if (newIndex >= 1 && newIndex < buttons.length - 1) {
        buttons.forEach(button => button.classList.remove('active'));
        buttons[newIndex].classList.add('active');
    }
}