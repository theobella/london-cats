
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../src/data/realCats.json');

const COMMON_PREFERENCES = [
    { tag: 'Outdoor Access', keywords: ['outside access', 'outdoor access', 'garden', 'cat flap'] },
    { tag: 'Indoor Only', keywords: ['indoor only', 'indoor home', 'keep inside'] },
    { tag: 'Good with Kids', keywords: ['live with children', 'good with kids', 'family home', 'children'] },
    { tag: 'Adult Only', keywords: ['adult only', 'no children', 'quiet home'] },
    { tag: 'Good with other Cats', keywords: ['live with other cats', 'another cat'] },
    { tag: 'Solo Cat', keywords: ['only cat', 'only pet'] },
    { tag: 'Good with Dogs', keywords: ['live with dogs', 'dog friendly'] }
];

async function deepScrape() {
    try {
        console.log('Loading cats data...');
        const rawData = await fs.readFile(DATA_FILE, 'utf-8');
        const cats = JSON.parse(rawData);

        console.log(`Found ${cats.length} cats to process.`);

        const updatedCats = [];
        let processedCount = 0;

        for (const cat of cats) {
            processedCount++;
            console.log(`[${processedCount}/${cats.length}] Processing ${cat.name}...`);

            if (!cat.link) {
                console.log('  No link, skipping details.');
                updatedCats.push(cat);
                continue;
            }

            // Skip non-Battersea for now as they are scraped inline or need different logic
            if (cat.sourceId !== 'battersea') {
                console.log('  Skipping non-Battersea source.');
                updatedCats.push(cat);
                continue;
            }

            try {
                const { data } = await axios.get(cat.link);
                const $ = cheerio.load(data);

                // Extract Description
                // Strategy: Find Header "More about [Name]" and take the whole text container
                let description = '';
                $('h3').each((i, el) => {
                    const text = $(el).text();
                    if (text.includes('More about')) {
                        // The text is usually in the parent container's text or next siblings
                        // In Battersea's case, it seems to be in the same container or nearby paragraphs
                        // Let's grab the parent text and clean it up
                        const containerText = $(el).parent().text();
                        // Remove the header itself from the text if possible, or just take substring
                        description = containerText.replace(text, '').trim();
                    }
                });

                // Fallback if description is empty or too short
                if (description.length < 50) {
                    description = $('.field--name-body').text().trim() || 'No detailed description available.';
                }

                // Analyze for preferences
                const preferences = [];
                const descLower = description.toLowerCase();

                COMMON_PREFERENCES.forEach(pref => {
                    if (pref.keywords.some(k => descLower.includes(k))) {
                        preferences.push(pref.tag);
                    }
                });

                // Helper to remove duplicates
                const uniquePreferences = [...new Set(preferences)];

                // Extract Gender
                let gender = 'Unknown';
                const wholeText = $('body').text();
                if ($('.field--name-field-animal-sex').length) {
                    gender = $('.field--name-field-animal-sex').text().trim();
                } else if (wholeText.includes('Female')) {
                    gender = 'Female';
                } else if (wholeText.includes('Male')) {
                    gender = 'Male';
                }

                updatedCats.push({
                    ...cat,
                    gender: gender,
                    description: description.substring(0, 1000), // Limit length
                    preferences: uniquePreferences.length > 0 ? uniquePreferences : ['See profile for details']
                });

                // Wait a bit to be polite
                await new Promise(r => setTimeout(r, 500));

            } catch (err) {
                console.error(`  Failed to scrape ${cat.name}: ${err.message}`);
                updatedCats.push(cat); // Keep original if fail
            }
        }

        console.log('Saving updated data...');
        await fs.writeFile(DATA_FILE, JSON.stringify(updatedCats, null, 2));
        console.log('Done!');

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

deepScrape();
