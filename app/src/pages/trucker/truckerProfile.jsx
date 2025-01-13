import React, { useState, useEffect } from "react";
import TruckerLayout from "../../components/layouts/truckerLayout";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Edit2,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { BACKEND_Local } from "../../../url.js";
import jwt_decode from "jwt-decode";

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
  error = null,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 dark:border-gray-700 dark:hover:shadow-none dark:hover:bg-gray-800">
      <div className="flex items-center space-x-4 w-full">
        <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="w-full">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {label}
          </h3>
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
    {error && <p className="text-sm text-red-500 ml-4">{error}</p>}
  </div>
);

function TruckerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState("/api/placeholder/150/150");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const decodedToken = jwt_decode(token);
        const response = await fetch(
          `${BACKEND_Local}/api/trucker/profile/${decodedToken.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        if (data.profilePicture) setProfileImage(data.profilePicture);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setErrors({
          submit: "Failed to load profile. Please try logging in again.",
        });
      }
    };

    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (isEditing) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!/^\+?[\d\s-()]{10,}$/.test(profile.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }

      if (profile.newPassword) {
        if (!profile.currentPassword)
          newErrors.currentPassword = "Current password is required";
        if (profile.newPassword.length < 8)
          newErrors.newPassword = "Password must be at least 8 characters";
        if (profile.newPassword !== profile.confirmPassword)
          newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ image: "Image must be less than 5MB" });
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setErrors({ image: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const decodedToken = jwt_decode(token);
      const formData = new FormData();
      Object.keys(profile).forEach((key) => {
        if (profile[key]) formData.append(key, profile[key]);
      });

      const response = await fetch(
        `${BACKEND_Local}/api/trucker/profile/${decodedToken.id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      setProfile((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      // Fetch the updated profile data
      const updatedProfileResponse = await fetch(
        `${BACKEND_Local}/api/trucker/profile/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!updatedProfileResponse.ok) {
        throw new Error("Failed to fetch updated profile");
      }

      const updatedProfileData = await updatedProfileResponse.json();
      setProfile((prev) => ({
        ...prev,
        firstName: updatedProfileData.firstName || "",
        lastName: updatedProfileData.lastName || "",
        email: updatedProfileData.email || "",
        phone: updatedProfileData.phone || "",
      }));

      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({
        submit: error.message || "Failed to update profile. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setProfile((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  return (
    <TruckerLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 transition-colors duration-200 dark:bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Profile
          </h1>
          <button
            onClick={isEditing ? handleCancel : () => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
          <div className="flex items-center justify-center mb-8">
            <div className="relative group">
              <div className="h-32 w-32 overflow-hidden rounded-full ring-4 ring-blue-100 dark:ring-blue-900">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-blue-600 p-2 shadow-lg transition-all hover:bg-blue-700">
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <ProfileSection title="Personal Information">
            <ProfileField
              icon={User}
              label="First Name"
              value={profile.firstName}
              onChange={(value) => handleProfileChange("firstName", value)}
              disabled={!isEditing}
              error={errors.firstName}
            />
            <ProfileField
              icon={User}
              label="Last Name"
              value={profile.lastName}
              onChange={(value) => handleProfileChange("lastName", value)}
              disabled={!isEditing}
              error={errors.lastName}
            />
          </ProfileSection>

          <ProfileSection title="Contact Information">
            <ProfileField
              icon={Mail}
              label="Email"
              value={profile.email}
              onChange={(value) => handleProfileChange("email", value)}
              type="email"
              disabled={!isEditing}
              error={errors.email}
            />
            <ProfileField
              icon={Phone}
              label="Phone"
              value={profile.phone}
              onChange={(value) => handleProfileChange("phone", value)}
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
                onChange={(value) =>
                  handleProfileChange("currentPassword", value)
                }
                type="password"
                error={errors.currentPassword}
              />
              <ProfileField
                icon={Lock}
                label="New Password"
                value={profile.newPassword}
                onChange={(value) => handleProfileChange("newPassword", value)}
                type="password"
                error={errors.newPassword}
              />
              <ProfileField
                icon={Lock}
                label="Confirm New Password"
                value={profile.confirmPassword}
                onChange={(value) =>
                  handleProfileChange("confirmPassword", value)
                }
                type="password"
                error={errors.confirmPassword}
              />
            </ProfileSection>
          )}

          {isEditing && (
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </TruckerLayout>
  );
}

export default TruckerProfile;
