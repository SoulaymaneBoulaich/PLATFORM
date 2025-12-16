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
            <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse h-80 flex items-center justify-center">
                <div className="text-gray-400">Loading charts...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 rounded-lg p-6">
                {error}
            </div>
        );
    }

    if (!chartData) return null;

    // Process data for charts
    const viewsDates = chartData.views.map(item => new Date(item.date).toLocaleDateString());
    const viewsCounts = chartData.views.map(item => item.count);

    // If no data, show placeholder
    if (viewsDates.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Performance Analytics</h3>
                <p className="text-gray-500">Not enough data to display charts yet.</p>
            </div>
        );
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Property Views (Last 30 Days)',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };

    const data = {
        labels: viewsDates,
        datasets: [
            {
                label: 'Property Views',
                data: viewsCounts,
                borderColor: 'rgb(99, 102, 241)', // Indigo 500
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                tension: 0.4,
                fill: true
            }
        ],
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <Line options={options} data={data} />
            </div>

            {/* Additional Chart for Offers could go here */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-gray-700 font-bold mb-4">Offers Activity</h3>
                <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    {chartData.offers.length > 0 ? (
                        <div className="w-full h-full">
                            <Line
                                options={{
                                    ...options,
                                    plugins: { ...options.plugins, title: { text: 'Offers Received' } }
                                }}
                                data={{
                                    labels: chartData.offers.map(d => new Date(d.date).toLocaleDateString()),
                                    datasets: [{
                                        label: 'Offers',
                                        data: chartData.offers.map(d => d.count),
                                        borderColor: 'rgb(16, 185, 129)',
                                        backgroundColor: 'rgba(16, 185, 129, 0.5)',
                                        tension: 0.4
                                    }]
                                }}
                            />
                        </div>
                    ) : (
                        <p>No offers data yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
