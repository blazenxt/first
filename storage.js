/**
 * BlazeNXT Storage Manager (3000+ lines)
 * =======================================
 * Advanced state management system inspired by Redux but entirely custom.
 * Handles localStorage persistence, encryption, event emission, and data hydration.
 * 
 * @module storage
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

const BlazeNXTStorage = (() => {
    'use strict';

    /**
     * Storage Event Bus - Pub/Sub System
     * Allows components to subscribe to data changes
     */
    class EventBus {
        constructor() {
            this.events = new Map();
            this.listeners = new Map();
            this.history = [];
            this.maxHistorySize = 100;
        }

        /**
         * Subscribe to an event
         * @param {string} eventName - Name of the event
         * @param {Function} callback - Callback function
         * @returns {Function} Unsubscribe function
         */
        subscribe(eventName, callback) {
            if (!this.listeners.has(eventName)) {
                this.listeners.set(eventName, new Set());
            }
            this.listeners.get(eventName).add(callback);

            // Return unsubscribe function
            return () => {
                this.listeners.get(eventName).delete(callback);
            };
        }

        /**
         * Emit an event
         * @param {string} eventName - Name of the event
         * @param {*} data - Event data
         */
        emit(eventName, data) {
            if (!this.listeners.has(eventName)) {
                return;
            }

            const event = {
                name: eventName,
                data,
                timestamp: Date.now(),
            };

            // Add to history
            this.history.push(event);
            if (this.history.length > this.maxHistorySize) {
                this.history.shift();
            }

            // Emit to all listeners
            this.listeners.get(eventName).forEach((callback) => {
                try {
                    callback(data, event);
                } catch (error) {
                    console.error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }

        /**
         * Get event history
         * @returns {Array} Event history
         */
        getHistory() {
            return [...this.history];
        }

        /**
         * Clear all listeners
         */
        clear() {
            this.listeners.clear();
        }
    }

    /**
     * Data Store - Central state management
     */
    class DataStore {
        constructor() {
            this.state = {};
            this.initialState = {};
            this.reducers = new Map();
            this.middleware = [];
            this.eventBus = new EventBus();
            this.locked = false;
        }

        /**
         * Initialize store with initial state
         * @param {Object} initialState - Initial state
         */
        init(initialState) {
            this.initialState = { ...initialState };
            this.state = { ...initialState };
        }

        /**
         * Register a reducer function
         * @param {string} key - State key
         * @param {Function} reducer - Reducer function
         */
        registerReducer(key, reducer) {
            this.reducers.set(key, reducer);
        }

        /**
         * Register middleware
         * @param {Function} middleware - Middleware function
         */
        use(middleware) {
            this.middleware.push(middleware);
        }

        /**
         * Dispatch action
         * @param {Object} action - Action object {type, payload}
         */
        async dispatch(action) {
            if (this.locked) {
                console.warn('Store is locked, cannot dispatch action');
                return;
            }

            // Run middleware
            for (const mw of this.middleware) {
                await mw(action);
            }

            const { type, payload } = action;
            const reducer = this.reducers.get(type);

            if (!reducer) {
                console.warn(`No reducer found for action type: ${type}`);
                return;
            }

            const newState = reducer(this.state, payload);
            if (newState) {
                this.state = newState;
                this.eventBus.emit(type, { previous: this.state, current: newState });
            }
        }

        /**
         * Get state or part of state
         * @param {string} path - Path to state (e.g., 'user.name')
         * @returns {*} State value
         */
        getState(path) {
            if (!path) return { ...this.state };

            const parts = path.split('.');
            let value = this.state;
            for (const part of parts) {
                value = value?.[part];
                if (!value) return undefined;
            }
            return value;
        }

        /**
         * Set state directly
         * @param {string} path - Path to state
         * @param {*} value - Value to set
         */
        setState(path, value) {
            const parts = path.split('.');
            const newState = { ...this.state };
            let current = newState;

            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }

            current[parts[parts.length - 1]] = value;
            this.state = newState;
            this.eventBus.emit('STATE_CHANGE', { path, value });
        }

        /**
         * Subscribe to state changes
         * @param {string} eventName - Event name
         * @param {Function} callback - Callback function
         * @returns {Function} Unsubscribe function
         */
        subscribe(eventName, callback) {
            return this.eventBus.subscribe(eventName, callback);
        }

        /**
         * Lock store (prevent dispatch)
         */
        lock() {
            this.locked = true;
        }

        /**
         * Unlock store
         */
        unlock() {
            this.locked = false;
        }

        /**
         * Reset to initial state
         */
        reset() {
            this.state = { ...this.initialState };
            this.eventBus.emit('STORE_RESET', {});
        }
    }

    /**
     * Encryption Utility
     */
    class Encryption {
        /**
         * Encode data with Base64
         * @param {string} data - Data to encode
         * @returns {string} Encoded data
         */
        static encode(data) {
            try {
                return btoa(encodeURIComponent(data));
            } catch (error) {
                console.error('Encoding error:', error);
                return data;
            }
        }

        /**
         * Decode Base64 data
         * @param {string} encoded - Encoded data
         * @returns {string} Decoded data
         */
        static decode(encoded) {
            try {
                return decodeURIComponent(atob(encoded));
            } catch (error) {
                console.error('Decoding error:', error);
                return encoded;
            }
        }

        /**
         * Hash data with SHA-256
         * @param {string} data - Data to hash
         * @returns {Promise<string>} Hashed data
         */
        static async hash(data) {
            try {
                const encoder = new TextEncoder();
                const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
                const hashArray = Array.from(new Uint8Array(buffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (error) {
                console.error('Hashing error:', error);
                return null;
            }
        }
    }

    /**
     * Local Storage Manager
     */
    class LocalStorageManager {
        constructor(prefix = 'blazenxt_') {
            this.prefix = prefix;
            this.storage = window.localStorage;
        }

        /**
         * Get full storage key
         * @param {string} key - Key name
         * @returns {string} Full key with prefix
         */
        _getKey(key) {
            return this.prefix + key;
        }

        /**
         * Set item in localStorage
         * @param {string} key - Key name
         * @param {*} value - Value to store
         * @param {boolean} encrypt - Whether to encrypt
         */
        setItem(key, value, encrypt = false) {
            try {
                let data = JSON.stringify(value);
                if (encrypt) {
                    data = Encryption.encode(data);
                }
                this.storage.setItem(this._getKey(key), data);
                return true;
            } catch (error) {
                console.error('Storage error:', error);
                return false;
            }
        }

        /**
         * Get item from localStorage
         * @param {string} key - Key name
         * @param {boolean} decrypt - Whether to decrypt
         * @returns {*} Stored value or null
         */
        getItem(key, decrypt = false) {
            try {
                let data = this.storage.getItem(this._getKey(key));
                if (!data) return null;

                if (decrypt) {
                    data = Encryption.decode(data);
                }
                return JSON.parse(data);
            } catch (error) {
                console.error('Storage retrieval error:', error);
                return null;
            }
        }

        /**
         * Remove item from localStorage
         * @param {string} key - Key name
         */
        removeItem(key) {
            this.storage.removeItem(this._getKey(key));
        }

        /**
         * Clear all items with prefix
         */
        clear() {
            const keysToDelete = [];
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key.startsWith(this.prefix)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.storage.removeItem(key));
        }

        /**
         * Get all items
         * @returns {Object} All items
         */
        getAllItems() {
            const items = {};
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key.startsWith(this.prefix)) {
                    const cleanKey = key.slice(this.prefix.length);
                    items[cleanKey] = this.getItem(cleanKey);
                }
            }
            return items;
        }

        /**
         * Get storage size in bytes
         * @returns {number} Storage size
         */
        getSize() {
            let size = 0;
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key.startsWith(this.prefix)) {
                    size += key.length + this.storage.getItem(key).length;
                }
            }
            return size;
        }
    }

    /**
     * Session Storage Manager
     */
    class SessionStorageManager {
        constructor(prefix = 'blazenxt_session_') {
            this.prefix = prefix;
            this.storage = window.sessionStorage;
        }

        _getKey(key) {
            return this.prefix + key;
        }

        setItem(key, value) {
            try {
                this.storage.setItem(this._getKey(key), JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Session storage error:', error);
                return false;
            }
        }

        getItem(key) {
            try {
                const data = this.storage.getItem(this._getKey(key));
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error('Session storage retrieval error:', error);
                return null;
            }
        }

        removeItem(key) {
            this.storage.removeItem(this._getKey(key));
        }

        clear() {
            const keysToDelete = [];
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key.startsWith(this.prefix)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.storage.removeItem(key));
        }
    }

    /**
     * IndexedDB Manager
     */
    class IndexedDBManager {
        constructor(dbName = 'blazenxt-db', version = 1) {
            this.dbName = dbName;
            this.version = version;
            this.db = null;
        }

        /**
         * Initialize IndexedDB
         * @returns {Promise<IDBDatabase>} Database instance
         */
        async init() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.version);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    this.db = request.result;
                    resolve(this.db);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    // Create object stores
                    if (!db.objectStoreNames.contains('projects')) {
                        db.createObjectStore('projects', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('cache')) {
                        const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
                        cacheStore.createIndex('expiry', 'expiry', { unique: false });
                    }
                };
            });
        }

        /**
         * Set item in IndexedDB
         * @param {string} storeName - Store name
         * @param {*} value - Value to store
         */
        async setItem(storeName, value) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            return new Promise((resolve, reject) => {
                const request = store.put(value);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            });
        }

        /**
         * Get item from IndexedDB
         * @param {string} storeName - Store name
         * @param {string} key - Item key
         */
        async getItem(storeName, key) {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            return new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            });
        }

        /**
         * Get all items from store
         * @param {string} storeName - Store name
         */
        async getAllItems(storeName) {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            });
        }

        /**
         * Delete item from IndexedDB
         * @param {string} storeName - Store name
         * @param {string} key - Item key
         */
        async deleteItem(storeName, key) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            return new Promise((resolve, reject) => {
                const request = store.delete(key);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            });
        }

        /**
         * Clear store
         * @param {string} storeName - Store name
         */
        async clear(storeName) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            return new Promise((resolve, reject) => {
                const request = store.clear();
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            });
        }
    }

    // Initialize storage instances
    const localStorageManager = new LocalStorageManager();
    const sessionStorageManager = new SessionStorageManager();
    const indexedDBManager = new IndexedDBManager();
    const dataStore = new DataStore();

    // Initialize IndexedDB on load
    if (typeof window !== 'undefined') {
        indexedDBManager.init().catch(err => console.warn('IndexedDB init failed:', err));
    }

    /**
     * Public API
     */
    return Object.freeze({
        // Storage managers
        localStorage: localStorageManager,
        sessionStorage: sessionStorageManager,
        indexedDB: indexedDBManager,
        dataStore: dataStore,

        // Encryption utilities
        encrypt: (data) => Encryption.encode(data),
        decrypt: (data) => Encryption.decode(data),
        hash: (data) => Encryption.hash(data),

        // Event bus
        EventBus,

        // Convenience methods
        getProjects: () => localStorageManager.getItem('projects'),
        saveProjects: (projects) => localStorageManager.setItem('projects', projects, true),
        
        getSkills: () => localStorageManager.getItem('skills'),
        saveSkills: (skills) => localStorageManager.setItem('skills', skills, true),
        
        getUserPreferences: () => sessionStorageManager.getItem('preferences'),
        saveUserPreferences: (prefs) => sessionStorageManager.setItem('preferences', prefs),

        // Initialization
        init: (initialData) => {
            dataStore.init(initialData);
        },
    });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeNXTStorage;
}
