import React, { useState, useMemo } from 'react';
import { useBudgetState } from '../../hooks/useBudget';
import { CategoryType } from '../../types';
import CategoryTable from '../CategoryTable';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CURRENCY_DATA, EXCHANGE_RATES } from '../../constants';

const IncomePage: React.FC = () => {
    const fullBudgetState = useBudgetState();
    
    const [viewingDate, setViewingDate] = useState(() => {
        const initialDate = new Date(fullBudgetState.period.start.replace(/-/g, '/'));
        return { year: initialDate.getFullYear(), month: initialDate.getMonth() + 1 };
    });

    const displayData = useMemo(() => {
        const { year, month } = viewingDate;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const filteredTransactions = fullBudgetState.transactions.filter(t => {
            const transactionDate = new Date(t.date.replace(/-/g, '/'));
            return transactionDate >= startDate && transactionDate <= endDate;
        });
        
        const incomeActuals = new Map<string, number>();
        const incomeTransactions = [];

        for (const t of filteredTransactions) {
            if (t.categoryType === CategoryType.Income) {
                const currentActual = incomeActuals.get(t.categoryId) || 0;
                incomeActuals.set(t.categoryId, currentActual + t.amount);
                incomeTransactions.push(t);
            }
        }
        
        const recalculatedIncome = fullBudgetState.income.map(item => ({
            ...item,
            actual: incomeActuals.get(item.id) || 0,
        }));

        return {
            income: recalculatedIncome,
            transactions: incomeTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            displayCurrency: fullBudgetState.displayCurrency,
        };
    }, [fullBudgetState, viewingDate]);
    
    const rate = EXCHANGE_RATES[displayData.displayCurrency] || 1;
    const symbol = CURRENCY_DATA[displayData.displayCurrency]?.symbol || '$';

    const chartData = displayData.income.map(item => ({
        name: item.name,
        value: item.planned * rate,
    })).filter(item => item.value > 0);

    const COLORS = ['#865DFF', '#A482FF', '#C7B6FF', '#E1DAFF', '#F3F0FF'];

    const availableYears = useMemo(() => {
        const years = new Set(fullBudgetState.transactions.map(t => new Date(t.date.replace(/-/g, '/')).getFullYear()));
        if (years.size === 0) years.add(new Date().getFullYear());
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
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">Income Hub</h1>
                <p className="text-lg text-gray-500 mt-2">Track, manage, and analyze your income for {currentMonthName} {viewingDate.year}.</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row justify-center items-center gap-6">
                 <div className="flex items-center gap-3">
                    <label htmlFor="month-select" className="font-medium text-gray-600">Month:</label>
                    <select id="month-select" value={viewingDate.month} onChange={(e) => setViewingDate(d => ({...d, month: parseInt(e.target.value)}))} className="p-2 bg-gray-100 border-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple">
                        {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <label htmlFor="year-select" className="font-medium text-gray-600">Year:</label>
                    <select id="year-select" value={viewingDate.year} onChange={(e) => setViewingDate(d => ({...d, year: parseInt(e.target.value)}))} className="p-2 bg-gray-100 border-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple">
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <CategoryTable title="Income Sources" category={CategoryType.Income} items={displayData.income} />
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md">
                     <h3 className="text-lg font-bold text-gray-700 text-center mb-4">Planned Income Allocation</h3>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name">
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: displayData.displayCurrency }).format(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Income Transactions for {currentMonthName} {viewingDate.year}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3">Date</th>
                                <th scope="col" className="px-4 py-3">Description</th>
                                <th scope="col" className="px-4 py-3">Source</th>
                                <th scope="col" className="px-4 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayData.transactions.length > 0 ? displayData.transactions.map((t) => (
                                <tr key={t.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{new Date(t.date.replace(/-/g, '/')).toLocaleDateString('en-CA')}</td>
                                    <td className="px-4 py-2 font-medium text-gray-900">{t.description}</td>
                                    <td className="px-4 py-2 text-gray-600">{displayData.income.find(i => i.id === t.categoryId)?.name || 'N/A'}</td>
                                    <td className="px-4 py-2 text-right font-semibold text-green-600">
                                        +{symbol}{(t.amount * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        No income transactions recorded for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IncomePage;
