import React, { useState, useEffect } from 'react';
import TruckerLayout from '../../components/layouts/truckerLayout';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import Modal from 'react-modal';
import { modalStyles } from './modalStyles';

Modal.setAppElement('#root');

function Home() {
  const { accessToken, clientID } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loads, setLoads] = useState([]);
  const [acceptedBids, setAcceptedBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleLoads, setVisibleLoads] = useState(6);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [negotiationPrice, setNegotiationPrice] = useState('');
  const [trucks, setTrucks] = useState([]);
  const [selectedTrucks, setSelectedTrucks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const fetchLoads = async () => {
    try {
      const response = await axios.get(`${BACKEND_Local}/api/trucker/truck-requests`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setLoads(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching loads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedBids = async () => {
    try {
      const response = await axios.get(`${BACKEND_Local}/api/trucker/request-bids/trucker/${clientID}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      // Filter out delivered bids before setting state
      const nonDeliveredBids = response.data.filter(bid => bid.status !== 'delivered');
      setAcceptedBids(nonDeliveredBids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching accepted bids:', error);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await axios.get(`${BACKEND_Local}/api/trucker/trucks/${clientID}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setTrucks(response.data);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    }
  };

  useEffect(() => {
    fetchLoads();
    fetchAcceptedBids();
    fetchTrucks();
  }, [accessToken, clientID]);

  const openJobModal = (load) => {
    setSelectedLoad(load);
    setIsJobModalOpen(true);
    setSelectedTrucks([]);
  };

  const closeJobModal = () => {
    setSelectedLoad(null); // Move this after modal closes
    setResponseMessage('');
    setSelectedTrucks([]);
    setIsJobModalOpen(false);
  };

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
          estimatedPrice: selectedLoad.estimatedPrice,
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
          }
        };

        return axios.post(`${BACKEND_Local}/api/trucker/truck-requests/bid`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      });

      await Promise.all(assignmentPromises);
      setResponseMessage('Trucks assigned successfully!');
      
      // Refresh data after successful submission
      await fetchLoads();
      await fetchAcceptedBids();
      
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

  const updateRequestStatus = async (requestID, status) => {
    try {
      await axios.put(`${BACKEND_Local}/api/trucker/truck-requests/status/${requestID}`, 
        { status: status }, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // If status is delivered, remove the bid from acceptedBids immediately
      if (status === 'delivered') {
        setAcceptedBids(prev => prev.filter(bid => bid.requestID !== requestID));
      } else {
        // Only refresh data if not delivered
        await fetchLoads();
        await fetchAcceptedBids();
      }
      
      setResponseMessage('Status updated successfully!');
      setTimeout(() => {
        setResponseMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
      setResponseMessage('Failed to update status. Please try again.');
    }
  };

  const filteredLoads = loads.filter(load => load.status === 'pending');
  const filteredAcceptedBids = acceptedBids.filter(bid => bid.status === 'accepted');

  const handleTruckSelection = (truckId) => {
    setSelectedTrucks(prev => {
      if (prev.includes(truckId)) {
        return prev.filter(id => id !== truckId);
      } else {
        return [...prev, truckId];
      }
    });
  };

  function renderTrucks(trucks) {
    return trucks.map(truck => (
      <div key={truck._id} className="flex items-center">
        <input
          type="checkbox"
          checked={selectedTrucks.includes(truck._id)}
          onChange={() => handleTruckSelection(truck._id)}
          className="mr-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <span className="dark:text-gray-200">{truck.truckType} - {truck.driverName}</span>
      </div>
    ));
  }

  return (
    <TruckerLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Trucker Dashboard</h1>

        <div className="mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search loads..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Link to="myloads" className="flex-1">
            <div className="border rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 p-4 hover:shadow-lg text-white transition duration-200 transform hover:scale-105">
              <h2 className="text-xl font-bold">Job Management & Requests</h2>
              <p className="mt-1 text-sm">View and manage your loads</p>
            </div>
          </Link>

          <Link to="trucks" className="flex-1">
            <div className="border rounded-lg bg-gradient-to-r from-green-500 to-green-700 p-4 hover:shadow-lg text-white transition duration-200 transform hover:scale-105">
              <h2 className="text-xl font-bold">Trucks</h2>
              <p className="mt-1 text-sm">View available trucks</p>
            </div>
          </Link>

          <Link to="services" className="flex-1">
            <div className="border rounded-lg bg-gradient-to-r from-red-500 to-red-700 p-4 hover:shadow-lg text-white transition duration-200 transform hover:scale-105">
              <h2 className="text-xl font-bold">Services</h2>
              <p className="mt-1 text-sm">Track your services</p>
            </div>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row lg:gap-32 gap-6 ">
          <div className="loadHighlights mt-10 flex-1">
            <div className="max-w-screen-xl mx-auto">
              <div className="items-start justify-between md:flex">
                <div className="max-w-lg">
                  <h3 className="text-gray-800 dark:text-white text-2xl font-bold sm:text-3xl">
                    Pending Requests
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    All your pending requests at a glance.
                  </p>
                </div>
              </div>
              <div className="mt-12 flex flex-col gap-10 w-full">
                {loading ? (
                  <div className="text-center py-10">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300">Loading...</h2>
                  </div>
                ) : (
                  filteredLoads.length > 0 ? (
                    filteredLoads.slice(0, visibleLoads).map((load, index) => (
                      <div key={index} className="bg-sky-800 dark:bg-sky-900 rounded-t-lg rounded-b-sm shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
                        <div className='w-full h-full bg-blue-800'>
                          <div className=" px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0">
                            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                              {load.clientName}
                            </h3>
                          </div>
                          <div className="p-4 sm:p-6 space-y-4 flex-grow bg-white dark:bg-gray-800 rounded-t-xl rounded-b-sm">
                          <div className="flex items-center text-gray-700 dark:text-gray-200">
                            <span className="font-semibold">Goods Type: {load.goodsType}</span>
                          </div>
                          <div className="flex items-center text-gray-700 dark:text-gray-200">
                            <span>Pickup: {load.pickupLocation || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-gray-700 dark:text-gray-200">
                            <span>Dropoff: {load.dropoffLocation || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-gray-700 dark:text-gray-200">
                            <span>Status: {load.status}</span>
                          </div>
                          <button className="mt-2 sm:mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200 transform hover:scale-105" onClick={() => openJobModal(load)}>View Details</button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-10">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300">No pending requests found.</h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filters</p>
                    </div>
                  )
                )}
              </div>
              {filteredLoads.length > visibleLoads && (
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200 transform hover:scale-105"
                  onClick={() => setVisibleLoads(visibleLoads + 6)}
                >
                  View More
                </button>
              )}
            </div>
          </div>

          <div className="acceptedBids mt-10 flex-1">
            <div className="max-w-screen-xl mx-auto">
              <div className="items-start justify-between md:flex">
                <div className="max-w-lg">
                  <h3 className="text-gray-800 dark:text-white text-2xl font-bold sm:text-3xl">
                    Accepted Bids
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    All your accepted bids at a glance.
                  </p>
                </div>
              </div>
              <div className="mt-12 flex flex-col gap-6">
                {loading ? (
                  <div className="text-center py-10">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300">Loading...</h2>
                  </div>
                ) : (
                  filteredAcceptedBids.length > 0 ? (
                    filteredAcceptedBids.slice(0, visibleLoads).map((bid, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-t-lg rounded-b-sm shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
                        <div className='w-full h-full bg-sky-800 dark:bg-sky-900'>
                          <div className="px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0">
                            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                              {bid.clientName}
                            </h3>
                          </div>
                          <div className="p-4 sm:p-6 space-y-4 flex-grow bg-white dark:bg-gray-800 rounded-t-xl rounded-b-sm">
                            <div className="flex items-center text-gray-700 dark:text-gray-200">
                              <span className="font-semibold">Goods Type: {bid.goodsType}</span>
                            </div>
                            <div className="flex items-center text-gray-700 dark:text-gray-200">
                              <span>Pickup: {bid.pickupLocation || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-gray-700 dark:text-gray-200">
                              <span>Dropoff: {bid.dropoffLocation || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-gray-700 dark:text-gray-200">
                              <span>Status: {bid.status}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <button 
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                onClick={() => updateRequestStatus(bid.requestID, 'pending')}
                              >
                                Pending
                              </button>
                              <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                onClick={() => updateRequestStatus(bid.requestID, 'inTransit')}
                              >
                                In Transit
                              </button>
                              <button
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                onClick={() => updateRequestStatus(bid.requestID, 'delivered')}
                              >
                                Delivered
                              </button>
                            </div>
                            <button
                              className="mt-2 sm:mt-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-200 transform hover:scale-105"
                              onClick={() => openJobModal(bid)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-10">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300">No accepted bids found.</h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filters</p>
                    </div>
                  )
                )}
              </div>
              {filteredAcceptedBids.length > visibleLoads && (
                <button
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-200 transform hover:scale-105"
                  onClick={() => setVisibleLoads(visibleLoads + 6)}
                >
                  View More
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedLoad && (
        <Modal
          isOpen={isJobModalOpen}
          onRequestClose={closeJobModal}
          style={modalStyles}
          contentLabel="Job Details"
          className="dark:bg-gray-800"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="relative">
            <button
              onClick={closeJobModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl sm:text-2xl font-bold mb-4 dark:text-white pr-8">
              {selectedLoad.clientName}
            </h2>
            
            <div className="overflow-y-auto max-h-[70vh]">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800">
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-700 dark:text-gray-300">Goods Type:</td>
                      <td className="py-2 dark:text-white">{selectedLoad.goodsType}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700 dark:text-gray-300">Weight:</td>
                      <td className="py-2">{selectedLoad.weight} Tons</td>
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
                    <tr>
                      <td className="py-2 text-gray-700 dark:text-gray-300">Estimated Price:</td>
                      <td className="py-2">${selectedLoad.estimatedPrice}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700 dark:text-gray-300">Comments:</td>
                      <td className="py-2">{selectedLoad.comments}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {selectedLoad.status === 'pending' && (
                <form onSubmit={handleSubmit} className="mt-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-base mb-2">Assign Trucks ({selectedTrucks.length}/{selectedLoad.numberOfTrucks} selected):</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 dark:text-white">
                    {renderTrucks(trucks)}
                  </div>
                  <button
                    type="submit"
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded text-base hover:bg-green-600 transition duration-200"
                    disabled={isSubmitting || selectedTrucks.length === 0 || selectedTrucks.length > selectedLoad.numberOfTrucks}
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
        </Modal>
      )}
    </TruckerLayout>
  );
}
export default Home;
