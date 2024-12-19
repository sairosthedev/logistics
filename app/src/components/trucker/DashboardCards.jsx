import React from 'react';
import { Link } from 'react-router-dom';

const DashboardCards = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Link to="myloads" className="flex-1">
        <div className="border rounded-lg bg-gradient-to-r from-teal-400 to-cyan-600 p-4 hover:shadow-lg text-white transition duration-200 transform hover:scale-105">
          <h2 className="text-xl font-bold">Job Management & Requests</h2>
          <p className="mt-1 text-sm">View and manage your loads</p>
        </div>
      </Link>

      <Link to="trucks" className="flex-1">
        <div className="border rounded-lg bg-gradient-to-r from-purple-400 to-indigo-600 p-4 hover:shadow-lg text-white transition duration-200 transform hover:scale-105">
          <h2 className="text-xl font-bold">Trucks</h2>
          <p className="mt-1 text-sm">View available trucks</p>
        </div>
      </Link>

      {/* <Link to="services" className="flex-1">
        <div className="border rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 p-4 hover:shadow-lg text-white transition duration-200 transform hover:scale-105">
          <h2 className="text-xl font-bold">Services</h2>
          <p className="mt-1 text-sm">Track your services</p>
        </div>
      </Link> */}
    </div>
  );
};

export default DashboardCards; 