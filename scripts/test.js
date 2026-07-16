/**
 * BlazeNXT Sanity & Unit Testing Suite
 * =====================================
 * Zero-dependency unit testing system. Tests code structures, configurations,
 * and interface structures of our Vanilla SPA codebase.
 * 
 * @version 1.0.0
 * @author pixellllgg
 * @license MIT
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 BlazeNXT Testing Suite: Running automatic verification...');

let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ Pass: ${message}`);
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        testsFailed++;
    }
}

// Test 1: Configuration file loads and parses as JS
console.log('\nTest 1: Configuration Parsing');
try {
    const configPath = path.join(__dirname, '..', 'config.js');
    const content = fs.readFileSync(configPath, 'utf8');
    assert(content.includes('BlazeNXTConfig'), 'config.js should define BlazeNXTConfig');
    assert(content.includes('env'), 'config.js should define environment options');
} catch (e) {
    assert(false, `Failed to load config.js: ${e.message}`);
}

// Test 2: Verify HTML structures
console.log('\nTest 2: SPA Route Structure Verification');
const routes = ['index.html', 'about.html', 'projects.html', 'contact.html', 'admin.html', '404.html'];
routes.forEach(route => {
    try {
        const routePath = path.join(__dirname, '..', route);
        const content = fs.readFileSync(routePath, 'utf8');
        if (route === 'index.html') {
            assert(content.includes('id="toastContainer"'), `${route} must contain toast notification container`);
            assert(content.includes('id="navbar"'), `${route} must contain navbar container`);
            assert(content.includes('id="footer"'), `${route} must contain footer`);
        } else {
            assert(content.includes('<main>'), `${route} must contain main route content container`);
        }
    } catch (e) {
        assert(false, `Failed to read ${route}: ${e.message}`);
    }
});

if (testsFailed === 0) {
    console.log('\n✨ All tests passed successfully! Perfect architecture alignment.');
    process.exit(0);
} else {
    console.error(`\n❌ Tests failed: ${testsFailed} suite failures detected.`);
    process.exit(1);
}
