
import axios from 'axios';
import * as cheerio from 'cheerio';

const url = 'https://www.battersea.org.uk/cats/cat-rehoming-gallery';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function debug() {
    try {
        const { data } = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(data);

        // Search for "Monkey"
        const monkey = $('*:contains("Monkey")').last(); // get most specific element
        if (monkey.length) {
            console.log('Found Monkey in:', monkey.get(0).tagName);
            console.log('Class:', monkey.attr('class'));
            console.log('Parent:', monkey.parent().get(0).tagName, monkey.parent().attr('class'));
            console.log('Grandparent:', monkey.parent().parent().get(0).tagName, monkey.parent().parent().attr('class'));
        } else {
            console.log('Monkey not found in text');
        }

        // List generic card-like elements
        console.log('--- Card candidates ---');
        // Look for common card classes
        $('[class*="card"], [class*="item"], [class*="teaser"]').each((i, el) => {
            if (i < 10) console.log($(el).attr('class'));
        });

    } catch (e) {
        console.error(e);
    }
}
debug();
