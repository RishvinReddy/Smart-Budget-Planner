import React, { useState, useEffect, useRef } from 'react';
import { useBudgetState } from '../hooks/useBudget';
import { EXCHANGE_RATES } from '../constants';

interface EditableCellProps {
  value: string | number;
  onSave: (value: string | number) => void;
  prefix?: string;
  suffix?: string;
  type?: 'text' | 'number';
  disableRateConversion?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onSave, prefix = '', suffix = '', type = 'text', disableRateConversion = false }) => {
  const { displayCurrency } = useBudgetState();
  const rate = EXCHANGE_RATES[displayCurrency] || 1;

  const [isEditing, setIsEditing] = useState(false);

  const getInitialValue = () => {
    if (type !== 'number') return value;
    return disableRateConversion ? Number(value) : Number(value) * rate;
  };
  
  const [currentValue, setCurrentValue] = useState<string | number>(getInitialValue());
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentValue(getInitialValue());
  }, [value, rate, type, displayCurrency]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    const valueToSave = (type === 'number' && !disableRateConversion) ? Number(currentValue) / rate : currentValue;
    onSave(valueToSave);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleBlur();
      } else if (e.key === 'Escape') {
          const originalValue = getInitialValue();
          setCurrentValue(originalValue);
          setIsEditing(false);
      }
  }

  if (isEditing) {
    return (
      <div className="relative">
        {prefix && type === 'number' && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">{prefix}</span>}
        <input
          ref={inputRef}
          type={type}
          value={currentValue}
          onChange={(e) => setCurrentValue(type === 'number' ? e.target.valueAsNumber || 0 : e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full bg-white border border-brand-purple rounded-md py-1 text-right focus:outline-none focus:ring-2 focus:ring-brand-purple ${prefix && type ==='number' ? 'pl-5 pr-2' : 'px-2'}`}
        />
      </div>
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-brand-purple-light rounded-md px-2 py-1 -mx-2 -my-1">
      {type === 'number' ? `${prefix}${Number(currentValue).toLocaleString(undefined, { minimumFractionDigits: disableRateConversion ? 0 : 2, maximumFractionDigits: disableRateConversion ? 0 : 2 })}${suffix}` : value}
    </div>
  );
};

export default EditableCell;