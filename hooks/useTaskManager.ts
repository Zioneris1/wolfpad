import { useState, useEffect, useCallback, useRef } from 'react';
import type { Task } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { taskApi } from '../services/api';
import { subscribe } from '../services/realtime';

export const useTaskManager = () => {
    const { user } = useAuthContext();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const trackingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initial data fetch and real-time subscription
    useEffect(() => {
        if (user) {
            setLoading(true);
            // Fix: Pass user.id to getTasks API call.
            taskApi.getTasks(user.id).then(initialTasks => {
                setTasks(initialTasks);
            }).catch(error => {
                console.error("Failed to fetch tasks", error);
            }).finally(() => {
                setLoading(false);
            });

            // Fix: Pass table name 'tasks' to subscribe function.
            const unsubscribe = subscribe('tasks', (message: any) => {
                switch (message.type) {
                    case 'TASK_CREATED':
                        setTasks(prev => [message.payload, ...prev]);
                        break;
                    case 'TASK_UPDATED':
                        setTasks(prev => prev.map(t => t.id === message.payload.id ? message.payload : t));
                        break;
                    case 'TASK_DELETED':
                        setTasks(prev => prev.filter(t => t.id !== message.payload.id));
                        break;
                    case 'TASKS_BULK_UPDATED': {
                        const updatedMap = new Map(message.payload.map((t: Task) => [t.id, t]));
                        setTasks(prev => prev.map(t => updatedMap.get(t.id) || t));
                        break;
                    }
                    case 'TASKS_BULK_DELETED':
                        setTasks(prev => prev.filter(t => !message.payload.ids.includes(t.id)));
                        break;
                }
            });

            return () => unsubscribe();

        } else {
            // If user logs out, clear tasks
            setTasks([]);
            setLoading(false);
        }
    }, [user]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (trackingInterval.current) {
                clearInterval(trackingInterval.current);
            }
        };
    }, []);

    const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'completed_at' | 'time_spent' | 'is_tracking' | 'promoted_to_dashboard' | 'user_id'>) => {
        if (!user) return;
        const taskPayload = {
            ...taskData,
            completed: false,
            // Fix: Changed 'createdAt' to 'created_at' to match the Task type.
            created_at: new Date().toISOString(),
            // Fix: Changed 'timeSpent' to 'time_spent' to match the Task type.
            time_spent: 0,
            // Fix: Changed 'isTracking' to 'is_tracking' to match the Task type.
            is_tracking: false,
            tags: taskData.tags || [],
            // Fix: Changed 'promotedToDashboard' to 'promoted_to_dashboard' to match the Task type.
            promoted_to_dashboard: true,
        };
        // Fix: Pass user.id to createTask API call.
        const newTask = await taskApi.createTask(taskPayload, user.id);
        setTasks(prevTasks => [newTask, ...prevTasks]);
    }, [user]);
    
    const addBulkTasks = useCallback(async (tasksData: Omit<Task, 'id' | 'completed' | 'created_at' | 'completed_at' | 'tags' | 'time_spent' | 'is_tracking' | 'promoted_to_dashboard' | 'user_id'>[]) => {
        if (!user) return;
        const newTasks: Task[] = [];
        for (const taskData of tasksData) {
            const taskPayload = {
                ...taskData,
                completed: false,
                // Fix: Changed 'createdAt' to 'created_at' to match the Task type.
                created_at: new Date().toISOString(),
                // Fix: Changed 'timeSpent' to 'time_spent' to match the Task type.
                time_spent: 0,
                // Fix: Changed 'isTracking' to 'is_tracking' to match the Task type.
                is_tracking: false,
                tags: [],
                // Fix: Changed 'promotedToDashboard' to 'promoted_to_dashboard' to match the Task type.
                promoted_to_dashboard: false,
            };
            // Fix: Pass user.id to createTask API call.
            const createdTask = await taskApi.createTask(taskPayload, user.id);
            newTasks.push(createdTask);
        }
        setTasks(prevTasks => [...newTasks, ...prevTasks]);
    }, [user]);

    const updateTask = useCallback(async (id: string, updatedData: Partial<Omit<Task, 'id'>>) => {
        if (!user) return;
        // Fix: Pass user.id to updateTask API call.
        const updatedTask = await taskApi.updateTask(id, updatedData, user.id);
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? updatedTask : task
            )
        );
    }, [user]);
    
    const promoteTask = useCallback((id: string) => {
        // Fix: Changed 'promotedToDashboard' to 'promoted_to_dashboard' to match the Task type.
        updateTask(id, { promoted_to_dashboard: true });
    }, [updateTask]);

    const deleteTask = useCallback(async (id: string) => {
        if (!user) return;
        // Fix: Pass user.id to deleteTask API call.
        await taskApi.deleteTask(id, user.id);
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }, [user]);

    const deleteMultipleTasks = useCallback(async (ids: string[]) => {
        if (!user) return;
        // Fix: Pass user.id to deleteMultipleTasks API call.
        await taskApi.deleteMultipleTasks(ids, user.id);
        setTasks(prevTasks => prevTasks.filter(task => !ids.includes(task.id)));
    }, [user]);

    const toggleTaskComplete = useCallback(async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        
        const isNowComplete = !task.completed;
        const updates = {
            completed: isNowComplete,
            // Fix: Changed 'completedAt' to 'completed_at' to match the Task type.
            completed_at: isNowComplete ? new Date().toISOString() : undefined,
            // Fix: Changed 'isTracking' to 'is_tracking' to match the Task type.
            is_tracking: false,
        };
        await updateTask(id, updates);
    }, [tasks, updateTask]);
    
    const completeMultipleTasks = useCallback(async (ids: string[]) => {
        if (!user) return;
        const now = new Date().toISOString();
        const updates = ids.map(id => {
            const task = tasks.find(t => t.id === id);
            return {
                id,
                data: {
                    completed: true,
                    // Fix: Changed 'completedAt' to 'completed_at' to match the Task type.
                    completed_at: task?.completed_at || now,
                    // Fix: Changed 'isTracking' to 'is_tracking' to match the Task type.
                    is_tracking: false,
                }
            };
        });
        // Fix: Pass user.id to updateMultipleTasks API call.
        const updatedTasks = await taskApi.updateMultipleTasks(updates, user.id);
        const updatedTasksMap = new Map(updatedTasks.map(t => [t.id, t]));
        setTasks(prevTasks =>
            prevTasks.map(task => updatedTasksMap.get(task.id) || task)
        );
    }, [tasks, user]);

    const startTracking = useCallback((id: string) => {
        if (trackingInterval.current) {
            clearInterval(trackingInterval.current);
        }
        
        setTasks(prev => prev.map(t => ({
            ...t,
            is_tracking: t.id === id,
            tracking_start_time: t.id === id ? Date.now() : t.tracking_start_time,
        })));
        
        trackingInterval.current = setInterval(() => {
            setTasks(prevTasks => 
                prevTasks.map(task => {
                    if (task.is_tracking && task.tracking_start_time) {
                        const now = Date.now();
                        const elapsedSeconds = (now - task.tracking_start_time) / 1000;
                        return { 
                            ...task, 
                            time_spent: task.time_spent + elapsedSeconds,
                            tracking_start_time: now
                        };
                    }
                    return task;
                })
            );
        }, 1000);
    }, []);

    const stopTracking = useCallback(async (id: string) => {
        if (trackingInterval.current) {
            clearInterval(trackingInterval.current);
            trackingInterval.current = null;
        }
        
        const taskToStop = tasks.find(t => t.id === id);

        if (taskToStop && taskToStop.is_tracking && taskToStop.tracking_start_time) {
            const elapsedSeconds = (Date.now() - taskToStop.tracking_start_time) / 1000;
            const finalTimeSpent = taskToStop.time_spent + elapsedSeconds;
            
            await updateTask(id, { 
                is_tracking: false, 
                time_spent: finalTimeSpent,
                tracking_start_time: undefined 
            });
        } else {
             tasks.forEach(t => {
                if (t.is_tracking) {
                    updateTask(t.id, { is_tracking: false });
                }
            });
        }
    }, [tasks, updateTask]);

    return { 
        tasks,
        loading,
        addTask, 
        addBulkTasks,
        updateTask, 
        promoteTask,
        deleteTask, 
        deleteMultipleTasks,
        toggleTaskComplete, 
        completeMultipleTasks,
        startTracking,
        stopTracking
    };
};