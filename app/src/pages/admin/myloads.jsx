import React, { useState, useEffect } from 'react'
import { FaSearch, FaSort, FaEye, FaTruck, FaTimes, FaMapMarkerAlt } from 'react-icons/fa'
import PortalLayout from '../../components/layouts/appLayout'
import axios from 'axios'
import { BACKEND_Local } from '../../../url.js'
import useAuthStore from '../auth/auth'

function MyLoads() {
  const { accessToken } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedJob, setSelectedJob] = useState(null)
  const [trackingJob, setTrackingJob] = useState(null)
  const [clientRequests, setClientRequests] = useState([])
  const [loading, setLoading] = useState(true)

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
    <PortalLayout>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Jobs Management
          </h2>
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                className="pl-8 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-2 top-2.5 text-gray-400 text-sm" />
            </div>
            <div className="text-sm text-gray-600">
              Showing {sortedRequests.length} of {clientRequests.length} jobs
            </div>
          </div>
        </div>
        <div className="flex-grow overflow-hidden">
          <div className="h-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {['Client Name', 'Pickup Location', 'Dropoff Location', 'Goods Type', 'Status', 'Weight', 'Estimated Price', 'Negotiation Price', 'Actions'].map((header) => (
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
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedRequests.map((request, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition duration-200">
                    <td className="py-2 px-3 whitespace-nowrap">{request.clientName}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{request.pickupLocation}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{request.dropoffLocation}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{request.goodsType}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        request.status === "in transit" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">{request.weight}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{request.estimatedPrice}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{request.negotiationPrice}</td>
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
                ))}
              </tbody>
            </table>
          </div>
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
            <div className="mt-2">
              <p><strong>Client Name:</strong> {selectedJob.clientName}</p>
              <p><strong>Pickup Location:</strong> {selectedJob.pickupLocation}</p>
              <p><strong>Dropoff Location:</strong> {selectedJob.dropoffLocation}</p>
              <p><strong>Goods Type:</strong> {selectedJob.goodsType}</p>
              <p><strong>Status:</strong> {selectedJob.status}</p>
              <p><strong>Weight:</strong> {selectedJob.weight}</p>
              <p><strong>Estimated Price:</strong> {selectedJob.estimatedPrice}</p>
              <p><strong>Negotiation Price:</strong> {selectedJob.negotiationPrice}</p>
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
    </PortalLayout>
  )
}

export default MyLoads
