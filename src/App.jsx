import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import CatList from './components/CatList';
import CatModal from './components/CatModal';
import ActiveFilters from './components/ActiveFilters';
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
    organisations: [],
    searchQuery: ''
  });
  const [selectedCat, setSelectedCat] = useState(null);

  const handleFilterChange = (category, value) => {
    if (category === 'reset') {
      setFilters({ locations: [], genders: [], ageBrackets: [], statuses: [], organisations: [], searchQuery: '' });
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
          'Cats Protection': 'cats_protection',
          'London Inner City Kitties': 'lick'
        };
        const allowedIds = filters.organisations.map(o => orgMap[o]);
        if (!allowedIds.includes(cat.sourceId)) return false;
      }

      // Location Filter
      if (filters.locations.length > 0 && !filters.locations.includes(cat.location)) return false;

      // Gender Filter
      if (filters.genders.length > 0) {
        const catGender = cat.gender || 'Unknown';
        if (!filters.genders.includes(catGender)) return false;
      }

      // Age Filter
      if (!checkAgeBracket(cat.age, filters.ageBrackets)) return false;

      // Status Filter
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(cat.status)) return false;
      } else {
        // Default: available or reserved, NOT adopted
        if (cat.status === 'Adopted') return false;
      }

      // Name Search (Keyword)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const name = (cat.name || '').toLowerCase();
        if (!name.includes(query)) return false;
      }

      return true;
    });
  }, [filters]);

  // Derive unique locations from data
  const availableLocations = useMemo(() => {
    const locs = new Set(CATS.map(cat => cat.location).filter(Boolean));
    return Array.from(locs).sort();
  }, []);

  return (
    <Layout currentView={view} onViewChange={setView}>

      {view === 'home' ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>Find Your Purrfect Companion</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Browse cats available for adoption across London's shelters and rehoming networks.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'flex-start' }}>
            <Sidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              resultCount={filteredCats.length}
              availableLocations={availableLocations}
            />

            <div style={{ flex: 1 }}>
              <ActiveFilters filters={filters} onFilterChange={handleFilterChange} />
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
