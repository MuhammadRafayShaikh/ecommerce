// Featured Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Animate featured cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animation for each item
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, index * 100);
            }
        });
    }, observerOptions);

    // Observe all featured cards
    const featuredCards = document.querySelectorAll('.featured-card');
    featuredCards.forEach(card => {
        observer.observe(card);
    });

    // Add to cart functionality
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('cart-btn') ||
            e.target.classList.contains('spotlight-btn') && e.target.classList.contains('cart') ||
            e.target.classList.contains('featured-btn') && e.target.classList.contains('cart')) {

            const button = e.target;
            const productCard = button.closest('.spotlight-card, .featured-card');
            const productName = productCard?.querySelector('h3')?.textContent || "Product";
            const productId = button.getAttribute('data-product-id');

            alert(`Added to cart: ${productName}\n\nThis item has been added to your shopping cart.`);

            // In your actual implementation, this would be an AJAX call to add to cart
            // Example:
            // if (productId) {
            //     fetch('/Cart/AddToCart', {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //         },
            //         body: JSON.stringify({ productId: productId })
            //     })
            //     .then(response => response.json())
            //     .then(data => {
            //         if (data.success) {
            //             // Show success message
            //             // Update cart count
            //             updateCartCount(data.cartCount);
            //         }
            //     });
            // }
        }
    });

    // View details functionality
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('view-btn') ||
            (e.target.classList.contains('spotlight-btn') && e.target.classList.contains('view')) ||
            (e.target.classList.contains('featured-btn') && e.target.classList.contains('view'))) {

            const button = e.target;
            const productCard = button.closest('.spotlight-card, .featured-card');
            const productName = productCard?.querySelector('h3')?.textContent || "Product";
            const productId = button.getAttribute('data-product-id') ||
                productCard?.querySelector('.cart-btn')?.getAttribute('data-product-id');

            // In your actual implementation, this would navigate to the detail page
            // Example:
            // if (productId) {
            //     window.location.href = `/Detail/Index/${productId}`;
            // } else {
            //     alert(`Viewing details for: ${productName}\n\nIn the actual application, this would navigate to the product detail page.`);
            // }

            // For now, show alert
            alert(`Viewing details for: ${productName}\n\nIn the actual application, this would navigate to the product detail page.`);
        }
    });

    // Color selection functionality
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('color-dot')) {
            const colorDot = e.target;
            const colorDots = colorDot.parentElement.querySelectorAll('.color-dot');

            colorDots.forEach(dot => {
                dot.style.border = '2px solid white';
            });

            colorDot.style.border = '2px solid #b76e79';

            // In your actual implementation, this would update the product image/price based on color selection
            const colorName = colorDot.getAttribute('title');
            const colorPrice = colorDot.getAttribute('data-color-price');

            // Update price if needed
            const priceElement = colorDot.closest('.featured-card')?.querySelector('.featured-price');
            if (priceElement && colorPrice) {
                // You would need the base price to calculate the new price
                // const basePrice = parseFloat(priceElement.textContent.replace('₹', ''));
                // const extraPrice = parseFloat(colorPrice);
                // priceElement.textContent = `₹${(basePrice + extraPrice).toFixed(2)}`;
            }

            // Show selection feedback
            console.log(`Selected color: ${colorName}, Extra price: ₹${colorPrice}`);
        }
    });

    // Pagination functionality
    document.querySelectorAll('.pagination a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all pagination links
            document.querySelectorAll('.pagination a').forEach(a => {
                a.classList.remove('active');
            });

            // Add active class to clicked link (if it's a number)
            if (!this.classList.contains('prev') && !this.classList.contains('next')) {
                this.classList.add('active');
            }

            // In your actual implementation, this would load the corresponding page of products
            const pageNum = this.textContent;

            // For now, scroll to top of products
            if (document.querySelector('#latestProducts')) {
                document.querySelector('#latestProducts').scrollIntoView({ behavior: 'smooth' });
            }

            console.log(`Loading page ${pageNum} of products...`);
        });
    });

    // Function to update cart count
    function updateCartCount(count) {
        const cartCountElement = document.getElementById('count-text');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
    }
});

// Featured Page JavaScript - Highlight Product Feature
document.addEventListener('DOMContentLoaded', function () {
    // Get the highlighted product from URL query parameter
    function getHighlightedProductFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('highlightedProduct');
    }

    // Highlight the corresponding product
    function highlightProduct(productType) {
        if (!productType) return;

        // Find the product card with matching data attribute
        const productCard = document.querySelector(`.spotlight-card[data-product-type="${productType}"]`);

        if (productCard) {
            // Add highlight class
            productCard.classList.add('highlighted');

            // Scroll to the highlighted product
            setTimeout(() => {
                productCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 300);

            // Remove highlight after 3 seconds
            setTimeout(() => {
                productCard.classList.remove('highlighted');
            }, 3000);
        }

        // Also check in featured grid for Latest Products and Best Price Deals
        // You can add similar logic for other sections if needed
    }

    // Check if there's a product to highlight
    const highlightedProduct = getHighlightedProductFromURL();

    // Wait a bit for page to load completely, then highlight
    setTimeout(() => {
        highlightProduct(highlightedProduct);
    }, 500);

    // Existing code for animations...
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, index * 100);
            }
        });
    }, observerOptions);

    const featuredCards = document.querySelectorAll('.featured-card');
    featuredCards.forEach(card => {
        observer.observe(card);
    });

    // Existing add to cart functionality...
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('cart-btn') ||
            e.target.classList.contains('spotlight-btn') && e.target.classList.contains('cart') ||
            e.target.classList.contains('featured-btn') && e.target.classList.contains('cart')) {

            const button = e.target;
            const productCard = button.closest('.spotlight-card, .featured-card');
            const productName = productCard?.querySelector('h3')?.textContent || "Product";

            // Get product type for tracking
            const productType = productCard.getAttribute('data-product-type') || '';

            alert(`Added to cart: ${productName}\n\nThis item has been added to your shopping cart.`);

            // Your existing AJAX call code here...
        }
    });

    // Existing view details functionality...
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('view-btn') ||
            (e.target.classList.contains('spotlight-btn') && e.target.classList.contains('view')) ||
            (e.target.classList.contains('featured-btn') && e.target.classList.contains('view'))) {

            const button = e.target;
            const productCard = button.closest('.spotlight-card, .featured-card');
            const productName = productCard?.querySelector('h3')?.textContent || "Product";

            alert(`Viewing details for: ${productName}\n\nIn the actual application, this would navigate to the product detail page.`);
        }
    });

    // Existing color selection functionality...
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('color-dot')) {
            const colorDot = e.target;
            const colorDots = colorDot.parentElement.querySelectorAll('.color-dot');

            colorDots.forEach(dot => {
                dot.style.border = '2px solid white';
            });

            colorDot.style.border = '2px solid #b76e79';

            const colorName = colorDot.getAttribute('title');
            console.log(`Selected color: ${colorName}`);
        }
    });

    // Existing pagination functionality...
    document.querySelectorAll('.pagination a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelectorAll('.pagination a').forEach(a => {
                a.classList.remove('active');
            });

            if (!this.classList.contains('prev') && !this.classList.contains('next')) {
                this.classList.add('active');
            }

            const pageNum = this.textContent;
            console.log(`Loading page ${pageNum} of products...`);
        });
    });
});