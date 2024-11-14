import React from 'react'
import AppLayout from '../../components/layouts/appLayout'

function Services() {
  const serviceProviders = [
    {
      name: "Fast Logistics",
      service: "Truck Maintenance",
      location: "Harare",
      contact: "fast.logistics@example.com"
    },
    {
      name: "Quick Transport",
      service: "Load Handling",
      location: "Bulawayo",
      contact: "quick.transport@example.com"
    },
    {
      name: "Reliable Movers",
      service: "Truck Repair",
      location: "Gweru",
      contact: "reliable.movers@example.com"
    },
    {
      name: "Secure Storage",
      service: "Load Storage",
      location: "Mutare",
      contact: "secure.storage@example.com"
    },
    {
      name: "Efficient Couriers",
      service: "Load Delivery",
      location: "Masvingo",
      contact: "efficient.couriers@example.com"
    },
    {
      name: "Global Freight",
      service: "International Load Transport",
      location: "Chitungwiza",
      contact: "global.freight@example.com"
    },
    {
      name: "Local Haulers",
      service: "Local Truck Hauling",
      location: "Kwekwe",
      contact: "local.haulers@example.com"
    },
    {
      name: "Prime Logistics",
      service: "Logistics Management for Trucks",
      location: "Kadoma",
      contact: "prime.logistics@example.com"
    },
    {
      name: "Speedy Delivery",
      service: "Same Day Load Delivery",
      location: "Zvishavane",
      contact: "speedy.delivery@example.com"
    },
    {
      name: "Trusted Carriers",
      service: "Vehicle and Load Transport",
      location: "Victoria Falls",
      contact: "trusted.carriers@example.com"
    },
    {
      name: "Fuel Express",
      service: "Fuel Supply",
      location: "Harare",
      contact: "fuel.express@example.com"
    },
    {
      name: "Tire World",
      service: "Tire Services",
      location: "Bulawayo",
      contact: "tire.world@example.com"
    },
    {
      name: "Truck Stop Central",
      service: "Truck Stops",
      location: "Gweru",
      contact: "truck.stop.central@example.com"
    },
    {
      name: "ClearFast",
      service: "Customs Clearing",
      location: "Mutare",
      contact: "clearfast@example.com"
    }
  ];

  return (
    <AppLayout>
      <h1 className="mt-10 text-gray-800 text-3xl font-extrabold sm:text-4xl">
        Service Providers
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white mt-10">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Service</th>
              <th className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Location</th>
              <th className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
              <th className="py-2 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {serviceProviders.map((provider, index) => (
              <tr key={index} className="hover:bg-gray-100 transition duration-200">
                <td className="py-2 px-4 border-b border-gray-200">{provider.name}</td>
                <td className="py-2 px-4 border-b border-gray-200">{provider.service}</td>
                <td className="py-2 px-4 border-b border-gray-200">{provider.location}</td>
                <td className="py-2 px-4 border-b border-gray-200">{provider.contact}</td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 shadow-md transform hover:scale-105">
                      View Profile
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  )
}

export default Services
