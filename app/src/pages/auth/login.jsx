import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import mainLogo from './../../assets/images/logos/mainLogo.png'
import backgroundImage from './../../assets/images/bg.jpg'
import useAuthStore from './auth'; // Ensure this path is correct
import { ClipLoader } from 'react-spinners'; // Import a loading spinner

function Login() {
    const [accountType, setAccountType] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false); // State to manage loading
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const { loginUser, setAuth } = useAuthStore(); // Get the loginUser function from the store

    useEffect(() => {
        const successMessage = localStorage.getItem('passwordUpdateSuccess');
        if (successMessage) {
            setSuccessMessage(successMessage); // Assuming you have a success message state
            localStorage.removeItem('passwordUpdateSuccess');
        }
    }, []);

    const handleAccountTypeChange = (event) => {
        setAccountType(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = { email, password };

        if (!email || !password) {
            setErrorMessage('Please fill in all fields.');
            setShowModal(true);
            return;
        }

        setLoading(true); // Start loading animation

        try {
            const response = await loginUser(payload.email, payload.password); // Use loginUser from the store with payload
            if (response.type === "error") {
                setErrorMessage(response.message);
                setShowModal(true);
            } else {
               
                // Handle successful login
                switch (response.data.accountType) {
                    case 'admin':
                        navigate('/app');
                        break;
                    case 'client':
                        navigate('/client');
                        break;
                    case 'trucker':
                        navigate('/trucker');
                        break;
                    case 'service':
                        navigate('/service');
                        break;
                    default:
                        setErrorMessage('Invalid account type selected.');
                        setShowModal(true);
                        break;
                }
            }
        } catch (error) {
            setErrorMessage('Error during login: ' + error.message);
            setShowModal(true);
        } finally {
            setLoading(false); // Stop loading animation
        }
    };

    
    return (
        <section className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="w-fit h-fit">
                <div className='lg:w-[70vh] md:w-[50vh] w-[30vh] xl:w-[70vh] 2xl:w-[70vh]'></div>
                <div className="bg-white p-2 rounded-xl shadow-2xl">
                    <div className="text-center">
                        <img className="w-auto h-24 mx-auto mb-1" src={mainLogo} alt="Main Logo" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Truck-Stop</h2>
                        <p className="text-gray-600 mb-3">Sign in to your account</p>
                    </div>

                    <div className="space-y-3">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-3 p-5 ">
                                <div>
                                    <label htmlFor="text" className="block text-sm font-medium text-gray-700">Email Address or Phone Number</label>
                                    <input 
                                        type="text" 
                                        name="email" 
                                        id="email" 
                                        placeholder="Enter email or phone number" 
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                                        required 
                                        aria-label="Email Address" 
                                        onChange={(e) => setEmail(e.target.value)} 
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        id="password" 
                                        placeholder="Enter your password" 
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                                        required 
                                        aria-label="Password" 
                                        onChange={(e) => setPassword(e.target.value)} 
                                    />
                                </div>

                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            name="remember-password" 
                                            id="remember-password" 
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
                                        />
                                        <label htmlFor="remember-password" className="ml-2 block text-sm text-gray-700">
                                            Remember me
                                        </label>
                                    </div>
                                    <Link 
                                        to="/forgot-password" 
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Sign in'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mb-2 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Sign up now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
                    <div className="bg-white p-6 rounded-lg shadow-lg z-10">
                        <h2 className="text-lg font-bold mb-4">Error</h2>
                        <p className="text-sm text-gray-500">
                            {errorMessage || 'This feature is not yet available for the selected account type.'}
                        </p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-black hover:bg-gray-900 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Login;