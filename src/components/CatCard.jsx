import React from 'react';
import { calculateDaysWaiting } from '../data/mockData';

const CatCard = ({ cat, onClick }) => {
    const daysWaiting = calculateDaysWaiting(cat.dateListed, cat.dateReserved);
    const isReserved = cat.status === 'Reserved';

    return (
        <div className="glass-card" onClick={() => onClick(cat)} style={{ cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ position: 'relative', height: '200px' }}>
                <img
                    src={cat.image}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                    {isReserved ? (
                        <span className="badge" style={{ background: '#F2CC8F', color: '#3D405B' }}>Reserved</span>
                    ) : (
                        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#E07A5F' }}>
                            {daysWaiting} days waiting
                        </span>
                    )}
                </div>
            </div>

            <div style={{ padding: 'var(--spacing-md)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>{cat.name}</h3>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{cat.age}</span>
                </div>

                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>
                    {cat.breed} • {cat.location}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {cat.preferences.map((pref, idx) => (
                            <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.75rem', background: '#F0F1F5' }}>
                                {pref}
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                            {cat.sourceId === 'battersea' ? 'Battersea' : cat.sourceType}
                        </span>
                        {cat.link && (
                            <a
                                href={cat.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textDecoration: 'underline' }}
                            >
                                View Listing ↗
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatCard;
