import React, { useState, useMemo } from 'react';
import { BudgetState } from '../types';
import { AlertTriangle, X } from 'lucide-react';
import { EXCHANGE_RATES } from '../constants';


interface Alert {
    type: 'warning' | 'danger';
    message: string;
}

const BudgetAlerts: React.FC<{ data: BudgetState }> = ({ data }) => {
    const [isDismissed, setIsDismissed] = useState(false);

    const alerts = useMemo<Alert[]>(() => {
        const generatedAlerts: Alert[] = [];
        const categoriesToScan = [
            { items: data.bills },
            { items: data.expenses },
            { items: data.debt }
        ];

        const rate = EXCHANGE_RATES[data.displayCurrency] || 1;

        categoriesToScan.forEach(category => {
            category.items.forEach(item => {
                const threshold = item.alertThreshold ?? 90; // Default threshold
                if (item.planned > 0) {
                    const percentage = (item.actual / item.planned) * 100;
                    if (percentage >= 100) {
                        generatedAlerts.push({
                            type: 'danger',
                            message: `You've exceeded your budget for "${item.name}". You are over by ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: data.displayCurrency }).format((item.actual - item.planned) * rate)}.`
                        });
                    } else if (percentage >= threshold) {
                        generatedAlerts.push({
                            type: 'warning',
                            message: `You've used ${percentage.toFixed(0)}% of your budget for "${item.name}".`
                        });
                    }
                }
            });
        });
        return generatedAlerts;
    }, [data]);

    if (alerts.length === 0 || isDismissed) {
        return null;
    }

    const warningAlerts = alerts.filter(a => a.type === 'warning');
    const dangerAlerts = alerts.filter(a => a.type === 'danger');

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-400">
            <div className="flex justify-between items-start">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-6 w-6 text-yellow-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-bold text-gray-800">Budget Alerts</h3>
                        <div className="mt-2 text-sm text-gray-700 space-y-2">
                            {dangerAlerts.length > 0 && (
                                <ul className="list-disc space-y-1 pl-5">
                                    {dangerAlerts.map((alert, index) => (
                                        <li key={`danger-${index}`} className="text-red-600 font-semibold">{alert.message}</li>
                                    ))}
                                </ul>
                            )}
                            {warningAlerts.length > 0 && (
                                <ul className="list-disc space-y-1 pl-5">
                                    {warningAlerts.map((alert, index) => (
                                        <li key={`warning-${index}`} className="text-yellow-700">{alert.message}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                    <button
                        onClick={() => setIsDismissed(true)}
                        className="inline-flex text-gray-400 hover:text-gray-500"
                    >
                        <span className="sr-only">Dismiss</span>
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BudgetAlerts;