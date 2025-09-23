import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export const useTranslation = () => {
    return useContext(LanguageContext);
};
