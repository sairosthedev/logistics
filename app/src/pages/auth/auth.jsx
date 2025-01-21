import { create } from 'zustand';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';

// Define a store using Zustand for managing authentication state
const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('authToken') || null,
    clientID: localStorage.getItem('clientID') || null,
    accountType: localStorage.getItem('accountType') || null,
    isAuthenticated: !!localStorage.getItem('authToken'),

    setAuth: ({ token, user, clientID, accountType }) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('clientID', clientID);
        localStorage.setItem('accountType', accountType);

        set({
            accessToken: token,
            user,
            clientID,
            accountType,
            isAuthenticated: true
        });
    },

    loginUser: async (email, password) => {
        try {
            const response = await axios.post(`${BACKEND_Local}/api/auth/login`, {
                email,
                password,
            });
            console.log(response.message);

            if (response.status !== 200) {
                return { type: "error", message: response.data.message || "Login failed. Please try again." };
            }

            const { token, userId: clientID,user , accountType} = response.data;
            
            // Store everything in localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('clientID', clientID);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accountType', accountType);

            // Update the store with all user details
            set({
                accessToken: token,
                clientID,
                accountType,
                isAuthenticated: true,
                user: user  // This will now contain all user details including firstName, lastName, email, etc.
            });

            return { type: "success", message: "Login successful.", data: response.data };
        } catch (error) {
            console.error('Login error:', error);

            if (error.response) {
                const { status, data } = error.response;
            
                // Handle specific error messages from the backend
                if (status === 401) {
                    if (data.message === "Email not found") {
                        return { type: "error", message: "The email address is incorrect. Please try again." };
                    }
                    if (data.message === "Invalid password") {
                        return { type: "error", message: "The password is incorrect. Please try again." };
                    }
                    return { type: "error", message: "Unauthorized. Please check your credentials." };
                }

                // Handle other HTTP status codes
                switch (status) {
                    case 400:
                        return { type: "error", message: data.message || "Invalid input. Please check your details." };
                    case 403:
                        return { type: "error", message: data.message || "Access denied. Please contact support." };
                    case 404:
                        return { type: "error", message: data.message || "Login endpoint not found. Please contact support." };
                    case 500:
                        return { type: "error", message: data.message || "Server error. Please try again later." };
                    default:
                        return { type: "error", message: data.message || "An unexpected error occurred during login." };
                }
            }

            // Generic fallback error
            return { type: "error", message: "Unable to connect to the server. Please try again later." };
        }
    },

    logoutUser: () => {
        // Clear all auth data from localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('clientID');
        localStorage.removeItem('accountType');

        // Reset the store
        set({
            user: null,
            accessToken: null,
            clientID: null,
            accountType: null,
            isAuthenticated: false
        });
    },
}));

// Export both as default and named export
export { useAuthStore };
export default useAuthStore;
