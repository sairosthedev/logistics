import React, { useState } from 'react';
import Modal from 'react-modal';

const AssignTruckModal = ({ isOpen, onRequestClose, onAssign, availableTrucks }) => {
    const [selectedTruckId, setSelectedTruckId] = useState('');
    const [error, setError] = useState('');

    const handleAssignClick = () => {
        if (selectedTruckId) {
            onAssign(selectedTruckId);
            onRequestClose();
        } else {
            setError('Please select a truck first.');
        }
    };

    if (!availableTrucks) {
        return (
            <Modal 
                isOpen={isOpen} 
                onRequestClose={onRequestClose}
                className="max-w-lg mx-auto mt-20 p-6 bg-white rounded-lg shadow-xl"
                ariaHideApp={false}
            >
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading trucks...</span>
                </div>
            </Modal>
        );
    }

    return (
        <Modal 
            isOpen={isOpen} 
            onRequestClose={onRequestClose}
            className="max-w-lg mx-auto mt-20 p-6 bg-blue-500 rounded-lg shadow-xl"
            ariaHideApp={false}
        >
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Select a Truck</h2>
                
                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    {availableTrucks.length === 0 ? (
                        <p className="text-gray-500">No available trucks found.</p>
                    ) : (
                        availableTrucks.map(truck => (
                            <div 
                                key={truck._id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                    selectedTruckId === truck._id 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedTruckId(truck._id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{truck.registrationNumber} - {truck.driver}</p>
                                        <p className="text-sm text-gray-500"></p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onRequestClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssignClick}
                        disabled={!selectedTruckId}
                        className={`px-4 py-2 text-white rounded-md ${
                            !selectedTruckId
                                ? 'bg-blue-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        Assign Truck
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignTruckModal;