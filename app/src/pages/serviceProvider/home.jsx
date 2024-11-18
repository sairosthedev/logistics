import React, { useState, useEffect } from 'react';
import ServiceProviderLayout from '../../components/layouts/serviceProviderLayout';
import { Link } from 'react-router-dom';
import { Search, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Common search bar styles
const searchBarClasses = `
  w-full 
  pl-10 
  pr-4 
  py-2 
  border 
  rounded-lg 
  focus:outline-none 
  focus:ring-2 
  focus:ring-blue-500 
  dark:bg-gray-800 
  dark:border-gray-700 
  dark:text-gray-300 
  dark:placeholder-gray-500
  transition-colors 
  duration-200
`;

// Common select/filter styles
const selectClasses = `
  border 
  rounded-lg 
  px-4 
  py-2 
  focus:outline-none 
  focus:ring-2 
  focus:ring-blue-500 
  dark:bg-gray-800 
  dark:border-gray-700 
  dark:text-gray-300
  transition-colors 
  duration-200
`;

function Home() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("serviceDetails");
  const [expandedRow, setExpandedRow] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(10);

  useEffect(() => {
    const fetchServiceRequests = async () => {
      try {
        const response = await fetch('/api/serviceRequests');
        const data = await response.json();
        setServiceRequests(data);
      } catch (error) {
        console.error('Error fetching service requests:', error);
      }
    };

    fetchServiceRequests();
  }, []);

  const filteredRequests = serviceRequests.filter(request => {
    const searchLower = searchTerm.toLowerCase();
    const value = request[filterBy]?.toLowerCase();
    const dateInRange = (!startDate || new Date(request.requestDate) >= startDate) &&
                        (!endDate || new Date(request.requestDate) <= endDate);
    return value && value.includes(searchLower) && dateInRange;
  });

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ServiceProviderLayout>
      <h1 className="mt-10 text-gray-800 dark:text-white text-2xl font-extrabold sm:text-3xl">
        Service Provider Dashboard
      </h1>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Total Requests</h2>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{serviceRequests.length}</p>
        </div>
        <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pending</h2>
          <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {serviceRequests.filter(r => r.status === 'Pending').length}
          </p>
        </div>
        <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">In Progress</h2>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {serviceRequests.filter(r => r.status === 'In Progress').length}
          </p>
        </div>
        <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Completed</h2>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
            {serviceRequests.filter(r => r.status === 'Completed').length}
          </p>
        </div>
      </div>

      <div className="servicesHighlights mt-10">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="items-start justify-between md:flex">
            <div className="max-w-lg">
              <h3 className="text-gray-800 dark:text-white text-xl font-bold sm:text-2xl">
                Services Highlights
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                All your services at a glance.
              </p>
            </div>
          </div>

          {/* Search, Filter, and Date Range Section */}
          <div className="mt-6 flex flex-wrap items-center space-x-2">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search requests..."
                className={searchBarClasses}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className={selectClasses}
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="serviceDetails">Service</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
            </select>
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-gray-400 dark:text-gray-500" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className={`${searchBarClasses} w-32`}
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End Date"
                className={`${searchBarClasses} w-32`}
              />
            </div>
          </div>

          <div className="mt-6 relative h-max overflow-auto">
            <table className="min-w-full table-auto text-sm text-left">
              <thead className="text-gray-600 dark:text-gray-300 font-medium border-b dark:border-gray-700">
                <tr>
                  <th className="py-2 pr-4">Trucker Name</th>
                  <th className="py-2 pr-4">Request Date</th>
                  <th className="py-2 pr-4">Service Details</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-300 divide-y dark:divide-gray-700">
                {currentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="pr-4 py-2 whitespace-nowrap">{request.truckerName}</td>
                    <td className="pr-4 py-2 whitespace-nowrap">{request.requestDate}</td>
                    <td className="pr-4 py-2 whitespace-nowrap">{request.serviceDetails}</td>
                    <td className="pr-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full font-semibold text-xs 
                        ${request.status === "Pending" 
                          ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400" 
                          : request.status === "In Progress" 
                            ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" 
                            : request.status === "Accepted" 
                              ? "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400" 
                              : "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="pr-4 py-2 whitespace-nowrap">
                      <span className={`w-3 h-3 inline-block rounded-full mr-2 ${getPriorityColor(request.priority)}`}></span>
                      {request.priority}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <button
                        onClick={() => toggleRow(request.id)}
                        className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition duration-200 shadow-md transform hover:scale-105 mr-1"
                      >
                        {expandedRow === request.id ? 'Hide Details' : 'View Details'}
                      </button>
                      <select
                        className={selectClasses}
                        onChange={(e) => {
                          console.log(`Quick action ${e.target.value} for request ${request.id}`);
                        }}
                      >
                        <option value="">Quick Action</option>
                        <option value="accept">Accept</option>
                        <option value="reject">Reject</option>
                        <option value="contact">Contact Trucker</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              {[...Array(Math.ceil(filteredRequests.length / requestsPerPage)).keys()].map((number) => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`relative inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium 
                    ${currentPage === number + 1 
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  {number + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredRequests.length / requestsPerPage)}
                className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </ServiceProviderLayout>
  );
}

export default Home;
