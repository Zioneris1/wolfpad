import React, { useState, useMemo } from 'react';
import type { Task, GoalWithProgress } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { getTaskPrioritization, generateContent, getGoalStrategy } from '../lib/ai';

interface AiAgentsViewProps {
    tasks: Task[];
    goals: GoalWithProgress[];
}

const PrioritizerIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"></path></svg>;
const CreatorIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>;
const StrategistIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path><path d="M12 12m-5 0a5 5 0 1010 0 5 5 0 10-10 0"></path></svg>;

const AgentOutput: React.FC<{ result: string; isLoading: boolean }> = ({ result, isLoading }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="agent-output-container">
            <div className="agent-output-header">
                <span>{t('aiAgentsView.agentResponse')}</span>
                {result && !isLoading && (
                    <button onClick={handleCopy} className="copy-btn">
                        {copied ? t('aiAgentsView.copied') : t('aiAgentsView.copy')}
                    </button>
                )}
            </div>
            <div className="agent-output-content">
                {result || ''}
            </div>
            {isLoading && <div className="agent-thinking-animation"></div>}
        </div>
    );
};

const AiAgentsView: React.FC<AiAgentsViewProps> = ({ tasks, goals }) => {
    const { t } = useTranslation();

    // State for Task Prioritizer
    const [isPrioritizerLoading, setIsPrioritizerLoading] = useState(false);
    const [prioritizerResult, setPrioritizerResult] = useState('');

    // State for Content Creator
    const [isCreatorLoading, setIsCreatorLoading] = useState(false);
    const [creatorPrompt, setCreatorPrompt] = useState('');
    const [creatorResult, setCreatorResult] = useState('');

    // State for Goal Strategist
    const [isStrategistLoading, setIsStrategistLoading] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState('');
    const [strategistResult, setStrategistResult] = useState('');
    
    const pendingTasks = useMemo(() => tasks.filter(task => !task.completed), [tasks]);

    const handleRunPrioritizer = async () => {
        setIsPrioritizerLoading(true);
        setPrioritizerResult('');
        try {
            const result = await getTaskPrioritization(pendingTasks);
            setPrioritizerResult(result);
        } catch (error) {
            setPrioritizerResult(error instanceof Error ? error.message : String(error));
        } finally {
            setIsPrioritizerLoading(false);
        }
    };

    const handleRunCreator = async () => {
        if (!creatorPrompt) return;
        setIsCreatorLoading(true);
        setCreatorResult('');
        try {
            const result = await generateContent(creatorPrompt);
            setCreatorResult(result);
        } catch (error) {
            setCreatorResult(error instanceof Error ? error.message : String(error));
        } finally {
            setIsCreatorLoading(false);
        }
    };

    const handleRunStrategist = async () => {
        const selectedGoal = goals.find(g => g.id === selectedGoalId);
        if (!selectedGoal) return;
        setIsStrategistLoading(true);
        setStrategistResult('');
        try {
            const result = await getGoalStrategy(selectedGoal);
            setStrategistResult(result);
        } catch (error) {
            setStrategistResult(error instanceof Error ? error.message : String(error));
        } finally {
            setIsStrategistLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: 'var(--color-bg-dark)',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        padding: '0.75rem',
        color: 'var(--color-text-primary)'
    };

    return (
        <div style={{ padding: '1.5rem 0' }}>
            <h2 style={{ textShadow: `0 0 5px var(--color-secondary-blue)` }}>{t('aiAgentsView.title')}</h2>

            <div className="agents-grid">
                {/* Task Prioritizer Agent */}
                <div className="agent-card prioritizer">
                    <div className="agent-card-header">
                        <div className="agent-card-icon" style={{color: 'var(--color-secondary-blue)'}}>
                            <PrioritizerIcon />
                        </div>
                        <h3 style={{ margin: 0 }}>{t('aiAgentsView.taskPrioritizer')}</h3>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', flex: 1 }}>{t('aiAgentsView.taskPrioritizerDesc')}</p>
                    <button onClick={handleRunPrioritizer} disabled={isPrioritizerLoading || pendingTasks.length === 0} style={{width: '100%', background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)'}}>
                        {isPrioritizerLoading ? t('aiAgentsView.runningAgent') : t('aiAgentsView.runAgent')}
                    </button>
                    {pendingTasks.length === 0 && <p style={{textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem'}}>{t('aiAgentsView.noPendingTasks')}</p>}
                    <AgentOutput result={prioritizerResult} isLoading={isPrioritizerLoading} />
                </div>

                {/* Content Creator Agent */}
                <div className="agent-card creator">
                    <div className="agent-card-header">
                        <div className="agent-card-icon" style={{color: '#ff00ff'}}>
                           <CreatorIcon />
                        </div>
                        <h3 style={{ margin: 0 }}>{t('aiAgentsView.contentCreator')}</h3>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{t('aiAgentsView.contentCreatorDesc')}</p>
                    <textarea
                        value={creatorPrompt}
                        onChange={e => setCreatorPrompt(e.target.value)}
                        placeholder={t('aiAgentsView.promptPlaceholder')}
                        style={{ ...inputStyle, minHeight: '80px', marginBottom: '1rem' }}
                    />
                    <button onClick={handleRunCreator} disabled={isCreatorLoading || !creatorPrompt} style={{width: '100%', background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)'}}>
                        {isCreatorLoading ? t('aiAgentsView.runningAgent') : t('aiAgentsView.runAgent')}
                    </button>
                    <AgentOutput result={creatorResult} isLoading={isCreatorLoading} />
                </div>

                {/* Goal Strategist Agent */}
                <div className="agent-card strategist">
                     <div className="agent-card-header">
                        <div className="agent-card-icon" style={{color: '#64ffda'}}>
                           <StrategistIcon />
                        </div>
                        <h3 style={{ margin: 0 }}>{t('aiAgentsView.goalStrategist')}</h3>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{t('aiAgentsView.goalStrategistDesc')}</p>
                     <select
                        value={selectedGoalId}
                        onChange={e => setSelectedGoalId(e.target.value)}
                        style={{ ...inputStyle, marginBottom: '1rem' }}
                        disabled={goals.length === 0}
                    >
                        <option value="">{t('aiAgentsView.selectGoal')}</option>
                        {goals.map(goal => (
                            <option key={goal.id} value={goal.id}>{goal.name}</option>
                        ))}
                    </select>
                    <button onClick={handleRunStrategist} disabled={isStrategistLoading || !selectedGoalId} style={{width: '100%', background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)'}}>
                        {isStrategistLoading ? t('aiAgentsView.runningAgent') : t('aiAgentsView.runAgent')}
                    </button>
                     {goals.length === 0 && <p style={{textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem'}}>{t('aiAgentsView.noGoals')}</p>}
                    <AgentOutput result={strategistResult} isLoading={isStrategistLoading} />
                </div>
            </div>
        </div>
    );
};

export default AiAgentsView;