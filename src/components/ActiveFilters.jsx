import React from 'react';

const ActiveFilters = ({ filters, onFilterChange }) => {
    // Flatten filters into a list of { category, value, label }
    const activeFilters = [];

    // Organisations
    filters.organisations?.forEach(org => {
        activeFilters.push({ category: 'organisations', value: org, label: org });
    });

    // Locations
    filters.locations?.forEach(loc => {
        activeFilters.push({ category: 'locations', value: loc, label: loc });
    });

    // Genders
    filters.genders?.forEach(gen => {
        activeFilters.push({ category: 'genders', value: gen, label: gen });
    });

    // Age
    const ageLabels = {
        'kitten': 'Kitten (< 1 y)',
        'young': 'Young (1-3 y)',
        'adult': 'Adult (3-8 y)',
        'senior': 'Senior (8+ y)'
    };
    filters.ageBrackets?.forEach(age => {
        activeFilters.push({ category: 'ageBrackets', value: age, label: ageLabels[age] || age });
    });

    // Status
    filters.statuses?.forEach(status => {
        activeFilters.push({ category: 'statuses', value: status, label: status });
    });

    if (activeFilters.length === 0) return null;

    const handleRemove = (filter) => {
        const currentCategoryValues = filters[filter.category] || [];
        const newValues = currentCategoryValues.filter(v => v !== filter.value);
        onFilterChange(filter.category, newValues);
    };

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
            {activeFilters.map((filter) => (
                <span
                    key={`${filter.category}-${filter.value}`}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: 'var(--color-secondary)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}
                >
                    {filter.label}
                    <button
                        onClick={() => handleRemove(filter)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            marginLeft: '6px',
                            cursor: 'pointer',
                            padding: '0 2px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '1rem',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </span>
            ))}
            <button
                onClick={() => onFilterChange('reset')}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.85rem',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                }}
            >
                Clear all
            </button>
        </div>
    );
};

export default ActiveFilters;
