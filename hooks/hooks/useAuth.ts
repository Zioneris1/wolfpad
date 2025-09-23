import { useState, useEffect, useCallback } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export const useAuth = () => {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = useCallback(async (email: string, pass: string) => {
        // Fix: Explicitly map `pass` to the `password` property.
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
            console.error('Login error:', error.message);
            throw error;
        }
        return !error;
    }, []);

    const signup = useCallback(async (email: string, pass: string) => {
        // Fix: Explicitly map `pass` to the `password` property.
        const { error } = await supabase.auth.signUp({ 
            email, 
            password: pass,
            options: {
                // You can add email confirmation logic here if desired
                // emailRedirectTo: window.location.origin,
            }
        });
        if (error) {
            console.error('Signup error:', error.message);
            throw error;
        }
        // In a real app, you might want to show a "Check your email" message
        // For this app, we'll auto-login the user after signup.
        return !error;
    }, []);


    const logout = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error.message);
        }
    }, []);

    return { user, loading, login, signup, logout };
};