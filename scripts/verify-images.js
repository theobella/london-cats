
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_FILE = path.join(__dirname, '../src/data/realCats.json');
const IMAGES_DIR = path.join(__dirname, '../public');

async function verifyImages() {
    try {
        console.log('Loading data...');
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        const cats = JSON.parse(data);
        console.log(`Found ${cats.length} cats.`);

        let errors = 0;

        for (const cat of cats) {
            if (!cat.image) {
                console.error(`[FAIL] Cat ${cat.name} (${cat.id}) has no image field.`);
                errors++;
                continue;
            }

            // Strip query params (e.g. ?v=2)
            const cleanPath = cat.image.split('?')[0];

            // Construct absolute path
            // cleanPath is like "/cats/bat-0.webp"
            const absPath = path.join(IMAGES_DIR, cleanPath);

            try {
                const stats = await fs.stat(absPath);
                if (stats.size === 0) {
                    console.error(`[FAIL] Image for ${cat.name} exists but is empty: ${cleanPath}`);
                    errors++;
                } else {
                    // console.log(`[OK]   ${cat.name}: ${cleanPath} (${(stats.size / 1024).toFixed(1)} KB)`);
                }
            } catch (err) {
                console.error(`[FAIL] Image for ${cat.name} missing: ${cleanPath} (Source: ${cat.sourceid})`);
                errors++;
            }
        }

        if (errors === 0) {
            console.log(`\nSUCCESS: All ${cats.length} cat images are verified and present locally.`);
            process.exit(0);
        } else {
            console.error(`\nFAILURE: Found ${errors} image issues.`);
            process.exit(1);
        }

    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

verifyImages();
