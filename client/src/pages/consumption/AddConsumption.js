import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { consumptionAPI } from '../../services/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AddConsumption = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    timestamp: new Date(),
    value: '',
    unit: 'kWh',
    source: 'manual',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      timestamp: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await consumptionAPI.addConsumption({
        ...formData,
        timestamp: formData.timestamp.toISOString()
      });
      toast.success('Consumption data added successfully');
      navigate('/consumption');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add consumption data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add Consumption Data</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Timestamp</label>
          <DatePicker
            selected={formData.timestamp}
            onChange={handleDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Value</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              name="value"
              step="0.01"
              value={formData.value}
              onChange={handleChange}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-r-md"
              >
                <option value="kWh">kWh</option>
                <option value="m³">m³</option>
                <option value="L">L</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Source</label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="manual">Manual Entry</option>
            <option value="sensor">Sensor</option>
            <option value="import">Import</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/consumption')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Consumption'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddConsumption;