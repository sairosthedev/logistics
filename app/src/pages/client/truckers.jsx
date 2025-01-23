import React, { useState, useEffect } from 'react';
import { Truck, User, MapPin, Phone, Star, Weight, Calendar, DollarSign, ChevronUp, ChevronDown, Search } from 'lucide-react';
import ClientLayout from '../../components/layouts/clientLayout';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function AvailableTrucks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [truckers, setTruckers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedTrucker, setSelectedTrucker] = useState(null);
  const [acceptedTruckers, setAcceptedTruckers] = useState([]);
  const [isAcceptedOffersVisible, setIsAcceptedOffersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [acceptedOffersPage, setAcceptedOffersPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { accessToken, clientID } = useAuthStore();
  const [isViewMoreModalOpen, setIsViewMoreModalOpen] = useState(false);
  const [selectedBidDetails, setSelectedBidDetails] = useState(null);

  const fetchTruckers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_Local}/api/client/request-bids/${clientID}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      // Log the response data to check the structure
      console.log('Fetched truckers data:', response.data);
      
      // Separate truckers: only 'bid' status in available, others in accepted
      const allTruckers = response.data;
      const available = allTruckers.filter(trucker => trucker.status === 'bid');
      const accepted = allTruckers.filter(trucker => trucker.status !== 'bid');
      
      setAcceptedTruckers(accepted);
      setTruckers(available);
    } catch (error) {
      console.error('Error fetching truckers:', error);
      setResponseMessage('Error fetching truckers. Please try again.');
      setIsResponseModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTruckers();
  }, [accessToken, clientID]);

  const filteredTruckers = truckers.filter(trucker => {
    const matchesSearch = searchTerm === '' || (
      (trucker.truckInfo.driverName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (trucker.truckInfo.truckType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (trucker.truckInfo.driverPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    
    // Remove the availability filter since we're now only showing 'bid' status in available
    return matchesSearch;
  });

  // Sort the filtered truckers by 'createdAt' in descending order
  const sortedFilteredTruckers = filteredTruckers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Calculate pagination for available truckers
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTruckers = sortedFilteredTruckers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedFilteredTruckers.length / itemsPerPage);

  // Calculate pagination for accepted offers
  const acceptedLastItem = acceptedOffersPage * itemsPerPage;
  const acceptedFirstItem = acceptedLastItem - itemsPerPage;
  const currentAcceptedTruckers = acceptedTruckers.slice(acceptedFirstItem, acceptedLastItem);
  const totalAcceptedPages = Math.ceil(acceptedTruckers.length / itemsPerPage);

  // Pagination controls
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAcceptedPageChange = (pageNumber) => {
    setAcceptedOffersPage(pageNumber);
  };

  const PaginationControls = ({ totalPages, currentPage, onPageChange }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  
    return (
      <div className="flex justify-center items-center space-x-2 mt-4 mb-6">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          &lt;&lt;
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          &lt;
        </button>
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} hover:bg-gray-200 dark:hover:bg-gray-600`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          &gt;
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          &gt;&gt;
        </button>
      </div>
    );
  };

  const openConfirmModal = (trucker, action) => {
    setSelectedTrucker({ ...trucker, action });
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setSelectedTrucker(null);
    setIsConfirmModalOpen(false);
  };

  const openViewMoreModal = (trucker) => {
    console.log('Opening modal with trucker:', trucker);
    console.log('Rate value:', trucker.rate);
    console.log('Negotiation price:', trucker.negotiationPrice);
    setSelectedBidDetails(trucker);
    setIsViewMoreModalOpen(true);
  };

  const closeViewMoreModal = () => {
    console.log('Closing modal');
    setSelectedBidDetails(null);
    setIsViewMoreModalOpen(false);
  };

  const acceptBid = async () => {
    setIsLoading(true);
    setResponseMessage('');
    try {
      await axios.put(`${BACKEND_Local}/api/client/request-bids/accept/${selectedTrucker._id}`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setResponseMessage('Offer accepted successfully!');
      // Refresh the data after accepting
      await fetchTruckers();
    } catch (error) {
      console.error('Error accepting bid:', error);
      setResponseMessage('Failed to accept the offer. Please try again.');
    } finally {
      setIsLoading(false);
      setIsConfirmModalOpen(false);
      setIsResponseModalOpen(true);
    }
  };

  const rejectBid = async () => {
    setIsLoading(true);
    try {
      // Remove the bid locally
      const updatedTruckers = truckers.filter(trucker => trucker._id !== selectedTrucker._id);
      setTruckers(updatedTruckers);
      
      // Show success message
      setResponseMessage(`You have declined the bid from ${selectedTrucker.truckInfo.driverName}. This bid will no longer appear in your list.`);
      
      // Refresh the data after rejecting
      await fetchTruckers();
    } catch (error) {
      console.error('Error rejecting bid:', error);
      setResponseMessage('Failed to reject the bid. Please try again.');
    } finally {
      setIsLoading(false);
      setIsConfirmModalOpen(false);
      setIsResponseModalOpen(true);
    }
  };

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      zIndex: 1001,
    },
  };

  return (
    <ClientLayout>
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Bids</h1>
            <button
              onClick={() => setIsAcceptedOffersVisible(!isAcceptedOffersVisible)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isAcceptedOffersVisible ? (
                <>
                  <ChevronUp className="w-5 h-5 mr-2" />
                  Hide Accepted Bids ({acceptedTruckers.length})
                </>
              ) : (
                <>
                  <ChevronDown className="w-5 h-5 mr-2" />
                  Show Accepted Bids ({acceptedTruckers.length})
                </>
              )}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search bids..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="bid">Bid</option>
            </select>
          </div>
        </div>

        {/* Available Bids Section */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6">
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Bids</h2>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block w-full min-w-full">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-400">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Driver Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Truck Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Created At</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentTruckers.map((trucker, index) => (
                  <tr 
                    key={trucker._id || index} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                    }`}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {trucker.truckInfo.driverName}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {trucker.truckInfo.truckType}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trucker.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {trucker.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ${trucker.negotiationPrice ? trucker.negotiationPrice.toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {trucker.truckInfo.driverPhone}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(trucker.createdAt).toLocaleString('en-GB')}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          className="px-2 py-1 text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('View More clicked', trucker);
                            openViewMoreModal(trucker);
                          }}
                        >
                          View More
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden px-4 py-2 space-y-4">
            {currentTruckers.map((trucker, index) => (
              <div 
                key={trucker._id || index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {trucker.truckInfo.driverName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {trucker.truckInfo.truckType}
                    </p>
                  </div>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    trucker.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {trucker.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Contact</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {trucker.truckInfo.driverPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Price</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${trucker.negotiationPrice ? trucker.negotiationPrice.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Created</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(trucker.createdAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openViewMoreModal(trucker);
                  }}
                  className="w-full mt-2 px-4 py-2 text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View More
                </button>
              </div>
            ))}
          </div>

          <PaginationControls
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Accepted Bids Section */}
        <div className={`transition-all duration-300 ease-in-out ${isAcceptedOffersVisible ? 'opacity-100 max-h-[2000px] mb-6' : 'opacity-0 max-h-0 overflow-hidden mb-0'}`}>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Accepted Bids</h2>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block w-full min-w-full">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-400">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Driver Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Truck Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentAcceptedTruckers.map((trucker, index) => (
                    <tr 
                      key={trucker._id || index}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {trucker.truckInfo.driverName}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {trucker.truckInfo.truckType}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {trucker.truckInfo.driverPhone}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {trucker.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden px-4 py-2 space-y-4">
              {currentAcceptedTruckers.map((trucker, index) => (
                <div 
                  key={trucker._id || index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {trucker.truckInfo.driverName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {trucker.truckInfo.truckType}
                      </p>
                    </div>
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {trucker.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Contact</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {trucker.truckInfo.driverPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Location</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {trucker.truckInfo.location || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <PaginationControls
              totalPages={totalAcceptedPages}
              currentPage={acceptedOffersPage}
              onPageChange={handleAcceptedPageChange}
            />
          </div>
        </div>

        {/* View More Modal */}
        <Modal
          isOpen={isViewMoreModalOpen}
          onRequestClose={closeViewMoreModal}
          style={modalStyles}
          contentLabel="View More Details"
          shouldCloseOnOverlayClick={true}
          shouldCloseOnEsc={true}
        >
          <div className="p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">
                Bid Details
              </h2>
              <button
                onClick={closeViewMoreModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedBidDetails && (
              <div className="space-y-6">
                {/* Load Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Load Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-24 mb-1 sm:mb-0">Pickup:</span>
                        <span className="flex-1">{selectedBidDetails.pickupLocation}</span>
                      </p>
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-24 mb-1 sm:mb-0">Dropoff:</span>
                        <span className="flex-1">{selectedBidDetails.dropoffLocation}</span>
                      </p>
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-24 mb-1 sm:mb-0">Distance:</span>
                        <span>{selectedBidDetails.distance} km</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-24 mb-1 sm:mb-0">Goods:</span>
                        <span>{selectedBidDetails.goodsType}</span>
                      </p>
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-24 mb-1 sm:mb-0">Weight:</span>
                        <span>{selectedBidDetails.weight} tons</span>
                      </p>
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-24 mb-1 sm:mb-0">Payment:</span>
                        <span>{selectedBidDetails.payTerms}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Pricing</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium w-32 mb-1 sm:mb-0">Original Price:</span>
                      <span className="text-lg font-semibold">
                        ${selectedBidDetails?.rate ? selectedBidDetails.rate.toLocaleString() : 'N/A'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium w-32 mb-1 sm:mb-0">Trucker's Bid:</span>
                      <span className={`text-lg font-semibold ${selectedBidDetails?.negotiationPrice < selectedBidDetails?.rate ? 'text-green-600' : 'text-red-600'}`}>
                        ${selectedBidDetails?.negotiationPrice ? selectedBidDetails.negotiationPrice.toLocaleString() : 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Driver and Truck Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Driver Information</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-20 mb-1 sm:mb-0">Name:</span>
                        <span>{selectedBidDetails.truckInfo.driverName}</span>
                      </p>
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-20 mb-1 sm:mb-0">Phone:</span>
                        <span>{selectedBidDetails.truckInfo.driverPhone}</span>
                      </p>
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-20 mb-1 sm:mb-0">License:</span>
                        <span>{selectedBidDetails.truckInfo.licence}</span>
                      </p>
                      {selectedBidDetails.truckInfo.passport && (
                        <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                          <span className="font-medium w-20 mb-1 sm:mb-0">Passport:</span>
                          <span>{selectedBidDetails.truckInfo.passport}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Vehicle Information</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-20 mb-1 sm:mb-0">Type:</span>
                        <span>{selectedBidDetails.truckInfo.truckType}</span>
                      </p>
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-20 mb-1 sm:mb-0">Horse:</span>
                        <span>{selectedBidDetails.truckInfo.horse}</span>
                      </p>
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-20 mb-1 sm:mb-0">Trailer:</span>
                        <span>
                          {selectedBidDetails.truckInfo.trailer1}
                          {selectedBidDetails.truckInfo.trailer2 && `, ${selectedBidDetails.truckInfo.trailer2}`}
                        </span>
                      </p>
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-20 mb-1 sm:mb-0">Weight:</span>
                        <span>{selectedBidDetails.truckInfo.maximumWeight} tons</span>
                      </p>
                      <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                        <span className="font-medium w-20 mb-1 sm:mb-0">Location:</span>
                        <span>{selectedBidDetails.truckInfo.location || 'Not specified'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium w-24 mb-1 sm:mb-0">Phone:</span>
                      <span>{selectedBidDetails.truckInfo.truckOwnerPhone}</span>
                    </p>
                    <p className="text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium w-24 mb-1 sm:mb-0">WhatsApp:</span>
                      <span>{selectedBidDetails.truckInfo.truckOwnerWhatsapp}</span>
                    </p>
                  </div>
                </div>

                {selectedBidDetails.status !== 'accepted' && (
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      onClick={() => {
                        closeViewMoreModal();
                        openConfirmModal(selectedBidDetails, 'reject');
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Reject Bid'}
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      onClick={() => {
                        closeViewMoreModal();
                        openConfirmModal(selectedBidDetails, 'accept');
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Accept Bid'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>

        {/* Confirm Modal */}
        <Modal
          isOpen={isConfirmModalOpen}
          onRequestClose={closeConfirmModal}
          style={modalStyles}
          contentLabel="Confirm Action"
          shouldCloseOnOverlayClick={true}
          shouldCloseOnEsc={true}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              {selectedTrucker?.action === 'reject' 
                ? 'Are you sure you want to reject this bid?' 
                : 'Are you sure you want to accept this bid?'}
            </h2>
            {selectedTrucker && (
              <div className="mt-4">
                <p><strong>Driver Name:</strong> {selectedTrucker.truckInfo.driverName}</p>
                <p><strong>Truck Type:</strong> {selectedTrucker.truckInfo.truckType}</p>
                <p><strong>Location:</strong> {selectedTrucker.truckInfo.location}</p>
                <p><strong>Bid Price:</strong> ${selectedTrucker.negotiationPrice}</p>
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-4">
              <button 
                className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={closeConfirmModal}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
                  selectedTrucker?.action === 'reject' 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={selectedTrucker?.action === 'reject' ? rejectBid : acceptBid}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (selectedTrucker?.action === 'reject' ? 'Reject' : 'Accept')}
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isResponseModalOpen}
          onRequestClose={() => setIsResponseModalOpen(false)}
          className="modal"
          overlayClassName="modal-overlay"
          shouldCloseOnOverlayClick={true}
          shouldCloseOnEsc={true}
          style={{
            ...modalStyles,
            content: {
              ...modalStyles.content,
              color: 'black',
            },
          }}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold">
              {responseMessage.includes('declined') ? 'Notice' : 
               responseMessage.includes('successfully') ? 'Success' : 'Error'}
            </h2>
            <p className="mt-2">{responseMessage}</p>
            <button 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => setIsResponseModalOpen(false)}
            >
              Close
            </button>
          </div>
        </Modal>
      </div>
    </ClientLayout>
  );
}

export default AvailableTrucks;
