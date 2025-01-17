import React, { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Polyline,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getPreciseDistance, getPathLength } from "geolib";
import { ClipLoader } from "react-spinners";
import { BACKEND_Local } from "../../../url.js";
import useAuthStore from "../auth/auth";
import debounce from 'lodash/debounce';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const JobsSection = ({
  setError,
  geocodeAddress,
  setOriginCoords,
  setDestinationCoords,
  setShowMap,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [negotiationPrice, setNegotiationPrice] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState({
    lat: -17.8203,
    lng: 31.0696,
  });
  const [dropoffCoordinates, setDropoffCoordinates] = useState({
    lat: -17.8203,
    lng: 31.0696,
  });
  const [distance, setDistance] = useState(null);
  const [selectingPickup, setSelectingPickup] = useState(false);
  const [selectingDropoff, setSelectingDropoff] = useState(false);
  const [route, setRoute] = useState([]);
  const [numberOfTrucks, setNumberOfTrucks] = useState(1);
  const [truckType, setTruckType] = useState("");
  const [goodsType, setGoodsType] = useState("");
  const [otherGoodsType, setOtherGoodsType] = useState("");
  const [payTerms, setPayTerms] = useState("");
  const [otherPayTerms, setOtherPayTerms] = useState("");
  const [weight, setWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [comments, setComments] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [rate, setRate] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { accessToken, clientID } = useAuthStore();
  const mapRef = React.useRef(null);

  const fetchLocationSuggestions = async (query) => {
    if (!query.trim()) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query + ", Zimbabwe")}` +
        `&countrycodes=zw` +
        `&limit=5`
      );
      const data = await response.json();
      return data.map(item => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon
      }));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  };

  const getAddressFromCoordinates = async (coordinates) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}`
      );
      const data = await response.json();
      return data.display_name || "Location not found";
    } catch (error) {
      console.error("Error getting address:", error);
      return "Error getting address";
    }
  };

  const handlePickupChange = async (e) => {
    const value = e.target.value;
    setPickupLocation(value);
    
    if (value.length > 2) {
      const suggestions = await fetchLocationSuggestions(value);
      setPickupSuggestions(suggestions);
    } else {
      setPickupSuggestions([]);
    }
  };

  const handleDropoffChange = async (e) => {
    const value = e.target.value;
    setDropoffLocation(value);
    
    if (value.length > 2) {
      const suggestions = await fetchLocationSuggestions(value);
      setDropoffSuggestions(suggestions);
    } else {
      setDropoffSuggestions([]);
    }
  };

  const fetchRoute = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickupCoordinates.lng},${pickupCoordinates.lat};${dropoffCoordinates.lng},${dropoffCoordinates.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(
          (coord) => ({ lat: coord[1], lng: coord[0] })
        );
        setRoute(coordinates);
        const routeDistance = getPathLength(coordinates);
        setDistance(routeDistance);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      setError("Error calculating route. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const MapComponent = () => {
    const map = useMapEvents({
      click: async (e) => {
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
        if (selectingPickup) {
          setPickupCoordinates(coords);
          setOriginCoords(coords);
          const address = await getAddressFromCoordinates(coords);
          setPickupLocation(address);
          setSelectingPickup(false);
          
          if (dropoffCoordinates.lat !== -17.8203) {
            fetchRoute();
          }
        } else if (selectingDropoff) {
          setDropoffCoordinates(coords);
          setDestinationCoords(coords);
          const address = await getAddressFromCoordinates(coords);
          setDropoffLocation(address);
          setSelectingDropoff(false);
          
          if (pickupCoordinates.lat !== -17.8203) {
            fetchRoute();
          }
        }
      },
    });

    React.useEffect(() => {
      if (map) {
        mapRef.current = map;
      }
    }, [map]);

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const confirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    setError(null);

    const payload = {
      clientID,
      pickupLocation,
      dropoffLocation,
      pickupCoordinates: {
        latitude: pickupCoordinates.lat,
        longitude: pickupCoordinates.lng,
      },
      dropoffCoordinates: {
        latitude: dropoffCoordinates.lat,
        longitude: dropoffCoordinates.lng,
      },
      distance: distance / 1000,
      route: "I-55 N",
      goodsType: goodsType === "Other" ? otherGoodsType : goodsType,
      payTerms: payTerms === "Other" ? otherPayTerms : payTerms,
      numberOfTrucks,
      estimatedPrice,
      negotiationPrice: parseFloat(negotiationPrice),
      status: "Pending",
      weight: parseFloat(weight),
      comments,
      rate: parseFloat(rate),
    };

    try {
      const response = await fetch(
        `${BACKEND_Local}/api/client/request-truck`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setResponseMessage("Truck request successful!");
        setIsSuccessModalOpen(true);
        setIsVisible(false);

        setTimeout(() => {
          setIsSuccessModalOpen(false);
          resetForm();
        }, 4000);
      } else {
        setError(data.message || "Request failed. Please try again.");
        setResponseMessage("Truck request failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during truck request:", error);
      setError("Network error. Please check your connection and try again.");
      setResponseMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPickupLocation("");
    setDropoffLocation("");
    setPickupCoordinates({ lat: -17.8203, lng: 31.0696 });
    setDropoffCoordinates({ lat: -17.8203, lng: 31.0696 });
    setDistance(null);
    setRoute([]);
    setTruckType("");
    setGoodsType("");
    setOtherGoodsType("");
    setPayTerms("");
    setOtherPayTerms("");
    setNumberOfTrucks(1);
    setWeight("");
    setEstimatedPrice(null);
    setNegotiationPrice("");
    setResponseMessage("");
    setError(null);
    setIsCalculating(false);
    setSelectingPickup(false);
    setSelectingDropoff(false);
    setComments("");
    setRate("");
  };
  const debouncedGeocode = useCallback(
    debounce(async (inputText, type) => {
      if (!inputText.trim()) return;
  
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&q=${encodeURIComponent(inputText + ", Zimbabwe")}` +
          `&countrycodes=zw` +
          `&limit=1`
        );
  
        const data = await response.json();
  
        if (data && data.length > 0) {
          const coords = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          };
  
          if (type === "pickup") {
            setPickupCoordinates(coords);
            setOriginCoords(coords);
            if (mapRef.current) {
              mapRef.current.setView([coords.lat, coords.lng], 13);
            }
          } else {
            setDropoffCoordinates(coords);
            setDestinationCoords(coords);
            if (mapRef.current) {
              mapRef.current.setView([coords.lat, coords.lng], 13);
            }
          }
  
          if (
            (type === "pickup" && dropoffCoordinates.lat !== -17.8203) ||
            (type === "dropoff" && pickupCoordinates.lat !== -17.8203)
          ) {
            fetchRoute();
          }
  
          setShowMap(true);
          setError(null);
        }
      } catch (error) {
        console.error("Error geocoding location:", error);
        setError("Error finding location. Please check your connection and try again.");
      }
    }, 500),
    []
  );
  
  useEffect(() => {
    return () => {
      if (debouncedGeocode?.cancel) {
        debouncedGeocode.cancel();
      }
    };
  }, [debouncedGeocode]);
  

  return (
    <div className="w-full m-0 p-0 mb-8">
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow-md">
            <p>Are you sure you want to submit this load?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="m-0 p-0 flex justify-center">
        <div className="w-full m-0 p-0" style={{ maxWidth: "100%" }}>
          <form
            className="mt-2 bg-white dark:bg-gray-800 p-6 rounded shadow-md"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 gap-4">
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
                        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
                        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41],
                      })}
                    >
                      <Popup>Pickup Location</Popup>
                    </Marker>
                  )}
                  {dropoffCoordinates && (
                    <Marker
                      position={[dropoffCoordinates.lat, dropoffCoordinates.lng]}
                      icon={new L.Icon({
                        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41],
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
                  <MapComponent />
                </MapContainer>
              </div>

              {/* Location Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">📍</span>
                    <label className="block text-gray-700 dark:text-gray-300 text-base">
                      Pickup Location:
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter Pickup Location"
                      value={pickupLocation}
                      onChange={handlePickupChange}
                      className="border p-2 rounded text-base w-full
                        bg-white dark:bg-gray-700 
                        text-gray-900 dark:text-gray-100
                        border-gray-300 dark:border-gray-600
                        focus:ring-blue-500 focus:border-blue-500"
                    />
                    {pickupSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg">
                        {pickupSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                            onClick={() => {
                              setPickupLocation(suggestion.display_name);
                              setPickupCoordinates({
                                lat: parseFloat(suggestion.lat),
                                lng: parseFloat(suggestion.lon)
                              });
                              setOriginCoords({
                                lat: parseFloat(suggestion.lat),
                                lng: parseFloat(suggestion.lon)
                              });
                              setPickupSuggestions([]);
                              if (mapRef.current) {
                                mapRef.current.setView([parseFloat(suggestion.lat), parseFloat(suggestion.lon)], 13);
                              }
                              if (dropoffCoordinates.lat !== -17.8203) {
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

                <div className="flex flex-col">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">📍</span>
                    <label className="block text-gray-700 dark:text-gray-300 text-base">
                      Dropoff Location:
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter Dropoff Location"
                      value={dropoffLocation}
                      onChange={handleDropoffChange}
                      className="border p-2 rounded text-base w-full
                        bg-white dark:bg-gray-700 
                        text-gray-900 dark:text-gray-100
                        border-gray-300 dark:border-gray-600
                        focus:ring-blue-500 focus:border-blue-500"
                    />
                    {dropoffSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg">
                        {dropoffSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                            onClick={() => {
                              setDropoffLocation(suggestion.display_name);
                              setDropoffCoordinates({
                                lat: parseFloat(suggestion.lat),
                                lng: parseFloat(suggestion.lon)
                              });
                              setDestinationCoords({
                                lat: parseFloat(suggestion.lat),
                                lng: parseFloat(suggestion.lon)
                              });
                              setDropoffSuggestions([]);
                              if (mapRef.current) {
                                mapRef.current.setView([parseFloat(suggestion.lat), parseFloat(suggestion.lon)], 13);
                              }
                              if (pickupCoordinates.lat !== -17.8203) {
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

              {/* Map Controls */}
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectingPickup(true);
                    setSelectingDropoff(false);
                  }}
                  className={`px-4 py-2 rounded text-white transition-colors
                    ${selectingPickup
                      ? "bg-green-600 dark:bg-green-700"
                      : "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                    }`}
                >
                  {selectingPickup ? "Click on map for pickup" : "Select Pickup Location"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectingPickup(false);
                    setSelectingDropoff(true);
                  }}
                  className={`px-4 py-2 rounded text-white transition-colors
                    ${selectingDropoff
                      ? "bg-red-600 dark:bg-red-700"
                      : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                    }`}
                >
                  {selectingDropoff ? "Click on map for dropoff" : "Select Dropoff Location"}
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
                      "Calculate Route"
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

              {/* Truck Type Field */}
              <div className="flex flex-col sm:flex-row items-center">
                <div className="w-48 flex items-center">
                  <span className="text-2xl mr-2">🚚</span>
                  <label className="block text-gray-700 dark:text-gray-300 text-base mr-2">
                    Truck Type:
                  </label>
                </div>
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

              {/* Goods Type Field with Other Option */}
              <div className="flex flex-col sm:flex-row items-center">
                <div className="w-48 flex items-center">
                  <span className="text-2xl mr-2">🪑</span>
                  <label className="block text-gray-700 dark:text-gray-300 text-base">
                    Goods Type:
                  </label>
                </div>
                <div className="flex-grow flex gap-2">
                  <select
                    required
                    className="border p-2 rounded w-full text-base
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
                  {goodsType === "Other" && (
                    <input
                      type="text"
                      required
                      placeholder="Specify goods type"
                      className="border p-2 rounded w-full text-base
                        bg-white dark:bg-gray-700 
                        text-gray-900 dark:text-gray-100
                        border-gray-300 dark:border-gray-600
                        focus:ring-blue-500 focus:border-blue-500"
                      value={otherGoodsType}
                      onChange={(e) => setOtherGoodsType(e.target.value)}
                    />
                  )}
                </div>
              </div>

              {/* Pay Terms Field with Other Option */}
              <div className="flex flex-col sm:flex-row items-center">
                <div className="w-48 flex items-center">
                  <span className="text-2xl mr-2">💰</span>
                  <label className="block text-gray-700 dark:text-gray-300 text-base">
                    Pay Terms:
                  </label>
                </div>
                <div className="flex-grow flex gap-2">
                  <select
                    required
                    className="border p-2 rounded w-full text-base
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
                  {payTerms === "Other" && (
                    <input
                      type="text"
                      required
                      placeholder="Specify payment terms"
                      className="border p-2 rounded w-full text-base
                        bg-white dark:bg-gray-700 
                        text-gray-900 dark:text-gray-100
                        border-gray-300 dark:border-gray-600
                        focus:ring-blue-500 focus:border-blue-500"
                      value={otherPayTerms}
                      onChange={(e) => setOtherPayTerms(e.target.value)}
                    />
                  )}
                </div>
              </div>

              {/* Weight Field */}
              <div className="flex flex-col sm:flex-row items-center">
                <div className="w-48 flex items-center">
                  <span className="text-2xl mr-2">⚖️</span>
                  <label className="block text-gray-700 dark:text-gray-300 text-base">
                    Weight (tonnes):
                  </label>
                </div>
                <input
                  type="number"
                  required
                  className="border p-2 rounded w-1/4 text-base
                    bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100
                    border-gray-300 dark:border-gray-600
                    focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Weight (tonnes)"
                />
              </div>

              {/* Comments Field */}
              <div className="flex flex-col sm:flex-row items-start">
                <div className="w-48 flex items-center">
                  <span className="text-2xl mr-2">💭</span>
                  <label className="block text-gray-700 dark:text-gray-300 text-base">
                    Comments:
                  </label>
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

              {/* Rate Field */}
              <div className="flex flex-col sm:flex-row items-center">
                <div className="w-48 flex items-center">
                  <span className="text-2xl mr-2">💵</span>
                  <label className="block text-gray-700 dark:text-gray-300 text-base">
                    Price (USD):
                  </label>
                </div>
                <input
                  type="number"
                  required
                  className="border p-2 rounded w-1/4 text-base
                    bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100
                    border-gray-300 dark:border-gray-600
                    focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="Enter rate in USD"
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
                  {isSubmitting ? "Submitting..." : responseMessage ? "Submitted" : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobsSection;


