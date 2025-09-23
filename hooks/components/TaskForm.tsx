import React, { useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';
import { getTaskSuggestions } from '../lib/ai';
import { useTranslation } from '../hooks/useTranslation';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'timeSpent' | 'isTracking' | 'promotedToDashboard'> | Task) => void;
    taskToEdit?: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [effort, setEffort] = useState(3);
    const [impact, setImpact] = useState(5);
    const [tags, setTags] = useState<string[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    useEffect(() => {
        if (taskToEdit) {
            setName(taskToEdit.name);
            setDescription(taskToEdit.description);
            setDueDate(taskToEdit.due_date || '');
            setEffort(taskToEdit.effort);
            setImpact(taskToEdit.impact);
            setTags(taskToEdit.tags || []);
        } else {
            // Reset form
            setName('');
            setDescription('');
            setDueDate('');
            setEffort(3);
            setImpact(5);
            setTags([]);
        }
    }, [taskToEdit, isOpen]);

    const handleAiAssist = useCallback(async () => {
        if (!name) return;
        setIsAiLoading(true);
        try {
            const suggestions = await getTaskSuggestions(name);
            setDescription(suggestions.description);
            setEffort(suggestions.effort);
            setImpact(suggestions.impact);
            setTags(prev => [...new Set([...prev, ...suggestions.tags])]);
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('An unexpected error occurred while getting AI suggestions.');
            }
        } finally {
            setIsAiLoading(false);
        }
    }, [name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        const taskData = {
            name,
            description,
            due_date: dueDate || undefined,
            effort,
            impact,
            tags,
        };
        onSave(taskToEdit ? { ...taskToEdit, ...taskData } : { ...taskData, goal_id: undefined, promoted_to_dashboard: true });
    };

    if (!isOpen) return null;
    
    const fullWidthInputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem',
        background: 'var(--color-bg-dark)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)',
        borderRadius: '4px'
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(16, 20, 26, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050, backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'var(--color-bg-panel)', padding: '2rem', borderRadius: '8px', width: '600px', border: '1px solid var(--color-border)' }} className="modal-content">
                <h2 style={{ marginTop: 0, color: 'var(--color-text-primary)' }}>{taskToEdit ? t('taskForm.editTitle') : t('taskForm.newTitle')}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder={t('taskForm.nameLabel')}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            style={{ flex: 1, ...fullWidthInputStyle }}
                        />
                        <button type="button" onClick={handleAiAssist} disabled={isAiLoading || !name} style={{ background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)' }}>
                            {isAiLoading ? t('taskForm.aiAnalyzing') : t('taskForm.aiAssist')}
                        </button>
                    </div>
                    <textarea
                        placeholder={t('taskForm.descriptionLabel')}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        style={{ ...fullWidthInputStyle, minHeight: '100px', marginBottom: '1rem' }}
                    />
                    
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }} className="responsive-form-grid">
                        <div>
                            <label>{t('taskForm.impactLabel')} (1-10)</label>
                            <input type="range" min="1" max="10" value={impact} onChange={e => setImpact(Number(e.target.value))} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label>{t('taskForm.effortLabel')} (1-5)</label>
                            <input type="range" min="1" max="5" value={effort} onChange={e => setEffort(Number(e.target.value))} style={{ width: '100%' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="responsive-form-grid">
                        <div>
                            <label>{t('taskForm.dueDateLabel')}</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={fullWidthInputStyle} />
                        </div>
                        <div>
                            <label>{t('taskForm.tagsLabel')}</label>
                            <input
                                type="text"
                                value={tags.join(', ')}
                                onChange={e => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                style={fullWidthInputStyle}
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--color-border)' }}>{t('common.cancel')}</button>
                        <button type="submit" style={{ background: 'var(--color-primary-red)', color: 'var(--color-text-on-accent)' }}>{t('taskForm.saveTask')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskForm;