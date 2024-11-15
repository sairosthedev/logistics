import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url';
import useAuthStore from '../../pages/auth/auth';
import notificationSound from '../../assets/sounds/notification.mp3';

export const NotificationBell = ({ userType }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);
    const audioRef = useRef(new Audio(notificationSound));
    const prevNotificationsRef = useRef([]);
    const { accessToken, clientID } = useAuthStore();

    useEffect(() => {
        if (accessToken && clientID) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [accessToken, clientID, userType]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const prevCount = prevNotificationsRef.current.length;
        const currentCount = notifications.length;
        const hasNewNotifications = currentCount > prevCount;
        
        if (hasNewNotifications) {
            playNotificationSound();
        }
        
        prevNotificationsRef.current = notifications;
    }, [notifications]);

    const playNotificationSound = () => {
        try {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(error => {
                console.log('Error playing notification sound:', error);
            });
        } catch (error) {
            console.log('Error playing notification sound:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            let endpoint;
            switch (userType) {
                case 'app':
                    endpoint = `${BACKEND_Local}/api/admin/notifications`;
                    break;
                case 'client':
                    endpoint = `${BACKEND_Local}/api/client/notifications/${clientID}`;
                    break;
                case 'trucker':
                    endpoint = `${BACKEND_Local}/api/trucker/notifications/${clientID}`;
                    break;
                case 'service':
                    endpoint = `${BACKEND_Local}/api/service/notifications/${clientID}`;
                    break;
                default:
                    console.error('Invalid user type');
                    return;
            }
            
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            if (response.data) {
                setNotifications(response.data);
                const unread = response.data.filter(notif => !notif.read).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            let endpoint = `${BACKEND_Local}/api/notifications/mark-read/${notificationId}`;
            
            await axios.put(endpoint, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            setNotifications(prevNotifications => 
                prevNotifications.map(notif => 
                    notif._id === notificationId ? { ...notif, read: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'bid':
                return '💰';
            case 'delivery':
                return '🚚';
            case 'message':
                return '✉️';
            case 'service':
                return '🔧';
            case 'admin':
                return '👨‍💼';
            case 'system':
                return '🔔';
            default:
                return '🔔';
        }
    };

    return (
        <div className="relative" ref={notificationRef}>
            <button
                className="relative p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                onClick={() => setShowNotifications(!showNotifications)}
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-blue-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto">
                    <div className="sticky top-0 p-4 border-b border-gray-200 bg-white">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                                        !notification.read ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => markAsRead(notification._id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <span className="text-2xl">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {getTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
