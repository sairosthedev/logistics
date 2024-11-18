import React, { useState } from 'react';
import ServiceProviderLayout from '../../components/layouts/serviceProviderLayout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const services = [
  {
    id: 1,
    clientName: "Alice Moyo",
    serviceDetails: "Plumbing",
    status: "Pending",
    progress: 20
  },
  {
    id: 2,
    clientName: "Bob Chikore",
    serviceDetails: "Electrical",
    status: "In Progress",
    progress: 60
  },
  {
    id: 3,
    clientName: "Charlie Ncube",
    serviceDetails: "Cleaning",
    status: "Completed",
    progress: 100
  },
  {
    id: 4,
    clientName: "Dineo Mlambo",
    serviceDetails: "Gardening",
    status: "Pending",
    progress: 10
  },
  {
    id: 5,
    clientName: "Elias Moyo",
    serviceDetails: "Painting",
    status: "In Progress",
    progress: 50
  },
  {
    id: 6,
    clientName: "Fiona Chikanda",
    serviceDetails: "Carpentry",
    status: "Completed",
    progress: 100
  },
  {
    id: 7,
    clientName: "George Moyo",
    serviceDetails: "Roofing",
    status: "Pending",
    progress: 30
  },
  {
    id: 8,
    clientName: "Hannah Chikanda",
    serviceDetails: "Paving",
    status: "In Progress",
    progress: 70
  }
];

function TrackServices() {
    const [visibleServices, setVisibleServices] = useState(4);

    const handleViewMore = () => {
        setVisibleServices((prev) => prev + 4);
    };

    return (
        <ServiceProviderLayout>
            <ToastContainer />
            <div className="py-4 sm:py-6 dark:bg-gray-900">
                <div className="px-2 sm:px-4 mx-auto max-w-7xl">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Track Services</h1>
                    <div className="mt-4 space-y-4 sm:space-y-6">
                        {services.slice(0, visibleServices).map((service) => (
                            <div key={service.id} className="border rounded-lg p-4 sm:p-6 bg-white dark:bg-gray-800 dark:border-gray-700">
                                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">
                                    {service.clientName}
                                </h2>
                                <p className="mt-1 text-base sm:text-lg text-gray-600 dark:text-gray-300">
                                    Service Details: {service.serviceDetails}
                                </p>
                                <p className="mt-1 text-base sm:text-lg text-gray-600 dark:text-gray-300">
                                    Status: <span className={`font-semibold ${
                                        service.status === "Pending" 
                                            ? "text-yellow-600 dark:text-yellow-400" 
                                            : service.status === "In Progress" 
                                                ? "text-blue-600 dark:text-blue-400" 
                                                : "text-green-600 dark:text-green-400"
                                    }`}>
                                        {service.status}
                                    </span>
                                </p>
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4">
                                        <div 
                                            className={`h-3 sm:h-4 rounded-full ${
                                                service.progress === 100 
                                                    ? "bg-green-600 dark:bg-green-500" 
                                                    : "bg-blue-600 dark:bg-blue-500"
                                            }`} 
                                            style={{ width: `${service.progress}%` }}
                                        ></div>
                                    </div>
                                    <p className="mt-1 text-right text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        {service.progress}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {visibleServices < services.length && (
                        <div className="mt-4">
                            <button 
                                onClick={handleViewMore} 
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-200"
                            >
                                View More
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </ServiceProviderLayout>
    );
}

export default TrackServices;
