#!/usr/bin/env node

/**
 * Setup script for SecurePDF development environment
 * Run this script after cloning the repository
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 SecurePDF Development Setup');
console.log('═'.repeat(50));

// Check Node.js version
const nodeVersion = process.version;
const requiredNodeVersion = '18.0.0';

console.log(`📦 Node.js version: ${nodeVersion}`);

if (nodeVersion < `v${requiredNodeVersion}`) {
    console.error(`❌ Node.js ${requiredNodeVersion}+ required`);
    process.exit(1);
}

console.log('✅ Node.js version compatible\n');

// Install dependencies
console.log('📥 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
} catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
}

// Build all packages
console.log('🔨 Building all packages...');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ All packages built successfully\n');
} catch (error) {
    console.error('❌ Build failed');
    process.exit(1);
}

// Run tests
console.log('🧪 Running tests...');
try {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ All tests passed\n');
} catch (error) {
    console.warn('⚠️  Some tests failed (this is okay for initial setup)\n');
}

// Create example documents
console.log('📄 Creating example documents...');
try {
    execSync('node examples/create-example-document.js', { stdio: 'inherit' });
    console.log('✅ Example documents created\n');
} catch (error) {
    console.error('❌ Failed to create example documents');
}

// Validate setup
console.log('🔍 Validating setup...');

const requiredDirs = [
    'packages/core/dist',
    'packages/crypto/dist', 
    'packages/validator/dist',
    'packages/viewer/dist'
];

let allGood = true;
for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
        console.log(`✅ ${dir}`);
    } else {
        console.log(`❌ ${dir} missing`);
        allGood = false;
    }
}

if (allGood) {
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Open examples/viewer-demo.html to test the viewer');
    console.log('   2. Run "npm run dev" to start development mode');
    console.log('   3. Read CONTRIBUTING.md for development guidelines');
    console.log('   4. Join our community discussions on GitHub');
    console.log('\n🚀 Happy coding with SecurePDF!');
} else {
    console.log('\n❌ Setup incomplete. Check the errors above.');
    process.exit(1);
}
