import React, { useState, useEffect } from 'react';
import { Truck, User, MapPin, Phone, Star, Weight, Calendar } from 'lucide-react';
import AppLayout from '../../components/layouts/appLayout';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth'; // Import the useAuthStore hook

export default function AvailableTrucks() {
  const { accessToken, clientID } = useAuthStore(); // Get the accessToken and clientID from the store
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [truckers, setTruckers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTruckers = async () => {
      try {
        const response = await axios.get(`${BACKEND_Local}/api/admin/trucks`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setTruckers(response.data);
      } catch (error) {
        console.error('Error fetching truckers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTruckers();
  }, [accessToken, clientID]);

  const filteredTruckers = truckers.filter(trucker => {
    const matchesSearch = searchTerm === '' || (
      (trucker.driverName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (trucker.truckType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (trucker.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    
    const matchesAvailability = 
      filterAvailability === 'all' || 
      (trucker.status?.toLowerCase() || '') === filterAvailability.toLowerCase();

    return matchesSearch && matchesAvailability;
  });

  const TruckerCard = ({ trucker }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <User className="mr-2" size={20} />
          {trucker.driverName}
        </h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center text-gray-700">
          <Truck className="mr-2" size={18} />
          <span className="font-semibold">{trucker.truckType}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <MapPin className="mr-2" size={18} />
          <span>{trucker.location}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2" size={18} />
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            trucker.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {trucker.status}
          </span>
        </div>
        <div className="flex items-center text-gray-700">
          <Phone className="mr-2" size={18} />
          <span>{trucker.driverPhone}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <Star className="mr-2" size={18} />
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`${
                  i < Math.floor(trucker.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-semibold">{trucker.rating}</span>
          </div>
        </div>
        <div className="flex items-center text-gray-700">
          <Weight className="mr-2" size={18} />
          <span>{trucker.maxCarryingWeight}</span>
        </div>
        <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-300">
          Contact Trucker
        </button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Trucks</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, truck, or location..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-600">Loading...</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTruckers.map((trucker, index) => (
              <TruckerCard key={index} trucker={trucker} />
            ))}
          </div>
        )}

        {filteredTruckers.length === 0 && !loading && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-600">No truckers found</h2>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}