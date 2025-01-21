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
    const [passwordError, setPasswordError] = useState(''); // New state for password error
    const [loading, setLoading] = useState(false); // New loading state
    const [successMessage, setSuccessMessage] = useState(''); // New success message state
    const navigate = useNavigate(); 
    const [stage, setStage] = useState("signup");//verify otp
     const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP

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

        if (password.length < 8) {
            setErrorMessage('Password should have a min of 8 characters');
            setLoading(false);
            return;
        }

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

      

        try {
            const response = await fetch(`${BACKEND_Local}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phone,
                    password,
                    accountType
                }),
            });

            if (response.ok) {
                const otpresponse = await fetch(`${BACKEND_Local}/api/send-email/user/verification`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ email }),
                            });
                if (otpresponse.ok) {
                setStage('otp');
                setSuccessMessage('Account created successfully. Please verify your email address.');
                }
                else {
                    const errorData = await otpresponse.json();
                    setErrorMessage(`Error: ${errorData.message}`);
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

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (newPassword.length > 0 && newPassword.length < 8) {
            setPasswordError('Password should have a min of 8 characters');
        } else {
            setPasswordError('');
        }
    };

        
        const handleOtpChange = (index, value) => {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
    
            // Auto-focus next input if value is entered
            if (value && index < 5) {
                document.getElementById(`otp-${index + 1}`).focus();
            }
        };
    
        const handleVerifyOtp = async (event) => {
            event.preventDefault();
            setErrorMessage('');
            setLoading(true);
            
    
            const otpCode = otp.join('');
    
            try {
                const response = await fetch(`${BACKEND_Local}/api/auth/submitOtp`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        email, 
                        otp: otpCode 
                    }),
                });

                if (response.ok) {
                    // OTP verification successful, show success message
                    const response1 = await fetch(`${BACKEND_Local}/api/auth/verifyUser`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            email, 
                            status: "verified" 
                        }),
                    });
                    console.log(response1);
                    if (response1.ok) {
                    setTimeout(() => {
                        navigate('/');
                    }, 3000);
                }
                    setSuccessMessage('OTP verified successfully. Go signin to your account.');
                 
                } else {
                    const errorData = await response.json();
                    setErrorMessage(`Error: ${errorData.message}`);
                }

               
            } catch (error) {
                setErrorMessage('Error verifying OTP: ' + error.message);
            } finally {
                setLoading(false);
            }

            
        };
    

    return (
        <section className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
            {stage==="signup" && <div className="px-4 md:h-fit h-4/5 relative xl:h-fit 2xl:h-fit w-fit">
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
                                <input 
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    placeholder="Enter your password" 
                                    className="block w-full px-4 py-1 sm:px-2 sm:py-0.5 md:px-4 md:py-1 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out" 
                                    required 
                                    aria-label="Password" 
                                    minLength="8" 
                                    onChange={handlePasswordChange}
                                    title="Password should have a min of 8 characters"
                                />
                                {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm sm:text-xs md:text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input 
                                    type="password" 
                                    name="confirmPassword" 
                                    id="confirmPassword" 
                                    placeholder="Confirm your password" 
                                    className="block w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out" 
                                    required 
                                    aria-label="Confirm Password" 
                                    minLength="8" 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    title="Password should have a min of 8 characters"
                                />
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
                                Tick to accept{' Account Creation'}
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
}

{stage === 'otp' && ( <div className="px-4 md:h-fit h-4/5 relative xl:h-fit 2xl:h-fit w-fit bg-white p-8 rounded-2xl shadow-2xl backdrop-filter backdrop-blur-lg border border-gray-200">
    <div className="text-center mb-8">
                        <img className="w-auto h-24 sm:h-16 md:h-24 mx-auto" src={mainLogo} alt="Main Logo" />
                        <h1 className="text-2xl sm:text-lg md:text-2xl font-extrabold text-gray-900">Join Truck-Stop</h1>
                        <p className="text-lg sm:text-base md:text-lg text-gray-600">Enter an OTP that was sent to your email</p>
                    </div>

                    {errorMessage && <div className="mb-2 text-red-600 text-center">{errorMessage}</div>}
                    {loading && <div className="mb-2 text-blue-600 text-center">Loading...</div>} {/* Loading animation */}

                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="flex justify-center mt-4 space-x-1">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength="1"
                                        placeholder="0"
                                        className="w-10 h-10 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        required
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                className="w-full flex justify-center py-1 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105"
                                disabled={loading}
                            >
                                {loading ? 'Verifying OTP...' : 'Verify OTP'}
                            </button>
                        </form>
                        </div>
                    )}


        </section>
    )
}

export default Signup;