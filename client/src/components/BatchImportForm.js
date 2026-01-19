// client/src/components/BatchImportForm.js
import React, { useState } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  TextField,
  InputAdornment,
  IconButton,
  Paper
} from '@mui/material';
import { FileUpload as FileUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';

const BatchImportForm = ({ onSubmit, loading }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    onSubmit(formData);
  };

  const handleRemoveFile = () => {
    setFile(null);
    // Reset the file input
    document.getElementById('batch-upload-file').value = '';
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Batch Import
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload a CSV file containing multiple energy consumption records. The file should include columns for timestamp, value, and unit.
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="batch-upload-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="batch-upload-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<FileUploadIcon />}
              disabled={loading}
              sx={{ mr: 2 }}
            >
              {file ? 'Change File' : 'Select CSV File'}
            </Button>
          </label>
          
          {file && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleRemoveFile}
                disabled={loading}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        <TextField
          fullWidth
          margin="normal"
          label="Description (Optional)"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          helperText="Add a description for this import batch"
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!file || loading}
            startIcon={<FileUploadIcon />}
          >
            {loading ? 'Uploading...' : 'Upload Batch'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default BatchImportForm;