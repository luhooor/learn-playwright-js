import winston from 'winston';
import { test } from '@playwright/test';

export class Logger {
    constructor() {
        // Custom format: [Timestamp][LEVEL] - message
        const cleanFormat = winston.format.printf(({ timestamp, level, message }) => {
            const levelUpper = level.toUpperCase();
            return `[${timestamp}][${levelUpper}] - ${message}`;
        });

        // Create Winston logger for file logging
        this.fileLogger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                cleanFormat
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
                    format: winston.format.combine(
                        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        cleanFormat
                    )
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
            test.info(`ℹ️  ${message}`);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file (which also logs to console via transport)
        this.fileLogger.info(message);
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
            test.info(`❌ ${errorMessage}`);
        } catch (err) {
            // Not in test context, skip Playwright logging
        }

        // Log to file (which also logs to console via transport)
        this.fileLogger.error(errorMessage);
    }

    /**
     * Log warning message to both Playwright reporter and file
     * @param {string} message - Message to log
     */
    warn(message) {
        try {
            // Log to Playwright test reporter if in test context
            test.info(`⚠️  ${message}`);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file (which also logs to console via transport)
        this.fileLogger.warn(message);
    }

    /**
     * Log debug message to both Playwright reporter and file
     * @param {string} message - Message to log
     */
    debug(message) {
        try {
            // Log to Playwright test reporter if in test context
            test.info(`🐛 ${message}`);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file only in debug mode (which also logs to console via transport)
        if (process.env.LOG_LEVEL === 'debug') {
            this.fileLogger.debug(message);
        }
    }

    /**
     * Log step message with special formatting
     * @param {string} stepName - Name of the test step
     * @param {string} description - Step description
     */
    step(stepName, description = '') {
        const message = description ? `STEP: ${stepName} - ${description}` : `STEP: ${stepName}`;

        try {
            // Log to Playwright test reporter with step formatting if in test context
            test.info(`🔸 ${message}`);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file (which also logs to console via transport)
        this.fileLogger.info(message);
    }

    /**
     * Log action message with special formatting for user actions
     * @param {string} action - Action being performed
     * @param {string} target - Target of the action
     */
    action(action, target = '') {
        const message = target ? `ACTION: ${action} on ${target}` : `ACTION: ${action}`;

        try {
            // Log to Playwright test reporter if in test context
            test.info(`🎯 ${message}`);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file (which also logs to console via transport)
        this.fileLogger.info(message);
    }

    /**
     * Log assertion message
     * @param {string} assertion - Assertion being made
     * @param {boolean} passed - Whether assertion passed
     */
    assertion(assertion, passed = true) {
        const status = passed ? 'ASSERTION PASSED' : 'ASSERTION FAILED';
        const message = `${status}: ${assertion}`;

        try {
            // Log to Playwright test reporter if in test context
            test.info(passed ? `✅ ${message}` : `❌ ${message}`);
        } catch (error) {
            // Not in test context, skip Playwright logging
        }

        // Log to file (which also logs to console via transport)
        if (passed) {
            this.fileLogger.info(message);
        } else {
            this.fileLogger.error(message);
        }
    }
}

