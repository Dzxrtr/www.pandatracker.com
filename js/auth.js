// ===== Authentication JavaScript =====

const API_BASE_URL = 'http://localhost:5000/api';

// Toggle between Sign Up and Sign In forms
function toggleForms() {
    const signupForm = document.querySelector('.signup-form');
    const signinForm = document.querySelector('.signin-form');
    
    signupForm.classList.toggle('active');
    signinForm.classList.toggle('active');
}

// Initialize date
function initializeDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Sign Up Handler
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const newsletter = document.getElementById('newsletter').checked;
    
    // Validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
                subscribe_newsletter: newsletter
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Store user info and token
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            
            alert('Account created successfully! Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'Failed to create account'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error. Using local storage instead.');
        
        // Fallback to local storage
        const user = {
            id: Date.now().toString(),
            name,
            email,
            subscribe_newsletter: newsletter
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'local_token_' + Date.now());
        localStorage.setItem('userId', user.id);
        
        window.location.href = 'dashboard.html';
    }
});

// Sign In Handler
document.getElementById('signinForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const remember = document.getElementById('remember').checked;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Store user info and token
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            
            if (remember) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            alert('Signed in successfully! Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'Invalid credentials'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error. Please try again.');
        
        // Fallback: check if email exists in local storage
        const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        const user = existingUsers.find(u => u.email === email);
        
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', 'local_token_' + Date.now());
            localStorage.setItem('userId', user.id);
            window.location.href = 'dashboard.html';
        } else {
            alert('User not found. Please sign up first.');
        }
    }
});

// Newsletter Subscription Handler
document.getElementById('newsletterForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('newsletter-email').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            alert('✅ Subscribed to PandaSave newsletter!');
            document.getElementById('newsletterForm').reset();
        } else {
            alert('Failed to subscribe. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('✅ Subscription saved locally!');
        
        // Fallback to local storage
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
        subscribers.push({
            email,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
        document.getElementById('newsletterForm').reset();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDate();
    
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user && window.location.pathname.includes('index.html')) {
        // Optional: Redirect already logged-in users away from auth page
        // window.location.href = 'dashboard.html';
    }
});
