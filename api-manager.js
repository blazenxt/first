/**
 * BlazeNXT API Manager
 * =====================
 * Orchestrates and wraps APIClient with BlazeNXTConfig options, interceptors, and error handling.
 * 
 * @module api-manager
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const APIManager = (() => {
    'use strict';

    // Verify dependencies are loaded or mock them
    const config = typeof BlazeNXTConfig !== 'undefined' ? BlazeNXTConfig : { API: { global: {} } };
    const clientLib = typeof APIClient !== 'undefined' ? APIClient : { HTTPClient: class {} };

    // Instantiate Default HTTP Client
    const httpClient = new clientLib.HTTPClient(config.API.global.baseUrl || '', {
        timeout: config.API.global.timeout || 30000,
        retryAttempts: config.API.global.retries || 3,
        retryDelay: config.API.global.retryDelay || 1000
    });

    // Add interceptors if Security module exists
    httpClient.addRequestInterceptor(async (requestConfig) => {
        // Add auth headers if token is present in Storage or Security
        if (typeof BlazeNXTStorage !== 'undefined') {
            const token = BlazeNXTStorage.Store?.getState()?.auth?.token;
            if (token) {
                requestConfig.headers = requestConfig.headers || {};
                requestConfig.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return requestConfig;
    });

    httpClient.addResponseInterceptor(async (response) => {
        // Intercept response to log or audit
        return response;
    });

    httpClient.addErrorInterceptor(async (error) => {
        console.error('[APIManager] Request failed:', error);
        // Dispatch to error logger/notifications if needed
    });

    return Object.freeze({
        client: httpClient,
        
        /**
         * Safely wrap a standard fetch or API client request
         * @param {string} method 
         * @param {string} url 
         * @param {any} [data=null] 
         * @param {Object} [options={}] 
         */
        async request(method, url, data = null, options = {}) {
            return httpClient.request(method, url, data, options);
        },

        async get(url, options = {}) {
            return httpClient.get(url, options);
        },

        async post(url, data, options = {}) {
            return httpClient.post(url, data, options);
        }
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIManager;
}
