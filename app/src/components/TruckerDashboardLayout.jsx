import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function TruckerDashboardLayout({ children }) {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Trucker Dashboard</h2>
                </div>
                <nav className="mt-4">
                    <Link to="/trucker" className={`block py-2 px-4 text-gray-700 ${location.pathname === '/trucker' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>Dashboard</Link>
                    <Link to="/trucker/trucks" className={`block py-2 px-4 text-gray-700 ${location.pathname === '/trucker/trucks' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>My Trucks</Link>
                    <Link to="/trucker/jobs" className={`block py-2 px-4 text-gray-700 ${location.pathname === '/trucker/jobs' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>Jobs</Link>
                    <Link to="/trucker/profile" className={`block py-2 px-4 text-gray-700 ${location.pathname === '/trucker/profile' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>Profile</Link>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

export default TruckerDashboardLayout;