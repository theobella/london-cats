
import axios from 'axios';
import * as cheerio from 'cheerio';

const URL = 'https://www.battersea.org.uk/cats/cat-rehoming-gallery';

async function main() {
    console.log('Fetching Battersea...');
    try {
        const { data } = await axios.get(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        // Find an element containing "Fox" (one of the cats we saw)
        const fox = $('*:contains("Fox")').last();
        if (fox.length) {
            console.log('Found element containing "Fox":', fox.prop('tagName'));
            console.log('Class:', fox.attr('class'));
            console.log('Parent Class:', fox.parent().attr('class'));
            console.log('Grandparent Class:', fox.parent().parent().attr('class'));
            console.log('Great Grandparent Class:', fox.parent().parent().parent().attr('class'));

            console.log('\n--- Link Check ---');
            const card = fox.closest('.card');
            console.log('Card parent tag:', card.parent().prop('tagName'));
            console.log('Card parent href:', card.parent().attr('href'));

            console.log('\n--- HTML Snippet ---');
            console.log($.html(card.parent()));
        } else {
            console.log('Could not find "Fox". Dumping all link classes...');
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href.includes('cat-rehoming-gallery/')) {
                    console.log(`Link: ${href}`);
                    console.log(`Class: ${$(el).attr('class')}`);
                    console.log(`Parent: ${$(el).parent().attr('class')}`);
                    return false; // just show one
                }
            });
        }

    } catch (e) {
        console.error(e);
    }
}

main();
