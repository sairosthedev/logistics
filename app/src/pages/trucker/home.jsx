import React, { useState, useEffect } from "react";
import TruckerLayout from "../../components/layouts/truckerLayout";
import axios from "axios";
import { BACKEND_Local } from "../../../url.js";
import useAuthStore from "../auth/auth";
import Modal from "react-modal";
import { modalStyles } from "./modalStyles";

// Import separated component(s)
import DashboardCards from "../../components/trucker/DashboardCards";
import SearchAndFilter from "../../components/trucker/SearchAndFilter";
import LoadDetailsModal from "../../components/trucker/LoadDetailsModal";
import LoadTable from "../../components/trucker/LoadTable";
import AcceptedBidsTable from "../../components/trucker/AcceptedBidsTable";

Modal.setAppElement("#root");

function Home() {
  const { accessToken, clientID } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loads, setLoads] = useState([]);
  const [acceptedBids, setAcceptedBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadsPerPage] = useState(10);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [negotiationPrice, setNegotiationPrice] = useState("");
  const [trucks, setTrucks] = useState([]);
  const [selectedTrucks, setSelectedTrucks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [deliveredTrucks, setDeliveredTrucks] = useState([]);
  const [currentBidPage, setCurrentBidPage] = useState(1);
  const [bidsPerPage] = useState(10);

  // Fetch functions
  const fetchLoads = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_Local}/api/trucker/truck-requests`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setLoads(
        response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (error) {
      console.error("Error fetching loads:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedBids = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_Local}/api/trucker/request-bids/trucker/${clientID}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const deliveredTruckIds = response.data
        .filter((bid) => bid.status === "delivered")
        .map((bid) => bid.truckID);

      setDeliveredTrucks(deliveredTruckIds);

      const nonDeliveredBids = response.data.filter(
        (bid) => bid.status !== "delivered"
      );
      setAcceptedBids(
        nonDeliveredBids.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (error) {
      console.error("Error fetching accepted bids:", error);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_Local}/api/trucker/trucks/${clientID}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setTrucks(response.data);
    } catch (error) {
      console.error("Error fetching trucks:", error);
    }
  };

  useEffect(() => {
    fetchLoads();
    fetchAcceptedBids();
    fetchTrucks();
  }, [accessToken, clientID]);

  // Modal handlers
  const openJobModal = (load) => {
    console.log("load", load);
    setSelectedLoad(load);
    setIsJobModalOpen(true);
    setSelectedTrucks([]);
  };

  const closeJobModal = () => {
    setSelectedLoad(null);
    setResponseMessage("");
    setSelectedTrucks([]);
    setIsJobModalOpen(false);
  };

  // Form handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validTrucks = selectedTrucks.filter(Boolean);

    if (validTrucks.length === 0) {
      setResponseMessage("Please assign at least one truck.");
      setIsSubmitting(false);
      return;
    }

    if (validTrucks.length > selectedLoad.numberOfTrucks) {
      setResponseMessage(
        `You can only assign up to ${selectedLoad.numberOfTrucks} trucks for this load.`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // Update load status
      await axios.put(
        `${BACKEND_Local}/api/trucker/truck-requests/status/${selectedLoad._id}`,
        { status: "accepted" },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Process truck assignments
      for (const truckId of validTrucks) {
        const selectedTruckDetails = trucks.find(
          (truck) => truck._id === truckId
        );

        const payload = {
          requestID: selectedLoad._id,
          clientID: selectedLoad.clientID,
          numberOfTrucks: selectedLoad.numberOfTrucks,
          truckerID: clientID,
          pickupLocation: selectedLoad.pickupLocation,
          dropoffLocation: selectedLoad.dropoffLocation,
          pickupCoordinates: selectedLoad.pickupCoordinates,
          dropoffCoordinates: selectedLoad.dropoffCoordinates,
          distance: selectedLoad.distance,
          route: selectedLoad.route,
          goodsType: selectedLoad.goodsType,
          payTerms: selectedLoad.payTerms,
          negotiationPrice: parseFloat(negotiationPrice),
          weight: selectedLoad.weight,
          truckID: selectedTruckDetails._id,
          truckInfo: {
            ...selectedTruckDetails,
            status: "accepted",
          },
        };

        await axios.post(
          `${BACKEND_Local}/api/trucker/truck-requests/bid`,
          payload,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      }

      setShowSuccessPopup(true);
      setLoads((prevLoads) =>
        prevLoads.filter((load) => load._id !== selectedLoad._id)
      );

      await Promise.all([fetchLoads(), fetchAcceptedBids()]);

      setTimeout(() => {
        closeJobModal();
        setShowSuccessPopup(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting truck assignments:", error);
      setResponseMessage("Failed to assign trucks. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRequestStatus = async (requestID, status) => {
    try {
      const response = await axios.put(
        `${BACKEND_Local}/api/trucker/truck-requests/status/${requestID}`,
        { status, truckerID: clientID },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setSelectedLoad((prev) => ({
          ...prev,
          status: status,
        }));

        setLoads((prevLoads) =>
          prevLoads.map((load) =>
            load._id === requestID ? { ...load, status: status } : load
          )
        );

        if (status === "delivered") {
          setAcceptedBids((prev) =>
            prev.filter((bid) => bid._id !== requestID)
          );
        } else {
          setAcceptedBids((prev) =>
            prev.map((bid) =>
              bid._id === requestID ? { ...bid, status: status } : bid
            )
          );
        }

        setResponseMessage("Status updated successfully!");
        setTimeout(() => {
          setResponseMessage("");
        }, 2000);

        await fetchLoads();
        await fetchAcceptedBids();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setResponseMessage("Failed to update status. Please try again.");
    }
  };

  // Render truck dropdowns
  const renderTruckDropdowns = () => {
    const availableSlots = Array.from({ length: selectedLoad.numberOfTrucks });

    return availableSlots.map((_, index) => (
      <div key={index} className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
          Truck {index + 1}:
        </label>
        <select
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={selectedTrucks[index] || ""}
          onChange={(e) => handleTruckDropdownChange(index, e.target.value)}
        >
          <option value="">Select a truck</option>
          {trucks
            .filter((truck) => !deliveredTrucks.includes(truck._id))
            .map((truck) => (
              <option
                key={truck._id}
                value={truck._id}
                disabled={
                  selectedTrucks.includes(truck._id) &&
                  selectedTrucks[index] !== truck._id
                }
              >
                {truck.truckType} - {truck.driverName}
                {truck.status === "in transit" ? " (In Transit)" : ""}
              </option>
            ))}
        </select>
      </div>
    ));
  };

  const handleTruckDropdownChange = (index, truckId) => {
    setSelectedTrucks((prev) => {
      const newSelection = [...prev];
      if (truckId === "") {
        newSelection.splice(index, 1);
        return newSelection;
      }
      newSelection[index] = truckId;
      return newSelection;
    });
  };

  // Filter and paginate loads
  const filteredLoads = loads.filter((load) => {
    const matchesSearch =
      load.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.goodsType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || load.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastLoad = currentPage * loadsPerPage;
  const indexOfFirstLoad = indexOfLastLoad - loadsPerPage;
  const currentLoads = filteredLoads.slice(indexOfFirstLoad, indexOfLastLoad);

  // Calculate current bids
  const indexOfLastBid = currentBidPage * bidsPerPage;
  const indexOfFirstBid = indexOfLastBid - bidsPerPage;
  const currentBids = acceptedBids.slice(indexOfFirstBid, indexOfLastBid);

  return (
    <TruckerLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8 font-sans">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Trucker Dashboard
        </h1>

        <DashboardCards />

        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        <div className="flex flex-col gap-8">
          {/* Pending Requests Section */}
          <div className="pending-requests">
            <div className="max-w-screen-xl mx-auto">
              <div className="items-center justify-between md:flex mb-6">
                <div className="max-w-lg">
                  <h3 className="text-gray-800 dark:text-white text-2xl font-bold">
                    Pending Requests
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    View and manage your pending load requests
                  </p>
                </div>
              </div>
              <LoadTable
                currentLoads={currentLoads}
                openJobModal={openJobModal}
              />
            </div>
          </div>

          {/* Horizontal line separator */}
          <hr className="my-8 border-gray-300 dark:border-gray-700" />

          {/* Accepted Bids Section */}
          <div className="accepted-bids">
            <div className="max-w-screen-xl mx-auto">
              <div className="items-center justify-between md:flex mb-6">
                <div className="max-w-lg">
                  <h3 className="text-gray-800 dark:text-white text-2xl font-bold">
                    Accepted Bids
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    View and manage your accepted bids
                  </p>
                </div>
              </div>
              <AcceptedBidsTable
                currentBids={currentBids}
                openJobModal={openJobModal}
              />
            </div>
          </div>
        </div>

        <LoadDetailsModal
          isOpen={isJobModalOpen}
          onClose={closeJobModal}
          selectedLoad={selectedLoad}
          modalStyles={modalStyles}
          acceptedBids={acceptedBids}
          updateRequestStatus={updateRequestStatus}
          handleSubmit={handleSubmit}
          renderTruckDropdowns={renderTruckDropdowns}
          isSubmitting={isSubmitting}
          selectedTrucks={selectedTrucks}
          responseMessage={responseMessage}
          showSuccessPopup={showSuccessPopup}
          negotiationPrice={negotiationPrice}
          setNegotiationPrice={setNegotiationPrice}
        />
      </div>
    </TruckerLayout>
  );
}

export default Home;
