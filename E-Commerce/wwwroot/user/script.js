// Header and Dropdown Functionality
document.addEventListener('DOMContentLoaded', function () {
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const userDropdown = document.querySelector('.user-dropdown');

    // ===== MOBILE MENU TOGGLE =====
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Toggle mobile menu
            navMenu.classList.toggle('active');

            // Toggle menu icon
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }

            // Close user dropdown if open
            if (userDropdown && userDropdown.classList.contains('active')) {
                userDropdown.classList.remove('active');
            }
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // ===== USER DROPDOWN FUNCTIONALITY =====
    if (userDropdown) {
        const userProfile = userDropdown.querySelector('.user-profile');

        if (userProfile) {
            userProfile.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Toggle dropdown
                userDropdown.classList.toggle('active');

                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (menuToggle) {
                        menuToggle.querySelector('i').classList.remove('fa-times');
                        menuToggle.querySelector('i').classList.add('fa-bars');
                    }
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (userDropdown && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && userDropdown.classList.contains('active')) {
                userDropdown.classList.remove('active');
            }
        });
    }

    // ===== HEADER SCROLL EFFECT =====
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ===== CLOSE DROPDOWNS ON WINDOW RESIZE =====
    window.addEventListener('resize', function () {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            if (menuToggle) {
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            }
        }

        // Close user dropdown on mobile when switching to desktop
        if (window.innerWidth > 768 && userDropdown) {
            userDropdown.classList.remove('active');
        }
    });

    // ===== SEARCH ICON FUNCTIONALITY (Placeholder) =====
    const searchIcon = document.querySelector('.search-icon');
    if (searchIcon) {
        searchIcon.addEventListener('click', function (e) {
            e.preventDefault();
            // You can add search functionality here
            console.log('Search clicked');
            // Example: window.location.href = '/search';
        });
    }

    // ===== INITIAL HEADER STATE =====
    // Set initial scroll state
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }
});