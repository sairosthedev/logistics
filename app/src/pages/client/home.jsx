import React, { useState, useEffect } from 'react';
import ClientLayout from '../../components/layouts/clientLayout';
import { Search, Star, User, Truck, MapPin, Calendar, Phone, Weight, DollarSign } from 'lucide-react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import JobsModal from './jobsModal';
import JobsSection from './jobsSection.jsx';

Modal.setAppElement('#root');

function ClientHome() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [clientJobs, setClientJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const { accessToken, clientID } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

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

  const filteredJobs = clientJobs.filter(job => {
    const matchesSearch = 
      (job.goodsType?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' || 
      (job.status?.toLowerCase() || '') === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const openModal = (job) => {
    setSelectedJob(job);
  };

  const closeModal = () => {
    setSelectedJob(null);
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
      // Update the job status in the clientJobs state
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
      // Simulate API call to add new load
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
      console.log('Removing  modal')
    }
  };

  const JobCard = ({ job }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
          <User className="mr-2" size={20} />
          {job.goodsType}
        </h3>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center text-gray-700">
          <Truck className="mr-2" size={18} />
          <span className="font-semibold">{job.truckInfo.truckType}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <MapPin className="mr-2" size={18} />
          <span>{job.pickupLocation}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2" size={18} />
          <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${
            job.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {job.status}
          </span>
        </div>
        <div className="flex items-center text-gray-700">
          <Phone className="mr-2" size={18} />
          <span>{job.truckInfo.driverPhone}</span>
        </div>
        <div className="flex items-center text-gray-700">
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
        <div className="flex items-center text-gray-700">
          <Weight className="mr-2" size={18} />
          <span>{job.truckInfo.maxCarryingWeight}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <DollarSign className="mr-2" size={18} />
          <span>{job.offerAmount}</span>
        </div>
        {job.status === 'bid' && (
          <button 
            className="w-full mt-4 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors duration-300"
            onClick={() => acceptBid(job._id)}
            disabled={isLoading}
          >
            {isLoading ? 'Accepting...' : 'Accept Offer'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <ClientLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Client Dashboard</h1>
        
        <div className="mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="bid">Bid</option>
            <option value="in transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <JobsSection setError={setError}/>

        {error && <div className="mb-4 text-red-600">{error}</div>} {/* Display error message */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <JobCard key={index} job={job} />
            ))
          ) : (
            <div className="text-center py-8 sm:py-10 col-span-full">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-600">No jobs found.</h2>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {isResponseModalOpen && (
          <Modal
            isOpen={isResponseModalOpen}
            onRequestClose={() => setIsResponseModalOpen(false)}
            className="modal"
            overlayClassName="modal-overlay"
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
      </div>
      {isModalOpen && (
        <JobsModal 
          isOpen={isModalOpen} 
          onRequestClose={() => setIsModalOpen(false)} 
          onSubmit={addNewLoad} 
          selectedLoad={selectedJob} 
          isLoading={isLoading}
        />
      )}
    </ClientLayout>
  );
}

export default ClientHome;
