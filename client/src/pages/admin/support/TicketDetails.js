import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare, FiPaperclip, FiSend } from 'react-icons/fi';

const TicketDetails = () => {
  const { id } = useParams();
  const [message, setMessage] = useState('');
  const [ticket] = useState({
    id: id,
    subject: 'Login issues',
    status: 'open',
    priority: 'high',
    user: 'john.doe@example.com',
    date: '2023-05-15',
    messages: [
      {
        id: 1,
        sender: 'John Doe',
        content: 'I cannot log in to my account. Please help!',
        timestamp: '2023-05-15 10:30 AM',
        isStaff: false
      },
      {
        id: 2,
        sender: 'Support Team',
        content: 'We are looking into this issue. Can you try resetting your password?',
        timestamp: '2023-05-15 11:15 AM',
        isStaff: true
      }
    ]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // In a real app, this would send the message to the server
    console.log('New message:', message);
    setMessage('');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link 
          to="/admin/support" 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-2" /> Back to Tickets
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">#{ticket.id} - {ticket.subject}</h1>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                <span>Status: <span className="font-medium capitalize">{ticket.status}</span></span>
                <span>Priority: <span className="font-medium capitalize">{ticket.priority}</span></span>
                <span>Created: {ticket.date}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <select className="border rounded p-2">
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {ticket.messages.map(msg => (
              <div 
                key={msg.id} 
                className={`p-4 rounded-lg ${
                  msg.isStaff ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium">{msg.sender}</div>
                  <div className="text-sm text-gray-500">{msg.timestamp}</div>
                </div>
                <p className="mt-2 text-gray-700">{msg.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Add a reply
              </label>
              <textarea
                id="message"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Attach file"
              >
                <FiPaperclip className="h-5 w-5" />
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiSend className="mr-2 h-4 w-4" />
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;