import React, { useState } from 'react';
import type { View } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../hooks/useTheme';
import { supportedLanguages } from '../context/LanguageContext';
import { useAuthContext } from '../context/AuthContext';

const DashboardIcon = () => <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path></svg>;
const GoalsIcon = () => <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 6a4 4 0 100 8 4 4 0 000-8z"></path><circle cx="12" cy="12" r="2"></circle></svg>;
const ScheduleIcon = () => <svg viewBox="0 0 24 24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"></path></svg>;
const FinancialsIcon = () => <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-.9.6-1.7 1.7-1.7 1.1 0 1.7.6 1.7 1.7H14c0-1.4-.8-2.5-2.3-2.5C9.8 6 9 6.8 9 8.1c0 1.6 1.2 2.3 3.4 2.8.9.2 1.6.6 1.6 1.3 0 .7-.6 1.2-1.4 1.2-1.2 0-1.8-.7-1.8-1.8h-1.8c0 1.8 1.2 2.9 3.2 2.9 2.2 0 3.1-1.3 3.1-2.6 0-1.3-.8-2.1-2.2-2.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>;
const MoreIcon = () => <svg viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>;


interface BottomNavBarProps {
    currentView: View;
    setView: (view: View) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setView }) => {
    const { t, language, setLanguage } = useTranslation();
    const { theme, setTheme, themes } = useTheme();
    const { user, logout } = useAuthContext();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const moreViews: View[] = ['weekly', 'personalDevelopment', 'analytics', 'agents', 'theDen', 'settings'];
    
    const navButtonStyle = (isActive: boolean): React.CSSProperties => ({
        background: 'transparent',
        border: 'none',
        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontWeight: isActive ? 'bold' : 'normal',
        borderBottom: isActive ? '2px solid var(--color-secondary-blue)' : '2px solid transparent',
        transition: 'all 0.2s ease',
        fontSize: '1.5rem'
    });
    
    const selectStyle: React.CSSProperties = {
      background: 'var(--color-bg-panel)', 
      color: 'var(--color-text-primary)', 
      border: '1px solid var(--color-border)', 
      borderRadius: '4px', 
      padding: '0.4rem'
    }

    // Fix: Replaced JSX.Element with React.ReactNode to fix namespace error.
    const mainNavItems: { view: View, labelKey: string, icon: React.ReactNode }[] = [
        { view: 'dashboard', labelKey: 'header.dashboard', icon: <DashboardIcon /> },
        { view: 'goals', labelKey: 'header.goals', icon: <GoalsIcon /> },
        { view: 'schedule', labelKey: 'header.schedule', icon: <ScheduleIcon /> },
        { view: 'financials', labelKey: 'header.financials', icon: <FinancialsIcon /> },
    ];
    
    const moreNavItems: { view: View, labelKey: string }[] = [
        { view: 'agents', labelKey: 'header.aiAgents' },
        { view: 'weekly', labelKey: 'header.weekly' },
        { view: 'personalDevelopment', labelKey: 'header.personalDev' },
        { view: 'theDen', labelKey: 'header.theDen' },
        { view: 'analytics', labelKey: 'header.analytics' },
        { view: 'settings', labelKey: 'header.settings' },
    ];

    const handleNavClick = (view: View) => {
        setView(view);
        setIsMoreMenuOpen(false);
    };

    const isMoreActive = moreViews.includes(currentView);
    
    const SettingsSelectors = () => (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} style={selectStyle}>
                {themes.map((themeOption) => (
                    <option key={themeOption.id} value={themeOption.id}>{themeOption.name}</option>
                ))}
            </select>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={selectStyle}>
                {Object.entries(supportedLanguages).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                ))}
            </select>
        </div>
    );

    const MoreMenuOverlay = () => (
        <div className={`more-menu-overlay ${isMoreMenuOpen ? 'open' : ''}`}>
            <button className="close-btn" onClick={() => setIsMoreMenuOpen(false)}>&times;</button>
            <nav>
                {moreNavItems.map(item => (
                    <button key={item.view} onClick={() => handleNavClick(item.view)} style={navButtonStyle(currentView === item.view)}>
                        {t(item.labelKey)}
                    </button>
                ))}
            </nav>
             <div style={{marginTop: '1.5rem'}}>
                <SettingsSelectors />
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                 <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {t('auth.loggedInAs', { email: user?.email || ''})}
                </p>
                <button onClick={logout} style={{ ...navButtonStyle(false), width: '100%', textAlign: 'left', color: 'var(--color-primary-red)'}}>
                    {t('auth.logout')}
                </button>
            </div>
        </div>
    );

    return (
        <>
            <nav className="bottom-nav">
                {mainNavItems.map(item => (
                    <button
                        key={item.view}
                        className={`bottom-nav-item ${currentView === item.view ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.view)}
                    >
                        {item.icon}
                        <span>{t(item.labelKey)}</span>
                    </button>
                ))}
                <button
                    className={`bottom-nav-item ${isMoreActive ? 'active' : ''}`}
                    onClick={() => setIsMoreMenuOpen(true)}
                >
                    <MoreIcon />
                    <span>{t('common.more')}</span>
                </button>
            </nav>
            <MoreMenuOverlay />
        </>
    );
};

export default BottomNavBar;