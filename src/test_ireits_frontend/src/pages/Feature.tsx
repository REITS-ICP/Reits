'use client'

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "../assets/REIT2.jpg"
import background from "../assets/REIT2.jpg"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import coreItem1 from "../assets/REIT10.jpeg"
import coreItem2 from "../assets/REIT11.jpeg"
import coreItem3 from "../assets/REIT12.jpeg"
import { test_ireits_backend } from "../utils/test_ireits_backend"
import countries from "world-countries"

interface Property {
  price: number;
  location: string;
  description?: string;
}

export default function Features() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [price, setPrice] = useState('');
  const [selectedCountry, setSelectedCountry] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPrice(value);
    console.log('Selected value:', value);
  };

  const testBackend = async () => {
    try {
      const response = await test_ireits_backend.get_all_properties();
      console.log("All properties are: ", response);
      
      if (response && Array.isArray(response)) {
        response.forEach((property, index) => {
          console.log(`Property ${index + 1}:`, property);
        });
      } else {
        console.log("Unexpected response format:", response);
      }

      setProperties(response);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  useEffect(() => {
    testBackend();
  }, []); 

  return (
    <section className="w-full bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img
          src={background}
          alt="Modern luxury house exterior"
          // layout="fill"
          // objectFit="cover"
          // quality={100}
        />
        <div className="absolute inset-0 bg-black/50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="px-4 py-20 max-w-7xl mx-auto"
          >
            <p className="text-gold mb-4">Explore a wide range of properties that suits you</p>
            <h1 className="text-white text-5xl font-bold max-w-2xl mb-12">
              Investment convenience meet seamless search.
            </h1>
            
            {/* Search Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gray-900 p-4 rounded-lg flex gap-4 max-w-4xl w-full"
            >
              <Select value={price} onValueChange={setPrice}>
                <SelectTrigger className="w-[200px] bg-black text-gold border-gold">
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent className="bg-black text-gold">
                  <SelectItem value="million">0 - 1M</SelectItem>
                  <SelectItem value="t-million">1M - 10M</SelectItem>
                  <SelectItem value="a-million">Above 10M</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="Description">
                <SelectTrigger className="w-[200px] bg-black text-gold border-gold">
                  <SelectValue placeholder="Description" />
                </SelectTrigger>
                <SelectContent className="bg-black text-gold">
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="mortage">Residential</SelectItem>
                  <SelectItem value="business">Commercial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-[200px] bg-black text-gold border-gold">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="bg-black text-gold">
                  {countries.map((country) => (
                    <SelectItem key={country.cca3} value={country.name.common}>
                      {country.name.common}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="px-8 bg-gold text-black hover:bg-white hover:text-black transition-colors">Search for Property</Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Content */}
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-4xl font-bold mb-6 text-gold">
              Experience Unparalleled Property Search with REIT gate
            </h2>
          </div>
          <div>
            <p className="text-white">
              At REIT Gate, we believe finding your perfect property should be easy and exciting. 
              Founded to transform the property buying experience, we simplify the property search 
              process with advanced technology and a team of experts. Our mission is to provide 
              unparalleled convenience and personalized service, making every step towards your 
              dream home effortless.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-3 gap-8 my-16"
        >
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2 text-gold">300k</h3>
            <p className="text-white">Available properties</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2 text-gold">90k</h3>
            <p className="text-white">Sold properties</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-2 text-gold">90k</h3>
            <p className="text-white">Listed properties</p>
          </div>
        </motion.div>

        {/* Property Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative h-[300px] rounded-lg overflow-hidden"
          >
            <img
              src={coreItem1}
              alt="Modern house with artistic entrance"
              // layout="fill"
              // objectFit="cover"
              className="transition-transform duration-300"
            />
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative h-[300px] rounded-lg overflow-hidden"
          >
            <img
              src={coreItem2}
              alt="Luxury modern house with steps"
              // layout="fill"
              // objectFit="cover"
              className="transition-transform duration-300"
            />
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative h-[300px] rounded-lg overflow-hidden"
          >
            <img
              src={coreItem3}
              alt="Contemporary house design"
              // layout="fill"
              // objectFit="cover"
              className="transition-transform duration-300"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

