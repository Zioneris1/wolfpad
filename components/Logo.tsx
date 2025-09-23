import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
    const { t } = useTranslation();
    
    // Inline style for the glowing effect
    const glowStyle: React.CSSProperties = {
        color: 'var(--color-secondary-blue)',
        textShadow: `
            0 0 5px var(--color-secondary-blue),
            0 0 10px var(--color-secondary-blue),
            0 0 20px var(--color-secondary-blue-glow),
            0 0 30px var(--color-secondary-blue-glow)
        `,
        transition: 'text-shadow 0.3s ease-in-out',
    };

    return (
        <h1 className={`app-logo ${className || ''}`} style={glowStyle}>
            {t('header.title')}
        </h1>
    );
};

export default Logo;
