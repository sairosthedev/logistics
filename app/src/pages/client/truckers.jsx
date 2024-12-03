import React, { useState, useEffect } from 'react';
import { Truck, User, MapPin, Phone, Star, Weight, Calendar, DollarSign, ChevronUp, ChevronDown, Search } from 'lucide-react';
import ClientLayout from '../../components/layouts/clientLayout';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import Modal from 'react-modal';

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

  useEffect(() => {
    const fetchTruckers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BACKEND_Local}/api/client/request-bids/${clientID}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        // Separate truckers into accepted and non-accepted
        const allTruckers = response.data;
        const accepted = allTruckers.filter(trucker => trucker.status === 'accepted');
        const available = allTruckers.filter(trucker => trucker.status !== 'accepted');
        
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

    fetchTruckers();
  }, [accessToken, clientID]);

  const filteredTruckers = truckers.filter(trucker => {
    const matchesSearch = searchTerm === '' || (
      (trucker.truckInfo.driverName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (trucker.truckInfo.truckType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (trucker.truckInfo.driverPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    
    const matchesAvailability = 
      filterAvailability === 'all' || 
      (trucker.status?.toLowerCase() || '') === filterAvailability.toLowerCase();

    return matchesSearch && matchesAvailability;
  });

  // Calculate pagination for available truckers
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTruckers = filteredTruckers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTruckers.length / itemsPerPage);

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
    return (
      <div className="flex justify-center items-center space-x-4 mt-4 mb-6">
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
        <span className="text-sm text-gray-700 dark:text-gray-200">
          Page {currentPage} of {totalPages}
        </span>
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

  const openConfirmModal = (trucker) => {
    setSelectedTrucker(trucker);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setSelectedTrucker(null);
    setIsConfirmModalOpen(false);
  };

  const acceptBid = async () => {
    setIsLoading(true);
    setResponseMessage('');
    try {
      const response = await axios.put(`${BACKEND_Local}/api/client/request-bids/accept/${selectedTrucker._id}`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setAcceptedTruckers(prevAccepted => [...prevAccepted, { ...selectedTrucker, status: 'accepted' }]);
      setTruckers(prevTruckers => prevTruckers.filter(trucker => trucker._id !== selectedTrucker._id));
      setResponseMessage('Offer accepted successfully!');
    } catch (error) {
      console.error('Error accepting bid:', error);
      setResponseMessage('Failed to accept the offer. Please try again.');
    } finally {
      setIsLoading(false);
      setIsConfirmModalOpen(false);
      setIsResponseModalOpen(true);
    }
  };

  const modalStyles = {
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000, // Ensure the modal content is above other elements
      backgroundColor: 'white', // Ensure background is set
      border: '1px solid #ccc',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    overlay: {
      zIndex: 999, // Ensure the overlay is above other elements
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim the background
    },
  };

  return (
    <ClientLayout>
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Truckers</h1>
            <button
              onClick={() => setIsAcceptedOffersVisible(!isAcceptedOffersVisible)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isAcceptedOffersVisible ? (
                <>
                  <ChevronUp className="w-5 h-5 mr-2" />
                  Hide Accepted Offers ({acceptedTruckers.length})
                </>
              ) : (
                <>
                  <ChevronDown className="w-5 h-5 mr-2" />
                  Show Accepted Offers ({acceptedTruckers.length})
                </>
              )}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search truckers..."
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

        {/* Available Truckers Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6">
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Truckers</h2>
          </div>
          <div className="w-full min-w-full">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-400">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Driver Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Truck Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Contact</th>
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
                        {trucker.truckInfo.driverPhone}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {trucker.status !== 'accepted' && (
                        <button 
                          className="px-2 py-1 text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
                          onClick={() => openConfirmModal(trucker)}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Accepting...' : 'Accept'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Accepted Offers Table - Collapsible */}
        <div className={`transition-all duration-300 ease-in-out ${isAcceptedOffersVisible ? 'opacity-100 max-h-[2000px] mb-6' : 'opacity-0 max-h-0 overflow-hidden mb-0'}`}>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Accepted Offers</h2>
            </div>
            <div className="w-full min-w-full">
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
            <PaginationControls
              totalPages={totalAcceptedPages}
              currentPage={acceptedOffersPage}
              onPageChange={handleAcceptedPageChange}
            />
          </div>
        </div>

        <Modal
          isOpen={isConfirmModalOpen}
          onRequestClose={closeConfirmModal}
          className="modal"
          overlayClassName="modal-overlay"
          shouldCloseOnOverlayClick={true}
          shouldCloseOnEsc={true}
          style={modalStyles}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold">Are you sure you want to accept this offer?</h2>
            <div className="mt-4">
              <p><strong>Driver Name:</strong> {selectedTrucker?.truckInfo.driverName}</p>
              <p><strong>Truck Type:</strong> {selectedTrucker?.truckInfo.truckType}</p>
              <p><strong>Location:</strong> {selectedTrucker?.truckInfo.location}</p>
              <p><strong>Max Carrying Weight:</strong> {selectedTrucker?.maxCarryingWeight}</p>
              <p><strong>Offer Amount:</strong> {selectedTrucker?.offerAmount}</p>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button 
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                onClick={closeConfirmModal}
              >
                Cancel
              </button>
              <button 
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={acceptBid}
                disabled={isLoading}
              >
                {isLoading ? 'Accepting...' : 'Accept'}
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
          style={modalStyles}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold">{responseMessage.includes('successfully') ? 'Success' : 'Error'}</h2>
            <p className="mt-2">{responseMessage}</p>
            <button 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
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
