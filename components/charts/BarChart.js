'use client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data, title }) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
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
        }
    };

    return (
        <div className="chart-container card">
            <h2>{title}</h2>
            <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}
