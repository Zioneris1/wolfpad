import React from 'react';
import type { Task } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import TimeTrackerHeader from './TimeTrackerHeader';
import Logo from './Logo';


interface HeaderProps {
    onAddTask: () => void;
    tasks: Task[];
}

const Header: React.FC<HeaderProps> = ({ onAddTask, tasks }) => {
    const { t } = useTranslation();

    return (
        <header className="main-header">
            <div className="main-header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                 <Logo className="mobile-header-logo" />
                 <button onClick={onAddTask} className="mobile-add-task-btn" style={{
                    background: 'var(--color-primary-red)',
                    color: 'var(--color-text-on-accent)',
                    border: 'none',
                    padding: '0.6rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                 }}>{t('header.addTask')}</button>
            </div>
            <TimeTrackerHeader tasks={tasks} />
        </header>
    );
};

export default Header;