import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

/**
 * Test Suite Configuration
 * Maps test directories to their base URLs
 */
const testSuiteUrls = {
    'sauce-labs': {
        name: 'Sauce Labs Demo',
        url: process.env.SAUCE_LABS_URL || 'https://www.saucedemo.com',
        description: 'Sauce Labs e-commerce demo site',
    },
    'tiket': {
        name: 'Tiket.com',
        url: 'determined by ENVIRONMENT', // Will use environment-based URL
        description: 'Tiket.com - Indonesian travel ticketing platform',
    }
};

/**
 * Environment Configuration Manager
 * Handles URL management for multiple environments (staging, preprod, production)
 * Automatically selects the correct base URL based on configuration and test suite
 */
export class EnvironmentConfig {
    constructor() {
        this.environment = process.env.ENVIRONMENT || 'staging';
        this.testSuite = this.detectTestSuite();
        this.environments = {
            staging: {
                name: 'Staging',
                url: process.env.STAGING_URL || 'https://gatotkaca.tiket.com',
                description: 'Staging environment (gatotkaca.tiket.com)',
                isProduction: false
            },
            preprod: {
                name: 'Preproduction',
                url: process.env.PREPROD_URL || 'https://preprod.tiket.com',
                description: 'Preproduction environment (preprod.tiket.com)',
                isProduction: false
            },
            production: {
                name: 'Production',
                url: process.env.PRODUCTION_URL || 'https://tiket.com',
                description: 'Production environment (tiket.com)',
                isProduction: true
            }
        };
    }

    /**
     * Detect which test suite is running based on the test file path
     * @returns {string} Test suite name (e.g., 'sauce-labs', 'tiket')
     */
    detectTestSuite() {
        // Try to get from environment variable first
        if (process.env.TEST_SUITE) {
            return process.env.TEST_SUITE;
        }

        // Try to detect from current working directory or test file
        try {
            const cwd = process.cwd();
            if (cwd.includes('sauce-labs')) return 'sauce-labs';
            if (cwd.includes('tiket')) return 'tiket';
        } catch (e) {
            // Fallback if detection fails
        }

        // Default to tiket
        return 'tiket';
    }

    /**
     * Get the base URL for the current test suite and environment
     * @returns {string} The base URL
     */
    getBaseUrl() {
        // If BASE_URL is explicitly set in .env, use it
        if (process.env.BASE_URL && process.env.BASE_URL.trim()) {
            return process.env.BASE_URL;
        }

        // For Sauce Labs tests, always use Sauce Labs URL
        if (this.testSuite === 'sauce-labs') {
            return testSuiteUrls['sauce-labs'].url;
        }

        // For Tiket tests, use environment-specific URL
        if (this.testSuite === 'tiket') {
            const env = this.environments[this.environment];
            if (!env) {
                throw new Error(
                    `Invalid ENVIRONMENT: ${this.environment}. Supported: ${Object.keys(this.environments).join(', ')}`
                );
            }
            return env.url;
        }

        // Fallback
        return this.environments[this.environment].url;
    }

    /**
     * Get the current test suite
     * @returns {string} Test suite name
     */
    getTestSuite() {
        return this.testSuite;
    }

    /**
     * Get test suite configuration
     * @returns {Object} Test suite config
     */
    getTestSuiteConfig() {
        return testSuiteUrls[this.testSuite] || testSuiteUrls['tiket'];
    }

    /**
     * Get all environment information
     * @returns {Object} Environment configuration object
     */
    getCurrentEnvironment() {
        const env = this.environments[this.environment];
        if (!env) {
            throw new Error(
                `Invalid ENVIRONMENT: ${this.environment}. Supported: ${Object.keys(this.environments).join(', ')}`
            );
        }
        return env;
    }

    /**
     * Get environment configuration by name
     * @param {string} envName - Environment name (staging, preprod, production)
     * @returns {Object} Environment configuration
     */
    getEnvironment(envName) {
        const env = this.environments[envName];
        if (!env) {
            throw new Error(
                `Invalid environment: ${envName}. Supported: ${Object.keys(this.environments).join(', ')}`
            );
        }
        return env;
    }

    /**
     * Get all available environments
     * @returns {Object} All environments
     */
    getAllEnvironments() {
        return this.environments;
    }

    /**
     * Check if current environment is production
     * @returns {boolean} True if production environment
     */
    isProduction() {
        return this.getCurrentEnvironment().isProduction;
    }

    /**
     * Get environment name
     * @returns {string} Environment name
     */
    getEnvironmentName() {
        return this.environment;
    }

    /**
     * Get environment description
     * @returns {string} Environment description
     */
    getEnvironmentDescription() {
        return this.getCurrentEnvironment().description;
    }

    /**
     * Log environment and test suite information for debugging
     */
    logEnvironmentInfo() {
        const testSuite = this.getTestSuiteConfig();
        const current = this.getCurrentEnvironment();
        const prodIndicator = current.isProduction ? '⚠️  PRODUCTION' : '✅ NON-PRODUCTION';
        
        console.log('\n' + '='.repeat(70));
        console.log('🌍 TEST CONFIGURATION');
        console.log('='.repeat(70));
        console.log(`Test Suite: ${this.testSuite.toUpperCase()} - ${testSuite.name}`);
        console.log(`Base URL: ${this.getBaseUrl()}`);
        
        if (this.testSuite === 'tiket') {
            console.log(`Environment: ${current.name}`);
            console.log(`Environment Type: ${prodIndicator}`);
        }
        
        console.log('='.repeat(70) + '\n');
    }
}

// Create and export singleton instance
export const envConfig = new EnvironmentConfig();
