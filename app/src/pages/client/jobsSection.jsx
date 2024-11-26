import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getPreciseDistance, getPathLength } from 'geolib';
import { ClipLoader } from 'react-spinners';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';

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

const JobsSection = ({setError, geocodeAddress, setOriginCoords, setDestinationCoords, setShowMap}) => {

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
    const [weight, setWeight] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [comments, setComments] = useState('');
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropoffSuggestions, setDropoffSuggestions] = useState([]);

    const { accessToken, clientID } = useAuthStore();

    const toggleFormVisibility = () => {
        setIsVisible(!isVisible);
    };

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

    const resetForm = () => {
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
            distance: distance / 1000,
            route: "I-55 N",
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
                
                setTimeout(() => {
                    setIsSuccessModalOpen(false);
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

    const fetchLocationSuggestions = async (searchText, type) => {
        if (searchText.length < 3) {
            if (type === 'pickup') {
                setPickupSuggestions([]);
            } else {
                setDropoffSuggestions([]);
            }
            return;
        }

        try {
            const searchQuery = `${searchText}, Zimbabwe`;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `format=json&q=${encodeURIComponent(searchQuery)}` +
                `&countrycodes=zw` +
                `&limit=5` +
                `&accept-language=en`
            );
            
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            
            const data = await response.json();
            
            const suggestions = data.map(item => ({
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon)
            }));

            if (suggestions.length > 0) {
                const firstResult = suggestions[0];
                const coords = {
                    lat: firstResult.lat,
                    lng: firstResult.lon
                };

                if (type === 'pickup') {
                    setPickupCoordinates(coords);
                    setOriginCoords(coords);
                    setPickupSuggestions(suggestions);
                    setDropoffSuggestions([]);
                } else {
                    setDropoffCoordinates(coords);
                    setDestinationCoords(coords);
                    setDropoffSuggestions(suggestions);
                    setPickupSuggestions([]);
                }
                setShowMap(true);

                if (type === 'pickup' && dropoffCoordinates) {
                    fetchRoute();
                } else if (type === 'dropoff' && pickupCoordinates) {
                    fetchRoute();
                }
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            if (type === 'pickup') {
                setPickupSuggestions([]);
            } else {
                setDropoffSuggestions([]);
            }
        }
    };

    const handleLocationInput = async (location, type) => {
        if (!location) return;
        
        try {
            const searchTerms = [
                `${location}, Harare, Zimbabwe`,
                `${location}, Harare`,
                location
            ];

            let found = false;
            
            for (const searchTerm of searchTerms) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?` + 
                    `format=json&q=${encodeURIComponent(searchTerm)}` +
                    `&countrycodes=zw` +
                    `&viewbox=30.8,17.6,31.2,18.0` +
                    `&bounded=1`
                );
                
                const data = await response.json();
                
                if (data && data.length > 0) {
                    const coords = {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    };
                    
                    if (type === 'pickup') {
                        setPickupCoordinates(coords);
                        setOriginCoords(coords);
                        setPickupLocation(location);
                    } else {
                        setDropoffCoordinates(coords);
                        setDestinationCoords(coords);
                        setDropoffLocation(location);
                    }
                    setShowMap(true);
                    
                    if (type === 'pickup' && dropoffCoordinates) {
                        fetchRoute();
                    } else if (type === 'delivery' && pickupCoordinates) {
                        fetchRoute();
                    }
                    
                    found = true;
                    setError(null);
                    break;
                }
            }
            
            if (!found) {
                setError(
                    'Location not found. Try adding more details like street name or nearby landmark.'
                );
            }
        } catch (error) {
            console.error('Error geocoding location:', error);
            setError(
                'Error finding location. Please check your internet connection and try again.'
            );
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

                    {/* Location input fields with suggestions */}
                    <div className="mt-4 space-y-3 relative">
                        <div className="relative">
                            <input 
                                type="text" 
                                required
                                placeholder="🏁 Enter Pickup Location" 
                                className="border-2 p-3 rounded-lg w-full text-base focus:ring-2 
                                    focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                value={pickupLocation}
                                onChange={(e) => {
                                    setPickupLocation(e.target.value);
                                    fetchLocationSuggestions(e.target.value, 'pickup');
                                }}
                            />
                            {pickupSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200">
                                    {pickupSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                setPickupLocation(suggestion.display_name);
                                                setPickupCoordinates({ lat: suggestion.lat, lng: suggestion.lon });
                                                setPickupSuggestions([]);
                                                if (dropoffCoordinates) {
                                                    fetchRoute();
                                                }
                                            }}
                                        >
                                            {suggestion.display_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <input 
                                type="text" 
                                required
                                placeholder="🏁 Enter Dropoff Location" 
                                className="border-2 p-3 rounded-lg w-full text-base focus:ring-2 
                                    focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                value={dropoffLocation}
                                onChange={(e) => {
                                    setDropoffLocation(e.target.value);
                                    fetchLocationSuggestions(e.target.value, 'dropoff');
                                }}
                            />
                            {dropoffSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200">
                                    {dropoffSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                setDropoffLocation(suggestion.display_name);
                                                setDropoffCoordinates({ lat: suggestion.lat, lng: suggestion.lon });
                                                setDropoffSuggestions([]);
                                                if (pickupCoordinates) {
                                                    fetchRoute();
                                                }
                                            }}
                                        >
                                            {suggestion.display_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
