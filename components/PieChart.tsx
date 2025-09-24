import React from 'react';
import type { Transaction } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface PieChartProps {
  transactions: Transaction[];
  currency: string;
}

const PieChart: React.FC<PieChartProps> = ({ transactions, currency }) => {
    const { t } = useTranslation();
    const expenseData = transactions
        .filter(t => t.amount < 0)
        // Fix: Correctly type the `reduce` operation's accumulator and initial value to
        // ensure `expenseData` is properly typed as `Record<string, number>`.
        // This resolves downstream errors where values were being inferred as `unknown`.
        .reduce((acc: Record<string, number>, t) => {
            const category = t.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + Math.abs(t.amount);
            return acc;
        }, {} as Record<string, number>);

    const totalExpenses = Object.values(expenseData).reduce((sum, amount) => sum + amount, 0);
    
    const formatCurrency = (value: number) => {
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency }).format(value);
        } catch (e) {
            return `${currency} ${value.toFixed(2)}`; // Fallback
        }
    };

    if (totalExpenses === 0) {
        return (
            <div>
                <h3 style={{ marginTop: 0 }}>{t('moneyView.breakdown')}</h3>
                <p style={{ color: 'var(--color-text-secondary)'}}>{t('moneyView.noExpenseData', { currency })}</p>
            </div>
        );
    }
    
    return (
        <div>
            <h3 style={{marginTop: 0}}>{t('moneyView.breakdown')} ({currency})</h3>
            {Object.entries(expenseData)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                <div key={category} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <div>
                        <span style={{color: 'var(--color-text-primary)'}}>{category}</span>
                        <div style={{ background: 'var(--color-bg-dark)', height: '8px', borderRadius: '4px', marginTop: '0.25rem' }}>
                            <div style={{
                                width: `${(amount / totalExpenses) * 100}%`,
                                height: '100%',
                                background: 'var(--color-secondary-blue)',
                                borderRadius: '4px'
                            }}></div>
                        </div>
                    </div>
                    <span style={{color: 'var(--color-text-primary)', marginLeft: '1rem', minWidth: '70px', textAlign: 'right'}}>{formatCurrency(amount)}</span>
                </div>
            ))}
        </div>
    );
};

export default PieChart;