import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SearchFilters } from './types/schema';
import { SyntheticBanner } from './components/SyntheticBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchPage } from './pages/SearchPage';
import { ReaderPage } from './pages/ReaderPage';
import { LinksPage } from './pages/LinksPage';
import { FoldersPage } from './pages/FoldersPage';
import { AboutDataPage } from './pages/AboutDataPage';
import { DataQualityPage } from './pages/DataQualityPage';

export const App: React.FC = () => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('nyayareader-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nyayareader-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nyayareader-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Search filter state
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    courts: [],
    benches: [],
    coramTypes: [],
    categories: [],
    caseTypes: [],
    disposals: [],
    purposes: [],
  });

  const handleSearchQueryChange = (q: string) => {
    setFilters(prev => ({ ...prev, query: q }));
  };

  // Base path from Vite import.meta.env.BASE_URL
  const basename = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={basename}>
      <div className="min-h-screen flex flex-col bg-paper-canvas dark:bg-paper-darkCanvas text-ink-primary dark:text-ink-darkPrimary transition-colors duration-150">
        <SyntheticBanner />
        <Navbar
          searchQuery={filters.query}
          onSearchChange={handleSearchQueryChange}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/search" replace />} />
            <Route
              path="/search"
              element={
                <SearchPage
                  filters={filters}
                  onFilterChange={setFilters}
                />
              }
            />
            <Route path="/case/:id" element={<ReaderPage />} />
            <Route path="/links" element={<LinksPage />} />
            <Route path="/folders" element={<FoldersPage />} />
            <Route path="/about-data" element={<AboutDataPage />} />
            <Route path="/data-quality" element={<DataQualityPage />} />
            <Route path="*" element={<Navigate to="/search" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
export default App;
