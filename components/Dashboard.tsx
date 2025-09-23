import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import type { Task } from '../types';
import TaskList from './TaskList';
import BulkActionBar from './BulkActionBar';
import { useTranslation } from '../hooks/useTranslation';

interface DashboardProps {
    tasks: Task[];
    onToggleComplete: (id: string) => void;
    onEdit: (task: Task) => void;
    onView: (task: Task) => void;
    onStartTracking: (id: string) => void;
    onStopTracking: (id: string) => void;
    completeMultipleTasks: (ids: string[]) => void;
    deleteMultipleTasks: (ids: string[]) => void;
    initialFilter: 'pending' | 'completed' | 'all';
    onSetInitialFilter: (filter: 'pending' | 'completed' | 'all') => void;
}

type SortBy = 'impact' | 'createdDate';
type ActiveTab = 'today' | 'upcoming' | 'later';

// --- ICONS ---
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- NEW COMPONENTS ---
const StatCard: React.FC<{ value: number; label: string; icon: ReactNode; colorClass: string }> = ({ value, label, icon, colorClass }) => (
    <div className="flex items-center p-4 rounded-lg" style={{ background: `var(--color-bg-dark)`}}>
        <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg ${colorClass} text-white`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-2xl font-bold" style={{ color: `var(--color-text-primary)` }}>{value}</p>
            <p className="text-sm font-medium" style={{ color: `var(--color-text-secondary)` }}>{label}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { t } = useTranslation();
    const { tasks, completeMultipleTasks, deleteMultipleTasks, initialFilter, onSetInitialFilter } = props;
    
    const [filter, setFilter] = useState(initialFilter);
    const [sortBy, setSortBy] = useState<SortBy>('impact');
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<ActiveTab>('today');

    useEffect(() => {
        setFilter(initialFilter);
    }, [initialFilter]);
    
    const handleCompleteSelected = () => {
        completeMultipleTasks(selectedTasks);
        setSelectedTasks([]);
    };

    const handleDeleteSelected = () => {
        deleteMultipleTasks(selectedTasks);
        setSelectedTasks([]);
    };

    const { displayedTasks, stats } = useMemo(() => {
        const dashboardTasks = tasks.filter(t => t.promoted_to_dashboard);
        
        let filteredByStatus = dashboardTasks;
        if (filter === 'pending') {
            filteredByStatus = dashboardTasks.filter(t => !t.completed);
        } else if (filter === 'completed') {
            filteredByStatus = dashboardTasks.filter(t => t.completed);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const todayTasks: Task[] = [];
        const upcomingTasks: Task[] = [];
        const noDueDateTasks: Task[] = [];
        
        filteredByStatus.forEach(task => {
            if (!task.due_date) {
                noDueDateTasks.push(task);
            } else {
                const dueDate = new Date(task.due_date);
                dueDate.setHours(0,0,0,0);
                if (dueDate.toISOString().split('T')[0] <= todayStr) {
                    todayTasks.push(task);
                } else {
                    upcomingTasks.push(task);
                }
            }
        });

        const sortTasks = (arr: Task[]) => arr.sort((a, b) => {
            if (sortBy === 'impact') return b.impact - a.impact;
            // Fix: Changed createdAt to created_at to match Task type.
            if (sortBy === 'createdDate') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            return 0;
        });
        
        const tasksByTab = {
            today: sortTasks(todayTasks),
            upcoming: sortTasks(upcomingTasks),
            later: sortTasks(noDueDateTasks),
        };

        const pendingTasks = dashboardTasks.filter(t => !t.completed);
        const stats = {
            dueToday: pendingTasks.filter(t => t.due_date === todayStr).length,
            overdue: pendingTasks.filter(t => t.due_date && t.due_date < todayStr).length,
            completedToday: dashboardTasks.filter(t => t.completed && t.completed_at?.startsWith(todayStr)).length,
        };

        return {
            displayedTasks: tasksByTab[activeTab],
            stats
        };
    }, [tasks, filter, sortBy, activeTab]);

    const tabs: { id: ActiveTab; label: string }[] = [
        { id: 'today', label: t('dashboard.dueToday') },
        { id: 'upcoming', label: t('dashboard.upcoming') },
        { id: 'later', label: t('dashboard.noDueDate') },
    ];
    
    return (
        <div className="py-2 md:py-6">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                {/* --- Left Column (Main Content) --- */}
                <div className="lg:col-span-2">
                    <header>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                            Command Center
                        </h1>
                        <p className="mt-1 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                            Here's your mission overview for today. Focus on what matters.
                        </p>
                    </header>

                    <div className="mt-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                                        ${activeTab === tab.id
                                            ? 'border-[var(--color-secondary-blue)] text-[var(--color-secondary-blue)]'
                                            : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-6">
                        <TaskList
                            tasks={displayedTasks}
                            selectedTasks={selectedTasks}
                            onSelectionChange={setSelectedTasks}
                            {...props}
                        />
                    </div>
                </div>

                {/* --- Right Column (Sidebar) --- */}
                <div className="mt-8 lg:mt-0 lg:col-span-1">
                     <div className="space-y-6 p-4 md:p-6 rounded-lg" style={{background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)'}}>
                        <div>
                            <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Stats</h3>
                            <div className="mt-4 space-y-4">
                               <StatCard value={stats.dueToday} label={t('dashboard.dueToday')} icon={<CalendarIcon />} colorClass="bg-blue-500" />
                               <StatCard value={stats.overdue} label={t('dashboard.overdue')} icon={<AlertTriangleIcon />} colorClass="bg-red-500" />
                               <StatCard value={stats.completedToday} label={t('dashboard.completedToday')} icon={<CheckCircleIcon />} colorClass="bg-gray-500" />
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Controls</h3>
                             <div className="mt-4 space-y-4">
                                <div>
                                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Show</label>
                                    <div className="flex space-x-1 mt-1">
                                         {['pending', 'completed', 'all'].map((f) => (
                                             <button
                                                 key={f}
                                                 onClick={() => { setFilter(f as any); onSetInitialFilter(f as any); }}
                                                 className={`flex-1 text-xs px-2 py-1.5 rounded transition-colors duration-200 ${filter === f ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}
                                                 style={{backgroundColor: filter === f ? 'var(--color-secondary-blue)' : 'var(--color-bg-dark)'}}
                                             >
                                                 {t(`dashboard.${f}`)}
                                             </button>
                                         ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{t('dashboard.sortBy')}</label>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base rounded-md focus:outline-none focus:ring-[var(--color-secondary-blue)] focus:border-[var(--color-secondary-blue)] sm:text-sm" style={{ background: 'var(--color-bg-dark)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
                                        <option value="impact">{t('dashboard.impact')}</option>
                                        <option value="createdDate">{t('dashboard.createdDate')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedTasks.length > 0 && (
                <BulkActionBar
                    count={selectedTasks.length}
                    onComplete={handleCompleteSelected}
                    onDelete={handleDeleteSelected}
                    onClear={() => setSelectedTasks([])}
                />
            )}
        </div>
    );
};

export default Dashboard;