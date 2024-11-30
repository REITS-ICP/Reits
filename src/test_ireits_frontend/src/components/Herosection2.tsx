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
      {/* <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 z-10">
        <div className="text-left">
          <h1 className="text-4xl font-bold text-poultry-orange">POULTRY FARMING DAPP</h1>
          <p className="mt-3 text-whitesmoke text-xl">
           This poultry farming management system using the azle library to interact with the Internet Computer (ICP). It sets up data structures and operations for managing poultry records, including broilers, layers, and eggs. Each poultry type (broiler, layer, and egg) has its respective record and payload schemas.</p>
          <h2 className="mt-4 text-2xl font-bold text-poultry-orange">BRIEF</h2>
          <p className="mt-2 text-whitesmoke">
           The system uses StableBTreeMap to ensure data persistence and leverages the Principal type for generating unique identifiers. Key operations include tracking the age, breed, availability, and sales of poultry, as well as managing detailed records that can be accessed via NFC tags for transparency and customer engagement.</p>
        </div>
        <motion.img
          src={Logo}
          alt="poultry Logo"
          className="w-full md:w-1/2 h-auto rounded-lg shadow-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
      </div> */}

     {/* 3D Cards Section */}
     <div className="mt-10">
        <h2 className="text-3xl font-bold text-center text-poultry-orange">About IREITs Platform</h2>
        <CardContainer containerClassName="mt-10">
           <CardBody>
            <CardItem translateX={20} translateY={20} translateZ={50} rotateX={20} rotateY={20} rotateZ={0}>
              <h3 className="text-xl font-bold text-poultry-orange">Features</h3>
              <ul className="text-white mt-2">
                <ol>PoultryRecord: This structure holds general information about poultry, including createdAt, typeOfPoultry, age_weeks, feedType, vaccination_weeks, and nfcTagId.</ol>
                <ol>Broiler: This structure is specific to broilers and includes fields like id, age_weeks, numberOfBroilers, breed, createdAt, available, and sold.</ol>
                <ol>Layer: This structure is specific to layers and includes fields like id, age_weeks, numberOfLayers, breed, createdAt, available, and sold.</ol>
                <ol>Egg: This structure holds information about eggs, including id, breed, createdAt, available, sold, laidEggs, and damagedEggs.</ol>
              </ul>
            </CardItem>
          </CardBody>
          <CardBody>
            <CardItem translateX={10} translateY={10} translateZ={30} rotateX={10} rotateY={10} rotateZ={0}>
              <h3 className="text-xl font-bold text-poultry-orange">Databases</h3>
              <ul className="text-white mt-2">
                <ol>PoultryRecords: A StableBTreeMap that stores general poultry records, making it possible to retrieve and update poultry information efficiently.</ol>
                <ol>Broilers: A StableBTreeMap that stores broiler records, managing data related to broiler chickens.</ol>
                <ol>Layers: A StableBTreeMap that stores layer records, managing data related to layer chickens.</ol>
                <ol>Eggs: A StableBTreeMap that stores egg records, managing data related to egg production and sales.</ol>
              </ul>
            </CardItem>
          </CardBody>
          <CardBody>
            <CardItem translateX={10} translateY={10} translateZ={30} rotateX={10} rotateY={10} rotateZ={0}>
              <h3 className="text-xl font-bold text-poultry-orange border-poultry-orange">CRUD Functions</h3>
              <ul className="text-white mt-2">
                <ol>createPoultryRecord: Creates a new poultry record with specified details.</ol>
                <ol>createBroilers: Creates new broiler records.</ol>
                <ol>enterSoldBroilers: Updates broiler records to reflect sales.</ol>
                <ol>getAllBroilers: Retrieves all broiler records.</ol>
                <ol>enterLaidEggs: Adds laid eggs to the records.</ol>
                <ol>enterSoldEggs: Updates records with sold eggs.</ol>
                <ol>enterDamagedEggs: Updates records with damaged eggs.</ol>
                <ol>getAllEggs: Retrieves all egg records.</ol>
              </ul>
            </CardItem>
          </CardBody>
        </CardContainer>
      </div>
    </div>
  );
};

export default HeroSection;