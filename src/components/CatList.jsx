import React from 'react';
import CatCard from './CatCard';

const CatList = ({ cats, onCatClick }) => {
    if (cats.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
                <h3>No cats found matching your criteria.</h3>
                <p>Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--spacing-lg)'
        }}>
            {cats.map(cat => (
                <CatCard key={cat.id} cat={cat} onClick={onCatClick} />
            ))}
        </div>
    );
};

export default CatList;
