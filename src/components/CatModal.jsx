import React from 'react';
import { calculateDaysWaiting } from '../data/mockData';

const CatModal = ({ cat, onClose }) => {
    if (!cat) return null;

    const daysWaiting = calculateDaysWaiting(cat.dateListed, cat.dateReserved);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(45, 48, 71, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: 'var(--spacing-md)'
        }} onClick={onClose}>
            <div
                className="glass-card"
                style={{
                    background: 'var(--color-surface)',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(0,0,0,0.05)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        zIndex: 10
                    }}
                >
                    &times;
                </button>

                <div style={{ padding: 'var(--spacing-md)', display: 'flex', justifyContent: 'center', background: '#F5F5F7' }}>
                    <img
                        src={cat.image}
                        alt={cat.name}
                        style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
                    />
                </div>

                <div style={{ padding: 'var(--spacing-xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>{cat.name}</h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>{cat.breed}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="badge badge-secondary" style={{ marginBottom: '4px', background: 'var(--color-secondary)', color: 'white' }}>
                                {daysWaiting} days waiting
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                Listed: {new Date(cat.dateListed).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {cat.description && (
                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h4 style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>About {cat.name}</h4>
                            <p style={{
                                fontSize: '1.05rem',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-line',
                                color: 'var(--color-text)'
                            }}>
                                {cat.description}
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                        <div>
                            <h4 style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>Vital Stats</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li><strong>Age:</strong> {cat.age}</li>
                                <li><strong>Gender:</strong> {cat.coloring}</li>
                                <li><strong>Location:</strong> {cat.location}</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>Source</h4>
                            <p style={{ fontWeight: 500 }}>{cat.sourceType}</p>
                            <p style={{ fontSize: '0.9rem' }}>ID: {cat.sourceId}</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <h4 style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>Preferences</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                            {cat.preferences.map((pref, i) => (
                                <span key={i} className="badge badge-primary">{pref}</span>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--spacing-md)' }}>

                        {cat.link && (
                            <a
                                href={cat.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    padding: 'var(--spacing-md)',
                                    background: 'white',
                                    border: '1px solid var(--color-primary)',
                                    color: 'var(--color-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                }}
                            >
                                View on {cat.sourceId === 'battersea' ? 'Battersea' : 'Source Site'} ↗
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatModal;
