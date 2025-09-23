import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import Logo from './Logo';

interface SignUpViewProps {
    onSwitchToLogin: () => void;
}

const SignUpView: React.FC<SignUpViewProps> = ({ onSwitchToLogin }) => {
    const { signup } = useAuthContext();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const success = await signup(email, password);
            if (!success) {
                setError('Could not create account. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'var(--color-bg-dark)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)',
        borderRadius: '4px',
        fontSize: '1rem'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg-main)', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '400px', background: 'var(--color-bg-panel)', padding: '2.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                 <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Logo className="desktop-sidebar-logo" />
                    <h2 style={{ color: 'var(--color-text-primary)', margin: '0.5rem 0 0.25rem' }}>{t('auth.signupTitle')}</h2>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.9rem' }}>{t('auth.signupSubtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder={t('auth.email')}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        placeholder={t('auth.password')}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        placeholder={t('auth.confirmPassword')}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    {error && <p style={{ color: 'var(--color-primary-red)', margin: 0, textAlign: 'center' }}>{error}</p>}
                    <button type="submit" disabled={isLoading} style={{ background: 'var(--color-primary-red)', color: 'var(--color-text-on-accent)', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}>
                        {isLoading ? t('common.loading') : t('auth.signupButton')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{t('auth.alreadyHaveAccount')} </span>
                    <button onClick={onSwitchToLogin} style={{ color: 'var(--color-secondary-blue)', fontWeight: 'bold' }}>
                        {t('auth.login')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUpView;