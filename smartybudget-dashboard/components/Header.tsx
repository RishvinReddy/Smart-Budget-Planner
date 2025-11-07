import React, { useState } from 'react';
import { Menu, Search, User, LayoutTemplate, X, Sparkles } from 'lucide-react';
import { Page } from '../App';

interface HeaderProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setPage, onSearchChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks: { page: Page, label: string }[] = [
    { page: 'dashboard', label: 'Dashboard' },
    { page: 'income', label: 'Income' },
    { page: 'templates', label: 'Templates' },
    { page: 'ai-planner', label: 'AI Planner' },
    { page: 'about', label: 'About' },
    { page: 'contact', label: 'Contact' },
  ];

  const NavLink: React.FC<{ page: Page, label: string }> = ({ page, label }) => (
    <button
      onClick={() => setPage(page)}
      className={`flex items-center gap-2 hover:text-brand-purple-dark transition-colors ${currentPage === page ? 'text-brand-purple-dark font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
    >
      {label === 'AI Planner' && <Sparkles className="h-4 w-4" />}
      {label}
    </button>
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 dark:border-b dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden">
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
            Smarty<span className="text-brand-purple-dark font-semibold">Budget</span>
            </div>
        </div>
        
        <nav className="hidden lg:flex gap-6 text-gray-600 font-medium items-center">
            {isSearchOpen ? (
                <div className="relative flex items-center">
                    <Search className="absolute left-3 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 pr-4 py-1.5 border rounded-full w-48 focus:outline-none focus:ring-2 focus:ring-brand-purple-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        autoFocus
                    />
                     <button onClick={() => setIsSearchOpen(false)} className="absolute right-2 text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : navLinks.map(link => <NavLink key={link.page} {...link} />)}
        </nav>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-gray-600 hover:text-brand-purple-dark dark:text-gray-300 dark:hover:text-brand-purple">
            <Search className="h-5 w-5" />
          </button>
          <button onClick={() => setPage('account')} className="text-gray-600 hover:text-brand-purple-dark dark:text-gray-300 dark:hover:text-brand-purple">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;