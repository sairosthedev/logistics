import React, { useState } from 'react'; // Add useState here
import Modal from 'react-modal';

const AssignTruckModal = ({ isOpen, onRequestClose, onAssign, availableTrucks }) => {
    const [selectedTruckId, setSelectedTruckId] = useState('');

    const handleAssignClick = () => {
        if (selectedTruckId) {
            onAssign(selectedTruckId);
            onRequestClose();
        } else {
            alert('Please select a truck first.');
        }
    };

    if (!availableTrucks) {
        return <div>Loading trucks...</div>;
    }

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <div>
                <h2>Select a Truck</h2>
                {availableTrucks.map(truck => (
                    <div key={truck._id} onClick={() => setSelectedTruckId(truck.id)}>
                        {truck.registrationNumber} - {truck.driver}
                    </div>
                ))}
                <button onClick={handleAssignClick}>Assign Truck</button>
            </div>
        </Modal>
    );
};

export default AssignTruckModal;