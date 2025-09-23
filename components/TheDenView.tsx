import React, { useState, useMemo, useEffect } from 'react';
import type { useJournalManager } from '../hooks/useJournalManager';
import type { JournalEntry } from '../types';
import { useTranslation } from '../hooks/useTranslation';

// Helper to format date for grouping and display
const formatDateForDisplay = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
};
const formatDateKey = (isoString: string) => isoString.split('T')[0];

const JournalEntryItem: React.FC<{
    entry: JournalEntry;
    onUpdate: (id: string, content: string) => void;
    onDelete: (id: string) => void;
}> = ({ entry, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(entry.content);
    const [formattedTime, setFormattedTime] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        setFormattedTime(new Date(entry.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
    }, [entry.created_at]);

    const handleSave = () => {
        onUpdate(entry.id, editText);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditText(entry.content);
        setIsEditing(false);
    };

    return (
        <div className="bg-[var(--color-bg-dark)] p-4 rounded-lg border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-2">
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{formattedTime}</p>
                {!isEditing && (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(true)} className="text-xs font-semibold" style={{ color: 'var(--color-secondary-blue)' }}>{t('common.edit')}</button>
                        <button onClick={() => onDelete(entry.id)} className="text-xs font-semibold" style={{ color: 'var(--color-primary-red)' }}>{t('common.delete')}</button>
                    </div>
                )}
            </div>
            {isEditing ? (
                <>
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 rounded-md bg-[var(--color-bg-main)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                        style={{ minHeight: '120px', fontFamily: 'Courier New, monospace' }}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={handleCancel} style={{ background: 'transparent', border: '1px solid var(--color-border)' }}>{t('common.cancel')}</button>
                        <button onClick={handleSave} style={{ background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)' }}>{t('common.save')}</button>
                    </div>
                </>
            ) : (
                <p className="whitespace-pre-wrap" style={{ fontFamily: 'Courier New, monospace', color: 'var(--color-text-secondary)' }}>{entry.content}</p>
            )}
        </div>
    );
};

interface TheDenViewProps {
    journalManager: ReturnType<typeof useJournalManager>;
}

const DateHeader: React.FC<{ dateString: string }> = ({ dateString }) => {
    const [formattedDate, setFormattedDate] = useState('');
    useEffect(() => {
        setFormattedDate(formatDateForDisplay(dateString));
    }, [dateString]);
    return (
        <h4 className="font-semibold pb-2 mb-4 border-b border-dashed" style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}>
            {formattedDate}
        </h4>
    );
};


const TheDenView: React.FC<TheDenViewProps> = ({ journalManager }) => {
    const { t } = useTranslation();
    const [newEntryContent, setNewEntryContent] = useState('');
    const [formattedToday, setFormattedToday] = useState('');

    useEffect(() => {
        setFormattedToday(formatDateForDisplay(new Date().toISOString()));
    }, []);

    const handleSaveNewEntry = () => {
        journalManager.addEntry(newEntryContent);
        setNewEntryContent('');
    };

    const groupedEntries = useMemo(() => {
        // Fix: Explicitly type the accumulator of the reduce function using a generic to ensure type safety.
        return journalManager.entries.reduce((acc: Record<string, JournalEntry[]>, entry) => {
            const dateKey = formatDateKey(entry.created_at);
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(entry);
            return acc;
        }, {});
    }, [journalManager.entries]);
    
    return (
        <div className="py-2 md:py-6">
            <h2 className="text-3xl font-bold tracking-tight mb-6" style={{ textShadow: `0 0 5px var(--color-secondary-blue)` }}>
                {t('header.theDen')}
            </h2>

            {/* Today's Entry Form */}
            <div className="mb-8 p-6 rounded-xl shadow-lg" style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)' }}>
                <h3 className="font-bold text-lg mb-1">{t('theDen.todaysEntry')}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    {formattedToday}
                </p>
                <textarea
                    value={newEntryContent}
                    onChange={(e) => setNewEntryContent(e.target.value)}
                    placeholder={t('theDen.placeholder')}
                    className="w-full p-3 rounded-md bg-[var(--color-bg-dark)] border border-[var(--color-border)] text-[var(--color-text-primary)] transition focus:border-[var(--color-secondary-blue)] focus:ring-1 focus:ring-[var(--color-secondary-blue)]"
                    style={{ minHeight: '150px', fontFamily: 'Courier New, monospace' }}
                />
                <div className="flex justify-end mt-4">
                    <button 
                        onClick={handleSaveNewEntry}
                        disabled={!newEntryContent.trim()}
                        className="font-semibold px-6 py-2 rounded-lg transition-colors"
                        style={{ background: 'var(--color-primary-red)', color: 'var(--color-text-on-accent)' }}
                    >
                        {t('theDen.saveEntry')}
                    </button>
                </div>
            </div>

            {/* Journal Archive */}
            <div>
                <h3 className="text-2xl font-bold mb-4">{t('theDen.archive')}</h3>
                <div className="space-y-8">
                    {Object.keys(groupedEntries).length > 0 ? (
                        // Fix: Use Object.entries for cleaner mapping over grouped data. This also helps with type safety.
                        Object.entries(groupedEntries).map(([date, entriesOnDate]) => {
                            return (
                                <div key={date}>
                                    <DateHeader dateString={date} />
                                    <div className="space-y-4">
                                        {entriesOnDate.map(entry => (
                                            <JournalEntryItem 
                                                key={entry.id}
                                                entry={entry}
                                                onUpdate={journalManager.updateEntry}
                                                onDelete={journalManager.deleteEntry}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                         <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-dark)'}}>
                            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)'}}>{t('theDen.noEntries')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TheDenView;