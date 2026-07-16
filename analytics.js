/**
 * BlazeNXT Analytics Module
 * ==========================
 * High-level user interaction and page event analytics system built on top of PerformanceMonitor.
 * 
 * @module analytics
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const Analytics = (() => {
    'use strict';

    const pm = typeof PerformanceMonitor !== 'undefined' ? PerformanceMonitor : null;
    let behaviorAnalytics = null;

    if (pm && pm.BehaviorAnalytics) {
        try {
            behaviorAnalytics = new pm.BehaviorAnalytics();
        } catch (e) {
            console.warn('[Analytics] BehaviorAnalytics initialization failed:', e);
        }
    }

    return Object.freeze({
        /**
         * Track a pageview event
         * @param {string} pageName 
         */
        trackPageView(pageName) {
            console.log(`[Analytics] PageView: ${pageName}`);
            if (behaviorAnalytics) {
                behaviorAnalytics.trackEvent({
                    category: 'Navigation',
                    action: 'view',
                    label: pageName
                });
            }
        },

        /**
         * Track custom action or event
         * @param {string} category 
         * @param {string} action 
         * @param {string} [label=''] 
         * @param {number} [value=0] 
         */
        trackEvent(category, action, label = '', value = 0) {
            console.log(`[Analytics] Event: ${category} -> ${action} (${label})`);
            if (behaviorAnalytics) {
                behaviorAnalytics.trackEvent({
                    category,
                    action,
                    label,
                    value
                });
            }
        },

        /**
         * Get session report
         */
        getSessionSummary() {
            if (behaviorAnalytics) {
                return behaviorAnalytics.getSessionAnalytics();
            }
            return null;
        }
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}
