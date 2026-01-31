import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="container" style={{ paddingBottom: 'var(--spacing-2xl)' }}>
        {children}
      </main>
      <footer style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-muted)' }}>
        <p>© 2026 London Cat Adoption Tracker</p>
      </footer>
    </div>
  );
};

export default Layout;
