import React, { useState } from 'react';
import type { Goal, Task, GoalWithProgress } from '../types';
import type { useGoalManager } from '../hooks/useGoalManager';
import GoalItem from './GoalItem';
import AiBreakdownModal from './AiBreakdownModal';
import { useTranslation } from '../hooks/useTranslation';


interface GoalFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Omit<Goal, 'id' | 'createdAt'> | Goal) => void;
    goalToEdit?: Goal | null;
}

const GoalForm: React.FC<GoalFormProps> = ({ isOpen, onClose, onSave, goalToEdit }) => {
    const { t } = useTranslation();
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');

    React.useEffect(() => {
        if (goalToEdit) {
            setName(goalToEdit.name);
            setDescription(goalToEdit.description);
        } else {
            setName('');
            setDescription('');
        }
    }, [goalToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        const goalData = { name, description };
        onSave(goalToEdit ? { ...goalToEdit, ...goalData } : { ...goalData, type: 'standard' });
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(16, 20, 26, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050, backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'var(--color-bg-panel)', padding: '2rem', borderRadius: '8px', width: '500px', border: '1px solid var(--color-border)' }}>
                <h2 style={{marginTop: 0, color: 'var(--color-text-primary)'}}>{goalToEdit ? t('goalsView.editGoal') : t('goalsView.newGoal')}</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder={t('common.goal') + ' ' + t('taskForm.nameLabel')} value={name} onChange={e => setName(e.target.value)} required style={{width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'var(--color-bg-dark)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '4px' }} />
                    <textarea placeholder={t('taskForm.descriptionLabel')} value={description} onChange={e => setDescription(e.target.value)} style={{width: '100%', minHeight: '100px', padding: '0.75rem', marginBottom: '1rem', background: 'var(--color-bg-dark)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '4px'}}/>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
                        <button type="button" onClick={onClose} style={{background: 'transparent', border: '1px solid var(--color-border)'}}>{t('common.cancel')}</button>
                        <button type="submit" style={{background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)'}}>{t('common.save')} {t('common.goal')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface GoalsViewProps {
    goalManager: ReturnType<typeof useGoalManager>;
    tasks: Task[];
    onAddBulkTasks: (tasks: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'tags' | 'timeSpent' | 'isTracking' | 'promotedToDashboard'>[]) => void;
    onPromoteTask: (id: string) => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
    onViewTask: (task: Task) => void;
    onToggleTaskComplete: (id: string) => void;
    onStartTracking: (id: string) => void;
    onStopTracking: (id: string) => void;
}

const TargetIcon = () => (
    <svg className="mx-auto h-12 w-12" style={{color: 'var(--color-text-secondary)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 6a4 4 0 100 8 4 4 0 000-8z"></path><circle cx="12" cy="12" r="2"></circle>
    </svg>
);


const GoalsView: React.FC<GoalsViewProps> = (props) => {
    const { t } = useTranslation();
    const { goalManager, onAddBulkTasks, tasks } = props;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
    const [goalForBreakdown, setGoalForBreakdown] = useState<GoalWithProgress | null>(null);
    
    const { goals, addGoal, updateGoal, deleteGoal } = goalManager;

    const handleOpenForm = (goal?: Goal) => {
        setGoalToEdit(goal || null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setGoalToEdit(null);
        setIsFormOpen(false);
    };

    const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'createdAt'> | Goal) => {
        if ('id' in goalData) {
            updateGoal(goalData.id, goalData);
        } else {
            addGoal(goalData);
        }
    };
    
    return (
        <div className="py-2 md:py-6">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold tracking-tight m-0" style={{ textShadow: `0 0 5px var(--color-secondary-blue)` }}>{t('goalsView.title')}</h2>
                 <button onClick={() => handleOpenForm()} className="px-4 py-2 rounded-md font-semibold" style={{background: 'var(--color-primary-red)', color: 'var(--color-text-on-accent)', border: 'none' }}>{t('goalsView.newGoal')}</button>
            </div>
            
            {goals.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {goals.map(goal => (
                        <GoalItem
                            key={goal.id}
                            goal={goal}
                            tasks={tasks}
                            onEditGoal={handleOpenForm}
                            onDeleteGoal={deleteGoal}
                            onBreakdown={setGoalForBreakdown}
                            {...props} // Pass all task handlers down
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-dark)'}}>
                    <TargetIcon />
                    <h3 className="mt-2 text-lg font-medium" style={{ color: 'var(--color-text-primary)'}}>No Goals Defined</h3>
                    <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)'}}>Click "New Goal" to set your first strategic objective.</p>
                </div>
            )}
            
            <GoalForm 
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSave={handleSaveGoal}
                goalToEdit={goalToEdit}
            />
            
            <AiBreakdownModal 
                goal={goalForBreakdown}
                onClose={() => setGoalForBreakdown(null)}
                onAddTasks={onAddBulkTasks}
            />

        </div>
    );
};

export default GoalsView;