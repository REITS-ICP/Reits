'use client'

import { motion } from 'framer-motion'
import Image from '../../assets/REIT12.jpeg'

export const AnimatedImage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.5,
        ease: [0, 0.71, 0.2, 1.01]
      }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <img
        src={Image}
        width={600}
        height={400}
        alt="Futuristic real estate"
        className="rounded-lg shadow-2xl"
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      />
    </motion.div>
  )
}

