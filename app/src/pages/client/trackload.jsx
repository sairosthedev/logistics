import React, { useState, useEffect } from 'react';
import ClientLayout from '../../components/layouts/clientLayout';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';

function TrackLoad() {
    const [loads, setLoads] = useState([]);
    const [error, setError] = useState(null);
    const [selectedLoad, setSelectedLoad] = useState(null);
    const { accessToken, clientID } = useAuthStore();

    useEffect(() => {
        const fetchLoads = async () => {
            try {
                const response = await axios.get(`${BACKEND_Local}/api/client/requests`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    },
                    params: {
                        clientID
                    }
                });
                if (response.data && Array.isArray(response.data)) {
                    setLoads(response.data);
                } else {
                    console.error('Unexpected response data:', response.data);
                    setLoads([]);
                }
            } catch (error) {
                console.error('Error fetching loads:', error.response ? error.response.data : error.message);
                setLoads([]);
            }
        };

        fetchLoads();
    }, [accessToken, clientID]);

    const handleTrackClick = (load) => {
        setSelectedLoad(load);
    };

    return (
        <ClientLayout>
            <div className="py-6">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Track Jobs</h1>
                    {error && <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">{error}</p>}
                    
                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                <tr>
                                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Pickup Location</th>
                                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Dropoff Location</th>
                                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Distance</th>
                                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Goods Type</th>
                                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Number of Trucks</th>
                                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Weight</th>
                                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Created At</th>
                                    <th className="border border-gray-300 px-2 sm:px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800">
                                {loads.map((load) => (
                                    <tr key={load._id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200">
                                        <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.pickupLocation}</td>
                                        <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.dropoffLocation}</td>
                                        <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.distance} km</td>
                                        <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.goodsType}</td>
                                        <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.numberOfTrucks}</td>
                                        <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">{load.weight} tons</td>
                                        <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100">
                                            {new Date(load.createdAt).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 px-2 sm:px-4 py-2">
                                            <button
                                                onClick={() => handleTrackClick(load)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                                            >
                                                Track
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Full Page Modal */}
                    {selectedLoad && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                            <div className="bg-white dark:bg-gray-800 w-11/12 max-w-4xl max-h-[90vh] rounded-lg shadow-xl overflow-y-auto">
                                {/* Modal Header */}
                                <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                        Load Details
                                    </h2>
                                    <button
                                        onClick={() => setSelectedLoad(null)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Pickup Location</h3>
                                                <p className="text-gray-600 dark:text-gray-400">{selectedLoad.pickupLocation}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Dropoff Location</h3>
                                                <p className="text-gray-600 dark:text-gray-400">{selectedLoad.dropoffLocation}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Distance</h3>
                                                <p className="text-gray-600 dark:text-gray-400">{selectedLoad.distance} km</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Goods Type</h3>
                                                <p className="text-gray-600 dark:text-gray-400">{selectedLoad.goodsType}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Number of Trucks</h3>
                                                <p className="text-gray-600 dark:text-gray-400">{selectedLoad.numberOfTrucks}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Weight</h3>
                                                <p className="text-gray-600 dark:text-gray-400">{selectedLoad.weight} tons</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar Section at Bottom */}
                                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">ORDER STATUS</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                                            Status: <span className={`font-semibold ${selectedLoad.status === "pending" ? "text-yellow-600" : selectedLoad.status === "inTransit" ? "text-blue-600" : "text-green-600"}`}>
                                                {selectedLoad.status}
                                            </span>
                                        </p>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                            <div 
                                                className={`h-4 rounded-full ${selectedLoad.status === "delivered" ? "bg-green-600" : "bg-blue-600"}`} 
                                                style={{ width: `${selectedLoad.status === "delivered" ? 100 : selectedLoad.status === "inTransit" ? 60 : 20}%` }}
                                            />
                                        </div>
                                        <p className="mt-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                            {selectedLoad.status === "delivered" ? 100 : selectedLoad.status === "inTransit" ? 60 : 20}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}

export default TrackLoad;
