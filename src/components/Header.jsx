import React from 'react';

const Header = () => {
    return (
        <header style={{
            padding: 'var(--spacing-lg) 0',
            marginBottom: 'var(--spacing-xl)',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <span style={{ fontSize: '2rem' }}>🐈</span>
                    <h1 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>London Cat Tracker</h1>
                </div>
                <nav>
                    {/* Placeholder for future nav items if needed */}

                </nav>
            </div>
        </header>
    );
};

export default Header;
