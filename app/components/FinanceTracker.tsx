'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { signOut, User } from 'firebase/auth';
import { getDocs, query, orderBy, Timestamp, setDoc, getDoc } from 'firebase/firestore';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { Button } from './ui/Button';
import Overview from './Overview';
import TransactionHistory from './TransactionHistory';
import Auth from './Auth';
import { Transaction } from '../types';
import { getUserTransactionsCollection, getUserBudgetDoc } from '../firebase';

const FinanceTracker: React.FC = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [dailyAllowance, setDailyAllowance] = useState<number>(0);
  const [totalSpentToday, setTotalSpentToday] = useState<number>(0);
  const [amountLeftToday, setAmountLeftToday] = useState<number>(0);
  const [amountLeftForMonth, setAmountLeftForMonth] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const fetchBudget = useCallback(async (user: User) => {
    const budgetDocRef = getUserBudgetDoc(user);
    const budgetDoc = await getDoc(budgetDocRef);
    if (budgetDoc.exists()) {
      const budgetData = budgetDoc.data() as { monthlyBudget: number; totalSpentToday: number };
      setMonthlyBudget(budgetData.monthlyBudget);
      setTotalSpentToday(budgetData.totalSpentToday);
    } else {
      // Initialize budget document if it doesn't exist
      await setDoc(budgetDocRef, { monthlyBudget: 0, totalSpentToday: 0, date: Timestamp.now() });
    }
  }, []);

  const fetchTransactions = useCallback(async (user: User) => {
    const q = query(getUserTransactionsCollection(user), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const fetchedTransactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      fetchedTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    setTransactions(fetchedTransactions);
  }, []);

  const fetchUserData = useCallback(async (user: User) => {
    await fetchBudget(user);
    await fetchTransactions(user);
  }, [fetchBudget, fetchTransactions]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchUserData(user);
      } else {
        // Reset state when user logs out
        setMonthlyBudget(0);
        setDailyAllowance(0);
        setTotalSpentToday(0);
        setAmountLeftToday(0);
        setAmountLeftForMonth(0);
        setTransactions([]);
      }
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const updateBudget = useCallback(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const calculatedDailyAllowance = monthlyBudget / daysInMonth;
    setDailyAllowance(calculatedDailyAllowance);
    setAmountLeftToday(calculatedDailyAllowance - totalSpentToday);
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    setAmountLeftForMonth(monthlyBudget - totalSpent);
  }, [monthlyBudget, currentDate, totalSpentToday, transactions]);

  const resetDaily = useCallback(async () => {
    if (user) {
      setTotalSpentToday(0);
      const budgetDocRef = getUserBudgetDoc(user);
      await setDoc(budgetDocRef, {
        monthlyBudget,
        totalSpentToday: 0,
        date: Timestamp.now()
      }, { merge: true });
      updateBudget();
    }
  }, [user, monthlyBudget, updateBudget]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate() || now.getMonth() !== currentDate.getMonth()) {
        setCurrentDate(now);
        resetDaily();
      }
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [currentDate, resetDaily]);

  useEffect(() => {
    updateBudget();
  }, [updateBudget]);

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
                user={user}
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