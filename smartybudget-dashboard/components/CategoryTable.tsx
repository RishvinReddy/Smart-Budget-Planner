import React, { useState } from 'react';
import { BudgetItem, CategoryType } from '../types';
import { useBudgetState, useBudgetDispatch } from '../hooks/useBudget';
import EditableCell from './EditableCell';
import { PlusCircle, Trash2 } from 'lucide-react';
import { CURRENCY_DATA, EXCHANGE_RATES } from '../constants';


interface CategoryTableProps {
  title: string;
  category: CategoryType;
  items: BudgetItem[];
}

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
    </div>
);

const CategoryTable: React.FC<CategoryTableProps> = ({ title, category, items }) => {
  const { displayCurrency } = useBudgetState();
  const dispatch = useBudgetDispatch();
  const [newItemName, setNewItemName] = useState('');

  const rate = EXCHANGE_RATES[displayCurrency] || 1;
  const symbol = CURRENCY_DATA[displayCurrency]?.symbol || '$';
  
  const hasAlerts = category !== CategoryType.Income && category !== CategoryType.Savings;

  const handleUpdate = (item: BudgetItem, field: keyof BudgetItem, value: string | number) => {
    const updatedItem = { ...item, [field]: value };
    dispatch({ type: 'UPDATE_ITEM', payload: { category, item: updatedItem } });
  };
  
  const handleAddItem = () => {
      if (newItemName.trim()) {
          dispatch({ type: 'ADD_ITEM', payload: { category, name: newItemName }});
          setNewItemName('');
      }
  };
  
  const handleRemoveItem = (id: string) => {
      dispatch({ type: 'REMOVE_ITEM', payload: { category, id }});
  }

  const totalPlanned = items.reduce((sum, item) => sum + item.planned, 0);
  const totalActual = items.reduce((sum, item) => sum + item.actual, 0);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md overflow-x-auto">
      <h3 className="text-lg font-bold text-gray-700 mb-4">{title}</h3>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-2 py-3">Item</th>
            <th scope="col" className="px-2 py-3 text-right">Planned</th>
            <th scope="col" className="px-2 py-3 text-right">Actual</th>
            <th scope="col" className="px-2 py-3 text-center">Progress</th>
            {hasAlerts && <th scope="col" className="px-2 py-3 text-center">Alert %</th>}
            <th scope="col" className="px-2 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
             const progress = item.planned > 0 ? (item.actual / item.planned) * 100 : 0;
             return (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-2 py-2">
                  <EditableCell value={item.name} onSave={(value) => handleUpdate(item, 'name', value)} />
                </td>
                <td className="px-2 py-2 text-right">
                  <EditableCell value={item.planned} onSave={(value) => handleUpdate(item, 'planned', Number(value))} prefix={symbol} type="number" />
                </td>
                <td className="px-2 py-2 text-right">
                  <EditableCell value={item.actual} onSave={(value) => handleUpdate(item, 'actual', Number(value))} prefix={symbol} type="number" />
                </td>
                <td className="px-2 py-2 align-middle">
                  <ProgressBar value={Math.min(100, progress)} />
                </td>
                {hasAlerts && (
                    <td className="px-2 py-2 text-center">
                        <EditableCell 
                            value={item.alertThreshold ?? 90} 
                            onSave={(value) => handleUpdate(item, 'alertThreshold', Number(value))} 
                            type="number" 
                            disableRateConversion={true}
                            suffix="%"
                        />
                    </td>
                )}
                <td className="px-2 py-2 text-center">
                    <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                </td>
              </tr>
          )})}
        </tbody>
        <tfoot>
          <tr className="font-semibold text-gray-900 bg-gray-50">
            <th scope="row" className="px-2 py-3 text-base">Total</th>
            <td className="px-2 py-3 text-right">{symbol}{(totalPlanned * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="px-2 py-3 text-right">{symbol}{(totalActual * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td colSpan={hasAlerts ? 3 : 2}></td>
          </tr>
        </tfoot>
      </table>
      <div className="mt-4 flex gap-2">
          <input 
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`New ${title.slice(0, -1)}`}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
          />
          <button onClick={handleAddItem} className="bg-brand-purple-dark text-white p-2 rounded-md hover:bg-brand-purple-dark/90 flex items-center gap-1">
              <PlusCircle size={16} /> Add
          </button>
      </div>
    </div>
  );
};

export default CategoryTable;