import React, { useState, useEffect } from 'react';
import type { DevelopmentPlan, DevelopmentResource } from '../types';
import { getDevelopmentPlan, getAlternativeResource } from '../lib/ai';
import { useTranslation } from '../hooks/useTranslation';
import { useAuthContext } from '../context/AuthContext';
import { devPlanApi } from '../services/api';
import { subscribe } from '../services/realtime';


const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" /></svg>;
const YoutubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const PodcastIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" /></svg>;
const SwapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const PersonalDevelopmentView: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuthContext();
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
    
    useEffect(() => {
        if (user) {
            setIsDataLoading(true);
            devPlanApi.getPlans(user.id)
                .then(setPlans)
                .catch(err => console.error("Failed to fetch dev plans", err))
                .finally(() => setIsDataLoading(false));
                
            const unsubscribe = subscribe('development_plans', (message: any) => {
                switch (message.type) {
                    case 'DEVELOPMENT_PLAN_CREATED':
                        setPlans(prev => [message.payload, ...prev]);
                        break;
                    case 'DEVELOPMENT_PLAN_UPDATED':
                        setPlans(prev => prev.map(p => p.id === message.payload.id ? message.payload : p));
                        break;
                    case 'DEVELOPMENT_PLAN_DELETED':
                        setPlans(prev => prev.filter(p => p.id !== message.payload.id));
                        break;
                }
            });

            return () => unsubscribe();
        } else {
            setPlans([]);
            setIsDataLoading(false);
        }
    }, [user]);

    const handleGeneratePlan = async () => {
        if (!goal || !user) return;
        setIsLoading(true);
        try {
            const newPlanData = await getDevelopmentPlan(goal, 3, 3, 3);
            // Fix: Map the AI response (camelCase) to the database schema (snake_case)
            // to resolve type errors for `youtube_channels` and `author_or_channel`.
            const mapResource = (res: { title: string; authorOrChannel: string; }): DevelopmentResource => ({
                title: res.title,
                author_or_channel: res.authorOrChannel,
            });

            const planPayload = { 
                goal, 
                books: newPlanData.books.map(mapResource),
                youtube_channels: newPlanData.youtubeChannels.map(mapResource),
                podcasts: newPlanData.podcasts.map(mapResource)
            };
            await devPlanApi.createPlan(planPayload, user.id);
            setGoal('');
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to generate plan.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeletePlan = async (planId: string) => {
        if (!user) return;
        await devPlanApi.deletePlan(planId, user.id);
    };
    
    const handleDeleteResource = async (planId: string, resourceTitle: string, type: keyof Omit<DevelopmentPlan, 'id'|'goal'| 'user_id' | 'created_at'>) => {
        if (!user) return;
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        const updatedResources = plan[type].filter(r => r.title !== resourceTitle);
        await devPlanApi.updatePlan(planId, { [type]: updatedResources }, user.id);
    };
    
    const handleSwapResource = async (planId: string, resourceToReplace: DevelopmentResource, type: keyof Omit<DevelopmentPlan, 'id'|'goal' | 'user_id' | 'created_at'>) => {
        if (!user) return;
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        try {
            const newResource = await getAlternativeResource(plan.goal, resourceToReplace.title);
            const updatedResources = plan[type].map(r => r.title === resourceToReplace.title ? { ...newResource, author_or_channel: (newResource as any).authorOrChannel } : r);
            await devPlanApi.updatePlan(planId, { [type]: updatedResources }, user.id);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to swap resource.");
        }
    };

    return (
        <div className="py-2 md:py-6">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                {/* --- Left Column (Planner) --- */}
                <div className="lg:col-span-1">
                    <div className="p-6 rounded-xl shadow-lg sticky top-6" style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)' }}>
                        <h3 className="font-bold text-lg" style={{ color: 'var(--color-secondary-blue)' }}>{t('personalDevView.aiPlanner')}</h3>
                        <p className="text-sm mt-1 mb-4" style={{ color: 'var(--color-text-secondary)' }}>{t('personalDevView.plannerDescription')}</p>
                        <textarea
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            placeholder={t('personalDevView.goalPlaceholder')}
                            className="w-full p-2 rounded-md bg-[var(--color-bg-dark)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                            rows={3}
                        />
                        <button
                            onClick={handleGeneratePlan}
                            disabled={isLoading || !goal.trim()}
                            className="w-full mt-3 font-semibold px-4 py-2 rounded-lg transition-colors"
                            style={{ background: 'var(--color-primary-red)', color: 'var(--color-text-on-accent)' }}
                        >
                            {isLoading ? t('personalDevView.generatingPlan') : t('personalDevView.generatePlan')}
                        </button>
                    </div>
                </div>

                {/* --- Right Column (Plans) --- */}
                <div className="mt-8 lg:mt-0 lg:col-span-2">
                    <h2 className="text-2xl font-bold tracking-tight mb-4">{t('personalDevView.activePlans')}</h2>
                    <div className="space-y-6">
                        {isDataLoading ? <p>Loading plans...</p> : plans.length > 0 ? plans.map(plan => (
                            <div key={plan.id} className="p-6 rounded-xl shadow-lg" style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)' }}>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg mb-4">{plan.goal}</h3>
                                    <button onClick={() => handleDeletePlan(plan.id)} className="text-sm font-semibold" style={{ color: 'var(--color-primary-red)' }}>{t('common.delete')}</button>
                                </div>
                                <div className="space-y-4">
                                    <ResourceList title={t('personalDevView.books')} icon={<BookIcon />} resources={plan.books} onSwap={(res) => handleSwapResource(plan.id, res, 'books')} onDelete={(res) => handleDeleteResource(plan.id, res.title, 'books')} />
                                    <ResourceList title={t('personalDevView.youtubeChannels')} icon={<YoutubeIcon />} resources={plan.youtube_channels} onSwap={(res) => handleSwapResource(plan.id, res, 'youtube_channels')} onDelete={(res) => handleDeleteResource(plan.id, res.title, 'youtube_channels')}/>
                                    <ResourceList title={t('personalDevView.podcasts')} icon={<PodcastIcon />} resources={plan.podcasts} onSwap={(res) => handleSwapResource(plan.id, res, 'podcasts')} onDelete={(res) => handleDeleteResource(plan.id, res.title, 'podcasts')}/>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-dark)'}}>
                                <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)'}}>{t('personalDevView.noPlans')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResourceList: React.FC<{ title: string; icon: React.ReactNode; resources: DevelopmentResource[], onSwap: (res: DevelopmentResource) => void, onDelete: (res: DevelopmentResource) => void }> = ({ title, icon, resources, onSwap, onDelete }) => {
    const { t } = useTranslation();
    return (
        <div>
            <h4 className="flex items-center font-semibold text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>{icon}<span className="ml-2">{title}</span></h4>
            <ul className="space-y-2">
                {resources.map(res => (
                    <li key={res.title} className="flex justify-between items-center p-3 rounded-md group" style={{ background: 'var(--color-bg-dark)' }}>
                        <div>
                            <p className="font-medium text-sm">{res.title}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{res.author_or_channel}</p>
                        </div>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                             <button onClick={() => onSwap(res)} className="flex items-center text-xs font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-secondary-blue)' }}>
                                <SwapIcon /> {t('personalDevView.swapWithAi')}
                            </button>
                             <button onClick={() => onDelete(res)} className="flex items-center text-xs font-semibold px-2 py-1 rounded" style={{ background: 'var(--color-bg-panel)', color: 'var(--color-primary-red)' }}>
                                <DeleteIcon /> {t('personalDevView.deleteItem')}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PersonalDevelopmentView;