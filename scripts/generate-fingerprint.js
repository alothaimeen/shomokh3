const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Critical files to monitor
const CRITICAL_FILES = [
    'prisma/schema.prisma',
    'src/lib/auth.ts',
    'src/middleware.ts',
    '.env',
    'next.config.ts',
    'package.json'
];

// Generate hash for a file
function getFileHash(filePath) {
    try {
        const fullPath = path.resolve(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) return null;

        // Security: Don't read .env content directly
        if (filePath === '.env') {
            const stats = fs.statSync(fullPath);
            return crypto.createHash('sha256')
                .update(`ENV_FILE_${stats.mtime.getTime()}_${stats.size}`)
                .digest('hex').slice(0, 8);
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
    } catch (error) {
        return null;
    }
}

// Load existing fingerprint
function loadFingerprint() {
    try {
        return JSON.parse(fs.readFileSync('SESSION_FINGERPRINT.json', 'utf8'));
    } catch {
        return null;
    }
}

// Generate new fingerprint
function generateFingerprint(sessionNumber) {
    const previous = loadFingerprint();
    const fingerprint = {
        meta: {
            last_session: sessionNumber,
            last_update: new Date().toISOString(),
            next_review: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        critical_files: {},
        breaking_changes_since_last_session: previous?.breaking_changes_since_last_session || [],
        deprecated_patterns: previous?.deprecated_patterns || [],
        active_constraints: previous?.active_constraints || {}
    };

    // Check each critical file
    CRITICAL_FILES.forEach(filePath => {
        const hash = getFileHash(filePath);
        let stats = null;
        try {
            stats = fs.statSync(path.resolve(process.cwd(), filePath));
        } catch (e) {
            // File might not exist
        }

        const previousHash = previous?.critical_files?.[filePath]?.hash;

        if (hash) {
            fingerprint.critical_files[filePath] = {
                hash: hash,
                last_modified: stats ? stats.mtime.toISOString() : new Date().toISOString(),
                changed: previousHash && previousHash !== hash,
                last_change: previousHash !== hash ? "Manual review required" :
                    previous?.critical_files?.[filePath]?.last_change || "Initial"
            };
        }
    });

    return fingerprint;
}

// Main execution
const sessionNumber = process.argv[2] || 'CURRENT';
const fingerprint = generateFingerprint(sessionNumber);

fs.writeFileSync(
    'SESSION_FINGERPRINT.json',
    JSON.stringify(fingerprint, null, 2)
);

console.log('✅ Fingerprint generated for Session', sessionNumber);

// Report changes
let hasChanges = false;
Object.entries(fingerprint.critical_files).forEach(([file, data]) => {
    if (data.changed) {
        console.log(`⚠️  Changed: ${file}`);
        hasChanges = true;
    }
});

if (!hasChanges) {
    console.log('✨ No critical file changes detected.');
}
