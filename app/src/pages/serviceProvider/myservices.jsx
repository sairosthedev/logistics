import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceProviderLayout from '../../components/layouts/serviceProviderLayout';
import { Search, ChevronDown, Plus, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import useAuthStore from '../auth/auth';
import { BACKEND_Local } from '../../../url.js';

function MyServices() {
    const navigate = useNavigate();
    const [serviceRequests, setServiceRequests] = useState([]);
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    const [isViewMoreModalOpen, setIsViewMoreModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBy, setFilterBy] = useState("serviceName");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showAllItems, setShowAllItems] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { accessToken, clientID } = useAuthStore();

    const [newService, setNewService] = useState({
        serviceName: '',
        priority: '2',
        rating: 0,
        status: 'pending',
        description: '',
        servicesOffered: [],
        estimatedTime: '',
        priceRange: '',
        location: ''
    });

    useEffect(() => {
        fetchServices();
    }, [clientID, accessToken]);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BACKEND_Local}/api/service/provider/${clientID}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (response.status === 200) {
                setServiceRequests(response.data);
            } else {
                toast.error('Failed to fetch services');
            }
        } catch (error) {
            console.error('Error fetching service requests:', error);
            toast.error('Failed to fetch services');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddService = async () => {
        if (!newService.serviceName || !newService.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        const payload = {
            serviceProviderID: clientID,
            serviceName: newService.serviceName,
            priority: parseInt(newService.priority),
            rating: parseFloat(newService.rating) || 0,
            status: 'active',
            description: newService.description,
            servicesOffered: Array.isArray(newService.servicesOffered) 
                ? newService.servicesOffered 
                : newService.servicesOffered.split(',').map(s => s.trim()),
            estimatedTime: newService.estimatedTime,
            priceRange: newService.priceRange,
            location: newService.location
        };

        try {
            setIsLoading(true);
            const response = await axios.post(`${BACKEND_Local}/api/service/create`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.status === 200) {
                setServiceRequests([...serviceRequests, response.data]);
                setIsAddServiceModalOpen(false);
                resetNewService();
                toast.success('Service added successfully');
            } else {
                toast.error('Failed to add service');
            }
        } catch (error) {
            console.error('Error adding service:', error);
            toast.error('Failed to add service');
        } finally {
            setIsLoading(false);
        }
    };

    const resetNewService = () => {
        setNewService({
            serviceName: '',
            priority: '2',
            rating: 0,
            status: 'pending',
            description: '',
            servicesOffered: [],
            estimatedTime: '',
            priceRange: '',
            location: ''
        });
    };

    const handleUpdateStatus = async (serviceId, newStatus) => {
        try {
            const response = await axios.patch(
                `${BACKEND_Local}/api/service/${serviceId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            if (response.status === 200) {
                setServiceRequests(serviceRequests.map(service => 
                    service._id === serviceId ? { ...service, status: newStatus } : service
                ));
                toast.success('Status updated successfully');
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const viewServiceDetails = (service) => {
        setSelectedService(service);
        setIsViewMoreModalOpen(true);
    };

    // Filter and pagination logic
    const filteredRequests = serviceRequests.filter(request => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = request[filterBy]?.toString().toLowerCase().includes(searchLower);
        const matchesStatus = statusFilter === "all" || request.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const indexOfLastItem = showAllItems ? filteredRequests.length : currentPage * itemsPerPage;
    const indexOfFirstItem = showAllItems ? 0 : indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        setShowAllItems(false);
    };

    const toggleShowAll = () => {
        setShowAllItems(!showAllItems);
        if (!showAllItems) {
            setCurrentPage(1);
        }
    };

    const getStatusBadgeColor = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            'in progress': 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    // Common search bar styles
    const searchBarClasses = `
        w-full 
        pl-10 
        pr-4 
        py-2 
        border 
        rounded-lg 
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-500 
        dark:bg-gray-800 
        dark:border-gray-700 
        dark:text-gray-300 
        dark:placeholder-gray-500
        transition-colors 
        duration-200
    `;

    // Common select/filter styles
    const selectClasses = `
        border 
        rounded-lg 
        px-4 
        py-2 
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-500 
        dark:bg-gray-800 
        dark:border-gray-700 
        dark:text-gray-300
        transition-colors 
        duration-200
    `;

    return (
        <ServiceProviderLayout>
            <ToastContainer />
            <div className="py-6 dark:bg-gray-900">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                    {/* Header Section */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">My Services</h1>
                        <button
                            onClick={() => setIsAddServiceModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition duration-200"
                            disabled={isLoading}
                        >
                            <Plus size={20} className="mr-2" />
                            Add Service
                        </button>
                    </div>

                    {/* Filters Section */}
                    <div className="mt-8 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    className={searchBarClasses}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <select
                                className={selectClasses}
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value)}
                            >
                                <option value="serviceName">Service Name</option>
                                <option value="priority">Priority</option>
                                <option value="location">Location</option>
                                <option value="priceRange">Price Range</option>
                            </select>

                            <select
                                className={selectClasses}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <select
                                className={selectClasses}
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <option value="all">All Priority</option>
                                <option value="1">Low Priority</option>
                                <option value="2">Medium Priority</option>
                                <option value="3">High Priority</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="mt-8 overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            <>
                                <table className="min-w-full table-auto text-sm text-left">
                                    <thead className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-6 py-3">Service Name</th>
                                            <th className="px-6 py-3">Priority</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {currentItems.map((service) => (
                                            <tr key={service._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">{service.serviceName}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                        ${service.priority === 3 ? 'bg-red-100 text-red-800' :
                                                          service.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                                                          'bg-green-100 text-green-800'}`}>
                                                        {service.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(service.status)}`}>
                                                        {service.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => viewServiceDetails(service)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination and View More Section */}
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex flex-col items-center space-y-4">
                                        {!showAllItems && filteredRequests.length > itemsPerPage && (
                                            <div className="flex space-x-2">
                                                {[...Array(totalPages)].map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handlePageChange(index + 1)}
                                                        className={`px-3 py-1 rounded ${
                                                            currentPage === index + 1
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {filteredRequests.length > itemsPerPage && (
                                            <button
                                                onClick={toggleShowAll}
                                                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                                            >
                                                {showAllItems ? 'Show Less' : 'View More'}
                                                <ChevronDown 
                                                    className={`ml-2 transform ${showAllItems ? 'rotate-180' : ''} transition-transform duration-200`} 
                                                    size={16} 
                                                />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Service Modal */}
            {isAddServiceModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Service</h3>
                            <button
                                onClick={() => setIsAddServiceModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Service Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Enter service name"
                                    value={newService.serviceName}
                                    onChange={(e) => setNewService({...newService, serviceName: e.target.value})}
                                />
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority
                                </label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={newService.priority}
                                    onChange={(e) => setNewService({...newService, priority: e.target.value})}
                                >
                                    <option value="1">Low Priority</option>
                                    <option value="2">Medium Priority</option>
                                    <option value="3">High Priority</option>
                                </select>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Initial Rating
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Enter rating (0-5)"
                                    value={newService.rating}
                                    onChange={(e) => setNewService({...newService, rating: e.target.value})}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Enter service description"
                                    rows="3"
                                    value={newService.description}
                                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                                />
                            </div>

                            {/* Services Offered */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Services Offered
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Enter services (comma separated)"
                                    value={Array.isArray(newService.servicesOffered) ? newService.servicesOffered.join(', ') : newService.servicesOffered}
                                    onChange={(e) => setNewService({...newService, servicesOffered: e.target.value})}
                                />
                            </div>

                            {/* Estimated Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Time
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g., 2-3 hours"
                                    value={newService.estimatedTime}
                                    onChange={(e) => setNewService({...newService, estimatedTime: e.target.value})}
                                />
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price Range
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g., $50-$100"
                                    value={newService.priceRange}
                                    onChange={(e) => setNewService({...newService, priceRange: e.target.value})}
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Enter location"
                                    value={newService.location}
                                    onChange={(e) => setNewService({...newService, location: e.target.value})}
                                />
                            </div>

                            <div className="flex flex-col space-y-2 mt-6">
                                <button
                                    onClick={handleAddService}
                                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 disabled:bg-gray-400"
                                    disabled={isLoading || !newService.serviceName || !newService.description}
                                >
                                    {isLoading ? 'Adding...' : 'Add Service'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAddServiceModalOpen(false);
                                        resetNewService();
                                    }}
                                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View More Modal */}
            {isViewMoreModalOpen && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Service Details</h3>
                            <button
                                onClick={() => setIsViewMoreModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium">Service Name:</h4>
                                <p>{selectedService.serviceName}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Priority:</h4>
                                <p>{selectedService.priority}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Rating:</h4>
                                <p>{selectedService.rating}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Status:</h4>
                                <p>{selectedService.status}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Description:</h4>
                                <p>{selectedService.description}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Location:</h4>
                                <p>{selectedService.location}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Estimated Time:</h4>
                                <p>{selectedService.estimatedTime}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Price Range:</h4>
                                <p>{selectedService.priceRange}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Services Offered:</h4>
                                <p>{selectedService.servicesOffered.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ServiceProviderLayout>
    );
}

export default MyServices;