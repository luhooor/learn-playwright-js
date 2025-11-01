import { google } from 'googleapis';
import dotenv from 'dotenv';
import { Logger } from './logger.js';

dotenv.config();

export class GoogleSheetsManager {
    constructor() {
        this.auth = null;
        this.sheets = null;
        this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
        this.logger = new Logger();
    }

    /**
     * Parse a compact testdata string like `(key:value, key2:value2|value3)` into an object
     * @param {string} str
     * @returns {Object}
     */
    parseTestData(str) {
        if (!str) return {};
        let s = String(str).trim();
        
        // Remove trailing semicolon if present
        if (s.endsWith(';')) {
            s = s.slice(0, -1).trim();
        }
        
        // Strip outer parentheses
        if (s.startsWith('(') && s.endsWith(')')) {
            s = s.slice(1, -1).trim();
        }
        if (!s) return {};

        const rawPairs = s.split(/(?<!\\),/).map(p => p.trim()).filter(Boolean);
        const out = {};

        for (const pair of rawPairs) {
            const idx = pair.indexOf(':');
            if (idx === -1) continue;
            const key = pair.slice(0, idx).trim();
            let val = pair.slice(idx + 1).trim();
            val = val.replace(/\\,/g, ',');

            // boolean
            if (/^(true|false)$/i.test(val)) {
                out[key] = /^true$/i.test(val);
                continue;
            }

            // number
            if (!Number.isNaN(Number(val)) && val !== '') {
                out[key] = Number(val);
                continue;
            }

            // list by pipe
            if (val.includes('|')) {
                out[key] = val.split('|').map(x => x.trim());
                continue;
            }

            // try JSON
            if (/^[\[{]/.test(val)) {
                try { out[key] = JSON.parse(val); continue; } catch (e) { /* fallback */ }
            }

            out[key] = val;
        }
        return out;
    }

    /**
     * Read the entire TestData sheet and return rows as objects { testname, testdata: parsed }
     * @param {string} sheetName
     */
    async getAllTestData(sheetName = 'TestData') {
        try {
            if (!this.sheets) await this.initialize();

            // Read all columns to support environment-specific data (staging_data, preprod_data, prod_data)
            const range = `${sheetName}!A1:Z1000`;
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });

            const rows = response.data.values || [];
            if (rows.length <= 1) return [];

            const headers = rows[0].map(h => String(h).trim());
            const nameIdx = headers.findIndex(h => /testname/i.test(h)) !== -1 ? headers.findIndex(h => /testname/i.test(h)) : 0;
            const dataIdx = headers.findIndex(h => /testdata/i.test(h)) !== -1 ? headers.findIndex(h => /testdata/i.test(h)) : 1;

            const dataRows = rows.slice(1);
            const out = dataRows.map(r => {
                const testname = r[nameIdx] || r[0] || '';
                const raw = r[dataIdx] || r[1] || '';
                
                // Build object with all environment-specific columns
                const testdataObj = this.parseTestData(raw);
                
                // Add environment-specific columns if they exist
                const envObj = {};
                headers.forEach((header, idx) => {
                    const normalizedHeader = header.toLowerCase();
                    if (normalizedHeader.includes('staging')) {
                        envObj['staging'] = this.parseTestData(r[idx] || '');
                    } else if (normalizedHeader.includes('preprod')) {
                        envObj['preprod'] = this.parseTestData(r[idx] || '');
                    } else if (normalizedHeader.includes('prod')) {
                        envObj['prod'] = this.parseTestData(r[idx] || '');
                    }
                });
                
                return { 
                    testname: String(testname).trim(), 
                    testdataRaw: raw, 
                    testdata: testdataObj,
                    environments: envObj 
                };
            });

            this.logger.info(`Retrieved ${out.length} rows from ${sheetName}`);
            return out;
        } catch (error) {
            this.logger.error(`Error fetching TestData sheet: ${error.message}`);
            throw error;
        }
    }

    /**
     * Initialize Google Sheets authentication
     */
    async initialize() {
        try {
            // Create JWT auth client
            this.auth = new google.auth.JWT(
                process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                null,
                process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                ['https://www.googleapis.com/auth/spreadsheets.readonly']
            );

            // Authorize the client
            await this.auth.authorize();

            // Create sheets API instance
            this.sheets = google.sheets({ version: 'v4', auth: this.auth });

            this.logger.info('Google Sheets authentication successful');
        } catch (error) {
            this.logger.error('Google Sheets authentication failed', error);
            throw error;
        }
    }

