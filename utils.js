/**
 * BlazeNXT Utility Library
 * =======================
 * Commonly used helper functions for security, string/date formatting,
 * DOM helper functions, performance helpers (debounce, throttle), etc.
 * 
 * @module utils
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const Utils = (() => {
    'use strict';

    /**
     * DOM Helpers
     */
    const DOM = {
        /**
         * Find an element by selector
         * @param {string} selector - CSS Selector
         * @param {Element} [context=document] - Search context
         * @returns {Element|null} The found element
         */
        $(selector, context = document) {
            return context.querySelector(selector);
        },

        /**
         * Find all elements by selector
         * @param {string} selector - CSS Selector
         * @param {Element} [context=document] - Search context
         * @returns {NodeList} List of elements
         */
        $$(selector, context = document) {
            return context.querySelectorAll(selector);
        },

        /**
         * Safely set text content of an element, preventing HTML injection
         * @param {Element} el - Element to target
         * @param {string} text - Plain text content
         */
        setText(el, text) {
            if (el) el.textContent = text;
        },

        /**
         * Safely set HTML content by sanitizing it first
         * @param {Element} el - Element to target
         * @param {string} html - HTML string
         */
        setHTML(el, html) {
            if (el) {
                el.innerHTML = DOM.sanitizeHTML(html);
            }
        },

        /**
         * Simple XSS sanitizer
         * @param {string} str - Raw input string
         * @returns {string} Sanitized string
         */
        sanitizeHTML(str) {
            if (!str) return '';
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        },

        /**
         * Toggle multiple CSS classes
         * @param {Element} el 
         * @param {Object} classes - Object of { className: boolean }
         */
        toggleClasses(el, classes) {
            if (!el) return;
            Object.entries(classes).forEach(([className, force]) => {
                el.classList.toggle(className, !!force);
            });
        }
    };

    /**
     * Performance Optimization Helpers
     */
    const Perf = {
        /**
         * Debounce function calls to prevent rapid firing
         * @param {Function} func - Function to execute
         * @param {number} wait - Delay in ms
         * @returns {Function} Debounced function
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Throttle function calls
         * @param {Function} func - Function to execute
         * @param {number} limit - Interval in ms
         * @returns {Function} Throttled function
         */
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func(...args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

    /**
     * Data and formatting helpers
     */
    const Format = {
        /**
         * Format small numbers as human-readable counts (e.g., 90K)
         * @param {number} num 
         * @returns {string} Formatted number
         */
        number(num) {
            if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
            if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
            return num.toString();
        },

        /**
         * Format currency
         * @param {number} amount 
         * @param {string} [currency='USD'] 
         * @returns {string} Formatted currency string
         */
        currency(amount, currency = 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency
            }).format(amount);
        },

        /**
         * Format date
         * @param {string|Date} date 
         * @returns {string} Formatted date
         */
        date(date) {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    return Object.freeze({
        DOM,
        Perf,
        Format
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
