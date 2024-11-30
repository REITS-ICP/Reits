// import React, { useRef } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// interface Property3DViewerProps {
//   modelPath: string;
// }

// const Property3DViewer: React.FC<Property3DViewerProps> = ({ modelPath }) => {
//   const modelRef = useRef(null);

//   React.useEffect(() => {
//     const loader = new GLTFLoader();
//     loader.load(modelPath, (gltf) => {
//       modelRef.current = gltf.scene;
//     });
//   }, [modelPath]);

//   return (
//     <Canvas className="w-full h-full">
//       <ambientLight intensity={0.5} />
//       <directionalLight position={[10, 10, 10]} />
//       {modelRef.current && <primitive object={modelRef.current} />}
//       <OrbitControls />
//     </Canvas>
//   );
// };

// export default Property3DViewer;
