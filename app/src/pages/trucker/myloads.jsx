import React, { useState, useEffect } from 'react';
import TruckerLayout from '../../components/layouts/truckerLayout';
import Modal from 'react-modal';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import { modalStyles } from './modalStyles';
import { X } from 'lucide-react';
import Loader from '../../components/ui/Loader.jsx';
import { useTruckContext } from './truckContext';

Modal.setAppElement('#root');

function MyLoads() {
  // State management for loads, trucks and UI elements
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [negotiationPrice, setNegotiationPrice] = useState('');
  const [loads, setLoads] = useState([]);
  const { accessToken, clientID } = useAuthStore();
  const [trucks, setTrucks] = useState([]);
  const [selectedTrucks, setSelectedTrucks] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [inTransitLoads, setInTransitLoads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const { trucks: availableTrucks, assignTruckToLoad } = useTruckContext();
  const [selectedTruck, setSelectedTruck] = useState(null);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    // Fetch loads and trucks data when component mounts
    const fetchLoads = async () => {
      try {
        const response = await axios.get(`${BACKEND_Local}/api/trucker/truck-requests`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.log('Fetch Loads Response:', response);
        setLoads(response.data.reverse()); // Reverse the order of loads to show new ones on top
      } catch (error) {
        console.error('Error fetching loads:', error);
      }
    };

    const fetchTrucks = async () => {
      try {
        const response = await axios.get(`${BACKEND_Local}/api/trucker/trucks/${clientID}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.log('Fetched Trucks:', response.data);
        setTrucks(response.data);
      } catch (error) {
        console.error('Error fetching trucks:', error);
      }
    };

    fetchLoads();
    fetchTrucks();
  }, [accessToken, clientID]);

  useEffect(() => {
    console.log('Trucks State:', trucks);
  }, [trucks]);

  useEffect(() => {
    fetchInTransitLoads();
  }, [clientID, accessToken]);

  const fetchInTransitLoads = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_Local}/api/trucker/truck-requests/in-transit/${clientID}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      console.log('In-transit loads:', response.data);
      setInTransitLoads(response.data);
    } catch (error) {
      console.error('Error fetching in-transit loads:', error);
      if (error.response?.status !== 404) {
        setError('Failed to fetch in-transit loads');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateLoadStatus = async (loadId, newStatus) => {
    try {
      // First update the load status
      await axios.put(
        `${BACKEND_Local}/api/trucker/truck-requests/status/${loadId}`,
        { 
          status: newStatus,
          updateTime: new Date().toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      // Get the load details to find the associated truck
      const loadResponse = await axios.get(
        `${BACKEND_Local}/api/trucker/truck-requests/${loadId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (loadResponse.data && loadResponse.data.truckID) {
        let newTruckStatus;
        
        // Determine the new truck status based on the load status
        switch (newStatus) {
          case 'pending':
            newTruckStatus = 'assigned';
            break;
          case 'inTransit':
            newTruckStatus = 'intransit';
            break;
          case 'delivered':
            newTruckStatus = 'available';
            break;
          default:
            newTruckStatus = 'available';
        }

        // Update the truck status
        await axios.put(
          `${BACKEND_Local}/api/trucker/trucks/${loadResponse.data.truckID}`,
          {
            status: newTruckStatus,
            assignedLoad: newStatus === 'delivered' ? null : {
              loadId,
              status: newStatus,
              updatedAt: new Date().toISOString()
            }
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      }

      // Refresh the loads lists
      fetchInTransitLoads();
      const response = await axios.get(`${BACKEND_Local}/api/trucker/truck-requests`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setLoads(response.data.reverse());
    } catch (error) {
      console.error('Error updating load status:', error);
      setError('Failed to update load status');
    }
  };

  // Modal control functions
  const openJobModal = (load, showStatusBar = true) => {
    setSelectedLoad(load);
    setShowStatusBar(showStatusBar);
    setIsJobModalOpen(true);
  };

  const closeJobModal = () => {
    setIsJobModalOpen(false);
    setSelectedLoad(null);
    setResponseMessage('');
    setSelectedTrucks([]);
  };

  // Handle truck assignment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedTruck) {
      setResponseMessage('Please select a truck.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await assignTruckToLoad(selectedTruck, selectedLoad._id, {
        description: selectedLoad.goodsType,
        pickup: selectedLoad.pickupLocation,
        delivery: selectedLoad.dropoffLocation,
        price: negotiationPrice
      });

      if (result.success) {
        setResponseMessage('Truck assigned successfully!');
        setTimeout(() => {
          closeJobModal();
          fetchLoads(); // Refresh the loads list
        }, 1500);
      } else {
        setResponseMessage(result.error || 'Failed to assign truck');
      }
    } catch (error) {
      console.error('Error assigning truck:', error);
      setResponseMessage('Failed to assign truck');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (loadId) => {
    if (!selectedStatus) {
      setResponseMessage('Please select a status');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await updateLoadStatus(loadId, selectedStatus);
      setResponseMessage(`Status updated to ${selectedStatus} successfully!`);
      setSelectedStatus(''); // Reset selected status
    } catch (error) {
      setResponseMessage('Failed to update status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTable = (loadsArray) => {
    if (!loadsArray || loadsArray.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No loads found for this status
        </div>
      );
    }
    
    return (
      <div className={`p-2 ${loadsArray.length === 0 ? 'w-full' : 'w-fit'} shadow-lg bg-white rounded-xl`}>
        <table className={`${loadsArray.length === 0 ? 'w-full' : 'w-fit'} border-separate border-spacing-2`}>
          <thead>
            <tr>
              <th className='border border-slate-600 rounded-md bg-sky-800 text-white text-sm p-2'>Client Name</th>
              <th className='border border-slate-600 rounded-md bg-sky-800 text-white text-sm p-2'>Goods Type</th>
              <th className='border border-slate-600 rounded-md bg-sky-800 text-white text-sm p-2'>Pickup Location</th>
              <th className='border border-slate-600 rounded-md bg-sky-800 text-white text-sm p-2'>Dropoff Location</th>
              <th className='border border-slate-600 rounded-md bg-sky-800 text-white text-sm p-2'>Status</th>
              <th className='border border-slate-600 rounded-md bg-sky-800 text-white text-sm p-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadsArray.slice((currentPage - 1) * loadsPerPage, currentPage * loadsPerPage).map((load, index) => (
              <tr key={index} className='hover:bg-blue-500 hover:text-white'>
                <td className='border border-slate-600 rounded-md text-center text-xs p-1 w-1/6'>{load.clientName}</td>
                <td className='border border-slate-600 rounded-md text-center text-xs p-1 w-1/6'>{load.goodsType}</td>
                <td className='border border-slate-600 rounded-md text-center text-xs p-1 w-1/6'>{load.pickupLocation || 'N/A'}</td>
                <td className='border border-slate-600 rounded-md text-center text-xs p-1 w-1/6'>{load.dropoffLocation || 'N/A'}</td>
                <td className='border border-slate-600 rounded-md text-center p-1 w-1/6'>
                  {load.status === 'accepted' && (
                    <select
                      className="w-full p-1 rounded border border-gray-300 text-sm"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="in transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  )}
                  {load.status !== 'accepted' && load.status}
                </td>
                <td className='border border-slate-600 rounded-md text-center p-1 w-1/6'>
                  <div className="flex gap-2 justify-center">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition duration-200"
                      onClick={() => openJobModal(load)}
                    >
                      View Details
                    </button>
                    {load.status === 'accepted' && selectedStatus && (
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-800 transition duration-200 disabled:bg-gray-400"
                        onClick={() => handleStatusUpdate(load._id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Status'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {responseMessage && (
          <div className={`mt-4 p-2 rounded text-center ${
            responseMessage.includes('successfully') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {responseMessage}
          </div>
        )}
      </div>
    );
  };

  const filteredLoads = filter === 'inTransit' 
    ? inTransitLoads 
    : loads.filter(load => load.status === filter);

  const indexOfLastLoad = currentPage * loadsPerPage;
  const indexOfFirstLoad = indexOfLastLoad - loadsPerPage;
  const currentLoads = filteredLoads.slice(indexOfFirstLoad, indexOfLastLoad);

  function renderTrucks(trucksArray) {
    return trucksArray.map((truck, index) => (
      <div key={index} className="flex items-center">
        <input
          type="checkbox"
          value={truck._id}
          checked={selectedTrucks.includes(truck._id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTrucks([...selectedTrucks, truck._id]);
            } else {
              setSelectedTrucks(selectedTrucks.filter(id => id !== truck._id));
            }
          }}
          className="mr-2"
        />
        <label className="text-gray-700 text-sm sm:text-base">{truck.truckType} - {truck.driverName}</label>
      </div>
    ));
  }

  const renderTruckSelection = () => {
    const availableTrucksOnly = availableTrucks.filter(truck => 
      !truck.currentLoad && truck.status === 'available'
    );

    return (
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Available Truck
        </label>
        <select
          value={selectedTruck || ''}
          onChange={(e) => setSelectedTruck(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a truck</option>
          {availableTrucksOnly.map(truck => (
            <option key={truck._id} value={truck._id}>
              {truck.truckType} - {truck.driverName} ({truck.location})
            </option>
          ))}
        </select>
      </div>
    );
  };

  if (isLoading) return <div className="flex h-screen justify-center items-center"><Loader size="large" /></div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <TruckerLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Jobs</h1>
        <div className="mb-4 flex flex-wrap">
          <button 
            className={`px-4 py-2 mr-2 mb-2 rounded-lg ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} 
            onClick={() => setFilter('pending')}
          >
            Pending Requests
          </button>
          <button 
            className={`px-4 py-2 mr-2 mb-2 rounded-lg ${filter === 'inTransit' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} 
            onClick={() => setFilter('inTransit')}
          >
            In Transit
          </button>
          <button 
            className={`px-4 py-2 mb-2 rounded-lg ${filter === 'delivered' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} 
            onClick={() => setFilter('delivered')}
          >
            Delivered
          </button>
        </div>

        {/* Mobile View */}
        <div className="block lg:hidden">
          <div className="space-y-4">
            {currentLoads.map((load) => (
              <div key={load._id} className="bg-white rounded-lg shadow p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">{load.clientName}</div>
                    <div className="text-sm text-gray-600">{load.goodsType}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full mb-2
                      ${load.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        load.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                        load.status === 'in transit' ? 'bg-blue-100 text-blue-800' :
                        load.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {load.status}
                    </span>
                    <button
                      onClick={() => openJobModal(load)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-medium text-gray-500">Pick Up</div>
                    <div className="text-sm text-gray-900 break-words">{load.pickupLocation || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">Drop Off</div>
                    <div className="text-sm text-gray-900 break-words">{load.dropoffLocation || 'N/A'}</div>
                  </div>
                </div>
                {load.status === 'accepted' && (
                  <div className="mt-2">
                    <select
                      className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">Update Status</option>
                      <option value="in transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    {selectedStatus && (
                      <button
                        className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-gray-400 text-sm"
                        onClick={() => handleStatusUpdate(load._id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Status'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goods Type</th>
                  <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pick Up</th>
                  <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Off</th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentLoads.map((load) => (
                  <tr key={load._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="break-words">{load.clientName}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="break-words">{load.goodsType}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="break-words">{load.pickupLocation || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="break-words">{load.dropoffLocation || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {load.status === 'accepted' ? (
                        <select
                          className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                          <option value="">Update Status</option>
                          <option value="in transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${load.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            load.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                            load.status === 'in transit' ? 'bg-blue-100 text-blue-800' :
                            load.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {load.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                          onClick={() => openJobModal(load)}
                        >
                          View
                        </button>
                        {load.status === 'accepted' && selectedStatus && (
                          <button
                            className="text-green-600 hover:text-green-900 font-medium disabled:text-gray-400"
                            onClick={() => handleStatusUpdate(load._id)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? '...' : 'Update'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {'<<'}
            </button>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Page {currentPage} of {Math.ceil(filteredLoads.length / loadsPerPage)}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredLoads.length / loadsPerPage)}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === Math.ceil(filteredLoads.length / loadsPerPage)
                  ? 'text-gray-300'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
            <button
              onClick={() => paginate(Math.ceil(filteredLoads.length / loadsPerPage))}
              disabled={currentPage === Math.ceil(filteredLoads.length / loadsPerPage)}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === Math.ceil(filteredLoads.length / loadsPerPage)
                  ? 'text-gray-300'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {'>>'}
            </button>
          </nav>
        </div>

        {/* Response Message */}
        {responseMessage && (
          <div className={`mt-4 p-2 rounded text-center ${
            responseMessage.includes('successfully') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {responseMessage}
          </div>
        )}
      </div>
      {selectedLoad && (
        <Modal
          isOpen={isJobModalOpen}
          onRequestClose={closeJobModal}
          style={modalStyles}
          contentLabel="Job Details"
          className="dark:bg-gray-800"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        >
          <div className="relative w-full max-w-2xl mx-auto">
            <button
              onClick={closeJobModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>

            <div className="p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 dark:text-white pr-8">
                {selectedLoad.clientName}
              </h2>

              <div className="overflow-y-auto max-h-[70vh]">
                <table className="min-w-full bg-white dark:bg-gray-800">
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-700 dark:text-gray-300">Goods Type:</td>
                      <td className="py-2 dark:text-white">{selectedLoad.goodsType}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700 dark:text-gray-300">Weight:</td>
                      <td className="py-2 dark:text-white">{selectedLoad.weight} kg</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700 dark:text-gray-300">Pay Terms:</td>
                      <td className="py-2">{selectedLoad.payTerms}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700 dark:text-gray-300">Number of Trucks:</td>
                      <td className="py-2">{selectedLoad.numberOfTrucks}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700 dark:text-gray-300">Pickup Location:</td>
                      <td className="py-2">{selectedLoad.pickupLocation || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700 dark:text-gray-300">Dropoff Location:</td>
                      <td className="py-2">{selectedLoad.dropoffLocation || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700 dark:text-gray-300">Status:</td>
                      <td className="py-2">{selectedLoad.status}</td>
                    </tr>
                  </tbody>
                </table>

                {selectedLoad.status === 'pending' && (
                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="space-y-4">
                      {renderTruckSelection()}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Negotiation Price
                        </label>
                        <input
                          type="number"
                          value={negotiationPrice}
                          onChange={(e) => setNegotiationPrice(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedTruck}
                      className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-400"
                    >
                      {isSubmitting ? 'Assigning...' : 'Assign Truck'}
                    </button>
                    {responseMessage && (
                      <div className={`mt-2 text-sm ${
                        responseMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {responseMessage}
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </TruckerLayout>
  );
}

export default MyLoads;
