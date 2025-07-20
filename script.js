// script.js

document.addEventListener('DOMContentLoaded', () => {
    // ===== Constants & Selectors =====
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const backButton = document.getElementById('backButton');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const authModal = document.getElementById('auth-modal');
    const authClose = document.getElementById('authClose');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const contentAfterLogin = document.getElementById('content-after-login');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    const messageSignup = document.getElementById('signup-message');
    const messageLoginError = document.getElementById('login-error-message');
    const signupLoading = document.getElementById('signup-loading');
    const loginLoading = document.getElementById('login-loading');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const spinnerOverlay = document.getElementById('spinner-overlay');

    const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4GMxt0zQ8EaD05Hof-fn1dPi3_qxbBRqJ12tfGZUrFKv6uzhYdmsme2tIczchdx-u/exec';

    // ===== Navigation History Stack =====
    let navigationStack = ['home']; // Initialize with default section

    // ===== Initialization =====
    init();

    function init() {
        setupEventListeners();
        checkLoginStatus();
        showSection('home'); // Default section

        // Initialize back button detection for mobile devices
        if (isMobileDevice()) {
            setupPhysicalBackButtonDetection();
        }
    }

    // ===== Event Listeners Setup =====
    function setupEventListeners() {
        navLinks.forEach(link => {
            link.addEventListener('click', onNavLinkClick);
        });

        hamburger.addEventListener('click', toggleMobileMenu);

        backButton?.addEventListener('click', (e) => {
            e.preventDefault();
            navigateBack();
        });

        openLoginBtn?.addEventListener('click', openAuthModal);
        authClose?.addEventListener('click', closeAuthModal);

        showSignup?.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthForms('signup');
        });

        showLogin?.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthForms('login');
        });

        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', togglePasswordVisibility);
        });

        loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });

        signupForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            await signup(email, password);
        });

        authModal?.addEventListener('click', (e) => {
            if (e.target === authModal) closeAuthModal();
        });

        logoutBtn?.addEventListener('click', () => {
            const email = localStorage.getItem('userEmail');
            recordActivity(email, 'Logout');
            logout();
        });

        refreshBtn?.addEventListener('click', handleRefresh);

        setupContactCards();
    }

    // ===== Navigation Handlers =====
    function onNavLinkClick(e) {
        e.preventDefault();
        const sectionId = this.getAttribute('data-section');
        navigateTo(sectionId);
        if (navMenu.classList.contains('active')) toggleMobileMenu();
    }

    function navigateTo(sectionId) {
        // Don't push to stack if we're already on this section
        if (navigationStack[navigationStack.length - 1] !== sectionId) {
            navigationStack.push(sectionId);
        }
        showSection(sectionId);
    }

    function navigateBack() {
        if (navigationStack.length > 1) {
            navigationStack.pop(); // Remove current section
            const previousSection = navigationStack[navigationStack.length - 1];
            showSection(previousSection);
        } else {
            // If no more history, default to home
            navigationStack = ['home'];
            showSection('home');
        }
    }

    function showSection(sectionId) {
        const contentSections = document.querySelectorAll('.content-section');
        const navLinks = document.querySelectorAll('.nav-link');
        const footer = document.querySelector('footer.footer');

        contentSections.forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });

        // Kontrol footer hanya tampil di home
        if (footer) {
            if (sectionId === 'home') {
                footer.style.display = 'block';  // Tampilkan footer
            } else {
                footer.style.display = 'none';   // Sembunyikan footer
            }
        }
    }

    // ===== Physical Back Button Detection =====
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function setupPhysicalBackButtonDetection() {
        // Handle popstate (browser back/forward buttons)
        window.addEventListener('popstate', () => {
            navigateBack();
        });

        // For Android physical back button
        document.addEventListener('backbutton', handlePhysicalBackButton, false);

        // For other devices that might not trigger 'backbutton' event
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' || e.key === 'Escape') {
                handlePhysicalBackButton();
            }
        });
    }

    function handlePhysicalBackButton() {
        // Close modal if open
        if (authModal.classList.contains('active')) {
            closeAuthModal();
            return;
        }

        // Close mobile menu if open
        if (navMenu.classList.contains('active')) {
            toggleMobileMenu();
            return;
        }

        // Default back navigation
        navigateBack();
    }

    // ===== Mobile Menu =====
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active'));
    }

    // ===== Auth Modal =====
    function openAuthModal() {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeAuthModal() {
        authModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        clearMessages();
    }

    function toggleAuthForms(form) {
        if (form === 'signup') {
            loginSection.classList.remove('active');
            signupSection.classList.add('active');
        } else {
            signupSection.classList.remove('active');
            loginSection.classList.add('active');
        }
        clearMessages();
    }

    function clearMessages() {
        if (messageSignup) {
            messageSignup.textContent = '';
            messageSignup.style.color = '';
        }
        if (messageLoginError) {
            messageLoginError.textContent = '';
        }
    }

    function togglePasswordVisibility() {
        const input = this.previousElementSibling;
        const icon = this.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility_off';
        }
    }

    // ===== Login & Signup =====
    async function handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        messageLoginError.textContent = '';
        loginLoading.style.display = 'flex';

        try {
            const formData = new FormData();
            formData.append('action', 'login');
            formData.append('email', email);
            formData.append('password', password);

            const response = await fetch(APP_SCRIPT_URL, { method: 'POST', body: formData });
            const result = await response.json();

            if (result.result === 'success') {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                showContentAfterLogin();
                closeAuthModal();
                // Reset navigation stack after login
                navigationStack = ['content-after-login'];
            } else {
                messageLoginError.textContent = result.message || 'Invalid email or password';
            }
        } catch (error) {
            console.error('Login error:', error);
            messageLoginError.textContent = 'Terjadi kesalahan koneksi atau server.';
        } finally {
            loginLoading.style.display = 'none';
        }
    }

    async function signup(email, password) {
        if (!email || !password) {
            if (messageSignup) {
                messageSignup.textContent = 'Email dan password harus diisi.';
                messageSignup.style.color = 'red';
            }
            return;
        }

        signupLoading.style.display = 'flex';

        try {
            const response = await fetch(`${APP_SCRIPT_URL}?action=signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email, password }),
            });

            const result = await response.json();

            if (result.result === 'success' || result.success) {
                signupLoading.style.display = 'none';

                setTimeout(() => {
                    toggleAuthForms('login');
                    clearMessages();
                }, 3000);
            }
        } catch (error) {
            console.error(error);
            if (messageSignup) {
                messageSignup.textContent = 'Terjadi kesalahan koneksi atau server.';
                messageSignup.style.color = 'red';
            }
        } finally {
            signupLoading.style.display = 'none';
        }
    }

    // ===== User Login Status =====
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            showContentAfterLogin();
        } else {
            hideContentAfterLogin();
        }
    }

    function showContentAfterLogin() {
        contentSections.forEach(section => section.classList.remove('active'));
        if (contentAfterLogin) contentAfterLogin.classList.add('active');

        const footer = document.querySelector('footer.footer');
        if (footer) footer.style.display = 'none';  // sembunyikan footer

        // Reset navigation stack
        navigationStack = ['content-after-login'];
    }

    function hideContentAfterLogin() {
        contentAfterLogin?.classList.remove('active');
        document.getElementById('home')?.classList.add('active');
        // Reset navigation stack
        navigationStack = ['home'];
    }

    // ===== Logout =====
    function logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userToken');
        hideContentAfterLogin();
        showSection('home');
    }

    // ===== User Activity Logging =====
    async function recordActivity(email, action) {
        try {
            const formData = new FormData();
            formData.append('action', 'recordActivity');
            formData.append('email', email);
            formData.append('activity', action);
            formData.append('timestamp', new Date().toISOString());

            await fetch(APP_SCRIPT_URL, { method: 'POST', body: formData });
        } catch (error) {
            console.error('Activity log error:', error);
        }
    }

    // ===== Contact Cards Setup =====
    function setupContactCards() {
        document.querySelector('.whatsapp-card')?.addEventListener('click', () => {
            window.open('https://wa.me/6285158838350', '_blank');
        });
        document.querySelector('.email-card')?.addEventListener('click', () => {
            window.location.href = 'mailto:ai.deep9077@gmail.com';
        });
        document.querySelector('.phone-card')?.addEventListener('click', () => {
            window.location.href = 'tel:+6285158838350';
        });
        document.querySelector('.map-card')?.addEventListener('click', () => {
            window.open('https://www.google.com/maps?q=-7.996981,111.579455', '_blank');
        });
    }

    // ===== Refresh Handler =====
    function handleRefresh() {
        spinnerOverlay.style.display = 'flex';

        const iframe = document.querySelector('#content-after-login iframe');
        if (iframe) {
            iframe.onload = () => {
                spinnerOverlay.style.display = 'none';
            };
            iframe.src = iframe.src; // Trigger reload
        } else {
            // Fallback in case iframe doesn't exist
            setTimeout(() => {
                spinnerOverlay.style.display = 'none';
            }, 1500);
        }
    }
});