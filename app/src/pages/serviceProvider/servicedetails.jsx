import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ServiceProviderLayout from '../../components/layouts/serviceProviderLayout';
import { MessageCircle } from 'lucide-react'; // Importing the message icon for communication

// Mock API service
const mockApiService = {
  getServiceDetails: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: id,
          clientName: "Alice Moyo",
          requestDate: "Oct 1, 2023",
          serviceDetails: "Engine Repair",
          status: "Pending",
          contact: "alice.moyo@example.com",
          priority: "High",
          estimatedTime: "2 hours"
        });
      }, 500); // Simulate network delay
    });
  }
};

function ServiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                const data = await mockApiService.getServiceDetails(id);
                setService(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch service details');
                setLoading(false);
            }
        };

        if (id) {
            fetchServiceDetails();
        }
    }, [id]);

    if (loading) {
        return <ServiceProviderLayout><div>Loading...</div></ServiceProviderLayout>;
    }

    if (error) {
        return <ServiceProviderLayout><div>Error: {error}</div></ServiceProviderLayout>;
    }

    if (!service) {
        return <ServiceProviderLayout><div>No service found</div></ServiceProviderLayout>;
    }

    const handleWhatsAppClick = () => {
        const phoneNumber = '263786033933'; 
        const message = `Hi, I would like to discuss the service request for ${service.serviceDetails}.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <ServiceProviderLayout>
            <div className="py-6 dark:bg-gray-900">
                <div className="px-4 mx-auto max-w-3xl sm:px-6 md:px-8">
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">Service Request Details</h1>
                    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                Service Request #{service.id}
                            </h3>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700">
                            <dl>
                                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Client Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">{service.clientName}</dd>
                                </div>
                                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Request Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">{service.requestDate}</dd>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Details</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">{service.serviceDetails}</dd>
                                </div>
                                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">{service.status}</dd>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">{service.contact}</dd>
                                </div>
                                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">{service.priority}</dd>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Time</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">{service.estimatedTime}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                    <div className="mt-6 flex space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition duration-200 shadow-md transform hover:scale-105"
                        >
                            Back to Services
                        </button>
                        <button
                            onClick={handleWhatsAppClick}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition duration-200 shadow-md transform hover:scale-105"
                        >
                            Contact Client
                        </button>
                    </div>
                </div>
            </div>
        </ServiceProviderLayout>
    );
}

export default ServiceDetails;