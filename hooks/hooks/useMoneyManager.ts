import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Transaction, TransactionCategory } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { moneyApi, profileApi } from '../services/api';
import { subscribe } from '../services/realtime';

const defaultCategories: Omit<TransactionCategory, 'id' | 'user_id'>[] = [
    { name: 'Salary', type: 'income' },
    { name: 'Freelance', type: 'income' },
    { name: 'Housing', type: 'expense' },
    { name: 'Food', type: 'expense' },
    { name: 'Transport', type: 'expense' },
    { name: 'Entertainment', type: 'expense' },
    { name: 'Utilities', type: 'expense' },
    { name: 'Other', type: 'expense' },
];

export const useMoneyManager = () => {
    const { user } = useAuthContext();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            Promise.all([
                moneyApi.getTransactions(user.id),
                moneyApi.getCategories(user.id),
                profileApi.getProfile(user.id)
            ]).then(([initialTransactions, initialCategories, userProfile]) => {
                setTransactions(initialTransactions);
                if (initialCategories.length > 0) {
                    setCategories(initialCategories);
                } else {
                    // Setup default categories for new user
                    // This should ideally be a backend function, but is handled here for simplicity.
                    const userCategories = defaultCategories.map(c => ({...c, id: crypto.randomUUID(), user_id: user.id}));
                    setCategories(userCategories);
                    // We don't need to wait for this to finish
                    // moneyApi.createCategories(userCategories, user.id);
                }
                if (userProfile?.currency) {
                    setSelectedCurrency(userProfile.currency);
                }
            }).catch(error => {
                console.error("Failed to load money data", error);
            }).finally(() => {
                setLoading(false);
            });
            
            const unsubscribe = subscribe('transactions', message => {
                switch (message.type) {
                    case 'TRANSACTION_CREATED':
                        setTransactions(prev => [message.payload, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                        break;
                    case 'TRANSACTION_DELETED':
                        setTransactions(prev => prev.filter(t => t.id !== message.payload.id));
                        break;
                }
            });
            
            return () => unsubscribe();

        } else {
            setTransactions([]);
            setCategories([]);
            setLoading(false);
        }
    }, [user]);

    const updateCurrency = useCallback(async (currency: string) => {
        if (!user) return;
        setSelectedCurrency(currency);
        await profileApi.updateProfile(user.id, { currency });
    }, [user]);

    const addTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'currency' | 'user_id'>) => {
        if (!user) return;
        const newTransaction = await moneyApi.addTransaction({ ...data, currency: selectedCurrency }, user.id);
        setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, [selectedCurrency, user]);

    const deleteTransaction = useCallback(async (id: string) => {
        if (!user) return;
        await moneyApi.deleteTransaction(id, user.id);
        setTransactions(prev => prev.filter(t => t.id !== id));
    }, [user]);

    const transactionsForDisplay = useMemo(() => {
        return transactions.filter(t => t.currency === selectedCurrency).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, selectedCurrency]);

    const { balance, totalIncome, totalExpenses } = useMemo(() => {
        return transactionsForDisplay.reduce((acc, t) => {
            acc.balance += t.amount;
            if (t.amount > 0) acc.totalIncome += t.amount;
            else acc.totalExpenses += t.amount;
            return acc;
        }, { balance: 0, totalIncome: 0, totalExpenses: 0 });
    }, [transactionsForDisplay]);

    return {
        loading,
        transactions: transactionsForDisplay,
        addTransaction,
        deleteTransaction,
        balance,
        totalIncome,
        totalExpenses,
        categories,
        selectedCurrency,
        setSelectedCurrency: updateCurrency
    };
};
