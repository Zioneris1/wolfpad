import React, { useState, useEffect } from 'react';
import type { View, ThemeOption, Task } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../hooks/useTheme';
import { supportedLanguages } from '../context/LanguageContext';
import { formatTime } from '../utils/time';
import Logo from './Logo';
import { useAuthContext } from '../context/AuthContext';

const SidebarTimeTracker: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const { t } = useTranslation();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const totalTimeTrackedToday = tasks.reduce((acc, task) => {
        if (task.completed && task.completed_at?.startsWith(new Date().toISOString().split('T')[0])) {
            return acc + task.time_spent;
        }
        return acc;
    }, 0);

    const secondsInDay = 24 * 60 * 60;
    const secondsPassed = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();
    const secondsLeft = secondsInDay - secondsPassed;

    return (
        <div className="sidebar-time-tracker">
            <div className="sidebar-time-tracker-item">
                <span className="sidebar-time-tracker-label">{t('timeTracker.trackedToday')}</span>
                <span className="sidebar-time-tracker-value highlight">{formatTime(totalTimeTrackedToday)}</span>
            </div>
            <div className="sidebar-time-tracker-item">
                <span className="sidebar-time-tracker-label">{t('timeTracker.currentTime')}</span>
                <span className="sidebar-time-tracker-value">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="sidebar-time-tracker-item">
                <span className="sidebar-time-tracker-label">{t('timeTracker.timeLeft')}</span>
                <span className="sidebar-time-tracker-value">{formatTime(secondsLeft)}</span>
            </div>
        </div>
    );
};

interface DesktopSidebarProps {
    currentView: View;
    setView: (view: View) => void;
    onAddTask: () => void;
    tasks: Task[];
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentView, setView, onAddTask, tasks }) => {
    const { t, language, setLanguage } = useTranslation();
    const { theme, setTheme, themes } = useTheme();
    const { user, logout } = useAuthContext();

    const navItems: { view: View, labelKey: string }[] = [
        { view: 'dashboard', labelKey: 'header.dashboard' },
        { view: 'goals', labelKey: 'header.goals' },
        { view: 'weekly', labelKey: 'header.weekly' },
        { view: 'schedule', labelKey: 'header.schedule' },
        { view: 'financials', labelKey: 'header.financials' },
        { view: 'personalDevelopment', labelKey: 'header.personalDev' },
        { view: 'theDen', labelKey: 'header.theDen' },
        { view: 'analytics', labelKey: 'header.analytics' },
        { view: 'agents', labelKey: 'header.aiAgents' },
        { view: 'settings', labelKey: 'header.settings' },
    ];

    const navButtonStyle = (isActive: boolean): React.CSSProperties => ({
        width: '100%',
        padding: '0.75rem 1.5rem',
        border: 'none',
        background: isActive ? 'var(--color-bg-panel)' : 'transparent',
        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '1rem',
        borderRadius: '4px',
        marginBottom: '0.25rem',
        transition: 'all 0.2s ease',
        borderLeft: isActive ? '3px solid var(--color-secondary-blue)' : '3px solid transparent',
        paddingLeft: isActive ? 'calc(1.5rem - 3px)' : '1.5rem',
    });

    const selectStyle: React.CSSProperties = {
      width: '100%',
      padding: '0.5rem',
      background: 'var(--color-bg-dark)',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-primary)',
      borderRadius: '4px'
    };

    return (
        <aside style={{
            width: '260px',
            background: 'var(--color-bg-dark)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--color-border)'
        }}>
            <Logo className="desktop-sidebar-logo" />
            
            <SidebarTimeTracker tasks={tasks} />

            <button onClick={onAddTask} style={{
                background: 'var(--color-primary-red)',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                marginBottom: '2rem',
                width: '100%'
            }}>
                {t('header.addTask')}
            </button>

            <nav style={{ flex: 1, overflowY: 'auto' }}>
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => setView(item.view)}
                        style={navButtonStyle(currentView === item.view)}
                        onMouseOver={e => { if (currentView !== item.view) e.currentTarget.style.background = 'var(--color-bg-panel)'; }}
                        onMouseOut={e => { if (currentView !== item.view) e.currentTarget.style.background = 'transparent'; }}
                    >
                        {t(item.labelKey)}
                    </button>
                ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem', background: 'var(--color-bg-panel)', borderRadius: '4px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-secondary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user?.email[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                    </div>
                     <button onClick={logout} title={t('auth.logout')} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.2rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
                    </button>
                </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Theme</label>
                        <select value={theme} onChange={(e) => setTheme(e.target.value)} style={selectStyle}>
                            {themes.map((themeOption: ThemeOption) => (
                                <option key={themeOption.id} value={themeOption.id}>{themeOption.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Language</label>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={selectStyle}>
                            {Object.entries(supportedLanguages).map(([code, name]) => (
                                <option key={code} value={code}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default DesktopSidebar;