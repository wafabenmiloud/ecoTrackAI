import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare, FiPaperclip, FiSend, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi';

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchTicket = async () => {
      // Simulate API call
      setTimeout(() => {
        setTicket({
          id: id,
          subject: id === 'TKT-001' ? 'Login issues' : 'Device not syncing',
          status: id === 'TKT-001' ? 'open' : 'in-progress',
          priority: id === 'TKT-001' ? 'high' : 'medium',
          createdAt: '2023-12-15 14:30',
          updatedAt: '2023-12-16 09:15',
          description: id === 'TKT-001' 
            ? 'I am unable to log in to my account. I keep getting an "Invalid credentials" error even though I\'m sure my password is correct.'
            : 'My device is not syncing the latest consumption data. The last sync was 2 days ago.',
          category: id === 'TKT-001' ? 'Account' : 'Device',
          assignedTo: id === 'TKT-001' ? 'Support Team' : 'Technical Team',
        });

        setMessages([
          {
            id: 1,
            sender: 'You',
            message: id === 'TKT-001' 
              ? 'Hello, I\'m having trouble logging in to my account.'
              : 'My device has stopped syncing data.',
            timestamp: id === 'TKT-001' ? '2023-12-15 14:30' : '2023-12-18 10:15',
            isStaff: false,
          },
          {
            id: 2,
            sender: 'Support Team',
            message: id === 'TKT-001'
              ? 'Thank you for reaching out. We\'re looking into this issue and will get back to you shortly.'
              : 'We\'ve identified the issue and are working on a fix. In the meantime, please try restarting your device.',
            timestamp: id === 'TKT-001' ? '2023-12-15 15:45' : '2023-12-18 11:30',
            isStaff: true,
          },
        ]);
        
        setIsLoading(false);
      }, 500);
    };

    fetchTicket();
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newMsg = {
        id: messages.length + 1,
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toISOString(),
        isStaff: false,
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
      setSelectedFile(null);
      setIsSubmitting(false);
      
      // Scroll to bottom of messages
      const messagesEnd = document.getElementById('messages-end');
      if (messagesEnd) {
        messagesEnd.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      open: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100'}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClasses[priority] || 'bg-gray-100'}`}>
        {priority}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-1 h-4 w-4" />
          Back to tickets
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                {ticket.subject}
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FiMessageSquare className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  #{ticket.id}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  Created on {ticket.createdAt}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {ticket.category}
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex space-x-2">
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-700 mb-4">
            {ticket.description}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Assigned to</dt>
                <dd className="mt-1 text-sm text-gray-900">{ticket.assignedTo}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Last updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{ticket.updatedAt}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Conversation</h3>
        </div>
        
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isStaff ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-3/4 rounded-lg px-4 py-2 ${
                  msg.isStaff
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <div className="text-xs font-medium mb-1">
                  {msg.sender} • {new Date(msg.timestamp).toLocaleString()}
                </div>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
          <div id="messages-end" />
        </div>

        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="comment" className="sr-only">
                Add a message
              </label>
              <div className="mt-1">
                <textarea
                  rows={3}
                  name="comment"
                  id="comment"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  <FiPaperclip className="-ml-0.5 mr-2 h-4 w-4" />
                  <span>Attach file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                </label>
                {selectedFile && (
                  <span className="ml-2 text-sm text-gray-500">
                    {selectedFile.name}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting || (!newMessage.trim() && !selectedFile)}
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <FiSend className="-ml-1 mr-2 h-5 w-5" />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
