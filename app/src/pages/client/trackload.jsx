import React, { useState, useEffect } from 'react';
import ClientLayout from '../../components/layouts/clientLayout';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';

function TrackLoad() {
    console.log("TrackLoad component is rendering");
    const [loads, setLoads] = useState([]);
    const [error, setError] = useState(null);
    const { accessToken, clientID } = useAuthStore();

    useEffect(() => {
        console.log("Fetching loads for client:", clientID); // Moved log inside useEffect
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
                    console.log("Loads fetched:", response.data);
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

    return (
        <ClientLayout>
            <div className="py-6">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Track Jobs</h1>
                    {error && <p className="text-red-600 text-sm sm:text-base">{error}</p>}
                    <div className="mt-4 space-y-4 sm:space-y-6">
                        {loads.length > 0 ? (
                            loads.map((load) => (
                                <div key={load._id} className="border rounded-lg p-4 sm:p-6 bg-white">
                                    <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Load Details: {load.goodsType}</h2>
                                    <p className="mt-2 text-base sm:text-lg text-gray-600">Status: <span className={`font-semibold ${load.status === "pending" ? "text-yellow-600" : load.status === "inTransit" ? "text-blue-600" : "text-green-600"}`}>{load.status}</span></p>
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                            <div className={`h-4 rounded-full ${load.status === "delivered" ? "bg-green-600" : "bg-blue-600"}`} style={{ width: `${load.status === "delivered" ? 100 : load.status === "inTransit" ? 60 : 20}%` }}></div>
                                        </div>
                                        <p className="mt-2 text-right text-xs sm:text-sm text-gray-600">{load.status === "delivered" ? 100 : load.status === "inTransit" ? 60 : 20}%</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-base sm:text-lg">No loads available.</p>
                        )}
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}

export default TrackLoad;
