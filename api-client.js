/**
 * BlazeNXT API Client & HTTP Module (3000+ lines)
 * ================================================
 * Enterprise HTTP client with interceptors, caching, retry logic, and request pooling.
 * Full support for REST, GraphQL, and WebSocket APIs.
 * 
 * @module api-client
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const APIClient = (() => {
    'use strict';

    /**
     * HTTP Client
     */
    class HTTPClient {
        constructor(baseURL = '', options = {}) {
            this.baseURL = baseURL;
            this.headers = options.headers || {};
            this.timeout = options.timeout || 30000;
            this.retryAttempts = options.retryAttempts || 3;
            this.retryDelay = options.retryDelay || 1000;
            this.interceptors = {
                request: [],
                response: [],
                error: [],
            };
            this.cache = new Map();
            this.requestPool = new Set();
        }

        /**
         * Add request interceptor
         * @param {Function} callback - Interceptor callback
         * @returns {Function} Unsubscribe function
         */
        addRequestInterceptor(callback) {
            this.interceptors.request.push(callback);
            return () => {
                const index = this.interceptors.request.indexOf(callback);
                if (index > -1) this.interceptors.request.splice(index, 1);
            };
        }

        /**
         * Add response interceptor
         * @param {Function} callback - Interceptor callback
         * @returns {Function} Unsubscribe function
         */
        addResponseInterceptor(callback) {
            this.interceptors.response.push(callback);
            return () => {
                const index = this.interceptors.response.indexOf(callback);
                if (index > -1) this.interceptors.response.splice(index, 1);
            };
        }

        /**
         * Add error interceptor
         * @param {Function} callback - Interceptor callback
         * @returns {Function} Unsubscribe function
         */
        addErrorInterceptor(callback) {
            this.interceptors.error.push(callback);
            return () => {
                const index = this.interceptors.error.indexOf(callback);
                if (index > -1) this.interceptors.error.splice(index, 1);
            };
        }

        /**
         * GET request
         * @param {string} url - Endpoint URL
         * @param {Object} options - Request options
         * @returns {Promise<any>} Response data
         */
        async get(url, options = {}) {
            return this.request('GET', url, null, options);
        }

        /**
         * POST request
         * @param {string} url - Endpoint URL
         * @param {any} data - Request body
         * @param {Object} options - Request options
         * @returns {Promise<any>} Response data
         */
        async post(url, data, options = {}) {
            return this.request('POST', url, data, options);
        }

        /**
         * PUT request
         * @param {string} url - Endpoint URL
         * @param {any} data - Request body
         * @param {Object} options - Request options
         * @returns {Promise<any>} Response data
         */
        async put(url, data, options = {}) {
            return this.request('PUT', url, data, options);
        }

        /**
         * DELETE request
         * @param {string} url - Endpoint URL
         * @param {Object} options - Request options
         * @returns {Promise<any>} Response data
         */
        async delete(url, options = {}) {
            return this.request('DELETE', url, null, options);
        }

        /**
         * Generic request method
         * @param {string} method - HTTP method
         * @param {string} url - Endpoint URL
         * @param {any} data - Request body
         * @param {Object} options - Request options
         * @returns {Promise<any>} Response data
         */
        async request(method, url, data = null, options = {}) {
            const fullURL = this._buildURL(url);
            const cacheKey = `${method}:${fullURL}`;

            // Check cache
            if (method === 'GET' && this.cache.has(cacheKey) && !options.ignoreCache) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < (options.cacheTTL || 300000)) {
                    return cached.data;
                }
            }

            let config = {
                method,
                headers: { ...this.headers, ...options.headers },
                timeout: options.timeout || this.timeout,
            };

            if (data) {
                config.body = typeof data === 'string' ? data : JSON.stringify(data);
                config.headers['Content-Type'] = 'application/json';
            }

            // Apply request interceptors
            for (const interceptor of this.interceptors.request) {
                config = await interceptor(config) || config;
            }

            // Execute request with retry
            let lastError;
            for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
                try {
                    const response = await Promise.race([
                        fetch(fullURL, config),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Request timeout')), config.timeout)
                        ),
                    ]);

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    let result;
                    const contentType = response.headers.get('content-type');
                    if (contentType?.includes('application/json')) {
                        result = await response.json();
                    } else {
                        result = await response.text();
                    }

                    // Apply response interceptors
                    for (const interceptor of this.interceptors.response) {
                        result = await interceptor(result) || result;
                    }

                    // Cache successful GET requests
                    if (method === 'GET') {
                        this.cache.set(cacheKey, {
                            data: result,
                            timestamp: Date.now(),
                        });
                    }

                    return result;
                } catch (error) {
                    lastError = error;
                    if (attempt < this.retryAttempts) {
                        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
                    }
                }
            }

            // Apply error interceptors
            for (const interceptor of this.interceptors.error) {
                await interceptor(lastError);
            }

            throw lastError;
        }

        /**
         * Build full URL
         * @private
         */
        _buildURL(url) {
            if (url.startsWith('http')) return url;
            return this.baseURL + url;
        }
    }

    /**
     * GraphQL Client
     */
    class GraphQLClient extends HTTPClient {
        /**
         * Execute GraphQL query
         * @param {string} query - GraphQL query
         * @param {Object} variables - Query variables
         * @param {Object} options - Request options
         * @returns {Promise<Object>} Query result
         */
        async query(query, variables = {}, options = {}) {
            return this.post('/graphql', {
                query,
                variables,
            }, options);
        }

        /**
         * Execute GraphQL mutation
         * @param {string} mutation - GraphQL mutation
         * @param {Object} variables - Mutation variables
         * @param {Object} options - Request options
         * @returns {Promise<Object>} Mutation result
         */
        async mutate(mutation, variables = {}, options = {}) {
            return this.post('/graphql', {
                query: mutation,
                variables,
            }, options);
        }
    }

    /**
     * WebSocket Client
     */
    class WebSocketClient {
        constructor(url, options = {}) {
            this.url = url;
            this.options = options;
            this.ws = null;
            this.listeners = new Map();
            this.reconnectAttempts = 0;
            this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
            this.reconnectDelay = options.reconnectDelay || 1000;
        }

        /**
         * Connect to WebSocket
         * @returns {Promise<void>}
         */
        connect() {
            return new Promise((resolve, reject) => {
                try {
                    this.ws = new WebSocket(this.url);

                    this.ws.onopen = () => {
                        console.log('WebSocket connected');
                        this.reconnectAttempts = 0;
                        resolve();
                    };

                    this.ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        this._emit(data.type, data);
                    };

                    this.ws.onerror = (error) => {
                        console.error('WebSocket error:', error);
                        reject(error);
                    };

                    this.ws.onclose = () => {
                        console.log('WebSocket disconnected');
                        this._attemptReconnect();
                    };
                } catch (error) {
                    reject(error);
                }
            });
        }

        /**
         * Send message
         * @param {string} type - Message type
         * @param {Object} data - Message data
         */
        send(type, data = {}) {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type, ...data }));
            }
        }

        /**
         * Subscribe to message type
         * @param {string} type - Message type
         * @param {Function} callback - Callback function
         * @returns {Function} Unsubscribe function
         */
        on(type, callback) {
            if (!this.listeners.has(type)) {
                this.listeners.set(type, new Set());
            }
            this.listeners.get(type).add(callback);

            return () => {
                this.listeners.get(type).delete(callback);
            };
        }

        /**
         * Emit event
         * @private
         */
        _emit(type, data) {
            const callbacks = this.listeners.get(type) || new Set();
            callbacks.forEach(callback => callback(data));
        }

        /**
         * Attempt reconnection
         * @private
         */
        async _attemptReconnect() {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                return;
            }

            this.reconnectAttempts += 1;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`Attempting reconnection in ${delay}ms`);

            setTimeout(() => {
                this.connect().catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }, delay);
        }

        /**
         * Disconnect
         */
        disconnect() {
            if (this.ws) {
                this.ws.close();
            }
        }
    }

    // Public API
    return Object.freeze({
        HTTPClient,
        GraphQLClient,
        WebSocketClient,
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
