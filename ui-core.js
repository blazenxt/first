/**
 * BlazeNXT UI Core Module
 * =======================
 * Handles theme toggling, custom interactive cursors, smooth glassmorphism animations,
 * intersection observers for fade-in animations, counter increments, and notifications/toasts.
 * 
 * @module ui-core
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const UICore = (() => {
    'use strict';

    // Theme Management
    function initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // Load saved theme or system preferred
        const savedTheme = localStorage.getItem('blaze-theme') || 'theme-dark';
        document.body.className = savedTheme;

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.className;
            const newTheme = currentTheme === 'theme-dark' ? 'theme-light' : 'theme-dark';
            document.body.className = newTheme;
            localStorage.setItem('blaze-theme', newTheme);
            showToast(`Theme switched to ${newTheme === 'theme-dark' ? 'Dark' : 'Light'} Mode!`, 'success');
        });
    }

    // Mobile Menu Toggle
    function initMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.querySelector('.nav-links');
        if (!menuToggle || !navLinks) return;

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Intersection Observer for animations
    function initScrollAnimations() {
        const fadeElements = document.querySelectorAll('.fade-in, .fade-up');
        if (!fadeElements.length) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach(el => observer.observe(el));
    }

    // Animated Counters
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'), 10);
                    if (isNaN(target)) return;

                    animateCounter(el, target);
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    }

    function animateCounter(el, target) {
        let count = 0;
        const duration = 2000; // 2 seconds
        const stepTime = Math.max(Math.floor(duration / (target || 1)), 15);
        
        const timer = setInterval(() => {
            if (target === 0) {
                el.textContent = '0';
                clearInterval(timer);
                return;
            }
            
            const increment = Math.ceil(target / 100);
            count += increment;
            
            if (count >= target) {
                el.textContent = formatNumber(target);
                clearInterval(timer);
            } else {
                el.textContent = formatNumber(count);
            }
        }, stepTime);
    }

    function formatNumber(num) {
        if (typeof Utils !== 'undefined' && Utils.Format) {
            return Utils.Format.number(num);
        }
        if (num >= 1e3) return (num / 1e3).toFixed(0) + 'K';
        return num.toString();
    }

    // Toast Notifications
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fade-in p-4 mb-3 rounded-lg shadow-lg text-white font-medium flex justify-between items-center`;
        
        // Simple inline styling / mapping for background colors
        const bgColors = {
            success: 'bg-green-600 border border-green-500',
            error: 'bg-red-600 border border-red-500',
            warning: 'bg-yellow-600 border border-yellow-500',
            info: 'bg-cyan-600 border border-cyan-500'
        };
        toast.className += ` ${bgColors[type] || bgColors.info}`;
        
        toast.innerHTML = `
            <span>${message}</span>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // Simulate skeleton loader removal
    function initSkeletonLoader() {
        const skeleton = document.getElementById('heroSkeleton');
        const content = document.getElementById('heroContent');
        if (!skeleton || !content) return;

        // Simulate 1s loading time
        setTimeout(() => {
            skeleton.style.display = 'none';
            content.classList.remove('hidden');
            // Trigger animation
            const heroTitle = content.querySelector('.hero-title');
            if (heroTitle) heroTitle.classList.add('visible');
        }, 1200);
    }

    // Initialize custom cursor (Optional, nice UX)
    function initCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Hover effect for links
        const interactiveElements = document.querySelectorAll('a, button, [role="button"], .cursor-pointer');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    return Object.freeze({
        init() {
            initTheme();
            initMobileMenu();
            initScrollAnimations();
            initCounters();
            initSkeletonLoader();
            try {
                initCustomCursor();
            } catch (e) {
                // Ignore cursor issues if run in legacy browser or test env
            }
            console.log('✓ BlazeNXT UI Core initialized successfully');
        },
        showToast
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UICore;
}
