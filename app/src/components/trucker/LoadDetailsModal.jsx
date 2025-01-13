import React from 'react';
import Modal from 'react-modal';
import { X, CheckCircle } from 'lucide-react';
import StatusActionBar from './StatusActionBar';

const LoadDetailsModal = ({
  isOpen,
  onClose,
  selectedLoad,
  modalStyles,
  acceptedBids,
  updateRequestStatus,
  handleSubmit,
  renderTruckDropdowns,
  isSubmitting,
  selectedTrucks,
  responseMessage,
  showSuccessPopup,
  negotiationPrice,
  setNegotiationPrice,
  showStatusBar = true
}) => {
  if (!selectedLoad) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={modalStyles}
        contentLabel="Job Details"
        className="dark:bg-gray-800"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-xl sm:text-2xl font-bold mb-4 dark:text-white pr-8 text-center">
            {selectedLoad.clientName}
          </h2>
          
          <div className="overflow-y-auto max-h-[70vh]">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <tbody>
                  <tr>
                    <td className="py-2 text-gray-700 dark:text-gray-300">Goods Type:</td>
                    <td className="py-2 dark:text-white">{selectedLoad.goodsType}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700 dark:text-gray-300">Weight:</td>
                    <td className="py-2">{selectedLoad.weight} Tons</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700 dark:text-gray-300">Pay Terms:</td>
                    <td className="py-2">{selectedLoad.payTerms}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700 dark:text-gray-300">Number of Trucks:</td>
                    <td className="py-2">{selectedLoad.numberOfTrucks}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700 dark:text-gray-300">Pickup Location:</td>
                    <td className="py-2">{selectedLoad.pickupLocation || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700 dark:text-gray-300">Dropoff Location:</td>
                    <td className="py-2">{selectedLoad.dropoffLocation || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700 dark:text-gray-300">Status:</td>
                    <td className="py-2">{selectedLoad.status}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700 dark:text-gray-300">Comments:</td>
                    <td className="py-2">{selectedLoad.comments}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700 dark:text-gray-300">Price (USD):</td>
                    <td className="py-2">
                      <div>
                        <span>Est: ${selectedLoad.rate}</span>
                        {negotiationPrice && (
                          <div className="text-green-600">
                            Bid: ${negotiationPrice}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-center">
              <span className={`
                px-4 py-2 rounded-full text-sm font-semibold
                ${selectedLoad.status === 'loaded' 
                  ? 'bg-blue-500 text-white' 
                  : selectedLoad.status === 'in transit' 
                    ? 'bg-orange-500 text-white'
                    : selectedLoad.status === 'delivered' 
                      ? 'bg-green-500 text-white'
                      : selectedLoad.status === 'accepted' 
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-500 text-white'
                }
              `}>
                {selectedLoad.status.charAt(0).toUpperCase() + selectedLoad.status.slice(1)}
              </span>
            </div>

            {showStatusBar && selectedLoad && (
              <StatusActionBar 
                load={selectedLoad} 
                onStatusUpdate={(newStatus) => {
                  // Optionally handle status updates here
                  console.log('Status updated to:', newStatus);
                }} 
              />
            )}

            {selectedLoad.status === 'pending' && (
              <form onSubmit={handleSubmit} className="mt-4">
                <label className="block text-gray-700 dark:text-gray-300 text-base mb-2">
                  Assign Trucks ({selectedTrucks.filter(Boolean).length}/{selectedLoad.numberOfTrucks} selected):
                </label>
                <div className="space-y-2">
                  {renderTruckDropdowns()}
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Negotiation Price (USD):
                  </label>
                  <input
                    type="number"
                    value={negotiationPrice}
                    onChange={(e) => setNegotiationPrice(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter price"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded text-base hover:bg-green-600 transition duration-200"
                  disabled={isSubmitting || selectedTrucks.filter(Boolean).length === 0 || selectedTrucks.filter(Boolean).length > selectedLoad.numberOfTrucks}
                >
                  {isSubmitting ? 'Submitting...' : 'Assign Trucks'}
                </button>
                {responseMessage && (
                  <div className={`mt-4 text-${responseMessage.includes('successfully') ? 'green' : 'red'}-500`}>
                    {responseMessage}
                  </div>
                )}
              </form>
            )}

            {responseMessage && (
              <div className={`mt-4 text-center p-2 rounded ${
                responseMessage.includes('successfully') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {responseMessage}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {showSuccessPopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-8 py-4 rounded-xl shadow-2xl z-[9999] flex items-center space-x-3 animate-popup">
          <CheckCircle className="w-6 h-6" />
          <span className="text-lg font-medium">Trucks assigned successfully!</span>
        </div>
      )}
    </>
  );
};

export default LoadDetailsModal;