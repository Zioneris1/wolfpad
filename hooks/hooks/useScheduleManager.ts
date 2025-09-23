import { useState, useEffect, useCallback } from 'react';
import type { ScheduleBlock } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { scheduleApi } from '../services/api';
import { subscribe } from '../services/realtime';

export const useScheduleManager = () => {
    const { user } = useAuthContext();
    const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            scheduleApi.getBlocks(user.id).then(initialBlocks => {
                setBlocks(initialBlocks);
            }).catch(error => {
                console.error("Failed to fetch schedule blocks", error);
            }).finally(() => {
                setLoading(false);
            });

            const unsubscribe = subscribe('schedule_blocks', message => {
                switch (message.type) {
                    case 'SCHEDULE_BLOCK_CREATED':
                        setBlocks(prev => [...prev, message.payload].sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)));
                        break;
                    case 'SCHEDULE_BLOCK_UPDATED':
                        setBlocks(prev => prev.map(b => b.id === message.payload.id ? message.payload : b));
                        break;
                    case 'SCHEDULE_BLOCK_DELETED':
                        setBlocks(prev => prev.filter(b => b.id !== message.payload.id));
                        break;
                }
            });

            return () => unsubscribe();
        } else {
            setBlocks([]);
            setLoading(false);
        }
    }, [user]);

    const addBlock = useCallback(async (blockData: Omit<ScheduleBlock, 'id' | 'last_completed' | 'user_id'>) => {
        if (!user) return;
        const newBlock = await scheduleApi.addBlock(blockData, user.id);
        setBlocks(prevBlocks => [...prevBlocks, newBlock].sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)));
    }, [user]);

    const deleteBlock = useCallback(async (id: string) => {
        if (!user) return;
        await scheduleApi.deleteBlock(id, user.id);
        setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
    }, [user]);

    const toggleBlockCompletion = useCallback(async (id: string) => {
        if (!user) return;
        const block = blocks.find(b => b.id === id);
        if (!block) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const isCompletedToday = block.last_completed === todayStr;
        const updatedBlock = await scheduleApi.updateBlock(id, { last_completed: isCompletedToday ? undefined : todayStr }, user.id);
        
        setBlocks(prevBlocks =>
            prevBlocks.map(b => (b.id === id ? updatedBlock : b))
        );
    }, [blocks, user]);

    return { blocks, loading, addBlock, deleteBlock, toggleBlockCompletion };
};
