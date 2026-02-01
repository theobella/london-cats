
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure images directory exists relative to project root (assuming script is in scripts/)
const IMAGES_DIR = path.resolve(__dirname, '../public/cats');

async function downloadImage(url, filename) {
    if (!url || url.includes('placekitten')) return 'cats/default.jpg';

    try {
        const filepath = path.join(IMAGES_DIR, filename);

        // If file exists and size > 0, skip download to be faster/polite?
        // But for "Fix", let's re-download if it's missing or just blindly return path if exists.
        // Step 611 confirmed they exist.
        // Let's just return the path to be safe and avoid 403 blocks during re-download if Battersea started blocking again.

        // Check if exists
        // Note: fs/promises access throws if not exists
        try {
            await fs.access(filepath);
            // It exists.
            return `/cats/${filename}`;
        } catch {
            // Not exists, download.
        }

        const response = await axios.get(url, {
            responseType: 'stream',
            headers: HEADERS
        });

        await pipeline(response.data, createWriteStream(filepath));
        return `/cats/${filename}`;
    } catch (err) {
        console.error(`Failed to download image ${url}:`, err.message);
        // If download fails (e.g. 403), check if we have a stale file?
        // If not, use placeholder.
        return 'https://placekitten.com/300/300';
    }
}


const SOURCES = JSON.parse(await fs.readFile(path.join(__dirname, 'sites.json'), 'utf-8'));

// Keys changed in sites.json, updating references if any were hardcoded, 
// allows dynamic usage in future.
const BATTERSEA_CONFIG = SOURCES.BATTERSEA;
const CP_CONFIG = SOURCES.CATS_PROTECTION_SOUTH_LONDON;



async function scrapeBattersea() {
    try {
        console.log('Fetching Battersea...');
        const { data } = await axios.get(SOURCES.BATTERSEA.url, { headers: HEADERS });
        const $ = cheerio.load(data);
        const cats = [];

        const elements = $('.card').toArray();
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const name = $(el).find('.card-title').text().trim();
            const cardText = $(el).text().trim();

            let linkHref = $(el).attr('href');
            if (!linkHref) linkHref = $(el).find('a').attr('href');
            if (!linkHref) linkHref = $(el).parent('a').attr('href'); // Check parent
            const link = linkHref ? (linkHref.startsWith('http') ? linkHref : 'https://www.battersea.org.uk' + linkHref) : null;

            // Filter out non-cat pages (stories, shop, fostering, etc.)
            if (!link || !link.includes('/cats/cat-rehoming-gallery/')) continue;

            let image = $(el).find('img').attr('src');
            if (!image) image = $(el).find('img').attr('data-src');

            const isReserved = cardText.includes('Reserved');

            let ageVal = 'Unknown';
            const ageMatch = cardText.match(/Age:?\s*(.*?)(?:\n|$)/i);
            if (ageMatch) ageVal = ageMatch[1].trim();

            if (name && link) {
                // Download Image
                let localImage = 'https://placekitten.com/300/300';
                let originalImage = image ? ('https://www.battersea.org.uk' + image) : 'https://placekitten.com/300/300';

                if (image) {
                    // Force jpg extension because Battersea serves JPEGs even if URL is .webp
                    const ext = 'jpg';
                    const filename = `bat-${i}.${ext}`;
                    const realUrl = image.startsWith('http') ? image : 'https://www.battersea.org.uk' + image;
                    localImage = await downloadImage(realUrl, filename);
                }

                const idSlug = link ? link.split('/').pop().toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                // Stable ID: bat-name-slug
                const stableId = `bat-${idSlug}`;

                cats.push({
                    id: stableId,
                    name,
                    age: ageVal,
                    breed: 'Domestic Short-hair',
                    coloring: 'Unknown',
                    location: 'Battersea',
                    sourceType: 'Shelter',
                    sourceId: 'battersea',
                    preferences: [],
                    status: isReserved ? 'Reserved' : 'Available',
                    image: localImage ? `${localImage}?v=3` : localImage,
                    originalImage: originalImage,
                    dateListed: new Date().toISOString(),
                    dateReserved: isReserved ? new Date().toISOString() : null,
                    link
                });
            }
        }
        console.log(`Found ${cats.length} cats at Battersea.`);
        return cats;
    } catch (error) {
        console.error('Error scraping Battersea:', error.message);
        return [];
    }
}

