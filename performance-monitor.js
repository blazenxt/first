/**
 * BlazeNXT Performance Monitor Wrapper
 * =====================================
 * Instantiates the core modules of PerformanceMonitor and exposes simple methods to start,
 * stop, and fetch performance data, as well as track page load timings.
 * 
 * @module performance-monitor
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const PerformanceMonitorWrapper = (() => {
    'use strict';

    const pm = typeof PerformanceMonitor !== 'undefined' ? PerformanceMonitor : null;

    let vitalsTracker = null;
    let memoryProfiler = null;
    let metricsCollector = null;
    let errorTracker = null;

    if (pm) {
        try {
            vitalsTracker = new pm.WebVitalsTracker();
            memoryProfiler = new pm.MemoryProfiler();
            metricsCollector = new pm.MetricsCollector();
            errorTracker = new pm.ErrorTracker();
        } catch (e) {
            console.warn('[PerformanceMonitorWrapper] Initialization warning:', e);
        }
    }

    return Object.freeze({
        getVitals() {
            return vitalsTracker ? vitalsTracker.vitals : null;
        },

        getMemory() {
            return memoryProfiler ? memoryProfiler.getMemoryUsage() : null;
        },

        startMeasure(name) {
            if (metricsCollector) {
                metricsCollector.startMeasure(name);
            }
        },

        endMeasure(name) {
            if (metricsCollector) {
                return metricsCollector.endMeasure(name);
            }
            return null;
        },

        getMetricsReport() {
            return metricsCollector ? metricsCollector.getReport() : null;
        },

        logError(error, fatal = false) {
            if (errorTracker) {
                errorTracker.track(error, fatal);
            } else {
                console.error(error);
            }
        }
    });
})();

// Expose globally
window.BlazePerformance = PerformanceMonitorWrapper;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitorWrapper;
}