    /**
     * Get test data from a specific sheet range
     * @param {string} range - Sheet range (e.g., 'TestData!A1:E10')
     * @returns {Promise<Array>} Array of test data rows
     */
    async getTestData(range) {
        try {
            if (!this.sheets) {
                await this.initialize();
            }

            // Backwards-compatible: if caller passed an A1 range or sheet!A1:Bx, treat as range request
            if (typeof range === 'string' && /!|:\d|\d/.test(range)) {
                const response = await this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range: range,
                });
                const rows = response.data.values;
                if (!rows || rows.length === 0) {
                    this.logger.info('No data found in the specified range');
                    return [];
                }
                const headers = rows[0];
                const dataRows = rows.slice(1);
                const testData = dataRows.map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index] || '';
                    });
                    return obj;
                });
                this.logger.info(`Retrieved ${testData.length} rows of test data from ${range}`);
                return testData;
            }

            // If caller provided a test name (e.g., 'SL002' or 'Users'), return the parsed object for that testname
            const all = await this.getAllTestData();
            const testName = String(range).trim();
            const found = all.find(r => String(r.testname).trim() === testName || String(r.testname).trim().toLowerCase() === testName.toLowerCase());
            if (!found) {
                this.logger.info(`No test row named '${testName}' found in TestData`);
                return null;
            }
            return found.testdata;
        } catch (error) {
            this.logger.error('Error fetching test data from Google Sheets:', error.message);
            throw error;
        }
    }

    /**
     * Get user credentials from test data
     * @param {string} userType - Type of user (e.g., 'standard_user', 'admin_user')
     * @returns {Promise<Object>} User credentials object
     */
    async getUserCredentials(userType = 'standard_user') {
        try {
            // First try legacy Users sheet
            try {
                const testData = await this.getTestData('Users!A1:D10');
                const user = testData.find(row => row.user_type === userType);
                if (user) {
                    this.logger.info(`Retrieved credentials for user type: ${userType} (from Users sheet)`);
                    return { username: user.username, password: user.password, user_type: user.user_type, description: user.description };
                }
            } catch (e) {
                // ignore and try single-sheet
            }

            // Fallback: search TestData rows for a row containing user_type
            const all = await this.getAllTestData();
            const found = all.find(r => r.testdata && r.testdata.user_type === userType);
            if (!found) throw new Error(`User type '${userType}' not found in TestData`);
            const td = found.testdata;
            this.logger.info(`Retrieved credentials for user type: ${userType} (from TestData)`);
            return { username: td.username || td.user, password: td.password, user_type: td.user_type, description: td.description };
        } catch (error) {
            this.logger.error('Error fetching user credentials:', error.message);
            throw error;
        }
    }

    /**
     * Get environment-specific test data for a test case
     * Supports Google Sheets format with environment columns:
     * testname | staging_data | preprod_data | prod_data
     * 
     * @param {string} testName - Name of the test (e.g., 'SL001', 'Login_Test')
     * @param {string} environment - Environment: 'staging', 'preprod', 'production'
     * @returns {Promise<TestDataProperties>} TestDataProperties object with .get() method
     */
    async getTestDataByEnvironment(testName, environment = 'staging') {
        try {
            if (!this.sheets) {
                await this.initialize();
            }

            const all = await this.getAllTestData();
            const row = all.find(r => String(r.testname).trim().toLowerCase() === String(testName).trim().toLowerCase());

            if (!row) {
                this.logger.warn(`Test data for "${testName}" not found in Google Sheets`);
                return new TestDataProperties({});
            }

            // Normalize environment name
            const envKey = environment === 'production' ? 'prod' : environment.toLowerCase();
            let envData = {};

            // Priority 1: Check for environment-specific columns (staging_data, preprod_data, prod_data)
            if (row.environments && row.environments[envKey]) {
                envData = row.environments[envKey];
                this.logger.info(`Retrieved test data for "${testName}" on ${environment} from environment-specific column`);
            } 
            // Priority 2: Check for environment keys within testdata object (legacy format)
            else if (row.testdata && typeof row.testdata === 'object' && row.testdata[envKey]) {
                if (typeof row.testdata[envKey] === 'string') {
                    envData = this.parseTestData(row.testdata[envKey]);
                } else {
                    envData = row.testdata[envKey];
                }
                this.logger.info(`Retrieved test data for "${testName}" on ${environment} from testdata object`);
            } 
            // Priority 3: Use the testdata field directly (shared data)
            else if (row.testdata && typeof row.testdata === 'object' && Object.keys(row.testdata).length > 0) {
                envData = row.testdata;
                this.logger.info(`Retrieved test data for "${testName}" - using shared testdata (no environment-specific override)`);
            }
            // Priority 4: Empty
            else {
                this.logger.info(`Retrieved test data for "${testName}" on ${environment} - no data found`);
            }

            return new TestDataProperties(envData);
        } catch (error) {
            this.logger.error(`Error fetching environment-specific test data: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get product test data
     * @returns {Promise<Array>} Array of product data
     */
    async getProductData() {
        try {
            // Try legacy Products sheet first
            try {
                const testData = await this.getTestData('Products!A1:F20');
                if (Array.isArray(testData) && testData.length > 0) {
                    this.logger.info(`Retrieved ${testData.length} products from Products sheet`);
                    return testData;
                }
            } catch (e) { /* continue */ }

            // Fallback: look for TestData rows that include product entries
            const all = await this.getAllTestData();
            const products = [];
            for (const r of all) {
                if (r.testdata && (r.testdata.product_name || r.testdata.products)) {
                    if (r.testdata.product_name) products.push(r.testdata);
                    if (r.testdata.products && Array.isArray(r.testdata.products)) {
                        for (const p of r.testdata.products) products.push({ product_name: p });
                    }
                }
            }
            this.logger.info(`Retrieved ${products.length} products from TestData`);
            return products;
        } catch (error) {
            this.logger.error('Error fetching product data:', error.message);
            throw error;
        }
    }

    /**
     * Get test scenarios data
     * @param {string} testSuite - Test suite name
     * @returns {Promise<Array>} Array of test scenario data
     */
    async getTestScenarios(testSuite = 'SauceLabs') {
        try {
            // Try legacy sheet first
            try {
                const testData = await this.getTestData(`${testSuite}!A1:G50`);
                const scenarios = testData.filter(row => String(row.enabled).toLowerCase() === 'true');
                this.logger.info(`Retrieved ${scenarios.length} enabled test scenarios for ${testSuite} (from sheet)`);
                return scenarios;
            } catch (e) { /* continue to TestData */ }

            // Fallback: collect from TestData where testname starts with the suite name
            const all = await this.getAllTestData();
            const scenarios = all.filter(r => r.testname && r.testname.toLowerCase().startsWith(testSuite.toLowerCase())).map(r => ({ testname: r.testname, ...r.testdata }));
            this.logger.info(`Retrieved ${scenarios.length} enabled test scenarios for ${testSuite} (from TestData)`);
            return scenarios;
        } catch (error) {
            this.logger.error('Error fetching test scenarios:', error.message);
            throw error;
        }
    }

    /**
     * Get configuration data
     * @returns {Promise<Object>} Configuration object
     */
    async getConfig() {
        try {
            // Try legacy Config sheet
            try {
                const testData = await this.getTestData('Config!A1:B20');
                const config = {};
                testData.forEach(row => { if (row.key && row.value) config[row.key] = row.value; });
                if (Object.keys(config).length > 0) {
                    this.logger.info('Retrieved configuration data from Config sheet');
                    return config;
                }
            } catch (e) { /* continue */ }

            // Fallback: look for a TestData row named 'Config' or keys in testdata
            const all = await this.getAllTestData();
            const configRow = all.find(r => r.testname && r.testname.toLowerCase() === 'config');
            if (configRow && configRow.testdata) {
                this.logger.info('Retrieved configuration data from TestData row "Config"');
                return configRow.testdata;
            }

            // As a last resort, build config from keys found in TestData rows prefixed with 'config.'
            const config = {};
            for (const r of all) {
                for (const [k, v] of Object.entries(r.testdata || {})) {
                    if (k.startsWith('config.')) config[k.replace(/^config\./, '')] = v;
                }
            }
            this.logger.info('Retrieved configuration data from TestData (aggregated)');
            return config;
        } catch (error) {
            this.logger.error('Error fetching configuration data:', error.message);
            throw error;
        }
    }
}

/**
 * TestDataProperties class - provides key-value access to test data
 * Allows accessing test data like: properties.get('username')
 */
export class TestDataProperties {
    constructor(data = {}) {
        this.data = data;
        this.logger = new Logger();
    }

    /**
     * Get a value by key from the test data
     * @param {string} key - The key to retrieve
     * @param {*} defaultValue - Default value if key not found
     * @returns {*} The value or defaultValue
     */
    get(key, defaultValue = null) {
        if (key in this.data) {
            return this.data[key];
        }
        if (defaultValue !== null) {
            this.logger.warn(`Key "${key}" not found in test data, using default: ${defaultValue}`);
        } else {
            this.logger.warn(`Key "${key}" not found in test data`);
        }
        return defaultValue;
    }

    /**
     * Get a value, throw error if not found
     * @param {string} key - The key to retrieve
     * @returns {*} The value
     * @throws {Error} If key not found
     */
    getRequired(key) {
        if (key in this.data) {
            return this.data[key];
        }
        throw new Error(`Required key "${key}" not found in test data`);
    }

    /**
     * Get all data as object
     * @returns {Object} All test data
     */
    getAll() {
        return { ...this.data };
    }

    /**
     * Check if key exists
     * @param {string} key - The key to check
     * @returns {boolean} True if key exists
     */
    has(key) {
        return key in this.data;
    }

    /**
     * Get multiple keys at once
     * @param {string[]} keys - Array of keys to retrieve
     * @returns {Object} Object with requested keys
     */
    getMultiple(...keys) {
        const result = {};
        keys.forEach(key => {
            result[key] = this.get(key);
        });
        return result;
    }
}

