document.addEventListener('DOMContentLoaded', () => {
    // --- Selectors ---
    const loginToggle = document.getElementById('login-toggle');
    const registerToggle = document.getElementById('register-toggle');
    const formsWrapper = document.querySelector('.forms-wrapper');
    const slider = document.querySelector('.slider');
    
    // Panels
    const usersPanel = document.getElementById('users-panel');
    const usersList = document.getElementById('users-list');
    const refreshBtn = document.getElementById('refresh-users');

    // Modal
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const closeModal = document.querySelector('.close-modal');
    const editUserIdInput = document.getElementById('edit-user-id');
    const editUsernameInput = document.getElementById('edit-username');
    const editPasswordInput = document.getElementById('edit-password');

    // Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Messages
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    // --- State Management ---
    let isLoginView = true;

    // --- Modal Functions ---
    function openEditModal(user) {
        editUserIdInput.value = user._id;
        editUsernameInput.value = user.username;
        editPasswordInput.value = ''; // Don't show password
        editModal.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => {
        editModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === editModal) editModal.classList.add('hidden');
    });

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

    // Fetch and display users
    async function fetchUsers() {
        try {
            const response = await fetch('/api/users');
            const users = await response.json();
            
            usersList.innerHTML = ''; // Clear current list

            if (users.length === 0) {
                usersList.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.3); margin-top:2rem">Aucun utilisateur trouvé</p>';
                return;
            }

            users.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'user-item';
                const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
                
                userCard.innerHTML = `
                    <div class="user-info">
                        <span class="user-name">${user.username} <i class="fas fa-check-circle" style="color:var(--primary-color); font-size:0.7rem; margin-top:-5px"></i></span>
                        <span class="user-date"><i class="far fa-calendar-alt"></i> Inscrit le ${date}</span>
                    </div>
                    <div class="actions">
                        <button class="action-btn edit-btn" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Supprimer">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;

                // Add listeners to individual buttons in the card
                userCard.querySelector('.edit-btn').addEventListener('click', () => openEditModal(user));
                userCard.querySelector('.delete-btn').addEventListener('click', () => deleteUser(user._id));

                usersList.appendChild(userCard);
            });

        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Update User Handler
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editUserIdInput.value;
        const username = editUsernameInput.value;
        const password = editPasswordInput.value;

        const body = { username };
        if (password) body.password = password;

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                editModal.classList.add('hidden');
                fetchUsers();
                alert('Success: ' + data.message);
            } else {
                alert('Erreur: ' + (data.message || 'Échec de la modification'));
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    });

    // Delete user
    async function deleteUser(userId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchUsers(); // Refresh list
            } else {
                const data = await response.json();
                alert(data.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    }

    // Refresh button
    refreshBtn.addEventListener('click', fetchUsers);

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
                showMessage(registerMessage, 'Success! Redirection vers login...', 'success');
                e.target.reset();
                setTimeout(() => {
                    loginToggle.click();
                }, 1500);
                
                // If the panel is visible, refresh the list
                if (!usersPanel.classList.contains('hidden')) {
                    fetchUsers();
                }
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
                
                // Show users panel and fetch data
                usersPanel.classList.remove('hidden');
                fetchUsers();
                
            } else {
                showMessage(loginMessage, data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error(error);
            showMessage(loginMessage, 'Server error, please try again later.', 'error');
        }
    });

});
