import React, { useState, useEffect, useRef } from 'react';
import type { Task } from '../types';
import { formatDate, formatTime } from '../utils/time';
import { effortToSeconds } from '../utils/task';
import { useTranslation } from '../hooks/useTranslation';

const PlayIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const StopIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>;
const PromoteIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13.5c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>; // Rocket-like icon

interface TaskItemProps {
    task: Task;
    onToggleComplete: (id: string) => void;
    onEdit: (task: Task) => void;
    onView: (task: Task) => void;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onStartTracking: (id: string) => void;
    onStopTracking: (id: string) => void;
    onPromote?: (id: string) => void;
    onDragStart?: (e: React.DragEvent, task: Task) => void;
    style?: React.CSSProperties;
}

const TaskItem: React.FC<TaskItemProps> = ({
    task, onToggleComplete, onEdit, onView, isSelected, onSelect, onStartTracking, onStopTracking, onPromote, onDragStart, style
}) => {
    const { t } = useTranslation();
    const isDraggable = !!onDragStart;

    const [isAnimating, setIsAnimating] = useState(false);
    const prevCompletedRef = useRef(task.completed);

    useEffect(() => {
        if (!prevCompletedRef.current && task.completed) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 300); // Match animation duration
            return () => clearTimeout(timer);
        }
        prevCompletedRef.current = task.completed;
    }, [task.completed]);

    const estimatedTimeInSeconds = effortToSeconds(task.effort);
    const progress = estimatedTimeInSeconds > 0 
        ? Math.min(100, (task.time_spent / estimatedTimeInSeconds) * 100) 
        : 0;
        
    const taskItemStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        background: isSelected ? 'rgba(66, 153, 225, 0.2)' : 'var(--color-bg-panel)',
        border: `1px solid ${isSelected ? 'var(--color-secondary-blue)' : 'var(--color-border)'}`,
        borderRadius: '4px',
        gap: '1rem',
        transition: 'all 0.2s ease',
        cursor: isDraggable ? 'grab' : 'default',
        opacity: task.completed ? 0.6 : 1,
        ...style,
    };

    const tagStyle: React.CSSProperties = {
        background: 'var(--color-bg-dark)',
        padding: '0.1rem 0.5rem',
        borderRadius: '10px',
        fontSize: '0.7rem',
        color: 'var(--color-text-secondary)',
    };

    const progressBar = (
         <div style={{ marginTop: '0.5rem', background: 'var(--color-bg-dark)', borderRadius: '4px', height: '6px', overflow: 'hidden', cursor: 'pointer' }}>
            <div title={`${Math.round(progress)}% complete`} style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--color-secondary-blue)',
                transition: 'width 0.5s ease',
                boxShadow: `0 0 8px var(--color-secondary-blue-glow)`
            }}></div>
        </div>
    );
    
    const actionButtons = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onPromote && !task.promoted_to_dashboard && (
                 <button title={t('taskItem.promoteToDashboard')} onClick={() => onPromote(task.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '0.2rem' }}>
                    <PromoteIcon/>
                </button>
            )}
            {!task.completed && (
                <button onClick={() => task.is_tracking ? onStopTracking(task.id) : onStartTracking(task.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: task.is_tracking ? 'var(--color-secondary-blue-glow)' : 'var(--color-text-secondary)', padding: '0.2rem' }}>
                    {task.is_tracking ? <StopIcon /> : <PlayIcon />}
                </button>
            )}
             <button onClick={() => onEdit(task)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.2rem' }}>{t('common.edit')}</button>
         </div>
    );

    return (
        <div 
            style={taskItemStyle}
            draggable={isDraggable}
            onDragStart={(e) => onDragStart && onDragStart(e, task)}
        >
            {/* --- DESKTOP LAYOUT --- */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }} className="task-item-desktop-layout">
                <input type="checkbox" checked={isSelected} onChange={() => onSelect(task.id)} style={{ cursor: 'pointer' }} />
                
                <div className={isAnimating ? 'check-pop-animation' : ''}>
                    <input type="checkbox" checked={task.completed} onChange={() => onToggleComplete(task.id)} style={{ cursor: 'pointer' }} />
                </div>

                <div style={{ flex: 1 }} onClick={() => onView(task)}>
                    <div style={{ textDecoration: task.completed ? 'line-through' : 'none', cursor: 'pointer' }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{task.name}</span>
                        {task.due_date && <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{t('taskItem.due')}: {formatDate(task.due_date)}</span>}
                    </div>
                    {!task.completed && estimatedTimeInSeconds > 0 && progressBar}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {task.tags.slice(0, 2).map(tag => <span key={tag} style={tagStyle}>#{tag}</span>)}
                </div>

                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    💥 {task.impact}
                </div>
                 <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    ⚙️ {task.effort}
                </div>
                
                <div style={{ minWidth: '80px', textAlign: 'right', color: task.is_tracking ? 'var(--color-secondary-blue-glow)' : 'var(--color-text-secondary)' }}>
                    {formatTime(task.time_spent)}
                </div>
                
                {actionButtons}
            </div>

            {/* --- MOBILE LAYOUT --- */}
            <div className="task-item-mobile-layout">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="checkbox" checked={isSelected} onChange={() => onSelect(task.id)} />
                    <div className={isAnimating ? 'check-pop-animation' : ''}>
                        <input type="checkbox" checked={task.completed} onChange={() => onToggleComplete(task.id)} />
                    </div>
                    <div style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none' }} onClick={() => onView(task)}>
                        {task.name}
                    </div>
                </div>

                {!task.completed && (
                    <div onClick={() => onView(task)}>
                        {task.due_date && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{t('taskItem.due')}: {formatDate(task.due_date)}</div>}
                        {estimatedTimeInSeconds > 0 && progressBar}
                    </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        <span>💥 {task.impact}</span>
                        <span>⚙️ {task.effort}</span>
                        <span style={{color: task.is_tracking ? 'var(--color-secondary-blue-glow)' : 'var(--color-text-secondary)'}}>{formatTime(task.time_spent)}</span>
                    </div>
                    {actionButtons}
                </div>
            </div>
        </div>
    );
};

export default TaskItem;