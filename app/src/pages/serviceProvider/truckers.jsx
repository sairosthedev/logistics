import React from 'react';
import ClientLayout from '../../components/layouts/clientLayout';

function AvailableTrucks() {
    return (
        <ClientLayout>
            <div className="py-6 dark:bg-gray-900">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Available Trucks</h1>
                    <div className="mt-4 dark:text-gray-300">
                        {/* Add your content for available trucks here */}
                        <p>List of available trucks will be displayed here.</p>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}

export default AvailableTrucks;
