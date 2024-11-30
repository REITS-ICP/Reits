import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/REIT1.png";
import { motion } from 'framer-motion';

interface NavbarProps {
  onLogin: () => void;
  loggedIn: boolean;
  onLogout: () => void;
  isLoading: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onLogin, loggedIn, onLogout, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const renderAuthButton = () => {
    if (loggedIn) {
      return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-md transition-colors duration-300 border-2 border-yellow-500 hover:border-yellow-400"
        >
          Logout
        </motion.button>
      );
    }

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onLogin}
        disabled={isLoading}
        className={`bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-md transition-colors duration-300 border-2 border-yellow-500 hover:border-yellow-400 flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </>
        ) : (
          'Login'
        )}
      </motion.button>
    );
  };

  return (
    <nav className="bg-black text-yellow-500 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center relative">
        <div className="flex items-center">
          <img src={Logo} alt="REIT Logo" className="h-20 w-auto" />
        </div>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-yellow-500 focus:outline-none hover:text-yellow-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
        <ul className="hidden md:flex flex-grow justify-center space-x-10 items-center">
          <li>
            <Link to="/" className="hover:text-yellow-400 transition-colors duration-300">
              Home
            </Link>
          </li>
          <li>
            <Link to="/features" className="hover:text-yellow-400 transition-colors duration-300">
              Features
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="hover:text-yellow-400 transition-colors duration-300">
              Dashboard
            </Link>
          </li>
        </ul>
        
        <div className="hidden md:flex items-center space-x-4">
          {renderAuthButton()}
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black border-t border-yellow-500/20">
          <ul className="flex flex-col space-y-4 mt-4">
            <li>
              <Link to="/" className="hover:text-yellow-400 transition-colors block px-4 py-2">
                Home
              </Link>
            </li>
            <li>
              <Link to="/features" className="hover:text-yellow-400 transition-colors block px-4 py-2">
                Features
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-yellow-400 transition-colors block px-4 py-2">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      )}

      {!loggedIn && (
        <div className="flex justify-center mt-4 md:hidden">
          {renderAuthButton()}
        </div>
      )}
    </nav>
  );
};

export default Navbar;