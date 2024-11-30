// import React, { Suspense, useState } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import { ErrorBoundary } from 'react-error-boundary';
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Select, SelectItem } from "@/components/ui/select";
// import { Slider } from "@/components/ui/slider";
// import { MapPin, Home, Briefcase, Car, Search } from 'lucide-react';

// function PropertyModel({ url }: { url: string }) {
//   const { scene } = useGLTF(url);
//   return <primitive object={scene} />;
// }

// function ErrorFallback({error, resetErrorBoundary}: {error: Error; resetErrorBoundary: () => void}) {
//   return (
//     <div role="alert" className="text-center p-4">
//       <p>Something went wrong:</p>
//       <pre className="text-red-500">{error.message}</pre>
//       <Button onClick={resetErrorBoundary}>Try again</Button>
//     </div>
//   );
// }

// function MapComponent() {
//   const position: [number, number] = [51.505, -0.09]; // Example coordinates (London)

//   return (
//     <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//       />
//       <Marker position={position}>
//         <Popup>
//           A sample property location. <br /> You can customize this popup.
//         </Popup>
//       </Marker>
//     </MapContainer>
//   );
// }

// export default function Marketplace() {
//   const [activeTab, setActiveTab] = useState('3d-model');

//   return (
//     <div className="container mx-auto p-4 bg-black text-white">
//       <h1 className="text-4xl font-bold mb-6 text-orange-500">Real Estate Marketplace</h1>
      
//       {/* Search and Create Transaction */}
//       <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
//         <div className="relative flex-grow w-full sm:w-auto">
//           <Input type="text" placeholder="Enter a city or address..." className="pl-10 pr-4 py-2 w-full bg-gray-800 text-white border-orange-500" aria-label="Search for properties" />
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" aria-hidden="true" />
//         </div>
//         <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2 transition-colors duration-300">Create transaction</Button>
//       </div>

//       {/* Filters */}
//       <div className="mb-6 bg-gray-900 p-6 rounded-lg">
//         <h2 className="text-2xl font-semibold mb-4 text-orange-500">Filters</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           <div>
//             <Label htmlFor="price-range" className="text-gold">Price Range</Label>
//             <Slider id="price-range" defaultValue={0} max={1000000} step={10000} className="mt-2" />
//           </div>
//           <div className="flex items-center space-x-2">
//             <Switch id="single-agent" />
//             <Label htmlFor="single-agent" className="text-gold">Single Agent Representation</Label>
//           </div>
//           <div>
//             <Label htmlFor="beds" className="text-gold">Beds</Label>
//             <Select id="beds" className="mt-2 bg-gray-800 text-white border-orange-500">
//               <SelectItem value="1">1+</SelectItem>
//               <SelectItem value="2">2+</SelectItem>
//               <SelectItem value="3">3+</SelectItem>
//               <SelectItem value="4">4+</SelectItem>
//             </Select>
//           </div>
//           <div>
//             <Label htmlFor="size" className="text-gold">Size (sq ft)</Label>
//             <Input type="number" id="size" min={0} placeholder="Min size" className="mt-2 bg-gray-800 text-white border-orange-500" />
//           </div>
//           <div>
//             <Label htmlFor="property-type" className="text-gold">Type</Label>
//             <Select id="property-type" className="mt-2 bg-gray-800 text-white border-orange-500">
//               <SelectItem value="house">House</SelectItem>
//               <SelectItem value="apartment">Apartment</SelectItem>
//               <SelectItem value="condo">Condo</SelectItem>
//               <SelectItem value="townhouse">Townhouse</SelectItem>
//             </Select>
//           </div>
//           <div className="flex items-center space-x-2">
//             <Switch id="listings-offers" />
//             <Label htmlFor="listings-offers" className="text-gold">Listings accepting offers</Label>
//           </div>
//         </div>
//         <div className="flex justify-between mt-4">
//           <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-full px-6 py-2 transition-colors duration-300">View all filters</Button>
//           <Button variant="ghost" className="text-orange-500 hover:bg-orange-500 hover:text-white rounded-full px-6 py-2 transition-colors duration-300">Reset</Button>
//         </div>
//       </div>

