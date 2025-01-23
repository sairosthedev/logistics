import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    Menu, X, Home, Truck, Briefcase, MapPin, 
    Settings, Users, LogOut, Wrench, 
    ClipboardList, HandCoins, User, Star
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

function TopNavBar({ userType, onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = {
        app: [
            { path: '/app', label: 'Home', icon: Home },
            { path: '/app/myloads', label: 'Jobs', icon: Briefcase },
            { path: '/app/users', label: 'Users', icon: Users },
            { path: '/app/adminProfile', label: 'Profile', icon: User },
            {path: '/app/ratings', label: 'Ratings', icon: Star}
        ],
        client: [
            { path: '/client', label: 'Home', icon: Home },
            { path: '/client/truckers', label: 'Bids', icon: HandCoins },
            { path: '/client/trackload', label: 'Track', icon: MapPin },
            { path: '/client/clientProfile', label: 'Profile', icon: User },
        ],
        trucker: [
            { path: '/trucker', label: 'Home', icon: Home },
            { path: '/trucker/trucks', label: 'My Trucks', icon: Truck },
            { path: '/trucker/truckerProfile', label: 'Profile', icon: User },
           
        ],
        service: [
            { path: '/service', label: 'Home', icon: Home },
            { path: '/service/myservices', label: 'Services', icon: Wrench },
            { path: '/service/servicerequests', label: 'Requests', icon: ClipboardList },
            { path: '/service/settings', label: 'Settings', icon: Settings },
        ]
    };

    const currentLinks = navLinks[userType] || [];

    return (
        <>
            <nav className="backdrop-blur-md bg-gradient-to-r from-indigo-600/95 via-blue-600/95 to-blue-700/95 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-900/95 fixed w-full z-50 transition-all duration-300 ease-in-out shadow-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo Section */}
                        <div className="flex-shrink-0 flex items-center">
                            <div
                                onClick={() => navigate(`/${userType}`)}
                                className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:rotate-3 hover:shadow-xl hover:shadow-blue-500/30"
                            >
                                <img src="/src/assets/images/logos/mainLogo.png" alt="Logo" className="h-full w-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = 'fallbackLogo.png'; }} />
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-2">
                            {currentLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`relative px-4 py-2.5 text-sm font-medium rounded-xl mx-1 flex items-center space-x-2 group
                                            ${isActive
                                                ? 'text-white bg-white/25 shadow-lg shadow-blue-500/30'
                                                : 'text-white/90 hover:text-white hover:bg-white/20'
                                            } transition-all duration-300 ease-out`}
                                    >
                                        <Icon className={`w-4 h-4 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}`} />
                                        <span className="relative z-10 font-semibold">{link.label}</span>
                                        <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl transform origin-left transition-transform duration-300 
                                            ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} 
                                        />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Section */}
                        <div className="hidden md:flex items-center space-x-4">
                            <NotificationBell userType={userType} />
                            <button
                                onClick={onLogout}
                                className="px-6 py-2.5 text-sm font-semibold text-blue-600 bg-white rounded-xl transition-all duration-300 
                                    hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 flex items-center space-x-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center space-x-4">
                            <NotificationBell userType={userType} />
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none transition-colors duration-300"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1.5 bg-gradient-to-b from-indigo-600/95 via-blue-600/95 to-blue-700/95 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-900/95 backdrop-blur-md">
                        {currentLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-300
                                        ${isActive
                                            ? 'text-white bg-white/20 shadow-lg shadow-blue-500/20'
                                            : 'text-white/90 hover:text-white hover:bg-white/15'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-semibold">{link.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={onLogout}
                            className="w-full mt-4 px-4 py-3.5 text-base font-semibold text-blue-600 bg-white rounded-xl 
                                hover:bg-blue-50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center space-x-2"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Overlay with improved blur effect */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
}

export default TopNavBar;
