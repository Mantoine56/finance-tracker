import React from 'react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Transaction History</h3>
      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500">No transactions recorded yet.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((t) => (
            <li key={t.id} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg shadow-sm">
              <span className="font-medium">{t.date.toDate().toLocaleDateString()}</span>
              <span className={`font-bold ${t.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(t.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionHistory;