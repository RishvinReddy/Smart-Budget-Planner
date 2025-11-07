
import React from 'react';
import { useBudgetDispatch } from '../hooks/useBudget';
import { CURRENCY_DATA } from '../constants';
import { BudgetState } from '../types';

const BudgetSettings: React.FC<{data: BudgetState}> = ({ data }) => {
    const { period, displayCurrency } = data;
    const dispatch = useBudgetDispatch();

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch({ type: 'SET_DISPLAY_CURRENCY', payload: e.target.value });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-center sm:px-8">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget Period</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{formatDate(period.start)} - {formatDate(period.end)}</p>
            </div>
            <div className="text-center sm:text-right">
                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Currency</p>
                 <div className="mt-1 inline-flex items-center bg-brand-purple-light text-brand-purple-dark font-bold text-sm px-4 py-1.5 rounded-lg">
                    <span>{CURRENCY_DATA[displayCurrency]?.symbol}</span>
                    <span className="ml-2 uppercase">{CURRENCY_DATA[displayCurrency]?.name}</span>
                 </div>
            </div>
        </div>
    );
};

export default BudgetSettings;