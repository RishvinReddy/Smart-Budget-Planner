import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useEffect } from 'react';
import { BudgetState, BudgetAction, CategoryType, BudgetItem, Transaction } from '../types';
import { INITIAL_BUDGET_STATE } from '../constants';

const LOCAL_STORAGE_KEY = 'smartyBudgetData';

const budgetReducer = (state: BudgetState, action: BudgetAction): BudgetState => {
  switch (action.type) {
    case 'UPDATE_ITEM': {
      const { category, item } = action.payload;
      return {
        ...state,
        [category]: state[category].map((i) => (i.id === item.id ? item : i)),
      };
    }
    case 'ADD_ITEM': {
      const { category, name, planned = 0 } = action.payload;
      const newItem: BudgetItem = {
        id: new Date().toISOString() + Math.random(), // Add random number to avoid collision
        name,
        planned,
        actual: 0,
        alertThreshold: 90,
      };
      return {
        ...state,
        [category]: [...state[category], newItem],
      };
    }
    case 'REMOVE_ITEM': {
      const { category, id } = action.payload;
      return {
        ...state,
        [category]: state[category].filter((i) => i.id !== id),
      };
    }
    case 'SET_DISPLAY_CURRENCY': {
        return {
            ...state,
            displayCurrency: action.payload
        }
    }
    case 'ADD_TRANSACTION': {
      const newTransaction: Transaction = {
        id: new Date().toISOString(),
        ...action.payload,
      };
      return {
        ...state,
        transactions: [newTransaction, ...state.transactions],
      };
    }
    case 'REMOVE_TRANSACTION': {
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload.id),
      };
    }
    case 'SET_BUDGET_STATE': {
      return action.payload;
    }
    case 'RESET_STATE': {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return INITIAL_BUDGET_STATE;
    }
    default:
      return state;
  }
};

const BudgetStateContext = createContext<BudgetState | undefined>(undefined);
const BudgetDispatchContext = createContext<Dispatch<BudgetAction> | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initializer = (initialState: BudgetState): BudgetState => {
    try {
      const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedState) {
        return JSON.parse(storedState);
      }
    } catch (error) {
      console.error("Could not load state from localStorage", error);
    }
    return initialState;
  };

  const [state, dispatch] = useReducer(budgetReducer, INITIAL_BUDGET_STATE, initializer);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Could not save state to localStorage", error);
    }
  }, [state]);


  return (
    <BudgetStateContext.Provider value={state}>
      <BudgetDispatchContext.Provider value={dispatch}>
        {children}
      </BudgetDispatchContext.Provider>
    </BudgetStateContext.Provider>
  );
};

export const useBudgetState = (): BudgetState => {
  const context = useContext(BudgetStateContext);
  if (context === undefined) {
    throw new Error('useBudgetState must be used within a BudgetProvider');
  }
  return context;
};

export const useBudgetDispatch = (): Dispatch<BudgetAction> => {
  const context = useContext(BudgetDispatchContext);
  if (context === undefined) {
    throw new Error('useBudgetDispatch must be used within a BudgetProvider');
  }
  return context;
};