
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../src/data/realCats.json');

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const main = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        const cats = JSON.parse(data);
        console.log(`Loaded ${cats.length} cats.`);

        const updatedCats = cats.map(cat => {
            // Determine a random "days ago" for listing, weighted towards recent but with some tail
            // Weights:
            // 40% < 1 week (0-6 days)
            // 30% 1-2 weeks (7-13 days)
            // 20% 2-4 weeks (14-29 days)
            // 10% 1 month+ (30-60 days)

            let daysAgo;
            const rand = Math.random();
            if (rand < 0.4) {
                daysAgo = getRandomInt(0, 6);
            } else if (rand < 0.7) {
                daysAgo = getRandomInt(7, 13);
            } else if (rand < 0.9) {
                daysAgo = getRandomInt(14, 29);
            } else {
                daysAgo = getRandomInt(30, 60);
            }

            const dateListed = new Date();
            dateListed.setDate(dateListed.getDate() - daysAgo);

            // Handle Reserved/Adopted dates
            // If reserved, dateReserved should be after dateListed but before/on today
            let dateReserved = cat.dateReserved ? new Date(cat.dateReserved) : null;

            if (cat.status === 'Reserved' || cat.status === 'Adopted') {
                if (!dateReserved || dateReserved < dateListed) {
                    // Pick a random date between listed and now
                    const daysToWait = getRandomInt(0, daysAgo);
                    dateReserved = new Date(dateListed);
                    dateReserved.setDate(dateReserved.getDate() + daysToWait);
                }
            } else {
                dateReserved = null;
            }

            return {
                ...cat,
                dateListed: dateListed.toISOString(),
                dateReserved: dateReserved ? dateReserved.toISOString() : null
            };
        });

        await fs.writeFile(DATA_FILE, JSON.stringify(updatedCats, null, 2));
        console.log(`Successfully backdated ${updatedCats.length} cats.`);

    } catch (err) {
        console.error('Error seeding history:', err);
    }
};

main();
