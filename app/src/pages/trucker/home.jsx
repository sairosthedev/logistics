import React, { useState, useEffect } from 'react';
import TruckerLayout from '../../components/layouts/truckerLayout';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '600px',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'var(--modal-bg)',
    color: 'var(--text-primary)',
  },
};

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
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
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
        setAcceptedBids(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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

    fetchLoads();
    fetchAcceptedBids();
    fetchTrucks();
  }, [accessToken, clientID]);

  const openJobModal = (load) => {
    setSelectedLoad(load);
    setIsJobModalOpen(true);
  };

  const closeJobModal = () => {
    setIsJobModalOpen(false);
    setSelectedLoad(null);
    setResponseMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const selectedTruckDetails = trucks.find(truck => truck._id === selectedTruck);
    if (!selectedTruckDetails) {
      console.error('Selected truck not found');
      setResponseMessage('Please assign a truck first.');
      setIsSubmitting(false);
      return;
    }

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
      },
      offerAmount: parseFloat(negotiationPrice)
    };

    console.log('Payload:', payload);

    try {
      const response = await axios.post(`${BACKEND_Local}/api/trucker/truck-requests/bid`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('Negotiation Response:', response);
      setResponseMessage('Truck assigned successfully!');
      setTimeout(() => {
        closeJobModal();
      }, 2000);
    } catch (error) {
      console.error('Error submitting negotiation:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
      setResponseMessage('Failed to assign truck. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRequestStatus = async (requestID, status) => {
    try {
      const response = await axios.put(`${BACKEND_Local}/api/trucker/truck-requests/status/${requestID}`, { status }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('Status Update Response:', response);
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

  function renderTrucks(trucks) {
    return trucks.map(truck => (
      <div key={truck._id} className="flex items-center">
        <input
          type="radio"
          name="selectedTruck"
          value={truck._id}
          onChange={(e) => setSelectedTruck(e.target.value)}
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
                              <label className="flex items-center text-gray-700 dark:text-gray-200">
                                <input type="checkbox" className="mr-2" onChange={() => updateRequestStatus(bid.requestID, 'pending')} />
                                Pending
                              </label>
                              <label className="flex items-center text-gray-700 dark:text-gray-200">
                                <input type="checkbox" className="mr-2" onChange={() => updateRequestStatus(bid.requestID, 'inTransit')} />
                                In Transit
                              </label>
                              <label className="flex items-center text-gray-700 dark:text-gray-200">
                                <input type="checkbox" className="mr-2" onChange={() => updateRequestStatus(bid.requestID, 'delivered')} />
                                Delivered
                              </label>
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
          style={customStyles}
          contentLabel="Job Details"
          className="dark:bg-gray-800"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 dark:text-white">{selectedLoad.clientName}</h2>
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
              </tbody>
            </table>
          </div>
          {selectedLoad.status === 'pending' && (
            <form onSubmit={handleSubmit} className="mt-4">
              <label className="block text-gray-700 dark:text-gray-300 text-base mb-2">Counter Offer:</label>
              <input
                type="number"
                value={negotiationPrice}
                onChange={(e) => setNegotiationPrice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter your counter offer"
                required
              />
              <label className="block text-gray-700 dark:text-gray-300 text-base mb-2">Assign Truck:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 dark:text-white">
                {renderTrucks(trucks)}
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded text-base hover:bg-green-600 transition duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Counter Offer'}
              </button>
              {responseMessage && (
                <div className={`mt-4 text-${responseMessage.includes('successfully') ? 'green' : 'red'}-500`}>
                  {responseMessage}
                </div>
              )}
            </form>
          )}
        </Modal>
      )}
    </TruckerLayout>
  );
}
export default Home;
