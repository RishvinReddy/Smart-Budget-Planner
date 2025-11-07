
import React, { useMemo } from 'react';
import { BudgetItem, BudgetState } from '../types';
import { CURRENCY_DATA, EXCHANGE_RATES } from '../constants';

const FinancialOverview: React.FC<{data: BudgetState}> = ({ data }) => {
    const { displayCurrency, income, expenses, bills, savings, debt } = data;

    const rate = EXCHANGE_RATES[displayCurrency] || 1;

    const totalPlanned = useMemo(() => (items: BudgetItem[]) => items.reduce((sum, item) => sum + item.planned, 0), []);
    
    const overviewItems = useMemo(() => [
        { label: 'Income', value: totalPlanned(income) * rate },
        { label: 'Expenses', value: totalPlanned(expenses) * rate },
        { label: 'Bills', value: totalPlanned(bills) * rate },
        { label: 'Savings', value: totalPlanned(savings) * rate },
        { label: 'Debt', value: totalPlanned(debt) * rate },
    ], [income, expenses, bills, savings, debt, rate, totalPlanned]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {overviewItems.map(item => (
                    <div key={item.label} className="bg-brand-purple-light p-4 rounded-xl">
                        <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                        <p className="text-3xl font-bold text-brand-purple-dark">
                            {new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: displayCurrency,
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(item.value)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FinancialOverview;