import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import en from '../locales/en';
import vi from '../locales/vi';
import fr from '../locales/fr';
import de from '../locales/de';
import es from '../locales/es';
import ja from '../locales/ja';
import pt from '../locales/pt';
import ru from '../locales/ru';
import zh from '../locales/zh';
import af from '../locales/af';
import { useAuthContext } from './AuthContext';
import { profileApi } from '../services/api';

export const supportedLanguages = {
    en: "English",
    af: "Afrikaans",
    de: "Deutsch",
    es: "Español",
    fr: "Français",
    ja: "日本語",
    pt: "Português",
    ru: "Русский",
    vi: "Tiếng Việt",
    zh: "中文"
};

const translations = { en, vi, fr, de, es, ja, pt, ru, zh, af };

type LanguageCode = keyof typeof supportedLanguages;

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: string) => void;
    t: (key: string, options?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => {},
    t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuthContext();
    const [language, setLanguageState] = useState<LanguageCode>('en');

    useEffect(() => {
        if (user) {
            profileApi.getProfile(user.id).then(profile => {
                if (profile?.language && Object.keys(supportedLanguages).includes(profile.language)) {
                    setLanguageState(profile.language as LanguageCode);
                }
            });
        }
    }, [user]);

    const setLanguage = (lang: string) => {
        if (Object.keys(supportedLanguages).includes(lang) && user) {
            const langCode = lang as LanguageCode;
            setLanguageState(langCode);
            profileApi.updateProfile(user.id, { language: langCode });
        }
    };
    
    const t = useCallback((key: string, options?: Record<string, string | number>): string => {
        const langDict = translations[language] || translations.en;
        let text: any = langDict;
        
        try {
            for (const k of key.split('.')) {
                text = text[k];
                if (text === undefined) throw new Error();
            }

            if (typeof text === 'string' && options) {
                return Object.entries(options).reduce((acc, [optKey, optVal]) => {
                    return acc.replace(`{{${optKey}}}`, String(optVal));
                }, text);
            }

            return text || key;
        } catch {
            return key;
        }
    }, [language]);

    const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
