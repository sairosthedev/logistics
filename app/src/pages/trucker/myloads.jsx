import React, { useState, useEffect } from 'react';
import TruckerLayout from '../../components/layouts/truckerLayout';
import Modal from 'react-modal';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import { modalStyles } from './modalStyles';
import { X } from 'lucide-react';

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
  const [visibleLoads, setVisibleLoads] = useState(6); // Number of loads to show initially
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [inTransitLoads, setInTransitLoads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

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
  const openJobModal = (load) => {
    setSelectedLoad(load);
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

    if (selectedTrucks.length === 0) {
      setResponseMessage('Please assign at least one truck.');
      setIsSubmitting(false);
      return;
    }

    if (selectedTrucks.length > selectedLoad.numberOfTrucks) {
      setResponseMessage(`You can only assign up to ${selectedLoad.numberOfTrucks} trucks for this load.`);
      setIsSubmitting(false);
      return;
    }

    try {
      const assignmentPromises = selectedTrucks.map(async (truckId) => {
        const selectedTruckDetails = trucks.find(truck => truck._id === truckId);
        
        const payload = {
          requestID: selectedLoad._id,
          clientID: selectedLoad.clientID,
          numberOfTrucks: selectedLoad.numberOfTrucks,
          truckerID: clientID,
          pickupLocation: selectedLoad.pickupLocation,
          dropoffLocation: selectedLoad.dropoffLocation,
          pickupCoordinates: {
            latitude: selectedLoad.pickupCoordinates.lat,
            longitude: selectedLoad.pickupCoordinates.lng
          },
          dropoffCoordinates: {
            latitude: selectedLoad.dropoffCoordinates.lat,
            longitude: selectedLoad.dropoffCoordinates.lng
          },
          distance: selectedLoad.distance,
          route: selectedLoad.route,
          goodsType: selectedLoad.goodsType,
          payTerms: selectedLoad.payTerms,
          negotiationPrice: parseFloat(negotiationPrice),
          weight: selectedLoad.weight,
          truckID: selectedTruckDetails._id,
          truckInfo: {
            truckType: selectedTruckDetails.truckType,
            horse: selectedTruckDetails.horse,
            trailer1: selectedTruckDetails.trailer1,
            trailer2: selectedTruckDetails.trailer2,
            driverName: selectedTruckDetails.driverName,
            licence: selectedTruckDetails.licence,
            passport: selectedTruckDetails.passport,
            driverPhone: selectedTruckDetails.driverPhone,
            truckOwnerPhone: selectedTruckDetails.truckOwnerPhone,
            truckOwnerWhatsapp: selectedTruckDetails.truckOwnerWhatsapp,
            status: selectedTruckDetails.status
          },
          offerAmount: parseFloat(negotiationPrice)
        };

        return axios.post(`${BACKEND_Local}/api/trucker/truck-requests/bid`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      });

      await Promise.all(assignmentPromises);
      setResponseMessage('Trucks assigned successfully!');
      setTimeout(() => {
        closeJobModal();
      }, 2000);
    } catch (error) {
      console.error('Error submitting truck assignments:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
      setResponseMessage('Failed to assign trucks. Please try again.');
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
            {loadsArray.slice(0, visibleLoads).map((load, index) => (
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <TruckerLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Jobs</h1>
        <div className="mb-4 flex flex-wrap">
          <button className={`px-4 py-2 mr-2 mb-2 ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={() => setFilter('pending')}>Pending Requests</button>
          <button className={`px-4 py-2 mr-2 mb-2 ${filter === 'inTransit' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={() => setFilter('inTransit')}>In Transit</button>
          <button className={`px-4 py-2 mb-2 ${filter === 'delivered' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={() => setFilter('delivered')}>Delivered</button>
        </div>
        <div className="overflow-x-auto">
          <div className={`p-2 ${filteredLoads.length === 0 ? 'w-full' : 'w-fit'} shadow-lg bg-white dark:bg-gray-800 rounded-xl`}>
            <table className={`${filteredLoads.length === 0 ? 'w-full' : 'w-fit'} border-separate border-spacing-2`}>
              <thead>
                <tr>
                  <th className='border border-slate-600 rounded-md bg-sky-800 dark:bg-sky-900 text-white text-sm p-2'>Client Name</th>
                  <th className='border border-slate-600 rounded-md bg-sky-800 dark:bg-sky-900 text-white text-sm p-2'>Goods Type</th>
                  <th className='border border-slate-600 rounded-md bg-sky-800 dark:bg-sky-900 text-white text-sm p-2'>Pickup Location</th>
                  <th className='border border-slate-600 rounded-md bg-sky-800 dark:bg-sky-900 text-white text-sm p-2'>Dropoff Location</th>
                  <th className='border border-slate-600 rounded-md bg-sky-800 dark:bg-sky-900 text-white text-sm p-2'>Status</th>
                  <th className='border border-slate-600 rounded-md bg-sky-800 dark:bg-sky-900 text-white text-sm p-2'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoads.slice(0, visibleLoads).map((load, index) => (
                  <tr key={index} className='hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600'>
                    <td className='border border-slate-600 dark:border-slate-500 rounded-md text-center text-xs p-1 w-1/5 dark:text-gray-200'>{load.clientName}</td>
                    <td className='border border-slate-600 dark:border-slate-500 rounded-md text-center text-xs p-1 w-1/5 dark:text-gray-200'>{load.goodsType}</td>
                    <td className='border border-slate-600 dark:border-slate-500 rounded-md text-center text-xs p-1 w-1/5 dark:text-gray-200'>{load.pickupLocation || 'N/A'}</td>
                    <td className='border border-slate-600 dark:border-slate-500 rounded-md text-center text-xs p-1 w-1/5 dark:text-gray-200'>{load.dropoffLocation || 'N/A'}</td>
                    <td className='border border-slate-600 dark:border-slate-500 rounded-md text-center p-1 w-1/5'>
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
                    <td className='border border-slate-600 dark:border-slate-500 rounded-md text-center p-1 w-1/5'>
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
          </div>
          {filteredLoads.length > visibleLoads && (
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
              onClick={() => setVisibleLoads(visibleLoads + 6)}
            >
              View More
            </button>
          )}
        </div>
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
                    <label className="block text-gray-700 dark:text-gray-300 text-base mb-2">Assign Trucks:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 dark:text-white">
                      {renderTrucks(trucks)}
                    </div>
                    <button
                      type="submit"
                      className="mt-4 bg-green-500 text-white px-4 py-2 rounded text-base hover:bg-green-600 transition duration-200"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Assign Trucks'}
                    </button>
                    {responseMessage && (
                      <div className={`mt-4 text-${responseMessage.includes('successfully') ? 'green' : 'red'}-500`}>
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
