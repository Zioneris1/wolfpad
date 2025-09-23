import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { journalApi } from '../services/api';
import { subscribe } from '../services/realtime';

export const useJournalManager = () => {
    const { user } = useAuthContext();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            journalApi.getEntries(user.id).then(initialEntries => {
                setEntries(initialEntries);
            }).catch(error => {
                console.error("Failed to fetch journal entries", error);
            }).finally(() => {
                setLoading(false);
            });
            
            const unsubscribe = subscribe('journal_entries', message => {
                 switch (message.type) {
                    case 'JOURNAL_ENTRIE_CREATED':
                        setEntries(prev => [message.payload, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
                        break;
                    case 'JOURNAL_ENTRIE_UPDATED':
                        setEntries(prev => prev.map(e => e.id === message.payload.id ? message.payload : e));
                        break;
                    case 'JOURNAL_ENTRIE_DELETED':
                        setEntries(prev => prev.filter(e => e.id !== message.payload.id));
                        break;
                }
            });
            
            return () => unsubscribe();
        } else {
            setEntries([]);
            setLoading(false);
        }
    }, [user]);

    const addEntry = useCallback(async (content: string) => {
        if (!user) return;
        const newEntry = await journalApi.addEntry({ content, created_at: new Date().toISOString() }, user.id);
        setEntries(prev => [newEntry, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }, [user]);

    const updateEntry = useCallback(async (id: string, content: string) => {
        if (!user) return;
        const updatedEntry = await journalApi.updateEntry(id, { content }, user.id);
        setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
    }, [user]);

    const deleteEntry = useCallback(async (id: string) => {
        if (!user) return;
        await journalApi.deleteEntry(id, user.id);
        setEntries(prev => prev.filter(entry => entry.id !== id));
    }, [user]);

    return { entries, loading, addEntry, updateEntry, deleteEntry };
};
