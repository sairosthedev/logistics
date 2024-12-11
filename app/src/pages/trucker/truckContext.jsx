import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url';
import useAuthStore from '../auth/auth';

const TruckContext = createContext(null);

// Valid truck statuses
const VALID_STATUSES = {
    AVAILABLE: 'available',
    ASSIGNED: 'assigned',
    INTRANSIT: 'intransit'
};

export const TruckProvider = ({ children }) => {
    const { accessToken, clientID } = useAuthStore();
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTrucks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${BACKEND_Local}/api/trucker/trucks/${clientID}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            // Ensure each truck has a valid status
            const trucksWithStatus = response.data.map(truck => ({
                ...truck,
                status: Object.values(VALID_STATUSES).includes(truck.status) 
                    ? truck.status 
                    : VALID_STATUSES.AVAILABLE
            }));
            
            console.log('Fetched trucks:', trucksWithStatus);
            setTrucks(trucksWithStatus);
            setError(null);
        } catch (err) {
            console.error('Error fetching trucks:', err);
            setError(err.response?.data?.message || 'Failed to fetch trucks');
            setTrucks([]);
        } finally {
            setLoading(false);
        }
    }, [accessToken, clientID]);

    const addTruck = async (truckData) => {
        try {
            // Ensure new trucks have a valid status
            const truckWithStatus = {
                ...truckData,
                truckerID: clientID,
                status: Object.values(VALID_STATUSES).includes(truckData.status)
                    ? truckData.status
                    : VALID_STATUSES.AVAILABLE,
                assignedLoad: null
            };

            console.log('Adding truck with data:', truckWithStatus);
            
            const response = await axios.post(
                `${BACKEND_Local}/api/trucker/add`,
                truckWithStatus,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            if (response.data) {
                await fetchTrucks();
                return { success: true, data: response.data };
            }
            return { success: false, error: 'Failed to add truck' };
        } catch (err) {
            console.error('Error adding truck:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to add truck' };
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

    const assignTruckToLoad = useCallback(async (truckId, loadId, loadDetails) => {
        try {
            const response = await axios.put(`/api/trucker/trucks/${truckId}`, {
                status: 'assigned',
                currentLoad: {
                    loadId,
                    ...loadDetails,
                    assignedAt: new Date().toISOString()
                }
            });
            
            await fetchTrucks(); // Refresh the trucks list
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error assigning truck to load:', err);
            return {
                success: false,
                error: err.response?.data?.message || 'Failed to assign truck to load'
            };
        }
    }, [fetchTrucks]);

    const updateTruckStatus = async (truckId, newStatus) => {
        try {
            // Validate the status
            if (!Object.values(VALID_STATUSES).includes(newStatus)) {
                return { 
                    success: false, 
                    error: `Invalid status. Must be one of: ${Object.values(VALID_STATUSES).join(', ')}` 
                };
            }

            const response = await axios.put(
                `${BACKEND_Local}/api/trucker/trucks/${truckId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            if (response.data) {
                await fetchTrucks();
                return { success: true, data: response.data };
            }
            return { success: false, error: 'Failed to update truck status' };
        } catch (err) {
            console.error('Error updating truck status:', err);
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to update truck status' 
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
        assignTruckToLoad,
        updateTruckStatus
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