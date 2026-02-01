
import React from 'react';

const Sidebar = ({ filters, onFilterChange, resultCount, availableLocations = [] }) => {
    // Helper to handle checkbox changes
    const handleCheckboxChange = (category, value) => {
        const currentValues = filters[category] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange(category, newValues);
    };

    return (
        <aside style={{
            width: '280px',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(10px)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255,255,255,0.3)',
            alignSelf: 'flex-start',
            position: 'sticky',
            top: '20px',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>Filters</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {resultCount} cats
                </span>
            </div>

            {/* Organisation Filter */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>Organisation</h4>
                {['Battersea', 'Cats Protection', 'London Inner City Kitties'].map(org => (
                    <label key={org} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                        <input
                            type="checkbox"
                            checked={filters.organisations?.includes(org)}
                            onChange={() => handleCheckboxChange('organisations', org)}
                            style={{ marginRight: '8px', accentColor: 'var(--color-primary)' }}
                        />
                        {org}
                    </label>
                ))}
            </div>

            {/* Centre / Location Filter */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>Centre / Location</h4>
                {availableLocations.length > 0 ? (
                    availableLocations.map(centre => (
                        <label key={centre} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                            <input
                                type="checkbox"
                                checked={filters.locations?.includes(centre)}
                                onChange={() => handleCheckboxChange('locations', centre)}
                                style={{ marginRight: '8px', accentColor: 'var(--color-primary)' }}
                            />
                            {centre}
                        </label>
                    ))
                ) : (
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>No locations found</p>
                )}
            </div>

            {/* Sex Filter */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>Sex</h4>
                {['Male', 'Female', 'Unknown'].map(sex => (
                    <label key={sex} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                        <input
                            type="checkbox"
                            checked={filters.genders?.includes(sex)}
                            onChange={() => handleCheckboxChange('genders', sex)}
                            style={{ marginRight: '8px', accentColor: 'var(--color-primary)' }}
                        />
                        {sex}
                    </label>
                ))}
            </div>

            {/* Age Filter */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>Age</h4>
                {[
                    { label: 'Kitten (< 1 year)', value: 'kitten' },
                    { label: 'Young (1-3 years)', value: 'young' },
                    { label: 'Adult (3-8 years)', value: 'adult' },
                    { label: 'Senior (8+ years)', value: 'senior' }
                ].map(option => (
                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                        <input
                            type="checkbox"
                            checked={filters.ageBrackets?.includes(option.value)}
                            onChange={() => handleCheckboxChange('ageBrackets', option.value)}
                            style={{ marginRight: '8px', accentColor: 'var(--color-primary)' }}
                        />
                        {option.label}
                    </label>
                ))}
            </div>

            {/* Status Filter */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>Status</h4>
                {['Available', 'Reserved'].map(status => (
                    <label key={status} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                        <input
                            type="checkbox"
                            checked={filters.statuses?.includes(status)}
                            onChange={() => handleCheckboxChange('statuses', status)}
                            style={{ marginRight: '8px', accentColor: 'var(--color-primary)' }}
                        />
                        {status}
                    </label>
                ))}
            </div>

            <button
                onClick={() => onFilterChange('reset')}
                style={{
                    width: '100%',
                    padding: '8px',
                    background: 'transparent',
                    border: '1px solid var(--color-primary)',
                    color: 'var(--color-primary)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                }}
            >
                Reset Filters
            </button>
        </aside>
    );
};

export default Sidebar;
