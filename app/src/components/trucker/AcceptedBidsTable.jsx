import React, { useState } from 'react';
import { format } from 'date-fns';

const AcceptedBidsTable = ({ currentBids, openJobModal }) => {
  // Sort bids in descending order based on createdAt
  const sortedBids = [...currentBids].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const [currentPage, setCurrentPage] = useState(1);
  const bidsPerPage = 10;

  const indexOfLastBid = currentPage * bidsPerPage;
  const indexOfFirstBid = indexOfLastBid - bidsPerPage;
  const currentBidsPage = sortedBids.slice(indexOfFirstBid, indexOfLastBid);

  const handleViewClick = (bid) => {
    // Format the bid data to match the expected structure
    const formattedBid = {
      ...bid,
      rate: bid.rate || (bid.requestID && bid.requestID.rate),
      negotiationPrice: bid.negotiationPrice || (bid.requestID && bid.requestID.negotiationPrice)
    };
    openJobModal(formattedBid);
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="overflow-x-auto">
      {/* Desktop View */}
      <table className="hidden md:table min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
            <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goods Type</th>
            <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pick Up</th>
            <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Off</th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
            <th className="w-[5%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentBidsPage.map((bid) => (
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
                <div className="break-words">{format(new Date(bid.createdAt), 'Pp')}</div>
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

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(sortedBids.length / bidsPerPage) }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-3 py-1 mx-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {currentBidsPage.map((bid) => (
          <div
            key={bid._id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-white">
                {bid.clientName}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(bid.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Goods: </span>
                <span className="text-gray-900 dark:text-white">{bid.goodsType}</span>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">From: </span>
                <span className="text-gray-900 dark:text-white">{bid.pickupLocation}</span>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">To: </span>
                <span className="text-gray-900 dark:text-white">{bid.dropoffLocation}</span>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">Price: </span>
                <span className="text-gray-900 dark:text-white">
                  ${bid.negotiationPrice}
                </span>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status: </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    bid.status === "in transit"
                      ? "bg-yellow-100 text-yellow-800"
                      : bid.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {bid.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleViewClick(bid)}
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

export default AcceptedBidsTable;