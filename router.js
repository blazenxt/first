/**
 * BlazeNXT Client-Side SPA Router
 * ================================
 * Seamless SPA router that intercepts hash changes, supports prefetching,
 * executes smooth transition animations, and dynamically fetches and injects page content.
 * 
 * @module router
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const SPARouter = (() => {
    'use strict';

    // Routes mapping
    const routes = {
        '': 'index',
        '#': 'index',
        '#index': 'index',
        '#about': 'about',
        '#projects': 'projects',
        '#contact': 'contact',
        '#admin': 'admin'
    };

    // Cache to hold fetched pages
    const pageCache = new Map();

    // DOM containers
    let mainContainer = null;
    let originalHomeContent = null;

    /**
     * Store original index.html content to easily restore Home view
     */
    function storeHomeContent() {
        const hero = document.getElementById('hero');
        const features = document.getElementById('features');
        const aiServices = document.getElementById('aiServices');
        const stats = document.getElementById('stats');
        const performance = document.getElementById('performance');
        const cta = document.getElementById('ctaSection');

        originalHomeContent = {
            hero: hero ? hero.outerHTML : '',
            features: features ? features.outerHTML : '',
            aiServices: aiServices ? aiServices.outerHTML : '',
            stats: stats ? stats.outerHTML : '',
            performance: performance ? performance.outerHTML : '',
            cta: cta ? cta.outerHTML : ''
        };
    }

    /**
     * Restore original index.html content
     */
    function restoreHomeView() {
        // Clear dynamically injected content and show original index structures
        const container = getOrCreateContainer();
        container.innerHTML = `
            ${originalHomeContent.hero}
            ${originalHomeContent.features}
            ${originalHomeContent.aiServices}
            ${originalHomeContent.stats}
            ${originalHomeContent.performance}
            ${originalHomeContent.cta}
        `;
        
        // Re-run UI animations/initializations if UI Core exists
        if (typeof UICore !== 'undefined') {
            UICore.init();
        }
    }

    /**
     * Create or retrieve dynamic view wrapper container
     */
    function getOrCreateContainer() {
        if (!mainContainer) {
            // Find container of sections or body
            mainContainer = document.querySelector('body');
        }
        return mainContainer;
    }

    /**
     * Update active navigation link
     */
    function updateActiveNav(routeName) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const dataPage = link.getAttribute('data-page');
            if (dataPage === routeName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Load a route dynamically
     */
    async function loadRoute(hash) {
        const routeName = routes[hash] || '404';
        console.log(`[Router] Loading route: ${routeName}`);

        updateActiveNav(routeName);

        if (typeof Analytics !== 'undefined') {
            Analytics.trackPageView(routeName);
        }

        const container = getOrCreateContainer();

        // Fade out transition
        container.style.opacity = '0.3';
        container.style.transition = 'opacity 0.2s ease-in-out';

        setTimeout(async () => {
            try {
                if (routeName === 'index') {
                    restoreHomeView();
                } else {
                    let content = '';
                    if (pageCache.has(routeName)) {
                        content = pageCache.get(routeName);
                    } else {
                        const response = await fetch(`${routeName}.html`);
                        if (!response.ok) {
                            throw new Error(`Failed to load ${routeName}.html`);
                        }
                        const rawHtml = await response.text();
                        
                        // Parse content inside body or specific container
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(rawHtml, 'text/html');
                        const mainSection = doc.querySelector('main') || doc.querySelector('body');
                        content = mainSection ? mainSection.innerHTML : rawHtml;
                        
                        // Cache for faster subsequent loading
                        pageCache.set(routeName, content);
                    }

                    // Keep navbar and footer intact, only replace interior content
                    // Let's replace elements from index.html that are not navbar and footer
                    const nav = document.getElementById('navbar');
                    const footer = document.getElementById('footer');
                    const toast = document.getElementById('toastContainer');
                    const scripts = document.querySelectorAll('script');

                    container.innerHTML = '';
                    if (nav) container.appendChild(nav);
                    
                    const mainWrap = document.createElement('main');
                    mainWrap.className = 'route-container py-24 min-h-screen';
                    mainWrap.innerHTML = content;
                    container.appendChild(mainWrap);

                    if (footer) container.appendChild(footer);
                    if (toast) container.appendChild(toast);
                    scripts.forEach(script => container.appendChild(script));
                }

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Execute UI initializations on new content
                if (routeName !== 'index' && typeof UICore !== 'undefined') {
                    // Reinitialize animations and observers
                    const fadeElements = document.querySelectorAll('.fade-in, .fade-up');
                    const observer = new IntersectionObserver((entries, obs) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('visible');
                                obs.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.1 });
                    fadeElements.forEach(el => observer.observe(el));
                }

            } catch (error) {
                console.error('[Router] Error loading route:', error);
                container.innerHTML = `
                    <div class="container text-center py-40">
                        <h1 class="text-6xl font-bold mb-4 gradient-text">404</h1>
                        <p class="text-2xl text-gray-400 mb-8">Page Not Found or Failed to Load</p>
                        <a href="#" class="btn btn-primary px-8 py-3">Return Home</a>
                    </div>
                `;
            } finally {
                // Fade in transition
                container.style.opacity = '1';
            }
        }, 200);
    }

    /**
     * Prefetch pages for zero-latency loading
     */
    function initPrefetch() {
        const prefetchLinks = document.querySelectorAll('[data-prefetch="true"]');
        prefetchLinks.forEach(link => {
            link.addEventListener('mouseenter', async () => {
                const hash = link.getAttribute('href');
                const routeName = routes[hash];
                if (routeName && routeName !== 'index' && !pageCache.has(routeName)) {
                    try {
                        const response = await fetch(`${routeName}.html`);
                        if (response.ok) {
                            const rawHtml = await response.text();
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(rawHtml, 'text/html');
                            const mainSection = doc.querySelector('main') || doc.querySelector('body');
                            const content = mainSection ? mainSection.innerHTML : rawHtml;
                            pageCache.set(routeName, content);
                            console.log(`[Router] Prefetched: ${routeName}.html`);
                        }
                    } catch (e) {
                        // Silent prefetch failure
                    }
                }
            }, { once: true });
        });
    }

    return Object.freeze({
        init() {
            storeHomeContent();
            
            // Listen for hash changes
            window.addEventListener('hashchange', () => {
                loadRoute(window.location.hash);
            });

            // Initial load
            loadRoute(window.location.hash);

            // Setup prefetching
            initPrefetch();
            console.log('✓ BlazeNXT SPA Router initialized successfully');
        }
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SPARouter;
}
