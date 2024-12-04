import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url';
import useAuthStore from '../auth/auth';

const TruckContext = createContext(null);

export const TruckProvider = ({ children }) => {
    const { accessToken, clientID } = useAuthStore();
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTrucks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BACKEND_Local}/api/trucker/trucks/${clientID}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setTrucks(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching trucks:', err);
            setError(err.response?.data?.message || 'Failed to fetch trucks');
        } finally {
            setLoading(false);
        }
    }, [accessToken, clientID]);

    const addTruck = async (truckData) => {
        try {
            const response = await axios.post(
                `${BACKEND_Local}/api/trucker/add`,
                { ...truckData, truckerID: clientID },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            if (response.data) {
                await fetchTrucks(); // Refresh the trucks list
                return { success: true, data: response.data };
            } else {
                return { 
                    success: false, 
                    error: 'Failed to add truck. No response from server.' 
                };
            }
        } catch (err) {
            console.error('Error adding truck:', err);
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to add truck. Please try again.' 
            };
        }
    };

    const updateTruck = async (truckId, truckData) => {
        try {
            const response = await axios.put(
                `${BACKEND_Local}/api/trucker/update/${truckId}`,
                truckData,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            await fetchTrucks();
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error updating truck:', err);
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to update truck' 
            };
        }
    };

    const deleteTruck = async (truckId) => {
        try {
            await axios.delete(
                `${BACKEND_Local}/api/trucker/delete/${truckId}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            await fetchTrucks();
            return { success: true };
        } catch (err) {
            console.error('Error deleting truck:', err);
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to delete truck' 
            };
        }
    };

    const assignTruckToLoad = async (loadId, truckId, negotiationPrice) => {
        try {
            const response = await axios.post(
                `${BACKEND_Local}/api/trucker/assign/${loadId}`,
                { truckId, negotiationPrice },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            await fetchTrucks();
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error assigning truck:', err);
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to assign truck' 
            };
        }
    };

    const value = {
        trucks,
        loading,
        error,
        fetchTrucks,
        addTruck,
        updateTruck,
        deleteTruck,
        assignTruckToLoad
    };

    return (
        <TruckContext.Provider value={value}>
            {children}
        </TruckContext.Provider>
    );
};

export const useTruckContext = () => {
    const context = useContext(TruckContext);
    if (!context) {
        throw new Error('useTruckContext must be used within a TruckProvider');
    }
    return context;
};

export default TruckContext;