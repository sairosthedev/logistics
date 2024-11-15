import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getPreciseDistance, getPathLength } from 'geolib';
import { ClipLoader } from 'react-spinners'; // Import a loading spinner
import { BACKEND_Local } from '../../../url.js'; // Import the backend URL
import useAuthStore from '../auth/auth'; // Import the auth store

// Fix for default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '10px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    width: '90%',
    maxWidth: '600px',
  },
};

const JobsSection = ({setError}) => {

    const [isVisible, setIsVisible] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState(null);
    const [negotiationPrice, setNegotiationPrice] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState('');
    const [pickupCoordinates, setPickupCoordinates] = useState({ lat: -17.8203, lng: 31.0696 });
    const [dropoffCoordinates, setDropoffCoordinates] = useState({ lat: -17.8203, lng: 31.0696 });
    const [distance, setDistance] = useState(null);
    const [selectingPickup, setSelectingPickup] = useState(false);
    const [selectingDropoff, setSelectingDropoff] = useState(false);
    const [route, setRoute] = useState([]);
    const [numberOfTrucks, setNumberOfTrucks] = useState(1);
    const [truckType, setTruckType] = useState('');
    const [goodsType, setGoodsType] = useState('');
    const [payTerms, setPayTerms] = useState('');
    const [weight, setWeight] = useState(''); // New state for weight
    const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // New state for success modal
    const [responseMessage, setResponseMessage] = useState(''); // New state for response message
    const [comments, setComments] = useState('');

    const { accessToken, clientID } = useAuthStore(); // Get the accessToken and clientID from the store

    const toggleFormVisibility = () => {
        setIsVisible(!isVisible);
    };

    // Function to get address from coordinates using reverse geocoding
    const getAddressFromCoordinates = async (coordinates) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}`
            );
            const data = await response.json();
            return data.display_name;
        } catch (error) {
            console.error('Error getting address:', error);
            return '';
        }
    };

    const calculatePrice = () => {
        setIsCalculating(true);

        // Calculate distance between pickup and dropoff coordinates
        const distance = getPreciseDistance(
            { latitude: pickupCoordinates.lat, longitude: pickupCoordinates.lng },
            { latitude: dropoffCoordinates.lat, longitude: dropoffCoordinates.lng }
        );

        // Base price per kilometer
        const basePricePerKm = 2; // Example base price per kilometer

        // Calculate cost based on distance and number of trucks
        const cost = (distance / 1000) * basePricePerKm * numberOfTrucks;

        // Additional cost based on truck type, goods type, pay terms, and weight
        let additionalCost = 0;

        switch (truckType) {
            case 'Furniture Truck':
                additionalCost += 100;
                break;
            case 'Small Ton Truck':
                additionalCost += 200;
                break;
            case '10 Ton Truck':
                additionalCost += 300;
                break;
            case '30 Ton Truck':
                additionalCost += 400;
                break;
            // Add more cases for other truck types
            default:
                additionalCost += 50;
                break;
        }

        switch (goodsType) {
            case 'Furniture':
                additionalCost += 50;
                break;
            case 'Minerals':
                additionalCost += 100;
                break;
            case 'Electronics':
                additionalCost += 150;
                break;
            // Add more cases for other goods types
            default:
                additionalCost += 20;
                break;
        }

        switch (payTerms) {
            case '100% on Loading':
                additionalCost += 0;
                break;
            case '50% on Loading, 50% on Delivery':
                additionalCost += 50;
                break;
            case '100% on Delivery':
                additionalCost += 100;
                break;
            // Add more cases for other pay terms
            default:
                additionalCost += 20;
                break;
        }

        // Additional cost based on weight
        const weightInTonnes = parseFloat(weight);
        if (!isNaN(weightInTonnes)) {
            additionalCost += weightInTonnes * 10; // Example cost per tonne
        }

        const totalCost = cost + additionalCost;

        setTimeout(() => {
            setEstimatedPrice(totalCost);
            setIsCalculating(false);
        }, 2000); // Simulate a delay for the loading animation
    };

    const resetForm = () => {
        // Reset all form fields to their initial values
        setPickupLocation('');
        setDropoffLocation('');
        setPickupCoordinates({ lat: -17.8203, lng: 31.0696 });
        setDropoffCoordinates({ lat: -17.8203, lng: 31.0696 });
        setDistance(null);
        setRoute([]);
        setTruckType('');
        setGoodsType('');
        setPayTerms('');
        setNumberOfTrucks(1);
        setWeight('');
        setEstimatedPrice(null);
        setNegotiationPrice('');
        setResponseMessage('');
        setError(null);
        setIsCalculating(false);
        setSelectingPickup(false);
        setSelectingDropoff(false);
        setComments('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!window.confirm('Are you sure you want to submit this request?')) {
            return;
        }

        setIsSubmitting(true);
        setError(null);
        
        const payload = {
            clientID,
            pickupLocation,
            dropoffLocation,
            pickupCoordinates: {
                latitude: pickupCoordinates.lat,
                longitude: pickupCoordinates.lng
            },
            dropoffCoordinates: {
                latitude: dropoffCoordinates.lat,
                longitude: dropoffCoordinates.lng
            },
            distance: distance / 1000, // Convert distance to kilometers
            route: "I-55 N", // Example route
            goodsType,
            payTerms,
            numberOfTrucks,
            estimatedPrice,
            negotiationPrice: parseFloat(negotiationPrice),
            status: "Pending",
            weight: parseFloat(weight),
            comments,
        };

        try {
            const response = await fetch(`${BACKEND_Local}/api/client/request-truck`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Truck request successful:', data);
                setResponseMessage('Truck request successful!');
                setIsSuccessModalOpen(true);
                setIsVisible(false);
                
                // First show "Submitted" message
                setTimeout(() => {
                    setIsSuccessModalOpen(false);
                    // Then reset the form
                    resetForm();
                }, 4000);
                
            } else {
                const errorMessage = data.message || 'Request failed. Please try again.';
                setError(errorMessage);
                setResponseMessage('Truck request failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during truck request:', error);
            setError('Network error. Please check your connection and try again.');
            setResponseMessage('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsVisible(false); // Close request modal
        onRequestClose(); // Call the onRequestClose prop to handle any additional cleanup
    };

    const MapClickHandler = () => {
        const map = useMapEvents({
            click(e) {
                const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
                if (selectingPickup) {
                    setPickupCoordinates(coords);
                    getAddressFromCoordinates(coords).then(address => {
                        setPickupLocation(address);
                    });
                    setSelectingPickup(false);
                } else if (selectingDropoff) {
                    setDropoffCoordinates(coords);
                    getAddressFromCoordinates(coords).then(address => {
                        setDropoffLocation(address);
                    });
                    setSelectingDropoff(false);
                }
            },
        });
        return null;
    };

    const fetchRoute = async () => {
        setIsCalculating(true); // Start loading animation
        try {
            const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickupCoordinates.lng},${pickupCoordinates.lat};${dropoffCoordinates.lng},${dropoffCoordinates.lat}?overview=full&geometries=geojson`);
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                const coordinates = data.routes[0].geometry.coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }));
                setRoute(coordinates);
                // Calculate the distance of the route using the fetched coordinates
                const routeDistance = getPathLength(coordinates);
                setDistance(routeDistance);
            } else {
                console.error('No route found');
            }
        } catch (error) {
            console.error('Error fetching route:', error);
        } finally {
            setIsCalculating(false); // End loading animation
        }
    };

  return (
    <div className="w-full m-0 p-0 mb-8">
      <div className="m-0 p-0 flex justify-center">
        <div className="w-full m-0 p-0" style={{ maxWidth: '100%' }}>
          <form className="mt-2 bg-white dark:bg-gray-800 p-6 rounded shadow-md" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              {/* Truck Type Field */}
              <div className="flex flex-col sm:flex-row items-center">
                <span className="text-2xl mr-2">🚚</span>
                <label className="block text-gray-700 dark:text-gray-300 text-base mr-2">Truck Type:</label>
                <select 
                  required
                  className="border p-2 rounded flex-grow text-base
                    bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100
                    border-gray-300 dark:border-gray-600
                    focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                  value={truckType}
                  onChange={(e) => setTruckType(e.target.value)}
                >
                  <option value="">Select Truck Type</option>
                  <option value="Any">Any</option>
                  <option value="Furniture Truck">Furniture Truck</option>
                  <option value="Small Ton Truck">Small Ton Truck</option>
                  <option value="10 Ton Truck">10 Ton Truck</option>
                  <option value="30 Ton Truck">30 Ton Truck</option>
                  <option value="30 Ton Flatbed">30 Ton Flatbed</option>
                  <option value="30 Ton Link">30 Ton Link</option>
                  <option value="34 Ton Link Flatbed">34 Ton Link Flatbed</option>
                  <option value="34 Ton Side Tipper">34 Ton Side Tipper</option>
                  <option value="30 Ton Howo Tipper">30 Ton Howo Tipper</option>
                  <option value="30 Ton Tipper">30 Ton Tipper</option>
                  <option value="Lowbed">Lowbed</option>
                  <option value="Semi Truck">Semi Truck</option>
                  <option value="Fuel Tanker">Fuel Tanker</option>
                  <option value="Water Bowser">Water Bowser</option>
                  <option value="Tautliner">Tautliner</option>
                  <option value="Abnormal">Abnormal</option>
                  <option value="Logging">Logging</option>
                  <option value="Livestock">Livestock</option>
                  <option value="Refrigerated">Refrigerated</option>
                  <option value="Crane">Crane</option>
                  <option value="Tow Truck">Tow Truck</option>
                  <option value="Car Carrier">Car Carrier</option>
                </select>
              </div>

              {/* Map Container */}
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">📍</span>
                  <label className="block text-gray-700 dark:text-gray-300 text-base">
                    Pickup and Dropoff Location:
                  </label>
                </div>
                
                <div className="w-full">
                  <div className="w-full aspect-[16/9] relative z-0">
                    <MapContainer
                      center={[-17.8203, 31.0696]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      className="rounded-lg shadow-md [&_.leaflet-tile]:dark:brightness-[0.7] [&_.leaflet-tile]:dark:contrast-[1.2]"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        className="dark:opacity-80"
                      />
                      {pickupCoordinates && (
                        <Marker 
                          position={[pickupCoordinates.lat, pickupCoordinates.lng]}
                          icon={new L.Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                          })}
                        >
                          <Popup>Pickup Location</Popup>
                        </Marker>
                      )}
                      {dropoffCoordinates && (
                        <Marker 
                          position={[dropoffCoordinates.lat, dropoffCoordinates.lng]}
                          icon={new L.Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                          })}
                        >
                          <Popup>Dropoff Location</Popup>
                        </Marker>
                      )}
                      {route.length > 0 && (
                        <Polyline 
                          positions={route}
                          color="blue"
                          weight={3}
                          opacity={0.7}
                        />
                      )}
                      <MapClickHandler />
                    </MapContainer>

                    {/* Map Controls */}
                    <div className="flex justify-center gap-2 mt-2">
                      <button 
                        type="button" 
                        onClick={() => { 
                          setSelectingPickup(true); 
                          setSelectingDropoff(false); 
                        }} 
                        className={`px-4 py-2 rounded text-white transition-colors
                          ${selectingPickup 
                            ? 'bg-green-600 dark:bg-green-700' 
                            : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
                          }`}
                      >
                        {selectingPickup ? 'Click on map for pickup' : 'Select Pickup Location'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { 
                          setSelectingPickup(false); 
                          setSelectingDropoff(true); 
                        }} 
                        className={`px-4 py-2 rounded text-white transition-colors
                          ${selectingDropoff 
                            ? 'bg-red-600 dark:bg-red-700' 
                            : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                          }`}
                      >
                        {selectingDropoff ? 'Click on map for dropoff' : 'Select Dropoff Location'}
                      </button>
                      {pickupCoordinates && dropoffCoordinates && (
                        <button 
                          type="button" 
                          onClick={fetchRoute} 
                          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 
                            text-white px-4 py-2 rounded transition-colors"
                          disabled={isCalculating}
                        >
                          {isCalculating ? (
                            <ClipLoader size={20} color={"#ffffff"} />
                          ) : (
                            'Calculate Route'
                          )}
                        </button>
                      )}
                    </div>

                    {distance && (
                      <div className="text-center mt-2">
                        <p className="text-gray-700 dark:text-gray-300">
                          Distance: {(distance / 1000).toFixed(2)} km
                        </p>
                      </div>
                    )}

                    {/* Location Input Fields */}
                    <div className="mt-2 space-y-2">
                      <input 
                        type="text" 
                        required
                        placeholder="Pickup Location" 
                        className="border p-2 rounded w-full text-base
                          bg-white dark:bg-gray-700 
                          text-gray-900 dark:text-gray-100
                          border-gray-300 dark:border-gray-600
                          placeholder-gray-500 dark:placeholder-gray-400"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                      />
                      <input 
                        type="text" 
                        required
                        placeholder="Dropoff Location" 
                        className="border p-2 rounded w-full text-base
                          bg-white dark:bg-gray-700 
                          text-gray-900 dark:text-gray-100
                          border-gray-300 dark:border-gray-600
                          placeholder-gray-500 dark:placeholder-gray-400"
                        value={dropoffLocation}
                        onChange={(e) => setDropoffLocation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Goods Type Field */}
              <div className="flex flex-col sm:flex-row items-center">
                <span className="text-2xl mr-2">🪑</span>
                <label className="block text-gray-700 dark:text-gray-300 text-base mr-2">Goods Type:</label>
                <select 
                  required
                  className="border p-2 rounded flex-grow text-base
                    bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100
                    border-gray-300 dark:border-gray-600
                    focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                  value={goodsType}
                  onChange={(e) => setGoodsType(e.target.value)}
                >
                  <option value="">Select Goods Type</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Minerals">Minerals</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Food">Food</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Chemicals">Chemicals</option>
                  <option value="Construction Materials">Construction Materials</option>
                  <option value="Livestock">Livestock</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Pay Terms Field */}
              <div className="flex flex-col sm:flex-row items-center">
                <span className="text-2xl mr-2">💰</span>
                <label className="block text-gray-700 dark:text-gray-300 text-base mr-2">Pay Terms:</label>
                <select 
                  required
                  className="border p-2 rounded flex-grow text-base
                    bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100
                    border-gray-300 dark:border-gray-600
                    focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                  value={payTerms}
                  onChange={(e) => setPayTerms(e.target.value)}
                >
                  <option value="">Select Pay Terms</option>
                  <option value="100% on Loading">100% on Loading</option>
                  <option value="50% on Loading, 50% on Delivery">50% on Loading, 50% on Delivery</option>
                  <option value="100% on Delivery">100% on Delivery</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Number of Trucks Field */}
              <div className="flex flex-col sm:flex-row items-center">
                <span className="text-2xl mr-2">🚛</span>
                <label className="block text-gray-700 dark:text-gray-300 text-base mr-2"># of Trucks:</label>
                <input 
                  type="number" 
                  required
                  className="border p-2 rounded flex-grow text-base
                    bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100
                    border-gray-300 dark:border-gray-600
                    focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                  value={numberOfTrucks}
                  onChange={(e) => setNumberOfTrucks(e.target.value)}
                  min="1"
                  placeholder="Number of Trucks"
                />
              </div>

              {/* Weight Field */}
              <div className="flex flex-col sm:flex-row items-center">
                <span className="text-2xl mr-2">⚖️</span>
                <label className="block text-gray-700 dark:text-gray-300 text-base mr-2">Weight (tonnes):</label>
                <input 
                  type="number" 
                  required
                  className="border p-2 rounded flex-grow text-base
                    bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100
                    border-gray-300 dark:border-gray-600
                    focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0"
                  step="0.1"
                  placeholder="Weight (tonnes)"
                />
              </div>

              {/* Add this block after the Weight Field and before Calculate Price Button */}
              <div className="flex flex-col sm:flex-row items-start">
                <div className="flex items-center mb-2 sm:mb-0">
                  <span className="text-2xl mr-2">💭</span>
                  <label className="block text-gray-700 dark:text-gray-300 text-base mr-2">Comments:</label>
                </div>
                <textarea 
                  className="border p-2 rounded flex-grow text-base min-h-[100px] resize-y
                    bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100
                    border-gray-300 dark:border-gray-600
                    placeholder-gray-500 dark:placeholder-gray-400"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any additional details or special requirements..."
                />
              </div>

              {/* Calculate Price Button */}
              <div className="flex items-center justify-center">
                <button 
                  type="button" 
                  onClick={calculatePrice} 
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700
                    text-white px-4 py-2 rounded text-base disabled:bg-blue-300 dark:disabled:bg-blue-800
                    transition-colors duration-300"
                >
                  {isCalculating ? <ClipLoader size={20} color={"#fff"} /> : 'Calculate Price'}
                </button>
              </div>

              {/* Estimated Price and Negotiation Field */}
              {estimatedPrice && (
                <div className="flex flex-col sm:flex-row items-center">
                  <span className="text-2xl mr-2">💵</span>
                  <label className="block text-gray-700 dark:text-gray-300 text-base mr-2">Estimated Price:</label>
                  <span className="text-base mr-4">${estimatedPrice}</span>
                  <label className="block text-gray-700 dark:text-gray-300 text-base mr-2">Negotiation Price:</label>
                  <input 
                    type="number"
                    required
                    placeholder="Enter your price"
                    className="border p-2 rounded flex-grow text-base
                      bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-gray-100
                      border-gray-300 dark:border-gray-600
                      focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                    value={negotiationPrice}
                    onChange={(e) => setNegotiationPrice(e.target.value)}
                    min="0"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-between mt-4">
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700
                    text-white px-4 py-2 rounded text-base disabled:bg-green-300 dark:disabled:bg-green-800
                    transition-colors duration-300"
                >
                  {isSubmitting ? 'Submitting...' : responseMessage ? 'Submitted' : 'Submit'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobsSection
