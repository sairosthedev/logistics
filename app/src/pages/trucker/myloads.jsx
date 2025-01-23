import daisyui from "daisyui"
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
            Pending  ({pendingLoads.length})
          </button>
          <button 
            className={`px-4 py-2 mr-2 mb-2 rounded-lg ${filter === 'in transit' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} 
            onClick={() => setFilter('in transit')}
          >
            In Transit ({inTransitLoads.length})
          </button>
          <button 
            className={`px-4 py-2 mb-2 rounded-lg ${filter === 'delivered' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} 
            onClick={() => setFilter('delivered')}
          >
            Delivered ({deliveredLoads.length})
          </button>
        </div>

        {renderContent()}

        {selectedLoad && (
          <Modal
            isOpen={isJobModalOpen}
            onRequestClose={closeJobModal}
            contentLabel="Load Details Modal"
            className="fixed inset-x-0 top-[80px] bottom-0 flex items-start justify-center p-2 sm:p-4 z-50"
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full sm:w-[95%] md:w-[90%] lg:w-[85%] max-w-5xl 
                            h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)] overflow-y-auto relative 
                            animate-modal-scale transform transition-all">
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Load Details
                  </h2>
                  <button
                    onClick={closeJobModal}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors 
                              border border-gray-200 dark:border-gray-600
                              focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close modal"
                  >
                    <X 
                      size={24} 
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" 
                    />
                  </button>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                  Client: {selectedLoad.clientName}
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {/* Load Information Card */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900 p-1.5 rounded-lg">📦</span>
                      Load Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-gray-600 dark:text-gray-400">Goods Type</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedLoad.goodsType}</span>
                      </div>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-gray-600 dark:text-gray-400">Weight</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedLoad.weight} tonnes</span>
                      </div>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                          {selectedLoad.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Details Card */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="bg-green-100 dark:bg-green-900 p-1.5 rounded-lg">📍</span>
                      Location Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Pick Up Location</p>
                        <p className="font-medium text-gray-900 dark:text-white break-words">
                          {selectedLoad.pickupLocation}
                        </p>
                      </div>
                      <div className="h-8 border-l-2 border-dashed border-gray-300 dark:border-gray-600 ml-2"></div>
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

