import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
    const { t } = useTranslation();
    return (
        <h1 className={`app-logo ${className || ''}`}>
            {t('header.title')}
        </h1>
    );
};

export default Logo;
