/**
 * BlazeNXT Anthropic Service Integration
 * ========================================
 * Specific integration module for the Anthropic API, supporting Claude 3 (Opus/Sonnet/Haiku).
 * 
 * @module anthropic-integration
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const AnthropicIntegration = (() => {
    'use strict';

    return Object.freeze({
        /**
         * Send completion request to Anthropic via AIEngine
         * @param {string} prompt 
         * @param {Object} [options={}] 
         * @returns {Promise<string>}
         */
        async chat(prompt, options = {}) {
            if (typeof AIEngine !== 'undefined') {
                AIEngine.initializeProvider('anthropic');
                return AIEngine.complete(prompt, {
                    model: options.model || 'claude-3-sonnet-20240229',
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
                return !!BlazeNXTConfig.API?.anthropic?.enabled;
            }
            return false;
        }
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnthropicIntegration;
}