async function scrapeCatsProtection(config) {
    try {
        const { url, location } = config;
        console.log(`Fetching Cats Protection (${location})...`);
        const { data } = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(data);

        const cats = [];
        // Note: The structure of CP site uses specific ASP.NET popup links
        const catLinks = $('a[href*="RenderCatForAdoptionPopup"]').toArray();
        console.log(`Found ${catLinks.length} potential CP cat links.`);

        for (let i = 0; i < catLinks.length; i++) {
            const el = catLinks[i];
            const href = $(el).attr('href');
            const fullLink = href.startsWith('http') ? href : 'https://www.cats.org.uk' + href;

            const text = $(el).text().trim();
            const firstLine = text.split('\n')[0].trim();

            // Regex to handle "Name 2y male" or "Name 2 years old Male"
            // Captures: Name, Age string, Gender
            const nameMatch = firstLine.match(/^(.*?)\s+((?:\d+\s*(?:years?|months?|[ym])(?:\s+old)?))\s+(male|female)/i);

            let name = 'Unknown';
            let age = 'Unknown';
            let gender = 'Unknown';
            if (nameMatch) {
                name = nameMatch[1];
                age = nameMatch[2];
                gender = nameMatch[3];
            } else {
                name = firstLine.split(' ')[0];
            }

            const isReserved = text.includes('RESERVED');
            let image = 'https://placekitten.com/300/300';
            let description = '';

            try {
                const { data: popupData } = await axios.get(fullLink, { headers: HEADERS });
                const $pop = cheerio.load(popupData);

                const imgSrc = $pop('img').first().attr('src');
                if (imgSrc) {
                    if (imgSrc.startsWith('http')) {
                        image = imgSrc;
                    } else if (imgSrc.startsWith('..')) {
                        // Handle relative path ../uploads
                        image = 'https://www.cats.org.uk' + imgSrc.replace(/^\.\./, '');
                    } else {
                        image = 'https://www.cats.org.uk' + (imgSrc.startsWith('/') ? '' : '/') + imgSrc;
                    }
                }

                description = $pop('body').text().trim().substring(0, 500);

            } catch (e) {
                console.log(`Error fetching details for ${name}: ${e.message}`);
            }

            if (gender && gender.toLowerCase() === 'female') gender = 'Female';
            if (gender && gender.toLowerCase() === 'male') gender = 'Male';

            // Generate a specialized ID suffix based on location to avoid collisions
            // Generate Stable ID based on Cats Protection ID in URL (catId=XXXX)
            // URL format: ...&catId=58797
            let cpId = 'unknown';
            const idMatch = fullLink.match(/catId=(\d+)/);
            if (idMatch) {
                cpId = idMatch[1];
            } else {
                // Fallback to name slug if no ID found
                cpId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }

            // e.g. cp-58797
            // We don't strictly need location in ID if the number is unique globally for CP, 
            // but let's keep it simple: CP tends to use unique IDs system-wide.
            const stableId = `cp-${cpId}`;

            let localImage = 'https://placekitten.com/300/300';
            if (image && !image.includes('placekitten')) {
                const ext = image.split('.').pop().split('?')[0] || 'jpg';
                // Use stable ID for filename to avoid re-downloading!
                const filename = `${stableId}.${ext}`;
                localImage = await downloadImage(image, filename);
            }

            // NEW LINK FORMAT: https://www.cats.org.uk/southlondon#adopt-58943
            // Base URL is config.url (e.g., https://www.cats.org.uk/southlondon)
            // We need to strip trailing slashes just in case
            const baseUrl = url.replace(/\/$/, '');
            const newLink = `${baseUrl}#adopt-${cpId}`;

            cats.push({
                id: stableId,
                name,
                age,
                breed: 'Domestic Short-hair',
                coloring: gender,
                gender: gender || 'Unknown',
                location: location,
                sourceType: 'Physical Center',
                sourceId: 'cats_protection',
                preferences: [],
                description,
                status: isReserved ? 'Reserved' : 'Available',
                image: localImage ? `${localImage}?v=2` : localImage,
                originalImage: image,
                dateListed: new Date().toISOString(),
                dateReserved: isReserved ? new Date().toISOString() : null,
                link: newLink
            });

            // Be polite
            await new Promise(r => setTimeout(r, 200));
        }

        console.log(`Found ${cats.length} cats at Cats Protection ${location}.`);
        return cats;
    } catch (error) {
        console.error(`Error scraping Cats Protection ${config.location}:`, error.message);
        return [];
    }
}
async function scrapeLick() {
    try {
        console.log('Fetching London Inner City Kitties...');
        const { data } = await axios.get('https://www.london-inner-city-kitties.org/adopt', { headers: HEADERS });
        const $ = cheerio.load(data);
        const cats = [];

        // Strategy: Find Name in H4, get UUID, find related image and description
        const nameElements = $('h4').toArray();
        console.log(`Found ${nameElements.length} potential name headers.`);

        for (let i = 0; i < nameElements.length; i++) {
            const el = nameElements[i];
            const name = $(el).text().trim().toLowerCase();

            // Ignore "Kitties for adoption" header or empty
            if (!name || name.includes('kitties for adoption') || name.length > 50) continue;

            const repeaterItem = $(el).closest('div[id^="comp-"]');
            if (repeaterItem.length) {
                const id = repeaterItem.attr('id');
                const uuid = id.split('__item-')[1];

                if (uuid) {
                    // Find all components for this item
                    const relatedElements = $(`[id*="${uuid}"]`);

                    let image = null;
                    let description = '';
                    let age = 'Unknown';

                    relatedElements.each((_, relEl) => {
                        // Image
                        const img = $(relEl).find('img').first();
                        if (img.length) {
                            const src = img.attr('src') || img.attr('data-src');
                            if (src) image = src;
                        }

                        // Description/Age text
                        const text = $(relEl).text().trim();
                        if (text.length > 20 && !text.includes(name)) { // Avoid name block
                            description += text + '\n';
                        }
                    });

                    // Specific parse for age in description?
                    // Usually "2 years old / female / indoor" is the first line of description
                    const firstLine = description.split('\n')[0];
                    if (firstLine) {
                        // Simple extraction
                        const parts = firstLine.split('/');
                        if (parts.length > 0) age = parts[0].trim();
                    }

                    // Download image
                    let localImage = 'https://placekitten.com/300/300';
                    if (image) {
                        const filename = `lick-${i}.jpg`; // Assumption: source is likely jpg/webp
                        localImage = await downloadImage(image, filename);
                    }

                    // Stable ID: lick-name
                    const stableId = `lick-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

                    cats.push({
                        id: stableId,
                        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
                        age: age,
                        breed: 'Domestic Short-hair',
                        coloring: 'Unknown',
                        location: 'London',
                        sourceType: 'Network',
                        sourceId: 'lick',
                        preferences: [],
                        description: description.substring(0, 500),
                        status: 'Available', // LICK usually removes adopted ones
                        image: localImage,
                        originalImage: image,
                        dateListed: new Date().toISOString(),
                        dateReserved: null,
                        link: 'https://www.london-inner-city-kitties.org/adopt'
                    });
                }
            }
        }

        console.log(`Found ${cats.length} cats at L.I.C.K.`);
        return cats;

    } catch (error) {
        console.error('Error scraping LICK:', error.message);
        return [];
    }
}

async function scrapeMayhew() {
    console.log('Fetching The Mayhew (Placeholder)...');
    return [];
}
// Helper: Merge new cat with existing record
function mergeCatData(newCat, existingCat) {
    if (!existingCat) {
        // New cat
        return {
            ...newCat,
            dateListed: new Date().toISOString(),
            dateReserved: newCat.status === 'Reserved' ? new Date().toISOString() : null
        };
    }

    // Existing cat - preserve timestamps and enrich
    const wasReserved = existingCat.status === 'Reserved';
    const isReserved = newCat.status === 'Reserved';

    let dateReserved = existingCat.dateReserved;
    if (isReserved && !wasReserved) {
        dateReserved = new Date().toISOString();
    } else if (!isReserved) {
        dateReserved = null; // Un-reserved?
    }

    return {
        ...newCat,
        dateListed: existingCat.dateListed || new Date().toISOString(),
        dateReserved: dateReserved
    };
}

// Helper: Extract metadata from text
function extractMetadata(cat) {
    const text = (cat.description + ' ' + cat.name + ' ' + (cat.preferences || []).join(' ')).toLowerCase();

    // Indoor/Outdoor
    let environment = 'Unknown';
    if (text.includes('indoor only') || text.includes('indoor home')) {
        environment = 'Indoor-Only';
    } else if (text.includes('garden') || text.includes('outdoor access')) {
        environment = 'Outdoor Access';
    }

    // Health
    let health = 'Healthy';
    if (text.includes('medical') || text.includes('condition') || text.includes('treatment') || text.includes('fiv')) {
        health = 'Needs Care'; // Broad category for metrics
    }

    // Color normalization (simple heuristic)
    let color = 'Unknown';
    const colors = ['black', 'white', 'tabby', 'ginger', 'tortoiseshell', 'calico', 'grey', 'blue'];
    for (const c of colors) {
        if (text.includes(c)) {
            color = c.charAt(0).toUpperCase() + c.slice(1);
            break;
        }
    }

    // Age Category
    let ageCategory = 'Adult';
    if (cat.age) {
        const age = cat.age.toLowerCase();
        if (age.includes('month') || age.includes('kitten')) {
            ageCategory = 'Kitten';
        } else if (age.includes('year')) {
            const years = parseInt(age.match(/\d+/)?.[0] || '0');
            if (years < 2) ageCategory = 'Young Adult';
            else if (years >= 10) ageCategory = 'Senior';
        }
    }

    return {
        ...cat,
        environment,
        health,
        color: cat.coloring !== 'Unknown' ? cat.coloring : color,
        ageCategory
    };
}

async function main() {
    let existingCatsMap = new Map();
    const outputPath = path.join(__dirname, '../src/data/realCats.json');

    try {
        const existingData = await fs.readFile(outputPath, 'utf-8');
        const cats = JSON.parse(existingData);
        cats.forEach(c => existingCatsMap.set(c.id, c));
        console.log(`Loaded ${cats.length} existing cats for merging.`);
    } catch (e) {
        console.log('No existing data found, starting fresh.');
    }

    let batterseaCats = await scrapeBattersea();

    if (batterseaCats.length === 0) {
        console.log('Scrape failed or empty, looking for restored data...');
        try {
            const restoredPath = path.join(__dirname, '../src/data/restoredBattersea.json');
            const restoredData = await fs.readFile(restoredPath, 'utf-8');
            const restoredCats = JSON.parse(restoredData);

            // Update restored cats to use local images
            for (let i = 0; i < restoredCats.length; i++) {
                const cat = restoredCats[i];
                // If image is URL, try download. If local, re-verify?
                let urlToDownload = cat.image;
                if (!urlToDownload || !urlToDownload.startsWith('http')) {
                    // If it's already local, maybe originalImage has the URL?
                    urlToDownload = cat.originalImage;
                }

                if (urlToDownload && urlToDownload.startsWith('http')) {
                    // Force jpg because we know Battersea serves JPEGs disguised as WebP
                    const ext = 'jpg';
                    const filename = `bat-${i}.${ext}`;
                    const localPath = await downloadImage(urlToDownload, filename);
                    cat.originalImage = urlToDownload;
                    cat.image = localPath ? `${localPath}?v=4` : localPath;
                }
            }
            batterseaCats = restoredCats;
            console.log(`Loaded ${batterseaCats.length} cats from restored backup.`);
        } catch (e) {
            console.log('No restored data found either.');
        }
    }

    // Scrape CP South London
    const cpSouthCats = await scrapeCatsProtection(SOURCES.CATS_PROTECTION_SOUTH_LONDON);

    const lickCats = await scrapeLick();

    // Combine all
    // Combine all new scrapes
    const allScrapedCats = [...batterseaCats, ...cpSouthCats, ...lickCats];

    // Map for quick lookup of new cats
    const scrapedIds = new Set(allScrapedCats.map(c => c.id));

    // Track IDs that were migrated from old (index-based) to new (stable)
    // so we don't duplicate them or mark them as adopted.
    const migratedOldIds = new Set();

    const finalCats = [];

    // 1. Process New Scraped Cats (Merge with Existing or Migrate)
    allScrapedCats.forEach(newCat => {
        let existing = existingCatsMap.get(newCat.id);

        // MIGRATION LOGIC:
        // If exact ID match missing, check for a "Ghost" match by Name + Source
        // (Handling the transition from bat-0 -> bat-bruno)
        if (!existing) {
            // Find a cat with same Name and Source that doesn't share this ID
            // and looks like an old-style ID (optional check, but safer)
            const ghostMatch = [...existingCatsMap.values()].find(oldCat =>
                oldCat.name.toLowerCase() === newCat.name.toLowerCase() &&
                oldCat.sourceId === newCat.sourceId &&
                !scrapedIds.has(oldCat.id) // Ensure we don't steal an ID that actually exists in new set (unlikely with change)
            );

            if (ghostMatch) {
                console.log(`Migrating history: ${ghostMatch.id} (${ghostMatch.name}) -> ${newCat.id}`);
                existing = ghostMatch;
                migratedOldIds.add(ghostMatch.id);
            }
        }

        const merged = mergeCatData(newCat, existing);
        finalCats.push(extractMetadata(merged));
    });

    // 2. Process Missing Cats (Soft Delete / Adopted)
    existingCatsMap.forEach((existingCat, id) => {
        // If this cat was NOT found in the new scrape AND it wasn't migrated to a new ID
        if (!scrapedIds.has(id) && !migratedOldIds.has(id)) {

            // It's gone from the site!
            if (existingCat.status !== 'Adopted') {
                console.log(`Marking as Adopted: ${existingCat.name} (${id})`);
                existingCat.status = 'Adopted';
                if (!existingCat.dateAdopted) {
                    existingCat.dateAdopted = new Date().toISOString();
                }
                // Clear reservation date if they are now adopted? 
                // Usually reserved -> adopted. Keep reserved date for "Time to Reserve" metric.
            }

            finalCats.push(existingCat);
        }
    });

    await fs.writeFile(outputPath, JSON.stringify(finalCats, null, 2));
    console.log(`Saved ${finalCats.length} cats to ${outputPath}`);
}

main();
