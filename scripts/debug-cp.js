import axios from 'axios';
import * as cheerio from 'cheerio';

const URL = 'https://www.cats.org.uk/southlondon';

async function main() {
    console.log('Fetching main list...');
    const { data } = await axios.get(URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const $ = cheerio.load(data);

    // Find first cat link

    // Debug: Print all links
    $('a').each((i, el) => {
        const h = $(el).attr('href');
        const c = $(el).attr('class');
        if (h && h.includes('adopt')) console.log(`Found link: ${h} (Class: ${c})`);
    });

    const firstLink = $('.card a').first().attr('href');
    if (!firstLink) {
        console.log('No cat links found!');
        return;
    }

    const fullLink = firstLink.startsWith('http') ? firstLink : 'https://www.cats.org.uk' + firstLink;
    console.log(' Inspecting Cat Page:', fullLink);

    const { data: catData } = await axios.get(fullLink, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const $cat = cheerio.load(catData);

    console.log('\n--- IMAGES FOUND ---');
    $cat('img').each((i, el) => {
        const src = $cat(el).attr('src');
        const cls = $cat(el).attr('class');
        const alt = $cat(el).attr('alt');
        const parentCls = $cat(el).parent().attr('class');

        console.log(`[${i}] Src: ${src}`);
        console.log(`    Class: ${cls}, Alt: ${alt}`);
        console.log(`    Parent: ${parentCls}`);
    });
}

main();
