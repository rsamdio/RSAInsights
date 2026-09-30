/**
 * scripts/set_date.js
 *
 * Convenience CLI tool to update the data release date across the entire project.
 * Usage:
 *   node scripts/set_date.js "30 Sep 2026"
 *   npm run set-date "30 Sep 2026"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const metaPath = path.join(__dirname, '..', 'data', 'metadata.json');

const newDate = process.argv[2]?.trim();

let metadata = {};
try {
    if (fs.existsSync(metaPath)) {
        metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    }
} catch (e) {
    console.error('Failed to read data/metadata.json:', e);
}

if (!newDate) {
    console.log('\n📅 Current Single Source of Truth Configuration (data/metadata.json):');
    console.log(`   dataAsOf:    "${metadata.dataAsOf || 'Not set'}"`);
    console.log(`   lastUpdated: "${metadata.lastUpdated || 'Not set'}"`);
    console.log(`   exchangeRate: ₹${metadata.currentExchangeRateINR || 96}/USD\n`);
    console.log('To update the date everywhere in the project, run:');
    console.log('   npm run set-date "30 Sep 2026"\n');
    process.exit(0);
}

metadata.dataAsOf = newDate;
metadata.lastUpdated = newDate;

fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2) + '\n');
console.log(`\n✓ Successfully updated data/metadata.json:`);
console.log(`   dataAsOf    -> "${newDate}"`);
console.log(`   lastUpdated -> "${newDate}"`);

console.log('\nRunning ETL data generator to synchronize all JSON datasets on disk...');
try {
    execSync('node scripts/generate_dashboard_data.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log(`\n✓ All datasets, UI headers, footers, APIs, and MCP endpoints are now updated to "${newDate}".\n`);
} catch (err) {
    console.error('Data generation encountered an error:', err.message);
    process.exit(1);
}
