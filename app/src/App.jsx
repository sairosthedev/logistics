import React from 'react';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import useAuthStore from './pages/auth/auth'

// import the pages
// landing pages

import NotFound from './pages/notFound'

// auth pages
import Login from './pages/auth/login'
import SignUp from './pages/auth/SignUp'

// admin pages
import Home from './pages/admin/home'
import Availabletrucks from './pages/admin/availabletrucks'
import AdminMyLoads from './pages/admin/myloads'
import Services from './pages/admin/services'
import Settings from './pages/admin/settings'
import UserManagement from './pages/admin/userManagement';
import Analytics from './pages/admin/Analytics';

// client pages
import ClientHome from './pages/client/home'
import AvailableTrucks from './pages/client/truckers'
import ClientMyLoads from './pages/client/myloads'
import ClientTrackLoad from './pages/client/trackload'
import ClientSettings from './pages/client/settings'

// trucker pages
import TruckerHome from './pages/trucker/home'
import Trucks from './pages/trucker/trucks'
import TruckerMyLoads from './pages/trucker/myloads'
//
import TruckersServices from './pages/trucker/services'
import TruckerSettings from './pages/trucker/settings'

// service provider pages
import ServiceProviderHome from './pages/serviceProvider/home'
import MyServices from './pages/serviceProvider/myservices'
import TrackService from './pages/serviceProvider/trackservice'
import ServiceServices from './pages/serviceProvider/settings'
import ServiceDetails from './pages/serviceProvider/servicedetails'
import ServiceSettings from './pages/serviceProvider/settings'; 
import ClientDetails from './pages/serviceProvider/clientdetails';
import ServiceRequests from './pages/serviceProvider/serviceRequests';

const theme = createTheme();

function App() {
  const { accessToken } = useAuthStore();

  const PrivateRoute = ({ element }) => {
    return accessToken ? element : <Navigate to="/" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* auth routes */}
            <Route path="/" element={<Login />} />

            {/* auth pages */}
            <Route path="/auth/*" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* admin routes */}
            <Route path="app" element={<PrivateRoute element={<Home />} />} />
            <Route path="app/availabletrucks" element={<PrivateRoute element={<Availabletrucks />} />} />
            <Route path="app/myloads" element={<PrivateRoute element={<AdminMyLoads />} />} />
            <Route path="app/users" element={<PrivateRoute element={<UserManagement />} />} />
            <Route path="app/analytics" element={<PrivateRoute element={<Analytics />} />} />
            <Route path="app/services" element={<PrivateRoute element={<Services />} />} />
            <Route path="app/settings" element={<PrivateRoute element={<Settings />} />} />

            {/* client routes */}
            <Route path="client" element={<PrivateRoute element={<ClientHome />} />} />
            <Route path="client/truckers" element={<PrivateRoute element={<AvailableTrucks />} />} />
            <Route path="client/myloads" element={<PrivateRoute element={<ClientMyLoads />} />} />
            <Route path="client/trackload" element={<PrivateRoute element={<ClientTrackLoad />} />} />
            <Route path="client/settings" element={<PrivateRoute element={<ClientSettings />} />} />

            {/* trucker routes */}
            <Route path="trucker" element={<PrivateRoute element={<TruckerHome />} />} />
            <Route path="trucker/trucks" element={<PrivateRoute element={<Trucks />} />} />
            <Route path="trucker/myloads" element={<PrivateRoute element={<TruckerMyLoads />} />} />
          
            <Route path="trucker/services" element={<PrivateRoute element={<TruckersServices />} />} /> 
            <Route path="trucker/settings" element={<PrivateRoute element={<TruckerSettings />} />} /> 

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
    </ThemeProvider>
  );
}

export default App;
