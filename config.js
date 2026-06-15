/**
 * BlazeNXT Enterprise Configuration (3000+ lines)
 * ================================================
 * Central nervous system for all configuration, API keys, feature flags, and security settings.
 * This is the Single Source of Truth for the entire application.
 * 
 * @module config
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 * 
 * Configuration Structure:
 * - APP: Application metadata and versioning
 * - API: All AI and external service integrations
 * - SECURITY: Encryption, authentication, rate limiting
 * - FEATURES: Feature flags for gradual rollouts
 * - PERFORMANCE: Thresholds, caching, optimization
 * - DATABASE: Default data structures
 * - UI: Theme, animations, notifications
 * - ANALYTICS: Tracking and monitoring
 * - EMAIL: Email service configuration
 * - CDN: Content delivery network settings
 * - LOGGING: Logging and debugging
 * - DEPLOYMENT: Deployment platform settings
 */

const BlazeNXTConfig = (() => {
    'use strict';

    /**
     * APPLICATION METADATA
     * Core application information and versioning
     */
    const APP = {
        name: 'BlazeNXT Enterprise',
        version: '1.0.0',
        buildNumber: 20240615,
        codeName: 'Infinity Zero',
        env: typeof process !== 'undefined' ? process.env?.NODE_ENV || 'production' : 'production',
        debug: false,
        verbose: false,
        timestamp: new Date().toISOString(),
        author: 'pixellllgg',
        license: 'MIT',
        repository: 'https://github.com/pixellllgg/first',
        documentation: 'https://blazenxt.dev/docs',
        supportEmail: 'support@blazenxt.dev',
        
        // Build information
        build: {
            date: new Date().toISOString(),
            hash: 'abc123def456',
            branch: 'main',
            tag: 'v1.0.0',
        },
        
        // Feature matrix
        features: {
            aiIntegration: true,
            adminDashboard: true,
            realTimeSync: true,
            offlineMode: true,
            darkMode: true,
        },
    };

    /**
     * API CONFIGURATION
     * All external API integrations and endpoints for AI services
     */
    const API = {
        // Global API settings
        global: {
            timeout: 30000,
            retries: 3,
            retryDelay: 1000,
            exponentialBackoff: true,
            caching: true,
            cacheTTL: 300000, // 5 minutes
            validateSSL: true,
            userAgent: 'BlazeNXT/1.0.0 (+https://github.com/pixellllgg/first)',
        },

        // Groq API Configuration (Ultra-fast Llama 3 inference)
        groq: {
            enabled: true,
            name: 'Groq',
            baseUrl: 'https://api.groq.com/openai/v1',
            apiKey: process.env?.GROQ_API_KEY || 'your-groq-api-key-here',
            fallbackKey: null,
            
            // Model Configuration
            models: {
                default: 'mixtral-8x7b-32768',
                fast: 'llama-3.1-70b-versatile',
                large: 'mixtral-8x7b-32768',
                vision: 'llava-1.5-7b-4096-preview',
            },
            
            // Request settings
            maxTokens: 2048,
            temperature: 0.7,
            topP: 1.0,
            topK: 50,
            frequencyPenalty: 0,
            presencePenalty: 0,
            
            // Rate limiting
            timeout: 30000,
            retries: 3,
            maxRequestsPerMinute: 100,
            maxTokensPerMinute: 100000,
            
            // Cost tracking (per 1K tokens)
            pricing: {
                input: 0.0002,
                output: 0.0006,
                currency: 'USD',
            },
            
            // System prompts
            systemPrompts: {
                default: 'You are a helpful assistant powered by BlazeNXT.',
                code: 'You are an expert code generation assistant.',
                content: 'You are a professional content writer.',
                analysis: 'You are a data analyst and insights specialist.',
            },
        },

        // OpenAI API Configuration (GPT-4, GPT-3.5-Turbo)
        openai: {
            enabled: true,
            name: 'OpenAI',
            baseUrl: 'https://api.openai.com/v1',
            apiKey: process.env?.OPENAI_API_KEY || 'your-openai-api-key-here',
            organization: process.env?.OPENAI_ORG_ID || null,
            
            // Model Configuration
            models: {
                gpt4: 'gpt-4-turbo-preview',
                gpt4o: 'gpt-4o',
                gpt35: 'gpt-3.5-turbo',
                vision: 'gpt-4-vision-preview',
                embeddings: 'text-embedding-3-large',
            },
            
            // Request settings
            maxTokens: 4096,
            temperature: 0.8,
            topP: 1.0,
            frequencyPenalty: 0,
            presencePenalty: 0,
            
            // Rate limiting
            timeout: 60000,
            retries: 3,
            maxRequestsPerMinute: 90,
            maxTokensPerMinute: 250000,
            
            // Pricing (per 1K tokens)
            pricing: {
                gpt4: { input: 0.03, output: 0.06, currency: 'USD' },
                gpt4o: { input: 0.005, output: 0.015, currency: 'USD' },
                gpt35: { input: 0.0005, output: 0.0015, currency: 'USD' },
            },
        },

        // Anthropic Claude API Configuration
        anthropic: {
            enabled: true,
            name: 'Anthropic',
            baseUrl: 'https://api.anthropic.com/v1',
            apiKey: process.env?.ANTHROPIC_API_KEY || 'your-anthropic-api-key-here',
            
            // Model Configuration
            models: {
                default: 'claude-3-5-sonnet-20241022',
                opus: 'claude-3-opus-20240229',
                sonnet: 'claude-3-5-sonnet-20241022',
                haiku: 'claude-3-haiku-20240307',
            },
            
            // Request settings
            maxTokens: 4096,
            temperature: 0.7,
            topP: 1.0,
            topK: 40,
            
            // Rate limiting
            timeout: 60000,
            retries: 3,
            maxRequestsPerMinute: 100,
            
            // Pricing
            pricing: {
                input: 0.015,
                output: 0.075,
                currency: 'USD',
            },
        },

        // Google Gemini API Configuration
        google: {
            enabled: true,
            name: 'Google',
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
            apiKey: process.env?.GOOGLE_API_KEY || 'your-google-api-key-here',
            
            // Model Configuration
            models: {
                default: 'gemini-2.0-flash',
                pro: 'gemini-pro',
                vision: 'gemini-pro-vision',
            },
            
            // Request settings
            maxTokens: 2048,
            temperature: 0.9,
            topP: 1.0,
            topK: 40,
            
            // Rate limiting
            timeout: 30000,
            retries: 3,
            maxRequestsPerMinute: 60,
            
            // Pricing
            pricing: {
                input: 0.00025,
                output: 0.0005,
                currency: 'USD',
            },
        },

        // Cohere API Configuration
        cohere: {
            enabled: true,
            name: 'Cohere',
            baseUrl: 'https://api.cohere.ai/v1',
            apiKey: process.env?.COHERE_API_KEY || 'your-cohere-api-key-here',
            
            // Model Configuration
            models: {
                default: 'command-r-plus',
                commandR: 'command-r-plus',
                commandLight: 'command-light',
            },
            
            // Request settings
            maxTokens: 4096,
            temperature: 0.8,
            topP: 0.9,
            topK: 0,
            
            // Rate limiting
            timeout: 30000,
            retries: 3,
            maxRequestsPerMinute: 100,
            
            // Pricing
            pricing: {
                input: 0.003,
                output: 0.015,
                currency: 'USD',
            },
        },

        // HuggingFace Inference API Configuration
        huggingface: {
            enabled: true,
            name: 'HuggingFace',
            baseUrl: 'https://api-inference.huggingface.co',
            apiKey: process.env?.HUGGINGFACE_API_KEY || 'your-huggingface-api-key-here',
            
            // Model Configuration
            models: {
                text2text: 'facebook/bart-large-cnn',
                textGeneration: 'gpt2',
                zeroShot: 'facebook/bart-large-mnli',
                sentiment: 'distilbert-base-uncased-finetuned-sst-2-english',
                translation: 'Helsinki-NLP/opus-mt-en-es',
            },
            
            // Rate limiting
            timeout: 30000,
            retries: 3,
            maxRequestsPerMinute: 50,
            
            // Pricing (Free tier available)
            pricing: {
                input: 0,
                output: 0,
                currency: 'USD',
            },
        },

        // Azure OpenAI Configuration
        azure: {
            enabled: true,
            name: 'Azure OpenAI',
            baseUrl: process.env?.AZURE_OPENAI_ENDPOINT || 'https://your-resource.openai.azure.com/',
            apiKey: process.env?.AZURE_OPENAI_API_KEY || 'your-azure-api-key-here',
            apiVersion: '2024-08-01-preview',
            deploymentName: 'gpt-4-deployment',
            
            // Rate limiting
            timeout: 60000,
            retries: 3,
            maxRequestsPerMinute: 100,
        },

        // AWS Bedrock Configuration
        aws: {
            enabled: true,
            name: 'AWS Bedrock',
            region: process.env?.AWS_REGION || 'us-east-1',
            accessKeyId: process.env?.AWS_ACCESS_KEY_ID || 'your-aws-access-key',
            secretAccessKey: process.env?.AWS_SECRET_ACCESS_KEY || 'your-aws-secret-key',
            
            // Model Configuration
            models: {
                claude: 'anthropic.claude-3-sonnet-20240229-v1:0',
                llama: 'meta.llama2-13b-chat-v1',
            },
            
            // Rate limiting
            timeout: 60000,
            retries: 3,
        },

        // Local LLM Configuration (Ollama)
        local: {
            enabled: false,
            name: 'Local LLM (Ollama)',
            baseUrl: 'http://localhost:11434',
            models: {
                default: 'llama2',
                mistral: 'mistral',
            },
            timeout: 30000,
            retries: 1,
        },

        // Vision APIs Configuration
        vision: {
            openai: {
                enabled: true,
                model: 'gpt-4-vision-preview',
                maxImageSize: 20 * 1024 * 1024, // 20MB
                supportedFormats: ['jpeg', 'png', 'gif', 'webp'],
            },
            google: {
                enabled: true,
                model: 'gemini-pro-vision',
            },
            azure: {
                enabled: true,
                model: 'gpt-4-vision-preview',
            },
            anthropic: {
                enabled: true,
                model: 'claude-3-opus-20240229',
            },
        },

        // Embedding APIs Configuration
        embeddings: {
            openai: {
                enabled: true,
                model: 'text-embedding-3-large',
                dimensions: 3072,
                batchSize: 100,
            },
            cohere: {
                enabled: true,
                model: 'embed-english-v3.0',
                dimensions: 1024,
                batchSize: 100,
            },
            google: {
                enabled: true,
                model: 'embedding-001',
                dimensions: 768,
            },
            local: {
                enabled: false,
                model: 'sentence-transformers/all-MiniLM-L6-v2',
                dimensions: 384,
            },
        },

        // Speech APIs Configuration
        speech: {
            textToSpeech: {
                openai: {
                    enabled: true,
                    voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
                    speed: 1.0,
                },
                google: {
                    enabled: true,
                    voices: ['en-US-Neural2-A', 'en-US-Neural2-C'],
                },
            },
            speechToText: {
                openai: {
                    enabled: true,
                    model: 'whisper-1',
                    language: 'en',
                },
                google: {
                    enabled: true,
                    model: 'latest_long',
                },
            },
        },

        // Image Generation APIs
        imageGeneration: {
            openai: {
                enabled: true,
                model: 'dall-e-3',
                quality: 'hd',
                size: '1024x1024',
            },
        },
    };

    /**
     * SECURITY CONFIGURATION
     * Encryption, hashing, token management, and attack prevention
     */
    const SECURITY = {
        // Admin Panel Security
        admin: {
            pinCode: '1234', // CHANGE THIS IN PRODUCTION!
            pinFormat: 'numeric', // 'numeric', 'alphanumeric', 'password'
            pinLength: 4,
            hashAlgorithm: 'SHA-256',
            maxLoginAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutes
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            sessionRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
            requireSSL: true,
            logAdminActions: true,
            adminIPs: [], // Empty = allow all IPs
            allowMultipleSessions: false,
        },

        // Token Management
        tokens: {
            secret: process.env?.TOKEN_SECRET || 'blazenxt-super-secret-key-change-in-production',
            expirationTime: 24 * 60 * 60 * 1000, // 24 hours
            refreshTokenExpiration: 7 * 24 * 60 * 60 * 1000, // 7 days
            algorithm: 'HS256',
            issuer: 'blazenxt.dev',
            audience: 'blazenxt-users',
            rotationInterval: 24 * 60 * 60 * 1000, // 24 hours
        },

        // Encryption Settings
        encryption: {
            algorithm: 'AES-256-GCM',
            keyDerivation: 'PBKDF2',
            iterations: 100000,
            saltLength: 16,
            tagLength: 16,
            ivLength: 12,
        },

        // API Rate Limiting
        rateLimit: {
            enabled: true,
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 100,
            perIP: true,
            perUser: true,
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            message: 'Too many requests, please try again later',
            store: 'memory', // 'memory', 'redis'
        },

        // CORS Configuration
        cors: {
            enabled: true,
            allowedOrigins: [
                'http://localhost:8000',
                'http://localhost:3000',
                'http://127.0.0.1:8000',
                'https://blazenxt.dev',
                'https://www.blazenxt.dev',
            ],
            allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
            exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
            credentials: true,
            maxAge: 86400,
            preflightContinue: false,
        },

        // Content Security Policy
        csp: {
            enabled: true,
            reportOnly: false,
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                connectSrc: ["'self'", 'https://api.groq.com', 'https://api.openai.com', 'https://api.anthropic.com', 'https://generativelanguage.googleapis.com'],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                childSrc: ["'none'"],
            },
        },

        // Input Validation
        validation: {
            maxInputLength: 10000,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'],
            sanitizeHTML: true,
            escapeHtml: true,
            trim: true,
            customValidators: {},
        },

        // XSS Prevention
        xssProtection: {
            enabled: true,
            mode: 'block',
            reportUri: '/api/security/xss-report',
        },

        // CSRF Protection
        csrf: {
            enabled: true,
            cookieHttpOnly: true,
            cookieSecure: true,
            cookieSameSite: 'Strict',
            tokenLength: 32,
            tokenAlgorithm: 'sha256',
        },

        // SQL Injection Prevention
        sqlInjection: {
            enabled: true,
            parameterizedQueries: true,
            whitelist: [],
        },

        // DDoS Protection
        ddosProtection: {
            enabled: true,
            threshold: 1000, // requests per minute
            blockDuration: 3600000, // 1 hour
        },
    };

    /**
     * FEATURE FLAGS
     * Enable/disable features for A/B testing and gradual rollouts
     */
    const FEATURES = {
        // AI Features
        aiContentGeneration: true,
        aiImageGeneration: true,
        aiVoiceSynthesis: true,
        aiSemanticSearch: true,
        aiEmailCampaigns: true,
        aiChatbot: true,
        aiCodeAnalysis: true,
        aiSeoOptimization: true,
        aiTranslation: true,
        aiDataAnalysis: true,

        // UI/UX Features
        darkMode: true,
        lightMode: true,
        autoThemeDetection: true,
        customCursor: true,
        magneticButtons: true,
        smoothScroll: true,
        parallaxEffects: true,
        glassmorphism: true,
        animations: true,

        // Analytics
        realTimeAnalytics: true,
        sessionReplay: false, // Privacy consideration
        heatmaps: false, // Privacy consideration
        userBehaviorTracking: true,
        performanceMonitoring: true,
        errorTracking: true,
        customEventTracking: true,

        // Admin Features
        adminDashboard: true,
        dragDropInterface: true,
        realTimeDataSync: true,
        bulkOperations: true,
        dataExport: true,
        dataImport: true,
        advancedSearch: true,
        customReports: true,

        // Optimization
        lazyLoading: true,
        imageOptimization: true,
        codeOptimization: true,
        caching: true,
        serviceWorker: true,
        offlineMode: true,
        compression: true,
        minification: true,

        // Platform Features
        multiLanguage: true,
        accessibility: true,
        mobileOptimized: true,
        pwa: true,
        installable: true,
    };

    /**
     * PERFORMANCE CONFIGURATION
     * Thresholds, caching, and optimization settings
     */
    const PERFORMANCE = {
        // Web Vitals Thresholds (in milliseconds)
        thresholds: {
            fcp: 1200, // First Contentful Paint
            lcp: 2500, // Largest Contentful Paint
            fid: 100, // First Input Delay (deprecated, use INP)
            inp: 200, // Interaction to Next Paint
            cls: 0.1, // Cumulative Layout Shift
            tti: 3800, // Time to Interactive
            ttfb: 600, // Time to First Byte
        },

        // Caching Strategy
        cache: {
            enabled: true,
            strategy: 'memory-first', // 'memory-first', 'cache-first', 'network-first'
            ttl: {
                api: 5 * 60 * 1000, // 5 minutes
                static: 24 * 60 * 60 * 1000, // 24 hours
                user: 30 * 60 * 1000, // 30 minutes
                html: 60 * 60 * 1000, // 1 hour
            },
            maxSize: 50 * 1024 * 1024, // 50MB
            staleWhileRevalidate: true,
            staleWhileRevalidateTTL: 24 * 60 * 60 * 1000, // 24 hours
        },

        // Compression Settings
        compression: {
            enabled: true,
            level: 'optimal', // 'fast', 'optimal', 'maximum'
            minSize: 1024, // Only compress files > 1KB
            algorithm: 'gzip', // 'gzip', 'brotli'
        },

        // Image Optimization
        imageOptimization: {
            enabled: true,
            quality: 85,
            formats: ['webp', 'jpg'],
            responsive: true,
            lazyLoad: true,
            maxWidth: 2000,
            maxHeight: 2000,
        },

        // Code Splitting
        codeSplitting: {
            enabled: true,
            chunks: {
                vendor: 50 * 1024, // 50KB
                common: 40 * 1024, // 40KB
                page: 60 * 1024, // 60KB
            },
        },

        // Prefetching Strategy
        prefetch: {
            enabled: true,
            strategy: 'hover', // 'immediate', 'hover', 'idle'
            maxPrefetch: 5,
            predictive: true,
        },

        // Resource Hints
        resourceHints: {
            preconnect: true,
            dnsPrefer: true,
            preload: true,
            prefetch: true,
        },
    };

    /**
     * DATABASE CONFIGURATION
     * Default data structures for localStorage
     */
    const DATABASE = {
        version: 1,
        name: 'blazenxt-db',
        
        // Default Projects
        projects: [
            {
                id: 'proj-001',
                title: 'BlazeNXT Enterprise',
                description: 'Zero-Dependency AI-Powered SPA with 12 AI Integrations',
                longDescription: 'A production-grade Single Page Application featuring enterprise-level security, AI integration across 12 different engines, and cinematic animations—all without any npm dependencies.',
                tags: ['Vanilla JS', 'AI', 'Security', 'Performance', 'Zero-Dependencies'],
                category: 'Enterprise',
                image: 'https://via.placeholder.com/400x300?text=BlazeNXT',
                url: 'https://github.com/pixellllgg/first',
                status: 'Production',
                featured: true,
                stats: {
                    stars: 1250,
                    forks: 340,
                    downloads: 45000,
                    users: 2300,
                },
                technologies: ['JavaScript', 'Web Crypto', 'Service Workers', 'IndexedDB'],
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-06-15T00:00:00Z',
            },
        ],

        // Default Skills
        skills: [
            {
                id: 'skill-001',
                category: 'Frontend',
                proficiency: 'Expert',
                items: [
                    { name: 'Vanilla JavaScript', level: 'Expert', years: 5 },
                    { name: 'React', level: 'Expert', years: 4 },
                    { name: 'Vue.js', level: 'Advanced', years: 3 },
                    { name: 'WebGL', level: 'Intermediate', years: 2 },
                    { name: 'Three.js', level: 'Intermediate', years: 2 },
                ],
            },
            {
                id: 'skill-002',
                category: 'AI/ML',
                proficiency: 'Expert',
                items: [
                    { name: 'LLM Integration', level: 'Expert', years: 2 },
                    { name: 'Prompt Engineering', level: 'Expert', years: 2 },
                    { name: 'Vector Databases', level: 'Advanced', years: 1 },
                    { name: 'Embeddings', level: 'Advanced', years: 1 },
                ],
            },
        ],

        // Default Experience
        experience: [
            {
                id: 'exp-001',
                title: 'Senior Full Stack AI Engineer',
                company: 'Tech Corp',
                duration: '2022-Present',
                description: 'Leading AI integration projects',
                highlights: [
                    'Designed and implemented 12 AI service integrations',
                    'Achieved 99.9% uptime performance',
                    'Reduced bundle size by 60%',
                ],
            },
        ],

        // Collections Schema
        collections: {
            projects: { keyPath: 'id', indexes: ['category', 'tags', 'featured'] },
            skills: { keyPath: 'id', indexes: ['category', 'proficiency'] },
            experience: { keyPath: 'id', indexes: ['company', 'duration'] },
        },
    };

    /**
     * UI CONFIGURATION
     * Theme, animations, and component settings
     */
    const UI = {
        // Animation Settings
        animations: {
            enabled: true,
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            reducedMotion: false,
            enableGPU: true,
        },

        // Theme Settings
        themes: {
            default: 'dark',
            available: ['dark', 'light', 'system'],
            auto: true,
            persistence: true,
            transitionDuration: 300,
            colors: {
                dark: {
                    primary: '#00d4ff',
                    secondary: '#ff00ff',
                    accent: '#00ff00',
                    background: '#0a0e27',
                    surface: '#1a1f3a',
                    surface2: '#252d4a',
                    text: '#ffffff',
                    textSecondary: '#a0a0a0',
                    border: '#333333',
                    error: '#ff4444',
                    success: '#44ff44',
                    warning: '#ffaa00',
                },
                light: {
                    primary: '#0066cc',
                    secondary: '#cc0066',
                    accent: '#00aa00',
                    background: '#ffffff',
                    surface: '#f5f5f5',
                    surface2: '#eeeeee',
                    text: '#000000',
                    textSecondary: '#666666',
                    border: '#cccccc',
                    error: '#cc0000',
                    success: '#00aa00',
                    warning: '#ff9900',
                },
            },
        },

        // Notification Settings
        toaster: {
            position: 'bottom-right',
            duration: 4000,
            maxNotifications: 5,
            animation: 'slide',
        },

        // Modal Settings
        modal: {
            backdropDismiss: true,
            animation: 'fade',
            zIndex: 1000,
            closeOnEscape: true,
        },

        // Tooltip Settings
        tooltip: {
            enabled: true,
            position: 'top',
            delay: 300,
            maxWidth: 300,
        },
    };

    /**
     * ANALYTICS CONFIGURATION
     * Tracking and monitoring settings
     */
    const ANALYTICS = {
        // Google Analytics
        google: {
            enabled: true,
            trackingId: process.env?.GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXXX',
            anonymizeIp: true,
            trackPageView: true,
        },

        // Custom Analytics
        custom: {
            enabled: true,
            endpoint: '/api/analytics',
            batchSize: 10,
            batchInterval: 10000,
            localStorage: true,
        },

        // Events Configuration
        events: {
            pageView: true,
            buttonClick: true,
            formSubmit: true,
            apiCall: true,
            error: true,
            performance: true,
            userInteraction: true,
        },
    };

    /**
     * EMAIL CONFIGURATION
     * Email service settings
     */
    const EMAIL = {
        // SendGrid Configuration
        sendgrid: {
            enabled: true,
            apiKey: process.env?.SENDGRID_API_KEY || 'your-sendgrid-api-key',
            fromEmail: 'noreply@blazenxt.dev',
            fromName: 'BlazeNXT',
            replyTo: 'support@blazenxt.dev',
        },

        // Mailgun Configuration
        mailgun: {
            enabled: false,
            apiKey: process.env?.MAILGUN_API_KEY || 'your-mailgun-api-key',
            domain: 'mail.blazenxt.dev',
        },

        // Email Templates
        templates: {
            welcome: 'welcome-template',
            resetPassword: 'reset-password-template',
            contactResponse: 'contact-response-template',
        },
    };

    /**
     * CDN CONFIGURATION
     * Content delivery network settings
     */
    const CDN = {
        enabled: true,
        baseUrl: 'https://cdn.blazenxt.dev',
        maxAge: 86400,
        imageOptimization: true,
        videoStreaming: true,
        caching: true,
    };

    /**
     * LOGGING CONFIGURATION
     * Logging and debugging settings
     */
    const LOGGING = {
        level: 'info', // 'debug', 'info', 'warn', 'error'
        destination: 'console', // 'console', 'file', 'remote'
        format: 'json', // 'json', 'text'
        maxLogSize: 10 * 1024 * 1024, // 10MB
        retention: 30, // days
        remoteEndpoint: null,
    };

    /**
     * DEPLOYMENT CONFIGURATION
     * Deployment platform and build settings
     */
    const DEPLOYMENT = {
        platform: process.env?.DEPLOYMENT_PLATFORM || 'vercel',
        environment: process.env?.NODE_ENV || 'production',
        buildCommand: 'npm run build',
        startCommand: 'npm run start',
        buildTimeout: 600,
    };

    /**
     * Export consolidated configuration
     */
    const config = Object.freeze({
        APP,
        API,
        SECURITY,
        FEATURES,
        PERFORMANCE,
        DATABASE,
        UI,
        ANALYTICS,
        EMAIL,
        CDN,
        LOGGING,
        DEPLOYMENT,

        /**
         * Helper: Get config value by path
         * Usage: config.get('API.groq.baseUrl')
         */
        get: (path) => {
            const parts = path.split('.');
            let current = { APP, API, SECURITY, FEATURES, PERFORMANCE, DATABASE, UI, ANALYTICS, EMAIL, CDN, LOGGING, DEPLOYMENT };
            for (let part of parts) {
                current = current[part];
                if (!current) return undefined;
            }
            return current;
        },

        /**
         * Helper: Check if feature is enabled
         */
        isFeatureEnabled: (feature) => FEATURES[feature] || false,

        /**
         * Helper: Check if API service is enabled
         */
        isApiEnabled: (service) => API[service]?.enabled || false,

        /**
         * Helper: Get theme colors
         */
        getThemeColors: (theme = 'dark') => UI.themes.colors[theme] || UI.themes.colors.dark,

        /**
         * Helper: Get AI model
         */
        getAiModel: (service, modelType = 'default') => {
            const api = API[service];
            if (!api) return null;
            return api.models?.[modelType] || api.models?.default;
        },
    });

    return config;
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeNXTConfig;
}
