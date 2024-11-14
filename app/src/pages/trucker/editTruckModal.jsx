// import React, { useState, useEffect } from 'react';
// import Modal from 'react-modal';
// import { BACKEND_Local } from '../../../url';

// const customStyles = {
//   content: {
//     top: '50%',
//     left: '50%',
//     right: 'auto',
//     bottom: 'auto',
//     marginRight: '-50%',
//     transform: 'translate(-50%, -50%)',
//     borderRadius: '10px',
//     padding: '20px',
//     backgroundColor: '#f9fafb',
//     boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
//   },
// };

// const TruckDetailModal = ({ isOpen, onRequestClose, truck }) => {
//     const [registrationNumber, setRegistrationNumber] = useState(truck?.registrationNumber || '');
//     const [driver, setDriver] = useState(truck?.driver || '');
//     const [location, setLocation] = useState(truck?.location || '');
//     const [isAssigned, setIsAssigned] = useState(truck?.isAssigned || false);
//     const [maximumWeight, setMaximumWeight] = useState(truck?.maximumWeight || '');
//     const [status, setStatus] = useState(truck?.status || 'available');

//     useEffect(() => {
//         if (truck) {
//             setRegistrationNumber(truck.registrationNumber);
//             setDriver(truck.driver || '');
//             setLocation(truck.location || '');
//             setIsAssigned(truck.isAssigned);
//             setMaximumWeight(truck.maximumWeight || '');
//             setStatus(truck.status || 'available');
//         }
//     }, [truck]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const updatedTruck = {
//             ...truck,
//             registrationNumber,
//             driver,
//             location,
//             isAssigned,
//             maximumWeight,
//             status,
//         };

//         // Here you would typically send the updatedTruck to your backend
//         // await fetch(`${BACKEND_Local}/api/trucker/trucks/${truck.id}`, {
//         //     method: 'PUT',
//         //     headers: {
//         //         'Content-Type': 'application/json',
//         //     },
//         //     body: JSON.stringify(updatedTruck),
//         // });

//         console.log('Updated Truck:', updatedTruck);
//         onRequestClose(); // Close the modal after submission
//     };

//     if (!truck) return null;

//     return (
//         <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles} ariaHideApp={false}>
//             <h2 className="text-2xl font-bold mb-4">Edit Truck Details</h2>
//             <form onSubmit={handleSubmit}>
//                 <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700">Registration Number</label>
//                     <input
//                         type="text"
//                         value={registrationNumber}
//                         onChange={(e) => setRegistrationNumber(e.target.value)}
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                     />
//                 </div>
//                 <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700">Driver</label>
//                     <input
//                         type="text"
//                         value={driver}
//                         onChange={(e) => setDriver(e.target.value)}
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                     />
//                 </div>
//                 <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700">Location</label>
//                     <input
//                         type="text"
//                         value={location}
//                         onChange={(e) => setLocation(e.target.value)}
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                     />
//                 </div>
//                 <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700">Assigned</label>
//                     <input
//                         type="checkbox"
//                         checked={isAssigned}
//                         onChange={(e) => setIsAssigned(e.target.checked)}
//                     />
//                 </div>
//                 <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700">Maximum Weight</label>
//                     <input
//                         type="number"
//                         value={maximumWeight}
//                         onChange={(e) => setMaximumWeight(e.target.value)}
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                     />
//                 </div>
//                 <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700">Status</label>
//                     <select
//                         value={status}
//                         onChange={(e) => setStatus(e.target.value)}
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                     >
//                         <option value="available">Available</option>
//                         <option value="onJob">On Job</option>
//                         <option value="pending">Pending</option>
//                     </select>
//                 </div>
//                 <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300">
//                     Save Changes
//                 </button>
//                 <button type="button" onClick={onRequestClose} className="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-300">
//                     Cancel
//                 </button>
//             </form>
//         </Modal>
//     );
// };

// export default TruckDetailModal;
