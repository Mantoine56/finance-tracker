import React from 'react';
import { DollarSign } from 'lucide-react';
import { Input } from './ui/Input';
import { formatCurrency } from '../utils/formatCurrency';
import NewTransaction from './NewTransaction';
import { Transaction } from '../types';
import { getUserBudgetDoc } from '../firebase';
import { User } from 'firebase/auth';
import { setDoc } from 'firebase/firestore'; // Add this import

interface OverviewProps {
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;
  dailyAllowance: number;
  totalSpentToday: number;
  setTotalSpentToday: (amount: number) => void;
  amountLeftToday: number;
  amountLeftForMonth: number;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  user: User | null;
}

const Overview: React.FC<OverviewProps> = ({
  monthlyBudget,
  setMonthlyBudget,
  dailyAllowance,
  totalSpentToday,
  setTotalSpentToday,
  amountLeftToday,
  amountLeftForMonth,
  transactions,
  setTransactions,
  user,
}) => {
  const handleMonthlyBudgetChange = async (newBudget: number) => {
    setMonthlyBudget(newBudget);
    if (user) {
      const budgetDocRef = getUserBudgetDoc(user);
      await setDoc(budgetDocRef, { monthlyBudget: newBudget }, { merge: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Monthly Budget</h3>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="monthlyBudget"
              type="number"
              placeholder="Enter budget"
              value={monthlyBudget || ''}
              onChange={(e) => handleMonthlyBudgetChange(parseFloat(e.target.value) || 0)}
              className="w-full pl-10 text-lg font-bold bg-white border-gray-300 text-gray-800 placeholder-gray-400 text-center"
            />
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Daily Allowance</h3>
          <p className="text-2xl font-bold text-gray-800 text-center">{formatCurrency(dailyAllowance)}</p>
        </div>
      </div>
      
      <NewTransaction
        totalSpentToday={totalSpentToday}
        setTotalSpentToday={setTotalSpentToday}
        transactions={transactions}
        setTransactions={setTransactions}
        user={user}
      />
      
      <div className={`p-4 rounded-lg shadow-md ${amountLeftToday < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
        <h3 className="text-lg font-semibold mb-2 text-center">Amount Left Today</h3>
        <p className={`text-3xl font-extrabold text-center ${amountLeftToday < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(amountLeftToday)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-center">Today's Spending</h3>
          <p className="text-2xl font-bold text-gray-800 text-center">{formatCurrency(totalSpentToday)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-center">Monthly Remaining</h3>
          <p className={`text-2xl font-bold text-center ${amountLeftForMonth < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(amountLeftForMonth)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Overview;