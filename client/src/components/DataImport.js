// client/src/components/DataImport.js
import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  LinearProgress, 
  Alert, 
  Tabs, 
  Tab 
} from '@mui/material';
import { uploadFile } from '../services/api';
import ManualEntryForm from './ManualEntryForm';
import BatchImportForm from './BatchImportForm';

const DataImport = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file to upload' });
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage({ type: '', text: '' });

    try {
      await uploadFile(file, (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(progress);
      });

      setMessage({ type: 'success', text: 'File uploaded successfully' });
      setFile(null);
      // Reset file input
      document.getElementById('contained-button-file').value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (data) => {
    try {
      // Here you would typically call your API to save the manual entry
      // For example: await consumptionAPI.addConsumption(data);
      console.log('Manual entry data:', data);
      setMessage({ 
        type: 'success', 
        text: 'Data point added successfully' 
      });
    } catch (error) {
      console.error('Error adding data point:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add data point',
      });
    }
  };

  const handleBatchSubmit = async (formData) => {
    try {
      // Here you would typically call your API to process the batch import
      // For example: await uploadFile(formData);
      console.log('Batch import data:', formData);
      setMessage({ 
        type: 'success', 
        text: 'Batch import started successfully' 
      });
    } catch (error) {
      console.error('Batch import failed:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Batch import failed',
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Import
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab label="CSV Upload" />
          <Tab label="Manual Entry" />
          <Tab label="Batch Import" />
        </Tabs>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {activeTab === 0 && (
          <Box>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="contained-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="contained-button-file">
              <Button 
                variant="contained" 
                component="span" 
                disabled={uploading}
              >
                {file ? file.name : 'Select CSV File'}
              </Button>
            </label>

            {file && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={uploading}
                sx={{ ml: 2 }}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            )}

            {uploading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" color="text.secondary" align="center">
                  {`${Math.round(progress)}%`}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <ManualEntryForm 
            onSubmit={handleManualSubmit} 
            loading={uploading} 
          />
        )}

        {activeTab === 2 && (
          <BatchImportForm 
            onSubmit={handleBatchSubmit} 
            loading={uploading} 
          />
        )}
      </Paper>
    </Box>
  );
};

export default DataImport;