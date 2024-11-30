// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { ArrowRight, Building2, Globe, Lock } from 'lucide-react'
// import { SparklesCore } from "../components/ui/SparklesCore"
// import { TextGenerateEffect } from "../components/ui/text-generate-effect"
// import { AnimatedImage } from "../components/ui/AnimatedImage"

// function App() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false)

//   return (
//     <div className="min-h-screen bg-black text-white overflow-hidden">
//       <nav className="container mx-auto px-4 py-6 relative z-10">
//         <div className="flex justify-between items-center">
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <h1 className="text-2xl font-bold text-orange-500">Provest</h1>
//           </motion.div>
//           <div className="hidden md:flex space-x-6">
//             <NavItem href="#features">Features</NavItem>
//             <NavItem href="#about">About</NavItem>
//             <NavItem href="#contact">Contact</NavItem>
//           </div>
//           <div className="md:hidden">
//             <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
//               <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
//                 <path d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
//               </svg>
//             </button>
//           </div>
//         </div>
//         {isMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className="md:hidden mt-4 space-y-2"
//           >
//             <NavItem href="#features" mobile>Features</NavItem>
//             <NavItem href="#about" mobile>About</NavItem>
//             <NavItem href="#contact" mobile>Contact</NavItem>
//           </motion.div>
//         )}
//       </nav>

//       <main>
//         <HeroSection />
//         <FeaturesSection />
//         <CTASection />
//       </main>

//       <footer className="bg-gray-900 text-white py-8 relative z-10">
//         <div className="container mx-auto px-4 text-center">
//           <p>&copy; 2023 Provest. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   )
// }

// function NavItem({ href, children, mobile = false }: { href: string; children: React.ReactNode; mobile?: boolean }) {
//   return (
//     <motion.a
//       href={href}
//       className={`text-white hover:text-orange-500 transition-colors ${mobile ? 'block' : ''}`}
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//     >
//       {children}
//     </motion.a>
//   )
// }

// function HeroSection() {
//   return (
//     <section className="relative py-20 px-4 overflow-hidden">
//       <div className="absolute inset-0 w-full h-full">
//         <SparklesCore
//           id="tsparticlesfullpage"
//           background="transparent"
//           minSize={0.6}
//           maxSize={1.4}
//           particleDensity={100}
//           className="w-full h-full"
//           particleColor="#FFD700"
//         />
//       </div>
//       <div className="container mx-auto text-center relative z-10">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="mb-8"
//         >
//           <TextGenerateEffect words="The Future of Real Estate Investment" className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 text-transparent bg-clip-text" />
//         </motion.div>
//         <motion.p
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 0.2 }}
//           className="text-xl mb-8 text-gray-300"
//         >
//           Unlock global property opportunities with blockchain technology
//         </motion.p>
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           className="bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors"
//         >
//           Get Started
//         </motion.button>
//         <div className="mt-12">
//           <AnimatedImage />
//         </div>
//       </div>
//     </section>
//   )
// }

// function FeaturesSection() {
//   const features = [
//     { icon: <Globe className="w-12 h-12 text-orange-500" />, title: "Global Access", description: "Invest in properties worldwide from the comfort of your home." },
//     { icon: <Lock className="w-12 h-12 text-orange-500" />, title: "Secure Transactions", description: "Blockchain-powered security for all your investments." },
//     { icon: <Building2 className="w-12 h-12 text-orange-500" />, title: "Fractional Ownership", description: "Own a piece of premium real estate with minimal investment." },
//   ]

//   return (
//     <section id="features" className="py-20 px-4 bg-gray-900 relative z-10">
//       <div className="container mx-auto">
//         <h3 className="text-3xl font-bold text-center mb-12 text-orange-500">Why Choose Provest?</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: index * 0.2 }}
//               className="bg-black p-6 rounded-lg shadow-lg text-center"
//             >
//               <div className="mb-4">{feature.icon}</div>
//               <h4 className="text-xl font-semibold mb-2 text-gold">{feature.title}</h4>
//               <p className="text-gray-400">{feature.description}</p>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

// function CTASection() {
//   return (
//     <section className="py-20 px-4 relative z-10">
//       <div className="container mx-auto text-center">
//         <motion.h3
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-3xl font-bold mb-6 text-orange-500"
//         >
//           Ready to Revolutionize Your Real Estate Investments?
//         </motion.h3>
//         <motion.p
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 0.2 }}
//           className="text-xl mb-8 text-gray-300"
//         >
//           Join Provest today and step into the future of property investment.
//         </motion.p>
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           className="bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors flex items-center mx-auto"
//         >
//           Get Started Now
//           <ArrowRight className="ml-2 w-5 h-5" />
//         </motion.button>
//       </div>
//     </section>
//   )
// }

// export default App

