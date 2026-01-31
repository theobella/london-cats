
import axios from 'axios';
import * as cheerio from 'cheerio';

const url = 'https://www.battersea.org.uk/cats/cat-rehoming-gallery/monkey';

async function debugScrape() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        console.log('Title:', $('title').text());

        // Check for specific gender keywords in the whole body or specific containers
        const bodyText = $('body').text();
        if (bodyText.includes('Female')) console.log('Found "Female" in body');
        if (bodyText.includes('Male')) console.log('Found "Male" in body');

        // Inspect classes again to find where it is
        console.log('--- Potential Gender Fields ---');
        $('*').each((i, el) => {
            const text = $(el).text().trim();
            if (text === 'Female' || text === 'Male') {
                console.log(`Found "${text}" in tag: <${el.tagName}> class: "${$(el).attr('class')}"`);
                console.log('Parent class:', $(el).parent().attr('class'));
            }
        });

    } catch (error) {
        console.error(error);
    }
}

debugScrape();
