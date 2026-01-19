// client/src/components/ManualEntryForm.js
import React from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ManualEntryForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = React.useState({
    timestamp: new Date(),
    value: '',
    unit: 'kWh',
    deviceId: 'device1' // This would come from user's devices in a real app
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, timestamp: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Timestamp"
              value={formData.timestamp}
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  margin="normal" 
                  required 
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              margin="normal"
              label="Energy Consumption"
              name="value"
              type="number"
              value={formData.value}
              onChange={handleChange}
              required
              inputProps={{ step: "0.01", min: "0" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="unit-label">Unit</InputLabel>
              <Select
                labelId="unit-label"
                name="unit"
                value={formData.unit}
                label="Unit"
                onChange={handleChange}
              >
                <MenuItem value="kWh">kWh</MenuItem>
                <MenuItem value="MWh">MWh</MenuItem>
                <MenuItem value="J">Joules</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Data Point'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </LocalizationProvider>
  );
};

export default ManualEntryForm;