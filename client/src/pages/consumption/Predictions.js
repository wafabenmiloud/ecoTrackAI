import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format, addDays, parseISO } from 'date-fns';

// Register ChartJS components
Chart.register(...registerables);

const Predictions = () => {
  // State
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  // Mock data generation
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setData(generateMockData(timeRange));
        setLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, [timeRange]);

  // Generate mock data
  const generateMockData = (range) => {
    const points = range === 'day' ? 24 : range === 'week' ? 7 : 30;
    const labels = [];
    const predicted = [];
    const historical = [];
    
    for (let i = 0; i < points; i++) {
      labels.push(range === 'day' ? `${i}:00` : format(addDays(new Date(), i), 'MMM d'));
      predicted.push(50 + Math.sin(i) * 20 + Math.random() * 10);
      historical.push(45 + Math.sin(i) * 15 + Math.random() * 8);
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Predicted',
          data: predicted,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Historical Average',
          data: historical,
          borderColor: 'rgb(16, 185, 129)',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Energy Consumption Forecast (${timeRange === 'day' ? '24 Hours' : timeRange === 'week' ? '7 Days' : '30 Days'})`,
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Consumption (kWh)'
        }
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Energy Predictions</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="day">24 Hours</option>
          <option value="week">7 Days</option>
          <option value="month">30 Days</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="h-96">
          <Line data={data} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Predicted Usage</h3>
          <div className="text-3xl font-bold text-blue-600">
            {data.datasets[0].data.reduce((a, b) => a + b, 0).toFixed(0)} kWh
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Estimated for the selected period
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Cost Estimate</h3>
          <div className="text-3xl font-bold text-green-600">
            ${(data.datasets[0].data.reduce((a, b) => a + b, 0) * 0.15).toFixed(2)}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Based on current rates
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Peak Time</h3>
          <div className="text-3xl font-bold text-orange-600">
            {(() => {
              const maxIndex = data.datasets[0].data.indexOf(Math.max(...data.datasets[0].data));
              return data.labels[maxIndex];
            })()}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Highest consumption period
          </p>
        </div>
      </div>
    </div>
  );
};

export default Predictions;
