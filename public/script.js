document.addEventListener('DOMContentLoaded', () => {
    // --- Selectors ---
    const loginToggle = document.getElementById('login-toggle');
    const registerToggle = document.getElementById('register-toggle');
    const formsWrapper = document.querySelector('.forms-wrapper');
    const slider = document.querySelector('.slider');

    // Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Messages
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    // --- State Management ---
    let isLoginView = true;

    // --- Toggle Functions ---
    loginToggle.addEventListener('click', () => {
        if (!isLoginView) {
            isLoginView = true;
            formsWrapper.style.transform = 'translateX(0)';
            loginToggle.classList.add('active');
            registerToggle.classList.remove('active');
            slider.style.transform = 'translateX(0)';
            clearMessages();
        }
    });

    registerToggle.addEventListener('click', () => {
        if (isLoginView) {
            isLoginView = false;
            formsWrapper.style.transform = 'translateX(-50%)';
            registerToggle.classList.add('active');
            loginToggle.classList.remove('active');
            slider.style.transform = 'translateX(100%)';
            clearMessages();
        }
    });

    // --- Helper Functions ---
    function showMessage(element, text, type) {
        element.textContent = text;
        element.className = 'message'; // reset
        if (type === 'success') {
            element.classList.add('success-msg');
        } else {
            element.classList.add('error-msg');
        }

        // Auto-clear after 5 seconds
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
        }, 5000);
    }

    function clearMessages() {
        loginMessage.textContent = '';
        registerMessage.textContent = '';
    }

    // --- API Interactions ---

    // Register Handler
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = e.target['register-username'].value;
        const password = e.target['register-password'].value;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(registerMessage, 'Success! Redirecting to login...', 'success');
                e.target.reset();
                // Switch to login tab after brief delay
                setTimeout(() => {
                    loginToggle.click();
                }, 1500);
            } else {
                showMessage(registerMessage, data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error(error);
            showMessage(registerMessage, 'Server error, please try again later.', 'error');
        }
    });

    // Login Handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = e.target['login-username'].value;
        const password = e.target['login-password'].value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(loginMessage, `Welcome back, ${data.username}!`, 'success');
                e.target.reset();
                // Redirect or update UI for logged in state
                // For this demo, just showing the success message
            } else {
                showMessage(loginMessage, data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error(error);
            showMessage(loginMessage, 'Server error, please try again later.', 'error');
        }
    });
});
