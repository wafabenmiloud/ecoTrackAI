import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiChevronRight } from 'react-icons/fi';

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchTickets = async () => {
      // Simulate API call
      setTimeout(() => {
        setTickets([
          {
            id: 'TKT-001',
            subject: 'Login issues',
            status: 'open',
            priority: 'high',
            createdAt: '2023-12-15',
            lastUpdated: '2023-12-16',
          },
          {
            id: 'TKT-002',
            subject: 'Device not syncing',
            status: 'in-progress',
            priority: 'medium',
            createdAt: '2023-12-18',
            lastUpdated: '2023-12-19',
          },
          {
            id: 'TKT-003',
            subject: 'Billing inquiry',
            status: 'resolved',
            priority: 'low',
            createdAt: '2023-12-20',
            lastUpdated: '2023-12-20',
          },
        ]);
        setIsLoading(false);
      }, 500);
    };

    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      open: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100'}`}>
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityClasses[priority] || 'bg-gray-100'}`}>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your support requests</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/support/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            New Ticket
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="relative rounded-md shadow-sm w-full sm:w-64 mb-4 sm:mb-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiDownload className="-ml-1 mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new ticket.</p>
            <div className="mt-6">
              <Link
                to="/support/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                New Ticket
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-b-lg">
            <ul className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    to={`/support/tickets/${ticket.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {ticket.id} - {ticket.subject}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <span>Priority: {getPriorityBadge(ticket.priority)}</span>
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <span>Created: {ticket.createdAt}</span>
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span>Last updated: {ticket.lastUpdated}</span>
                          <FiChevronRight className="ml-1 h-4 w-4 flex-shrink-0 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <nav
              className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
              aria-label="Pagination"
            >
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">{filteredTickets.length}</span> of{' '}
                  <span className="font-medium">{tickets.length}</span> results
                </p>
              </div>
              <div className="flex-1 flex justify-between sm:justify-end">
                <button
                  disabled
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
