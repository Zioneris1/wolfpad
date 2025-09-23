import React from 'react';
import type { Task } from '../types';
import TaskItem from './TaskItem';
import { useTranslation } from '../hooks/useTranslation';

interface TaskListProps {
    tasks: Task[];
    onToggleComplete: (id: string) => void;
    onEdit: (task: Task) => void;
    onView: (task: Task) => void;
    selectedTasks: string[];
    onSelectionChange: (selected: string[]) => void;
    onStartTracking: (id: string) => void;
    onStopTracking: (id: string) => void;
}

const getPriorityColor = (impact: number): string | null => {
    if (impact >= 8) return 'var(--color-priority-high)';
    if (impact >= 4) return 'var(--color-priority-medium)';
    if (impact >= 1) return 'var(--color-priority-low)';
    return null;
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onEdit, onView, selectedTasks, onSelectionChange, onStartTracking, onStopTracking }) => {
    const { t } = useTranslation();

    const handleSelect = (id: string) => {
        if (selectedTasks.includes(id)) {
            onSelectionChange(selectedTasks.filter(taskId => taskId !== id));
        } else {
            onSelectionChange([...selectedTasks, id]);
        }
    };

    if (tasks.length === 0) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '3rem 2rem', 
                color: 'var(--color-text-secondary)',
                border: '1px dashed var(--color-border)',
                borderRadius: '8px',
                background: 'rgba(42, 47, 56, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-secondary-blue)', filter: 'drop-shadow(0 0 5px var(--color-secondary-blue-glow))' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>{t('dashboard.noTasks')}</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tasks.map(task => {
                const priorityColor = getPriorityColor(task.impact);
                const extraStyle: React.CSSProperties = {};

                if (priorityColor && !task.completed) {
                    extraStyle.borderLeft = `4px solid ${priorityColor}`;
                    extraStyle.paddingLeft = 'calc(1rem - 3px)';
                }

                return (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEdit}
                        onView={onView}
                        isSelected={selectedTasks.includes(task.id)}
                        onSelect={handleSelect}
                        onStartTracking={onStartTracking}
                        onStopTracking={onStopTracking}
                        style={extraStyle}
                    />
                );
            })}
        </div>
    );
};

export default TaskList;