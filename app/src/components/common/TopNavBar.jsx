import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import mainLogo from './../../assets/images/logos/mainLogo.png';
import { NotificationBell } from './NotificationBell';
import { 
    Menu, 
    X, 
    Home,
    Truck,
    Briefcase,
    MapPin,
    Settings,
    Users,
    LogOut,
    Wrench,
    ClipboardList,
    HandCoins,
    User
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
            // { path: '/client/myloads', label: 'Jobs', icon: Briefcase },
            { path: '/client/trackload', label: 'Track', icon: MapPin },
            { path: '/client/settings', label: 'Settings', icon: Settings },
            { path: '/client/clientProfile', label: 'Profile', icon: User }, // Added client profile link
        ],
        trucker: [
            { path: '/trucker', label: 'Home', icon: Home },
            { path: '/trucker/trucks', label: 'My Trucks', icon: Truck },
            { path: '/trucker/myloads', label: 'Jobs', icon: Briefcase },
            { path: '/trucker/settings', label: 'Settings', icon: Settings },
            {path:'/trucker/truckerProfile', label: 'Profile', icon: User},
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
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 fixed w-full z-50 transition-all duration-300 ease-in-out shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo Section */}
                        <div className="flex-shrink-0 flex items-center">
                            <img
                                className="h-12 w-auto transform transition-transform duration-300 hover:scale-105"
                                src={mainLogo}
                                alt="Logo"
                                onClick={() => navigate(`/${userType}`)}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {currentLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg mx-1 flex items-center space-x-2 group
                                            ${location.pathname === link.path
                                                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{link.label}</span>
                                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 transform origin-left transition-transform duration-300 rounded-full
                                            ${location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} 
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
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg transition-all duration-300 
                                    hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
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
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 
                                    hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-300"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 shadow-lg">
                        {currentLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-300
                                        ${location.pathname === link.path
                                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={onLogout}
                            className="w-full mt-4 px-4 py-3 text-base font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg 
                                hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
}

export default TopNavBar;