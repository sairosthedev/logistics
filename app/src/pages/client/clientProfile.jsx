import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Edit2, X, Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ClientLayout from '../../components/layouts/clientLayout'; // Ensure this import is correct
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';

// Import auth store
import { useAuthStore } from '../../pages/auth/auth';

// Configure axios defaults
const api = axios.create({
  baseURL: BACKEND_Local,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

function ClientProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Get auth data
  const { user, accessToken, clientID } = useAuthStore();
  console.log(user);

  const validateForm = () => {
    const newErrors = {};
    
    if (isEditing) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!/^\+?[\d\s-()]{10,}$/.test(profile.phone)) {
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
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  useEffect(() => {
    const setupProfile = () => {
      try {
        if (!user || !clientID) {
          console.log('No user data in auth store');
          throw new Error('No user data available');
        }

        // Use all available user data from auth store
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone
      };

      if (profile.newPassword) {
        updateData.currentPassword = profile.currentPassword;
        updateData.newPassword = profile.newPassword;
      }

      console.log('Sending update request with data:', updateData);

      const response = await api.put(
        `/api/auth/user/${clientID}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      console.log('Update response:', response.data);
      
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      
      // Update local storage and state
      if (response.data) {
        const newData = {
          ...response.data,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        setProfile(newData);
        localStorage.setItem('loginData', JSON.stringify(response.data));

        // Update auth store user data
        const [firstName, lastName] = response.data.name.split(' ');
        useAuthStore.getState().setAuth({
          token: accessToken,
          user: {
            ...user,
            name: `${firstName} ${lastName}`,
            email: response.data.email
          },
          clientID,
          accountType: user.accountType
        });
      }
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      setErrors(prev => ({ 
        ...prev, 
        submit: errorMessage
      }));
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

  return (
    <ClientLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
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
            disabled={!isEditing}
            error={errors.firstName}
          />
          <ProfileField
            icon={User}
            label="Last Name"
            value={profile.lastName}
            onChange={(value) => handleProfileChange('lastName', value)}
            disabled={!isEditing}
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
            disabled={!isEditing}
            error={errors.email}
          />
          <ProfileField
            icon={Phone}
            label="Phone"
            value={profile.phone}
            onChange={(value) => handleProfileChange('phone', value)}
            type="tel"
            disabled={!isEditing}
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
    </ClientLayout>
  );
}

export default ClientProfile;