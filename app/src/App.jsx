// Material UI font imports
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import React from 'react';
import AppLayout from './components/layouts/appLayout';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import useAuthStore from './pages/auth/auth'
import { DarkModeProvider } from './contexts/DarkModeContext';
import { TruckProvider } from './pages/trucker/truckContext';

// import the pages
// landing pages

import NotFound from './pages/notFound'

// auth pages
import Login from './pages/auth/login'
import SignUp from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/forgotPassword'

// admin pages
import Home from './pages/admin/home'
import Availabletrucks from './pages/admin/availabletrucks'
import AdminMyLoads from './pages/admin/myloads'
import Services from './pages/admin/services'
import AdminProfile from './pages/admin/adminProfile'
import UserManagement from './pages/admin/userManagement';
import Analytics from './pages/admin/Analytics';
import AdminRatings from './pages/admin/Ratings';

// client pages
import ClientHome from './pages/client/home'
import AvailableTrucks from './pages/client/truckers'
import ClientTrackLoad from './pages/client/trackload'
import ClientSettings from './pages/client/settings'

// trucker pages
import TruckerHome from './pages/trucker/home'
import Trucks from './pages/trucker/trucks'
import TruckersServices from './pages/trucker/services'
import TruckerSettings from './pages/trucker/settings'
import TruckerProfile from './pages/trucker/truckerProfile';

// service provider pages
import ServiceProviderHome from './pages/serviceProvider/home'
import MyServices from './pages/serviceProvider/myservices'
import TrackService from './pages/serviceProvider/trackservice'
import ServiceServices from './pages/serviceProvider/settings'
import ServiceDetails from './pages/serviceProvider/servicedetails'
import ServiceSettings from './pages/serviceProvider/settings'; 
import ClientDetails from './pages/serviceProvider/clientdetails';
import ServiceRequests from './pages/serviceProvider/serviceRequests';
import ClientProfile from './pages/client/clientProfile';

const theme = createTheme();

function App() {
  const { accessToken } = useAuthStore();

  const PrivateRoute = ({ element }) => {
    return accessToken ? element : <Navigate to="/" />;
  };

  const playNotification = () => {
    if ('Notification' in window) {
        new Notification('New Message', {
            silent: false
        });
    }
  };

  return (
    <DarkModeProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TruckProvider>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
          <BrowserRouter>
            <Routes>
              {/* auth routes */}
              <Route path="/" element={<Login />} />

              {/* auth pages */}
              <Route path="/auth/*" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* admin routes */}
              <Route path="app" element={<PrivateRoute element={<Home />} />} />
              <Route path="app/ratings" element={<PrivateRoute element={<AdminRatings />} />} />
              <Route path="app/availabletrucks" element={<PrivateRoute element={<Availabletrucks />} />} />
              <Route path="app/myloads" element={
                <PrivateRoute element={
                  <AppLayout>
                    <AdminMyLoads />
                  </AppLayout>
                } />
              } />
              <Route path="app/users" element={<PrivateRoute element={<UserManagement />} />} />
              <Route path="app/analytics" element={
                <PrivateRoute element={
                  <AppLayout>
                    <Analytics />
                  </AppLayout>
                } />
              } />
              <Route path="app/services" element={<PrivateRoute element={<Services />} />} />
              <Route path="app/adminprofile" element={<PrivateRoute element={<AdminProfile />} />} />

              {/* client routes */}
              <Route path="client" element={<PrivateRoute element={<ClientHome />} />} />
              <Route path="client/truckers" element={<PrivateRoute element={<AvailableTrucks />} />} />
              {/* <Route path="client/myloads" element={<PrivateRoute element={<ClientMyLoads />} />} /> */}
              <Route path="client/trackload" element={<PrivateRoute element={<ClientTrackLoad />} />} />
              <Route path="client/settings" element={<PrivateRoute element={<ClientSettings />} />} />
              <Route path="client/clientProfile" element={<PrivateRoute element={<ClientProfile />} />} />

              {/* trucker routes */}
              <Route path="trucker" element={<PrivateRoute element={<TruckerHome />} />} />
              <Route path="trucker/trucks" element={<PrivateRoute element={<Trucks />} />} />
              <Route path="trucker/services" element={<PrivateRoute element={<TruckersServices />} />} /> 
              <Route path="trucker/settings" element={<PrivateRoute element={<TruckerSettings />} />} />
              <Route path="trucker/truckerProfile" element={<PrivateRoute element={<TruckerProfile />} />} />

              {/* service provider routes */}
              <Route path="service" element={<PrivateRoute element={<ServiceProviderHome />} />} />
              <Route path="service/myservices" element={<PrivateRoute element={<MyServices />} />} />
              <Route path="service/trackservice" element={<PrivateRoute element={<TrackService />} />} />
              <Route path="service/services" element={<PrivateRoute element={<Services />} />} />
              <Route path="service/settings" element={<PrivateRoute element={<ServiceSettings />} />} />
              <Route path="/service-details/:id" element={<PrivateRoute element={<ServiceDetails />} />} />
              <Route path="/client/:id" element={<PrivateRoute element={<ClientDetails />} />} />
              <Route path="service/serviceRequests" element={<PrivateRoute element={<ServiceRequests />} />} />
              {/* not found page */}
              <Route path='*' element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
        </TruckProvider>
      </ThemeProvider>
    </DarkModeProvider>
  );
}

export default App;
