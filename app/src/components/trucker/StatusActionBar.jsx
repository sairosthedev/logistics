import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { BACKEND_Local } from "../../../url";
import useAuthStore from "../../pages/auth/auth";

const STATUS_CONFIG = {
  bid: {
    label: "Bid",
    color: "bg-purple-100 text-purple-800",
    nextStatus: null,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    nextStatus: "accepted",
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-100 text-green-800",
    nextStatus: "loaded",
  },
  loaded: {
    label: "Loaded",
    color: "bg-blue-100 text-blue-800",
    nextStatus: "in transit",
  },
  "in transit": {
    label: "In Transit",
    color: "bg-orange-100 text-orange-800",
    nextStatus: "delivered",
  },
  delivered: {
    label: "Delivered",
    color: "bg-gray-100 text-gray-800",
    nextStatus: null,
  },
};

const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

const StatusActionBar = ({ load, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(load?.status);
  const { accessToken } = useAuthStore();

  // Fetch the most recent status from the backend on mount
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!load || !accessToken) return;

      try {
        const response = await axios.get(
          `${BACKEND_Local}/api/trucker/truck-requests/${load.requestID}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Update the status with the most recent status from the backend
        if (response.data && response.data.status) {
          setCurrentStatus(response.data.status);
        }
      } catch (error) {
        console.error("Error fetching current status:", error);
      }
    };

    fetchCurrentStatus();
  }, [load, accessToken]);

  // Early return if load is not present or status is 'bid'
  if (!load || load.status === "bid") return null;

  const handleStatusUpdate = useCallback(
    async (newStatus) => {
      if (!load || !accessToken) return;

      try {
        setIsUpdating(true);

        const response = await axios.put(
          `${BACKEND_Local}/api/trucker/truck-requests/bid/status/${load.requestID}`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Check if the update was successful
        if (response.status === 200 || response.status === 204) {
          // Update local state with the new status
          setCurrentStatus(newStatus);

          // Prefer prop method if provided, otherwise use state update
          if (onStatusUpdate) {
            onStatusUpdate(newStatus);
          }

          // Optional: Instead of full page reload, update local state
          if (load) {
            load.status = newStatus;
          }

          // Update truck status based on load status
          if (load.truckID) {
            let truckStatus = "standby";
            if (newStatus === "loaded" || newStatus === "in transit") {
              truckStatus = "loaded";
            } else if (newStatus === "delivered") {
              truckStatus = "standby";
            }

            await axios.put(
              `${BACKEND_Local}/api/trucker/trucks/${load.truckID}`,
              { status: truckStatus },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
          }
        } else {
          throw new Error("Status update failed");
        }
        const response1 = await axios.put(
          `${BACKEND_Local}/api/trucker/truck-requests/status/${load.requestID}`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response1.status === 200) {
          console.log("Truck request status updated to ", newStatus);
        } else {
          throw new Error("Status update failed on bids");
        }
      } catch (error) {
        console.error("Error updating status:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [load, accessToken, onStatusUpdate]
  );

  const nextStatus = STATUS_CONFIG[currentStatus]?.nextStatus;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Current Status:</h3>
          <span
            className={classNames(
              "px-3 py-1 rounded-full text-sm font-semibold",
              STATUS_CONFIG[currentStatus]?.color || "bg-gray-100 text-gray-800"
            )}
          >
            {STATUS_CONFIG[currentStatus]?.label || "Unknown Status"}
          </span>
        </div>

        {/* Only show update button if status is not 'pending' and nextStatus exists */}
        {currentStatus !== "pending" && nextStatus && (
          <button
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={isUpdating}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 disabled:bg-gray-400"
          >
            {isUpdating
              ? "Updating..."
              : `Update to ${STATUS_CONFIG[nextStatus].label}`}
          </button>
        )}
      </div>

      
      <div className="relative">
        <div className="absolute left-0 right-0 top-4 h-1 bg-gray-200">
          <div
            className="absolute left-0 h-full bg-green-500 transition-all duration-500"
            style={{
              width: `${
                (Object.keys(STATUS_CONFIG).indexOf(currentStatus) * 100) /
                (Object.keys(STATUS_CONFIG).length - 1)
              }%`,
            }}
          />
        </div>

        <div className="relative flex justify-between">
          {Object.entries(STATUS_CONFIG).map(([status, config], index) => {
            const isCompleted =
              Object.keys(STATUS_CONFIG).indexOf(currentStatus) >= index;
            const isCurrent = currentStatus === status;

            return (
              <div key={status} className="flex flex-col items-center z-10">
                <div
                  className={classNames(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2",
                    isCurrent
                      ? "bg-green-500 border-green-500 text-white"
                      : isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-gray-300"
                  )}
                >
                  <span className="text-xs">{index + 1}</span>
                </div>
                <div className="mt-2 text-center">
                  <span
                    className={classNames(
                      "text-sm font-medium",
                      isCurrent ? "text-green-600" : "text-gray-600"
                    )}
                  >
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusActionBar;
