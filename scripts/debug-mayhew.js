
import axios from 'axios';
import * as cheerio from 'cheerio';

const URL = 'https://themayhew.org/adopt/cats/';

async function main() {
    console.log('Fetching Mayhew...');
    try {
        const { data } = await axios.get(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-GB,en;q=0.9',
                'Referer': 'https://google.co.uk',
                'Upgrade-Insecure-Requests': '1'
            }
        });
        const $ = cheerio.load(data);

        // Try to find cat cards
        // Common selectors: .card, .animal, .post
        const cards = $('[class*="animal"], [class*="cat"], [class*="card"], article, .post').filter((i, el) => {
            // Heuristic: Must contain an image and a link
            return $(el).find('img').length > 0 && $(el).find('a').length > 0;
        });

        console.log(`Found ${cards.length} potential cards.`);

        if (cards.length > 0) {
            const first = cards.first();
            console.log('\n--- First Card ---');
            console.log('Class:', first.attr('class'));
            console.log('Name:', first.find('h3, h2, h4, .name').text().trim());
            console.log('Link:', first.find('a').attr('href'));
            console.log('Image:', first.find('img').attr('src'));
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();
