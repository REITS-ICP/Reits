import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import Logo from '../assets/REIT1.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Socials */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-orange-500 mb-2">Social Media</h2>
            <a 
              href="https://x.com/WinnyMuusi?t=YLpSpxZU0fDi5HyMl1ukwQ&s=09" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-gold hover:text-orange-500 transition-colors"
            >
              <FontAwesomeIcon icon={faTwitter} />
              <span>Twitter (X)</span>
            </a>
          </div>

          {/* Resources */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-orange-500 mb-2">Resources</h2>
            <ul className="space-y-1">
              <li>
                <Link to="https://chain.link/education-hub/real-world-assets-rwas-explained" className="text-gold hover:text-orange-500 transition-colors">
                  RWA Tokenization Manual
                </Link>
              </li>
              <li>
                <Link to="https://chain.link/use-cases/asset-tokenization" className="text-gold hover:text-orange-500 transition-colors">
                  Ask Expert
                </Link>
              </li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gold">
              All rights reserved by{" "}
              <span className="text-orange-500 font-bold">
                WINNY MUUSI
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

