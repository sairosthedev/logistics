import React from 'react';

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 shadow-lg">
                <h2 className="text-lg font-semibold mb-4">{message}</h2>
                <div className="flex justify-end">
                    <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg mr-2"
                        onClick={onConfirm}
                    >
                        Yes
                    </button>
                    <button 
                        className="px-4 py-2 bg-red-500 text-white rounded-lg"
                        onClick={onCancel}
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;

