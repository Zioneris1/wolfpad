import React, { useState, useEffect, useCallback } from 'react';
// Fix: Import SuggestedTask from types.ts
import type { GoalWithProgress, Task, SuggestedTask } from '../types';
import { getTaskBreakdownForGoal } from '../lib/ai';
import { useTranslation } from '../hooks/useTranslation';

interface AiBreakdownModalProps {
    goal: GoalWithProgress | null;
    onClose: () => void;
    onAddTasks: (tasks: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'tags' | 'timeSpent' | 'isTracking' | 'promotedToDashboard'>[]) => void;
}

const AiBreakdownModal: React.FC<AiBreakdownModalProps> = ({ goal, onClose, onAddTasks }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
    const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>({});

    const fetchBreakdown = useCallback(async () => {
        if (!goal) return;
        setIsLoading(true);
        setSuggestedTasks([]);
        try {
            const tasks = await getTaskBreakdownForGoal(goal.name, goal.description);
            setSuggestedTasks(tasks);
            setSelectedTasks(tasks.reduce((acc, task, index) => ({...acc, [index]: true}), {}));
        } catch (error) {
            console.error("Failed to get AI task breakdown", error);
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('An unexpected error occurred while generating tasks.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [goal]);

    useEffect(() => {
        if (goal) {
            fetchBreakdown();
        }
    }, [goal, fetchBreakdown]);

    const handleToggleSelect = (index: number) => {
        setSelectedTasks(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleAddTasks = () => {
        if (!goal) return;
        const tasksToAdd = suggestedTasks
            .filter((_, index) => selectedTasks[index])
            .map(task => ({
                name: task.name,
                description: task.description,
                effort: task.effort,
                impact: task.impact,
                goal_id: goal.id,
                due_date: undefined,
            }));
        onAddTasks(tasksToAdd);
        onClose();
    };
    
    if (!goal) return null;
    
    const selectedCount = Object.values(selectedTasks).filter(Boolean).length;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(16, 20, 26, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050, backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'var(--color-bg-panel)', padding: '2rem', borderRadius: '8px', width: '800px', border: '1px solid var(--color-border)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ marginTop: 0, color: 'var(--color-text-primary)' }}>{t('aiBreakdownModal.title', { goalName: goal.name })}</h2>
                
                {isLoading && <p>{t('aiBreakdownModal.analyzing')}</p>}

                {!isLoading && suggestedTasks.length > 0 && (
                    <>
                        <p style={{color: 'var(--color-text-secondary)', marginTop: 0}}>{t('aiBreakdownModal.instructions')}</p>
                        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '1rem', marginRight: '-1rem' }}>
                            {suggestedTasks.map((task, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'var(--color-bg-dark)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                                    <input type="checkbox" checked={selectedTasks[index] || false} onChange={() => handleToggleSelect(index)} style={{marginTop: '0.25rem'}}/>
                                    <div style={{flex: 1}}>
                                        <h4 style={{margin: '0 0 0.5rem 0'}}>{task.name}</h4>
                                        <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)'}}>{task.description}</p>
                                        <div style={{marginTop: '0.5rem', fontSize: '0.8rem'}}>
                                            <span style={{marginRight: '1rem'}}>💥 {t('dashboard.impact')}: {task.impact}</span>
                                            <span>⚙️ {t('taskForm.effortLabel')}: {task.effort}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--color-border)' }}>{t('common.cancel')}</button>
                    <button type="submit" onClick={handleAddTasks} disabled={selectedCount === 0} style={{ background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)' }}>{t('aiBreakdownModal.addSelected', { count: selectedCount })}</button>
                </div>
            </div>
        </div>
    );
};

export default AiBreakdownModal;