
import React, { useState, useEffect } from 'react';
import TruckerLayout from '../../components/layouts/truckerLayout';
import LoadTable from '../../components/trucker/LoadTable';
import Modal from 'react-modal';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import { X } from 'lucide-react';

Modal.setAppElement('#root');

function MyLoads() {
  const [filter, setFilter] = useState('pending');
  const [pendingLoads, setPendingLoads] = useState([]);
  const [inTransitLoads, setInTransitLoads] = useState([]);
  const [deliveredLoads, setDeliveredLoads] = useState([]);
  const { accessToken } = useAuthStore();
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  useEffect(() => {
    if (filter === 'pending') {
      fetchPendingLoads();
    } else if (filter === 'in transit') {
      fetchInTransitLoads();
    }else if (filter === 'delivered') {
      fetchDeliveredLoads();
    }
  }, [filter, accessToken]);

  const fetchPendingLoads = async () => {
    try {
      const response = await axios.get(`${BACKEND_Local}/api/trucker/truck-requests`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Filter only pending loads
      const pending = response.data.filter(load => load.status === 'pending');
      setPendingLoads(pending);
    } catch (error) {
      console.error('Error fetching pending loads:', error);
    }
  };

  const fetchDeliveredLoads = async () => {
    try {
      const response = await axios.get(`${BACKEND_Local}/api/trucker/truck-requests`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Filter only delivered loads
      const delivered = response.data.filter(load => load.status === 'delivered');
      setDeliveredLoads(delivered);
    } catch (error) {
      console.error('Error fetching delivered loads:', error);
    }
  }

  const fetchInTransitLoads = async () => {
    try {
      const response = await axios.get(`${BACKEND_Local}/api/trucker/truck-requests`, {
        headers: {Authorization: `Bearer ${accessToken}`}
      });

      if (response.data && Array.isArray(response.data)) {
        // Sort by creation date and filter in-transit loads
        const sortedLoads = response.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .filter(load => load.status === 'in transit');
        setInTransitLoads(sortedLoads);
      } else {
        console.error('Unexpected response data:', response.data);
        setInTransitLoads([]);
      }
    } catch (error) {
      console.error('Error fetching in-transit loads:', error.response ? error.response.data : error.message);
      setInTransitLoads([]);
    }
  };

  const openJobModal = (load) => {
    setSelectedLoad(load);
    setIsJobModalOpen(true);
  };

  const closeJobModal = () => {
    setIsJobModalOpen(false);
    setSelectedLoad(null);
  };

  const renderContent = () => {
    switch (filter) {
      case 'pending':
        return <LoadTable currentLoads={pendingLoads} openJobModal={openJobModal} />;
      case 'in transit':
        return <LoadTable currentLoads={inTransitLoads} openJobModal={openJobModal} />;
      case 'delivered':
        return <LoadTable currentLoads={deliveredLoads} openJobModal={openJobModal} />;
      default:
        return null;
    }
  };

  return (
    <TruckerLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Jobs</h1>
        <div className="mb-4 flex flex-wrap">
          <button 
            className={`px-4 py-2 mr-2 mb-2 rounded-lg ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} 
            onClick={() => setFilter('pending')}
          >
            Pending Requests ({pendingLoads.length})
          </button>
          <button 
            className={`px-4 py-2 mr-2 mb-2 rounded-lg ${filter === 'in transit' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} 
            onClick={() => setFilter('in transit')}
          >
            In Transit Requests ({inTransitLoads.length})
          </button>
          <button 
            className={`px-4 py-2 mb-2 rounded-lg ${filter === 'delivered' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} 
            onClick={() => setFilter('delivered')}
          >
            Delivered Requests ({deliveredLoads.length})
          </button>
        </div>

        {renderContent()}

        {selectedLoad && (
          <Modal
            isOpen={isJobModalOpen}
            onRequestClose={closeJobModal}
            className="modal relative w-[95%] sm:w-[90%] md:w-full max-w-4xl mx-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-2xl mt-4 sm:mt-8 md:mt-20 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
            overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center backdrop-blur-sm p-4"
          >
            <div className="p-4 sm:p-6 md:p-8">
              <button
                onClick={closeJobModal}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} sm:size={24} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </button>

              <div className="mb-4 sm:mb-6 md:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Load Details
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                  Client: {selectedLoad.clientName}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6 md:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 text-sm sm:text-base">
                        📦
                      </span>
                      Load Information
                    </h3>
                    <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Goods Type</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedLoad.goodsType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Weight</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedLoad.weight} tonnes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                          {selectedLoad.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center">
                      <span className="bg-green-100 dark:bg-green-900 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 text-sm sm:text-base">
                        📍
                      </span>
                      Location Details
                    </h3>
                    <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Pick Up Location</p>
                        <p className="font-medium text-gray-900 dark:text-white break-words">
                          {selectedLoad.pickupLocation}
                        </p>
                      </div>
                      <div className="h-6 sm:h-8 border-l-2 border-dashed border-gray-300 dark:border-gray-600 ml-2"></div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Drop Off Location</p>
                        <p className="font-medium text-gray-900 dark:text-white break-words">
                          {selectedLoad.dropoffLocation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                
              </div>
            </div>
          </Modal>
        )}
      </div>
    </TruckerLayout>
  );
}

export default MyLoads;

