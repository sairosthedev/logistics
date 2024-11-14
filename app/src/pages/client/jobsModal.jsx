import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getPreciseDistance, getPathLength } from 'geolib';
import { ClipLoader } from 'react-spinners'; // Import a loading spinner
import { BACKEND_Local } from '../../../url.js'; // Import the backend URL
import useAuthStore from '../auth/auth'; // Import the auth store
import Modal from 'react-modal'; // Import Modal

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

const TruckRequestForm = ({ isOpen, onRequestClose, onSubmit, selectedLoad }) => {
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

    const { accessToken, clientID } = useAuthStore(); // Get the accessToken and clientID from the store

    const toggleFormVisibility = () => {
        setIsVisible(!isVisible);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Start form submission loading

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
            weight: parseFloat(weight)
        };

        try {
            const response = await fetch(`${BACKEND_Local}/api/client/request-truck`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // Ensure accessToken is correctly set
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Truck request successful:', data);
                setResponseMessage('Truck request successful!');
                setIsSuccessModalOpen(true); // Open success modal
                setIsVisible(false); // Close request modal
                onRequestClose(); // Close the modal
            } else {
                console.error('Truck request failed:', data);
                setResponseMessage('Truck request failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during truck request:', error);
            setResponseMessage('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false); // End form submission loading
        }
    };

    const handleCancel = () => {
        setIsVisible(false); // Close request modal
        onRequestClose(); // Call the onRequestClose prop to handle any additional cleanup
    };

    const MapClickHandler = ({ setCoordinates }) => {
        useMapEvents({
            click(e) {
                setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
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
        <Modal
            isOpen={isOpen}
            onRequestClose={handleCancel}
            style={customStyles}
            contentLabel="Truck Request Form"
        >
            <div className="p-4 flex justify-center">
                <div className="w-full relative" style={{ maxWidth: '100%' }}>
                    <form className="mt-2 bg-white p-6 rounded shadow-md" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col sm:flex-row items-center">
                                <span className="text-2xl mr-2">🚚</span>
                                <label className="block text-gray-700 text-base mr-2">Truck Type:</label>
                                <select 
                                    className="border p-2 rounded flex-grow text-base"
                                    value={truckType}
                                    onChange={(e) => setTruckType(e.target.value)}
                                >
                                    <option value="" disabled>Select Truck Type</option>
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
                            {/* Pickup and Dropoff Location Field */}
                            <div className="flex flex-col sm:flex-row items-center">
                                <span className="text-2xl mr-2">📍</span>
                                <label className="block text-gray-700 text-base mr-2">Pickup and Dropoff Location:</label>
                                <div className="flex-grow">
                                    <div className="border p-2 rounded text-base">
                                        <MapContainer
                                            center={pickupCoordinates}
                                            zoom={15}
                                            style={{ height: "200px", width: "100%" }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={pickupCoordinates} />
                                            <Marker position={dropoffCoordinates} />
                                            <Polyline positions={route} /> {/* Ensure this is correctly set */}
                                            {selectingPickup && <MapClickHandler setCoordinates={setPickupCoordinates} />}
                                            {selectingDropoff && <MapClickHandler setCoordinates={setDropoffCoordinates} />}
                                        </MapContainer>
                                        <div className="text-center mt-2">
                                            <button 
                                                type="button" 
                                                onClick={() => { setSelectingPickup(true); setSelectingDropoff(false); }} 
                                                className={`bg-blue-500 text-white px-4 py-2 rounded text-base mt-2 ${selectingPickup ? 'bg-blue-700' : ''}`}
                                            >
                                                Select Pickup Location
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => { setSelectingPickup(false); setSelectingDropoff(true); }} 
                                                className={`bg-blue-500 text-white px-4 py-2 rounded text-base mt-2 ml-2 ${selectingDropoff ? 'bg-blue-700' : ''}`}
                                            >
                                                Select Dropoff Location
                                            </button>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={fetchRoute} 
                                            className="bg-blue-500 text-white px-4 py-2 rounded text-base mt-2"
                                        >
                                            {isCalculating ? <ClipLoader size={20} color={"#fff"} /> : 'Calculate Route'}
                                        </button>
                                        {distance && (
                                            <p className="text-gray-700 text-base mt-2">
                                                Distance: {distance} meters
                                            </p>
                                        )}
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Pickup Location" 
                                        className="border p-2 rounded flex-grow text-base mt-2"
                                        value={pickupLocation}
                                        onChange={(e) => setPickupLocation(e.target.value)}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Dropoff Location" 
                                        className="border p-2 rounded flex-grow text-base mt-2"
                                        value={dropoffLocation}
                                        onChange={(e) => setDropoffLocation(e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* Goods Type Field */}
                            <div className="flex flex-col sm:flex-row items-center">
                                <span className="text-2xl mr-2">🪑</span>
                                <label className="block text-gray-700 text-base mr-2">Goods Type:</label>
                                <select 
                                    className="border p-2 rounded flex-grow text-base"
                                    value={goodsType}
                                    onChange={(e) => setGoodsType(e.target.value)}
                                >
                                    <option value="" disabled>Select Goods Type</option>
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
                                <label className="block text-gray-700 text-base mr-2">Pay Terms:</label>
                                <select 
                                    className="border p-2 rounded flex-grow text-base"
                                    value={payTerms}
                                    onChange={(e) => setPayTerms(e.target.value)}
                                >
                                    <option value="" disabled>Select Pay Terms</option>
                                    <option value="100% on Loading">100% on Loading</option>
                                    <option value="50% on Loading, 50% on Delivery">50% on Loading, 50% on Delivery</option>
                                    <option value="100% on Delivery">100% on Delivery</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            {/* Number of Trucks Field */}
                            <div className="flex flex-col sm:flex-row items-center">
                                <span className="text-2xl mr-2">🚛</span>
                                <label className="block text-gray-700 text-base mr-2"># of Trucks:</label>
                                <input 
                                    type="number" 
                                    className="border p-2 rounded flex-grow text-base"
                                    value={numberOfTrucks}
                                    onChange={(e) => setNumberOfTrucks(e.target.value)}
                                    min="1"
                                />
                            </div>
                            {/* Weight Field */}
                            <div className="flex flex-col sm:flex-row items-center">
                                <span className="text-2xl mr-2">⚖️</span>
                                <label className="block text-gray-700 text-base mr-2">Weight (tonnes):</label>
                                <input 
                                    type="number" 
                                    className="border p-2 rounded flex-grow text-base"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    min="0"
                                />
                            </div>
                            {/* Calculate Price Button */}
                            <div className="flex items-center justify-center">
                                <button 
                                    type="button" 
                                    onClick={calculatePrice} 
                                    className="bg-blue-500 text-white px-4 py-2 rounded text-base"
                                >
                                    {isCalculating ? <ClipLoader size={20} color={"#fff"} /> : 'Calculate Price'}
                                </button>
                            </div>
                            {/* Estimated Price and Negotiation Field */}
                            {estimatedPrice && (
                                <div className="flex flex-col sm:flex-row items-center">
                                    <span className="text-2xl mr-2">💵</span>
                                    <label className="block text-gray-700 text-base mr-2">Estimated Price:</label>
                                    <span className="text-base mr-4">${estimatedPrice}</span>
                                    <label className="block text-gray-700 text-base mr-2">Negotiation Price:</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter your price" 
                                        className="border p-2 rounded flex-grow text-base"
                                        value={negotiationPrice}
                                        onChange={(e) => setNegotiationPrice(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between mt-4">
                            <button 
                                type="submit" 
                                className="bg-green-500 text-white px-4 py-2 rounded text-base"
                            >
                                Submit
                            </button>
                            <button 
                                type="button" 
                                onClick={onRequestClose} 
                                className="bg-red-500 text-white px-4 py-2 rounded text-base"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

export default TruckRequestForm;
