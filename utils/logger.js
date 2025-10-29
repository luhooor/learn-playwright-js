import winston from 'winston';
import { test } from '@playwright/test';

export class Logger {
    constructor() {
        // Create Winston logger for file logging
        this.fileLogger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({
                    filename: 'test-results/logs/error.log',
                    level: 'error'
                }),
                new winston.transports.File({
                    filename: 'test-results/logs/combined.log'
                }),
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ],
        });
    }

    /**
     * Log info message to both Playwright reporter and file
     * @param {string} message - Message to log
     */
    info(message) {
        try {
            // Log to Playwright test reporter (will appear in HTML report) if in test context
            test.info(message);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file
        this.fileLogger.info(message);

        // Also log to console for immediate feedback
        console.log(`ℹ️  ${message}`);
    }

    /**
     * Log error message to both Playwright reporter and file
     * @param {string} message - Message to log
     * @param {Error} error - Optional error object
     */
    error(message, error = null) {
        const errorMessage = error ? `${message}: ${error.message}` : message;

        try {
            // Log to Playwright test reporter if in test context
            test.info(`❌ ERROR: ${errorMessage}`);
        } catch (err) {
            // Not in test context, skip Playwright logging
        }

        // Log to file
        this.fileLogger.error(errorMessage, error);

        // Also log to console
        console.error(`❌ ${errorMessage}`);
    }

    /**
     * Log warning message to both Playwright reporter and file
     * @param {string} message - Message to log
     */
    warn(message) {
        try {
            // Log to Playwright test reporter if in test context
            test.info(`⚠️  WARNING: ${message}`);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file
        this.fileLogger.warn(message);

        // Also log to console
        console.warn(`⚠️  ${message}`);
    }

    /**
     * Log debug message to both Playwright reporter and file
     * @param {string} message - Message to log
     */
    debug(message) {
        try {
            // Log to Playwright test reporter if in test context
            test.info(`🐛 DEBUG: ${message}`);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file
        this.fileLogger.debug(message);

        // Also log to console in debug mode
        if (process.env.LOG_LEVEL === 'debug') {
            console.log(`🐛 ${message}`);
        }
    }

    /**
     * Log step message with special formatting
     * @param {string} stepName - Name of the test step
     * @param {string} description - Step description
     */
    step(stepName, description = '') {
        const message = description ? `${stepName}: ${description}` : stepName;

        try {
            // Log to Playwright test reporter with step formatting if in test context
            test.info(`🔸 STEP: ${message}`);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file
        this.fileLogger.info(`STEP: ${message}`);

        // Also log to console with highlighting
        console.log(`\n🔸 STEP: ${message}\n`);
    }

    /**
     * Log action message with special formatting for user actions
     * @param {string} action - Action being performed
     * @param {string} target - Target of the action
     */
    action(action, target = '') {
        const message = target ? `${action} on ${target}` : action;

        try {
            // Log to Playwright test reporter if in test context
            test.info(`🎯 ACTION: ${message}`);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file
        this.fileLogger.info(`ACTION: ${message}`);

        // Also log to console
        console.log(`🎯 ${message}`);
    }

    /**
     * Log assertion message
     * @param {string} assertion - Assertion being made
     * @param {boolean} passed - Whether assertion passed
     */
    assertion(assertion, passed = true) {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        const message = `${status}: ${assertion}`;

        try {
            // Log to Playwright test reporter if in test context
            test.info(message);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file
        if (passed) {
            this.fileLogger.info(`ASSERTION PASSED: ${assertion}`);
        } else {
            this.fileLogger.error(`ASSERTION FAILED: ${assertion}`);
        }

        // Also log to console
        console.log(message);
    }
}

