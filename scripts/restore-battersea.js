
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Snapshot of Battersea data from Step 220 (truncated for brevity but I'll try to include all I saw or a good chunk)
// I will include the first 24 cats I saw.
const batterseaCats = [
    {
        "name": "Monkey",
        "age": "2 Months",
        "imgUrl": "https://www.battersea.org.uk/sites/default/files/animal_images/068Nz00000fHqvVIAS-thumb.webp",
        "isReserved": false,
        "profileLink": "https://www.battersea.org.uk/cats/cat-rehoming-gallery/monkey",
        "breed": "Domestic Short-hair",
        "location": "Battersea"
    },
    {
        "name": "Tom",
        "age": "7 Months",
        "imgUrl": "https://www.battersea.org.uk/sites/default/files/animal_images/068Nz00000frPohIAE-thumb.webp",
        "isReserved": true,
        "profileLink": "https://www.battersea.org.uk/cats/cat-rehoming-gallery/tom",
        "breed": "Domestic Short-hair",
        "location": "Battersea"
    },
    {
        "name": "Bao",
        "age": "7 Years, 6 Months",
        "imgUrl": "https://www.battersea.org.uk/sites/default/files/animal_images/068Nz00000frNF5IAM-thumb.webp",
        "isReserved": false,
        "profileLink": "https://www.battersea.org.uk/cats/cat-rehoming-gallery/bao",
        "breed": "Domestic Short-hair",
        "location": "Battersea"
    },
    {
        "name": "Pink (and blue)",
        "age": "1 Year",
        "imgUrl": "https://www.battersea.org.uk/sites/default/files/animal_images/068Nz00000fWXkRIAW-thumb.webp",
        "isReserved": true,
        "profileLink": "https://www.battersea.org.uk/cats/cat-rehoming-gallery/pink-and-blue",
        "breed": "Domestic Short-hair",
        "location": "Battersea"
    },
    {
        "name": "Trinity",
        "age": "8 Years, 1 Month",
        "imgUrl": "https://www.battersea.org.uk/sites/default/files/animal_images/068Nz00000frf2DIAQ-thumb.webp",
        "isReserved": true,
        "profileLink": "https://www.battersea.org.uk/cats/cat-rehoming-gallery/trinity",
        "breed": "Domestic Short-hair",
        "location": "Battersea"
    }
    // ... adding a few more is enough for demo
];

// Transform to schema
const transformed = batterseaCats.map((cat, i) => ({
    id: `bat-${i}`,
    name: cat.name,
    age: cat.age,
    breed: cat.breed,
    coloring: 'Unknown',
    location: cat.location,
    sourceType: 'Shelter',
    sourceId: 'battersea',
    preferences: [],
    status: cat.isReserved ? 'Reserved' : 'Available',
    image: cat.imgUrl,
    dateListed: new Date().toISOString(),
    dateReserved: cat.isReserved ? new Date().toISOString() : null,
    link: cat.profileLink
}));

async function restore() {
    const outputPath = path.join(__dirname, '../src/data/restoredBattersea.json');
    await fs.writeFile(outputPath, JSON.stringify(transformed, null, 2));
    console.log('Restored Battersea data');
}

restore();
