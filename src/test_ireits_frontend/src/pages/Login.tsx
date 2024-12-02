// src/pages/Login.jsx

import React from 'react';

interface LoginPageProps {
  onLogin: () => void; // Function to handle login
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-800"> {/* Background color matches Navbar */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        
        {/* Button to login with Internet Identity */}
        <button
          onClick={onLogin}
          className="bg-blue-500 text-white py-2 px-4 rounded mb-4 w-full"
        >
          Login with Internet Identity
        </button>
        
        {/* Divider for alternative login options */}
        <div className="flex items-center justify-between mb-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-600">or</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        {/* Button to login with Google */}
        <button
          onClick={() => console.log('Login with Google')} // Replace with your Google login logic
          className="bg-red-500 text-white py-2 px-4 rounded mb-4 w-full"
        >
          Login with Google
        </button>

        {/* Button to login with Apple */}
        <button
          onClick={() => console.log('Login with Apple')} // Replace with your Apple login logic
          className="bg-black text-white py-2 px-4 rounded mb-4 w-full"
        >
          Login with Apple
        </button>
      </div>
    </div>
  );
};

export default LoginPage;