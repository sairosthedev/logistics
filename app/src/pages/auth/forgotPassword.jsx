import React, { useState } from 'react';

function ForgotPasswordModal({ isOpen, onClose }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // Array for 6 input boxes
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyOtp = async () => {
        setLoading(true);
        setMessage('');
        const otpCode = otp.join(''); // Join the array to form the complete OTP
        try {
            const response = await fetch('http://127.0.0.1:5001/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ otp: otpCode }),
            });

            if (response.ok) {
                setMessage('OTP verified successfully. You can now reset your password.');
                // Redirect or perform further actions here
            } else {
                const errorData = await response.json();
                setMessage(`Error: ${errorData.message}`);
            }
        } catch (error) {
            setMessage('Error verifying OTP: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
            <div className="bg-white p-6 rounded-lg shadow-lg z-10 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
                <p className="text-sm text-gray-700 mb-4 text-center">Enter the verification code sent to your email</p>
                <div className="flex justify-between mt-4 space-x-2"> {/* Added spacing between input boxes */}
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            placeholder="0"
                            className="w-1/6 px-4 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-gray-400"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                        />
                    ))}
                </div>
                <button
                    onClick={handleVerifyOtp}
                    className="w-full py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200 mt-4"
                    disabled={loading}
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                {message && <p className="text-red-500 mt-4 text-center">{message}</p>}
                <button
                    onClick={onClose}
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-gray-600 hover:bg-gray-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default ForgotPasswordModal;
