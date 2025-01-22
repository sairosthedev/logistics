import React, { useState } from 'react';
import { format } from 'date-fns';

const AllBidsTable = ({ currentBids, openJobModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const bidsPerPage = 10;

  // Sort bids in descending order based on createdAt
  const sortedBids = [...currentBids].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const indexOfLastBid = currentPage * bidsPerPage;
  const indexOfFirstBid = indexOfLastBid - bidsPerPage;
  const currentBidsPage = sortedBids.slice(indexOfFirstBid, indexOfLastBid);

  const handleViewClick = (bid) => {
    openJobModal(bid, false); // Pass false to indicate no status bar should be shown
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusColor = (status) => {
    switch (status) {
      case 'bid':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      {/* Desktop View */}
      <table className="hidden md:table min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goods Type</th>
            <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pick Up</th>
            <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Off</th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Price</th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Bid</th>
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
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="break-words">${bid.rate ? bid.rate.toLocaleString() : 'N/A'}</div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="break-words">${bid.negotiationPrice ? bid.negotiationPrice.toLocaleString() : 'N/A'}</div>
              </td>
              <td className="px-4 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bid.status)}`}>
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
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bid.status)}`}>
                {bid.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-500">Goods Type</p>
                <p className="font-medium">{bid.goodsType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Original Price</p>
                <p className="font-medium">${bid.rate ? bid.rate.toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Your Bid</p>
                <p className="font-medium">${bid.negotiationPrice ? bid.negotiationPrice.toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{format(new Date(bid.createdAt), 'Pp')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Pick Up</p>
                <p className="font-medium">{bid.pickupLocation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Drop Off</p>
                <p className="font-medium">{bid.dropoffLocation}</p>
              </div>
            </div>

            <button
              onClick={() => handleViewClick(bid)}
              className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(sortedBids.length / bidsPerPage) }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-3 py-1 mx-1 rounded ${
              currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AllBidsTable;