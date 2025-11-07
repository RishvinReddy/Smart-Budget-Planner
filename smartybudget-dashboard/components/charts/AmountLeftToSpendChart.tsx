
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BudgetItem, BudgetState } from '../../types';
import { CURRENCY_DATA, EXCHANGE_RATES } from '../../constants';

const AmountLeftToSpendChart: React.FC<{data: BudgetState}> = ({ data }) => {
    const { displayCurrency, income, bills, expenses, savings, debt } = data;

    const rate = EXCHANGE_RATES[displayCurrency] || 1;

    const totalActualIncome = useMemo(() => income.reduce((sum, item) => sum + item.actual, 0), [income]);
    const totalActualSpending = useMemo(() => {
        const allSpending: BudgetItem[] = [...bills, ...expenses, ...savings, ...debt];
        return allSpending.reduce((sum, item) => sum + item.actual, 0);
    }, [bills, expenses, savings, debt]);

    const amountLeft = totalActualIncome - totalActualSpending;

    const chartData = [
        { name: 'Spent', value: totalActualSpending * rate },
        { name: 'Left', value: Math.max(0, amountLeft * rate) },
    ];

    const COLORS = ['#A482FF', '#E5E7EB'];

    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: displayCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amountLeft * rate);

    return (
        <div className="bg-white p-4 rounded-xl shadow-md h-full flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold text-gray-700 mb-2 text-center">Amount Left to Spend</h3>
            <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-gray-800">
                            {formattedAmount}
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AmountLeftToSpendChart;