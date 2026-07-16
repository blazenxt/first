/**
 * BlazeNXT AI Engine
 * ===================
 * Exposes a unified interface for model-agnostic chat completions, streaming,
 * context tracking, and usage analytics. Connects with AICore and BlazeNXTConfig.
 * 
 * @module ai-engine
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const AIEngine = (() => {
    'use strict';

    // Verify dependencies are loaded or fallback/mock
    const config = typeof BlazeNXTConfig !== 'undefined' ? BlazeNXTConfig : {};
    const core = typeof AICore !== 'undefined' ? AICore : null;

    let activeClient = null;
    let contextManager = null;
    let usageTracker = null;

    if (core) {
        contextManager = new core.ContextManager();
        usageTracker = new core.UsageTracker();
    }

    return Object.freeze({
        /**
         * Initialize client for specific provider
         * @param {string} provider - 'openai', 'anthropic', 'groq', 'local'
         * @param {string} apiKey - Optional custom API key
         */
        initializeProvider(provider, apiKey = '') {
            if (!core) {
                console.error('[AIEngine] AICore dependency missing!');
                return null;
            }

            const providerConfig = config.API?.[provider] || {};
            const key = apiKey || providerConfig.apiKey || 'mock-key';
            const baseUrl = providerConfig.baseUrl || '';

            activeClient = core.AIClientFactory.createClient(provider, key, { baseUrl });
            return activeClient;
        },

        /**
         * Get active client or initialize default (openai)
         */
        getClient() {
            if (!activeClient) {
                this.initializeProvider('openai');
            }
            return activeClient;
        },

        /**
         * Generate response for prompt
         * @param {string} prompt 
         * @param {Object} [options={}] 
         * @returns {Promise<string>}
         */
        async complete(prompt, options = {}) {
            const client = this.getClient();
            if (!client) throw new Error('No AI client initialized');

            const model = options.model || 'default';
            const contextId = options.contextId || 'global';

            // Add to context if context manager available
            if (contextManager) {
                contextManager.addMessage(contextId, 'user', prompt);
            }

            try {
                const startTime = Date.now();
                const response = await client.complete(prompt, options);
                
                if (contextManager) {
                    contextManager.addMessage(contextId, 'assistant', response);
                }

                if (usageTracker) {
                    // Simple estimate: 4 chars per token
                    const inputTokens = Math.ceil(prompt.length / 4);
                    const outputTokens = Math.ceil(response.length / 4);
                    usageTracker.track(model, inputTokens, outputTokens);
                }

                return response;
            } catch (error) {
                if (core) {
                    core.AIErrorHandler.handle(error, { prompt, options });
                }
                throw error;
            }
        },

        /**
         * Stream response
         * @param {string} prompt 
         * @param {Function} onChunk 
         * @param {Object} [options={}] 
         */
        async streamComplete(prompt, onChunk, options = {}) {
            const client = this.getClient();
            if (!client || typeof client.streamComplete !== 'function') {
                throw new Error('Streaming not supported on active client');
            }

            return client.streamComplete(prompt, onChunk, options);
        },

        /**
         * Get current session statistics
         */
        getStats() {
            return usageTracker ? usageTracker.getReport() : null;
        }
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIEngine;
}
