import React from 'react';

const LoadTable = ({ currentLoads, openJobModal }) => {
  // Sort loads in descending order based on createdAt
  const sortedLoads = [...currentLoads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="overflow-x-auto">
      {/* Desktop View */}
      <table className="hidden md:table min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goods Type</th>
            <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pick Up</th>
            <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Off</th>
            <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedLoads.map((load) => (
            <tr key={load._id} className="hover:bg-gray-50">
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="break-words">{load.clientName}</div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="break-words">{load.goodsType}</div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="break-words">{load.pickupLocation}</div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="break-words">{load.dropoffLocation}</div>
              </td>
              <td className="px-4 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${load.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    load.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {load.status}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                {new Date(load.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-4 text-sm">
                <button
                  onClick={() => openJobModal(load)}
                  className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {currentLoads.map((load) => (
          <div
            key={load._id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-white">
                {load.clientName}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(load.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Goods: </span>
                <span className="text-gray-900 dark:text-white">{load.goodsType}</span>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">From: </span>
                <span className="text-gray-900 dark:text-white">{load.pickupLocation}</span>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">To: </span>
                <span className="text-gray-900 dark:text-white">{load.dropoffLocation}</span>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">Trucks needed: </span>
                <span className="text-gray-900 dark:text-white">{load.numberOfTrucks}</span>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status: </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    load.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : load.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {load.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => openJobModal(load)}
              className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadTable; 