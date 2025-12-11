'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  isError?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  isError = false,
  isSuccess = false,
  disabled = false,
  autoFocus = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const getClassNames = () => {
    let classes = `flex items-center w-full rounded-md border shadow-sm focus-within:ring-2 bg-gray-50 dark:bg-gray-800 transition-all `;
    if (isError) {
      classes += `border-red-500 ring-red-500 animate-wiggle`;
    } else if (isSuccess) {
      classes += `border-green-500 ring-green-500 animate-pulse-green`;
    } else {
      classes += `border-gray-300 dark:border-gray-700 focus-within:border-indigo-500 focus-within:ring-indigo-500`;
    }
    return classes;
  };

  return (
    <div className={getClassNames()}>
      <Lock className="w-5 h-5 ml-3 text-gray-500 dark:text-gray-400" />
      <input
        type={showPassword ? 'text' : 'password'}
        className="flex-1 px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
        disabled={disabled}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default PasswordInput;
