import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import ServiceProviderLayout from '../../components/layouts/serviceProviderLayout';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// UI Components
const Table = ({ children }) => (
  <div className="relative w-full overflow-auto">
    <table className="min-w-full border-collapse text-sm">{children}</table>
  </div>
);

const TableHeader = ({ children }) => <thead className="bg-gray-100">{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children }) => <tr className="border-b transition-colors hover:bg-gray-50/50">{children}</tr>;
const TableHead = ({ children }) => <th className="h-12 px-2 sm:px-4 text-left align-middle font-medium text-gray-500">{children}</th>;
const TableCell = ({ children }) => <td className="p-2 sm:p-4 align-middle text-gray-700">{children}</td>;

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Button = ({ children, onClick, variant = 'default', className = '', disabled = false }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100 shadow-sm",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }) => <div className="p-6">{children}</div>;
const DialogHeader = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">{children}</div>;
const DialogTitle = ({ children }) => <h3 className="font-semibold text-lg">{children}</h3>;
const DialogDescription = ({ children }) => <p className="text-sm text-gray-500">{children}</p>;
const DialogFooter = ({ children }) => <div className="flex justify-end space-x-2 mt-6">{children}</div>;

const Input = ({ label, id, type = "text", className = "", ...props }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={id}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  </div>
);

const Textarea = ({ label, id, className = "", ...props }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      id={id}
      className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  </div>
);

// Common search bar styles
const searchBarClasses = `
  w-full 
  pl-10 
  pr-4 
  py-2 
  border 
  rounded-lg 
  focus:outline-none 
  focus:ring-2 
  focus:ring-blue-500 
  dark:bg-gray-800 
  dark:border-gray-700 
  dark:text-gray-300 
  dark:placeholder-gray-500
  transition-colors 
  duration-200
`;

// Common select/filter styles
const selectClasses = `
  border 
  rounded-lg 
  px-4 
  py-2 
  focus:outline-none 
  focus:ring-2 
  focus:ring-blue-500 
  dark:bg-gray-800 
  dark:border-gray-700 
  dark:text-gray-300
  transition-colors 
  duration-200
`;

export default function ServiceRequestManager() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNegotiateDialog, setShowNegotiateDialog] = useState(false);
  const [dialogForm, setDialogForm] = useState({
    notes: '',
    estimatedCompletionTime: '',
    quotedPrice: '',
    additionalDetails: '',
  });
  const [visibleRequests, setVisibleRequests] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [selectedMoreRequest, setSelectedMoreRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, clientID } = useAuthStore();

  useEffect(() => {
    fetchServiceRequests();
  }, [accessToken, clientID]);

  const fetchServiceRequests = async () => {
    if (!accessToken || !clientID) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_Local}/api/service/serviceRequests/${clientID}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      if (response.status === 200) {
        const requests = response.data.serviceRequests || [];
        setRequests(requests);
      } else {
        toast.error('Failed to fetch service requests');
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toast.error('Failed to fetch service requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const updateData = {
        ...selectedMoreRequest,
        status: newStatus,
        requestDate: selectedMoreRequest.requestDate || new Date().toISOString()
      };

      const response = await axios.put(
        `${BACKEND_Local}/api/service/serviceRequests/update/${requestId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (response.status === 200) {
        setRequests(requests.map(request => 
          request._id === requestId ? { ...request, status: newStatus } : request
        ));
        toast.success('Status updated successfully');
        closeMoreModal();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const BackButton = () => (
    <button
      onClick={() => setSelectedRequest(null)}
      className="absolute top-2 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
      aria-label="Back to service requests"
    >
      <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-800" />
    </button>
  );

  const loadMoreRequests = () => {
    setVisibleRequests(prevVisible => prevVisible + 5);
  };

  const filteredRequests = requests.filter(request => {
    return (
      request.truckerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase())
    ) && 
    (filterStatus ? request.status === filterStatus : true) &&
    (filterPriority ? request.priority === filterPriority : true);
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handlePriorityFilterChange = (e) => {
    setFilterPriority(e.target.value);
  };

  const handleViewMore = (request) => {
    setSelectedMoreRequest(request);
    setShowMoreModal(true);
  };

  const closeMoreModal = () => {
    setShowMoreModal(false);
    setSelectedMoreRequest(null);
  };

  if (selectedRequest) {
    return (
      <ServiceProviderLayout>
        {/* ... (selected request details as before) */}
        <NegotiateDialog />
      </ServiceProviderLayout>
    );
  }

  return (
    <ServiceProviderLayout>
      <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
        <ToastContainer />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold dark:text-white">Service Requests</h1>
        </div>
        
        <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by location or trucker name"
              className={searchBarClasses}
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          </div>
          <select
            className={selectClasses}
            value={filterStatus}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            className={selectClasses}
            value={filterPriority}
            onChange={handlePriorityFilterChange}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No service requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2 py-2 sm:px-4 sm:py-3 text-left dark:text-gray-300">Trucker Name</TableHead>
                  <TableHead className="px-2 py-2 sm:px-4 sm:py-3 text-left dark:text-gray-300">Date</TableHead>
                  <TableHead className="px-2 py-2 sm:px-4 sm:py-3 text-left dark:text-gray-300">Service Type</TableHead>
                  <TableHead className="px-2 py-2 sm:px-4 sm:py-3 hidden sm:table-cell dark:text-gray-300">Location</TableHead>
                  <TableHead className="px-2 py-2 sm:px-4 sm:py-3 text-left dark:text-gray-300">Priority</TableHead>
                  <TableHead className="px-2 py-2 sm:px-4 sm:py-3 text-left dark:text-gray-300">Status</TableHead>
                  <TableHead className="px-2 py-2 sm:px-4 sm:py-3 text-left dark:text-gray-300">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="dark:bg-gray-800">
                {filteredRequests.slice(0, visibleRequests).map((request) => (
                  <TableRow key={request._id}>
                    <TableCell className="px-2 py-2 sm:px-4 sm:py-3">
                      {request.truckerDetails?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="px-2 py-2 sm:px-4 sm:py-3">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-2 py-2 sm:px-4 sm:py-3">
                      {request.serviceType || 'N/A'}
                    </TableCell>
                    <TableCell className="px-2 py-2 sm:px-4 sm:py-3 hidden sm:table-cell">
                      {request.location || 'N/A'}
                    </TableCell>
                    <TableCell className="px-2 py-2 sm:px-4 sm:py-3">
                      <Badge 
                        className={`text-white ${
                          request.priority === 'High' ? 'bg-red-500' : 
                          request.priority === 'Medium' ? 'bg-yellow-500' : 
                          'bg-green-500'
                        } w-full text-center`}
                      >
                        {request.priority === 'High' ? 'H' : request.priority === 'Medium' ? 'M' : 'L'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-2 sm:px-4 sm:py-3">
                      <Badge 
                        className={`${
                          request.status === 'pending' ? 'bg-yellow-500' : 
                          request.status === 'ongoing' ? 'bg-blue-500' : 
                          'bg-green-500'
                        } flex items-center w-fit`}
                      >
                        {request.status === 'pending' ? '⏳' : request.status === 'ongoing' ? '🔄' : '✅'}
                        <span className="ml-1 hidden sm:inline">{request.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-2 sm:px-4 sm:py-3">
                      <Button onClick={() => handleViewMore(request)} variant="outline" className="w-full sm:w-auto">
                        View More
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        {visibleRequests < filteredRequests.length && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={loadMoreRequests}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 shadow-md transform hover:scale-105"
            >
              View More
            </Button>
          </div>
        )}
        
        {/* View More Modal */}
        {showMoreModal && selectedMoreRequest && (
          <Dialog open={showMoreModal} onClose={closeMoreModal}>
            <DialogContent className="dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Service Request Details</DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Here are the details for the selected service request.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 dark:text-gray-300">
                <p><strong>Trucker Name:</strong> {selectedMoreRequest.truckerDetails?.name || 'N/A'}</p>
                <p><strong>Request Date:</strong> {new Date(selectedMoreRequest.createdAt).toLocaleDateString()}</p>
                <p><strong>Service Type:</strong> {selectedMoreRequest.serviceType || 'N/A'}</p>
                <p><strong>Location:</strong> {selectedMoreRequest.location || 'N/A'}</p>
                <p><strong>Status:</strong> {selectedMoreRequest.status}</p>
                <p><strong>Description:</strong> {selectedMoreRequest.description || 'N/A'}</p>
                <p><strong>Expected Price:</strong> {selectedMoreRequest.expectedPrice || 'N/A'}</p>
                <p><strong>Contact:</strong> {selectedMoreRequest.truckerDetails?.phone || 'N/A'}</p>
                
                {selectedMoreRequest.vehicleDetails && (
                  <>
                    <h4 className="font-semibold mt-4 mb-2">Vehicle Details</h4>
                    <p><strong>Make:</strong> {selectedMoreRequest.vehicleDetails.make || 'N/A'}</p>
                    <p><strong>Model:</strong> {selectedMoreRequest.vehicleDetails.model || 'N/A'}</p>
                    <p><strong>Year:</strong> {selectedMoreRequest.vehicleDetails.year || 'N/A'}</p>
                    <p><strong>VIN:</strong> {selectedMoreRequest.vehicleDetails.vin || 'N/A'}</p>
                  </>
                )}

                {selectedMoreRequest.status === 'pending' && (
                  <div className="mt-6">
                    <Button
                      onClick={() => handleUpdateStatus(selectedMoreRequest._id, 'ongoing')}
                      className="w-full"
                    >
                      Accept Request
                    </Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={closeMoreModal} className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ServiceProviderLayout>
  );
}