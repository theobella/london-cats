import React from 'react';

import { CATS } from '../data/mockData';

import metadata from '../data/meta.json';

const Header = ({ currentView, onViewChange }) => {
    // Determine last refreshed date
    const lastRefreshed = React.useMemo(() => {
        if (metadata && metadata.lastScraped) {
            return new Date(metadata.lastScraped);
        }

        // Fallback logic
        if (!CATS || CATS.length === 0) return new Date();
        const dates = CATS.map(c => new Date(c.dateListed).getTime());
        return new Date(Math.max(...dates));
    }, []);

    return (
        <header style={{
            padding: 'var(--spacing-md) 0',
            marginBottom: 'var(--spacing-xl)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <span style={{ fontSize: '1.75rem' }}>🐈</span>
                        <h1 className="text-gradient" style={{ fontSize: '1.25rem', margin: 0 }}>London Cat Tracker</h1>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '36px' }}>
                        Updated: {lastRefreshed.toLocaleDateString()}
                    </span>
                </div>

                <nav style={{ display: 'flex', gap: 'var(--spacing-sm)', background: 'rgba(0,0,0,0.03)', padding: '4px', borderRadius: '50px' }}>
                    <button
                        onClick={() => onViewChange('home')}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '24px',
                            border: 'none',
                            background: currentView === 'home' ? 'var(--color-surface)' : 'transparent',
                            boxShadow: currentView === 'home' ? 'var(--shadow-sm)' : 'none',
                            color: currentView === 'home' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        Browse Cats
                    </button>
                    <button
                        onClick={() => onViewChange('metrics')}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '24px',
                            border: 'none',
                            background: currentView === 'metrics' ? 'var(--color-surface)' : 'transparent',
                            boxShadow: currentView === 'metrics' ? 'var(--shadow-sm)' : 'none',
                            color: currentView === 'metrics' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        Metrics Dashboard
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
