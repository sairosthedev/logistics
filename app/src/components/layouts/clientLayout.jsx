import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import mainLogo from './../../assets/images/logos/mainLogo.png';
import LogoutModal from '../../pages/auth/logout';
import { NotificationBell } from '../common/NotificationBell';
import { Menu, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import useAuthStore from '../../pages/auth/auth'; // Add this import
import { BACKEND_Local } from '../../../url.js'; // Add this import
import axios from 'axios';


function ClientLayout(props) {
    const location = useLocation();
    const { window, children } = props;
    const [showModal, setShowModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [bidsCount, setBidsCount] = useState(0);
    const [jobsCount, setJobsCount] = useState(0);
    const { accessToken } = useAuthStore(); // Add this line
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const setBgColor = (path) => {
        return location.pathname === path ? "bg-blue-700" : "";
    }

    const handleLogoutClick = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const clientId = localStorage.getItem('userId');
                
                // Fetch request-bids count from truckers.jsx
                const bidsResponse = await fetch(`/api/request-bids`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const bidsData = await bidsResponse.json();
                setBidsCount(bidsData.length);

                // Fetch jobs count from myloads.jsx
                const jobsResponse = await fetch(`/api/client/requests`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const jobsData = await jobsResponse.json();
                setJobsCount(jobsData.length);

            } catch (error) {
                console.error('Error fetching counts:', error);
                setBidsCount(0);
                setJobsCount(0);
            }
        };

        if (accessToken) {
            fetchCounts();
            const interval = setInterval(fetchCounts, 30000);
            return () => clearInterval(interval);
        }
    }, [accessToken]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(
                    `${BACKEND_Local}/api/notifications/client`, 
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                
                // Transform the data to match the NotificationBell component's expected format
                const formattedNotifications = response.data.map(notification => ({
                    type: notification.type, // 'New Bid', 'Delivery Confirmed', 'Goods in Transit'
                    truckerName: notification.truckerName,
                    pickupLocation: notification.pickupLocation,
                    dropoffLocation: notification.dropoffLocation,
                    estimatedPrice: notification.price,
                    message: notification.message,
                    timestamp: notification.createdAt
                }));

                setNotifications(formattedNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (accessToken) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [accessToken]);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top bar for mobile */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-30 flex justify-between items-center">
                <button onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <NotificationBell 
                    count={notifications.length}
                    notifications={notifications}
                    userType="client"
                />
            </div>

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-40`}>
                <aside className="flex flex-col justify-between h-screen">
                    <div className="flex flex-col items-center w-16 py-8 space-y-8 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg h-full">
                        <Link to="/client" onClick={() => window.location.href = '/home'}>
                            <img className="w-auto h-10" src={mainLogo} alt="Main Logo" />
                        </Link>

                        <Link to="/client" className={`p-2 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/client')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mx-auto">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            <span className="block text-xs mt-1 text-center">Home</span>
                        </Link>

                        <Link to="/client/truckers" className={`p-2 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/client/truckers')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck mx-auto"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                            <span className="block text-xs mt-1 text-center">Truckers</span>
                        </Link>

                        <Link to="/client/myloads" className={`p-2 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/client/myloads')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list mx-auto"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
                            <span className="block text-xs mt-1 text-center">Jobs</span>
                        </Link>

                        <Link to="/client/trackload" className={`p-2 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/client/trackload')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin mx-auto"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                            <span className="block text-xs mt-1 text-center">Track</span>
                        </Link>

                        <Link to="/client/settings" className={`p-2 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/client/settings')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings mx-auto"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0 .33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                            <span className="block text-xs mt-1 text-center">Settings</span>
                        </Link>

                        <div className="flex flex-col items-center mt-auto space-y-8">
                            <button onClick={handleLogoutClick} className={`p-2 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/client/logout')}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out mx-auto"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                <span className="block text-xs mt-1 text-center">Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            <div className="flex flex-col flex-1 lg:ml-16">
                <main className="mt-16 lg:mt-0">
                    <div className="py-6">
                        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            <LogoutModal showModal={showModal} closeModal={closeModal} />

            {/* Desktop notification bell */}
            <div className="absolute top-4 right-4 z-10">
                <NotificationBell />
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={closeMobileMenu}
                ></div>
            )}
        </div>
    )
}

export default ClientLayout
