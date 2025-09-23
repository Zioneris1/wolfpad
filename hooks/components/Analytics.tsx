import React from 'react';
import type { Task } from '../types';
import type { useMoneyManager } from '../hooks/useMoneyManager';
import DonutChart from './DonutChart';
import { useTranslation } from '../hooks/useTranslation';
import { formatTime } from '../utils/time';

// --- ICONS ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TimerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const TrendingDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;
const ScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;


interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => (
    <div
        onClick={onClick}
        className={`p-5 rounded-xl shadow-lg flex items-center space-x-4 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1' : ''}`}
        style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)' }}
    >
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl" style={{ backgroundColor: color }}>
            {icon}
        </div>
        <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</div>
            <div className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{title}</div>
        </div>
    </div>
);


interface AnalyticsProps {
    tasks: Task[];
    moneyManager: ReturnType<typeof useMoneyManager>;
    onNavigateToDashboard: (filter: 'pending' | 'completed') => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ tasks, moneyManager, onNavigateToDashboard }) => {
    const { t } = useTranslation();

    // --- Task Analytics ---
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const totalTimeSpent = tasks.reduce((acc, task) => acc + task.time_spent, 0);
    const effortImpactRatio = tasks.reduce((acc, task) => {
        if (task.completed) {
            acc.totalImpact += task.impact;
            acc.totalEffort += task.effort;
        }
        return acc;
    }, { totalImpact: 0, totalEffort: 0 });

    const efficiencyScore = effortImpactRatio.totalEffort > 0
        ? (effortImpactRatio.totalImpact / effortImpactRatio.totalEffort).toFixed(2)
        : 'N/A';
        
    // --- Financial Analytics (Current Month) ---
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTransactions = moneyManager.transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear && t.currency === moneyManager.selectedCurrency;
    });

    const monthlyIncome = monthlyTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = monthlyTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);

    const formatCurrency = (value: number) => {
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency: moneyManager.selectedCurrency, notation: 'compact' }).format(value);
        } catch (e) {
            return `${moneyManager.selectedCurrency} ${value.toFixed(0)}`;
        }
    };

    // --- Actions ---
    const handleDownloadFinancials = () => {
        const headers = ["Date", "Description", "Category", "Amount", "Currency"];
        const rows = moneyManager.transactions.map(t =>
            [t.date, `"${t.description.replace(/"/g, '""')}"`, t.category, t.amount.toFixed(2), t.currency].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "wolfpad_financial_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="py-2 md:py-6">
            <h2 className="text-3xl font-bold tracking-tight mb-6" style={{ textShadow: `0 0 5px var(--color-secondary-blue)` }}>{t('analyticsView.title')}</h2>

            {/* --- Key Metrics Grid --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title={t('analyticsView.pendingTasks')} 
                    value={String(pendingTasks)}
                    icon={<ClockIcon />}
                    color="#f59e0b" // Amber
                    onClick={() => onNavigateToDashboard('pending')}
                />
                <StatCard 
                    title={t('analyticsView.completedTasks')} 
                    value={String(completedTasks)}
                    icon={<CheckCircleIcon />}
                    color="#10b981" // Emerald
                    onClick={() => onNavigateToDashboard('completed')}
                />
                 <StatCard 
                    title={t('analyticsView.totalTimeTracked')} 
                    value={formatTime(totalTimeSpent).split(':').slice(0,2).join(':')} // Show HH:MM
                    icon={<TimerIcon />}
                    color="#3b82f6" // Blue
                />
                <StatCard 
                    title={t('analyticsView.impactEffortRatio')} 
                    value={efficiencyScore}
                    icon={<ChartBarIcon />}
                    color="#8b5cf6" // Violet
                />
            </div>
            
            {/* --- Visualizations Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Task Completion */}
                <div className="lg:col-span-1 p-6 rounded-xl shadow-lg" style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)' }}>
                    <h3 className="font-bold text-lg mb-4">{t('analyticsView.completionRate')}</h3>
                    <DonutChart completed={completedTasks} total={totalTasks} />
                    <div className="flex justify-around mt-4 text-center">
                        <div>
                            <p className="font-bold text-2xl" style={{ color: 'var(--color-text-primary)'}}>{completedTasks}</p>
                            <p className="text-xs uppercase" style={{ color: 'var(--color-text-secondary)'}}>{t('dashboard.completed')}</p>
                        </div>
                         <div>
                            <p className="font-bold text-2xl" style={{ color: 'var(--color-text-primary)'}}>{pendingTasks}</p>
                            <p className="text-xs uppercase" style={{ color: 'var(--color-text-secondary)'}}>{t('dashboard.pending')}</p>
                        </div>
                    </div>
                </div>

                {/* Financial Overview & Reports */}
                <div className="lg:col-span-2 p-6 rounded-xl shadow-lg space-y-6" style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)' }}>
                     <h3 className="font-bold text-lg">Financial Overview (This Month)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard 
                            title="Income" 
                            value={formatCurrency(monthlyIncome)}
                            icon={<TrendingUpIcon />}
                            color="#10b981" // Emerald
                        />
                        <StatCard 
                            title="Expenses" 
                            value={formatCurrency(Math.abs(monthlyExpenses))}
                            icon={<TrendingDownIcon />}
                            color="#ef4444" // Red
                        />
                         <StatCard 
                            title="Net Balance" 
                            value={formatCurrency(monthlyIncome + monthlyExpenses)}
                            icon={<ScaleIcon />}
                            color="#3b82f6" // Blue
                        />
                     </div>
                     <div className="pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold">{t('analyticsView.financialReport')}</h4>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)'}}>{t('analyticsView.financialReportDesc')}</p>
                            </div>
                            <button 
                                onClick={handleDownloadFinancials} 
                                className="flex items-center justify-center font-semibold px-4 py-2 rounded-lg transition-colors" 
                                style={{background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)', border: 'none' }}
                            >
                                <DownloadIcon />
                                {t('analyticsView.downloadCsv')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;