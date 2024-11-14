import React, { useState } from 'react';
import Modal from 'react-modal';

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
  },
};

const TruckDetailModal = ({ isOpen, onRequestClose, truck, onAssign }) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  if (!truck) return null;

  const openAssignModal = () => {
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles} ariaHideApp={false}>
      <h2 className="text-2xl font-bold mb-4">Truck Details</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Registration Number</label>
        <p className="text-gray-700">{truck.registrationNumber}</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Driver</label>
        <p className="text-gray-700">{truck.driver || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <p className="text-gray-700">{truck.location || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Assigned</label>
        <p className="text-gray-700">{truck.isAssigned ? 'Yes' : 'No'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Maximum Weight</label>
        <p className="text-gray-700">{truck.maximumWeight || 'N/A'} kg</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
          <option value="available">Available</option>
          <option value="onJob">On Job</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div className="flex justify-between">
        <button onClick={onRequestClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-300">
          Close
        </button>
        <button onClick={openAssignModal} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300">
          Assign Truck
        </button>
      </div>
      {isAssignModalOpen && <AssignTruckModal isOpen={isAssignModalOpen} onRequestClose={closeAssignModal} onAssign={onAssign} />}
    </Modal>
  );
};

export default TruckDetailModal;