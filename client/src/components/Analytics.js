// client/src/components/Analytics/Analytics.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { consumptionAPI } from '../services/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch consumption data
      const consumptionRes = await consumptionAPI.getConsumption({
        interval: timeRange === 'day' ? 'hour' : 'day',
        limit: timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365
      });
      
      setChartData(consumptionRes.data);

      // Fetch anomalies
      const anomaliesRes = await consumptionAPI.detectAnomalies({
        startDate: getStartDate(),
        endDate: new Date().toISOString()
      });
      
      setAnomalies(anomaliesRes.data.anomalies || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    if (timeRange === 'day') {
      now.setDate(now.getDate() - 1);
    } else if (timeRange === 'week') {
      now.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      now.setMonth(now.getMonth() - 1);
    } else {
      now.setFullYear(now.getFullYear() - 1);
    }
    return now.toISOString();
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleRunAnalysis = async () => {
    try {
      setLoading(true);
      const { data } = await consumptionAPI.analyzeData({
        analysisType: 'anomaly',
        startDate: getStartDate(),
        endDate: new Date().toISOString()
      });
      setAnomalies(data.anomalies || []);
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Analytics</Typography>
        <Box>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="day">Last 24 Hours</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleRunAnalysis}
          >
            Run Analysis
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Energy Consumption
            </Typography>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => {
                      if (timeRange === 'day') {
                        return new Date(value).toLocaleTimeString();
                      }
                      return new Date(value).toLocaleDateString();
                    }} 
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => 
                      new Date(value).toLocaleString()
                    }
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    name="Consumption (kWh)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Anomalies Detected
            </Typography>
            {anomalies.length > 0 ? (
              <Box>
                <BarChart
                  width={350}
                  height={300}
                  data={anomalies}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="deviation" fill="#ff6b6b" name="Deviation" />
                </BarChart>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">
                    Total Anomalies: {anomalies.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last detected: {new Date(anomalies[0]?.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No anomalies detected in the selected time range.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleRunAnalysis}
                  sx={{ mt: 2 }}
                >
                  Run Analysis
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Consumption by Time of Day
            </Typography>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumption" fill="#82ca9d" name="Avg Consumption" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Forecast
            </Typography>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#8884d8" 
                    name="Actual" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#ff7300" 
                    name="Forecast" 
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;