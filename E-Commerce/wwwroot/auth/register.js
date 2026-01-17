// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
});

toggleConfirmPassword.addEventListener('click', function () {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    this.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
});

// Form validation
const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', function (e) {
    // Client-side validation for UX only
    resetErrors();

    let isValid = true;

    // Validate first name
    const firstName = document.getElementById('firstName');
    if (!firstName.value.trim()) {
        showError('firstNameError', 'First name is required');
        firstName.classList.add('input-error');
        isValid = false;
    }

    // Validate last name
    const lastName = document.getElementById('lastName');
    if (!lastName.value.trim()) {
        showError('lastNameError', 'Last name is required');
        lastName.classList.add('input-error');
        isValid = false;
    }

    // Validate email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
        showError('emailError', 'Please enter a valid email address');
        email.classList.add('input-error');
        isValid = false;
    }

    // Validate phone
    const phone = document.getElementById('phone');
    if (phone.value.trim()) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const phoneDigits = phone.value.replace(/\D/g, '');
        if (!phoneRegex.test(phoneDigits) || phoneDigits.length < 10) {
            showError('phoneError', 'Please enter a valid phone number');
            phone.classList.add('input-error');
            isValid = false;
        }
    }

    // Validate password
    const password = passwordInput;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password.value)) {
        showError('passwordError', 'Password must be at least 8 characters with letters and numbers');
        password.classList.add('input-error');
        isValid = false;
    }

    // Validate confirm password
    const confirmPassword = confirmPasswordInput;
    if (confirmPassword.value !== password.value) {
        showError('confirmPasswordError', 'Passwords do not match');
        confirmPassword.classList.add('input-error');
        isValid = false;
    }

    // Validate terms agreement
    const terms = document.getElementById('terms');
    if (!terms.checked) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        isValid = false;
    }

    // If form is invalid, prevent submission
    if (!isValid) {
        e.preventDefault(); // Stop form submission to server
    }
});

// Real-time validation for password match
confirmPasswordInput.addEventListener('input', function () {
    const password = passwordInput.value;
    const confirmPassword = this.value;

    if (confirmPassword && password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        this.classList.add('input-error');
    } else if (confirmPassword) {
        document.getElementById('confirmPasswordError').style.display = 'none';
        this.classList.remove('input-error');
    }
});

// Real-time validation for password strength
passwordInput.addEventListener('input', function () {
    const password = this.value;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (password && !passwordRegex.test(password)) {
        showError('passwordError', 'Password must be at least 8 characters with letters and numbers');
        this.classList.add('input-error');
    } else if (password) {
        document.getElementById('passwordError').style.display = 'none';
        this.classList.remove('input-error');
    }
});

// Helper functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function resetErrors() {
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(element => {
        element.style.display = 'none';
    });

    const inputErrors = document.querySelectorAll('.input-error');
    inputErrors.forEach(element => {
        element.classList.remove('input-error');
    });
}
