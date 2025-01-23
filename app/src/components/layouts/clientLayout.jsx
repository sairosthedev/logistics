import React from 'react';
import TopNavBar from '../common/TopNavBar';
import LogoutModal from '../../pages/auth/logout';

function ClientLayout({ children }) {
    const [showModal, setShowModal] = React.useState(false);

    const handleLogoutClick = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-white  transition-colors duration-200">
            <TopNavBar userType="client" onLogout={handleLogoutClick} />
            
            <div className="pt-20">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  transition-colors duration-200">
                    <div className="py-6">
                        {children}
                    </div>
                </main>
            </div>

            <LogoutModal showModal={showModal} closeModal={closeModal} />
        </div>
    );
}

export default ClientLayout;