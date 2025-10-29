import fs from 'fs';
import path from 'path';

async function globalTeardown() {
    console.log('🧹 Starting global teardown...');

    // Clean up any temporary files if needed
    // You can add cleanup logic here such as:
    // - Removing temporary test files
    // - Cleaning up test databases
    // - Sending test completion notifications

    // Generate a simple test summary
    try {
        const resultsPath = 'test-results/results.json';
        if (fs.existsSync(resultsPath)) {
            const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
            const summary = {
                total: results.suites?.reduce((acc, suite) => acc + suite.specs?.length || 0, 0) || 0,
                passed: results.suites?.reduce((acc, suite) =>
                    acc + (suite.specs?.filter(spec => spec.tests?.some(test => test.status === 'passed'))?.length || 0), 0) || 0,
                failed: results.suites?.reduce((acc, suite) =>
                    acc + (suite.specs?.filter(spec => spec.tests?.some(test => test.status === 'failed'))?.length || 0), 0) || 0,
                duration: results.stats?.duration || 0
            };

            console.log('📊 Test Execution Summary:');
            console.log(`   Total Tests: ${summary.total}`);
            console.log(`   Passed: ${summary.passed}`);
            console.log(`   Failed: ${summary.failed}`);
            console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`);
        }
    } catch (error) {
        console.log('⚠️  Could not generate test summary:', error.message);
    }

    console.log('✅ Global teardown completed');
}

export default globalTeardown;

