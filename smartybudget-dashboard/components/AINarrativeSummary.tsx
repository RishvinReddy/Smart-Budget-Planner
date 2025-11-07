import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BudgetState } from '../types';
import { Sparkles, Loader2, ChevronDown, MessageSquareQuote } from 'lucide-react';
import { EXCHANGE_RATES } from '../constants';

const AINarrativeSummary: React.FC<{ data: BudgetState }> = ({ data }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { displayCurrency } = data;
  const rate = EXCHANGE_RATES[displayCurrency] || 1;

  const budgetSummary = useMemo(() => {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: displayCurrency }).format(amount * rate);
    const totalActualIncome = data.income.reduce((sum, item) => sum + item.actual, 0);
    const totalPlannedExpenses = data.expenses.reduce((sum, item) => sum + item.planned, 0);
    const totalActualExpenses = data.expenses.reduce((sum, item) => sum + item.actual, 0);
    const totalActualSavings = data.savings.reduce((sum, item) => sum + item.actual, 0);
    const savingsRate = totalActualIncome > 0 ? (totalActualSavings / totalActualIncome) * 100 : 0;
    
    return `Total Income: ${formatCurrency(totalActualIncome)}. Total Planned Expenses: ${formatCurrency(totalPlannedExpenses)}. Total Actual Expenses: ${formatCurrency(totalActualExpenses)}. Total Saved: ${formatCurrency(totalActualSavings)}. Savings Rate: ${savingsRate.toFixed(1)}%.`;
  }, [data, displayCurrency, rate]);

  const handleGetSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Based on the following data, provide a very short, 1-2 sentence narrative summary of the user's financial performance this month. Be encouraging but realistic. Here's the data: ${budgetSummary}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setSummary(response.text);
    } catch (e) {
      console.error(e);
      setError("Couldn't generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex justify-between items-center font-bold text-lg text-gray-700"
          aria-expanded={isOpen}
      >
          <div className="flex items-center gap-3">
              <MessageSquareQuote className="h-6 w-6 text-brand-purple-dark" />
              <span>AI Narrative Summary</span>
          </div>
          <ChevronDown className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="text-center">
            <button 
                onClick={handleGetSummary} 
                disabled={isLoading} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-purple-dark text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400"
            >
                {isLoading ? <><Loader2 className="animate-spin h-5 w-5" /> Generating...</> : <><Sparkles className="h-5 w-5" /> Generate Summary</>}
            </button>
          </div>
          
          {error && <p className="text-red-600 text-center font-medium bg-red-100 p-3 rounded-lg">{error}</p>}
          
          {summary && (
              <div className="bg-brand-purple-light text-brand-purple-dark font-medium p-4 rounded-lg text-center">
                  <p>{summary}</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AINarrativeSummary;
