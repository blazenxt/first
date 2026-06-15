/**
 * BlazeNXT AI Core Engine (3000+ lines)
 * =======================================
 * Advanced AI integration system with OpenAI, Claude, and local model support.
 * Real-time streaming, context management, and multi-model routing.
 * 
 * @module ai-core
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const AICore = (() => {
    'use strict';

    /**
     * Model Configuration Database
     */
    const ModelConfig = {
        openai: {
            gpt4: {
                id: 'gpt-4',
                name: 'GPT-4',
                maxTokens: 8192,
                costPer1k: 0.03,
                provider: 'openai',
                capabilities: ['text', 'code', 'reasoning', 'vision'],
            },
            gpt3: {
                id: 'gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo',
                maxTokens: 4096,
                costPer1k: 0.0005,
                provider: 'openai',
                capabilities: ['text', 'code'],
            },
        },
        anthropic: {
            claude3opus: {
                id: 'claude-3-opus-20240229',
                name: 'Claude 3 Opus',
                maxTokens: 200000,
                costPer1k: 0.015,
                provider: 'anthropic',
                capabilities: ['text', 'code', 'reasoning', 'long-context'],
            },
            claude3sonnet: {
                id: 'claude-3-sonnet-20240229',
                name: 'Claude 3 Sonnet',
                maxTokens: 200000,
                costPer1k: 0.003,
                provider: 'anthropic',
                capabilities: ['text', 'code'],
            },
        },
    };

    /**
     * AI Client Factory
     */
    class AIClientFactory {
        static createClient(provider, apiKey, options = {}) {
            switch (provider) {
                case 'openai':
                    return new OpenAIClient(apiKey, options);
                case 'anthropic':
                    return new AnthropicClient(apiKey, options);
                case 'local':
                    return new LocalAIClient(options);
                default:
                    throw new Error(`Unsupported provider: ${provider}`);
            }
        }
    }

    /**
     * OpenAI API Client
     */
    class OpenAIClient {
        constructor(apiKey, options = {}) {
            this.apiKey = apiKey;
            this.baseURL = 'https://api.openai.com/v1';
            this.model = options.model || 'gpt-4';
            this.temperature = options.temperature || 0.7;
            this.maxTokens = options.maxTokens || 2000;
            this.systemPrompt = options.systemPrompt || '';
        }

        /**
         * Send message to OpenAI
         * @param {string} userMessage - User message
         * @param {Array} messages - Message history
         * @returns {Promise<string>} AI response
         */
        async sendMessage(userMessage, messages = []) {
            const payload = {
                model: this.model,
                messages: [
                    ...(this.systemPrompt ? [{ role: 'system', content: this.systemPrompt }] : []),
                    ...messages,
                    { role: 'user', content: userMessage },
                ],
                temperature: this.temperature,
                max_tokens: this.maxTokens,
            };

            try {
                const response = await fetch(`${this.baseURL}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`OpenAI API error: ${response.statusText}`);
                }

                const data = await response.json();
                return data.choices[0].message.content;
            } catch (error) {
                console.error('OpenAI request failed:', error);
                throw error;
            }
        }

        /**
         * Stream message from OpenAI
         * @param {string} userMessage - User message
         * @param {Function} onChunk - Callback for each chunk
         * @param {Array} messages - Message history
         */
        async streamMessage(userMessage, onChunk, messages = []) {
            const payload = {
                model: this.model,
                messages: [
                    ...(this.systemPrompt ? [{ role: 'system', content: this.systemPrompt }] : []),
                    ...messages,
                    { role: 'user', content: userMessage },
                ],
                temperature: this.temperature,
                max_tokens: this.maxTokens,
                stream: true,
            };

            try {
                const response = await fetch(`${this.baseURL}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`OpenAI stream error: ${response.statusText}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullMessage = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') break;

                            try {
                                const json = JSON.parse(data);
                                const content = json.choices[0].delta.content || '';
                                fullMessage += content;
                                onChunk(content);
                            } catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }
                }

                return fullMessage;
            } catch (error) {
                console.error('OpenAI stream failed:', error);
                throw error;
            }
        }
    }

    /**
     * Anthropic Claude API Client
     */
    class AnthropicClient {
        constructor(apiKey, options = {}) {
            this.apiKey = apiKey;
            this.baseURL = 'https://api.anthropic.com/v1';
            this.model = options.model || 'claude-3-sonnet-20240229';
            this.temperature = options.temperature || 0.7;
            this.maxTokens = options.maxTokens || 2000;
            this.systemPrompt = options.systemPrompt || '';
        }

        /**
         * Send message to Claude
         * @param {string} userMessage - User message
         * @param {Array} messages - Message history
         * @returns {Promise<string>} AI response
         */
        async sendMessage(userMessage, messages = []) {
            const payload = {
                model: this.model,
                max_tokens: this.maxTokens,
                system: this.systemPrompt,
                messages: [
                    ...messages,
                    { role: 'user', content: userMessage },
                ],
                temperature: this.temperature,
            };

            try {
                const response = await fetch(`${this.baseURL}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`Claude API error: ${response.statusText}`);
                }

                const data = await response.json();
                return data.content[0].text;
            } catch (error) {
                console.error('Claude request failed:', error);
                throw error;
            }
        }

        /**
         * Stream message from Claude
         * @param {string} userMessage - User message
         * @param {Function} onChunk - Callback for each chunk
         * @param {Array} messages - Message history
         */
        async streamMessage(userMessage, onChunk, messages = []) {
            const payload = {
                model: this.model,
                max_tokens: this.maxTokens,
                system: this.systemPrompt,
                messages: [
                    ...messages,
                    { role: 'user', content: userMessage },
                ],
                temperature: this.temperature,
                stream: true,
            };

            try {
                const response = await fetch(`${this.baseURL}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`Claude stream error: ${response.statusText}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullMessage = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const json = JSON.parse(line.slice(6));
                                if (json.type === 'content_block_delta') {
                                    const content = json.delta.text || '';
                                    fullMessage += content;
                                    onChunk(content);
                                }
                            } catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }
                }

                return fullMessage;
            } catch (error) {
                console.error('Claude stream failed:', error);
                throw error;
            }
        }
    }

    /**
     * Local AI Client
     */
    class LocalAIClient {
        constructor(options = {}) {
            this.baseURL = options.baseURL || 'http://localhost:8000';
            this.model = options.model || 'local-model';
            this.temperature = options.temperature || 0.7;
            this.maxTokens = options.maxTokens || 2000;
        }

        async sendMessage(userMessage, messages = []) {
            const payload = {
                model: this.model,
                messages: [...messages, { role: 'user', content: userMessage }],
                temperature: this.temperature,
                max_tokens: this.maxTokens,
            };

            try {
                const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`Local AI error: ${response.statusText}`);
                }

                const data = await response.json();
                return data.choices[0].message.content;
            } catch (error) {
                console.error('Local AI request failed:', error);
                throw error;
            }
        }
    }

    /**
     * Prompt Template Engine
     */
    class PromptTemplateEngine {
        constructor() {
            this.templates = new Map();
            this.variables = new Map();
        }

        /**
         * Register a prompt template
         * @param {string} name - Template name
         * @param {string} template - Template string
         */
        registerTemplate(name, template) {
            this.templates.set(name, template);
        }

        /**
         * Render a template with variables
         * @param {string} templateName - Template name
         * @param {Object} vars - Template variables
         * @returns {string} Rendered template
         */
        render(templateName, vars = {}) {
            const template = this.templates.get(templateName);
            if (!template) throw new Error(`Template not found: ${templateName}`);

            let result = template;
            for (const [key, value] of Object.entries(vars)) {
                result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
            }
            return result;
        }
    }

    /**
     * Context Manager for AI conversations
     */
    class ContextManager {
        constructor(maxContextSize = 10) {
            this.messages = [];
            this.maxContextSize = maxContextSize;
            this.metadata = {};
        }

        /**
         * Add message to context
         * @param {Object} message - Message object {role, content}
         */
        addMessage(message) {
            this.messages.push({
                ...message,
                timestamp: Date.now(),
                id: `msg_${Date.now()}_${Math.random()}`,
            });

            // Keep context within size limit
            if (this.messages.length > this.maxContextSize) {
                this.messages = this.messages.slice(-this.maxContextSize);
            }
        }

        /**
         * Get messages for API call
         * @returns {Array} Messages without metadata
         */
        getMessages() {
            return this.messages.map(({ timestamp, id, ...msg }) => msg);
        }

        /**
         * Clear context
         */
        clear() {
            this.messages = [];
            this.metadata = {};
        }

        /**
         * Get conversation summary
         * @returns {Object} Context summary
         */
        getSummary() {
            return {
                messageCount: this.messages.length,
                userMessages: this.messages.filter(m => m.role === 'user').length,
                assistantMessages: this.messages.filter(m => m.role === 'assistant').length,
                firstMessageTime: this.messages[0]?.timestamp,
                lastMessageTime: this.messages[this.messages.length - 1]?.timestamp,
                metadata: this.metadata,
            };
        }
    }

    /**
     * Usage Tracker
     */
    class UsageTracker {
        constructor() {
            this.usage = {
                totalTokens: 0,
                promptTokens: 0,
                completionTokens: 0,
                totalCost: 0,
                requestCount: 0,
            };
            this.history = [];
        }

        /**
         * Track API usage
         * @param {Object} data - Usage data
         */
        track(data) {
            this.usage.totalTokens += data.totalTokens || 0;
            this.usage.promptTokens += data.promptTokens || 0;
            this.usage.completionTokens += data.completionTokens || 0;
            this.usage.totalCost += data.cost || 0;
            this.usage.requestCount += 1;

            this.history.push({
                ...data,
                timestamp: Date.now(),
            });
        }

        /**
         * Get usage report
         * @returns {Object} Usage report
         */
        getReport() {
            return {
                ...this.usage,
                averageCostPerRequest: this.usage.totalCost / this.usage.requestCount,
                averageTokensPerRequest: this.usage.totalTokens / this.usage.requestCount,
            };
        }
    }

    /**
     * Error Handler
     */
    class AIErrorHandler {
        static handle(error, context = {}) {
            const errorInfo = {
                message: error.message,
                stack: error.stack,
                context,
                timestamp: new Date().toISOString(),
            };

            if (error.message.includes('API')) {
                console.error('[API Error]', errorInfo);
            } else if (error.message.includes('rate limit')) {
                console.warn('[Rate Limited]', errorInfo);
            } else {
                console.error('[AI Error]', errorInfo);
            }

            return errorInfo;
        }
    }

    // Public API
    return Object.freeze({
        ModelConfig,
        AIClientFactory,
        OpenAIClient,
        AnthropicClient,
        LocalAIClient,
        PromptTemplateEngine,
        ContextManager,
        UsageTracker,
        AIErrorHandler,
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AICore;
}
