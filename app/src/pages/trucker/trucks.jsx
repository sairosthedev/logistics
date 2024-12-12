import React, { useState, useEffect } from 'react';
import TruckerLayout from '../../components/layouts/truckerLayout';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import { ClipLoader } from 'react-spinners';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                <p className="mb-6">Are you sure you want to delete this truck?</p>
                <div className="flex justify-end gap-4">
                    <button
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

function Trucks() {
    const { accessToken, clientID } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAvailability, setFilterAvailability] = useState('all');
    const [currentTruck, setCurrentTruck] = useState(null);
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTrucker, setCurrentTrucker] = useState(null);
    const truckerID = clientID;
    const [truckType, setTruckType] = useState('');
    const [horse, setHorse] = useState('');
    const [trailer1, setTrailer1] = useState('');
    const [trailer2, setTrailer2] = useState('');
    const [driverName, setDriverName] = useState('');
    const [licence, setLicence] = useState('');
    const [passport, setPassport] = useState('');
    const [driverPhone, setDriverPhone] = useState('');
    const [truckOwnerPhone, setTruckOwnerPhone] = useState('');
    const [truckOwnerWhatsapp, setTruckOwnerWhatsapp] = useState('');
    const [location, setLocation] = useState('');
    const [maximumWeight, setMaximumWeight] = useState(0);

    useEffect(() => {
        fetchTrucks();
    }, [accessToken, clientID]);

    const fetchTrucks = async () => {
        try {
            const response = await axios.get(`${BACKEND_Local}/api/trucker/trucks/${truckerID}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            console.log("Helllllllo", response.data)
            setTrucks(response.data);
        } catch (error) {
            console.error('Error fetching truckers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (truck) => {
        try {
            await axios.delete(`${BACKEND_Local}/api/trucker/delete/${truck._id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            fetchTrucks(); // Refresh the trucks list
        } catch (error) {
            console.error('Error deleting truck:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormMessage('');

        try {
            const url = isEditing
                ? `${BACKEND_Local}/api/trucker/update/${currentTruck._id}`
                : `${BACKEND_Local}/api/trucker/add`;
            const response = isEditing
                ? await axios.put(url, { truckerID, truckType, horse, trailer1, trailer2, driverName, licence, passport, driverPhone, truckOwnerPhone, truckOwnerWhatsapp, location, maximumWeight },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }   
                )
                : await axios.post(url, { truckerID, truckType, horse, trailer1, trailer2, driverName, licence, passport, driverPhone, truckOwnerPhone, truckOwnerWhatsapp, location, maximumWeight },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });

            setFormMessage(isEditing ? 'Truck updated successfully!' : 'Truck added successfully!');
            setTruckType('');
            setHorse('');
            setTrailer1('');
            setTrailer2('');
            setDriverName('');
            setLicence('');
            setPassport('');
            setDriverPhone('');
            setTruckOwnerPhone('');
            setTruckOwnerWhatsapp('');
            setLocation('');
            setMaximumWeight('');
            fetchTrucks();
            setShowForm(false);
            setIsEditing(false);
            setCurrentTruck(null);
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 409) {
                setFormMessage('Error: This truck or driver information already exists. Please check your entries and try again.');
            } else {
                setFormMessage(isEditing ? 'Error updating truck. Please try again later.' : 'Error adding truck. Please try again later.');
            }

        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (truck) => {
        setCurrentTruck(truck);
        setTruckType(truck.truckType);
        setHorse(truck.horse);
        setTrailer1(truck.trailer1);
        setTrailer2(truck.trailer2);
        setDriverName(truck.driverName);
        setLicence(truck.licence);
        setPassport(truck.passport);
        setDriverPhone(truck.driverPhone);
        setTruckOwnerPhone(truck.truckOwnerPhone);
        setTruckOwnerWhatsapp(truck.truckOwnerWhatsapp);
        setLocation(truck.location);
        setMaximumWeight(truck.maximumWeight);
        setIsEditing(true);
        setShowForm(true);
    };

    const filteredTrucks = trucks.filter(truck => {
        const matchesSearch = searchTerm === '' || (
            (truck.driverName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (truck.truckType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (truck.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );

        const matchesAvailability =
            filterAvailability === 'all' ||
            (truck.status?.toLowerCase() || '') === filterAvailability.toLowerCase();

        return matchesSearch && matchesAvailability;
    });

    return (
        <TruckerLayout>
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Manage Trucks</h1>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                            <option value="standby">Standby</option>
                        </select>
                        <button
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? 'Hide Form' : 'Add Truck'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Truck Type</label>
                                    <select
                                        name="truckType"
                                        value={truckType}
                                        onChange={(e) => setTruckType(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Truck Type</option>
                                        <option value="Flatbed">Flatbed</option>
                                        <option value="Box Truck">Box Truck</option>
                                        <option value="Refrigerated">Refrigerated</option>
                                        <option value="Tanker">Tanker</option>
                                        <option value="Dump Truck">Dump Truck</option>
                                        <option value="Tow Truck">Tow Truck</option>
                                        <option value="Furniture Truck">Furniture Truck</option>
                                        <option value="Small Ton Truck">Small Ton Truck</option>
                                        <option value="10T Curtain Truck">10T Curtain Truck</option>
                                        <option value="30T Drop Side">30T Drop Side</option>
                                        <option value="30T Flatbed">30T Flatbed</option>
                                        <option value="34T Link Bulk">34T Link Bulk</option>
                                        <option value="34T Link Flatbed">34T Link Flatbed</option>
                                        <option value="34T Side Tipper">34T Side Tipper</option>
                                        <option value="30T Howo Tipper">30T Howo Tipper</option>
                                        <option value="20T Tipper">20T Tipper</option>
                                        <option value="Lowbed">Lowbed</option>
                                        <option value="Semi Truck">Semi Truck</option>
                                        <option value="Can Carrier">Can Carrier</option>
                                        <option value="Crane">Crane</option>
                                        <option value="Livestock">Livestock</option>
                                        <option value="Logging">Logging</option>
                                        <option value="Abnormal">Abnormal</option>
                                        <option value="Tautliner">Tautliner</option>
                                        <option value="Water Bowser">Water Bowser</option>
                                        <option value="Fuel Tanker">Fuel Tanker</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Horse Reg</label>
                                    <input
                                        type="text"
                                        name="horse"
                                        value={horse}
                                        onChange={(e) => setHorse(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trailer 1 Reg</label>
                                    <input
                                        type="text"
                                        name="trailer1"
                                        value={trailer1}
                                        onChange={(e) => setTrailer1(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trailer 2 Reg</label>
                                    <input
                                        type="text"
                                        name="trailer2"
                                        value={trailer2}
                                        onChange={(e) => setTrailer2(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Driver Name</label>
                                    <input
                                        type="text"
                                        name="driverName"
                                        value={driverName}
                                        onChange={(e) => setDriverName(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Driver Licence</label>
                                    <input
                                        type="text"
                                        name="licence"
                                        value={licence}
                                        onChange={(e) => setLicence(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Driver Passport</label>
                                    <input
                                        type="text"
                                        name="passport"
                                        value={passport}
                                        onChange={(e) => setPassport(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Driver Phone</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            +263
                                        </span>
                                        <input
                                            type="tel"
                                            name="driverPhone"
                                            value={driverPhone}
                                            onChange={(e) => setDriverPhone(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Truck Owner Phone</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            +263
                                        </span>
                                        <input
                                            type="tel"
                                            name="truckOwnerPhone"
                                            value={truckOwnerPhone}
                                            onChange={(e) => setTruckOwnerPhone(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Truck Owner WhatsApp</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            +263
                                        </span>
                                        <input
                                            type="tel"
                                            name="truckOwnerWhatsapp"
                                            value={truckOwnerWhatsapp}
                                            onChange={(e) => setTruckOwnerWhatsapp(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Maximum Weight (tons)</label>
                                    <input
                                        type="number"
                                        name="maximumWeight"
                                        value={maximumWeight}
                                        onChange={(e) => setMaximumWeight(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-white rounded-lg ${formLoading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'} transition duration-200`}
                                    disabled={formLoading}
                                >
                                    {formLoading ? <ClipLoader size={20} color="#ffffff" /> : isEditing ? 'Update Truck' : 'Add Truck'}
                                </button>
                                {formMessage && (
                                    <p className={`mt-2 text-sm ${formMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                                        {formMessage}
                                    </p>
                                )}
                            </div>
                        </form>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center">
                            <ClipLoader size={50} color="#3b82f6" />
                        </div>
                    ) : (
                        <div className="mt-8 flex flex-col">
                            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                        Driver Name
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Truck Type
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Location
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Status
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Contact
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Max Weight
                                                    </th>
                                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {filteredTrucks.map((truck) => (
                                                    <tr key={truck._id}>
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                            {truck.driverName}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {truck.truckType}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {truck.location}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                                truck.status === 'active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {truck.status}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {truck.driverPhone}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {truck.maximumWeight} tons
                                                        </td>
                                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                            <button
                                                                onClick={() => handleEdit(truck)}
                                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(truck)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TruckerLayout>
    );
}

export default Trucks;
