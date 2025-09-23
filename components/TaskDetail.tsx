import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { formatDate, formatTime } from '../utils/time';
import { useTranslation } from '../hooks/useTranslation';

interface TaskDetailProps {
    task: Task | null;
    onClose: () => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const [formattedDueDate, setFormattedDueDate] = useState('');
    const [statusText, setStatusText] = useState('');

    useEffect(() => {
        if (task) {
            setFormattedDueDate(task.due_date ? formatDate(task.due_date) : t('taskDetail.notSet'));

            if (task.completed && task.completed_at) {
                setStatusText(t('taskDetail.statusCompleted', { date: formatDate(task.completed_at) }));
            } else {
                setStatusText(t('taskDetail.statusPending'));
            }
        }
    }, [task, t]);
    
    if (!task) return null;

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete task: "${task.name}"?`)) {
            onDelete(task.id);
            onClose();
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(16, 20, 26, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050, backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'var(--color-bg-panel)', padding: '2rem', borderRadius: '8px', width: '700px', border: '1px solid var(--color-border)', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                <h2 style={{ marginTop: 0, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>{task.name}</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem' }}>{t('taskDetail.status')}</h4>
                        <p style={{ margin: 0, color: task.completed ? 'var(--color-secondary-blue)' : 'var(--color-primary-red)' }}>{statusText}</p>
                    </div>
                     <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem' }}>{t('taskDetail.impact')} 💥</h4>
                        <p style={{ margin: 0 }}>{task.impact} / 10</p>
                    </div>
                     <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem' }}>{t('taskDetail.effort')} ⚙️</h4>
                        <p style={{ margin: 0 }}>{task.effort} / 5</p>
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem' }}>{t('taskDetail.dueDate')}</h4>
                        <p style={{ margin: 0 }}>{formattedDueDate}</p>
                    </div>
                     <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem' }}>{t('taskDetail.timeSpent')}</h4>
                        <p style={{ margin: 0 }}>{formatTime(task.time_spent)}</p>
                    </div>
                </div>

                <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem' }}>{t('taskDetail.description')}</h4>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', background: 'var(--color-bg-dark)', padding: '1rem', borderRadius: '4px' }}>{task.description || t('taskDetail.notSet')}</p>
                </div>
                
                {task.tags.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem' }}>{t('taskDetail.tags')}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {task.tags.map(tag => <span key={tag} style={{ background: 'var(--color-bg-dark)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>#{tag}</span>)}
                        </div>
                    </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: '2rem' }}>
                    <button onClick={handleDelete} style={{ background: 'transparent', border: '1px solid var(--color-primary-red)', color: 'var(--color-primary-red)' }}>{t('taskDetail.deleteTask')}</button>
                    <button onClick={() => onEdit(task)} style={{ background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)' }}>{t('taskDetail.editTask')}</button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;
