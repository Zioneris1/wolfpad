import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface BulkActionBarProps {
    count: number;
    onComplete: () => void;
    onDelete: () => void;
    onClear: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({ count, onComplete, onDelete, onClear }) => {
    const { t } = useTranslation();
    
    const selectedText = count === 1 
        ? t('bulkActionBar.selected', { count }) 
        : t('bulkActionBar.selected_plural', { count });

    return (
        <div className="bulk-action-bar" style={{ 
            position: 'fixed', 
            bottom: '2rem', 
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'auto',
            minWidth: '400px',
            padding: '1rem 1.5rem', 
            backgroundColor: 'rgba(26, 29, 36, 0.9)',
            border: '1px solid var(--color-border)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            zIndex: 50,
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
            <span style={{ color: 'var(--color-secondary-blue-glow)', textShadow: '0 0 5px var(--color-secondary-blue)' }}>
                {selectedText}
            </span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={onComplete} style={{ background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)', border: 'none' }}>{t('common.complete')}</button>
                <button onClick={onDelete} style={{ background: 'var(--color-primary-red)', color: 'var(--color-text-on-accent)', border: 'none' }}>{t('common.delete')}</button>
                <button onClick={onClear} style={{ background: 'transparent', border: '1px solid var(--color-border)' }}>{t('bulkActionBar.clear')}</button>
            </div>
        </div>
    );
};

export default BulkActionBar;