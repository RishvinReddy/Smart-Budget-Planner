export interface BudgetItem {
  id: string;
  name: string;
  planned: number;
  actual: number;
  alertThreshold?: number;
}

export enum CategoryType {
  Income = 'income',
  Bills = 'bills',
  Expenses = 'expenses',
  Savings = 'savings',
  Debt = 'debt'
}

export interface Item {
  description: string;
  amount: number;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  categoryId: string; // links to a BudgetItem's id
  categoryType: CategoryType;
  location?: string;
  items?: Item[];
}

export interface BudgetState {
  period: {
    start: string;
    end: string;
  };
  displayCurrency: string; // e.g., 'USD', 'EUR'
  income: BudgetItem[];
  bills: BudgetItem[];
  expenses: BudgetItem[];
  savings: BudgetItem[];
  debt: BudgetItem[];
  transactions: Transaction[];
}

export type BudgetAction =
  | { type: 'UPDATE_ITEM'; payload: { category: CategoryType; item: BudgetItem } }
  | { type: 'ADD_ITEM'; payload: { category: CategoryType; name: string, planned?: number } }
  | { type: 'REMOVE_ITEM'; payload: { category: CategoryType; id: string } }
  | { type: 'SET_DISPLAY_CURRENCY'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  | { type: 'REMOVE_TRANSACTION'; payload: { id: string } }
  | { type: 'SET_BUDGET_STATE'; payload: BudgetState }
  | { type: 'RESET_STATE' };