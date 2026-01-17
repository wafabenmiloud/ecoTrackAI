import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './DataImport.css'; // We'll create this next

function DataImport({ token }) {
  const [activeTab, setActiveTab] = useState('csv');
  const [manualData, setManualData] = useState({
    timestamp: new Date().toISOString().slice(0, 16),
    value: '',
    unit: 'kWh'
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      await handleFileUpload(acceptedFiles[0]);
    }
  });

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post(
        '/api/consumption/manual',
        {
          timestamp: manualData.timestamp,
          value: parseFloat(manualData.value),
          unit: manualData.unit
        },
        {
          headers: { 'x-auth-token': token }
        }
      );

      setMessage({
        text: 'Data added successfully!',
        type: 'success'
      });
      setManualData({
        timestamp: new Date().toISOString().slice(0, 16),
        value: '',
        unit: 'kWh'
      });
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || 'Error adding data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/consumption/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });

      setMessage({
        text: `Successfully imported ${response.data.imported} records.` + 
              (response.data.errors ? ` ${response.data.errors.length} rows had errors.` : ''),
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || 'Error uploading file',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setManualData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="data-import-container">
      <h2>Import Energy Data</h2>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'csv' ? 'active' : ''}`}
          onClick={() => setActiveTab('csv')}
        >
          Import CSV
        </button>
        <button 
          className={`tab ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          Manual Entry
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {activeTab === 'csv' ? (
        <div 
          {...getRootProps()} 
          className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the CSV file here...</p>
          ) : (
            <div>
              <p>Drag & drop a CSV file here, or click to select</p>
              <p className="small">CSV should contain columns: timestamp, value, unit (optional)</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="manual-form">
          <div className="form-group">
            <label>Timestamp</label>
            <input
              type="datetime-local"
              name="timestamp"
              value={manualData.timestamp}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Energy Usage (kWh)</label>
            <input
              type="number"
              name="value"
              value={manualData.value}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <select
              name="unit"
              value={manualData.unit}
              onChange={handleInputChange}
            >
              <option value="kWh">kWh</option>
              <option value="MWh">MWh</option>
              <option value="J">Joules</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? 'Adding...' : 'Add Data Point'}
          </button>
        </form>
      )}
    </div>
  );
}

export default DataImport;