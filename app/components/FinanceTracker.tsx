'use client';

import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit, Timestamp, setDoc, doc } from 'firebase/firestore';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { Button } from './ui/Button';
import Overview from './Overview';
import TransactionHistory from './TransactionHistory';
import Auth from './Auth';
import { Transaction } from '../types';

const FinanceTracker: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [dailyAllowance, setDailyAllowance] = useState<number>(0);
  const [totalSpentToday, setTotalSpentToday] = useState<number>(0);
  const [amountLeftToday, setAmountLeftToday] = useState<number>(0);
  const [amountLeftForMonth, setAmountLeftForMonth] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchTransactions();
        fetchBudget();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate() || now.getMonth() !== currentDate.getMonth()) {
        setCurrentDate(now);
        resetDaily();
      }
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [currentDate]);

  useEffect(() => {
    updateBudget();
  }, [monthlyBudget, currentDate, totalSpentToday, transactions]);

  const fetchTransactions = async () => {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const fetchedTransactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      fetchedTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    setTransactions(fetchedTransactions);
  };

  const fetchBudget = async () => {
    const budgetDoc = await getDocs(query(collection(db, 'budget'), orderBy('date', 'desc'), limit(1)));
    if (!budgetDoc.empty) {
      const budgetData = budgetDoc.docs[0].data() as { monthlyBudget: number; totalSpentToday: number };
      setMonthlyBudget(budgetData.monthlyBudget);
      setTotalSpentToday(budgetData.totalSpentToday);
    }
  };

  const updateBudget = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const calculatedDailyAllowance = monthlyBudget / daysInMonth;
    setDailyAllowance(calculatedDailyAllowance);
    setAmountLeftToday(calculatedDailyAllowance - totalSpentToday);
    setAmountLeftForMonth(monthlyBudget - transactions.reduce((sum, t) => sum + t.amount, 0));
  };

  const resetDaily = async () => {
    setTotalSpentToday(0);
    await setDoc(doc(db, 'budget', 'current'), {
      monthlyBudget,
      totalSpentToday: 0,
      date: Timestamp.now()
    });
    updateBudget();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return <Auth onLogin={() => setUser(auth.currentUser)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <Card className="max-w-lg mx-auto relative">
        <Button
          onClick={handleLogout}
          className="absolute top-4 right-4 p-2"
        >
          <LogOut className="h-5 w-5" />
        </Button>
        <CardHeader>
          <CardTitle className="text-center mb-2">Finance Tracker</CardTitle>
          <p className="text-center text-gray-500">{currentDate.toLocaleDateString()}</p>
        </CardHeader>
        <CardContent>
          <Tabs>
            <TabsList>
              <TabsTrigger value="overview" onClick={() => setActiveTab('overview')} isActive={activeTab === 'overview'}>Overview</TabsTrigger>
              <TabsTrigger value="history" onClick={() => setActiveTab('history')} isActive={activeTab === 'history'}>History</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" activeTab={activeTab}>
              <Overview
                monthlyBudget={monthlyBudget}
                setMonthlyBudget={setMonthlyBudget}
                dailyAllowance={dailyAllowance}
                totalSpentToday={totalSpentToday}
                setTotalSpentToday={setTotalSpentToday}
                amountLeftToday={amountLeftToday}
                amountLeftForMonth={amountLeftForMonth}
                transactions={transactions}
                setTransactions={setTransactions}
              />
            </TabsContent>
            <TabsContent value="history" activeTab={activeTab}>
              <TransactionHistory transactions={transactions} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceTracker;