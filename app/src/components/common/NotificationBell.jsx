import React, { useState, useEffect, useRef } from 'react';
import { Bell, Filter } from 'lucide-react';
import axios from 'axios';
import { BACKEND_Local } from '../../../url';
import useAuthStore from '../../pages/auth/auth';
import notificationSound from '../../assets/sounds/notification.mp3';

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const notificationRef = useRef(null);
    const audioRef = useRef(new Audio(notificationSound));
    const prevNotificationsRef = useRef([]);
    const { accessToken, clientID, accountType } = useAuthStore();

    useEffect(() => {
        if (accessToken) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [accessToken, clientID, selectedStatus]);

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

    useEffect(() => {
        if (selectedStatus === 'all') {
            setFilteredNotifications(notifications);
        } else {
            setFilteredNotifications(notifications.filter(notif => notif.status === selectedStatus));
        }
    }, [selectedStatus, notifications]);

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
            
            // Admin can see all notifications
            if (accountType === 'admin') {
                endpoint = `${BACKEND_Local}/api/notifications/user/admin/all`;
            } else {
                endpoint = `${BACKEND_Local}/api/notifications/user/${clientID}`;
            }

            console.log('Fetching notifications with:', {
                accountType,
                clientID,
                endpoint
            });

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            console.log('Notifications response:', response.data);
            
            if (response.data) {
                setNotifications(response.data);
                const unread = response.data.filter(notif => notif.status === 'new').length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error.response?.data || error.message);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const endpoint = `${BACKEND_Local}/api/notifications/${notificationId}`;
            
            await axios.put(endpoint, { status: 'read' }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            setNotifications(prevNotifications => 
                prevNotifications.map(notif => 
                    notif._id === notificationId ? { ...notif, status: 'read' } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = async (e, notificationId) => {
        e.stopPropagation(); // Prevent triggering the markAsRead when clicking delete
        try {
            const endpoint = `${BACKEND_Local}/api/notifications/${notificationId}`;
            
            await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            setNotifications(prevNotifications => 
                prevNotifications.filter(notif => notif._id !== notificationId)
            );
            
            // Update unread count if we're deleting an unread notification
            const deletedNotification = notifications.find(n => n._id === notificationId);
            if (deletedNotification?.status === 'new') {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
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
            case 'NEW_BID':
                return '💰';
            case 'NEW_REQUEST':
                return '🚚';
            case 'BID_ACCEPTED':
                return '✅';
            case 'BID_REJECTED':
                return '❌';
            case 'STATUS_UPDATE':
                return '🔄';
            default:
                return '🔔';
        }
    };

    return (
        <div className="relative" ref={notificationRef}>
            <button
                className="relative p-2.5 text-white/90 hover:text-white transition-all duration-300 hover:scale-110 
                    hover:bg-white/10 rounded-xl flex items-center justify-center group"
                onClick={() => setShowNotifications(!showNotifications)}
            >
                <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center
                        shadow-lg shadow-red-500/30 ring-2 ring-white/20 text-xs font-bold text-white animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl z-50 
                    max-h-[80vh] overflow-y-auto border border-white/20 transform transition-all duration-300 ease-out">
                    <div className="sticky top-0 p-4 border-b border-gray-100 bg-white/95 backdrop-blur-xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            <select 
                                className="text-sm border border-gray-200 rounded-xl p-2 bg-white/50 backdrop-blur-xl
                                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
                                    transition-all duration-300"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="new">Unread</option>
                                <option value="read">Read</option>
                            </select>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 hover:bg-blue-50/50 cursor-pointer transition-all duration-300 
                                        ${notification.status === 'new' ? 'bg-blue-50/80' : ''}
                                        group relative`}
                                    onClick={() => markAsRead(notification._id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <span className="text-2xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800 font-medium line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                                                <span>{getTimeAgo(notification.createdAt)}</span>
                                                <span>•</span>
                                                <span className="truncate">{notification.resourceType}</span>
                                            </div>
                                            {accountType === 'admin' && (
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    User: {notification.userID}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {notification.status === 'new' && (
                                                <span className="h-2.5 w-2.5 bg-blue-500 rounded-full ring-4 ring-blue-500/20"></span>
                                            )}
                                            <button
                                                onClick={(e) => deleteNotification(e, notification._id)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200
                                                    opacity-0 group-hover:opacity-100"
                                                title="Delete notification"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <div className="text-4xl mb-3">🔔</div>
                                <p className="text-sm font-medium">No notifications</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {selectedStatus === 'all' 
                                        ? "You're all caught up!"
                                        : `No ${selectedStatus === 'new' ? 'unread' : 'read'} notifications`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
