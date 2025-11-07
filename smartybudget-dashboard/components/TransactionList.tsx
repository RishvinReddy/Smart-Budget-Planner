
import React, { useState, useMemo } from 'react';
import { useBudgetState, useBudgetDispatch } from '../hooks/useBudget';
import { Transaction, CategoryType, BudgetItem, BudgetState } from '../types';
import { PlusCircle, Trash2, ScanLine, ChevronDown } from 'lucide-react';
import { CURRENCY_DATA, EXCHANGE_RATES } from '../constants';
import ImageAnalyzer from './ImageAnalyzer';

const AddTransactionForm: React.FC<{
    allCategories: { group: string; items: BudgetItem[], type: CategoryType }[],
}> = ({ allCategories }) => {
    const { displayCurrency } = useBudgetState();
    const dispatch = useBudgetDispatch();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');

    const rate = EXCHANGE_RATES[displayCurrency] || 1;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date || !category) {
            alert('Please fill all fields');
            return;
        }

        const { categoryId, categoryType } = JSON.parse(category);
        const amountInBaseCurrency = parseFloat(amount) / rate;

        dispatch({
            type: 'ADD_TRANSACTION',
            payload: {
                date,
                description,
                amount: amountInBaseCurrency,
                categoryId,
                categoryType,
                location,
            },
        });
        
        // Reset form
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setCategory('');
        setLocation('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="flex flex-col">
                <label htmlFor="date" className="text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" required />
            </div>
            <div className="flex flex-col">
                <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" id="description" placeholder="e.g., Groceries" value={description} onChange={e => setDescription(e.target.value)} className="input-field" required />
            </div>
             <div className="flex flex-col">
                <label htmlFor="location" className="text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" id="location" placeholder="e.g., Main St" value={location} onChange={e => setLocation(e.target.value)} className="input-field" />
            </div>
            <div className="flex flex-col">
                <label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" id="amount" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="input-field" step="0.01" required />
            </div>
            <div className="flex flex-col">
                <label htmlFor="category" className="text-sm font-medium text-gray-700 mb-1">Category</label>
                <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="input-field" required>
                    <option value="" disabled>Select a category</option>
                    {allCategories.map(catGroup => (
                        <optgroup label={catGroup.group} key={catGroup.group}>
                            {catGroup.items.map(item => (
                                <option key={item.id} value={JSON.stringify({ categoryId: item.id, categoryType: catGroup.type })}>
                                    {item.name}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>
            <button type="submit" className="bg-brand-purple-dark text-white p-2 rounded-md hover:bg-brand-purple-dark/90 flex items-center justify-center gap-1 h-10">
                <PlusCircle size={16} /> Add
            </button>
        </form>
    );
};


const TransactionList: React.FC<{data: BudgetState; searchQuery: string}> = ({ data, searchQuery }) => {
    const { transactions, displayCurrency, ...categories } = data;
    const dispatch = useBudgetDispatch();

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);

    const rate = EXCHANGE_RATES[displayCurrency] || 1;
    const symbol = CURRENCY_DATA[displayCurrency]?.symbol || '$';

    const allCategories = useMemo(() => [
        { group: 'Income', items: categories.income, type: CategoryType.Income },
        { group: 'Bills', items: categories.bills, type: CategoryType.Bills },
        { group: 'Expenses', items: categories.expenses, type: CategoryType.Expenses },
        { group: 'Savings', items: categories.savings, type: CategoryType.Savings },
        { group: 'Debt', items: categories.debt, type: CategoryType.Debt },
    ], [categories]);

    const categoryMap = useMemo(() => {
        const map = new Map<string, string>();
        allCategories.forEach(group => {
            group.items.forEach(item => {
                map.set(item.id, item.name);
            });
        });
        return map;
    }, [allCategories]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const transactionDate = new Date(t.date.replace(/-/g, '/'));
            // Use toDateString to compare dates without time component
            if (startDate && new Date(transactionDate.toDateString()) < new Date(new Date(startDate.replace(/-/g, '/')).toDateString())) return false;
            if (endDate && new Date(transactionDate.toDateString()) > new Date(new Date(endDate.replace(/-/g, '/')).toDateString())) return false;
            if (selectedCategory && t.categoryId !== selectedCategory) return false;
            if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase()) && !(t.location && t.location.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, startDate, endDate, selectedCategory, searchQuery]);

    const handleRemoveTransaction = (id: string) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            dispatch({ type: 'REMOVE_TRANSACTION', payload: { id } });
        }
    };
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Transactions</h3>

            <div className="mb-4 bg-gray-50 rounded-lg">
                <button 
                    onClick={() => setIsAnalyzerOpen(!isAnalyzerOpen)}
                    className="w-full p-4 flex justify-between items-center font-semibold text-gray-700"
                    aria-expanded={isAnalyzerOpen}
                    aria-controls="image-analyzer-content"
                >
                    <div className="flex items-center gap-3">
                        <ScanLine className="h-5 w-5 text-brand-purple-dark" />
                        <span>Scan a Receipt with AI</span>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isAnalyzerOpen ? 'rotate-180' : ''}`} />
                </button>
                {isAnalyzerOpen && (
                    <div id="image-analyzer-content" className="p-4 border-t border-gray-200">
                        <ImageAnalyzer />
                    </div>
                )}
            </div>

            <AddTransactionForm allCategories={allCategories} />

            <div className="my-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
                </div>
                <div className="flex flex-col col-span-1 md:col-span-2">
                    <label htmlFor="filterCategory" className="text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
                    <select id="filterCategory" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-field">
                        <option value="">All Categories</option>
                        {allCategories.map(catGroup => (
                            <optgroup label={catGroup.group} key={catGroup.group}>
                                {catGroup.items.map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Description</th>
                            <th scope="col" className="px-4 py-3">Category</th>
                            <th scope="col" className="px-4 py-3">Location</th>
                            <th scope="col" className="px-4 py-3 text-right">Amount</th>
                            <th scope="col" className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                            <tr key={t.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">{new Date(t.date.replace(/-/g, '/')).toLocaleDateString('en-CA')}</td>
                                <td className="px-4 py-2 font-medium text-gray-900">{t.description}</td>
                                <td className="px-4 py-2 text-gray-600">{categoryMap.get(t.categoryId) || 'N/A'}</td>
                                <td className="px-4 py-2 text-gray-600">{t.location || 'N/A'}</td>
                                <td className={`px-4 py-2 text-right font-semibold ${t.categoryType === CategoryType.Income ? 'text-green-600' : 'text-gray-800'}`}>
                                    {t.categoryType === CategoryType.Income ? '+' : ''}{symbol}{(t.amount * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button onClick={() => handleRemoveTransaction(t.id)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                    {searchQuery ? `No transactions found for "${searchQuery}".` : 'No transactions found for this period.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
             <style>{`
                .input-field {
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #D1D5DB;
                    border-radius: 0.375rem;
                    background-color: white;
                    width: 100%;
                    height: 2.5rem; /* 40px for consistency with button */
                }
                .input-field:focus {
                    outline: none;
                    border-color: #A482FF;
                    box-shadow: 0 0 0 2px #F3F0FF;
                }
            `}</style>
        </div>
    );
};

export default TransactionList;