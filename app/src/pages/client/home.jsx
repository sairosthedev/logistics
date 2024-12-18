import React, { useState, useEffect } from 'react';
import ClientLayout from '../../components/layouts/clientLayout';
import { Star, User, Truck, MapPin, Calendar, Phone, Weight, DollarSign } from 'lucide-react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import JobsModal from './jobsModal';
import JobsSection from './jobsSection.jsx';

Modal.setAppElement('#root'); //abc

function ClientHome() {
  const [clientJobs, setClientJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const { accessToken, clientID } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  useEffect(() => {
    const fetchClientJobs = async () => {
      try {
        const response = await axios.get(`${BACKEND_Local}/api/client/request-bids/${clientID}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setClientJobs(response.data);
      } catch (error) {
        console.error('Error fetching client jobs:', error);
      }
    };

    fetchClientJobs();
  }, [accessToken, clientID]);

  const openModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setIsModalOpen(false);
  };

  const acceptBid = async (bidID) => {
    setIsLoading(true);
    setResponseMessage('');
    try {
      const response = await axios.put(`${BACKEND_Local}/api/client/request-bids/accept/${bidID}`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setClientJobs(prevJobs => prevJobs.map(job => 
        job._id === bidID ? { ...job, status: 'accepted' } : job
      ));
      setResponseMessage('Offer accepted successfully!');
    } catch (error) {
      console.error('Error accepting bid:', error);
      setResponseMessage('Failed to accept the offer. Please try again.');
    } finally {
      setIsLoading(false);
      setIsResponseModalOpen(true);
    }
  };

  const addNewLoad = async (newLoad) => {
    console.log('Adding load')
    setIsLoading(true);
    setResponseMessage('');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setClientJobs([...clientJobs, { ...newLoad, id: clientJobs.length + 1, status: "pending" }]);
      setResponseMessage('New load added successfully!');
      console.log('Added load')
    } catch (error) {
      console.error('Error adding new load:', error);
      setResponseMessage('Failed to add new load. Please try again.');
    } finally {
      setIsLoading(false);
      closeModal();
      setIsResponseModalOpen(true);
      console.log('Removing modal')
    }
  };

  const JobCard = ({ job }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="text-lg font-semibold text-white">{job.goodsType}</h3>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Calendar className="mr-2" size={18} />
          <span>{new Date(job.pickupDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <User className="mr-2" size={18} />
          <span>{job.truckInfo.driverName}</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Phone className="mr-2" size={18} />
          <span>{job.truckInfo.driverPhone}</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Star className="mr-2" size={18} />
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`${
                  i < Math.floor(job.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-semibold">{job.rating}</span>
          </div>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Weight className="mr-2" size={18} />
          <span>{job.truckInfo.maxCarryingWeight}</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <DollarSign className="mr-2" size={18} />
          <span>{job.bidAmount}</span>
        </div>
        <div className="mt-4">
          <button
            onClick={() => openModal(job)}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ClientLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Request a Truck</h1>
          <p className="text-gray-600 dark:text-gray-400">Fill in your details below to place a new truck request</p>
        </div>
        
        <div>
          <JobsSection 
            setError={setError}
            setShowMap={setShowMap}
            setOriginCoords={setOriginCoords}
            setDestinationCoords={setDestinationCoords}
          />
        </div>

        {error && <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>}

        {isResponseModalOpen && (
          <Modal
            isOpen={isResponseModalOpen}
            onRequestClose={() => setIsResponseModalOpen(false)}
            overlayClassName="modal-overlay"
            style={{
              content: {
                backgroundColor: isDarkMode ? '#1F2937' : 'white',
                color: isDarkMode ? '#F3F4F6' : '#111827',
                border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
              },
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
              },
            }}
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold dark:text-gray-100">
                {responseMessage.includes('successfully') ? 'Success' : 'Error'}
              </h2>
              <p className="mt-2 dark:text-gray-300">{responseMessage}</p>
              <button 
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                onClick={() => setIsResponseModalOpen(false)}
              >
                Close
              </button>
            </div>
          </Modal>
        )}

        <JobsModal 
          isOpen={isModalOpen} 
          onRequestClose={closeModal} 
          onSubmit={addNewLoad} 
          selectedLoad={selectedJob} 
          isLoading={isLoading}
        />
      </div>
    </ClientLayout>
  );
}

export default ClientHome;
