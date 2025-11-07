import React, { useState } from 'react';
import { BudgetProvider } from './hooks/useBudget';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import TemplatesPage from './components/pages/TemplatesPage';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import AccountSettingsPage from './components/pages/AccountSettingsPage';
import AIBudgetPlannerPage from './components/pages/AIBudgetPlannerPage';
import IncomePage from './components/pages/IncomePage';

export type Page = 'dashboard' | 'income' | 'templates' | 'about' | 'contact' | 'account' | 'ai-planner';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard searchQuery={searchQuery} />;
      case 'income':
        return <IncomePage />;
      case 'templates':
        return <TemplatesPage setPage={setCurrentPage} />;
      case 'ai-planner':
        return <AIBudgetPlannerPage setPage={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'account':
        return <AccountSettingsPage setPage={setCurrentPage} />;
      default:
        return <Dashboard searchQuery={searchQuery} />;
    }
  };

  return (
    <BudgetProvider>
      <div className="min-h-screen bg-brand-gray-light dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200 flex flex-col relative">
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <span className="text-7xl md:text-9xl font-bold text-gray-900/5 dark:text-white/5 -rotate-45 select-none whitespace-nowrap">
            Rishvin Reddy
          </span>
        </div>

        <Header 
          currentPage={currentPage} 
          setPage={setCurrentPage} 
          onSearchChange={setSearchQuery} 
        />
        <main className="container mx-auto px-4 py-8 flex-grow">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </BudgetProvider>
  );
};

export default App;