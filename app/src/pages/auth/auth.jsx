import { create } from 'zustand'
import axios from 'axios'
import { BACKEND_Local } from '../../../url.js'
import Cookies from 'js-cookie'

// Define a store using Zustand for managing authentication state
const useAuthStore = create((set, get) => ({
    user: null,  // Initially, no user is logged in
    accessToken: null, // Do not retrieve the access token from cookies on page reload
    clientID: null, // Initially, no client ID is stored
    accountType: null, // Initially, no account type is stored

    // Asynchronous function to handle user login
    loginUser: async (email, password, accountType) => {
        try {
            // Attempt to login by sending a POST request to the server
            const response = await axios.post(`${BACKEND_Local}/api/auth/login`, {
                email,
                password,
                accountType,
            })
            // Handle response based on status code
            if (response.status !== 200) {
                return { type: "error", message: response.data };
            } else {
                const token = response.data.token;
                const clientID = response.data.userId; // Change userId to clientID
                const accountType = response.data.accountType; // Get account type from response
                // Store the token, clientID, and accountType in cookies
                Cookies.set('userAuthToken', token);
                Cookies.set('clientID', clientID);
                Cookies.set('accountType', accountType);
                // Update the store with the token, clientID, accountType and set isAuthenticated to true
                set({ isAuthenticated: true, accessToken: token, clientID: clientID, accountType: accountType });
                // Console log id and token
                console.log('Client ID:', clientID);
                console.log('Token:', token);
                console.log('Account Type:', accountType);
                return { type: "success", message: "Success", data: response.data };
            }
        } catch (error) {
            if (error.response) {
                // Server responded with a status other than 2xx
                console.error('Error response:', error.response.data);
            } else if (error.request) {
                // Request was made but no response received
                console.error('Error request:', error.request);
            } else {
                // Something else happened
                console.error('Error message:', error.message);
            }
            return { type: "error", message: "An error occurred during login." };
        }
    },

    // Function to handle user logout
    logoutUser: () => {
        // Clear the token, clientId, and accountType from cookies
        Cookies.remove('userAuthToken');
        Cookies.remove('clientID');
        Cookies.remove('accountType');
        // Reset the user, accessToken, clientID, accountType, and isAuthenticated flag in the store
        set({ user: null, accessToken: null, clientID: null, accountType: null, isAuthenticated: false })
    },
}))

// Export the useAuthStore hook for use in other parts of the application
export default useAuthStore
