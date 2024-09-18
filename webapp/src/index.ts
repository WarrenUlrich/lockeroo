function navigate(event: Event | null, sectionId: string): void {
    if (event)
        event.preventDefault();

    // Hide all sections
    document.querySelectorAll('.page-section').forEach((section) => {
        (section as HTMLElement).style.display = 'none';
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        (targetSection as HTMLElement).style.display = 'block';
    }

    // Update the URL hash without causing scroll
    history.replaceState(null, '', '#' + sectionId);
}

// For Login
async function submitLogin(username: string, password: string): Promise<boolean> {
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
    } catch (error) {
        console.error('Error during login:', error);
        return false;
    }
}

// For Register (Sign Up)
async function submitRegister(email: string, username: string, password: string): Promise<boolean> {
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
    } catch (error) {
        console.error('Error during registration:', error);
        return false;
    }
}


async function logout(): Promise<void> {
    try {
        const response = await fetch('/auth/logout', { method: 'POST' }); // Adjust to your logout endpoint
        if (response.ok) {
            console.log('Logged out successfully');
            navigate(null, 'login');
            await updateNavButtons();
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
}


async function checkAuthentication(): Promise<boolean> {
    try {
        const response = await fetch('/auth/status', {
            method: 'GET',
            credentials: 'include' // Ensures cookies are sent with the request
        });

        if (response.ok) {
            const data = await response.json();
            return data.authenticated;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error checking authentication status:', error);
        return false;
    }
}

async function updateNavButtons(): Promise<void> {
    const isAuthenticated = await checkAuthentication();

    const loginButton = document.querySelector('.nav-button') as HTMLButtonElement;
    const signUpButton = document.querySelector('.sign-up') as HTMLButtonElement;

    if (isAuthenticated) {
        // Change "Login" to "Account"
        loginButton.textContent = 'Account';
        loginButton.onclick = () => navigate(null, 'account'); // Make this navigate to the user's account page

        // Change "Sign Up" to "Logout"
        signUpButton.textContent = 'Logout';
        signUpButton.onclick = () => logout(); // Handle the logout functionality
    } else {
        // If the user is not authenticated, keep the default buttons
        loginButton.textContent = 'Login';
        loginButton.onclick = () => navigate(null, 'login');

        signUpButton.textContent = 'Sign Up';
        signUpButton.onclick = () => navigate(null, 'signup');
    }
}

// Handle page load
window.addEventListener('load', async () => {
    const sectionId = window.location.hash.substring(1) || 'home';
    navigate(null, sectionId);

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    loginForm?.addEventListener('submit', async function (event: Event) {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form)

        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        let loggedIn = await submitLogin(username, password);
        if (!loggedIn) {
            console.log('Login failed');
            return;
        }

        await updateNavButtons();

        // Navigate to the desired page after successful login
        navigate(null, 'account');
    });

    signupForm?.addEventListener('submit', async function (event: Event) {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form)

        const email = formData.get('email') as string;
        const username = formData.get('new-username') as string;
        const password = formData.get('new-password') as string;

        let registered = submitRegister(email, username, password);
        if (!registered) {
            console.log('Registration failed');
            return;
        }

        navigate(null, 'login');
    });

    await updateNavButtons();
});


// Handle back/forward navigation
window.addEventListener('popstate', () => {
    const sectionId = window.location.hash.substring(1) || 'home';
    navigate(null, sectionId);
});

// Expose the navigate function to the global scope
(window as any).navigate = navigate;
