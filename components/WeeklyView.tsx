import React, { useState, useMemo, useEffect } from 'react';
import type { Task } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface WeeklyViewProps {
    tasks: Task[];
    onUpdateTask: (id: string, updatedData: Partial<Task>) => void;
    onToggleComplete: (id: string) => void;
}

const getPriorityColor = (impact: number): string => {
    if (impact >= 8) return 'var(--color-priority-high)';
    if (impact >= 4) return 'var(--color-priority-medium)';
    return 'var(--color-priority-low)';
};

// --- Task Card for the Kanban board ---
interface WeeklyTaskCardProps {
    task: Task;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
    onToggleComplete: (id: string) => void;
    isDragging: boolean;
}

const WeeklyTaskCard: React.FC<WeeklyTaskCardProps> = ({ task, onDragStart, onToggleComplete, isDragging }) => {
    const priorityColor = getPriorityColor(task.impact);
    const todayStr = new Date().toISOString().split('T')[0];
    // Fix: Changed dueDate to due_date to match Task type.
    const isOverdue = !task.completed && task.due_date && task.due_date < todayStr;
    
    return (
        <div
            draggable={!task.completed}
            onDragStart={(e) => !task.completed && onDragStart(e, task)}
            className="p-3 rounded-lg group transition-all duration-200"
            style={{
                background: 'var(--color-bg-dark)',
                border: '1px solid var(--color-border)',
                opacity: isDragging ? 0.5 : (task.completed ? 0.6 : 1),
                cursor: task.completed ? 'default' : 'grab',
            }}
        >
            <div className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 h-3 w-3 rounded-full" style={{ backgroundColor: priorityColor, border: '1px solid var(--color-bg-panel)' }}></span>
                <div className="flex-1">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`} style={{ color: 'var(--color-text-primary)' }}>
                        {task.name}
                    </p>
                    {isOverdue && <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--color-primary-red)' }}>Overdue</p>}
                    {task.tags && task.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {task.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-0.5 text-xs rounded-full" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-text-secondary)'}}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                {!task.completed && (
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleComplete(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer h-5 w-5 rounded"
                        style={{ accentColor: 'var(--color-secondary-blue)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
            </div>
        </div>
    );
};


const DayTitle: React.FC<{ day: Date }> = ({ day }) => {
    const [title, setTitle] = useState('');
    useEffect(() => {
        setTitle(day.toLocaleDateString(undefined, { weekday: 'long' }));
    }, [day]);
    return <>{title}</>;
};

const DayDate: React.FC<{ date: Date | null }> = ({ date }) => {
    const [formatted, setFormatted] = useState('');
    useEffect(() => {
        if (date) {
            setFormatted(date.toLocaleDateString(undefined, { month: 'short', day: 'numeric'}));
        }
    }, [date]);
    return <>{formatted}</>;
};

// --- Column for each day or for unscheduled tasks ---
interface DayColumnProps {
    title: React.ReactNode;
    date: string | null;
    tasks: Task[];
    isToday?: boolean;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
    onDrop: (date: string | null) => void;
    onToggleComplete: (id: string) => void;
    draggedTaskId: string | null;
}

const DayColumn: React.FC<DayColumnProps> = ({ title, date, tasks, isToday = false, onDragStart, onDrop, onToggleComplete, draggedTaskId }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const pendingTaskCount = tasks.filter(t => !t.completed).length;

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        onDrop(date);
    };

    const fullDate = date ? new Date(date + 'T00:00:00') : null;

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex-shrink-0 w-80 rounded-xl p-1 transition-all duration-200"
            style={{ 
                background: isDragOver ? 'rgba(var(--color-secondary-blue-rgb), 0.2)' : 'var(--color-bg-panel)',
                borderTop: isToday ? `3px solid var(--color-secondary-blue)` : `3px solid transparent`
             }}
        >
            <div className="p-3 mb-2 flex justify-between items-center">
                 <div>
                    <span className="font-bold text-base" style={{ color: 'var(--color-text-primary)'}}>{title}</span>
                    {fullDate && <span className="ml-2 text-sm" style={{color: 'var(--color-text-secondary)'}}><DayDate date={fullDate} /></span>}
                 </div>
                <span className="text-sm font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--color-border)', color: 'var(--color-text-primary)'}}>
                    {pendingTaskCount}
                </span>
            </div>
            <div className="space-y-3 p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {tasks.length > 0 ? (
                    tasks.map(task => <WeeklyTaskCard 
                        key={task.id} 
                        task={task} 
                        onDragStart={onDragStart} 
                        onToggleComplete={onToggleComplete} 
                        isDragging={draggedTaskId === task.id} 
                    />)
                ) : (
                    <div className="text-center text-sm p-4 rounded-md" style={{ color: 'var(--color-text-secondary)' }}>
                        No tasks.
                    </div>
                )}
            </div>
        </div>
    );
};


const WeeklyView: React.FC<WeeklyViewProps> = ({ tasks, onUpdateTask, onToggleComplete }) => {
    const { t } = useTranslation();
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday as start of week

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day;
    });

    const { unscheduledAndOverdue, tasksByDay } = useMemo(() => {
        const tasksByDayMap: Record<string, Task[]> = {};
        const unscheduled: Task[] = [];
        
        tasks.forEach(task => {
            // Fix: Changed dueDate to due_date to match Task type.
            if (task.due_date && !task.completed) {
                 const dateKey = task.due_date.split('T')[0];
                 if (dateKey < todayStr) {
                     unscheduled.push(task); // Add overdue tasks to the unscheduled list
                 }
            // Fix: Changed dueDate to due_date to match Task type.
            } else if (!task.due_date && !task.completed) {
                unscheduled.push(task);
            }
        });
        
        weekDays.forEach(day => {
            const dateKey = day.toISOString().split('T')[0];
            tasksByDayMap[dateKey] = tasks
                // Fix: Changed dueDate to due_date to match Task type.
                .filter(t => t.due_date === dateKey)
                .sort((a,b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || (b.impact - a.impact));
        });

        // Sort unscheduled list: overdue first, then by impact
        unscheduled.sort((a,b) => {
            // Fix: Changed dueDate to due_date to match Task type.
            const aOverdue = a.due_date && a.due_date < todayStr;
            // Fix: Changed dueDate to due_date to match Task type.
            const bOverdue = b.due_date && b.due_date < todayStr;
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;
            return b.impact - a.impact;
        });

        return { unscheduledAndOverdue: unscheduled, tasksByDay: tasksByDayMap };
    }, [tasks, todayStr, weekDays]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
        setDraggedTaskId(task.id);
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleDragEnd = () => {
        setDraggedTaskId(null);
    };

    const handleDrop = (date: string | null) => {
        if (draggedTaskId) {
            // Fix: Changed dueDate to due_date to match Task type.
            onUpdateTask(draggedTaskId, { due_date: date || undefined });
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ textShadow: `0 0 5px var(--color-secondary-blue)` }}>
                {t('weeklyView.title')}
            </h2>
            <div className="flex-1 overflow-x-auto pb-4">
                 <div className="flex space-x-4 min-w-max h-full" onDragEnd={handleDragEnd}>
                    {/* Unscheduled Column */}
                    <DayColumn
                        title="To Schedule"
                        date={null}
                        tasks={unscheduledAndOverdue}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onToggleComplete={onToggleComplete}
                        draggedTaskId={draggedTaskId}
                    />

                    {/* Day Columns */}
                    {weekDays.map(day => {
                        const dateKey = day.toISOString().split('T')[0];
                        const dayTasks = tasksByDay[dateKey] || [];
                        const isToday = dateKey === todayStr;

                        return (
                            <DayColumn
                                key={dateKey}
                                title={<DayTitle day={day} />}
                                date={dateKey}
                                tasks={dayTasks}
                                isToday={isToday}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                                onToggleComplete={onToggleComplete}
                                draggedTaskId={draggedTaskId}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeeklyView;