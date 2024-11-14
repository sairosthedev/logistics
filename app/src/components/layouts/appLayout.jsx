import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import mainLogo from './../../assets/images/logos/mainLogo.png';
import LogoutModal from '../../pages/auth/logout';
import { NotificationBell } from '../common/NotificationBell';

function PortalLayout(props) {
    const location = useLocation()
    const navigate = useNavigate()
    const { window, children } = props;
    const [showModal, setShowModal] = React.useState(false);

    const setBgColor = (path) => {
        return location.pathname === path ? "bg-blue-700" : "";
    }

    const handleLogoutClick = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleLogoClick = () => {
        navigate('/app');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="fixed top-0 left-0 h-full">
                <aside className="flex flex-col justify-between h-screen">
                    <div className="flex flex-col items-center w-16 py-8 space-y-8 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg h-full">
                        <div className="logo" onClick={handleLogoClick}>
                            <img className="w-auto h-10" src={mainLogo} alt="Main Logo" />
                        </div>

                        <Link to="/app" className={`p-2 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/app')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mx-auto">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            <span className="block text-xs mt-1 text-center">Home</span>
                        </Link>

                        <Link to="/app/myloads" className={`p-2 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/app/myloads')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list mx-auto"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
                            <span className="block text-xs mt-1 text-center">Jobs</span>
                        </Link>

                        <Link to="/app/users" className={`p-2 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/app/users')}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users mx-auto"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            <span className="block text-xs mt-1 text-center">Users</span>
                        </Link>

                        <div className="flex flex-col items-center mt-auto space-y-8">
                            <Link to="/app/settings" className={`p-2 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/app/settings')}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings mx-auto"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                                <span className="block text-xs mt-1 text-center">Settings</span>
                            </Link>

                            <button onClick={handleLogoutClick} className={`p-2 text-white transition-colors duration-200 rounded-lg hover:bg-blue-700 ${setBgColor('/app/logout')}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out mx-auto"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                <span className="block text-xs mt-1 text-center">Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            <div className="flex flex-col flex-1 ml-16">
                <main>
                    <div className="py-6">
                        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            <LogoutModal showModal={showModal} closeModal={closeModal} />
            
            <div className="absolute top-4 right-4 z-10">
                <NotificationBell />
            </div>
        </div>
    )
}

export default PortalLayout
