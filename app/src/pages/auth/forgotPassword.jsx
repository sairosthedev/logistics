import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import mainLogo from './../../assets/images/logos/mainLogo.png';
import backgroundImage from './../../assets/images/bg.jpg';
import { BACKEND_Local } from '../../../url.js';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP
    const [stage, setStage] = useState('email'); // 'email' or 'otp'
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setLoading(true);
    
        try {
            const response = await fetch(`${BACKEND_Local}/api/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
    
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }
    
            if (response.ok) {
                setStage('otp');
            } else {
                const errorData = await response.json();
                setErrorMessage(`Error: ${errorData.message}`);
            }
        } catch (error) {
            setErrorMessage('Server error. Please try again later.');
            console.error('Detailed error:', error);
        } finally {
            setLoading(false);
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

        // Validate password match
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            setLoading(false);
            return;
        }

        const otpCode = otp.join('');

        try {
            const response = await fetch(`${BACKEND_Local}/api/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    otp: otpCode,
                    newPassword: password 
                }),
            });

            if (response.ok) {
                // Password reset successful
                navigate('/', { 
                    state: { 
                        message: 'Password reset successfully. Please log in.' 
                    } 
                });
            } else {
                const errorData = await response.json();
                setErrorMessage(`Error: ${errorData.message}`);
            }
        } catch (error) {
            setErrorMessage('Error resetting password: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="px-4 md:h-fit h-4/5 relative xl:h-fit 2xl:h-fit w-fit">
                <div className="bg-white px-8 rounded-2xl shadow-2xl backdrop-filter backdrop-blur-lg border border-gray-200">
                    <div className="text-center mb-8">
                        <img className="w-auto h-24 sm:h-16 md:h-24 mx-auto" src={mainLogo} alt="Main Logo" />
                        <h1 className="text-2xl sm:text-lg md:text-2xl font-extrabold text-gray-900">
                            {stage === 'email' ? 'Forgot Password' : 'Reset Password'}
                        </h1>
                        <p className="text-lg sm:text-base md:text-lg text-gray-600">
                            {stage === 'email' 
                                ? 'Enter your email to reset your password' 
                                : 'Enter the OTP and set a new password'}
                        </p>
                    </div>

                    {errorMessage && <div className="mb-2 text-red-600 text-center">{errorMessage}</div>}
                    {loading && <div className="mb-2 text-blue-600 text-center">Loading...</div>}

                    {stage === 'email' ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    id="email"
                                    placeholder="you@example.com"
                                    className="block w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full flex justify-center py-1 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105"
                                disabled={loading}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="flex justify-between mt-4 space-x-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength="1"
                                        placeholder="0"
                                        className="w-1/6 px-4 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        required
                                    />
                                ))}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <input 
                                    type="password" 
                                    id="password"
                                    placeholder="••••••••"
                                    className="block w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password
                                </label>
                                <input 
                                    type="password" 
                                    id="confirm-password"
                                    placeholder="••••••••"
                                    className="block w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full flex justify-center py-1 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105"
                                disabled={loading}
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <div className="mt-4 text-center mb-3">
                        <p className="text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ForgotPassword;