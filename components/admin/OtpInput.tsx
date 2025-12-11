'use client';

import React, { useRef, useState, ChangeEvent, KeyboardEvent, ClipboardEvent, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  isError?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  isError = false,
  isSuccess = false,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first empty input on mount or if value changes
    if (value.length < length && inputRefs.current[value.length]) {
      inputRefs.current[value.length]?.focus();
    }
  }, [value, length]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value;
    if (!/^\d*$/.test(inputValue)) return; // Only allow digits

    let newOtp = value.split('');
    newOtp[index] = inputValue;

    // If a digit is entered, move focus to the next input
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    onChange(newOtp.join(''));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      // If backspace pressed on an empty input, move focus to previous
      inputRefs.current[index - 1]?.focus();
      let newOtp = value.split('');
      newOtp[index - 1] = ''; // Clear the previous input
      onChange(newOtp.join(''));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, length);
    if (!/^\d*$/.test(pasteData)) return; // Only allow digits

    onChange(pasteData); // Paste the data directly
    inputRefs.current[pasteData.length - 1]?.focus(); // Focus last pasted digit
  };

  const getClassNames = (index: number) => {
    let classes = `w-10 h-10 text-center text-xl font-mono border rounded-md shadow-sm focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 `;
    if (isError) {
      classes += `border-red-500 ring-red-500 animate-wiggle`;
    } else if (isSuccess) {
      classes += `border-green-500 ring-green-500 animate-pulse-green`;
    } else {
      classes += `border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500`;
    }
    return classes;
  };

  return (
    <div className="flex justify-center space-x-2">
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            ref={(el) => (inputRefs.current[index] = el)}
            value={value[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={getClassNames(index)}
            disabled={disabled}
          />
        ))}
    </div>
  );
};

export default OtpInput;
