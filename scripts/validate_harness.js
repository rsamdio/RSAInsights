#!/usr/bin/env node

/**
 * Agent Harness Integrity & Drift Validator
 * 
 * Verifies:
 * 1. File references in index.md, AGENTS.md, and skills exist on disk.
 * 2. Generated JSON and CSV data files exist and are valid.
 * 3. Strict Typography: No forbidden long em dashes (Unicode \u2014) in documentation, components, or scripts.
 * 4. Package scripts and core entrypoints are intact.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
let totalChecks = 0;
let failures = 0;

function logPass(msg) {
    console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
    totalChecks++;
}

function logFail(msg) {
    console.log(`  \x1b[31m✖\x1b[0m ${msg}`);
    totalChecks++;
    failures++;
}

function resolveFilePath(target, sourceFile) {
    // Strip file:// scheme if present
    let clean = target.replace(/^file:\/\//, '');
    
    // If it's an absolute path within the workspace
    if (clean.startsWith(ROOT_DIR)) {
        return clean.split('#')[0];
    }
    
    // If absolute path from another machine or prefix, extract relative portion
    if (clean.startsWith('/')) {
        const parts = clean.split('/rotaractsouthasiadata/');
        if (parts.length > 1) {
            return path.join(ROOT_DIR, parts[1].split('#')[0]);
        }
    }
    
    // Relative to source file
    const fromSource = path.resolve(path.dirname(sourceFile), clean.split('#')[0]);
    if (fs.existsSync(fromSource)) return fromSource;
    
    // Relative to root
    return path.join(ROOT_DIR, clean.split('#')[0]);
}

// ----------------------------------------------------------------------------
// 1. Check Documentation File References
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m[1/4] Checking Documentation File References...\x1b[0m');

const docFiles = [
    path.join(ROOT_DIR, 'index.md'),
    path.join(ROOT_DIR, 'AGENTS.md'),
    path.join(ROOT_DIR, '.agents/AGENTS.md'),
    path.join(ROOT_DIR, '.agents/skills/data-pipeline/SKILL.md'),
    path.join(ROOT_DIR, '.agents/skills/ui-standards/SKILL.md'),
    path.join(ROOT_DIR, '.agents/skills/performance-optimization/SKILL.md'),
    path.join(ROOT_DIR, '.agents/skills/agent-maintenance/SKILL.md'),
];

const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

docFiles.forEach(docFile => {
    if (!fs.existsSync(docFile)) {
        logFail(`Required documentation file missing: ${path.relative(ROOT_DIR, docFile)}`);
        return;
    }
    
    const content = fs.readFileSync(docFile, 'utf8');
    let match;
    let fileRefChecks = 0;
    
    while ((match = linkRegex.exec(content)) !== null) {
        const linkTarget = match[2].trim();
        
        // Skip external web URLs
        if (linkTarget.startsWith('http://') || linkTarget.startsWith('https://') || linkTarget.startsWith('mailto:')) {
            continue;
        }
        
        const resolved = resolveFilePath(linkTarget, docFile);
        if (fs.existsSync(resolved)) {
            fileRefChecks++;
        } else {
            logFail(`Broken link in ${path.relative(ROOT_DIR, docFile)}: "${linkTarget}" -> Target does not exist (${path.relative(ROOT_DIR, resolved)})`);
        }
    }
    
    logPass(`${path.relative(ROOT_DIR, docFile)}: All ${fileRefChecks} internal file links verified`);
});

// ----------------------------------------------------------------------------
// 2. Check Data Payloads Integrity
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m[2/4] Checking Data Payloads & Schema Integrity...\x1b[0m');

const expectedJsonFiles = [
    'dashboard_summary.json',
    'zone_summary.json',
    'all_clubs.json',
    'arrears.json',
    'no_officers.json',
    'rotary_no_sponsor.json',
    'rotary_no_interact.json',
    'unified_issues.json',
    'worldwide_summary.json',
    'new_clubs.json',
    'trf_contributions.json',
    'district_officers.json'
];

expectedJsonFiles.forEach(jsonFile => {
    const filePath = path.join(ROOT_DIR, 'data', jsonFile);
    if (!fs.existsSync(filePath)) {
        logFail(`Missing data file: data/${jsonFile}`);
        return;
    }
    
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        const count = Array.isArray(parsed) ? `${parsed.length} records` : 'valid object';
        logPass(`data/${jsonFile} (${count})`);
    } catch (err) {
        logFail(`Invalid JSON in data/${jsonFile}: ${err.message}`);
    }
});

// ----------------------------------------------------------------------------
// 3. Strict Typography Check: No Long Em Dashes (\u2014)
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m[3/4] Checking Typography: Enforcing No Long Em Dashes (\\u2014)...\x1b[0m');

const forbiddenChar = '\u2014'; // Em dash \u2014

function scanForEmDashes(dir, ignoredDirs = ['node_modules', '.next', '.git', 'data', 'fulldata', 'basedata']) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let violations = [];
    
    for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.agents') continue;
        if (ignoredDirs.includes(entry.name)) continue;
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            violations = violations.concat(scanForEmDashes(fullPath, ignoredDirs));
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (['.md', '.js', '.mjs', '.css', '.json'].includes(ext)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // For root AGENTS.md, ignore the Next.js auto-generated block
                let lines = content.split('\n');
                let inNextJsBlock = false;
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.includes('<!-- BEGIN:nextjs-agent-rules -->')) {
                        inNextJsBlock = true;
                        continue;
                    }
                    if (line.includes('<!-- END:nextjs-agent-rules -->')) {
                        inNextJsBlock = false;
                        continue;
                    }
                    if (inNextJsBlock) continue;
                    
                    if (line.includes(forbiddenChar)) {
                        violations.push({
                            file: path.relative(ROOT_DIR, fullPath),
                            line: i + 1,
                            snippet: line.trim()
                        });
                    }
                }
            }
        }
    }
    return violations;
}

const emDashViolations = scanForEmDashes(ROOT_DIR);

if (emDashViolations.length === 0) {
    logPass('Zero forbidden long em dashes (\\u2014) found across codebase and documentation');
} else {
    emDashViolations.forEach(v => {
        logFail(`Forbidden em dash (\\u2014) at ${v.file}:${v.line} -> "${v.snippet}"`);
    });
}

// ----------------------------------------------------------------------------
// 4. Check Package Configuration & Core Entrypoints
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m[4/4] Checking Core Configuration & Entrypoints...\x1b[0m');

const pkgPath = path.join(ROOT_DIR, 'package.json');
if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const requiredScripts = ['dev', 'build', 'generate-data', 'validate-harness'];
    
    requiredScripts.forEach(script => {
        if (pkg.scripts && pkg.scripts[script]) {
            logPass(`package.json script: npm run ${script}`);
        } else {
            logFail(`Missing package.json script: npm run ${script}`);
        }
    });
} else {
    logFail('package.json not found');
}

const requiredFiles = [
    'next.config.mjs',
    'app/layout.js',
    'app/page.js',
    'app/globals.css',
    'lib/api.js',
    'scripts/generate_dashboard_data.js'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(ROOT_DIR, file))) {
        logPass(`Core file: ${file}`);
    } else {
        logFail(`Missing core file: ${file}`);
    }
});

// ----------------------------------------------------------------------------
// Summary
// ----------------------------------------------------------------------------
console.log('\n========================================================');
if (failures === 0) {
    console.log(`\x1b[32m\x1b[1mSUCCESS: Agent harness validation passed! (${totalChecks} checks verified)\x1b[0m`);
    console.log('========================================================\n');
    process.exit(0);
} else {
    console.log(`\x1b[31m\x1b[1mFAILURE: ${failures} check(s) failed out of ${totalChecks} total checks.\x1b[0m`);
    console.log('========================================================\n');
    process.exit(1);
}
