import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    Menu, X, Home, Truck, Briefcase, MapPin, 
    Settings, Users, LogOut, Wrench, 
    ClipboardList, HandCoins, User
} from 'lucide-react';

function TopNavBar({ userType, onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = {
        app: [
            { path: '/app', label: 'Home', icon: Home },
            { path: '/app/myloads', label: 'Jobs', icon: Briefcase },
            { path: '/app/users', label: 'Users', icon: Users },
            { path: '/app/settings', label: 'Settings', icon: Settings },
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
            { path: '/trucker/myloads', label: 'Jobs', icon: Briefcase },
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
            <nav className="backdrop-blur-md bg-gradient-to-r from-blue-600/90 to-blue-800/90 dark:from-gray-800/90 dark:to-gray-900/90 fixed w-full z-50 transition-all duration-300 ease-in-out shadow-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo Section */}
                        <div className="flex-shrink-0 flex items-center">
                            <div
                                onClick={() => navigate(`/${userType}`)}  /* Fix applied here */
                                className="h-16 w-16 bg-white/95 rounded-2xl shadow-lg flex items-center justify-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:rotate-3 hover:shadow-blue-500/30"
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
                                                ? 'text-white bg-white/20 shadow-lg shadow-blue-500/20'
                                                : 'text-white/90 hover:text-white hover:bg-white/15'
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
                            <button className="relative p-2.5 text-white hover:text-blue-200 transition-all duration-300 hover:scale-110">
                                <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                    <span className="text-xs font-bold text-white">3</span>
                                </div>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            <button
                                onClick={onLogout}
                                className="px-6 py-2.5 text-sm font-semibold text-blue-600 bg-white/95 rounded-xl transition-all duration-300 
                                    hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5 flex items-center space-x-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center space-x-4">
                            <button className="relative p-2 text-white hover:text-blue-200 transition-colors duration-300">
                                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white">3</span>
                                </div>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
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
                    <div className="px-2 pt-2 pb-3 space-y-1.5 bg-gradient-to-b from-blue-700/95 to-blue-800/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-md">
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
                            className="w-full mt-4 px-4 py-3.5 text-base font-semibold text-blue-600 bg-white/95 rounded-xl 
                                hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center space-x-2"
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
