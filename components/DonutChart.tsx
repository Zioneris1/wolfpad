import React from 'react';

interface DonutChartProps {
    completed: number;
    total: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ completed, total, size = 100, strokeWidth = 12, color = 'var(--color-secondary-blue-glow)' }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const textToShow = total === 0 ? "N/A" : `${Math.round(percentage)}%`;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display: 'block', margin: '0 auto'}}>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="var(--color-border)" // background circle
                strokeWidth={strokeWidth}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={color} // progress circle
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
            <text x="50%" y="50%" 
                textAnchor="middle" 
                dy=".3em" 
                fontSize={size * 0.22} 
                fill="var(--color-text-primary)"
                fontFamily="var(--font-body)"
                style={{textShadow: `0 0 5px ${color}`}}
            >
                {textToShow}
            </text>
        </svg>
    );
};

export default DonutChart;