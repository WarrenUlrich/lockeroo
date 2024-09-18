"use strict";
function navigate(event, sectionId) {
    if (event)
        event.preventDefault();
    document.querySelectorAll('.page-section').forEach((section) => {
        section.style.display = 'none';
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    history.replaceState(null, '', '#' + sectionId);
}
async function submitLogin(username, password) {
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            const data = await response.json();
            console.error('Login failed:', data.error);
            return false;
        }
        console.log('Login successful');
        return true;
    }
    catch (error) {
        console.error('Error during login:', error);
        return false;
    }
}
async function submitRegister(email, username, password) {
    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, username, password })
        });
        if (!response.ok) {
            const data = await response.json();
            console.error('Registration failed:', data.error);
            return false;
        }
        console.log('Registration successful');
        return true;
    }
    catch (error) {
        console.error('Error during registration:', error);
        return false;
    }
}
async function logout() {
    try {
        const response = await fetch('/auth/logout', { method: 'POST' });
        if (response.ok) {
            console.log('Logged out successfully');
            navigate(null, 'login');
            await updateNavButtons();
        }
        else {
            console.error('Logout failed');
        }
    }
    catch (error) {
        console.error('Error during logout:', error);
    }
}
async function checkAuthentication() {
    try {
        const response = await fetch('/auth/status', {
            method: 'GET',
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            return data.authenticated;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.error('Error checking authentication status:', error);
        return false;
    }
}
async function updateNavButtons() {
    const isAuthenticated = await checkAuthentication();
    const loginButton = document.querySelector('.nav-button');
    const signUpButton = document.querySelector('.sign-up');
    if (isAuthenticated) {
        loginButton.textContent = 'Account';
        loginButton.onclick = () => navigate(null, 'account');
        signUpButton.textContent = 'Logout';
        signUpButton.onclick = () => logout();
    }
    else {
        loginButton.textContent = 'Login';
        loginButton.onclick = () => navigate(null, 'login');
        signUpButton.textContent = 'Sign Up';
        signUpButton.onclick = () => navigate(null, 'signup');
    }
}
window.addEventListener('load', async () => {
    const sectionId = window.location.hash.substring(1) || 'home';
    navigate(null, sectionId);
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    loginForm?.addEventListener('submit', async function (event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const username = formData.get('username');
        const password = formData.get('password');
        let loggedIn = await submitLogin(username, password);
        if (!loggedIn) {
            console.log('Login failed');
            return;
        }
        await updateNavButtons();
        navigate(null, 'account');
    });
    signupForm?.addEventListener('submit', async function (event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const username = formData.get('new-username');
        const password = formData.get('new-password');
        let registered = submitRegister(email, username, password);
        if (!registered) {
            console.log('Registration failed');
            return;
        }
        navigate(null, 'login');
    });
    await updateNavButtons();
});
window.addEventListener('popstate', () => {
    const sectionId = window.location.hash.substring(1) || 'home';
    navigate(null, sectionId);
});
window.navigate = navigate;
