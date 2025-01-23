import React, { useState, useEffect } from 'react';
import ClientLayout from '../../components/layouts/clientLayout';
import { Search } from 'lucide-react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

function TrackLoad() {
    const [loads, setLoads] = useState([]);
    const [error, setError] = useState(null);
    const [selectedLoad, setSelectedLoad] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { accessToken, clientID } = useAuthStore();
    const [currentPage, setCurrentPage] = useState(1);
    const loadsPerPage = 10;
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previousRating, setPreviousRating] = useState(null);

    useEffect(() => {
        const fetchLoads = async () => {
            try {
                const response = await axios.get(`${BACKEND_Local}/api/client/requests`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    },
                    params: {
                        clientID
                    }
                });
                if (response.data && Array.isArray(response.data)) {
                    const sortedLoads = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setLoads(sortedLoads);
                } else {
                    console.error('Unexpected response data:', response.data);
                    setLoads([]);
                }
            } catch (error) {
                console.error('Error fetching loads:', error.response ? error.response.data : error.message);
                setError('Failed to fetch loads. Please try again later.');
                setLoads([]);
            }
        };

        if (accessToken && clientID) {
            fetchLoads();
        }
    }, [accessToken, clientID]);

    const getProgressPercentage = (status) => {
        switch(status) {
            case 'assigned':
            case 'accepted':
                return 20;
            case 'loaded':
                return 40;
            case 'in transit':
                return 80;
            case 'delivered':
                return 100;
            default:
                return 0;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'assigned':
            case 'accepted':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'loaded':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'in transit':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getProgressBarColor = (status) => {
        switch(status) {
            case 'assigned':
            case 'accepted':
                return 'bg-yellow-600';
            case 'loaded':
                return 'bg-orange-600';
            case 'in transit':
                return 'bg-blue-600';
            case 'delivered':
                return 'bg-green-600';
            default:
                return 'bg-gray-600';
        }
    };

    const filteredLoads = loads.filter(load => 
        load.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.dropoffLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.goodsType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastLoad = currentPage * loadsPerPage;
    const indexOfFirstLoad = indexOfLastLoad - loadsPerPage;
    const currentLoadsPage = filteredLoads.slice(indexOfFirstLoad, indexOfLastLoad);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleSubmitRating = async (loadId) => {
        setIsSubmitting(true);
        setError(null);
        try {
            // First get the request bid for this load
            const bidResponse = await axios.get(`${BACKEND_Local}/api/client/request-bids/${clientID}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            // Find the bid for this load
            const loadBid = bidResponse.data.find(bid => bid.requestID._id === loadId);
            if (!loadBid) {
                setError('Could not find the bid for this load');
                return;
            }

            const ratingData = {
                toUserID: loadBid.truckerID,
                toUserType: 'Trucker',
                requestID: loadId,
                requestType: 'TruckRequest',
                rating,
                comment: review
            };

            try {
                const response = await axios.post(`${BACKEND_Local}/api/ratings`, ratingData, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Rating submission successful:', response.data);

                // Fetch the updated rating
                await fetchRating(loadId);

                // Update loads list
                const updatedLoads = loads.map(load => {
                    if (load._id === loadId) {
                        return { ...load, hasRated: true };
                    }
                    return load;
                });
                setLoads(updatedLoads);
            } catch (postError) {
                const errorMessage = postError.response?.data?.error || postError.response?.data?.message || 'Failed to submit rating';
                setError(errorMessage);
                console.error('Rating submission error:', errorMessage);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'An error occurred while submitting the rating';
            setError(errorMessage);
            console.error('Error:', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchRating = async (loadId) => {
        try {
            const response = await axios.get(`${BACKEND_Local}/api/ratings/check/${loadId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && response.data.rating) {
                setPreviousRating(response.data.rating);
                // Update the load's hasRated status
                setSelectedLoad(prev => ({
                    ...prev,
                    hasRated: true
                }));
            } else {
                setPreviousRating(null);
                // Update the load's hasRated status
                setSelectedLoad(prev => ({
                    ...prev,
                    hasRated: false
                }));
            }
        } catch (error) {
            console.error('Error fetching rating:', error);
            setPreviousRating(null);
        }
    };

    const handleLoadSelect = async (load) => {
        setSelectedLoad(load);
        if (load.status === 'delivered') {
            await fetchRating(load._id);
        }
    };

    return (
        <ClientLayout>
            <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Track Jobs</h1>
                    
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        {error}
                    </div>
                )}

                {/* Desktop view */}
                <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <div className="p-4 border-b dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Jobs</h2>
                    </div>
                    <div className="w-full">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-400">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Pickup Location</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Dropoff Location</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Distance</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Goods Type</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Weight</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Created At</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {currentLoadsPage.map((load, index) => (
                                    <tr 
                                        key={load._id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                            index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                                        }`}
                                    >
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(load.status)}`}>
                                                {load.status}
                                            </span>
                                        </td>
                                       
                                        <td className="px-2 py-2 whitespace-normal text-sm text-gray-900 dark:text-white">{load.pickupLocation}</td>
                                        <td className="px-2 py-2 whitespace-normal text-sm text-gray-900 dark:text-white">{load.dropoffLocation}</td>
                                        <td className="px-2 py-2 whitespace-normal text-sm text-gray-900 dark:text-white">{load.distance} km</td>
                                        <td className="px-2 py-2 whitespace-normal text-sm text-gray-900 dark:text-white">{load.goodsType}</td>
                                        <td className="px-2 py-2 whitespace-normal text-sm text-gray-900 dark:text-white">{load.weight} tons</td>
                                        <td className="px-2 py-2 whitespace-normal text-sm text-gray-900 dark:text-white">
                                            {new Date(load.createdAt).toLocaleString('en-GB')}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <button
                                                onClick={() => handleLoadSelect(load)}
                                                className="px-2 py-1 text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Track
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile view with cards */}
                <div className="md:hidden space-y-4">
                    {currentLoadsPage.map((load) => (
                        <div 
                            key={load._id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(load.status)}`}>
                                        {load.status}
                                    </span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(load.createdAt).toLocaleString('en-GB')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleLoadSelect(load)}
                                    className="px-3 py-1 text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Track
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Pickup</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{load.pickupLocation}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Dropoff</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{load.dropoffLocation}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Goods Type</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{load.goodsType}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Weight</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{load.weight} tons</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Distance</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{load.distance} km</p>
                                </div>
                            </div>

                            {/* Progress bar for mobile */}
                            <div className="mt-3">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${getProgressBarColor(load.status)}`} 
                                        style={{ width: `${getProgressPercentage(load.status)}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-right text-xs text-gray-600 dark:text-gray-400">
                                    {getProgressPercentage(load.status)}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination - keep outside both views */}
                <div className="flex justify-center mt-4">
                    {Array.from({ length: Math.ceil(filteredLoads.length / loadsPerPage) }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-3 py-1 mx-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

                {/* Full Page Modal */}
                {selectedLoad && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                        <div className="bg-white dark:bg-gray-800 w-11/12 max-w-4xl max-h-[90vh] rounded-lg shadow-xl overflow-y-auto">
                            {/* Modal Header */}
                            <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                    Load Details
                                </h2>
                                <button
                                    onClick={() => setSelectedLoad(null)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Pickup Location</h3>
                                            <p className="text-gray-600 dark:text-gray-400">{selectedLoad.pickupLocation}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Dropoff Location</h3>
                                            <p className="text-gray-600 dark:text-gray-400">{selectedLoad.dropoffLocation}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Distance</h3>
                                            <p className="text-gray-600 dark:text-gray-400">{selectedLoad.distance} km</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Goods Type</h3>
                                            <p className="text-gray-600 dark:text-gray-400">{selectedLoad.goodsType}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Number of Trucks</h3>
                                            <p className="text-gray-600 dark:text-gray-400">{selectedLoad.numberOfTrucks}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Weight</h3>
                                            <p className="text-gray-600 dark:text-gray-400">{selectedLoad.weight} tons</p>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Created At</h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {new Date(selectedLoad.createdAt).toLocaleString('en-GB')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Ratings Section - Only show for delivered loads */}
                                {selectedLoad && selectedLoad.status === 'delivered' && (
                                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                            {previousRating ? 'Your Rating' : 'Rate this Delivery'}
                                        </h3>
                                        <div className="space-y-4">
                                            {error && (
                                                <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
                                                    {error}
                                                </div>
                                            )}
                                            {previousRating ? (
                                                <div className="flex flex-col items-center">
                                                    <Typography component="legend" className="mb-2">
                                                        Your rating for this delivery
                                                    </Typography>
                                                    <Rating
                                                        name="read-only-rating"
                                                        value={previousRating.rating}
                                                        readOnly
                                                        size="large"
                                                        precision={1}
                                                    />
                                                    {previousRating.comment && (
                                                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg w-full">
                                                            <p className="text-gray-600 dark:text-gray-300">
                                                                Your review:
                                                            </p>
                                                            <p className="mt-2 text-gray-800 dark:text-gray-200">
                                                                {previousRating.comment}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex flex-col items-center">
                                                        <Typography component="legend" className="mb-2">
                                                            How was your experience?
                                                        </Typography>
                                                        <Rating
                                                            name="delivery-rating"
                                                            value={rating}
                                                            onChange={(event, newValue) => {
                                                                setRating(newValue);
                                                            }}
                                                            size="large"
                                                            precision={1}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex flex-col space-y-2">
                                                        <label className="text-gray-700 dark:text-gray-300">
                                                            Leave a review (optional)
                                                        </label>
                                                        <textarea
                                                            value={review}
                                                            onChange={(e) => setReview(e.target.value)}
                                                            placeholder="Share your experience..."
                                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md 
                                                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                                                     dark:bg-gray-700 dark:text-white"
                                                            rows="4"
                                                        />
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => handleSubmitRating(selectedLoad._id)}
                                                            disabled={!rating || isSubmitting}
                                                            className={`px-4 py-2 rounded-md text-white 
                                                                ${(!rating || isSubmitting) 
                                                                    ? 'bg-gray-400 cursor-not-allowed' 
                                                                    : error 
                                                                        ? 'bg-red-600 hover:bg-red-700'
                                                                        : 'bg-blue-600 hover:bg-blue-700'}`}
                                                        >
                                                            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Progress Bar Section */}
                                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">ORDER STATUS</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                        Status: <span className={`font-semibold ${getStatusColor(selectedLoad.status)}`}>
                                            {selectedLoad.status}
                                        </span>
                                    </p>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                        <div 
                                            className={`h-4 rounded-full ${getProgressBarColor(selectedLoad.status)}`} 
                                            style={{ width: `${getProgressPercentage(selectedLoad.status)}%` }}
                                        />
                                    </div>
                                    <p className="mt-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                        {getProgressPercentage(selectedLoad.status)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClientLayout>
    );
}

export default TrackLoad;
