import React, { useState, useEffect } from 'react';
import { consumptionAPI } from '../../services/api';
import { Line } from 'react-chartjs-2';
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

const ConsumptionStats = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});

  // Fetch consumption statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await consumptionAPI.getStats({
        timeRange,
        groupBy: timeRange === 'day' ? 'hour' : 'day'
      });
      setStats(data);
      prepareChartData(data);
    } catch (error) {
      console.error('Error fetching consumption stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for the chart
  const prepareChartData = (statsData) => {
    if (!statsData || !statsData.consumptionByTime) return;

    const labels = statsData.consumptionByTime.map(item => {
      const date = new Date(item.timestamp);
      return timeRange === 'day' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    });

    const consumptionData = statsData.consumptionByTime.map(item => item.consumption);
    const costData = statsData.consumptionByTime.map(item => item.cost || 0);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Consumption (kWh)',
          data: consumptionData,
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Cost ($)',
          data: costData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y1',
        },
      ],
    });
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Energy Consumption & Cost',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (label.includes('Cost')) {
                label += new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(context.parsed.y);
              } else {
                label += `${context.parsed.y.toFixed(2)} kWh`;
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: timeRange === 'day' ? 'Time of Day' : 'Date',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Consumption (kWh)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Cost ($)',
        },
      },
    },
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Fetch data when component mounts or time range changes
  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  // Loading state
  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Consumption Statistics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Analyze your energy consumption patterns and costs over time.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {['day', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => handleTimeRangeChange(range)}
                className={`px-4 py-2 text-sm font-medium ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-200 ${
                  range === 'day' ? 'rounded-l-lg' : ''
                } ${
                  range === 'year' ? 'rounded-r-lg' : ''
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Consumption */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Consumption</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalConsumption?.toFixed(2) || '0.00'} kWh
                      </div>
                      {stats.consumptionChange && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stats.consumptionChange >= 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {stats.consumptionChange >= 0 ? (
                            <svg className="self-center flex-shrink-0 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="sr-only">
                            {stats.consumptionChange >= 0 ? 'Increased' : 'Decreased'} by
                          </span>
                          {Math.abs(stats.consumptionChange)}%
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Cost</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ${stats.totalCost?.toFixed(2) || '0.00'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Average Daily Consumption */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Daily</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.averageDailyConsumption?.toFixed(2) || '0.00'} kWh
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Peak Time */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Peak Time</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.peakTime || 'N/A'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        {chartData.labels && chartData.labels.length > 0 ? (
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No consumption data available for the selected time range.
          </div>
        )}
      </div>

      {/* Additional Stats */}
      {stats && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Most Used Device */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Most Used Device</h3>
              <div className="mt-4">
                {stats.mostUsedDevice ? (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6h2m7-6h2m4-2h2m0 6h-2m0 6h2m-8 0H6.5a1.5 1.5 0 01-1.5-1.5V6.5A1.5 1.5 0 016.5 5h11A1.5 1.5 0 0119 6.5V18a1.5 1.5 0 01-1.5 1.5H15z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{stats.mostUsedDevice.name}</p>
                      <p className="text-sm text-gray-500">{stats.mostUsedDevice.consumption.toFixed(2)} kWh ({stats.mostUsedDevice.percentage}%)</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No device data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Cost Breakdown</h3>
              <div className="mt-4 space-y-2">
                {stats.costBreakdown ? (
                  Object.entries(stats.costBreakdown).map(([category, amount]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">{category}</span>
                      <span className="text-sm font-medium text-gray-900">${amount.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No cost breakdown available</p>
                )}
              </div>
            </div>
          </div>

          {/* Energy Efficiency */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Energy Efficiency</h3>
              <div className="mt-4">
                {stats.efficiencyScore !== undefined ? (
                  <div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${stats.efficiencyScore}%` }}
                        ></div>
                      </div>
                      <span className="ml-4 text-sm font-medium text-gray-700">
                        {stats.efficiencyScore}/100
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {stats.efficiencyMessage || 'Your energy efficiency is good.'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No efficiency data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionStats;
