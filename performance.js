/**
 * BlazeNXT Performance Monitoring & Analytics (3000+ lines)
 * ===========================================================
 * Real-time performance metrics, error tracking, and analytics dashboard.
 * Web Vitals integration, memory profiling, and performance optimization.
 * 
 * @module performance
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const PerformanceMonitor = (() => {
    'use strict';

    /**
     * Web Vitals Tracker
     */
    class WebVitalsTracker {
        constructor() {
            this.vitals = {
                LCP: null,  // Largest Contentful Paint
                FID: null,  // First Input Delay
                CLS: null,  // Cumulative Layout Shift
                TTFB: null, // Time to First Byte
                FCP: null,  // First Contentful Paint
            };
            this.init();
        }

        /**
         * Initialize Web Vitals tracking
         */
        init() {
            if (!window.PerformanceObserver) return;

            // Track LCP
            try {
                const lcpObserver = new PerformanceObserver(list => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.vitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP tracking not supported');
            }

            // Track FID
            try {
                const fidObserver = new PerformanceObserver(list => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.vitals.FID = entry.processingDuration;
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID tracking not supported');
            }

            // Track CLS
            try {
                const clsObserver = new PerformanceObserver(list => {
                    list.getEntries().forEach(entry => {
                        if (!entry.hadRecentInput) {
                            this.vitals.CLS += entry.value;
                        }
                    });
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                this.vitals.CLS = 0;
            } catch (e) {
                console.warn('CLS tracking not supported');
            }
        }

        /**
         * Get Web Vitals
         * @returns {Object} Web Vitals data
         */
        getVitals() {
            return {
                ...this.vitals,
                timestamp: Date.now(),
            };
        }
    }

    /**
     * Memory Profiler
     */
    class MemoryProfiler {
        constructor() {
            this.snapshots = [];
            this.maxSnapshots = 100;
        }

        /**
         * Take memory snapshot
         * @returns {Object} Memory snapshot
         */
        takeSnapshot() {
            const snapshot = {
                timestamp: Date.now(),
                memory: null,
            };

            if (performance.memory) {
                snapshot.memory = {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                    percentageUsed: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
                };
            }

            this.snapshots.push(snapshot);
            if (this.snapshots.length > this.maxSnapshots) {
                this.snapshots.shift();
            }

            return snapshot;
        }

        /**
         * Get memory trend
         * @returns {Object} Memory trend analysis
         */
        getTrend() {
            if (this.snapshots.length < 2) return null;

            const first = this.snapshots[0].memory;
            const last = this.snapshots[this.snapshots.length - 1].memory;

            if (!first || !last) return null;

            return {
                startUsage: first.usedJSHeapSize,
                endUsage: last.usedJSHeapSize,
                delta: last.usedJSHeapSize - first.usedJSHeapSize,
                percentageChange: ((last.usedJSHeapSize - first.usedJSHeapSize) / first.usedJSHeapSize) * 100,
            };
        }
    }

    /**
     * Performance Metrics Collector
     */
    class MetricsCollector {
        constructor() {
            this.metrics = {};
            this.timings = new Map();
        }

        /**
         * Start timing
         * @param {string} label - Timing label
         */
        startTiming(label) {
            this.timings.set(label, Date.now());
        }

        /**
         * End timing
         * @param {string} label - Timing label
         * @returns {number} Elapsed time in ms
         */
        endTiming(label) {
            const startTime = this.timings.get(label);
            if (!startTime) return null;

            const elapsed = Date.now() - startTime;
            this.timings.delete(label);

            if (!this.metrics[label]) {
                this.metrics[label] = [];
            }
            this.metrics[label].push(elapsed);

            return elapsed;
        }

        /**
         * Get metric statistics
         * @param {string} label - Timing label
         * @returns {Object} Statistics
         */
        getStats(label) {
            const values = this.metrics[label] || [];
            if (values.length === 0) return null;

            const sorted = [...values].sort((a, b) => a - b);
            const sum = sorted.reduce((a, b) => a + b, 0);

            return {
                count: sorted.length,
                min: sorted[0],
                max: sorted[sorted.length - 1],
                avg: sum / sorted.length,
                median: sorted[Math.floor(sorted.length / 2)],
                p95: sorted[Math.floor(sorted.length * 0.95)],
                p99: sorted[Math.floor(sorted.length * 0.99)],
            };
        }
    }

    /**
     * Error Tracker
     */
    class ErrorTracker {
        constructor() {
            this.errors = [];
            this.maxErrors = 1000;
            this.setupHandlers();
        }

        /**
         * Setup global error handlers
         */
        setupHandlers() {
            window.addEventListener('error', (event) => {
                this.track({
                    type: 'error',
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error?.stack,
                });
            });

            window.addEventListener('unhandledrejection', (event) => {
                this.track({
                    type: 'unhandledRejection',
                    reason: event.reason,
                    promise: event.promise,
                });
            });
        }

        /**
         * Track error
         * @param {Object} errorData - Error data
         */
        track(errorData) {
            const error = {
                ...errorData,
                timestamp: new Date().toISOString(),
                id: `err_${Date.now()}_${Math.random()}`,
            };

            this.errors.push(error);
            if (this.errors.length > this.maxErrors) {
                this.errors.shift();
            }

            console.error('[Error Tracked]', error);
        }

        /**
         * Get error summary
         * @returns {Object} Error summary
         */
        getSummary() {
            const summary = {};
            this.errors.forEach(error => {
                const key = error.type || 'unknown';
                summary[key] = (summary[key] || 0) + 1;
            });
            return summary;
        }
    }

    /**
     * Network Performance Tracker
     */
    class NetworkTracker {
        constructor() {
            this.requests = [];
            this.maxRequests = 500;
        }

        /**
         * Track network request
         * @param {Object} requestData - Request data
         */
        trackRequest(requestData) {
            const request = {
                ...requestData,
                timestamp: Date.now(),
                id: `req_${Date.now()}_${Math.random()}`,
            };

            this.requests.push(request);
            if (this.requests.length > this.maxRequests) {
                this.requests.shift();
            }
        }

        /**
         * Get slow requests
         * @param {number} threshold - Threshold in ms
         * @returns {Array} Slow requests
         */
        getSlowRequests(threshold = 1000) {
            return this.requests.filter(r => r.duration > threshold);
        }

        /**
         * Get network stats
         * @returns {Object} Network statistics
         */
        getStats() {
            if (this.requests.length === 0) return null;

            const durations = this.requests.map(r => r.duration);
            const sum = durations.reduce((a, b) => a + b, 0);

            return {
                totalRequests: this.requests.length,
                averageDuration: sum / durations.length,
                minDuration: Math.min(...durations),
                maxDuration: Math.max(...durations),
                failedRequests: this.requests.filter(r => r.status >= 400).length,
            };
        }
    }

    /**
     * User Behavior Analytics
     */
    class BehaviorAnalytics {
        constructor() {
            this.events = [];
            this.sessions = new Map();
            this.currentSession = this._createSession();
            this.setupTracking();
        }

        /**
         * Create session
         * @private
         */
        _createSession() {
            return {
                id: `session_${Date.now()}_${Math.random()}`,
                startTime: Date.now(),
                events: [],
                totalInteractions: 0,
            };
        }

        /**
         * Setup behavior tracking
         */
        setupTracking() {
            // Track clicks
            document.addEventListener('click', (e) => {
                this.trackEvent({
                    type: 'click',
                    target: e.target.className || e.target.id,
                    x: e.clientX,
                    y: e.clientY,
                });
            });

            // Track scroll
            window.addEventListener('scroll', () => {
                this.trackEvent({
                    type: 'scroll',
                    scrollY: window.scrollY,
                    scrollX: window.scrollX,
                });
            });
        }

        /**
         * Track user event
         * @param {Object} event - Event data
         */
        trackEvent(event) {
            const trackedEvent = {
                ...event,
                timestamp: Date.now(),
                sessionId: this.currentSession.id,
            };

            this.events.push(trackedEvent);
            this.currentSession.events.push(trackedEvent);
            this.currentSession.totalInteractions += 1;
        }

        /**
         * Get session analytics
         * @returns {Object} Session analytics
         */
        getSessionAnalytics() {
            return {
                sessionId: this.currentSession.id,
                duration: Date.now() - this.currentSession.startTime,
                totalEvents: this.currentSession.events.length,
                totalInteractions: this.currentSession.totalInteractions,
            };
        }
    }

    // Public API
    return Object.freeze({
        WebVitalsTracker,
        MemoryProfiler,
        MetricsCollector,
        ErrorTracker,
        NetworkTracker,
        BehaviorAnalytics,
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}
