import { BakeShadows, MeshReflectorMaterial, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
} from "@react-three/postprocessing";
import { easing } from "maath";
import { BlendFunction } from "postprocessing";
import { useEffect, useState } from "react";
import { suspend } from "suspend-react";
import { Computers, Instances } from "./Computers";

const suzi = import("@pmndrs/assets/models/bunny.glb");

export default function App() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [-1.5, 1, 5.5], fov: 45, near: 1, far: 20 }}
      eventSource={document.getElementById("root")}
      eventPrefix="client"
    >
      {/* Lights */}
      <color attach="background" args={["black"]} />
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight
        decay={0}
        position={[10, 20, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      {/* Main scene */}
      <group position={[-0, -1, 0]}>
        {/* Auto-instanced sketchfab model */}
        <Instances>
          <Computers scale={0.5} />
        </Instances>
        {/* Plane reflections + distance blur */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[300, 30]}
            resolution={2048}
            mixBlur={1}
            mixStrength={180}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#202020"
            metalness={0.8}
          />
        </mesh>
        {/* Bunny and a light give it more realism */}
        <Bun
          scale={0.4}
          position={[0, 0.3, 0.5]}
          rotation={[0, -Math.PI * 0.85, 0]}
        />
        <pointLight
          distance={1.5}
          intensity={1}
          position={[-0.15, 0.7, 0]}
          color="orange"
        />
      </group>
      {/* Postprocessing */}
      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0}
          mipmapBlur
          luminanceSmoothing={0.0}
          intensity={3}
        />
        <DepthOfField
          target={[0, 0, 13]}
          focalLength={0.3}
          bokehScale={15}
          height={700}
        />
        {/* <Noise opacity={0.01} /> */}
        {/* <Vignette eskil={false} offset={0.1} darkness={1.1} /> */}
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL} // blend mode
          offset={[0.001, 0.002]} // color offset
        />
      </EffectComposer>
      {/* Camera movements */}
      <CameraRig />
      {/* Small helper that freezes the shadows for better performance */}
      <BakeShadows />
    </Canvas>
  );
}

function Bun(props) {
  const { nodes } = useGLTF(suspend(suzi).default);
  console.log(nodes);
  return (
    <mesh receiveShadow castShadow geometry={nodes.mesh.geometry} {...props}>
      <meshStandardMaterial color="#222" roughness={0.5} />
    </mesh>
  );
}

function CameraRig() {
  const { camera, gl } = useThree();
  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  const [orientation, setOrientation] = useState({ gamma: 0, beta: 0 });

  // Variable to control the sensitivity of the parallax pan effect on mobile
  const MOBILE_PAN_SENSITIVITY = 0.05;

  useEffect(() => {
    if (!isMobile) return;

    const handleDeviceOrientation = (event) => {
      // Gamma: left-to-right tilt (-90 to 90 degrees)
      // Beta: front-to-back tilt (-180 to 180 degrees)
      setOrientation({ gamma: event.gamma, beta: event.beta });
    };

    const requestPermission = () => {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === "granted") {
            window.addEventListener(
              "deviceorientation",
              handleDeviceOrientation
            );
          } else {
            console.warn("Device orientation permission denied.");
          }
        })
        .catch(console.error);
    };

    // Request permission for iOS 13+
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      // Trigger permission request on first user interaction
      document.body.addEventListener("click", requestPermission, {
        once: true,
      });
      document.body.addEventListener("touchstart", requestPermission, {
        once: true,
      });
    } else {
      // For non-iOS 13+ devices, just add the listener
      window.addEventListener("deviceorientation", handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
      // Clean up permission listeners if they were added
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        document.body.removeEventListener("click", requestPermission);
        document.body.removeEventListener("touchstart", requestPermission);
      }
    };
  }, [isMobile]);

  useFrame((state, delta) => {
    if (!isMobile) {
      // Original pointer-based movement for desktop
      easing.damp3(
        state.camera.position,
        [
          -1 + (state.pointer.x * state.viewport.width) / 3,
          (1 + state.pointer.y) / 2,
          5.5,
        ],
        0.5,
        delta
      );
    } else {
      // Mobile: Apply slight pan based on gamma (left/right tilt)
      const targetX = -1.5 + orientation.gamma * MOBILE_PAN_SENSITIVITY; // Initial X + scaled gamma
      const targetY = 1; // Keep Y fixed
      const targetZ = 5.5; // Keep Z fixed

      easing.damp3(
        state.camera.position,
        [targetX, targetY, targetZ],
        0.5,
        delta
      );
    }
    // Ensure camera always looks at the scene origin
    state.camera.lookAt(0, 0, 0);
  });

  return null; // No JSX component needed for controls
}
