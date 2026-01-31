import realCats from './realCats.json';

export const SHELTERS = [
    { id: 'battersea', name: 'Battersea Dogs & Cats Home', type: 'Shelter', location: 'Battersea' },
    { id: 'hackney', name: 'Hackney Cat Rescue', type: 'Rehoming Network', location: 'Hackney' },
    { id: 'celia', name: 'Celia Hammond Animal Trust', type: 'Shelter', location: 'Canning Town' },
    { id: 'cats_protection', name: 'Cats Protection North London', type: 'Rehoming Network', location: 'North London' },
];

// Export fully normalized data directly
export const CATS = realCats;

export const calculateDaysWaiting = (dateListed, dateReserved = null) => {
    const start = new Date(dateListed);
    const end = dateReserved ? new Date(dateReserved) : new Date(); // Use today if not reserved
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};
