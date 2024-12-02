import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/REIT1.png";
import { motion } from 'framer-motion';

interface NavbarProps {
  onLogin: () => void;
  loggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogin, loggedIn, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
          {/* <li>
            <Link to="/about" className="hover:text-yellow-400 transition-colors duration-300">
              About
            </Link>
          </li> */}
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
          {loggedIn ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-md transition-colors duration-300 border-2 border-yellow-500 hover:border-yellow-400"
            >
              Logout
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogin}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-md transition-colors duration-300 border-2 border-yellow-500 hover:border-yellow-400"
            >
              Login
            </motion.button>
          )}
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
            {/* <li>
              <Link to="/about" className="hover:text-yellow-400 transition-colors block px-4 py-2">
                About
              </Link>
            </li> */}
            <li>
              <Link to="/features" className="hover:text-yellow-400 transition-colors block px-4 py-2">
                Features
              </Link>
            </li>
            <li>
              <Link to="/get-started" className="hover:text-yellow-400 transition-colors block px-4 py-2">
                Get Started
              </Link>
            </li>

            
          </ul>
        </div>
      )}

      <div className="flex justify-center mt-4 md:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogin}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-md transition-colors duration-300 border-2 border-yellow-500 hover:border-yellow-400"
        >
          Welcome Investor
        </motion.button>
      </div>
    </nav>
  );
};

export default Navbar;