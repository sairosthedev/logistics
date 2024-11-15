import React from 'react';
import TopNavBar from '../common/TopNavBar';
import LogoutModal from '../../pages/auth/logout';
import { useDarkMode } from '../../contexts/DarkModeContext';

function PortalLayout({ children }) {
    const [showModal, setShowModal] = React.useState(false);
    const { darkMode } = useDarkMode();

    const handleLogoutClick = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <TopNavBar userType="app" onLogout={handleLogoutClick} />
            </div>
            
            <div className="pt-20">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        {children}
                    </div>
                </main>
            </div>

            <LogoutModal showModal={showModal} closeModal={closeModal} />
        </div>
    );
}

export default PortalLayout;
