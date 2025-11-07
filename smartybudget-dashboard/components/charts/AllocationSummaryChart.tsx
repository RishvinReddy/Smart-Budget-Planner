
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { BudgetItem, BudgetState } from '../../types';

const AllocationSummaryChart: React.FC<{data: BudgetState}> = ({ data }) => {
    const { expenses, bills, savings, debt } = data;

    const sumPlanned = (items: BudgetItem[]) => items.reduce((sum, item) => sum + item.planned, 0);

    const chartData = useMemo(() => [
        { name: 'Expenses', value: sumPlanned(expenses) },
        { name: 'Bills', value: sumPlanned(bills) },
        { name: 'Savings', value: sumPlanned(savings) },
        { name: 'Debt', value: sumPlanned(debt) },
    ].filter(d => d.value > 0), [expenses, bills, savings, debt]);

    const COLORS = ['#A482FF', '#865DFF', '#C7B6FF', '#E1DAFF'];

    return (
        <div className="bg-white p-4 rounded-xl shadow-md h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-700 text-center mb-4">Allocation Summary</h3>
            <div className="flex-grow" style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                const RADIAN = Math.PI / 180;
                                // Fix: Ensure all props from recharts are treated as numbers before performing arithmetic operations.
                                const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 1.3;
                                const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
                                const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                    <text x={x} y={y} fill="#6B7280" textAnchor={x > Number(cx) ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                                        {`${(Number(percent) * 100).toFixed(0)}%`}
                                    </text>
                                );
                            }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} verticalAlign='bottom'/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AllocationSummaryChart;