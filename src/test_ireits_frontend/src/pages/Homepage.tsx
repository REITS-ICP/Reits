'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, Globe, Lock, Search } from 'lucide-react'
import BackgroundVideo from "../assets/backgroundvideo.mp4"
import { SparklesCore } from "../components/ui/SparklesCore"
import { TextGenerateEffect } from "../components/ui/text-generate-effect"
import { AnimatedImage } from "../components/ui/AnimatedImage"
import { Button } from "../components/ui/button"
import coresImage from '../assets/REIT10.jpeg'

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.3
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <nav className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
          </motion.div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              <svg className="w-6 h-6 text-orange-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 space-y-2"
          >
            <NavItem href="#features" mobile>Features</NavItem>
            <NavItem href="#about" mobile>About</NavItem>
            <NavItem href="#contact" mobile>Contact</NavItem>
          </motion.div>
        )}
      </nav>

      <main>
        <HeroSection videoRef={videoRef} />
        <CTASection />
      </main>
    </div>
  )
}

function NavItem({ href, children, mobile = false }: { href: string; children: React.ReactNode; mobile?: boolean }) {
  return (
    <motion.a
      href={href}
      className={`text-orange-500 hover:text-gold transition-colors ${mobile ? 'block' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  )
}

function HeroSection({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement> }) {
  return (
    <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={BackgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 w-full h-full bg-black bg-opacity-30">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFD700"
        />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center w-full max-w-7xl px-4 mx-auto">
        <div className="max-w-xl space-y-6 mb-10 lg:mb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          > 
            <h1 className="text-4xl font-bold text-orange-500 md:text-5xl">
              24/7 Real Estate Closings
            </h1>                                                                                                                                                                                                                                                                                                       
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl round-lg text-gold drop-shadow-md"
          >
            Smooth and secure transactions automated onchain
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="bg-orange-500 text-black round-lg hover:bg-gold hover:text-black transition-colors">
              Drop a contract
            </Button>
          </motion.div>
        </div>

        <div className="w-full max-w-md p-6 bg-black bg-opacity-30 rounded-lg shadow-lg border border-white/20 backdrop-blur-md">
          <h2 className="mb-4 text-2xl font-semibold text-white">Get Started</h2>
          <div className="space-y-3">
            <Button variant="outline" className="rounded-lg w-full bg-gold/60 text-black hover:bg-white/20 border-white/30 font-semibold">
              I'M AN AGENT
            </Button>
            <Button variant="outline" className="rounded-lg w-full bg-gold/60 text-black hover:bg-white/20 border-white/30 font-semibold">
              I'M A SELLER
            </Button>
            <Button variant="outline" className="rounded-lg w-full bg-gold/60 text-black hover:bg-white/20 border-white/30 font-semibold">
              I'M A BUYER
            </Button>
          </div>
          <p className="rounded-lg mt-4 text-center text-black/80 hover:text-white cursor-pointer transition duration-300 font-medium">
            I'm just curious →
          </p>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-orange-500"
            >
              Buy or Sell Your Property with Ease
            </motion.h1>
            <p className="text-gold text-lg">
              Experience seamless property transactions with our comprehensive platform designed for modern real estate needs.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-orange-500 text-black px-6 py-3 rounded-lg hover:bg-gold transition-colors">
                Get Started
              </button>
              <button className="border border-gold text-gold px-6 py-3 rounded-lg hover:bg-gold hover:text-black transition-colors">
                Learn More
              </button>
            </div>
          </div>
          <div className="relative">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={coresImage}
              alt="Modern House"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Communities Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.img
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            src={coresImage}
            alt="Business Team"
            className="rounded-2xl"
          />
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-orange-500">
              Empowering Tomorrow's Communities
            </h2>
            <p className="text-gold">
              We're committed to building sustainable and thriving communities through innovative real estate solutions.
            </p>
            <button className="flex items-center gap-2 text-orange-500 hover:text-gold">
              Learn More <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Living Space Section */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-orange-500">
                Elevate Your Living Space with Expert Renovations
              </h2>
              <ul className="space-y-4 text-gold">
                {['Professional Design', 'Quality Materials', 'Expert Execution', 'Timely Delivery'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="bg-orange-500 text-black px-6 py-3 rounded-lg hover:bg-gold transition-colors">
                Get Started
              </button>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-gold/20 rounded-full blur-3xl" />
              <img
                src={coresImage}
                alt="City Buildings"
                className="relative rounded-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img
              src={coresImage}
              alt="Property Listings"
              className="rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
          </motion.div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-orange-500">
              Explore Our Latest Listings Available for Purchase Today
            </h2>
            <p className="text-gold">
              Discover a wide range of properties that match your lifestyle and investment goals.
            </p>
            <button className="flex items-center gap-2 bg-orange-500 text-black px-6 py-3 rounded-lg hover:bg-gold transition-colors">
              View Listings <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Property Grid with Animated Cards */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-orange-500 mb-8 text-center">
            Discover your ideal home
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedCard
              index={0}
              title="Modern Villa"
              price="$500,000"
              animation="fadeIn"
            />
            <AnimatedCard
              index={1}
              title="Cozy Apartment"
              price="$250,000"
              animation="slideIn"
            />
            <AnimatedCard
              index={2}
              title="Luxury Penthouse"
              price="$1,200,000"
              animation="scaleIn"
            />
            <AnimatedCard
              index={3}
              title="Suburban House"
              price="$400,000"
              animation="rotateIn"
            />
            <AnimatedCard
              index={4}
              title="Beach Condo"
              price="$350,000"
              animation="bounceIn"
            />
            <AnimatedCard
              index={5}
              title="Mountain Cabin"
              price="$300,000"
              animation="flipIn"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-orange-500 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-gray-900 rounded-xl shadow-lg border border-gold">
              <h3 className="font-semibold mb-4 text-orange-500">How do I get started?</h3>
              <p className="text-gold">
                Simply create an account and browse our available properties. Our team will guide you through the process.
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

interface AnimatedCardProps {
  index: number;
  title: string;
  price: string;
  animation: 'fadeIn' | 'slideIn' | 'scaleIn' | 'rotateIn' | 'bounceIn' | 'flipIn';
}

function AnimatedCard({ index, title, price, animation }: AnimatedCardProps) {
  const animations = {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5, delay: index * 0.1 }
    },
    slideIn: {
      initial: { x: -50, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      transition: { duration: 0.5, delay: index * 0.1 }
    },
    scaleIn: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { duration: 0.5, delay: index * 0.1 }
    },
    rotateIn: {
      initial: { rotate: -10, opacity: 0 },
      animate: { rotate: 0, opacity: 1 },
      transition: { duration: 0.5, delay: index * 0.1 }
    },
    bounceIn: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { type: 'spring', stiffness: 300, damping: 15, delay: index * 0.1 }
    },
    flipIn: {
      initial: { rotateY: 90, opacity: 0 },
      animate: { rotateY: 0, opacity: 1 },
      transition: { duration: 0.5, delay: index * 0.1 }
    }
  };

  const cardAnimation = animations[animation];

  return (
    <motion.div
      initial={cardAnimation.initial}
      animate={cardAnimation.animate}
      transition={cardAnimation.transition}
      whileHover={{ scale: 1.05 }}
      className="bg-black rounded-xl overflow-hidden shadow-lg border border-gold"
    >
      <img
        src={coresImage}
        alt={title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg text-orange-500">{title}</h3>
        <p className="text-gold">Starting from {price}</p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 bg-orange-500 text-black px-4 py-2 rounded-lg hover:bg-gold transition-colors"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}

