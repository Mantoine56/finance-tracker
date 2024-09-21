import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, className, ...props }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);