
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BudgetItem, BudgetState } from '../../types';
import { CURRENCY_DATA, EXCHANGE_RATES } from '../../constants';


const CashFlowChart: React.FC<{data: BudgetState}> = ({ data }) => {
    const { expenses, bills, savings, debt, displayCurrency } = data;

    const rate = EXCHANGE_RATES[displayCurrency] || 1;
    const symbol = CURRENCY_DATA[displayCurrency]?.symbol || '$';
    
    const sumItems = (items: BudgetItem[]) => {
        return items.reduce((acc, item) => {
            acc.planned += item.planned;
            acc.actual += item.actual;
            return acc;
        }, { planned: 0, actual: 0 });
    };

    const chartData = useMemo(() => [
        { name: 'Expenses', Planned: sumItems(expenses).planned * rate, Actual: sumItems(expenses).actual * rate },
        { name: 'Bills', Planned: sumItems(bills).planned * rate, Actual: sumItems(bills).actual * rate },
        { name: 'Savings', Planned: sumItems(savings).planned * rate, Actual: sumItems(savings).actual * rate },
        { name: 'Debt', Planned: sumItems(debt).planned * rate, Actual: sumItems(debt).actual * rate },
    ], [expenses, bills, savings, debt, rate]);

    return (
        <div className="bg-white p-4 rounded-xl shadow-md h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-700 text-center mb-4">Cash Flow</h3>
            <div className="flex-grow" style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value as number)}/>
                        <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: displayCurrency,
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(value as number)} />
                        <Legend wrapperStyle={{ fontSize: "14px", paddingTop: '1rem' }} verticalAlign="bottom"/>
                        <Bar dataKey="Planned" fill="#C7B6FF" />
                        <Bar dataKey="Actual" fill="#865DFF" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CashFlowChart;