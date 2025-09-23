import React, { useState, useMemo } from 'react';
import type { GoalWithProgress, Task } from '../types';
import TaskItem from './TaskItem';
import { useTranslation } from '../hooks/useTranslation';

// --- ICONS ---
const EditIcon = () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => <svg className={`w-5 h-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const AiIcon = () => <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H5z" /><path d="M15 6a1 1 0 10-2 0v1a1 1 0 102 0V6z" /><path d="M13.882 10.232a.5.5 0 01.118-.707l.866-.5a.5.5 0 01.707.707l-.866.5a.5.5 0 01-.707-.118zM14.5 12a.5.5 0 01.707 0l.866.5a.5.5 0 01-.118.707l-.866-.5a.5.5 0 01-.707-.118zM10 12a2 2 0 100-4 2 2 0 000 4z" /><path d="M6.118 10.232a.5.5 0 00-.118-.707l-.866-.5a.5.5 0 00-.707.707l.866.5a.5.5 0 00.707-.118zM5.5 12a.5.5 0 00-.707 0l-.866.5a.5.5 0 00.118.707l.866-.5a.5.5 0 00.707-.118z" /></svg>;


interface GoalItemProps {
    goal: GoalWithProgress;
    tasks: Task[];
    onEditGoal: (goal: GoalWithProgress) => void;
    onDeleteGoal: (id: string) => void;
    onBreakdown: (goal: GoalWithProgress) => void;
    onPromoteTask: (id: string) => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
    onViewTask: (task: Task) => void;
    onToggleTaskComplete: (id: string) => void;
    onStartTracking: (id: string) => void;
    onStopTracking: (id: string) => void;
}

const GoalItem: React.FC<GoalItemProps> = (props) => {
    const { t } = useTranslation();
    const { goal, tasks, onEditGoal, onDeleteGoal, onBreakdown } = props;
    const [isExpanded, setIsExpanded] = useState(false);

    const associatedTasks = useMemo(() => {
        // Fix: Changed task.goalId to task.goal_id to match the Task type.
        return tasks.filter(task => task.goal_id === goal.id)
                    .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [tasks, goal.id]);

    const progressColor = goal.progress === 100 ? 'var(--color-secondary-blue-glow)' : 'var(--color-secondary-blue)';
    
    const iconButtonStyle: React.CSSProperties = {
        background: 'transparent',
        border: 'none',
        padding: '0.25rem',
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
    };

    return (
        <div className="bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg shadow-lg flex flex-col transition-all duration-300 border-t-4" style={{borderColor: 'var(--color-secondary-blue)'}}>
            
            {/* Main Card Content */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--color-text-primary)'}}>{goal.name}</h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)'}}>{goal.description}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button style={iconButtonStyle} onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'} onClick={(e) => { e.stopPropagation(); onEditGoal(goal); }}><EditIcon/></button>
                        <button style={iconButtonStyle} onMouseOver={e => e.currentTarget.style.color = 'var(--color-primary-red)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'} onClick={(e) => { e.stopPropagation(); onDeleteGoal(goal.id); }}><DeleteIcon/></button>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-dashed" style={{borderColor: 'var(--color-border)'}}>
                    <div>
                        <div className="text-3xl font-bold" style={{color: progressColor}}>{goal.progress}%</div>
                        <div className="text-xs uppercase tracking-wider" style={{color: 'var(--color-text-secondary)'}}>{t('goalItem.progress')}</div>
                    </div>
                     <div>
                        <div className="text-3xl font-bold" style={{color: 'var(--color-text-primary)'}}>{goal.completedTaskCount}<span className="text-lg" style={{color: 'var(--color-text-secondary)'}}>/ {goal.taskCount}</span></div>
                        <div className="text-xs uppercase tracking-wider" style={{color: 'var(--color-text-secondary)'}}>{t('common.tasks')} {t('dashboard.completed')}</div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
             <div className="flex justify-between items-center p-3 border-t" style={{background: 'var(--color-bg-dark)', borderColor: 'var(--color-border)', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem'}}>
                <button onClick={() => onBreakdown(goal)} className="flex items-center text-sm font-semibold px-3 py-1.5 rounded-md transition-colors" style={{background: 'transparent', color: 'var(--color-secondary-blue)', border: '1px solid var(--color-secondary-blue)'}}>
                    <AiIcon />
                    {t('goalItem.aiBreakdown')}
                </button>
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center text-sm font-semibold px-3 py-1.5" style={{color: 'var(--color-text-secondary)'}}>
                    {isExpanded ? 'Hide Tasks' : 'View Tasks'}
                    <ChevronDownIcon className={`ml-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
             </div>

            {/* Expandable Task List */}
            {isExpanded && (
                <div className="border-t bg-black/20" style={{borderColor: 'var(--color-border)'}}>
                    <div className="p-4 space-y-2">
                         <h4 className="font-semibold" style={{color: 'var(--color-text-secondary)'}}>{t('goalItem.associatedTasks')}</h4>
                        {associatedTasks.length > 0 ? associatedTasks.map(task => (
                            <TaskItem 
                                key={task.id}
                                task={task}
                                onToggleComplete={props.onToggleTaskComplete}
                                onEdit={props.onEditTask}
                                onView={props.onViewTask}
                                onStartTracking={props.onStartTracking}
                                onStopTracking={props.onStopTracking}
                                onPromote={props.onPromoteTask}
                                isSelected={false}
                                onSelect={() => {}}
                            />
                        )) : <p className="text-center text-sm p-4" style={{color: 'var(--color-text-secondary)'}}>{t('goalItem.noTasks')}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalItem;