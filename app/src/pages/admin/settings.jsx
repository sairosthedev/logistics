import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layouts/appLayout';
import { Bell, Moon, RefreshCw, ChevronRight } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { ThemeSelector } from '../../components/ThemeSelector';
import Toggle from '../../components/Toggle';

function Settings() {
  const { isDarkMode } = useDarkMode();
  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: false,
    },
    general: {
      autoUpdate: true,
    },
  });

  const handleToggle = (category, setting) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [setting]: !prevSettings[category][setting],
      },
    }));
  };

  const SettingCard = ({ icon: Icon, title, description, category, setting, enabled }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 dark:border-gray-700 dark:hover:shadow-none dark:hover:bg-dark-bg-secondary">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary-100 rounded-full dark:bg-dark-bg-tertiary">
          <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-dark-text-primary text-base sm:text-lg">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{description}</p>
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
      <h2 className="text-lg font-semibold mb-4 dark:text-dark-text-primary">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text-primary">Settings</h1>
        </div>

        <div className="space-y-8">
          <SettingSection title="Appearance">
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 dark:text-dark-text-primary mb-1">Theme</h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
                  Choose your preferred theme or sync with your system
                </p>
                <ThemeSelector />
              </div>
            </div>
          </SettingSection>

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
            <button className="w-full flex items-center justify-between p-4 text-left text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors duration-200">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">About</h3>
                <p className="text-sm">Version 1.0.0</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Settings;