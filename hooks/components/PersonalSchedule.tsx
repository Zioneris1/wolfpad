import React, { useState, useEffect } from 'react';
import type { useScheduleManager } from '../hooks/useScheduleManager';
import { useTranslation } from '../hooks/useTranslation';
import DonutChart from './DonutChart';

interface PersonalScheduleProps {
    scheduleManager: ReturnType<typeof useScheduleManager>;
}

// Reusable component to display the content for a single day
const DayContent: React.FC<{
    dayName: string;
    dayIndex: number;
    blocks: ReturnType<typeof useScheduleManager>['blocks'];
    toggleBlockCompletion: (id: string) => void;
    deleteBlock: (id: string) => void;
    isToday: boolean;
}> = ({ dayName, dayIndex, blocks, toggleBlockCompletion, deleteBlock, isToday }) => {
    const { t } = useTranslation();
    const todayStr = new Date().toISOString().split('T')[0];
    // Fix: Changed dayOfWeek to day_of_week to match ScheduleBlock type.
    const dayBlocks = blocks.filter(b => b.day_of_week === dayIndex);
    // Fix: Changed lastCompleted to last_completed to match ScheduleBlock type.
    const completedCount = dayBlocks.filter(b => b.last_completed === todayStr).length;

    return (
        <div style={{background: 'var(--color-bg-panel)', borderRadius: '8px', border: `1px solid ${isToday ? 'var(--color-secondary-blue)' : 'var(--color-border)'}`}}>
             <h4 style={{ textAlign: 'center', padding: '0.75rem', margin: 0, borderBottom: '1px solid var(--color-border)' }}>{dayName}</h4>
             <div style={{ padding: '1rem', borderBottom: `1px solid var(--color-border)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <DonutChart
                    completed={completedCount}
                    total={dayBlocks.length}
                    size={70}
                    strokeWidth={9}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{t('scheduleView.dailyProgress')}</span>
            </div>
             <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '200px' }}>
                {dayBlocks.length > 0 ? dayBlocks.map(block => (
                    <div key={block.id} style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'var(--color-bg-dark)', 
                        padding: '0.75rem', 
                        borderRadius: '4px', 
                        // Fix: Changed lastCompleted to last_completed to match ScheduleBlock type.
                        borderLeft: `3px solid ${block.last_completed === todayStr ? 'var(--color-secondary-blue-glow)' : 'var(--color-border)'}`, 
                        // Fix: Changed lastCompleted to last_completed to match ScheduleBlock type.
                        opacity: block.last_completed === todayStr ? 0.7 : 1
                    }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <p style={{ margin: 0, fontWeight: 'bold' }}>{block.name}</p>
                          {/* Fix: Changed lastCompleted to last_completed to match ScheduleBlock type. */}
                          <input type="checkbox" checked={block.last_completed === todayStr} onChange={() => toggleBlockCompletion(block.id)} title="Mark as done for today" />
                        </div>
                        {/* Fix: Changed startTime and endTime to start_time and end_time to match ScheduleBlock type. */}
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{block.start_time} - {block.end_time}</p>
                        <button onClick={() => deleteBlock(block.id)} style={{
                            background:'transparent', 
                            border:'1px solid var(--color-border)', 
                            color:'var(--color-primary-red)', 
                            cursor:'pointer', 
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.8rem',
                            borderRadius: '4px',
                            alignSelf: 'flex-end',
                            marginTop: '0.5rem'
                        }}>
                            {t('common.delete')}
                        </button>
                    </div>
                )) : (
                    <p className="text-center text-sm p-4" style={{ color: 'var(--color-text-secondary)' }}>
                        No routines scheduled.
                    </p>
                )}
            </div>
        </div>
    );
};


const PersonalSchedule: React.FC<PersonalScheduleProps> = ({ scheduleManager }) => {
    const { t } = useTranslation();
    const { blocks, addBlock, deleteBlock, toggleBlockCompletion } = scheduleManager;
    const [name, setName] = useState('');
    const [day, setDay] = useState(new Date().getDay());
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const weekDays = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        // Fix: Changed property names to match expected type for addBlock.
        addBlock({ name, day_of_week: day, start_time: startTime, end_time: endTime });
        setName('');
    };

    const todayIndex = new Date().getDay();

    const formInputStyle: React.CSSProperties = {
      width: '100%',
      padding: '0.75rem',
      background: 'var(--color-bg-dark)',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-primary)',
      borderRadius: '4px'
    }

    const renderDesktopView = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', alignItems: 'start' }}>
            {weekDays.map((dayName, dayIndex) => (
                <DayContent
                    key={dayIndex}
                    dayName={dayName}
                    dayIndex={dayIndex}
                    blocks={blocks}
                    toggleBlockCompletion={toggleBlockCompletion}
                    deleteBlock={deleteBlock}
                    isToday={dayIndex === todayIndex}
                />
            ))}
            {blocks.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{t('scheduleView.noBlocks')}</p>}
        </div>
    );

    const renderMobileView = () => {
        const selectedDayName = weekDays[selectedDayIndex];
        return (
            <div>
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4">
                    <div className="flex space-x-2">
                        {weekDays.map((dayName, dayIndex) => (
                            <button
                                key={dayIndex}
                                onClick={() => setSelectedDayIndex(dayIndex)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
                                    selectedDayIndex === dayIndex
                                        ? 'bg-[var(--color-secondary-blue)] text-white'
                                        : 'bg-[var(--color-bg-panel)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                                }`}
                            >
                                {dayName.substring(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-4">
                     <DayContent
                        dayName={selectedDayName}
                        dayIndex={selectedDayIndex}
                        blocks={blocks}
                        toggleBlockCompletion={toggleBlockCompletion}
                        deleteBlock={deleteBlock}
                        isToday={selectedDayIndex === todayIndex}
                    />
                </div>
                 {blocks.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '2rem' }}>{t('scheduleView.noBlocks')}</p>}
            </div>
        );
    };

    return (
        <div style={{ padding: '1.5rem 0' }}>
            <h2 style={{ textShadow: `0 0 5px var(--color-secondary-blue)` }}>{t('scheduleView.weeklyRoutine')}</h2>

            <div style={{ background: 'var(--color-bg-panel)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0 }}>{t('scheduleView.addBlockTitle')}</h3>
                <form onSubmit={handleSubmit} className="schedule-form" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{flex: 2}}><label>Activity</label><input type="text" placeholder={t('scheduleView.activityNamePlaceholder')} value={name} onChange={e => setName(e.target.value)} required style={formInputStyle}/></div>
                    <div><label>Day</label><select value={day} onChange={e => setDay(Number(e.target.value))} style={formInputStyle}>
                        {weekDays.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select></div>
                    <div><label>{t('scheduleView.from')}</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required style={formInputStyle}/></div>
                    <div><label>{t('scheduleView.to')}</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required style={formInputStyle}/></div>
                    <button type="submit" style={{height: '45px', background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)'}}>{t('scheduleView.addBlock')}</button>
                </form>
            </div>

            {isMobile ? renderMobileView() : renderDesktopView()}

        </div>
    );
};

export default PersonalSchedule;