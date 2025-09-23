import React, { useState } from 'react';
import type { useMoneyManager } from '../hooks/useMoneyManager';
import PieChart from './PieChart';
import { useTranslation } from '../hooks/useTranslation';

interface MoneyViewProps {
    moneyManager: ReturnType<typeof useMoneyManager>;
}

const currencies = [
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'KRW', name: 'South Korean Won' },
    { code: 'MXN', name: 'Mexican Peso' },
    { code: 'NOK', name: 'Norwegian Krone' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'RUB', name: 'Russian Ruble' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'VND', name: 'Vietnamese Dong' },
    { code: 'ZAR', name: 'South African Rand' }
].sort((a, b) => a.code.localeCompare(b.code));


const MoneyView: React.FC<MoneyViewProps> = ({ moneyManager }) => {
    const { t: translate } = useTranslation();
    const { 
        transactionsForDisplay,
        addTransaction,
        deleteTransaction,
        balance,
        totalIncome,
        totalExpenses,
        categories,
        selectedCurrency,
        setSelectedCurrency
    } = moneyManager;

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(categories.find(c => c.type === 'expense')?.name || '');
    const [type, setType] = useState<'income' | 'expense'>('expense');

    const formatCurrency = (value: number) => {
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency: selectedCurrency, minimumFractionDigits: 2 }).format(value);
        } catch (e) {
            return `${selectedCurrency} ${value.toFixed(2)}`; // Fallback
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!description || isNaN(numAmount)) return;

        addTransaction({
            date: new Date().toISOString().split('T')[0],
            description,
            amount: type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount),
            category,
        });

        setDescription('');
        setAmount('');
    };

    const availableCategories = categories.filter(c => c.type === type);
    
    // Set default category when type changes
    React.useEffect(() => {
        if (availableCategories.length > 0) {
           setCategory(availableCategories[0]?.name || '');
        }
    }, [type, categories]);

    const formInputStyle: React.CSSProperties = {
      width: '100%',
      padding: '0.75rem',
      background: 'var(--color-bg-dark)',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-primary)',
      borderRadius: '4px'
    }

    return (
        <div style={{ padding: '1.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <h2 style={{ textShadow: `0 0 5px var(--color-secondary-blue)` }}>{translate('moneyView.title')}</h2>
                 <div>
                    <label style={{ marginRight: '0.5rem'}}>{translate('moneyView.currency')}</label>
                    <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} style={{...formInputStyle, width: 'auto'}}>
                        {currencies.map(c => (
                            <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                        ))}
                    </select>
                 </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{background: 'var(--color-bg-panel)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center'}}>
                    <p style={{color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', margin: '0 0 0.5rem 0'}}>{translate('moneyView.totalIncome')}</p>
                    <p style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-secondary-blue-glow)', margin: 0}}>{formatCurrency(totalIncome)}</p>
                </div>
                <div style={{background: 'var(--color-bg-panel)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center'}}>
                    <p style={{color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', margin: '0 0 0.5rem 0'}}>{translate('moneyView.totalExpenses')}</p>
                    <p style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary-red-glow)', margin: 0}}>{formatCurrency(totalExpenses)}</p>
                </div>
                <div style={{background: 'var(--color-bg-panel)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center'}}>
                    <p style={{color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', margin: '0 0 0.5rem 0'}}>{translate('moneyView.netBalance')}</p>
                    <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>{formatCurrency(balance)}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }} className="responsive-money-grid">
                <div>
                    <div style={{ background: 'var(--color-bg-panel)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ marginTop: 0 }}>{translate('moneyView.addTransaction')}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{display:'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                                <button type="button" onClick={() => setType('expense')} style={{flex: 1, background: type === 'expense' ? 'var(--color-primary-red)' : 'var(--color-bg-dark)', color: type === 'expense' ? 'var(--color-text-on-accent)' : 'var(--color-text-primary)', border: 'none', padding: '0.6rem', cursor: 'pointer'}}>{translate('moneyView.expense')}</button>
                                <button type="button" onClick={() => setType('income')} style={{flex: 1, background: type === 'income' ? 'var(--color-secondary-blue)' : 'var(--color-bg-dark)', color: type === 'income' ? 'var(--color-text-on-accent)' : 'var(--color-text-primary)', border: 'none', padding: '0.6rem', cursor: 'pointer'}}>{translate('moneyView.income')}</button>
                            </div>
                            <input type="text" placeholder={translate('moneyView.description')} value={description} onChange={e => setDescription(e.target.value)} required style={formInputStyle} />
                            <input type="number" step="0.01" placeholder={translate('moneyView.amount')} value={amount} onChange={e => setAmount(e.target.value)} required style={{...formInputStyle, margin: '0.75rem 0'}} />
                            <select value={category} onChange={e => setCategory(e.target.value)} required style={formInputStyle} >
                                {availableCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                            </select>
                            <button type="submit" style={{width: '100%', marginTop: '1rem', background: 'var(--color-secondary-blue)', color: 'var(--color-text-on-accent)', border: 'none', padding: '0.75rem'}}>{translate('common.add')}</button>
                        </form>
                    </div>
                     <div style={{ background: 'var(--color-bg-panel)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', marginTop: '1.5rem' }}>
                        <PieChart transactions={transactionsForDisplay} currency={selectedCurrency} />
                    </div>
                </div>
                <div style={{ background: 'var(--color-bg-panel)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ marginTop: 0 }}>{translate('moneyView.history')}</h3>
                     <div style={{maxHeight: '500px', overflowY: 'auto'}}>
                        {transactionsForDisplay.map(t => (
                            <div key={t.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)'}}>
                                <div>
                                    <p style={{margin: 0, fontWeight: 'bold'}}>{t.description}</p>
                                    <p style={{margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)'}}>{t.date} - {t.category}</p>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                    <span style={{color: t.amount < 0 ? 'var(--color-primary-red)' : 'var(--color-secondary-blue)'}}>{formatCurrency(t.amount)}</span>
                                    <button 
                                        onClick={() => deleteTransaction(t.id)} 
                                        title={translate('common.delete')}
                                        style={{
                                            background:'transparent', 
                                            border:'none', 
                                            color:'var(--color-primary-red)', 
                                            cursor:'pointer',
                                            padding: '0.25rem 0.75rem',
                                            fontSize: '1.5rem',
                                            lineHeight: 1,
                                            borderRadius: '4px',
                                        }}>&times;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoneyView;