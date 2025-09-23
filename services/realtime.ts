import { supabase } from '../lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// This service connects to Supabase's real-time capabilities.
export const subscribe = <T extends { [key: string]: any }>(
    tableName: string,
    callback: (message: any) => void
) => {
    const channel = supabase.channel(`realtime:${tableName}`);

    const handleChanges = (payload: RealtimePostgresChangesPayload<T>) => {
        const typePrefix = tableName.toUpperCase().slice(0, -1); // e.g., TASK from tasks

        switch (payload.eventType) {
            case 'INSERT':
                callback({ type: `${typePrefix}_CREATED`, payload: payload.new });
                break;
            case 'UPDATE':
                callback({ type: `${typePrefix}_UPDATED`, payload: payload.new });
                break;
            case 'DELETE':
                callback({ type: `${typePrefix}_DELETED`, payload: { id: (payload.old as T).id } });
                break;
        }
    };

    channel
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, handleChanges)
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log(`Real-time subscription to "${tableName}" started.`);
            }
            if (status === 'CHANNEL_ERROR' || err) {
                console.error(`Error subscribing to realtime changes for "${tableName}":`, err);
            }
        });

    // Return an unsubscribe function
    return () => {
        console.log(`Unsubscribing from realtime changes for "${tableName}".`);
        supabase.removeChannel(channel);
    };
};
