import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TruckerLayout from '../../components/layouts/truckerLayout';
import { 
  Search, 
  Clock,
  Wrench,
  Truck,
  MapPin,
  Bell,
  DollarSign,
  Star,
  Filter
} from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../auth/auth'; // Import the auth store
import { BACKEND_Local } from '../../../url.js'; // Import the backend URL

// Component definitions
const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 p-3 sm:p-2">
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="border-b border-gray-200">{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-md sm:text-xs font-semibold">{children}</h3>
);

const CardDescription = ({ children }) => (
  <p className="text-xs sm:text-xs text-gray-600">{children}</p>
);

const CardContent = ({ children }) => (
  <div className="p-2 sm:p-1">{children}</div>
);

const CardFooter = ({ children }) => (
  <div className="p-2 sm:p-1 border-t border-gray-200">{children}</div>
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

const Button = ({ children, className = '', ...props }) => (
  <button
    className={`px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-300 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Alert = ({ children }) => (
  <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
    {children}
  </div>
);

const AlertTitle = ({ children }) => (
  <h4 className="text-md font-semibold mb-1">{children}</h4>
);

const AlertDescription = ({ children }) => (
  <p className="text-sm">{children}</p>
);

const Badge = ({ children, variant, className = '' }) => {
  const getVariantClasses = (variant) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      secondary: ''
    };
    return variants[variant] || variants.secondary;
  };

  return (
    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getVariantClasses(variant)} ${className}`}>
      {children}
    </span>
  );
};

const Tab = ({ active, onClick, children }) => (
  <button
    className={`px-2 py-1 text-xs font-medium rounded-md ${
      active ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Select = ({ className = '', ...props }) => (
  <select
    className={`w-full px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

const categories = [
  { id: 'all', label: 'All Services' },
  { id: 'repair', label: 'Repair & Maintenance' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'facilities', label: 'Facilities' }
];

const locations = ["All Locations", "New York", "Chicago", "Los Angeles", "Dallas"];

const statuses = ["All Statuses", "pending", "ongoing", "done"];

const DefaultIcon = Truck; // Use a default icon if the specific one is not found

export default function TruckerServices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [requestedService, setRequestedService] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [services, setServices] = useState([]);
  const [visibleServices, setVisibleServices] = useState(6); // Number of services to show initially
  const navigate = useNavigate();
  const { accessToken } = useAuthStore(); // Get token from the auth store

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${BACKEND_Local}/api/trucker/services`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        if (response.status === 200) {
          setServices(response.data);
        } else {
          console.error('Failed to fetch services');
        }
      } catch (error) {
        console.error('Failed to fetch services');
      }
    };

    fetchServices();
  }, [accessToken]);

  const filteredServices = services.filter(service =>
    (activeCategory === 'all' || service.category === activeCategory) &&
    service.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedLocation === "All Locations" || service.location === selectedLocation) &&
    (selectedStatus === "All Statuses" || service.status === selectedStatus)
  );

  const handleServiceRequest = (service) => {
    setRequestedService(service);
    setTimeout(() => setRequestedService(null), 3000);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TruckerLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trucker Services</h1>
          <p className="text-gray-600 text-sm">Find and request the services you need on the road</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            {categories.map(category => (
              <Tab
                key={category.id}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </Tab>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Location</label>
            <Select 
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <Select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
          </div>
        </div>

        {requestedService && (
          <Alert>
            <AlertTitle>Service Requested!</AlertTitle>
            <AlertDescription>
              Your request for {requestedService.serviceName} has been sent. A service provider will contact you shortly.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.slice(0, visibleServices).map((service, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {React.createElement(service.icon || DefaultIcon, { className: "h-5 w-5 text-blue-500" })}
                    <CardTitle>{service.serviceName}</CardTitle>
                  </div>
                  <Badge variant={service.priority}>
                    {service.priority.charAt(0).toUpperCase() + service.priority.slice(1)} Priority
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{service.rating}</span>
                  </div>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {service.servicesOffered.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between w-full text-xs text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {service.priceRange}
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs text-gray-600">{service.location}</span>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleServiceRequest(service)}
                >
                  Request Service
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredServices.length > visibleServices && (
          <div className="mt-4">
            <Button onClick={() => setVisibleServices(visibleServices + 6)} className="w-full">
              View More
            </Button>
          </div>
        )}
      </div>
    </TruckerLayout>
  );
}
