'use client';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ data, title, onElementClick }) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 20,
                    font: { family: 'Inter', size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                titleFont: { family: 'Inter', size: 14 },
                bodyFont: { family: 'Inter', size: 13 },
                cornerRadius: 8
            }
        },
        onClick: (event, elements) => {
            if (elements.length > 0 && onElementClick) {
                const index = elements[0].index;
                onElementClick(data.labels[index]);
            }
        },
        cutout: '70%',
    };

    return (
        <div className="chart-container card">
            <h2>{title}</h2>
            <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                <Doughnut data={data} options={options} />
            </div>
        </div>
    );
}
