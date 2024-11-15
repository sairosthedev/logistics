import React, { useState, useEffect } from 'react';
import { Truck, User, MapPin, Phone, Star, Weight, Calendar, DollarSign } from 'lucide-react';
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
  const { accessToken, clientID } = useAuthStore();

  useEffect(() => {
    const fetchTruckers = async () => {
      try {
        const response = await axios.get(`${BACKEND_Local}/api/client/request-bids/${clientID}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setTruckers(response.data);
      } catch (error) {
        console.error('Error fetching truckers:', error);
      }
    };

    fetchTruckers();
  }, [accessToken, clientID]);

  const filteredTruckers = truckers.filter(trucker => {
    const matchesSearch = searchTerm === '' || (
      (trucker.truckInfo.driverName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (trucker.truckInfo.truckType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (trucker.truckInfo.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    
    const matchesAvailability = 
      filterAvailability === 'all' || 
      (trucker.truckInfo.status?.toLowerCase() || '') === filterAvailability.toLowerCase();

    return matchesSearch && matchesAvailability;
  });

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
      // Update the trucker status in the truckers state
      setTruckers(prevTruckers => prevTruckers.map(trucker => 
        trucker._id === selectedTrucker._id ? { ...trucker, truckInfo: { ...trucker.truckInfo, status: 'accepted' } } : trucker
      ));
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

  const TruckerCard = ({ trucker }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
          <User className="mr-2" size={20} />
          {trucker.truckInfo.driverName}
        </h3>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Truck className="mr-2" size={18} />
          <span className="font-semibold">{trucker.truckInfo.truckType}</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <MapPin className="mr-2" size={18} />
          <span>{trucker.truckInfo.location}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2" size={18} />
          <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${
            trucker.truckInfo.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {trucker.truckInfo.status}
          </span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Phone className="mr-2" size={18} />
          <span>{trucker.truckInfo.driverPhone}</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Star className="mr-2" size={18} />
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`${
                  i < Math.floor(trucker.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-semibold">{trucker.rating}</span>
          </div>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Weight className="mr-2" size={18} />
          <span>{trucker.truckInfo.maxCarryingWeight}</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <DollarSign className="mr-2" size={18} />
          <span>{trucker.offerAmount}</span>
        </div>
        <button 
          className="w-full mt-4 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors duration-300"
          onClick={() => openConfirmModal(trucker)}
          disabled={isLoading}
        >
          {isLoading ? 'Accepting...' : 'Accept Offer'}
        </button>
      </div>
    </div>
  );

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Available Truckers</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, truck, or location..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="in transit">In Transit</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTruckers.map((trucker, index) => (
            <TruckerCard key={index} trucker={trucker} />
          ))}
        </div>

        {filteredTruckers.length === 0 && (
          <div className="text-center py-8 sm:py-10">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-600">No truckers found</h2>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {isConfirmModalOpen && (
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
              <p><strong>Max Carrying Weight:</strong> {selectedTrucker?.truckInfo.maxCarryingWeight}</p>
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
      )}

      {isResponseModalOpen && (
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
      )}
    </ClientLayout>
  );
}

export default AvailableTrucks;
