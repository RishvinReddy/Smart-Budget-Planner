import { BudgetState, CategoryType } from './types';

export const CURRENCY_DATA: { [key: string]: { symbol: string, name: string } } = {
  'USD': { symbol: '$', name: 'US Dollar' },
  'EUR': { symbol: '€', name: 'Euro' },
  'GBP': { symbol: '£', name: 'British Pound' },
  'JPY': { symbol: '¥', name: 'Japanese Yen' },
  'INR': { symbol: '₹', name: 'Indian Rupee' },
};

// Base currency is USD
export const EXCHANGE_RATES: { [key: string]: number } = {
  'USD': 1,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 157.0,
  'INR': 83.5,
};

export const INITIAL_BUDGET_STATE: BudgetState = {
  period: {
    start: '2025-10-01',
    end: '2025-10-31',
  },
  displayCurrency: 'INR',
  income: [
    { id: 'inc1', name: 'Realtor Income', planned: 10600, actual: 10600 },
  ],
  bills: [
    { id: 'bill1', name: 'Apartment', planned: 2100, actual: 2100, alertThreshold: 90 },
    { id: 'bill2', name: 'Internet', planned: 85, actual: 85, alertThreshold: 90 },
    { id: 'bill3', name: 'Electricity', planned: 190, actual: 190, alertThreshold: 90 },
    { id: 'bill4', name: 'Water', planned: 50, actual: 50, alertThreshold: 90 },
    { id: 'bill5', name: 'Netflix', planned: 135, actual: 135, alertThreshold: 90 },
    { id: 'bill6', name: 'Gym membership', planned: 45, actual: 45, alertThreshold: 90 },
    { id: 'bill7', name: 'Car insurance', planned: 140, actual: 140, alertThreshold: 90 },
  ],
  expenses: [
    { id: 'exp1', name: 'Groceries', planned: 550, actual: 550, alertThreshold: 90 },
    { id: 'exp2', name: 'Eating out', planned: 300, actual: 300, alertThreshold: 90 },
    { id: 'exp3', name: 'Shopping', planned: 700, actual: 700, alertThreshold: 90 },
    { id: 'exp4', name: 'Business expenses', planned: 650, actual: 650, alertThreshold: 90 },
    { id: 'exp5', name: 'Hair/nails', planned: 230, actual: 230, alertThreshold: 90 },
  ],
  savings: [
      { id: 'sav1', name: 'Retirement account', planned: 600, actual: 600 },
      { id: 'sav2', name: 'Emergencies', planned: 800, actual: 800 },
      { id: 'sav3', name: 'Vacation to the US', planned: 350, actual: 350 },
      { id: 'sav4', name: 'Savings account', planned: 2820, actual: 2820 },
  ],
  debt: [
    { id: 'debt1', name: 'Car lease', planned: 420, actual: 420, alertThreshold: 90 },
    { id: 'debt2', name: 'Credit card', planned: 315, actual: 315, alertThreshold: 90 },
    { id: 'debt3', name: 'Business loan', planned: 120, actual: 120, alertThreshold: 90 },
  ],
  transactions: [
    { id: 'txn1', date: '2025-10-02', description: 'Trader Joe\'s', amount: 125.50, categoryId: 'exp1', categoryType: CategoryType.Expenses, location: '123 Market St' },
    { id: 'txn2', date: '2025-10-05', description: 'Monthly Rent', amount: 2100, categoryId: 'bill1', categoryType: CategoryType.Bills },
    { id: 'txn3', date: '2025-10-05', description: 'Freelance Payment', amount: 2500, categoryId: 'inc1', categoryType: CategoryType.Income },
    { id: 'txn4', date: '2025-10-08', description: 'Dinner with friends', amount: 78.00, categoryId: 'exp2', categoryType: CategoryType.Expenses, location: 'The Italian Place' },
    { id: 'txn5', date: '2025-10-10', description: 'AT&T Internet', amount: 85, categoryId: 'bill2', categoryType: CategoryType.Bills },
    { id: 'txn6', date: '2025-10-12', description: 'Zara', amount: 210.20, categoryId: 'exp3', categoryType: CategoryType.Expenses, location: 'Mall Galleria' },
    { id: 'txn7', date: '2025-10-15', description: 'Transfer to Roth IRA', amount: 600, categoryId: 'sav1', categoryType: CategoryType.Savings },
    { id: 'txn8', date: '2025-10-15', description: 'Primary Job Paycheck', amount: 8100, categoryId: 'inc1', categoryType: CategoryType.Income },
    { id: 'txn9', date: '2025-10-18', description: 'Car Payment', amount: 420, categoryId: 'debt1', categoryType: CategoryType.Debt },
    { id: 'txn10', date: '2025-10-20', description: 'Whole Foods', amount: 150.75, categoryId: 'exp1', categoryType: CategoryType.Expenses, location: '555 Health Blvd' },
  ],
};