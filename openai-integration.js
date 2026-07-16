/**
 * BlazeNXT OpenAI Service Integration
 * =====================================
 * Specific integration module for the OpenAI API, supporting GPT-4, GPT-3.5 and vision capability.
 * 
 * @module openai-integration
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const OpenAIIntegration = (() => {
    'use strict';

    return Object.freeze({
        /**
         * Send completion request to OpenAI via AIEngine
         * @param {string} prompt 
         * @param {Object} [options={}] 
         * @returns {Promise<string>}
         */
        async chat(prompt, options = {}) {
            if (typeof AIEngine !== 'undefined') {
                AIEngine.initializeProvider('openai');
                return AIEngine.complete(prompt, {
                    model: options.model || 'gpt-4o',
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
                return !!BlazeNXTConfig.API?.openai?.enabled;
            }
            return false;
        }
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenAIIntegration;
}
