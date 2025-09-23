import { useCallback } from 'react';
import { useTranslation } from './useTranslation';

const APP_DATA_KEYS = [
    'tasks', 'goals', 'scheduleBlocks', 'transactions_v2',
    'transaction_categories', 'journalEntries', 'dev_plans', 'wolfpad_theme',
    'wolfpad_language', 'selectedCurrency'
];

export const useDataManager = () => {
    const { t } = useTranslation();

    const exportData = useCallback(() => {
        try {
            const backup: Record<string, any> = {};
            
            APP_DATA_KEYS.forEach(key => {
                const data = localStorage.getItem(key);
                if (data !== null) {
                    try {
                        // Assume it's JSON, parse it for the backup file
                        backup[key] = JSON.parse(data);
                    } catch (e) {
                        // If parsing fails, it's a plain string. Add it as-is.
                        backup[key] = data;
                    }
                }
            });

            const jsonString = JSON.stringify(backup, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.download = `wolfpad_backup_${date}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export data", error);
            alert("An error occurred during export.");
        }
    }, []);

    const importData = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonString = event.target?.result as string;
                const backup = JSON.parse(jsonString);

                // Simple validation to ensure it's a WolfPad backup
                if (!backup.tasks && !backup.goals && !backup.wolfpad_theme) {
                    throw new Error("Invalid or unrecognized backup file structure.");
                }

                if (window.confirm(t('settingsView.importWarning'))) {
                    Object.keys(backup).forEach(key => {
                        // Ensure the key is one we expect to prevent malicious data injection
                        if (APP_DATA_KEYS.includes(key)) {
                            const value = backup[key];
                            const valueToStore = typeof value === 'object' ? JSON.stringify(value) : String(value);
                            localStorage.setItem(key, valueToStore);
                        }
                    });
                    alert(t('settingsView.importSuccess'));
                    window.location.reload();
                }

            } catch (error) {
                console.error("Failed to import data", error);
                alert(t('settingsView.importError') + ' ' + (error instanceof Error ? error.message : ''));
            }
        };
        reader.readAsText(file);
    }, [t]);

    return { exportData, importData };
};
