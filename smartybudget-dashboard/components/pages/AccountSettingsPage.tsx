
import React, { useState, useEffect, useRef } from 'react';
import { useBudgetDispatch, useBudgetState } from '../../hooks/useBudget';
import { Page } from '../../App';
import { CURRENCY_DATA } from '../../constants';
import { Palette, Globe, Download, Upload } from 'lucide-react';

interface AccountSettingsPageProps {
  setPage: (page: Page) => void;
}

type Theme = 'light' | 'dark' | 'system';

const SettingsCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
    {children}
  </div>
);

const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({ setPage }) => {
  const dispatch = useBudgetDispatch();
  const state = useBudgetState();
  const importFileRef = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('smartybudget_theme') as Theme) || 'system');

  useEffect(() => {
    localStorage.setItem('smartybudget_theme', theme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = () => {
      if (theme === 'dark' || (theme === 'system' && mediaQuery.matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    handleThemeChange(); // Apply theme on initial load and theme change
    mediaQuery.addEventListener('change', handleThemeChange); // Listen for system changes

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [theme]);


  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all your budget data? This action cannot be undone.')) {
      dispatch({ type: 'RESET_STATE' });
      alert('Your budget data has been reset.');
      setPage('dashboard');
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_DISPLAY_CURRENCY', payload: e.target.value });
  };
  
  const handleExportData = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `smartybudget_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      alert("Your data has been exported!");
  };
  
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!window.confirm("Are you sure you want to import this file? This will overwrite your current budget data.")) {
          return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result;
              if (typeof text !== 'string') throw new Error("Invalid file content");
              const importedState = JSON.parse(text);
              // Basic validation can be added here
              dispatch({ type: 'SET_BUDGET_STATE', payload: importedState });
              alert("Data imported successfully!");
              setPage('dashboard');
          } catch (error) {
              console.error("Failed to parse imported file:", error);
              alert("Failed to import data. The file may be corrupt or in the wrong format.");
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Account Settings</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">Manage your profile and application data.</p>
      </div>

      <div className="space-y-6">
        <SettingsCard title="Profile Information">
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" name="name" id="name" defaultValue="Rishvin Reddy" className="input-field" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input type="email" name="email" id="email" defaultValue="rishvin18@gmail.com" className="input-field" />
            </div>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </form>
        </SettingsCard>
        
        <SettingsCard title="Appearance">
          <div className="flex items-center gap-2">
            {(['light', 'dark', 'system'] as Theme[]).map((t) => (
              <button 
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 capitalize text-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  theme === t
                    ? 'bg-brand-purple text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Display Currency">
            <div className="flex items-center gap-4">
                <Globe className="h-6 w-6 text-brand-purple-dark" />
                <div className="flex-grow">
                    <label htmlFor="currency" className="sr-only">Display Currency</label>
                    <select
                        id="currency"
                        value={state.displayCurrency}
                        onChange={handleCurrencyChange}
                        className="input-field w-full"
                    >
                        {Object.entries(CURRENCY_DATA).map(([code, { name, symbol }]) => (
                            <option key={code} value={code}>{symbol} {name} ({code})</option>
                        ))}
                    </select>
                </div>
            </div>
        </SettingsCard>

        <SettingsCard title="Data Management">
          <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                   <button onClick={handleExportData} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                      <Download size={16} /> Export to JSON
                   </button>
                   <input type="file" accept=".json" ref={importFileRef} onChange={handleImportData} className="hidden" />
                   <button onClick={() => importFileRef.current?.click()} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                       <Upload size={16} /> Import from JSON
                   </button>
              </div>
            <div className="border-t dark:border-gray-700 my-4"></div>
            <div>
                 <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Reset all your budget data to the default settings. This will delete all your custom categories, transactions, and settings.
                </p>
                 <p className="font-semibold text-red-600 dark:text-red-500">This action cannot be undone.</p>
                <button
                    onClick={handleResetData}
                    className="mt-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Reset All Budget Data
                </button>
            </div>
          </div>
        </SettingsCard>
      </div>
      <style>{`
        .input-field {
            margin-top: 0.25rem;
            display: block;
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #D1D5DB;
            border-radius: 0.375rem;
            background-color: white;
        }
        .dark .input-field {
            background-color: #374151; /* gray-700 */
            border-color: #4B5563; /* gray-600 */
            color: white;
        }
        .input-field:focus {
            outline: none;
            border-color: #A482FF;
            box-shadow: 0 0 0 2px #F3F0FF;
        }
        .dark .input-field:focus {
            border-color: #A482FF;
            box-shadow: 0 0 0 2px #433373;
        }
        .btn-primary {
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-weight: 500;
            color: white;
            background-color: #865DFF; /* brand-purple-dark */
            transition: background-color 0.2s;
        }
        .btn-primary:hover {
            background-color: #7146ed;
        }
        .btn-secondary {
            padding: 0.5rem 1rem;
            border: 1px solid #D1D5DB;
            border-radius: 0.375rem;
            font-weight: 500;
            background-color: white;
            color: #1F2937; /* gray-800 */
            transition: background-color 0.2s;
        }
        .dark .btn-secondary {
            background-color: #374151; /* gray-700 */
            border-color: #4B5563; /* gray-600 */
            color: #F9FAFB; /* gray-50 */
        }
        .btn-secondary:hover {
            background-color: #F9FAFB; /* gray-50 */
        }
        .dark .btn-secondary:hover {
            background-color: #4B5563; /* gray-600 */
        }
      `}</style>
    </div>
  );
};

export default AccountSettingsPage;