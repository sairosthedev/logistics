import React from 'react';

const AcceptedBidsTable = ({ currentBids, openJobModal }) => {
  const handleViewClick = (bid) => {
    openJobModal(bid, bid.status !== 'bid');
  };

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full table-fixed bg-white border border-gray-300 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
            <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goods Type</th>
            <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pick Up</th>
            <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Off</th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="w-[5%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentBids.map((bid) => (
            <tr key={bid._id} className="hover:bg-gray-50">
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="break-words">{bid.clientName}</div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="break-words">{bid.goodsType}</div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="break-words">{bid.pickupLocation}</div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="break-words">{bid.dropoffLocation}</div>
              </td>
              <td className="px-4 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${bid.status === 'loaded' ? 'bg-blue-100 text-blue-800' : 
                    bid.status === 'in transit' ? 'bg-orange-100 text-orange-800' : 
                    bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {bid.status}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="break-words">${bid.negotiationPrice}</div>
              </td>
              <td className="px-4 py-4 text-sm">
                <button
                  onClick={() => handleViewClick(bid)}
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

export default AcceptedBidsTable; 