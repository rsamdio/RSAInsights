'use client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function BarChart({ data, title, horizontal = false }) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                titleFont: { family: 'Inter', size: 14 },
                bodyFont: { family: 'Inter', size: 13 },
                cornerRadius: 8
            },
            datalabels: {
                display: function(context) {
                    return context.dataset.data[context.dataIndex] > 0; // Only show if > 0
                },
                color: 'rgba(255, 255, 255, 0.9)',
                align: 'top',
                anchor: 'start',
                offset: 4,
                font: {
                    family: 'Inter',
                    size: 12,
                    weight: 'bold'
                },
                formatter: (value, context) => {
                    const dataset = context.chart.data.datasets[context.datasetIndex];
                    const total = dataset.data.reduce((acc, curr) => acc + (curr || 0), 0);
                    if (total === 0) return '';
                    const percentage = Math.round((value / total) * 100);
                    return percentage + '%';
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true
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
