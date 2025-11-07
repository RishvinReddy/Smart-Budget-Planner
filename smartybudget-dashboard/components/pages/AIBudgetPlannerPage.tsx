import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useBudgetState, useBudgetDispatch } from '../../hooks/useBudget';
import { CategoryType, BudgetItem } from '../../types';
import { Page } from '../../App';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface GeneratedPlan {
    income: { name: string; planned: number }[];
    bills: { name: string; planned: number }[];
    expenses: { name: string; planned: number }[];
    savings: { name: string; planned: number }[];
    debt: { name: string; planned: number }[];
}

interface AIBudgetPlannerPageProps {
  setPage: (page: Page) => void;
}

const AIBudgetPlannerPage: React.FC<AIBudgetPlannerPageProps> = ({ setPage }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
    const { displayCurrency } = useBudgetState();
    const state = useBudgetState();
    const dispatch = useBudgetDispatch();

    const handleGeneratePlan = async () => {
        if (!prompt) {
            setError('Please describe your financial situation and goals.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedPlan(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const fullPrompt = `Based on the user's description, create a detailed monthly budget plan. The user's currency is ${displayCurrency}. Break down their budget into income, bills, expenses, savings, and debt categories with specific items and planned amounts for each. The total planned amounts for all spending, savings, and debt should logically align with the described income. User's description: "${prompt}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            income: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, planned: { type: Type.NUMBER } }, required: ['name', 'planned'] } },
                            bills: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, planned: { type: Type.NUMBER } }, required: ['name', 'planned'] } },
                            expenses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, planned: { type: Type.NUMBER } }, required: ['name', 'planned'] } },
                            savings: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, planned: { type: Type.NUMBER } }, required: ['name', 'planned'] } },
                            debt: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, planned: { type: Type.NUMBER } }, required: ['name', 'planned'] } },
                        },
                        required: ['income', 'bills', 'expenses', 'savings', 'debt']
                    }
                }
            });

            setGeneratedPlan(JSON.parse(response.text));

        } catch (e) {
            console.error(e);
            setError("Sorry, I couldn't generate a plan. You can try rephrasing your request.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApplyPlan = () => {
        if (!generatedPlan) return;
        if (!window.confirm("This will replace your current budget items (income, bills, expenses, etc.) with the new AI-generated plan. Your transactions will not be affected. Do you want to continue?")) {
            return;
        }

        const newState: typeof state = JSON.parse(JSON.stringify(state));

        // Clear existing items
        newState.income = [];
        newState.bills = [];
        newState.expenses = [];
        newState.savings = [];
        newState.debt = [];

        const mapItems = (items: {name: string, planned: number}[], categoryType: CategoryType): BudgetItem[] => {
            return items.map(item => ({
                id: `${categoryType}-${item.name}-${Math.random()}`,
                name: item.name,
                planned: item.planned,
                actual: 0
            }));
        };

        newState.income = mapItems(generatedPlan.income, CategoryType.Income);
        newState.bills = mapItems(generatedPlan.bills, CategoryType.Bills);
        newState.expenses = mapItems(generatedPlan.expenses, CategoryType.Expenses);
        newState.savings = mapItems(generatedPlan.savings, CategoryType.Savings);
        newState.debt = mapItems(generatedPlan.debt, CategoryType.Debt);
        
        dispatch({ type: 'SET_BUDGET_STATE', payload: newState });

        alert("Your new budget has been applied!");
        setPage('dashboard');
    }

    const PlanTable: React.FC<{ title: string; items: { name: string; planned: number }[] }> = ({ title, items }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-700 mb-2">{title}</h3>
            {items.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                        <li key={index} className="py-2 flex justify-between">
                            <span>{item.name}</span>
                            <span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: displayCurrency }).format(item.planned)}</span>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-gray-500 text-sm">No items planned for this category.</p>}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">AI Budget Planner</h1>
                <p className="text-lg text-gray-500 mt-2">Describe your financial life, and let Gemini create a tailored budget for you.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Tell me about your finances</h2>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., I'm a software developer making 1,50,000 a month after taxes. My rent is 40,000 and I have a car payment of 15,000. I want to save aggressively for a down payment on a house while still being able to eat out twice a week."
                    className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    rows={5}
                />
                <button
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-purple-dark text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400"
                >
                    {isLoading ? <><Loader2 className="animate-spin" /> Generating Plan...</> : <><Sparkles /> Generate My Budget</>}
                </button>
                {error && <p className="text-red-600 text-center font-medium">{error}</p>}
            </div>

            {generatedPlan && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-center text-gray-800">Your AI-Generated Budget Plan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PlanTable title="Income" items={generatedPlan.income} />
                        <PlanTable title="Bills" items={generatedPlan.bills} />
                        <PlanTable title="Expenses" items={generatedPlan.expenses} />
                        <PlanTable title="Savings" items={generatedPlan.savings} />
                        <PlanTable title="Debt" items={generatedPlan.debt} />
                    </div>
                     <div className="text-center">
                        <button
                          onClick={handleApplyPlan}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Apply This Budget to My Dashboard <ArrowRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIBudgetPlannerPage;
