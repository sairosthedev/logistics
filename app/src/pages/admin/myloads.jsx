import React, { useState, useEffect } from 'react'
import { FaSearch, FaSort, FaEye, FaTruck, FaTimes, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import { BACKEND_Local } from '../../../url.js'
import useAuthStore from '../auth/auth'
import { useDarkMode } from '../../contexts/DarkModeContext';

function MyLoads() {
  const { accessToken } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedJob, setSelectedJob] = useState(null)
  const [trackingJob, setTrackingJob] = useState(null)
  const [clientRequests, setClientRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { darkMode } = useDarkMode();
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`${BACKEND_Local}/api/admin/requests`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        setClientRequests(response.data)
      } catch (error) {
        console.error('Error fetching requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [accessToken])

  const filteredRequests = clientRequests.filter(request => {
    // First filter by status
    const validStatuses = ['loaded', 'in transit', 'delivered'];
    if (!validStatuses.includes(request.status?.toLowerCase())) {
      return false;
    }
    
    // Then filter by search term if it exists
    if (!searchTerm) return true;
    
    const searchFields = [
      request.clientName,
      request.pickupLocation,
      request.dropoffLocation,
      request.goodsType,
      request.status,
      request.weight?.toString(),
      request.estimatedPrice?.toString(),
      request.negotiationPrice?.toString()
    ];

    return searchFields.some(field => 
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortColumn) {
      if (a[sortColumn] < b[sortColumn]) return sortOrder === 'asc' ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortOrder === 'asc' ? 1 : -1
    }
    return 0
  })

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSort = (column) => {
    setSortColumn(column)
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const handleViewJob = (job) => {
    setSelectedJob(job)
  }

  const closeModal = () => {
    setSelectedJob(null)
  }

  const handleTrackLoad = (job) => {
    setTrackingJob(job)
  }

  const closeTrackingModal = () => {
    setTrackingJob(null)
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
              Jobs Management
            </h2>
            <div className="flex justify-between items-center mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className={`pl-8 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-200 border-gray-600 placeholder-gray-400' 
                      : 'bg-white border-gray-300 placeholder-gray-500'
                  }`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className={`absolute left-2 top-2.5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                } text-sm`} />
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedRequests.length)} of {sortedRequests.length} jobs
              </div>
            </div>
          </div>
          <div className="flex-grow overflow-hidden">
            <div className="h-full overflow-auto">
              <table className={`min-w-full ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    {['Client Name', 'Pickup Location', 'Status', 'Actions'].map((header) => (
                      <th
                        key={header}
                        className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => header !== 'Actions' && handleSort(header.toLowerCase().replace(' ', ''))}
                      >
                        <div className="flex items-center">
                          {header}
                          {header !== 'Actions' && <FaSort className="ml-1 text-xs" />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        <div className="flex items-center justify-center">
                          Loading...
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No jobs found
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((request, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition duration-200">
                        <td className="py-2 px-3 whitespace-nowrap">{request.clientName}</td>
                        <td className="py-2 px-3 whitespace-nowrap">{request.pickupLocation}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                            request.status === "loaded" ? "bg-yellow-100 text-yellow-800" :
                            request.status === "in transit" ? "bg-blue-100 text-blue-800" :
                            request.status === "delivered" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-xs font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-2" 
                            title="View Details"
                            onClick={() => handleViewJob(request)}
                          >
                            <FaEye className="inline-block mr-1" /> View
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900" 
                            title="Track Load"
                            onClick={() => handleTrackLoad(request)}
                          >
                            <FaTruck className="inline-block mr-1" /> Track
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-2 mt-4 mb-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                darkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FaChevronLeft className="h-4 w-4" />
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                darkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FaChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Job Details Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Job Details</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <FaTimes />
                </button>
              </div>
              <div className="mt-2 space-y-3">
                <p><strong>Client Name:</strong> {selectedJob.clientName}</p>
                <p><strong>Pickup Location:</strong> {selectedJob.pickupLocation}</p>
                <p><strong>Dropoff Location:</strong> {selectedJob.dropoffLocation}</p>
                <p><strong>Goods Type:</strong> {selectedJob.goodsType}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                    selectedJob.status === "loaded" ? "bg-yellow-100 text-yellow-800" :
                    selectedJob.status === "in transit" ? "bg-blue-100 text-blue-800" :
                    selectedJob.status === "delivered" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {selectedJob.status}
                  </span>
                </p>
                <p><strong>Weight:</strong> {selectedJob.weight}</p>
                <p><strong>Estimated Price:</strong> {selectedJob.estimatedPrice}</p>
                <p><strong>Negotiation Price:</strong> {selectedJob.negotiationPrice}</p>
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm text-gray-500">Additional Information</p>
                  <p><strong>Created At:</strong> {new Date(selectedJob.createdAt).toLocaleDateString()}</p>
                  {selectedJob.notes && <p><strong>Notes:</strong> {selectedJob.notes}</p>}
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Load Tracking Modal */}
        {trackingJob && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Load Tracking</h3>
                <button onClick={closeTrackingModal} className="text-gray-500 hover:text-gray-700">
                  <FaTimes />
                </button>
              </div>
              <div className="mt-2">
                <p><strong>Client Name:</strong> {trackingJob.clientName}</p>
                <p><strong>Goods Type:</strong> {trackingJob.goodsType}</p>
                <p><strong>Status:</strong> {trackingJob.status}</p>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Tracking Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-red-500 mr-2" />
                      <span>Pickup Location: {trackingJob.pickupLocation}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-blue-500 mr-2" />
                      <span>Current Location: In Transit</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-green-500 mr-2" />
                      <span>Destination: {trackingJob.dropoffLocation}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={closeTrackingModal}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyLoads