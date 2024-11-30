'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Home, Building, MapPin, type LucideIcon } from 'lucide-react';

type SearchItem = {
  icon: LucideIcon;
  text: string;
};

export default function DashboardPage() {
  const [searchType, setSearchType] = useState<'buy' | 'sell'>('buy');
  const [searchValue, setSearchValue] = useState<string>('');

  const popularSearches: SearchItem[] = [
    { icon: Home, text: 'Houses for sale' },
    { icon: Building, text: 'Apartments for rent' },
    { icon: MapPin, text: 'Properties in Nairobi' },
    { icon: Home, text: 'Condos for sale' },
    { icon: Building, text: 'Office spaces' },
    { icon: MapPin, text: 'Beachfront properties' },
  ];

  useEffect(() => {
    setSearchValue(searchType === 'buy' ? 'Nairobi' : 'Enter your property address');
  }, [searchType]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-black py-12 pt-16"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 text-center text-3xl font-bold text-orange"
        >
          Find Your Perfect Property
        </motion.h2>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto max-w-3xl rounded-lg bg-gray-900 p-6 shadow-md border border-gold"
        >
          <div className="mb-4 flex">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 rounded-l-lg px-4 py-2 ${
                searchType === 'buy' ? 'bg-gold text-black' : 'bg-gray-800 text-gold'
              }`}
              onClick={() => setSearchType('buy')}
            >
              Buy
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 rounded-r-lg px-4 py-2 ${
                searchType === 'sell' ? 'bg-gold text-black' : 'bg-gray-800 text-gold'
              }`}
              onClick={() => setSearchType('sell')}
            >
              Sell
            </motion.button>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                searchType === 'buy'
                  ? 'Enter location, property type, or keywords'
                  : 'Enter your property address'
              }
              className="flex-grow rounded-l-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gold placeholder-gray-500 focus:border-gold focus:outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-r-lg bg-gold px-4 py-2 text-black hover:bg-yellow-500"
            >
              <Search className="h-5 w-5" />
            </motion.button>
          </div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4"
          >
            <h3 className="mb-2 text-sm font-semibold text-gold">Popular Searches:</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center rounded-full bg-gray-800 px-3 py-1 text-sm text-gold hover:bg-gray-700"
                >
                  <search.icon className="mr-1 h-4 w-4" />
                  {search.text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

