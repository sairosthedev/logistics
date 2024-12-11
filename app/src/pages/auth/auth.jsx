import { create } from 'zustand'
import axios from 'axios'
import { BACKEND_Local } from '../../../url.js'

// Define a store using Zustand for managing authentication state
const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('authToken') || null,
    clientID: localStorage.getItem('clientID') || null,
    accountType: localStorage.getItem('accountType') || null,

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

    loginUser: async (email, password, accountType) => {
        try {
            const response = await axios.post(`${BACKEND_Local}/api/auth/login`, {
                email,
                password,
                accountType,
            });

            if (response.status !== 200) {
                return { type: "error", message: response.data };
            }

            const { token, userId: clientID, accountType: userAccountType } = response.data;
            
            // Store everything in localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('clientID', clientID);
            localStorage.setItem('accountType', userAccountType);
            localStorage.setItem('user', JSON.stringify({
                clientID,
                accountType: userAccountType
            }));

            // Update the store
            set({ 
                accessToken: token, 
                clientID, 
                accountType: userAccountType,
                isAuthenticated: true,
                user: {
                    clientID,
                    accountType: userAccountType
                }
            });

            return { type: "success", message: "Success", data: response.data };
        } catch (error) {
            console.error('Login error:', error);
            return { type: "error", message: "An error occurred during login." };
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
