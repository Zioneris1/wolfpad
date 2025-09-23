import React, { useState, useEffect } from 'react';
import type { View, Task, AppContextData } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuthContext } from './context/AuthContext';

// Hooks
import { useTaskManager } from './hooks/useTaskManager';
import { useGoalManager } from './hooks/useGoalManager';
import { useScheduleManager } from './hooks/useScheduleManager';
import { useMoneyManager } from './hooks/useMoneyManager';
import { useJournalManager } from './hooks/useJournalManager';

// Components
import DesktopSidebar from './components/DesktopSidebar';
import BottomNavBar from './components/BottomNavBar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GoalsView from './components/GoalsView';
import WeeklyView from './components/WeeklyView';
import PersonalSchedule from './components/PersonalSchedule';
import MoneyView from './components/MoneyView';
import PersonalDevelopmentView from './components/PersonalDevelopmentView';
import Analytics from './components/Analytics';
import AiAgentsView from './components/AiAgentsView';
import TheDenView from './components/TheDenView';
import SettingsView from './components/SettingsView';
import TaskForm from './components/TaskForm';
import TaskDetail from './components/TaskDetail';
import AiAssistant from './components/AiAssistant';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';

const AppContent: React.FC = () => {
    const { user, loading: authLoading } = useAuthContext();
    const [authView, setAuthView] = useState<'login' | 'signup'>('login');

    const [view, setView] = useState<View>('dashboard');
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [taskToView, setTaskToView] = useState<Task | null>(null);
    const [dashboardFilter, setDashboardFilter] = useState<'pending' | 'completed' | 'all'>('pending');

    const taskManager = useTaskManager();
    const goalManager = useGoalManager(taskManager.tasks);
    const scheduleManager = useScheduleManager();
    const moneyManager = useMoneyManager();
    const journalManager = useJournalManager();

    const handleOpenTaskForm = (task?: Task) => {
        setTaskToEdit(task || null);
        setIsTaskFormOpen(true);
    };

    const handleCloseTaskForm = () => {
        setTaskToEdit(null);
        setIsTaskFormOpen(false);
    };

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'timeSpent' | 'isTracking' | 'promotedToDashboard'> | Task) => {
        if ('id' in taskData) {
            taskManager.updateTask(taskData.id, taskData);
        } else {
            taskManager.addTask(taskData);
        }
        handleCloseTaskForm();
    };
    
    const handleViewTask = (task: Task) => {
        setTaskToView(task);
    };

    const handleCloseTaskDetail = () => {
        setTaskToView(null);
    };

    const handleEditFromDetail = (task: Task) => {
        handleCloseTaskDetail();
        handleOpenTaskForm(task);
    };

    const handleNavigateToDashboard = (filter: 'pending' | 'completed') => {
        setDashboardFilter(filter);
        setView('dashboard');
    };

    const renderView = () => {
        const isDataLoading = taskManager.loading || goalManager.loading || scheduleManager.loading || moneyManager.loading || journalManager.loading;
        if (isDataLoading) {
            return (
                <div className="flex justify-center items-center h-full text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                    Syncing with command center...
                </div>
            );
        }

        switch (view) {
            case 'dashboard':
                return <Dashboard
                    tasks={taskManager.tasks}
                    onToggleComplete={taskManager.toggleTaskComplete}
                    onEdit={handleOpenTaskForm}
                    onView={handleViewTask}
                    onStartTracking={taskManager.startTracking}
                    onStopTracking={taskManager.stopTracking}
                    completeMultipleTasks={taskManager.completeMultipleTasks}
                    deleteMultipleTasks={taskManager.deleteMultipleTasks}
                    initialFilter={dashboardFilter}
                    onSetInitialFilter={setDashboardFilter}
                />;
            case 'goals':
                return <GoalsView
                    goalManager={goalManager}
                    tasks={taskManager.tasks}
                    onAddBulkTasks={taskManager.addBulkTasks}
                    onPromoteTask={taskManager.promoteTask}
                    onEditTask={handleOpenTaskForm}
                    onDeleteTask={taskManager.deleteTask}
                    onViewTask={handleViewTask}
                    onToggleTaskComplete={taskManager.toggleTaskComplete}
                    onStartTracking={taskManager.startTracking}
                    onStopTracking={taskManager.stopTracking}
                />;
            case 'weekly':
                return <WeeklyView tasks={taskManager.tasks} onUpdateTask={taskManager.updateTask} onToggleComplete={taskManager.toggleTaskComplete} />;
            case 'schedule':
                return <PersonalSchedule scheduleManager={scheduleManager} />;
            case 'financials':
                return <MoneyView moneyManager={moneyManager} />;
            case 'personalDevelopment':
                return <PersonalDevelopmentView />;
            case 'analytics':
                return <Analytics tasks={taskManager.tasks} moneyManager={moneyManager} onNavigateToDashboard={handleNavigateToDashboard} />;
            case 'agents':
                return <AiAgentsView tasks={taskManager.tasks} goals={goalManager.goals} />;
            case 'theDen':
                return <TheDenView journalManager={journalManager} />;
            case 'settings':
                return <SettingsView />;
            default:
                return <Dashboard 
                    tasks={taskManager.tasks} 
                    onToggleComplete={taskManager.toggleTaskComplete}
                    onEdit={handleOpenTaskForm}
                    onView={handleViewTask}
                    onStartTracking={taskManager.startTracking}
                    onStopTracking={taskManager.stopTracking}
                    completeMultipleTasks={taskManager.completeMultipleTasks}
                    deleteMultipleTasks={taskManager.deleteMultipleTasks}
                    initialFilter={dashboardFilter}
                    onSetInitialFilter={setDashboardFilter}
                />;
        }
    };
    
    // Simple check for mobile for layout switching
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const appContextData: AppContextData = {
        tasks: taskManager.tasks,
        goals: goalManager.goals,
        scheduleBlocks: scheduleManager.blocks,
        transactions: moneyManager.transactions,
        currentView: view,
    };

    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-main)', color: 'var(--color-text-primary)' }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return authView === 'login' 
            ? <LoginView onSwitchToSignUp={() => setAuthView('signup')} />
            : <SignUpView onSwitchToLogin={() => setAuthView('login')} />;
    }

    return (
        <div className="app-container" style={{ display: 'flex', height: '100vh', background: 'var(--color-bg-main)' }}>
            {!isMobile && <DesktopSidebar currentView={view} setView={setView} onAddTask={() => handleOpenTaskForm()} tasks={taskManager.tasks} />}

            <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '1rem 2.5rem', paddingBottom: isMobile ? '80px' : '1rem' }}>
                {isMobile && <Header onAddTask={() => handleOpenTaskForm()} tasks={taskManager.tasks} />}
                {renderView()}
            </main>

            {isMobile && <BottomNavBar currentView={view} setView={setView} />}

            <TaskForm
                isOpen={isTaskFormOpen}
                onClose={handleCloseTaskForm}
                onSave={handleSaveTask}
                taskToEdit={taskToEdit}
            />
            
            <TaskDetail 
                task={taskToView}
                onClose={handleCloseTaskDetail}
                onEdit={handleEditFromDetail}
                onDelete={taskManager.deleteTask}
            />

            <AiAssistant
                context={appContextData}
                setView={setView}
            />
        </div>
    );
};

const ThemedAndLocalizedApp: React.FC = () => {
    // This component is now within AuthProvider's scope
    // so ThemeProvider and LanguageProvider can use useAuthContext
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
        </ThemeProvider>
    );
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ThemedAndLocalizedApp />
        </AuthProvider>
    );
};

export default App;