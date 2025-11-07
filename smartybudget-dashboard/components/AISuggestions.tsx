import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { BudgetState } from '../types';
import { Sparkles, Loader2, Link as LinkIcon, MapPin, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { EXCHANGE_RATES } from '../constants';

interface GroundingChunk {
  web?: { uri: string; title: string; };
  maps?: { uri: string; title: string; }
}

interface Suggestion {
  title: string;
  positive_feedback: string;
  areas_for_improvement: string;
  actionable_tips: {
      tip: string;
      explanation: string;
  }[];
}

const AISuggestions: React.FC<{ data: BudgetState }> = ({ data }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);

  const { displayCurrency } = data;
  const rate = EXCHANGE_RATES[displayCurrency] || 1;

  const budgetSummary = useMemo(() => {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: displayCurrency }).format(amount * rate);
    const totalActualIncome = data.income.reduce((sum, item) => sum + item.actual, 0);
    const totalActualExpenses = data.expenses.reduce((sum, item) => sum + item.actual, 0);
    const totalActualSavings = data.savings.reduce((sum, item) => sum + item.actual, 0);
    const savingsRate = totalActualIncome > 0 ? (totalActualSavings / totalActualIncome) * 100 : 0;
    const topExpenses = [...data.expenses].sort((a, b) => b.actual - a.actual).slice(0, 3).map(item => `${item.name}: ${formatCurrency(item.actual)}`).join(', ');
    return { totalIncome: formatCurrency(totalActualIncome), totalExpenses: formatCurrency(totalActualExpenses), totalSavings: formatCurrency(totalActualSavings), savingsRate: `${savingsRate.toFixed(1)}%`, topExpenses: topExpenses || 'N/A' };
  }, [data, displayCurrency, rate]);

  const getLocation = (): Promise<{latitude: number, longitude: number}> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("Geolocation is not supported."));
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
            () => reject(new Error("Unable to retrieve location. Please grant permission."))
        );
    });
  }

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    setSources([]);

    let location;
    try {
        location = await getLocation();
    } catch (e: any) {
        setError(e.message);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this budget summary and provide feedback. Currency is ${displayCurrency}. Income: ${budgetSummary.totalIncome}, Expenses: ${budgetSummary.totalExpenses}, Savings: ${budgetSummary.totalSavings}, Savings Rate: ${budgetSummary.savingsRate}, Top Expenses: ${budgetSummary.topExpenses}.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are 'Smarty', a witty, modern, and encouraging financial coach. Your goal is to provide actionable, insightful, and positive financial advice. Use emojis to make your advice friendly and engaging. Always find something to praise before offering constructive criticism.",
          tools: [{ googleSearch: {} }, {googleMaps: {}}],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              positive_feedback: { type: Type.STRING },
              areas_for_improvement: { type: Type.STRING },
              actionable_tips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tip: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ["tip", "explanation"]
                }
              }
            },
            required: ["title", "positive_feedback", "areas_for_improvement", "actionable_tips"]
          },
          ...(location && { toolConfig: { retrievalConfig: { latLng: { latitude: location.latitude, longitude: location.longitude } } } })
        },
      });

      const parsedSuggestions: Suggestion = JSON.parse(response.text);
      setSuggestions(parsedSuggestions);

      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          setSources(response.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[]);
      }
    } catch (e) {
      console.error(e);
      setError("Sorry, I couldn't fetch suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-800">AI-Powered Budget Insights</h3>
            <p className="text-gray-500 mt-1">Get personalized suggestions from Gemini to optimize your budget using your location for hyperlocal advice.</p>
        </div>
        <button onClick={handleGetSuggestions} disabled={isLoading} className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-purple-dark text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap">
            {isLoading ? <><Loader2 className="animate-spin h-5 w-5" /> Analyzing...</> : <><Sparkles className="h-5 w-5" /> Get Suggestions</>}
        </button>
      </div>

      {error && <p className="mt-4 text-red-600 text-center font-medium bg-red-100 p-3 rounded-lg">{error}</p>}
      
      {suggestions && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">{suggestions.title}</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2"><CheckCircle/> What you're doing well:</h3>
                    <p className="text-green-700">{suggestions.positive_feedback}</p>
                </div>
                 <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-2"><AlertTriangle/> Areas to improve:</h3>
                    <p className="text-yellow-700">{suggestions.areas_for_improvement}</p>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3 text-lg"><Lightbulb/> Actionable Tips:</h3>
                <div className="space-y-4">
                    {suggestions.actionable_tips.map((item, index) => (
                        <div key={index} className="bg-brand-purple-light p-4 rounded-lg">
                            <p className="font-semibold text-brand-purple-dark">{item.tip}</p>
                            <p className="text-gray-600 text-sm mt-1">{item.explanation}</p>
                        </div>
                    ))}
                </div>
            </div>

            {sources && sources.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-md font-bold text-gray-600 mb-2">Sources:</h4>
                    <ul className="space-y-1">
                        {sources.map((source, index) => {
                           if (source.web) return <li key={index} className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-gray-400 shrink-0" /><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-purple-dark hover:underline truncate" title={source.web.title}>{source.web.title}</a></li>;
                           if (source.maps) return <li key={index} className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400 shrink-0" /><a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-purple-dark hover:underline truncate" title={source.maps.title}>{source.maps.title}</a></li>;
                           return null;
                        })}
                    </ul>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default AISuggestions;