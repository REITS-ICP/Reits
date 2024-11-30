import React from 'react';
import { motion } from 'framer-motion';
import Logo from "../assets/REIT1.jpg";
import Particles from "react-tsparticles";
import type { ISourceOptions } from "tsparticles-engine";
import { CardContainer, CardBody, CardItem } from '../components/ui/3d-card'; 

const HeroSection = () => {
  const particlesOptions: ISourceOptions = {
    background: {
      color: {
        value: "#4B0082",
      },
    },
    fpsLimit: 60,
    interactivity: {
      detectsOn: "canvas",
      events: {
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        bubble: {
          distance: 400,
          duration: 2,
          opacity: 0.8,
          size: 40,
        },
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 200,
        },
      },
    },
    particles: {
      color: {
        value: "#FFA500",
      },
      links: {
        color: "#FFFAFA",
        distance: 150,
        enable: true,
        opacity: 0.4,
        width: 1,
      },
      collisions: {
        enable: true,
      },
      move: {
        direction: "none",
        enable: true,
        outMode: "bounce",
        random: false,
        speed: 6,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        random: true,
        value: 5,
      },
    },
    detectRetina: true,
  };

  return (
    <div className="bg-poultry-dark text-white p-4 relative overflow-hidden"> 
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 z-10">
        <div className="text-left">
          <h1 className="text-4xl font-bold text-poultry-orange">PropVest Dapp</h1>
          <p className="mt-3 text-whitesmoke text-xl">
          PropVest Dapp enables users to invest in fractionalized, income-generating real estate through tokenization on the ICP blockchain.
          </p>
          <p className="mt-3 text-whitesmoke text-xl">It streamlines real estate investment, offering liquidity, transparency, and accessibility.</p>
          <h2 className="mt-4 text-2xl font-bold text-poultry-orange">BRIEF</h2>
          <p className="mt-2 text-whitesmoke">
          Investors can buy, sell, and manage property-backed tokens, track their portfolio, and receive dividends from rental profits.</p>
        </div>
        <motion.img
          src={Logo}
          alt="Rental Logo"
          className="w-full md:w-1/2 h-auto rounded-lg shadow-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
      </div>

     {/* 3D Cards Section */}
     {/*  */}
    </div>
  );
};

export default HeroSection;