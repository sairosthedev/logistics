import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import mainLogo from './../../assets/images/logos/mainLogo.png';
import LogoutModal from '../../pages/auth/logout';
import { NotificationBell } from '../common/NotificationBell';
import { Menu, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import axios from 'axios';
import { BACKEND_Local } from '../../../url';
import useAuthStore from '../../pages/auth/auth';

function TruckerLayout(props) {
    const location = useLocation();
    const { window, children } = props;
    const [showModal, setShowModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [acceptedBidsCount, setAcceptedBidsCount] = useState(0);
    const [acceptedBids, setAcceptedBids] = useState([]);
    const { accessToken, clientID } = useAuthStore();
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
        const fetchAcceptedBids = async () => {
            try {
                const response = await axios.get(`${BACKEND_Local}/api/trucker/request-bids/trucker/${clientID}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const accepted = response.data.filter(bid => bid.status === 'accepted');
                setAcceptedBids(accepted);
                setAcceptedBidsCount(accepted.length);
            } catch (error) {
                console.error('Error fetching accepted bids:', error);
            }
        };

        fetchAcceptedBids();
    }, [accessToken, clientID]);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top bar for mobile */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-30 flex justify-between items-center">
                <button onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <NotificationBell userType="trucker" />
            </div>

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full bg-white transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-40`}>
                <aside className="flex flex-col justify-between bg- white h-screen ">
                    <div className="flex flex-col items-center w-[80px] h-full  space-y-5 bg-sky-800 text-white shadow-lg h-full">
                        <Link to="/trucker" className="w-full h-20 top-0 left-0">
                            <img className="w-full h-full" src={mainLogo} alt="Main Logo" />
                        </Link> 

                        <Link to="/trucker" onClick={closeMobileMenu} className={`py-1 px-4 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/trucker')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 mx-auto">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            <span className="block text-sm mt-1 text-center">Home</span>
                        </Link>

                        <Link to="/trucker/trucks" onClick={closeMobileMenu} className={`py-1 px-4 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/trucker/trucks')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck mx-auto w-7 h-7">
                                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                                <path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                                <circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>
                            <span className="block text-sm mt-1 text-center">Trucks</span>
                        </Link>

                        <Link to="/trucker/myloads" onClick={closeMobileMenu} className={`py-1 px-5 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/trucker/myloads')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list mx-auto w-7 h-7"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
                            <span className="block text-sm mt-1 text-center">Jobs</span>
                        </Link>

                        <Link to="/trucker/services" onClick={closeMobileMenu} className={`py-1 px-3 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/trucker/services')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase mx-auto w-7 h-7"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 3h-8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" /></svg>
                            <span className="block text-sm mt-1 text-center">Services</span>
                        </Link>

                        <div className="flex flex-col items-center mt-auto space-y-5">
                            <Link to="/trucker/settings" onClick={closeMobileMenu} className={`py-1 px-3 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/trucker/settings')}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings mx-auto w-7 h-7"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                                <span className="block text-sm mt-1 text-center">Settings</span>
                            </Link>

                            <button onClick={handleLogoutClick} className={`py-1 px-4 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/trucker/logout')}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out mx-auto w-7 h-7"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                <span className="block text-sm mt-1 text-center">Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            <div className="flex flex-col flex-1 lg:ml-16 bg-gray-100">
                <main className="mt-16 lg:mt-0">
                    <div className="py-6">
                        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            <LogoutModal showModal={showModal} closeModal={closeModal} />
            
            <div className="absolute top-4 right-4 z-10">
                <NotificationBell userType="trucker" />
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

export default TruckerLayout
