import React, { useState, useEffect } from 'react';
import ServiceProviderLayout from '../../components/layouts/serviceProviderLayout';
import { Bell, Moon, RefreshCw, ChevronRight, User, Mail, Phone, Lock, Save, Edit2, X, AlertTriangle } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAuthStore } from '../../pages/auth/auth';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Custom Toggle component
const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
      enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const ProfileSection = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const ProfileField = ({ 
  icon: Icon, 
  label, 
  value, 
  onChange, 
  type = "text", 
  disabled = false,
  error = null
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 dark:border-gray-700 dark:hover:shadow-none dark:hover:bg-gray-800">
      <div className="flex items-center space-x-4 w-full">
        <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="w-full">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{label}</h3>
          {disabled ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{value}</p>
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1 w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
              placeholder={`Enter your ${label.toLowerCase()}`}
            />
          )}
        </div>
      </div>
    </div>
    {error && (
      <p className="text-sm text-red-500 ml-4">{error}</p>
    )}
  </div>
);

function Settings() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, accessToken, clientID } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: false,
    },
    appearance: {
      darkMode: isDarkMode,
    },
    general: {
      autoUpdate: true,
    },
  });

  useEffect(() => {
    const setupProfile = () => {
      try {
        if (!user || !clientID) {
          console.log('No user data in auth store');
          throw new Error('No user data available');
        }

        setProfile(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
        }));

        setIsLoading(false);
      } catch (error) {
        console.error('Error in profile setup:', error);
        setErrors(prev => ({
          ...prev,
          submit: 'Failed to load profile data. Please log in again.'
        }));
        setIsLoading(false);
      }
    };

    setupProfile();
  }, [user, clientID]);

  const handleToggle = (category, setting) => {
    setSettings(prevSettings => {
      const newSettings = {
        ...prevSettings,
        [category]: {
          ...prevSettings[category],
          [setting]: !prevSettings[category][setting],
        },
      };

      if (category === 'appearance' && setting === 'darkMode') {
        toggleDarkMode();
      }

      return newSettings;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isEditing) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (profile.phone && !/^\+?[\d\s-()]{10,}$/.test(profile.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      
      if (profile.newPassword) {
        if (!profile.currentPassword) {
          newErrors.currentPassword = 'Current password is required';
        }
        if (profile.newPassword.length < 8) {
          newErrors.newPassword = 'Password must be at least 8 characters';
        }
        if (profile.newPassword !== profile.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileChange = (field, value) => {
    if (field.includes('Password')) {
      setProfile(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      if (profile.newPassword) {
        const response = await axios.put(
          `${BACKEND_Local}/api/auth/change-password`,
          {
            currentPassword: profile.currentPassword,
            newPassword: profile.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        if (response.status === 200) {
          setSuccessMessage('Password updated successfully');
          setIsEditing(false);
          setProfile(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }));
        }
      }
    } catch (error) {
      console.error('Error updating password:', error);
      let errorMessage = 'Failed to update password. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      setErrors(prev => ({ 
        ...prev, 
        submit: errorMessage
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setProfile(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const SettingCard = ({ icon: Icon, title, description, category, setting, enabled }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 dark:border-gray-700 dark:hover:shadow-none dark:hover:bg-gray-800">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-base sm:text-lg">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <Toggle 
        enabled={enabled}
        onToggle={() => handleToggle(category, setting)}
      />
    </div>
  );

  const SettingSection = ({ title, children }) => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <ServiceProviderLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <button
            onClick={isEditing ? handleCancel : () => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {errors.submit && (
          <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <ProfileSection title="Personal Information">
            <ProfileField
              icon={User}
              label="First Name"
              value={profile.firstName}
              onChange={(value) => handleProfileChange('firstName', value)}
              disabled={true}
              error={errors.firstName}
            />
            <ProfileField
              icon={User}
              label="Last Name"
              value={profile.lastName}
              onChange={(value) => handleProfileChange('lastName', value)}
              disabled={true}
              error={errors.lastName}
            />
          </ProfileSection>

          <ProfileSection title="Contact Information">
            <ProfileField
              icon={Mail}
              label="Email"
              value={profile.email}
              onChange={(value) => handleProfileChange('email', value)}
              type="email"
              disabled={true}
              error={errors.email}
            />
            <ProfileField
              icon={Phone}
              label="Phone"
              value={profile.phone}
              onChange={(value) => handleProfileChange('phone', value)}
              type="tel"
              disabled={true}
              error={errors.phone}
            />
          </ProfileSection>

          {isEditing && (
            <ProfileSection title="Security">
              <ProfileField
                icon={Lock}
                label="Current Password"
                value={profile.currentPassword}
                onChange={(value) => handleProfileChange('currentPassword', value)}
                type="password"
                error={errors.currentPassword}
              />
              <ProfileField
                icon={Lock}
                label="New Password"
                value={profile.newPassword}
                onChange={(value) => handleProfileChange('newPassword', value)}
                type="password"
                error={errors.newPassword}
              />
              <ProfileField
                icon={Lock}
                label="Confirm New Password"
                value={profile.confirmPassword}
                onChange={(value) => handleProfileChange('confirmPassword', value)}
                type="password"
                error={errors.confirmPassword}
              />
            </ProfileSection>
          )}

          {isEditing && (
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </form>

        <div className="space-y-8 mt-8 pt-8 border-t dark:border-gray-700">
          <SettingSection title="Notifications">
            <SettingCard
              icon={Bell}
              title="Push Notifications"
              description="Receive push notifications for important updates"
              category="notifications"
              setting="pushNotifications"
              enabled={settings.notifications.pushNotifications}
            />
            <SettingCard
              icon={Bell}
              title="Email Notifications"
              description="Receive email notifications for important updates"
              category="notifications"
              setting="emailNotifications"
              enabled={settings.notifications.emailNotifications}
            />
          </SettingSection>

          <SettingSection title="Appearance">
            <SettingCard
              icon={Moon}
              title="Dark Mode"
              description="Toggle dark mode on or off"
              category="appearance"
              setting="darkMode"
              enabled={settings.appearance.darkMode}
            />
          </SettingSection>

          <SettingSection title="General">
            <SettingCard
              icon={RefreshCw}
              title="Auto Update"
              description="Automatically update the application"
              category="general"
              setting="autoUpdate"
              enabled={settings.general.autoUpdate}
            />
          </SettingSection>

          <div className="mt-8 pt-6 border-t dark:border-gray-700">
            <button className="w-full flex items-center justify-between p-4 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">About</h3>
                <p className="text-sm">Version 1.0.0</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </ServiceProviderLayout>
  );
}

export default Settings;