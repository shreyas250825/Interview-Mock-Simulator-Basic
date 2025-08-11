// Initialize Firebase (you'll need to add your Firebase config)
// For demo purposes, we'll simulate auth without actual Firebase

let signInButtons;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initAuth();
    initMobileMenu();
    initPricingTabs();
    initSmoothScrolling();
    initScrollHeader();
});

function initAuth() {
    signInButtons = document.querySelectorAll('#signInButton, #heroSignInButton');
    
    signInButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            simulateGoogleSignIn();
        });
    });
}

function simulateGoogleSignIn() {
    // In a real app, this would use Firebase Auth
    // For demo, we'll simulate it with a delay
    
    // Show loading state
    signInButtons.forEach(button => {
        const originalText = button.textContent;
        button.innerHTML = '<span class="spinner"></span> Signing in...';
        button.disabled = true;
        
        // Store original text so we can revert if needed
        button.dataset.originalText = originalText;
    });
    
    // Simulate API call delay
    setTimeout(() => {
        // Store user as signed in
        localStorage.setItem('simuHireUser', 'true');
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Check if user is authenticated on page load
function checkAuth() {
    if (location.pathname !== '/index.html' && location.pathname !== '/') {
        const isAuthenticated = localStorage.getItem('simuHireUser');
        if (!isAuthenticated) {
            window.location.href = 'index.html';
        }
    }
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuButton && mainNav) {
        mobileMenuButton.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuButton.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                mobileMenuButton.classList.remove('active');
            });
        });
    }
}

// Pricing tabs functionality
function initPricingTabs() {
    const pricingTabs = document.querySelectorAll('.pricing-tab');
    
    if (pricingTabs.length > 0) {
        pricingTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                pricingTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // In a real implementation, you would update prices here
                // For demo, we're just toggling the active state
            });
        });
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mainNav = document.querySelector('.main-nav');
                const mobileMenuButton = document.querySelector('.mobile-menu-button');
                if (mainNav && mobileMenuButton) {
                    mainNav.classList.remove('active');
                    mobileMenuButton.classList.remove('active');
                }
            }
        });
    });
}

// Header scroll effect
function initScrollHeader() {
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// Call checkAuth when the page loads
checkAuth();