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
  Filler,
  Annotation
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

const AnomalyDetection = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [chartData, setChartData] = useState({});
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'unresolved',
    deviceId: 'all',
  });

  // Fetch anomalies data
  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const { data } = await consumptionAPI.getAnomalies({
        ...filters,
        timeRange,
      });
      setAnomalies(data.anomalies || []);
      
      // If there's a selected anomaly and it's still in the new data, keep it selected
      if (selectedAnomaly && data.anomalies.some(a => a.id === selectedAnomaly.id)) {
        setSelectedAnomaly(data.anomalies.find(a => a.id === selectedAnomaly.id));
      } else if (data.anomalies.length > 0) {
        // Select the first anomaly by default if none is selected
        setSelectedAnomaly(data.anomalies[0]);
      } else {
        setSelectedAnomaly(null);
      }
      
      prepareChartData(data.chartData || {});
    } catch (error) {
      console.error('Error fetching anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for the chart
  const prepareChartData = (chartData) => {
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
      setChartData({});
      return;
    }

    const chartConfig = {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Normal Pattern',
          data: chartData.normalPattern,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0.3,
          fill: false,
        },
        {
          label: 'Actual Consumption',
          data: chartData.actualConsumption,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          fill: false,
        },
      ],
    };

    // Add anomaly points if available
    if (chartData.anomalyPoints && chartData.anomalyPoints.length > 0) {
      chartConfig.datasets.push({
        label: 'Anomalies',
        data: chartData.anomalyPoints,
        backgroundColor: 'rgb(239, 68, 68)',
        borderColor: 'rgb(239, 68, 68)',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: 'rgb(220, 38, 38)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
      });
    }

    setChartData(chartConfig);
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: selectedAnomaly 
          ? `Anomaly Detected: ${new Date(selectedAnomaly.timestamp).toLocaleString()}` 
          : 'Energy Consumption Anomalies',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} kWh`;
          },
        },
      },
      legend: {
        position: 'top',
      },
      annotation: selectedAnomaly ? {
        annotations: {
          line1: {
            type: 'line',
            yMin: 0,
            yMax: 0,
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              content: 'Anomaly Threshold',
              enabled: true,
              position: 'right',
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              color: 'white',
              padding: 4,
              borderRadius: 3,
            },
            scaleID: 'y',
            value: selectedAnomaly?.threshold || 0,
          },
        },
      } : {},
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Consumption (kWh)',
        },
      },
    },
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Handle anomaly selection
  const handleSelectAnomaly = (anomaly) => {
    setSelectedAnomaly(anomaly);
    // In a real app, you might want to fetch more detailed data for the selected anomaly
  };

  // Handle anomaly status update
  const handleUpdateStatus = async (anomalyId, newStatus) => {
    try {
      // In a real app, you would call an API to update the anomaly status
      // await consumptionAPI.updateAnomalyStatus(anomalyId, newStatus);
      
      // For now, just update the local state
      setAnomalies(prev => 
        prev.map(anomaly => 
          anomaly.id === anomalyId 
            ? { ...anomaly, status: newStatus } 
            : anomaly
        )
      );
      
      if (selectedAnomaly?.id === anomalyId) {
        setSelectedAnomaly(prev => ({ ...prev, status: newStatus }));
      }
      
      // Show success message
      // You might want to use a toast notification library here
      console.log(`Anomaly ${anomalyId} marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating anomaly status:', error);
    }
  };

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchAnomalies();
  }, [timeRange, filters]);

  // Loading state
  if (loading && anomalies.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Anomaly Detection</h1>
          <p className="mt-2 text-sm text-gray-700">
            Identify and manage unusual energy consumption patterns.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
              Severity
            </label>
            <select
              id="severity"
              name="severity"
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="unresolved">Unresolved</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="device" className="block text-sm font-medium text-gray-700">
              Device
            </label>
            <select
              id="device"
              name="device"
              value={filters.deviceId}
              onChange={(e) => handleFilterChange('deviceId', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Devices</option>
              {/* Map through devices here */}
              <option value="device1">Device 1</option>
              <option value="device2">Device 2</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anomalies List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Detected Anomalies
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {anomalies.length} found
                </span>
              </h3>
            </div>
            
            {anomalies.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No anomalies found matching your criteria.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {anomalies.map((anomaly) => (
                  <li 
                    key={anomaly.id}
                    className={`px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedAnomaly?.id === anomaly.id ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => handleSelectAnomaly(anomaly)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-3 w-3 rounded-full ${
                          anomaly.severity === 'critical' ? 'bg-red-500' :
                          anomaly.severity === 'high' ? 'bg-orange-500' :
                          anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {anomaly.deviceName || 'Unknown Device'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(anomaly.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {anomaly.consumption.toFixed(2)} kWh
                        </p>
                        <p className="text-xs text-gray-500">
                          {anomaly.percentageDiff > 0 ? '+' : ''}{anomaly.percentageDiff}% from normal
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        anomaly.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        anomaly.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        anomaly.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        anomaly.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                        anomaly.status === 'false_positive' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {anomaly.status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Anomaly Details & Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            {selectedAnomaly ? (
              <>
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Anomaly Details
                    </h3>
                    <div className="flex space-x-2">
                      <select
                        value={selectedAnomaly.status}
                        onChange={(e) => handleUpdateStatus(selectedAnomaly.id, e.target.value)}
                        className="block rounded-md border-gray-300 py-1 pl-2 pr-8 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="unresolved">Unresolved</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                        <option value="false_positive">False Positive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Device</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAnomaly.deviceName || 'Unknown Device'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Timestamp</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedAnomaly.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Consumption</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAnomaly.consumption.toFixed(2)} kWh
                        <span className={`ml-2 text-xs ${
                          selectedAnomaly.percentageDiff > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ({selectedAnomaly.percentageDiff > 0 ? '+' : ''}{selectedAnomaly.percentageDiff}% from normal)
                        </span>
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Expected Range</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAnomaly.expectedMin.toFixed(2)} - {selectedAnomaly.expectedMax.toFixed(2)} kWh
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Description</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAnomaly.description || 'No additional details available.'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Select an anomaly to view details
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-lg shadow h-[400px]">
            {chartData.labels && chartData.labels.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No chart data available. Select an anomaly to view its details.
              </div>
            )}
          </div>

          {/* Anomaly Actions */}
          {selectedAnomaly && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  View Device Details
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Report False Positive
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10a1 1 0 01-1.64 0l-7-10A1 1 0 012 8h4V2a1 1 0 01.7-.954 1 1 0 01.6.05l5 2a1 1 0 01.6 0l5-2z" clipRule="evenodd" />
                  </svg>
                  Set Alert Rule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;
