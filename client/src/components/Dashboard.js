// client/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { consumptionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalConsumption: 0,
    averageDaily: 0,
    currentMonth: 0,
    anomalyCount: 0,
    change: 0
  });
  const [consumptionData, setConsumptionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      const statsRes = await consumptionAPI.getStats();
      const consumptionRes = await consumptionAPI.getConsumption({ period: 'week' });
      
      setStats(statsRes.data);
      setConsumptionData(consumptionRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    fetchData();
    handleMenuClose();
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'primary' }) => (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <IconButton size="small" sx={{ color: `${color}.main` }}>
            <Icon />
          </IconButton>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 600 }}>
          {value}
        </Typography>
        <Box display="flex" alignItems="center">
          {change >= 0 ? (
            <ArrowUpwardIcon color="success" fontSize="small" />
          ) : (
            <ArrowDownwardIcon color="error" fontSize="small" />
          )}
          <Typography 
            variant="body2" 
            color={change >= 0 ? 'success.main' : 'error.main'}
            sx={{ ml: 0.5, fontWeight: 500 }}
          >
            {Math.abs(change)}% from last period
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.name || 'User'}! Here's what's happening with your energy usage.
          </Typography>
        </Box>
        <Box>
          <IconButton
            onClick={handleMenuOpen}
            size="large"
            aria-label="dashboard actions"
            aria-controls="dashboard-menu"
            aria-haspopup="true"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="dashboard-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleRefresh}>
              <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
              Refresh Data
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>Export Data</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          </Menu>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Consumption"
            value={`${stats.totalConsumption.toFixed(2)} kWh`}
            change={stats.change}
            icon={ArrowUpwardIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Daily"
            value={`${stats.averageDaily.toFixed(2)} kWh`}
            change={-2.5}
            icon={ArrowDownwardIcon}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month"
            value={`${stats.currentMonth.toFixed(2)} kWh`}
            change={5.2}
            icon={ArrowUpwardIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Anomalies"
            value={stats.anomalyCount}
            change={-10}
            icon={ArrowDownwardIcon}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardHeader
              title="Energy Consumption"
              subheader="Last 7 days"
              action={
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Refresh
                </Button>
              }
            />
            <CardContent sx={{ height: isMobile ? 300 : 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: theme.palette.text.secondary }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: theme.palette.text.secondary }}
                    tickLine={false}
                    width={isMobile ? 40 : 60}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      borderRadius: 8,
                      boxShadow: theme.shadows[3]
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="consumption"
                    name="Consumption (kWh)"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardHeader
              title="Quick Actions"
              subheader="Manage your energy usage"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ 
                      py: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      justifyContent: 'flex-start',
                      textTransform: 'none'
                    }}
                  >
                    Add New Device
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{ 
                      py: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      justifyContent: 'flex-start',
                      textTransform: 'none'
                    }}
                  >
                    View Detailed Report
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      justifyContent: 'flex-start',
                      textTransform: 'none'
                    }}
                  >
                    Set Energy Goals
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;