let categories = [
    {
        id: 1,
        name: "Anarkali Suits",
        slug: "anarkali-suits",
        description: "Elegant flowy anarkali suits with intricate designs",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YW5hcmthbGklMjBzdWl0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        products: 245,
        status: "active",
        addedOn: "2023-10-15"
    },
    {
        id: 2,
        name: "Lehenga Choli",
        slug: "lehenga-choli",
        description: "Traditional bridal and party wear lehenga choli sets",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bGVoZW5nYSUyMGNob2xpfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        products: 189,
        status: "active",
        addedOn: "2023-10-10"
    },
    {
        id: 3,
        name: "Sharara Suits",
        slug: "sharara-suits",
        description: "Traditional Pakistani sharara suits with dupatta",
        image: "https://images.unsplash.com/photo-1585487000160-6eb9ce6b5aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hhcmFyYSUyMHN1aXRzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        products: 132,
        status: "active",
        addedOn: "2023-10-05"
    },
    {
        id: 4,
        name: "Palazzo Suits",
        slug: "palazzo-suits",
        description: "Comfortable and stylish palazzo suits for casual wear",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGFsYXp6byUyMHN1aXRzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        products: 98,
        status: "active",
        addedOn: "2023-09-28"
    },
    {
        id: 5,
        name: "Saree Gown",
        slug: "saree-gown",
        description: "Modern saree gown fusion for contemporary looks",
        image: "https://images.unsplash.com/photo-1583391721167-9de6b1d5e5a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2FyZWUlMjBnb3dufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        products: 76,
        status: "inactive",
        addedOn: "2023-09-20"
    },
    {
        id: 6,
        name: "Cape Gown",
        slug: "cape-gown",
        description: "Elegant cape gowns for wedding and party occasions",
        image: "https://images.unsplash.com/photo-1585487000160-6eb9ce6b5aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2FwZSUyMGdvd258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        products: 54,
        status: "active",
        addedOn: "2023-09-15"
    }
];

// Auto-generate slug from category name
document.getElementById('categoryName').addEventListener('input', function () {
    const name = this.value;
    const slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');
    document.getElementById('categorySlug').value = slug;
});

let nextId = 7;

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const categoryForm = document.getElementById('categoryForm');
const categoryImage = document.getElementById('categoryImage');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const recentCategoriesTable = document.getElementById('recentCategoriesTable');
const allCategoriesTable = document.getElementById('allCategoriesTable');
const recentEmptyState = document.getElementById('recentEmptyState');
const allEmptyState = document.getElementById('allEmptyState');
const pagination = document.getElementById('pagination');
const totalCategoriesElement = document.getElementById('totalCategories');
const pageTitle = document.getElementById('pageTitle');

// Page management
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page-container').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    document.getElementById(pageName + 'Page').classList.add('active');

    // Update page title
    if (pageName === 'addCategory') {
        pageTitle.textContent = 'Add New Category';
        updateRecentCategoriesTable();
    } else if (pageName === 'viewCategories') {
        pageTitle.textContent = 'View All Categories';
        updateAllCategoriesTable();
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    if (pageName === 'addCategory') {
        document.querySelectorAll('.nav-link')[2].classList.add('active');
    } else if (pageName === 'viewCategories') {
        document.querySelectorAll('.nav-link')[3].classList.add('active');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    // Toggle sidebar for mobile
    menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });


    // Handle image upload preview
    categoryImage.addEventListener('change', function (e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = function (event) {
                previewImage.src = event.target.result;
                imagePreview.style.display = 'block';
            };

            reader.readAsDataURL(file);
        }
    });

   

    // Initialize tables
    updateRecentCategoriesTable();
    updateAllCategoriesTable();
    totalCategoriesElement.textContent = categories.length;
});


// Reset form
function resetForm() {
    categoryForm.reset();
    imagePreview.src = '';
    imagePreview.style.display = 'none';
}

// Update recent categories table
function updateRecentCategoriesTable() {
    // Clear current table
    recentCategoriesTable.innerHTML = '';

    // Get recent categories (first 4)
    const recentCategories = categories.slice(0, 4);

    if (recentCategories.length === 0) {
        recentEmptyState.style.display = 'block';
        return;
    }

    recentEmptyState.style.display = 'none';

    // Populate table
    recentCategories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td><img src="${category.image}" class="category-image" alt="${category.name}"></td>
                    <td>
                        <div class="category-name">${category.name}</div>
                        <div class="category-slug">${category.slug}</div>
                    </td>
                    <td>${category.products}</td>
                    <td><span class="category-status status-${category.status}">${category.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                    <td>${category.addedOn}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-view" onclick="viewCategory(${category.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon btn-edit" onclick="editCategory(${category.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                `;
        recentCategoriesTable.appendChild(row);
    });
}

// Update all categories table
function updateAllCategoriesTable() {
    // Clear current table
    allCategoriesTable.innerHTML = '';

    if (categories.length === 0) {
        allEmptyState.style.display = 'block';
        pagination.style.display = 'none';
        return;
    }

    allEmptyState.style.display = 'none';
    pagination.style.display = 'flex';

    // Populate table
    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>#${category.id}</td>
                    <td><img src="${category.image}" class="category-image" alt="${category.name}"></td>
                    <td>
                        <div class="category-name">${category.name}</div>
                        <div class="category-slug">${category.slug}</div>
                    </td>
                    <td>${category.description.length > 50 ? category.description.substring(0, 50) + '...' : category.description}</td>
                    <td>${category.products}</td>
                    <td><span class="category-status status-${category.status}">${category.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-view" onclick="viewCategory(${category.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon btn-edit" onclick="editCategory(${category.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteCategory(${category.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
        allCategoriesTable.appendChild(row);
    });
}

// Search categories
function searchCategories() {
    const searchTerm = document.getElementById('categorySearch').value.toLowerCase();
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm) ||
        category.description.toLowerCase().includes(searchTerm) ||
        category.slug.toLowerCase().includes(searchTerm)
    );

    // Update table with filtered results
    allCategoriesTable.innerHTML = '';

    if (filteredCategories.length === 0) {
        allEmptyState.style.display = 'block';
        pagination.style.display = 'none';
        return;
    }

    allEmptyState.style.display = 'none';
    pagination.style.display = 'none';

    filteredCategories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>#${category.id}</td>
                    <td><img src="${category.image}" class="category-image" alt="${category.name}"></td>
                    <td>
                        <div class="category-name">${category.name}</div>
                        <div class="category-slug">${category.slug}</div>
                    </td>
                    <td>${category.description.length > 50 ? category.description.substring(0, 50) + '...' : category.description}</td>
                    <td>${category.products}</td>
                    <td><span class="category-status status-${category.status}">${category.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-view" onclick="viewCategory(${category.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon btn-edit" onclick="editCategory(${category.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteCategory(${category.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
        allCategoriesTable.appendChild(row);
    });
}

// Category actions
function viewCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) {
        alert(`Viewing: ${category.name}\nDescription: ${category.description}\nProducts: ${category.products}\nStatus: ${category.status}`);
    }
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
    } else if (type === 'info') {
        notification.style.backgroundColor = 'var(--info)';
    } else {
        notification.style.backgroundColor = 'var(--primary)';
    }

    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-circle';

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