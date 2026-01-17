// Sales Page Functionality
document.addEventListener('DOMContentLoaded', function () {
    // Sale Countdown Timer
    function updateSaleTimer() {
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + 7); // Sale ends in 7 days

        const timeRemaining = endDate - now;

        if (timeRemaining > 0) {
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            document.getElementById('countdown').textContent =
                `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            document.getElementById('countdown').textContent = 'Sale Ended!';
            document.getElementById('saleTimer').style.color = '#ff4757';
        }
    }

    // Update timer every second
    setInterval(updateSaleTimer, 1000);
    updateSaleTimer();

    // Discount Filter Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const productCards = document.querySelectorAll('.sale-product-card');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            const filter = this.dataset.filter;

            // Show/hide products based on filter
            productCards.forEach(card => {
                if (filter === 'all' || card.dataset.discountGroup === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Quick View Functionality
    const quickViewButtons = document.querySelectorAll('.quick-view');
    quickViewButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.dataset.productId;

            // In real implementation, this would open a modal or navigate to product detail
            alert(`Quick view for product ID: ${productId}\n\nIn actual implementation, this would open a product quick view modal.`);

            // Example AJAX call for quick view:
            /*
            fetch(`/api/products/${productId}/quickview`)
                .then(response => response.json())
                .then(data => {
                    // Show quick view modal with product details
                    showQuickViewModal(data);
                });
            */
        });
    });

    // Add to Cart Functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.dataset.productId;
            const productCard = this.closest('.sale-product-card');
            const productName = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.discounted-price').textContent;

            // Show confirmation
            showNotification(`${productName} added to cart!`, 'success');

            // Add animation to button
            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            this.style.background = 'linear-gradient(135deg, #6bcf7f, #4caf50)';

            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
                this.style.background = 'linear-gradient(135deg, var(--dark-brown), #4a352f)';
            }, 2000);

            // In real implementation, make AJAX call to add to cart
            /*
            fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: 1
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update cart count
                    updateCartCount(data.cartCount);
                }
            });
            */
        });
    });

    // Newsletter Form Submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (email) {
                // Show success message
                showNotification('Thank you! You\'ll receive sale alerts soon.', 'success');
                emailInput.value = '';

                // In real implementation, submit to backend
                /*
                fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email })
                });
                */
            }
        });
    }

    // View Details Button - Already handled by anchor tag

    // Notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Add notification styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    z-index: 9999;
                    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
                    border-left: 4px solid #4caf50;
                }
                .notification-success { border-left-color: #4caf50; }
                .notification-info { border-left-color: #2196f3; }
                .notification-error { border-left-color: #ff4757; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .notification-content i {
                    font-size: 1.2rem;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    to { opacity: 0; transform: translateX(100%); }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Update cart count function (to be called when cart is updated)
    function updateCartCount(count) {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
    }

    // Animate product cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, { threshold: 0.1 });

    productCards.forEach(card => {
        observer.observe(card);
    });
});