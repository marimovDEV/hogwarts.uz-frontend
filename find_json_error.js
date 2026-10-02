import fs from 'fs';

function checkFile(path) {
    const text = fs.readFileSync(path, 'utf8');
    let depth = 0;
    let inString = false;
    let escaped = false;

    console.log(`Checking ${path}...`);

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === '\\') {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }

        if (char === '"') {
            inString = true;
        } else if (char === '{') {
            depth++;
        } else if (char === '}') {
            depth--;
            if (depth === 0) {
                console.log(`[${path}] Root closed at index ${i}`);
                if (i < text.length - 1) {
                    const remaining = text.substring(i + 1).trim();
                    if (remaining.length > 0) {
                        console.log(`[${path}] ERROR: Content after root close! First 50 chars: "${remaining.substring(0, 50).replace(/\n/g, '\\n')}"`);
                        // Find line number
                        const linesBefore = text.substring(0, i).split('\n').length;
                        console.log(`[${path}] Root closed at line ${linesBefore}`);
                        // Find what is after?
                        const nextLines = text.substring(i + 1, i + 100).split('\n').length;
                        console.log(`[${path}] Next few chars: ${text.substring(i + 1, i + 100)}`);
                    }
                }
                return;
            }
        }
    }

    if (depth > 0) {
        console.log(`[${path}] ERROR: Unexpected end of file. Depth is ${depth}`);
    }
}

checkFile('src/locales/uz.json');
checkFile('src/locales/ru.json');
