import React, { useState, useEffect } from 'react';
import TruckerLayout from '../../components/layouts/truckerLayout';
import { Bell, Moon, RefreshCw, ChevronRight } from 'lucide-react';

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

function TruckerSettings() {
  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: false,
      emailNotifications: false,
    },
    appearance: {
      darkMode: false,
    },
    general: {
      autoUpdate: true,
    },
  });

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' ||
      (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, darkMode: isDarkMode }
    }));

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleToggle = (category, setting) => {
    setSettings(prevSettings => {
      const newSettings = {
        ...prevSettings,
        [category]: {
          ...prevSettings[category],
          [setting]: !prevSettings[category][setting],
        },
      };

      // Handle dark mode toggle specifically
      if (category === 'appearance' && setting === 'darkMode') {
        const isDarkMode = newSettings.appearance.darkMode;
        localStorage.setItem('darkMode', isDarkMode);
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      return newSettings;
    });
  };

  const SettingCard = ({ icon: Icon, title, description, category, setting, enabled }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 dark:border-gray-700 dark:hover:shadow-none dark:hover:bg-gray-800">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
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
    <TruckerLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 transition-colors duration-200 dark:bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        </div>

        <div className="space-y-8">
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
    </TruckerLayout>
  );
}

export default TruckerSettings;