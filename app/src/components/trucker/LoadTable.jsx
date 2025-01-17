import React from 'react';

const LoadTable = ({ currentLoads, openJobModal }) => {
  // Sort loads in descending order based on createdAt
  const sortedLoads = [...currentLoads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full table-fixed bg-white border border-gray-300 rounded-lg">
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
                    load.status === 'in transit' ? 'bg-green-100 text-green-800' : 
                    load.status === 'delivered' ? 'bg-green-100 text-green-800' :
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
    </div>
  );
};

export default LoadTable; 