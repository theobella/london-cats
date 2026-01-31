import React from 'react';

const FilterBar = ({ currentFilter, onFilterChange }) => {
    const filters = [
        { id: 'all', label: 'All Cats' },
        { id: 'Shelter', label: 'Shelters' },
        { id: 'Rehoming Network', label: 'Rehoming Networks' }
    ];

    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.5)',
                padding: '4px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                gap: '4px',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 'var(--radius-full)',
                            background: currentFilter === filter.id ? 'var(--color-secondary)' : 'transparent',
                            color: currentFilter === filter.id ? '#FFF' : 'var(--color-text-muted)',
                            fontWeight: 500,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterBar;
