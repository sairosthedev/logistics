import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import mainLogo from './../../assets/images/logos/mainLogo.png';
import backgroundImage from './../../assets/images/bg.jpg';
import { BACKEND_Local } from '../../../url.js'; // Import the BACKEND_Local

function Signup() {
    const [accountType, setAccountType] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false); // New loading state
    const navigate = useNavigate();

    const handleAccountTypeChange = (event) => {
        setAccountType(event.target.value);
    };

    const handleTermsChange = (event) => {
        setTermsAccepted(event.target.checked);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage(''); // Reset error message
        setLoading(true); // Start loading

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            setLoading(false); // Stop loading
            return;
        }

        if (!termsAccepted) {
            setErrorMessage('You must accept the terms and conditions');
            setLoading(false); // Stop loading
            return;
        }

        const payload = {
            firstName,
            lastName,
            email,
            phone,
            password,
            accountType
        };

        try {
            const response = await fetch(`${BACKEND_Local}/api/${accountType}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                console.log('Signup successful');
                // Redirect based on account type
                switch (accountType) {
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
                        navigate('/login');
                        break;
                }
            } else {
                const errorData = await response.json();
                setErrorMessage(`Signup failed: ${errorData.message}`);
            }
        } catch (error) {
            setErrorMessage('Error during signup: ' + error.message);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="px-4 md:h-fit h-4/5 relative xl:h-fit 2xl:h-fit w-fit">
                <div className="bg-white px-8  rounded-2xl shadow-2xl backdrop-filter backdrop-blur-lg border border-gray-200">
                    <div className="text-center mb-8">
                        <img className="w-auto h-24 sm:h-16 md:h-24 mx-auto" src={mainLogo} alt="Main Logo" />
                        <h1 className="text-2xl sm:text-lg md:text-2xl font-extrabold text-gray-900">Join Truck-Stop</h1>
                        <p className="text-lg sm:text-base md:text-lg text-gray-600">Create your account and start your journey</p>
                    </div>

                    {errorMessage && <div className="mb-2 text-red-600 text-center">{errorMessage}</div>}
                    {loading && <div className="mb-2 text-blue-600 text-center">Loading...</div>} {/* Loading animation */}

                    <form onSubmit={handleSubmit} className="">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-2 sm:gap-y-1">
                            <div>
                                <label htmlFor="firstName" className="block text-sm sm:text-xs md:text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input type="text" name="firstName" id="firstName" placeholder="John" className="block w-full px-4 py-1 sm:px-2 sm:py-0.5 md:px-4 md:py-1 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out" required aria-label="First Name" onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm sm:text-xs md:text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input type="text" name="lastName" id="lastName" placeholder="Doe" className="block w-full px-4 py-1 sm:px-2 sm:py-0.5 md:px-4 md:py-1 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out" required aria-label="Last Name" onChange={(e) => setLastName(e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="email" className="block text-sm sm:text-xs md:text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" name="email" id="email" placeholder="you@example.com" className="block w-full px-4 py-1 sm:px-2 sm:py-0.5 md:px-4 md:py-1 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out" required aria-label="Email Address" onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="phone" className="block text-sm sm:text-xs md:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input type="text" name="phone" id="phone" placeholder="123-456-7890" className="block w-full px-4 py-1 sm:px-2 sm:py-0.5 md:px-4 md:py-1 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out" required aria-label="Phone Number" onChange={(e) => setPhone(e.target.value)} />
                            </div>


                            <div>
                                <label htmlFor="password" className="block text-sm sm:text-xs md:text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input type="password" name="password" id="password" placeholder="Enter your password" className="block w-full px-4 py-1 sm:px-2 sm:py-0.5 md:px-4 md:py-1 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out" required aria-label="Password" onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm sm:text-xs md:text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm your password" className="block w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out" required aria-label="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="account-type" className="block text-sm sm:text-xs md:text-sm font-medium text-gray-700 mb-1">Account Type</label>
                                <select id="account-type" name="account-type" className="block w-full px-4 py-1 sm:px-2 sm:py-0.5 md:px-4 md:py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out" onChange={handleAccountTypeChange} value={accountType} required aria-label="Account Type">
                                    <option value="" disabled hidden>Select Role</option>
                                    <option value="trucker">Trucker</option>
                                    <option value="client">Client</option>
                                    <option value="service">Service Provider</option>
                                </select>
                                </div>
                        </div>

                        <div className="flex items-center mt-2 sm:mt-0.5 md:mt-2">
                            <input type="checkbox" name="terms" id="terms" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" required onChange={handleTermsChange} />
                            <label htmlFor="terms" className="ml-2 block text-sm sm:text-xs md:text-sm text-gray-700">
                                I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">Terms and Conditions</a>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-1 px-4 mt-2 sm:mt-0.5 md:mt-2 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105"
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? 'Creating Account...' : 'Create Account'} {/* Change button text based on loading state */}
                        </button>
                    </form>

                    <div className="mt-1 text-center mb-3 sm:mb-1.5 md:mb-3">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Signup;