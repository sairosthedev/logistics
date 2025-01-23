import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Filter, Search } from 'lucide-react';
import AdminLayout from '../../components/layouts/appLayout';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import { useAuthStore } from '../auth/auth';

const api = axios.create({
  baseURL: BACKEND_Local,
  headers: {
    'Content-Type': 'application/json'
  }
});

const ReviewCard = ({ review }) => (
  <div className="p-6 border rounded-lg mb-4 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              {review.userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold dark:text-gray-100">{review.userName}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {review.userType === 'client' ? 'Client' : 'Trucker'}
            </span>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mt-2">{review.comment}</p>
      </div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < review.rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
    <div className="mt-4 flex justify-between items-center">
      <span className="text-sm text-gray-500">
        {new Date(review.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </span>
      <span className={`px-3 py-1 rounded-full text-sm ${
        review.userType === 'client' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-blue-100 text-blue-800'
      }`}>
        {review.userType}
      </span>
    </div>
  </div>
);

function AdminRatings() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [clientReviews, truckerReviews] = await Promise.all([
          api.get('/api/client/ratings', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }),
          api.get('/api/trucker/ratings', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
        ]);

        const combinedReviews = [
          ...clientReviews.data.map(review => ({ ...review, userType: 'client' })),
          ...truckerReviews.data.map(review => ({ ...review, userType: 'trucker' }))
        ];

        setReviews(combinedReviews);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [accessToken]);

  const filteredReviews = reviews
    .filter(review => 
      (activeTab === 'all' || review.userType === activeTab) &&
      (review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       review.comment.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'highest') {
        return b.rating - a.rating;
      } else {
        return a.rating - b.rating;
      }
    });

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Ratings & Reviews</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          {['all', 'client', 'trucker'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="grid gap-4">
            {filteredReviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No reviews found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminRatings;
