const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                // Replace text-gray-300, 400, 500 with text-muted
                // But avoid if it's already text-muted or if it's not a className
                if (/className=(["'{`])([^"'{`]*?)\b(text-gray-(?:300|400|500))\b/.test(line)) {
                    lines[i] = line.replace(/\btext-gray-(?:300|400|500)\b/g, 'text-muted');
                    line = lines[i];
                    modified = true;
                }

                if (line.includes('text-white')) {
                    // Check if line looks like an icon component e.g. <TrendingUp ... /> or <DollarSign ... />
                    const isIcon = /<[A-Z][a-zA-Z]+\s+[^>]*size=/.test(line) || /<[A-Z][a-zA-Z]+Icon/.test(line) || /<[A-Z][a-zA-Z]+.*className=.*text-white/.test(line);
                    const isButton = /<button/.test(line);

                    // Exclude if it has background colors or gradient stops
                    const hasBg = /bg-/.test(line) || /from-/.test(line) || /to-/.test(line) || /style=\{{/.test(line);
                    const isTableHeader = /<th/.test(line);
                    const hasRing = /ring-/.test(line);
                    const hasBorderWhite = /border-white/.test(line);

                    // We only want to replace safely: h1, h2, h3, h4, h5, h6, p, span, div, td, label, li
                    const isTextTag = /<(h[1-6]|p|span|div|td|label|li|strong|b|i)\b/.test(line);

                    if (!isIcon && !isButton && !hasBg && !isTableHeader && isTextTag && !hasBorderWhite) {
                        lines[i] = line.replace(/\btext-white\b/g, 'text-foreground');
                        modified = true;
                    }
                    // Special case: sometimes the tag is multiline, e.g. <h2 \n className="text-white">
                    else if (!isIcon && !isButton && !hasBg && !isTableHeader && !hasBorderWhite) {
                        // just checking if there are no suspicious classes
                        lines[i] = line.replace(/\btext-white\b/g, 'text-foreground');
                        modified = true;
                    }
                }
            }
            content = lines.join('\n');

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDir(srcDir);
console.log('Done.');
