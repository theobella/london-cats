import axios from 'axios';
import * as cheerio from 'cheerio';

const URL = 'https://www.london-inner-city-kitties.org/adopt';

async function debugLick() {
    try {
        console.log(`Fetching ${URL}...`);
        const { data } = await axios.get(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        console.log('Page title:', $('title').text());

        // Try to find "Janet"
        const janet = $('h4:contains("janet")').first();
        if (janet.length) {
            console.log('Found Janet in H4');

            // Look at parent container
            const container = janet.closest('div');
            console.log('Container classes:', container.attr('class'));

            // Look for next siblings (description)
            console.log('Next sibling HTML:', janet.next().html());
            console.log('Next next sibling HTML:', janet.next().next().html());

            // Look for previous siblings or nearby images
            // In Wix lists, sometimes the image is in a previous container or a shared column.
            // Let's try to look for an image in the same "repeater" item if possible.
            // Often Wix uses a "repeater" or list layout.
            const repeaterItem = janet.closest('div[id^="comp-"]'); // Wix IDs often start with comp-
            if (repeaterItem.length) {
                const id = repeaterItem.attr('id');
                console.log('Found Repeater Item ID:', id);

                // Extract UUID suffix
                const uuid = id.split('__item-')[1];
                console.log('Item UUID:', uuid);

                if (uuid) {
                    // Find ALL elements with this UUID in their ID
                    const relatedElements = $(`[id*="${uuid}"]`);
                    console.log(`Found ${relatedElements.length} related elements with UUID ${uuid}`);

                    relatedElements.each((i, el) => {
                        const elId = $(el).attr('id');
                        const tagName = $(el).prop('tagName');
                        // console.log(`Element ${i}: ${tagName} #${elId}`);

                        // Check for images
                        const imgs = $(el).find('img');
                        if (imgs.length) {
                            console.log(` MATCH: Found ${imgs.length} images in #${elId}`);
                            console.log('  -> Src:', imgs.first().attr('src') || imgs.first().attr('data-src'));
                        }

                        // Check for description text
                        if ($(el).text().includes('years old')) {
                            console.log(` MATCH: Found description in #${elId}:`);
                            console.log('  -> Text:', $(el).text().substring(0, 100));
                        }
                    });
                }
                const html = repeaterItem.html();
                console.log('Repeater Item HTML length:', html.length);
                console.log('Repeater Item HTML snippet:', html.substring(0, 500));

                // Look for "2 years old" or similar in this item
                const desc = repeaterItem.find('*:contains("years old")').last();
                console.log('Found description in tag:', desc.prop('tagName'));

                // Re-check for ANY image-like thing
                const imgTags = repeaterItem.find('img');
                console.log('Number of images in repeater:', imgTags.length);
                imgTags.each((i, el) => {
                    console.log(`Image ${i}:`, $(el).attr('src') || $(el).attr('data-src'));
                });

                // Check if image is a background style
                const bgDiv = repeaterItem.find('[style*="background-image"]');
                if (bgDiv.length) console.log('Found background-image div:', bgDiv.attr('style'));
            } else {
                console.log('Could not find repeater item container');
            }

        } else {
            console.log('Could not find Janet in H4');
            // Find text block containing "janet"
            const textNode = $('*:contains("janet")').last();
            console.log('Found in tag:', textNode.prop('tagName'));
            console.log('Content:', textNode.text().substring(0, 100));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugLick();
