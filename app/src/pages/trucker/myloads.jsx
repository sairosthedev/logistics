import React, { useState, useEffect } from 'react';
import TruckerLayout from '../../components/layouts/truckerLayout';
import Modal from 'react-modal';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';

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
  },
};

function MyLoads() {
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [negotiationPrice, setNegotiationPrice] = useState('');
  const [loads, setLoads] = useState([]);
  const { accessToken, clientID } = useAuthStore();
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [visibleLoads, setVisibleLoads] = useState(6); // Number of loads to show initially
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
      setIsSubmitting(false);
      return;
    }

    const payload = {
      requestID: selectedLoad._id,
      clientID: selectedLoad.clientID,
      numberOfTrucks: selectedLoad.numberOfTrucks, // Ensure this is set correctly
      truckerID: clientID, // Ensure this is set correctly
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

    console.log('Payload:', payload); // Log the payload for debugging

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
        console.error('Error details:', error.response.data); // Log error details if available
      }
      setResponseMessage('Failed to assign truck. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  

  const renderTable = (loadsArray) => {
    return (
      <div className={` p-2 ${loadsArray.length === 0 ? 'w-full' : 'w-fit'} shadow-lg bg-white rounded-xl`}>
        <table className={`${loadsArray.length === 0 ? 'w-full' : 'w-fit'}  border-separate border-spacing-2`}  >
          <thead >
            <tr className=''>
              <th className='border border-slate-600 rounded-md bg-sky-800 text-white text-sm p-2'>Client Name</th>
              <th className='border border-slate-600 rounded-md bg-sky-800 text-white text-sm p-2'>Goods Type</th>
              <th className='border border-slate-600 rounded-md bg-sky-800 text-white text-sm p-2'>Pickup Location</th>
              <th className='border border-slate-600 rounded-md bg-sky-800 text-white text-sm p-2'>Dropoff Location</th>
              <th className='border border-slate-600 rounded-md bg-sky-800 text-white text-sm p-2'>Actions</th>
            </tr>
          </thead>


          <tbody>
            {loadsArray.slice(0, visibleLoads).map((load, index) => (
              <tr key={index} className='hover:bg-blue-500 hover:text-white'>
                {index % 2 === 1 ? <td className='border border-slate-600  rounded-md text-center text-xs p-1 w-1/5'>{load.clientName}</td> : <td className='border border-slate-600 rounded-md text-center text-xs p-1 w-1/5'>{load.clientName}</td>}
                {index % 2 === 1 ? <td className='border border-slate-600  rounded-md text-center text-xs p-1 w-1/5'>{load.goodsType}</td> : <td className='border border-slate-600 rounded-md text-center text-xs p-1 w-1/5'>{load.goodsType}</td>}
                {index % 2 === 1 ? <td className='border border-slate-600  rounded-md text-center text-xs p-1 w-1/5'>{load.pickupLocation || 'N/A'}</td> : <td className='border border-slate-600 rounded-md text-center text-xs p-1 w-1/5'>{load.pickupLocation || 'N/A'}</td>}
                {index % 2 === 1 ? <td className='border border-slate-600  rounded-md text-center text-xs p-1 w-1/5'>{load.dropoffLocation || 'N/A'}</td> : <td className='border border-slate-600 rounded-md text-center text-xs p-1 w-1/5'>{load.dropoffLocation || 'N/A'}</td>}
                <td className='border border-slate-600 rounded-md text-center  p-1 w-1/5'>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition duration-200"
                    onClick={() => openJobModal(load)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const filteredLoads = loads.filter(load => load.status === filter);

  function renderTrucks(trucksArray) {
    return trucksArray.map((truck, index) => (
      <div key={index} className="flex items-center">
        <input
          type="radio"
          name="selectedTruck"
          value={truck._id}
          onChange={(e) => setSelectedTruck(e.target.value)}
          className="mr-2"
        />
        <label className="text-gray-700 text-sm sm:text-base">{truck.truckType} - {truck.driverName}</label>
      </div>
    ));
  }

  return (
    <TruckerLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Jobs</h1>
        <div className="mb-4 flex flex-wrap">
          <button className={`px-4 py-2 mr-2 mb-2 ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setFilter('pending')}>Pending Requests</button>
          <button className={`px-4 py-2 mr-2 mb-2 ${filter === 'inTransit' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setFilter('inTransit')}>In Transit</button>
          <button className={`px-4 py-2 mb-2 ${filter === 'delivered' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setFilter('delivered')}>Delivered</button>
        </div>
        <div className="overflow-x-auto">
          {renderTable(filteredLoads)}
          {filteredLoads.length > visibleLoads && (
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
              onClick={() => setVisibleLoads(visibleLoads + 6)} // Load more loads
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
          style={customStyles}
          contentLabel="Job Details"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4">{selectedLoad.clientName}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-700">Goods Type:</td>
                  <td className="py-2">{selectedLoad.goodsType}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700">Weight:</td>
                  <td className="py-2">{selectedLoad.weight} kg</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700">Pay Terms:</td>
                  <td className="py-2">{selectedLoad.payTerms}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700">Number of Trucks:</td>
                  <td className="py-2">{selectedLoad.numberOfTrucks}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700">Pickup Location:</td>
                  <td className="py-2">{selectedLoad.pickupLocation || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700">Dropoff Location:</td>
                  <td className="py-2">{selectedLoad.dropoffLocation || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700">Status:</td>
                  <td className="py-2">{selectedLoad.status}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700">Estimated Price:</td>
                  <td className="py-2">${selectedLoad.estimatedPrice}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {filter === 'pending' && (
            <form onSubmit={handleSubmit} className="mt-4">
              <label className="block text-gray-700 text-base mb-2">Counter Offer:</label>
              <input
                type="number"
                value={negotiationPrice}
                onChange={(e) => setNegotiationPrice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your counter offer"
                required
              />
              <label className="block text-gray-700 text-base mb-2">Assign Truck:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

export default MyLoads;