//       {/* Property Token Value */}
//       <div className="mb-6 bg-gray-900 p-4 rounded-lg">
//         <div className="flex items-center justify-between">
//           <span className="font-bold text-gold">Property Token (PT) Value:</span>
//           <span className="text-xl font-bold text-orange-500">1 PT = $1</span>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-gray-900 p-6 rounded-lg">
//           <h2 className="text-2xl font-semibold mb-2 text-orange-500">Property Viewer</h2>
//           <p className="text-gold mb-4">Explore the property in 3D or view the neighborhood map</p>
//           <Tabs value={activeTab} onChange={setActiveTab}>
//             <TabsList className="grid w-full grid-cols-2 mb-4">
//               <TabsTrigger value="3d-model" className="text-gold hover:text-orange-500">3D Model</TabsTrigger>
//               <TabsTrigger value="map" className="text-gold hover:text-orange-500">Neighborhood Map</TabsTrigger>
//             </TabsList>
//             <TabsContent value="3d-model" className="h-[400px]">
//               <ErrorBoundary FallbackComponent={ErrorFallback}>
//                 <Canvas camera={{ position: [5, 5, 5] }}>
//                   <Suspense fallback={null}>
//                     <PropertyModel url="/assets/3d/house.glb" />
//                     <OrbitControls />
//                     <Environment preset="sunset" background />
//                   </Suspense>
//                 </Canvas>
//               </ErrorBoundary>
//             </TabsContent>
//             <TabsContent value="map" className="h-[400px]">
//               <ErrorBoundary FallbackComponent={ErrorFallback}>
//                 <MapComponent />
//               </ErrorBoundary>
//             </TabsContent>
//           </Tabs>
//         </div>

//         <div className="bg-gray-900 p-6 rounded-lg">
//           <h2 className="text-2xl font-semibold mb-2 text-orange-500">Property Details</h2>
//           <p className="text-gold mb-4">123 Main St, Anytown, USA</p>
//           <div className="space-y-4">
//             <div className="flex items-center space-x-2">
//               <Home className="w-5 h-5 text-orange-500" aria-hidden="true" />
//               <span className="text-white">4 bedrooms, 3 bathrooms</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <MapPin className="w-5 h-5 text-orange-500" aria-hidden="true" />
//               <span className="text-white">Prime location in downtown</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Briefcase className="w-5 h-5 text-orange-500" aria-hidden="true" />
//               <span className="text-white">Close to business district</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Car className="w-5 h-5 text-orange-500" aria-hidden="true" />
//               <span className="text-white">Ample parking available</span>
//             </div>
//             <div className="mt-6">
//               <h3 className="text-lg font-semibold mb-2 text-gold">Neighborhood Data</h3>
//               <ul className="list-disc list-inside space-y-1 text-white">
//                 <li>Walk Score: 85/100</li>
//                 <li>Transit Score: 90/100</li>
//                 <li>Bike Score: 75/100</li>
//                 <li>Crime Rate: Low</li>
//                 <li>School District Rating: 8/10</li>
//               </ul>
//             </div>
//             <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2 transition-colors duration-300">Schedule a Viewing</Button>
//           </div>
//         </div>
//       </div>

//       <div className="mt-8 bg-gray-900 p-6 rounded-lg">
//         <h2 className="text-2xl font-semibold mb-4 text-orange-500">About Our Platform</h2>
//         <p className="text-white">
//           Our real estate platform is a must-have for anyone serious about making informed property decisions. 
//           The immersive 3D model features offer an in-depth look at the property, allowing you to explore every 
//           corner from the comfort of your home. Our interactive map with layered neighborhood data provides 
//           crucial insights into the surrounding area, helping you understand the full context of your potential 
//           investment.
//         </p>
//       </div>
//     </div>
//   );
// }

