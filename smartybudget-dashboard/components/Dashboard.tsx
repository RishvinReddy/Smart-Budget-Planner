import React, { useState, useMemo } from 'react';
import { useBudgetState } from '../hooks/useBudget';
import FinancialOverview from './FinancialOverview';
import AmountLeftToSpendChart from './charts/AmountLeftToSpendChart';
import CashFlowChart from './charts/CashFlowChart';
import AllocationSummaryChart from './charts/AllocationSummaryChart';
import CategoryTable from './CategoryTable';
import { CategoryType, BudgetItem, BudgetState } from '../types';
import BudgetSettings from './BudgetSettings';
import TransactionList from './TransactionList';
import AISuggestions from './AISuggestions';
import AINarrativeSummary from './AINarrativeSummary';
import BudgetAlerts from './BudgetAlerts';

interface DashboardProps {
  searchQuery: string;
}

const Dashboard: React.FC<DashboardProps> = ({ searchQuery }) => {
    const fullBudgetState = useBudgetState();
    
    // State for the selected viewing date, initialized to the budget's default period
    const [viewingDate, setViewingDate] = useState(() => {
        const initialDate = new Date(fullBudgetState.period.start.replace(/-/g, '/'));
        return { year: initialDate.getFullYear(), month: initialDate.getMonth() + 1 };
    });

    // Derive the data to display based on the full state and the selected viewing date
    const displayData: BudgetState = useMemo(() => {
        const { year, month } = viewingDate;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const filteredTransactions = fullBudgetState.transactions.filter(t => {
            // JS dates from 'YYYY-MM-DD' can be off by a day due to timezone, so parse carefully.
            const transactionDate = new Date(t.date.replace(/-/g, '/'));
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        // Recalculate 'actual' amounts for all categories based on filtered transactions
        const categoryActuals = new Map<string, number>();
        for (const t of filteredTransactions) {
            const currentActual = categoryActuals.get(t.categoryId) || 0;
            categoryActuals.set(t.categoryId, currentActual + t.amount);
        }
        
        const recalculateActuals = (items: BudgetItem[]): BudgetItem[] => {
            return items.map(item => ({
                ...item,
                actual: categoryActuals.get(item.id) || 0,
            }));
        };

        return {
            ...fullBudgetState,
            period: {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
            },
            transactions: filteredTransactions,
            income: recalculateActuals(fullBudgetState.income),
            bills: recalculateActuals(fullBudgetState.bills),
            expenses: recalculateActuals(fullBudgetState.expenses),
            savings: recalculateActuals(fullBudgetState.savings),
            debt: recalculateActuals(fullBudgetState.debt),
        };
    }, [fullBudgetState, viewingDate]);

    // Generate year options from transaction data
    const availableYears = useMemo(() => {
        const years = new Set(fullBudgetState.transactions.map(t => new Date(t.date.replace(/-/g, '/')).getFullYear()));
        if (years.size === 0) {
            years.add(new Date().getFullYear());
        }
        return Array.from(years).sort((a, b) => b - a);
    }, [fullBudgetState.transactions]);

    const months = [
        { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
        { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
        { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
        { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
    ];

    const currentMonthName = months.find(m => m.value === viewingDate.month)?.name;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">Budget Dashboard</h1>
                <p className="text-lg text-gray-500 mt-1">{currentMonthName} {viewingDate.year}</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row justify-center items-center gap-6">
                <div className="flex items-center gap-3">
                    <label htmlFor="month-select" className="font-medium text-gray-600">Month:</label>
                    <select
                        id="month-select"
                        value={viewingDate.month}
                        onChange={(e) => setViewingDate(d => ({...d, month: parseInt(e.target.value)}))}
                        className="p-2 bg-gray-100 border-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    >
                        {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <label htmlFor="year-select" className="font-medium text-gray-600">Year:</label>
                    <select
                        id="year-select"
                        value={viewingDate.year}
                        onChange={(e) => setViewingDate(d => ({...d, year: parseInt(e.target.value)}))}
                        className="p-2 bg-gray-100 border-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    >
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <BudgetAlerts data={displayData} />

            <AINarrativeSummary data={displayData} />
            
            <FinancialOverview data={displayData} />
            
            <BudgetSettings data={displayData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AmountLeftToSpendChart data={displayData} />
                <CashFlowChart data={displayData} />
                <AllocationSummaryChart data={displayData} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CategoryTable title="Income" category={CategoryType.Income} items={displayData.income} />
                <CategoryTable title="Bills" category={CategoryType.Bills} items={displayData.bills} />
                <CategoryTable title="Expenses" category={CategoryType.Expenses} items={displayData.expenses} />
                <CategoryTable title="Savings" category={CategoryType.Savings} items={displayData.savings} />
            </div>

            <AISuggestions data={displayData} />
            
            <div className="grid grid-cols-1">
                <CategoryTable title="Debt" category={CategoryType.Debt} items={displayData.debt} />
            </div>
            <div className="mt-6">
              <TransactionList data={displayData} searchQuery={searchQuery} />
            </div>
        </div>
    );
};

export default Dashboard;