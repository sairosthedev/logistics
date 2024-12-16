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
  const [currentPage, setCurrentPage] = useState(1);
  const [loadsPerPage] = useState(10);
  const [visibleLoads, setVisibleLoads] = useState(6);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [negotiationPrice, setNegotiationPrice] = useState('');
  const [trucks, setTrucks] = useState([]);
  const [selectedTrucks, setSelectedTrucks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [currentBidPage, setCurrentBidPage] = useState(1);
  const [bidsPerPage] = useState(10);

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
      // First, update the load status to 'accepted'
      await axios.put(
        `${BACKEND_Local}/api/trucker/truck-requests/status/${selectedLoad._id}`,
        { status: 'accepted' },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Process each truck assignment
      for (const truckId of selectedTrucks) {
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
            status: 'accepted'  // Set the status to accepted
          }
        };

        await axios.post(
          `${BACKEND_Local}/api/trucker/truck-requests/bid`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
      }

      setResponseMessage('Trucks assigned successfully!');
      
      // Immediately update the local state
      setLoads(prevLoads => prevLoads.filter(load => load._id !== selectedLoad._id));
      
      // Fetch fresh data
      await Promise.all([
        fetchLoads(),
        fetchAcceptedBids()
      ]);

      // Close the modal after a short delay
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
      console.log('Attempting to update status for request:', requestID, 'to:', status);

      const response = await axios.put(
        `${BACKEND_Local}/api/trucker/truck-requests/status/${requestID}`, 
        { 
          status: status,
          truckerID: clientID
        }, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response from server:', response);

      if (response.status === 200) {
        console.log('Status updated successfully:', response.data);

        // Update the selected load's status
        setSelectedLoad(prev => ({
          ...prev,
          status: status
        }));

        // Update the loads state to reflect the new status
        setLoads(prevLoads => 
          prevLoads.map(load => 
            load._id === requestID 
              ? { ...load, status: status }
              : load
          )
        );

        // Update the acceptedBids state
        setAcceptedBids(prev => 
          prev.map(bid => 
            bid._id === requestID 
              ? { ...bid, status: status }
              : bid
          )
        );

        // If status is delivered, remove the bid from acceptedBids immediately
        if (status === 'delivered') {
          setAcceptedBids(prev => prev.filter(bid => bid._id !== requestID));
        }

        setResponseMessage('Status updated successfully!');
        setTimeout(() => {
          setResponseMessage('');
        }, 2000);

        // Optionally re-fetch data to ensure UI is in sync with backend
        await fetchLoads();
        await fetchAcceptedBids();

      } else {
        console.error('Failed to update status:', response.data);
        setResponseMessage('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
      setResponseMessage('Failed to update status. Please try again.');
    }
  };

  const indexOfLastLoad = currentPage * loadsPerPage;
  const indexOfFirstLoad = indexOfLastLoad - loadsPerPage;
  const filteredLoads = loads.filter(load => {
    const matchesSearch = load.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.goodsType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || load.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  const currentLoads = filteredLoads.slice(indexOfFirstLoad, indexOfLastLoad);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  // Get current bids
  const indexOfLastBid = currentBidPage * bidsPerPage;
  const indexOfFirstBid = indexOfLastBid - bidsPerPage;
  const currentBids = acceptedBids.slice(indexOfFirstBid, indexOfLastBid);

  // Change bid page
  const paginateBids = (pageNumber) => setCurrentBidPage(pageNumber);

  const StatusActionBar = ({ bid, onStatusUpdate }) => {
    const statusSteps = [
      { status: 'loaded', label: 'Loaded', color: 'blue' },
      { status: 'in transit', label: 'In Transit', color: 'orange' },
      { status: 'delivered', label: 'Delivered', color: 'green' }
    ];

    const getCurrentStepIndex = () => {
      // If status is 'accepted', return -1 so we can start with 'loaded'
      if (bid.status === 'accepted') return -1;
      return statusSteps.findIndex(step => step.status === bid.status);
    };

    return (
      <div className="mt-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Update Status</h3>
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          {statusSteps.map((step, index) => {
            const currentStep = getCurrentStepIndex();
            const isCompleted = index <= currentStep;
            const isActive = index === currentStep;
            const isNextStep = index === currentStep + 1;
            
            return (
              <div key={step.status} className="flex-1 relative">
                {/* Connector line */}
                {index < statusSteps.length - 1 && (
                  <div className={`absolute top-1/2 left-1/2 w-full h-1 transform -translate-y-1/2
                    ${isCompleted ? `bg-${step.color}-500` : 'bg-gray-300 dark:bg-gray-600'}`}
                  />
                )}
                
                {/* Button */}
                <div className="relative flex flex-col items-center">
          <button
                    onClick={() => onStatusUpdate(bid.requestID, step.status)}
                    disabled={!isNextStep && !isActive}
                    className={`
                      w-32 px-4 py-2 rounded-full
                      transition-all duration-200 
                      ${isCompleted 
                        ? `bg-${step.color}-500 text-white hover:bg-${step.color}-600` 
                        : isNextStep
                          ? `bg-${step.color}-100 text-${step.color}-700 hover:bg-${step.color}-200 cursor-pointer`
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                      }
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${step.color}-500
                      ${isActive ? `ring-2 ring-${step.color}-500 ring-offset-2` : ''}
                    `}
                  >
                    {step.label}
          </button>
                  
                  {/* Status indicator dot */}
                  <div className={`
                    mt-2 w-3 h-3 rounded-full
                    ${isCompleted 
                      ? `bg-${step.color}-500` 
                      : 'bg-gray-300 dark:bg-gray-600'
                    }
                  `} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <TruckerLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8 font-sans">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Trucker Dashboard</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Link to="myloads" className="flex-1">
            <div className="border rounded-lg bg-gradient-to-r from-teal-400 to-cyan-600 p-4 hover:shadow-lg text-white transition duration-200 transform hover:scale-105">
              <h2 className="text-xl font-bold">Job Management & Requests</h2>
              <p className="mt-1 text-sm">View and manage your loads</p>
            </div>
          </Link>

          <Link to="trucks" className="flex-1">
            <div className="border rounded-lg bg-gradient-to-r from-purple-400 to-indigo-600 p-4 hover:shadow-lg text-white transition duration-200 transform hover:scale-105">
              <h2 className="text-xl font-bold">Trucks</h2>
              <p className="mt-1 text-sm">View available trucks</p>
            </div>
          </Link>

          <Link to="services" className="flex-1">
            <div className="border rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 p-4 hover:shadow-lg text-white transition duration-200 transform hover:scale-105">
              <h2 className="text-xl font-bold">Services</h2>
              <p className="mt-1 text-sm">Track your services</p>
            </div>
          </Link>
        </div>

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

        <div className="flex flex-col gap-8">
          {/* Pending Requests Section */}
          <div className="loadHighlights">
            <div className="max-w-screen-xl mx-auto">
              <div className="items-center justify-between md:flex">
                <div className="max-w-lg mx-auto text-center">
                  <h3 className="text-gray-800 dark:text-white text-2xl font-bold sm:text-3xl">
                    Pending Requests
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    View and manage your pending load requests
                  </p>
                </div>
              </div>
              <div className="mt-12">
                <div className="block lg:hidden">
                  {/* Mobile view */}
                  <div className="space-y-4">
                    {currentLoads.map((load) => (
                      <div key={load._id} className="bg-white rounded-lg shadow p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">{load.clientName}</div>
                            <div className="text-sm text-gray-600">{load.goodsType}</div>
                          </div>
                          <button
                            onClick={() => openJobModal(load)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs font-medium text-gray-500">Pick Up</div>
                            <div className="text-sm text-gray-900 break-words">{load.pickupLocation}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">Drop Off</div>
                            <div className="text-sm text-gray-900 break-words">{load.dropoffLocation}</div>
                          </div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                            ${load.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              load.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {load.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop view */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full table-fixed bg-white border border-gray-300 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goods Type</th>
                        <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pick Up</th>
                        <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Off</th>
                        <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentLoads.map((load) => (
                        <tr key={load._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="break-words">{load.clientName}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="break-words">{load.goodsType}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="break-words">{load.pickupLocation}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="break-words">{load.dropoffLocation}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${load.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                load.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {load.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <button
                              onClick={() => openJobModal(load)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              </div>
            </div>
          </div>
{/* horizontal line */}
<hr className="my-8 border-gray-400" />
          {/* Accepted Bids Section */}
          <div className="acceptedBids">
            <div className="max-w-screen-xl mx-auto">
              <div className="items-start justify-between md:flex">
                <div className="max-w-lg mx-auto text-center">
                  <h3 className="text-gray-800 dark:text-white text-2xl font-bold sm:text-3xl">
                    Accepted Bids
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    View and manage your accepted bids
                  </p>
                </div>
              </div>
              <div className="mt-12">
                <div className="block lg:hidden">
                  {/* Mobile view for bids */}
                  <div className="space-y-4">
                    {currentBids.map((bid) => (
                      <div key={bid._id} className="bg-white rounded-lg shadow p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">{bid.clientName}</div>
                            <div className="text-sm text-gray-600">{bid.goodsType}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">${bid.amount}</div>
                            <button
                              onClick={() => openJobModal(bid)}
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                              View
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs font-medium text-gray-500">Pick Up</div>
                            <div className="text-sm text-gray-900 break-words">{bid.pickupLocation}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">Drop Off</div>
                            <div className="text-sm text-gray-900 break-words">{bid.dropoffLocation}</div>
                          </div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                            ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {bid.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop view for bids */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full table-fixed bg-white border border-gray-300 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                        <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goods Type</th>
                        <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pick Up</th>
                        <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Off</th>
                        <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="w-[5%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentBids.map((bid) => (
                        <tr key={bid._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="break-words">{bid.clientName}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="break-words">{bid.goodsType}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="break-words">{bid.pickupLocation}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="break-words">{bid.dropoffLocation}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {bid.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="break-words">${bid.amount}</div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <button
                              onClick={() => openJobModal(bid)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination for Bids */}
                <div className="flex justify-center mt-4">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginateBids(1)}
                      disabled={currentBidPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentBidPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {'<<'}
                    </button>
                    <button
                      onClick={() => paginateBids(currentBidPage - 1)}
                      disabled={currentBidPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentBidPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentBidPage} of {Math.ceil(acceptedBids.length / bidsPerPage)}
                    </span>
                    <button
                      onClick={() => paginateBids(currentBidPage + 1)}
                      disabled={currentBidPage === Math.ceil(acceptedBids.length / bidsPerPage)}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentBidPage === Math.ceil(acceptedBids.length / bidsPerPage)
                          ? 'text-gray-300'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                    <button
                      onClick={() => paginateBids(Math.ceil(acceptedBids.length / bidsPerPage))}
                      disabled={currentBidPage === Math.ceil(acceptedBids.length / bidsPerPage)}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentBidPage === Math.ceil(acceptedBids.length / bidsPerPage)
                          ? 'text-gray-300'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {'>>'}
                    </button>
                  </nav>
                </div>
              </div>
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
            
            <h2 className="text-xl sm:text-2xl font-bold mb-4 dark:text-white pr-8 text-center">
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

              <div className="mt-4 flex justify-center">
                <span className={`
                  px-4 py-2 rounded-full text-sm font-semibold
                  ${selectedLoad.status === 'loaded' 
                    ? 'bg-blue-500 text-white' 
                    : selectedLoad.status === 'in transit' 
                      ? 'bg-orange-500 text-white'
                      : selectedLoad.status === 'delivered' 
                        ? 'bg-green-500 text-white'
                        : selectedLoad.status === 'accepted' 
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-500 text-white'
                  }
                `}>
                  {selectedLoad.status.charAt(0).toUpperCase() + selectedLoad.status.slice(1)}
                </span>
              </div>

              {acceptedBids.some(bid => bid._id === selectedLoad._id || bid.requestID === selectedLoad._id) && (
                <StatusActionBar 
                  bid={acceptedBids.find(bid => bid._id === selectedLoad._id || bid.requestID === selectedLoad._id) || selectedLoad} 
                  onStatusUpdate={updateRequestStatus}
                />
              )}

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

              {responseMessage && (
                <div className={`mt-4 text-center p-2 rounded ${
                  responseMessage.includes('successfully') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {responseMessage}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </TruckerLayout>
  );
}
export default Home;
