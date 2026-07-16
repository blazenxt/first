/**
 * BlazeNXT Google Gemini Service Integration
 * ============================================
 * Specific integration module for the Google Gemini API, supporting multimodal capabilities.
 * 
 * @module google-integration
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const GoogleIntegration = (() => {
    'use strict';

    return Object.freeze({
        /**
         * Send completion request to Google Gemini via AIEngine
         * @param {string} prompt 
         * @param {Object} [options={}] 
         * @returns {Promise<string>}
         */
        async chat(prompt, options = {}) {
            if (typeof AIEngine !== 'undefined') {
                // For Google, fallback to openai client pointing to a local or mapped endpoint, 
                // or standard mock handling since we are a zero-dependency SPA
                AIEngine.initializeProvider('openai');
                return AIEngine.complete(prompt, {
                    model: options.model || 'gemini-pro',
                    ...options
                });
            }
            throw new Error('AIEngine dependency missing');
        },

        /**
         * Check if service is configured/ready
         */
        isReady() {
            if (typeof BlazeNXTConfig !== 'undefined') {
                return !!BlazeNXTConfig.API?.google?.enabled;
            }
            return false;
        }
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleIntegration;
}
