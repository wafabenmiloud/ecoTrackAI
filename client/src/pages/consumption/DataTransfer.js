import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { consumptionAPI } from '../../services/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiDownload, FiUpload, FiCalendar, FiX } from 'react-icons/fi';

const DataTransfer = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('export');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast.warning('Please select both start and end dates');
      return;
    }

    setIsProcessing(true);
    try {
      const params = {
        startDate: dateRange.start.toISOString().split('T')[0],
        endDate: dateRange.end.toISOString().split('T')[0],
        format: 'csv'
      };

      const response = await consumptionAPI.exportData(params);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `consumption-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.response?.data?.message || 'Failed to export data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast.error('Please select a valid CSV file');
        e.target.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.warning('Please select a file to import');
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await consumptionAPI.importCSV(formData);
      toast.success('Import completed successfully');
      setSelectedFile(null);
      document.getElementById('file-upload').value = '';
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.message || 'Failed to import data');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('export')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'export'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiDownload className="inline mr-2" />
              Export Data
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUpload className="inline mr-2" />
              Import Data
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Export Consumption Data</h3>
                <p className="text-sm text-gray-500">
                  Select a date range to export consumption data. The data will be downloaded as a CSV file.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={dateRange.start}
                      onChange={(date) => setDateRange({...dateRange, start: date})}
                      selectsStart
                      startDate={dateRange.start}
                      endDate={dateRange.end}
                      maxDate={new Date()}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <FiCalendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={dateRange.end}
                      onChange={(date) => setDateRange({...dateRange, end: date})}
                      selectsEnd
                      startDate={dateRange.start}
                      endDate={dateRange.end}
                      minDate={dateRange.start}
                      maxDate={new Date()}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <FiCalendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExport}
                  disabled={isProcessing || !dateRange.start || !dateRange.end}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isProcessing ? 'Exporting...' : 'Export Data'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Import Consumption Data</h3>
                <p className="text-sm text-gray-500">
                  Upload a CSV file containing consumption data. The file should include columns for timestamp, value, and unit.
                </p>
              </div>

              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".csv"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV up to 10MB</p>
                </div>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-md">
                      <FiDownload className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      document.getElementById('file-upload').value = '';
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleImport}
                  disabled={isProcessing || !selectedFile}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isProcessing ? 'Importing...' : 'Import Data'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/consumption')}
                  className="ml-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTransfer;