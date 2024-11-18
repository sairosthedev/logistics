import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ServiceProviderLayout from '../../components/layouts/serviceProviderLayout';

// Mock database of clients
const clients = [
  {
    id: "1",
    name: "Alice Moyo",
    email: "alice.moyo@example.com",
    phone: "+263 77 123 4567",
    address: "123 Samora Machel Ave, Harare",
    serviceHistory: [
      { date: "Oct 1, 2023", service: "Engine Repair", status: "Pending" },
      { date: "Aug 15, 2023", service: "Oil Change", status: "Completed" },
      { date: "Jun 3, 2023", service: "Tire Replacement", status: "Completed" },
    ]
  },
  {
    id: "2",
    name: "Bob Chikore",
    email: "bob.chikore@example.com",
    phone: "+263 77 987 6543",
    address: "456 Nelson Mandela Ave, Harare",
    serviceHistory: [
      { date: "Sep 10, 2023", service: "Oil Change", status: "In progress" },
      { date: "Jul 20, 2023", service: "Battery Replacement", status: "Completed" },
      { date: "May 5, 2023", service: "Transmission Repair", status: "Completed" },
    ]
  },
  {
    id: "3",
    name: "Charlie Ncube",
    email: "charlie.ncube@example.com",
    phone: "+263 77 654 3210",
    address: "789 Robert Mugabe Rd, Harare",
    serviceHistory: [
      { date: "Nov 5, 2023", service: "Air Filter Replacement", status: "Completed" },
      { date: "Oct 12, 2023", service: "Spark Plug Replacement", status: "Completed" },
      { date: "Aug 25, 2023", service: "Coolant Flush", status: "Completed" },
    ]
  },
  {
    id: "4",
    name: "David Moyo",
    email: "david.moyo@example.com",
    phone: "+263 77 321 6549",
    address: "321 Julius Nyerere Way, Harare",
    serviceHistory: [
      { date: "Dec 1, 2023", service: "Fuel Pump Replacement", status: "Completed" },
      { date: "Oct 20, 2023", service: "Timing Belt Replacement", status: "Completed" },
      { date: "Sep 15, 2023", service: "Water Pump Replacement", status: "Completed" },
    ]
  },
  // Add more clients as needed
];

function ClientDetails() {
  const { id } = useParams();

  // Fetch client data based on the id
  const clientData = clients.find(client => client.id === id);

  if (!clientData) {
    return (
      <ServiceProviderLayout>
        <div className="max-w-4xl mx-auto mt-10">
          <Link to="/service" className="text-blue-500 hover:underline mb-4 inline-block dark:text-blue-400">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold mb-6 dark:text-white">Client Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400">The client with ID {id} does not exist.</p>
        </div>
      </ServiceProviderLayout>
    );
  }

  return (
    <ServiceProviderLayout>
      <div className="max-w-4xl mx-auto mt-10">
        <Link to="/service" className="text-blue-500 hover:underline mb-4 inline-block dark:text-blue-400">&larr; Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Client Details</h1>
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {clientData.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Personal details and service history.
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">{clientData.email}</dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone number</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">{clientData.phone}</dd>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 sm:mt-0 sm:col-span-2">{clientData.address}</dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Service History</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                  <ul className="border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                    {clientData.serviceHistory.map((service, index) => (
                      <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate dark:text-gray-300">
                            {service.date} - {service.service}
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            service.status === 'Completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </ServiceProviderLayout>
  );
}

export default ClientDetails;