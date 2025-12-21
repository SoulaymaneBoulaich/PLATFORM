import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AnalyticsCharts = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        try {
            const response = await api.get('/dashboard/seller/charts');
            setChartData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch chart data:', err);
            setError('Failed to load analytics data');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="glass-card p-6 animate-pulse h-80 flex items-center justify-center">
                <div className="text-gray-400">Loading charts...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-6 backdrop-blur-sm">
                {error}
            </div>
        );
    }

    if (!chartData) return null;

    // Process data for charts
    const viewsDates = chartData.views.map(item => new Date(item.date).toLocaleDateString());
    const viewsCounts = chartData.views.map(item => item.count);

    if (viewsDates.length === 0) {
        return (
            <div className="glass-card p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Performance Analytics</h3>
                <p className="text-gray-500 dark:text-gray-400">Not enough data to display charts yet.</p>
            </div>
        );
    }

    const commonOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    font: {
                        family: 'Inter, sans-serif'
                    }
                }
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    precision: 0
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    const viewsData = {
        labels: viewsDates,
        datasets: [
            {
                label: 'Property Views',
                data: viewsCounts,
                borderColor: '#14b8a6', // Teal 500
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(20, 184, 166, 0.5)');
                    gradient.addColorStop(1, 'rgba(20, 184, 166, 0.0)');
                    return gradient;
                },
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#14b8a6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ],
    };

    const offersData = {
        labels: chartData.offers.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
            label: 'Offers Received',
            data: chartData.offers.map(d => d.count),
            borderColor: '#a855f7', // Purple 500
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
                gradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
                return gradient;
            },
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#a855f7',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="glass-card p-6 shadow-floating hover:shadow-premium transition-shadow duration-300">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-teal-500 rounded-full"></span>
                    Views Overview
                </h3>
                <div className="h-72">
                    <Line options={commonOptions} data={viewsData} />
                </div>
            </div>

            <div className="glass-card p-6 shadow-floating hover:shadow-premium transition-shadow duration-300">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                    Offers Activity
                </h3>
                <div className="h-72 flex items-center justify-center">
                    {chartData.offers.length > 0 ? (
                        <div className="w-full h-full">
                            <Line options={commonOptions} data={offersData} />
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            {/* Generic placeholder visual */}
                            <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p>No offers activity recorded yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
