import React, { useState, useEffect, useMemo } from "react";
import { useTruckContext } from "./truckContext";
import DeleteConfirmModal from "./deleteConfirmModal";
import TruckerLayout from "../../components/layouts/truckerLayout";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../auth/auth';

function Trucks() {
  const {
    trucks,
    loading,
    error,
    addTruck,
    updateTruck,
    deleteTruck,
    fetchTrucks,
  } = useTruckContext();

  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      fetchTrucks();
    }
  }, [accessToken, fetchTrucks]);

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
    }
  }, [accessToken, navigate]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'intransit', label: 'In Transit' }
  ];

  // Form visibility states
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [truckToDelete, setTruckToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [truckType, setTruckType] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverPhoneCountry, setDriverPhoneCountry] = useState("+27");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerPhoneCountry, setOwnerPhoneCountry] = useState("+27");
  const [ownerWhatsapp, setOwnerWhatsapp] = useState("");
  const [ownerWhatsappCountry, setOwnerWhatsappCountry] = useState("+27");
  const [location, setLocation] = useState("");
  const [maximumWeight, setMaximumWeight] = useState(0);

  // Memoized filtered trucks
  const filteredTrucks = useMemo(() => {
    if (!trucks) return [];
    
    console.log('Filtering trucks:', {
      totalTrucks: trucks.length,
      searchTerm,
      filterStatus,
      truckStatuses: trucks.map(t => t.status)
    });

    return trucks.filter(truck => {
      // Search filter
      const matchesSearch = !searchTerm || [
        truck.driverName,
        truck.truckType,
        truck.location
      ].some(field => 
        (field || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Status filter
      const matchesStatus = filterStatus === 'all' || truck.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [trucks, searchTerm, filterStatus]);

  // Memoized assigned and unassigned trucks
  const { assignedTrucks, unassignedTrucks } = useMemo(() => ({
    assignedTrucks: filteredTrucks.filter(truck => 
      ['assigned', 'intransit'].includes(truck.status)
    ),
    unassignedTrucks: filteredTrucks.filter(truck => 
      !truck.status || truck.status === 'available'
    )
  }), [filteredTrucks]);

  // Effect to fetch trucks on mount
  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  // Debug effect
  useEffect(() => {
    console.log('Filtered results:', {
      total: filteredTrucks.length,
      assigned: assignedTrucks.length,
      unassigned: unassignedTrucks.length,
      filterStatus,
      searchTerm
    });
  }, [filteredTrucks, assignedTrucks, unassignedTrucks, filterStatus, searchTerm]);

  const handleDeleteClick = (truck) => {
    setTruckToDelete(truck);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!truckToDelete) return;
    
    setShowDeleteModal(false);
    const result = await deleteTruck(truckToDelete._id);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    
    // Refresh the truck list
    fetchTrucks();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const truckData = {
        truckType,
        driverName,
        driverPhone: `${driverPhoneCountry}${driverPhone}`,
        ownerPhone: `${ownerPhoneCountry}${ownerPhone}`,
        ownerWhatsapp: `${ownerWhatsappCountry}${ownerWhatsapp}`,
        location,
        maximumWeight: Number(maximumWeight),
      };

      if (
        !truckType ||
        !driverName ||
        !driverPhone ||
        !ownerPhone ||
        !ownerWhatsapp ||
        !location ||
        !maximumWeight
      ) {
        setFormError("Please fill in all required fields");
        setFormLoading(false);
        return;
      }

      const result = await addTruck(truckData);

      if (result.success) {
        // Reset form
        setTruckType("");
        setDriverName("");
        setDriverPhone("");
        setOwnerPhone("");
        setOwnerWhatsapp("");
        setLocation("");
        setMaximumWeight(0);
        setShowForm(false);
        toast.success("Truck added successfully!");
      } else {
        setFormError(result.error || "Failed to add truck");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormError("An unexpected error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const renderTruckTable = (trucks, title) => {
    console.log(`Rendering table "${title}" with ${trucks?.length || 0} trucks`);
    
    return (
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {title} ({trucks?.length || 0})
        </h2>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Driver
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Truck Type
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Location
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {trucks.map((truck) => (
                <tr key={truck._id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {truck.driverName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {truck.truckType}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {truck.location}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {truck.currentLoad ? (
                        <div>
                            <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-yellow-100 text-yellow-800">
                                Assigned
                            </span>
                            <div className="mt-1 text-xs text-gray-500">
                                {truck.currentLoad.description}
                                <br />
                                {truck.currentLoad.pickup} → {truck.currentLoad.delivery}
                            </div>
                        </div>
                    ) : (
                        <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-green-100 text-green-800">
                            Available
                        </span>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => handleDeleteClick(truck)}
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
    );
  };

  return (
    <TruckerLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Trucks</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your fleet of trucks and their assignments
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
            >
              Add Truck
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search Trucks
            </label>
            <input
              type="text"
              name="search"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by driver, type, or location"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div>Loading trucks...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          renderTruckTable(filteredTrucks, "All Trucks")
        )}

        {showForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-medium mb-4">Add New Truck</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Truck Type
                  </label>
                  <input
                    type="text"
                    value={truckType}
                    onChange={(e) => setTruckType(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Driver Phone
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <select
                      value={driverPhoneCountry}
                      onChange={(e) => setDriverPhoneCountry(e.target.value)}
                      className="rounded-l-md border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                    >
                      <option value="+27">SA (+27)</option>
                    </select>
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Weight (tons)
                  </label>
                  <input
                    type="number"
                    value={maximumWeight}
                    onChange={(e) => setMaximumWeight(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    {formLoading ? "Adding..." : "Add Truck"}
                  </button>
                </div>
                {formError && (
                  <p className="mt-2 text-sm text-red-600">{formError}</p>
                )}
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Truck"
            message="Are you sure you want to delete this truck? This action cannot be undone."
          />
        )}
      </div>
    </TruckerLayout>
  );
}

export default Trucks;
