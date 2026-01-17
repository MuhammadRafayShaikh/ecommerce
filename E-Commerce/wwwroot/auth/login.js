// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;

    this.innerHTML =
        type === 'password'
            ? '<i class="far fa-eye"></i>'
            : '<i class="far fa-eye-slash"></i>';
});

// Client-side validation only
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function (e) {

    let isValid = true;
    resetErrors();

    const email = document.getElementById('email');
    const password = document.getElementById('password');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.value.trim())) {
        showError('emailError', 'Please enter a valid email address');
        email.classList.add('input-error');
        isValid = false;
    }

    if (!password.value.trim()) {
        showError('passwordError', 'Password is required');
        password.classList.add('input-error');
        isValid = false;
    }

    // ❗ agar validation fail ho → form submit mat karo
    if (!isValid) {
        e.preventDefault();
    }
});

// Helpers
function showError(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.style.display = 'block';
}

function resetErrors() {
    document.querySelectorAll('.error').forEach(e => e.style.display = 'none');
    document.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));
}
