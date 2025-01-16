import React from 'react';
import TopNavBar from '../common/TopNavBar';
import LogoutModal from '../../pages/auth/logout';

function TruckerLayout({ children }) {
    const [showModal, setShowModal] = React.useState(false);

    const handleLogoutClick = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <TopNavBar userType="trucker" onLogout={handleLogoutClick} />
            
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

export default TruckerLayout;