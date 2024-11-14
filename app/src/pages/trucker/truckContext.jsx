import React, { createContext, useState } from 'react';

export const TruckContext = createContext(); // Ensure default value if needed

export const TruckProvider = ({ children }) => {
    const [allTrucks, setAllTrucks] = useState([]);
    const [availableTrucks, setAvailableTrucks] = useState([]);
    const [assignedTrucks, setAssignedTrucks] = useState([]);

    const assignTruck = (truckId, loadId) => {
        const updatedTrucks = allTrucks.map(truck => {
            if (truck.id === truckId) {
                return { ...truck, assignedLoad: loadId };
            }
            return truck;
        });
        setAllTrucks(updatedTrucks);
        setAvailableTrucks(updatedTrucks.filter(truck => !truck.assignedLoad));
        setAssignedTrucks(updatedTrucks.filter(truck => truck.assignedLoad));
    };

    return (
        <TruckContext.Provider value={{ availableTrucks, assignedTrucks, assignTruck }}>
            {children}
        </TruckContext.Provider>
    );
};