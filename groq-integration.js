/**
 * BlazeNXT Groq AI Service Integration
 * =====================================
 * Specific integration module for the Groq API, providing high-performance Llama 3 completions.
 * 
 * @module groq-integration
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const GroqIntegration = (() => {
    'use strict';

    return Object.freeze({
        /**
         * Send completion request to Groq via AIEngine
         * @param {string} prompt 
         * @param {Object} [options={}] 
         * @returns {Promise<string>}
         */
        async chat(prompt, options = {}) {
            if (typeof AIEngine !== 'undefined') {
                AIEngine.initializeProvider('groq');
                return AIEngine.complete(prompt, {
                    model: options.model || 'llama-3.1-70b-versatile',
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
                return !!BlazeNXTConfig.API?.groq?.enabled;
            }
            return false;
        }
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GroqIntegration;
}
