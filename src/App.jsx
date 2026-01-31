import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import CatList from './components/CatList';
import CatModal from './components/CatModal';
import Metrics from './pages/Metrics';
import { CATS } from './data/mockData';

// Helper to check age brackets
const checkAgeBracket = (catAge, brackets) => {
  if (!brackets || brackets.length === 0) return true;
  if (!catAge || catAge === 'Unknown') return true;

  const str = catAge.toLowerCase();

  // Extract years and months
  let years = 0;
  const yearsMatch = str.match(/(\d+)\s*(?:years?|y)/);
  if (yearsMatch) years = parseInt(yearsMatch[1]);

  let months = 0;
  const monthsMatch = str.match(/(\d+)\s*(?:months?|m)/);
  if (monthsMatch) months = parseInt(monthsMatch[1]);

  let catBracket = 'adult'; // default

  // Kitten: < 1 year (0 years, >0 months)
  if (years === 0 && months > 0) {
    catBracket = 'kitten';
  } else if (years >= 1 && years < 3) {
    catBracket = 'young';
  } else if (years >= 3 && years < 8) {
    catBracket = 'adult';
  } else if (years >= 8) {
    catBracket = 'senior';
  }

  return brackets.includes(catBracket);
};

function App() {
  const [view, setView] = useState('home'); // 'home' or 'metrics'
  const [filters, setFilters] = useState({
    locations: [],
    genders: [],
    ageBrackets: [],
    statuses: [],
    organisations: []
  });
  const [selectedCat, setSelectedCat] = useState(null);

  const handleFilterChange = (category, value) => {
    if (category === 'reset') {
      setFilters({ locations: [], genders: [], ageBrackets: [], statuses: [], organisations: [] });
    } else {
      setFilters(prev => ({ ...prev, [category]: value }));
    }
  };

  const filteredCats = useMemo(() => {
    return CATS.filter(cat => {
      // Organisation Filter
      if (filters.organisations && filters.organisations.length > 0) {
        const orgMap = {
          'Battersea': 'battersea',
          'Cats Protection': 'cats_protection'
        };
        const allowedIds = filters.organisations.map(o => orgMap[o]);
        if (!allowedIds.includes(cat.sourceId)) return false;
      }

      // Location Filter
      if (filters.locations.length > 0 && !filters.locations.includes(cat.location)) return false;

      // Gender Filter
      if (filters.genders.length > 0) {
        const catGender = cat.gender === 'Unknown' ? 'Unknown' : cat.gender;
        if (!filters.genders.includes(catGender)) return false;
      }

      // Age Filter
      if (!checkAgeBracket(cat.age, filters.ageBrackets)) return false;

      // Status Filter
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(cat.status)) return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <Layout>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'inline-flex', gap: 'var(--spacing-md)', background: 'white', padding: '4px', borderRadius: '50px', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-lg)' }}>
          <button
            onClick={() => setView('home')}
            style={{
              padding: '8px 24px',
              borderRadius: '24px',
              border: 'none',
              background: view === 'home' ? 'var(--color-primary)' : 'transparent',
              color: view === 'home' ? 'white' : 'var(--color-text)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Start Search
          </button>
          <button
            onClick={() => setView('metrics')}
            style={{
              padding: '8px 24px',
              borderRadius: '24px',
              border: 'none',
              background: view === 'metrics' ? 'var(--color-primary)' : 'transparent',
              color: view === 'metrics' ? 'white' : 'var(--color-text)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Metrics Dashboard
          </button>
        </div>
      </div>

      {view === 'home' ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>Find Your Perfect Companion</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Browse cats available for adoption across London's shelters and rehoming networks.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'flex-start' }}>
            <Sidebar filters={filters} onFilterChange={handleFilterChange} />

            <div style={{ flex: 1 }}>
              <CatList cats={filteredCats} onCatClick={setSelectedCat} />
            </div>
          </div>

          {selectedCat && (
            <CatModal cat={selectedCat} onClose={() => setSelectedCat(null)} />
          )}
        </>
      ) : (
        <Metrics />
      )}
    </Layout>
  );
}

export default App;
