import React, { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { db } from '../firebase';
import { collection, addDoc, Timestamp, setDoc, doc } from 'firebase/firestore';
import { Transaction } from '../types';
import { getUserTransactionsCollection, getUserBudgetDoc } from '../firebase';
import { User } from 'firebase/auth';

interface NewTransactionProps {
  totalSpentToday: number;
  setTotalSpentToday: (amount: number) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  user: User | null;
}

const NewTransaction: React.FC<NewTransactionProps> = ({
  totalSpentToday,
  setTotalSpentToday,
  transactions,
  setTransactions,
  user,
}) => {
  const [transaction, setTransaction] = useState<string>('');

  const handleTransaction = async () => {
    if (!user) return;

    const amount = parseFloat(transaction);
    if (isNaN(amount)) return;

    const newTotalSpent = totalSpentToday + amount;
    setTotalSpentToday(newTotalSpent);
    
    const newTransaction = {
      amount,
      date: Timestamp.now()
    };
    
    const transactionsCollection = getUserTransactionsCollection(user);
    const docRef = await addDoc(transactionsCollection, newTransaction);
    
    setTransactions([{id: docRef.id, ...newTransaction}, ...transactions]);
    
    const budgetDocRef = getUserBudgetDoc(user);
    await setDoc(budgetDocRef, {
      totalSpentToday: newTotalSpent,
      date: Timestamp.now()
    }, { merge: true });
    
    setTransaction('');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-center">New Transaction</h3>
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            id="transaction"
            type="number"
            placeholder="Enter amount"
            value={transaction}
            onChange={(e) => setTransaction(e.target.value)}
            className="pl-10 w-full text-center text-lg"
          />
        </div>
        <Button onClick={handleTransaction} className="w-12 h-12 p-0 flex items-center justify-center">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default NewTransaction;