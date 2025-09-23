import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { formatTime } from '../utils/time';

const TimeTrackerHeader: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const { t } = useTranslation();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [formattedCurrentTime, setFormattedCurrentTime] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Format time on the client to avoid hydration mismatch
        setFormattedCurrentTime(currentTime.toLocaleTimeString());
    }, [currentTime]);

    const totalTimeTrackedToday = tasks.reduce((acc, task) => {
        if (task.completed && task.completed_at?.startsWith(new Date().toISOString().split('T')[0])) {
            return acc + task.time_spent;
        }
        // This logic is simple, for a more accurate 'today' tracking, one would need to check tracking sessions
        // but for now, we'll sum up time for tasks completed today.
        return acc;
    }, 0);

    const secondsInDay = 24 * 60 * 60;
    const secondsPassed = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();
    const secondsLeft = secondsInDay - secondsPassed;

    return (
        <div className="time-tracker-header" style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: '1rem',
            background: 'var(--color-bg-panel)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'center'
        }}>
            <div>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{t('timeTracker.trackedToday')}</p>
                <p style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-secondary-blue)' }}>{formatTime(totalTimeTrackedToday)}</p>
            </div>
            <div>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{t('timeTracker.currentTime')}</p>
                <p style={{ margin: 0, fontSize: '1.2rem' }}>{formattedCurrentTime || '...'}</p>
            </div>
            <div>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{t('timeTracker.timeLeft')}</p>
                <p style={{ margin: 0, fontSize: '1.2rem' }}>{formatTime(secondsLeft)}</p>
            </div>
        </div>
    );
};

export default TimeTrackerHeader;
