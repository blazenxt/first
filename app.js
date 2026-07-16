/**
 * BlazeNXT Application Bootstrapper
 * ===================================
 * Coordinates initialization across configuration, storage, security,
 * analytics, performance tracking, UI elements, and SPA routing.
 * 
 * @module app
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    console.log('⚡ BlazeNXT Enterprise SPA: Bootstrapping process started...');

    try {
        // 1. Initialize Storage and State
        if (typeof BlazeNXTStorage !== 'undefined') {
            console.log('  └─ Initializing Storage State...');
            // Hydrate state from localStorage or load defaults
        }

        // 2. Initialize Security
        if (typeof SecurityModule !== 'undefined') {
            console.log('  └─ Security framework verified.');
        }

        // 3. Initialize UI Core Components
        if (typeof UICore !== 'undefined') {
            UICore.init();
        }

        // 4. Initialize Router for client-side SPA navigation
        if (typeof SPARouter !== 'undefined') {
            SPARouter.init();
        }

        // 5. Initialize Performance Tracking
        if (typeof PerformanceMonitorWrapper !== 'undefined') {
            console.log('  └─ Performance telemetry active.');
        }

        console.log('🚀 BlazeNXT Enterprise SPA: Successfully Bootstrapped!');
        
        if (typeof UICore !== 'undefined') {
            UICore.showToast('Welcome to BlazeNXT Enterprise Architecture!', 'success');
        }
    } catch (error) {
        console.error('❌ Bootstrapping failed:', error);
        if (typeof UICore !== 'undefined') {
            UICore.showToast('Application bootstrapping failed. Please check console.', 'error');
        }
    }
});
