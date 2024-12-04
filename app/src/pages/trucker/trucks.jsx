import React, { useState, useEffect } from "react";
import { Truck } from "lucide-react";
import TruckerLayout from "../../components/layouts/truckerLayout";
import { useTruckContext } from "./truckContext";
import DeleteConfirmModal from "./deleteConfirmModal";

function Trucks() {
  const {
    trucks,
    loading,
    error,
    fetchTrucks,
    addTruck,
    updateTruck,
    deleteTruck,
  } = useTruckContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [truckToDelete, setTruckToDelete] = useState(null);
  const [currentTruck, setCurrentTruck] = useState(null);

  // Form state
  const [truckType, setTruckType] = useState("");
  const [horse, setHorse] = useState("");
  const [trailer1, setTrailer1] = useState("");
  const [trailer2, setTrailer2] = useState("");
  const [driverName, setDriverName] = useState("");
  const [licence, setLicence] = useState("");
  const [passport, setPassport] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverPhoneCode, setDriverPhoneCode] = useState("+263");
  const [truckOwnerPhone, setTruckOwnerPhone] = useState("");
  const [ownerPhoneCode, setOwnerPhoneCode] = useState("+263");
  const [truckOwnerWhatsapp, setTruckOwnerWhatsapp] = useState("");
  const [ownerWhatsappCode, setOwnerWhatsappCode] = useState("+263");
  const [location, setLocation] = useState("");
  const [maximumWeight, setMaximumWeight] = useState(0);

  const countryOptions = [
    { value: "+27", label: "SA (+27)" },
    { value: "+260", label: "ZM (+260)" },
    { value: "+263", label: "ZW (+263)" },
    { value: "+267", label: "BW (+267)" },
    { value: "+264", label: "NA (+264)" },
    { value: "+266", label: "LS (+266)" },
    { value: "+258", label: "MZ (+258)" },
    { value: "+244", label: "AO (+244)" },
    { value: "+243", label: "DRC (+243)" },
    { value: "+255", label: "TZ (+255)" },
    { value: "+256", label: "UG (+256)" },
    { value: "+254", label: "KE (+254)" },
    { value: "+250", label: "RW (+250)" },
    { value: "+257", label: "BI (+257)" },
    { value: "+265", label: "MW (+265)" },
  ].sort((a, b) => a.label.localeCompare(b.label));

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  const handleEdit = (truck) => {
    setCurrentTruck(truck);
    setTruckType(truck.truckType);
    setHorse(truck.horse);
    setTrailer1(truck.trailer1);
    setTrailer2(truck.trailer2);
    setDriverName(truck.driverName);
    setLicence(truck.licence);
    setPassport(truck.passport);
    setDriverPhone(truck.driverPhone.replace("+263", ""));
    setDriverPhoneCode("+263");
    setTruckOwnerPhone(truck.truckOwnerPhone.replace("+263", ""));
    setOwnerPhoneCode("+263");
    setTruckOwnerWhatsapp(truck.truckOwnerWhatsapp.replace("+263", ""));
    setOwnerWhatsappCode("+263");
    setLocation(truck.location);
    setMaximumWeight(truck.maximumWeight);
    setIsEditing(true);
    setShowForm(true);
  };

  const confirmDelete = (truck) => {
    setTruckToDelete(truck);
    setShowDeleteModal(true);
  };

  const handleDelete = async (truck) => {
    setTruckToDelete(null);
    setShowDeleteModal(false);
    const result = await deleteTruck(truck._id);
    if (!result.success) {
      setFormMessage(result.error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "text-green-600";
      case "assigned":
        return "text-yellow-600";
      case "in-transit":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredTrucks = trucks.filter((truck) => {
    const matchesSearch =
      searchTerm === "" ||
      (truck.driverName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (truck.truckType?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (truck.location?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesAvailability =
      filterAvailability === "all" ||
      (truck.status?.toLowerCase() || "") === filterAvailability.toLowerCase();

    return matchesSearch && matchesAvailability;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage("");

    try {
      const truckData = {
        truckType,
        horse,
        trailer1,
        trailer2,
        driverName,
        licence,
        passport,
        driverPhone: driverPhoneCode + driverPhone.replace(/\D/g, ""),
        truckOwnerPhone: ownerPhoneCode + truckOwnerPhone.replace(/\D/g, ""),
        truckOwnerWhatsapp:
          ownerWhatsappCode + truckOwnerWhatsapp.replace(/\D/g, ""),
        location,
        maximumWeight: Number(maximumWeight),
        status: "available",
      };

      // Basic validation
      if (
        !truckType ||
        !horse ||
        !driverName ||
        !driverPhone ||
        !location ||
        !maximumWeight
      ) {
        setFormMessage("Please fill in all required fields");
        setFormLoading(false);
        return;
      }

      const result =
        isEditing && currentTruck
          ? await updateTruck(currentTruck._id, truckData)
          : await addTruck(truckData);

      if (result.success) {
        // Reset form
        setTruckType("");
        setHorse("");
        setTrailer1("");
        setTrailer2("");
        setDriverName("");
        setLicence("");
        setPassport("");
        setDriverPhone("");
        setTruckOwnerPhone("");
        setTruckOwnerWhatsapp("");
        setLocation("");
        setMaximumWeight(0);
        setDriverPhoneCode("+263");
        setOwnerPhoneCode("+263");
        setOwnerWhatsappCode("+263");
        setIsEditing(false);
        setCurrentTruck(null);
        setShowForm(false);
        setFormMessage("Truck saved successfully!");
      } else {
        setFormMessage(result.error || "Failed to save truck");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormMessage("An unexpected error occurred. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <TruckerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </TruckerLayout>
    );
  }

  return (
    <TruckerLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Trucks</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your fleet and track assignments
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
            >
              Add Truck
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search trucks..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="in-transit">In Transit</option>
            </select>
          </div>

          <div className="mt-2 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Driver & Contact
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Truck Details
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Location
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Max Weight
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredTrucks.map((truck) => (
                        <tr key={truck._id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="font-medium text-gray-900">
                              {truck.driverName}
                            </div>
                            <div className="text-gray-500">
                              {truck.driverPhone}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="font-medium text-gray-900">
                              {truck.truckType}
                            </div>
                            <div>
                              {truck.horse} {truck.trailer1} {truck.trailer2}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {truck.location}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                                truck.status
                              )}`}
                            >
                              {truck.status || "Available"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {truck.maximumWeight} tons
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleEdit(truck)}
                              disabled={truck.status === "in-transit"}
                              className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(truck)}
                              disabled={truck.status !== "available"}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Truck Type
              </label>
              <select
                name="truckType"
                value={truckType}
                onChange={(e) => setTruckType(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Horse Reg
              </label>
              <input
                type="text"
                name="horse"
                value={horse}
                onChange={(e) => setHorse(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trailer 1 Reg
              </label>
              <input
                type="text"
                name="trailer1"
                value={trailer1}
                onChange={(e) => setTrailer1(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trailer 2 Reg
              </label>
              <input
                type="text"
                name="trailer2"
                value={trailer2}
                onChange={(e) => setTrailer2(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Driver Name
              </label>
              <input
                type="text"
                name="driverName"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Driver Licence
              </label>
              <input
                type="text"
                name="licence"
                value={licence}
                onChange={(e) => setLicence(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Driver Passport
              </label>
              <input
                type="text"
                name="passport"
                value={passport}
                onChange={(e) => setPassport(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Driver Phone
              </label>
              <div className="flex">
                <select
                  value={driverPhoneCode}
                  onChange={(e) => setDriverPhoneCode(e.target.value)}
                  className="w-32 rounded-l border border-gray-300 p-2"
                >
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={driverPhone}
                  onChange={(e) =>
                    setDriverPhone(e.target.value.replace(/\D/g, ""))
                  }
                  className="flex-1 rounded-r border border-gray-300 p-2"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Truck Owner Phone
              </label>
              <div className="flex">
                <select
                  value={ownerPhoneCode}
                  onChange={(e) => setOwnerPhoneCode(e.target.value)}
                  className="w-32 rounded-l border border-gray-300 p-2"
                >
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={truckOwnerPhone}
                  onChange={(e) =>
                    setTruckOwnerPhone(e.target.value.replace(/\D/g, ""))
                  }
                  className="flex-1 rounded-r border border-gray-300 p-2"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Truck Owner WhatsApp
              </label>
              <div className="flex">
                <select
                  value={ownerWhatsappCode}
                  onChange={(e) => setOwnerWhatsappCode(e.target.value)}
                  className="w-32 rounded-l border border-gray-300 p-2"
                >
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={truckOwnerWhatsapp}
                  onChange={(e) =>
                    setTruckOwnerWhatsapp(e.target.value.replace(/\D/g, ""))
                  }
                  className="flex-1 rounded-r border border-gray-300 p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Maximum Weight (tons)
              </label>
              <input
                type="number"
                name="maximumWeight"
                value={maximumWeight}
                onChange={(e) => setMaximumWeight(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg ${
                formLoading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
              } transition duration-200`}
              disabled={formLoading}
            >
              {formLoading ? (
                <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full text-white"></div>
              ) : isEditing ? (
                "Update Truck"
              ) : (
                "Add Truck"
              )}
            </button>
            {formMessage && (
              <p
                className={`mt-2 text-sm ${
                  formMessage.startsWith("Error")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {formMessage}
              </p>
            )}
          </div>
        </form>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleDelete(truckToDelete)}
      />
    </TruckerLayout>
  );
}

export default Trucks;
