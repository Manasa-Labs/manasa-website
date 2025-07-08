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
import { useEffect, useRef } from "react";
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
  const { viewport } = useThree();
  const [isMobile, setIsMobile] = useState(false);
  const gyroData = useRef({ beta: 0, gamma: 0 });
  const permissionGranted = useRef(false);

  // Detect mobile devices more reliably
  useEffect(() => {
    const checkMobile = () => {
      return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    setIsMobile(checkMobile());

    // Handle orientation change (landscape/portrait switch)
    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle device orientation for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleOrientation = (event) => {
      // Chrome on Android uses absolute values
      const beta = event.beta !== null ? event.beta : 0;
      const gamma = event.gamma !== null ? event.gamma : 0;

      gyroData.current = { beta, gamma };
    };

    const requestPermission = () => {
      if (permissionGranted.current) return;

      // iOS 13+ requires permission request
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
          .then((permissionState) => {
            if (permissionState === "granted") {
              permissionGranted.current = true;
              window.addEventListener(
                "deviceorientation",
                handleOrientation,
                true
              );
            }
          })
          .catch(console.warn);
      } else {
        // Chrome on Android and other browsers
        try {
          // Chrome requires secure context (HTTPS)
          if (window.isSecureContext) {
            permissionGranted.current = true;
            window.addEventListener(
              "deviceorientation",
              handleOrientation,
              true
            );
          }
        } catch (e) {
          console.warn("Device orientation not supported", e);
        }
      }
    };

    // Request permission on first touch
    const handleFirstTouch = () => {
      requestPermission();
      window.removeEventListener("touchstart", handleFirstTouch);
      window.removeEventListener("click", handleFirstTouch);
    };

    // Use both touch and click for broader support
    window.addEventListener("touchstart", handleFirstTouch, { once: true });
    window.addEventListener("click", handleFirstTouch, { once: true });

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isMobile]);

  useFrame((state, delta) => {
    if (isMobile && permissionGranted.current) {
      // Normalize values across platforms
      let beta = gyroData.current.beta;
      let gamma = gyroData.current.gamma;

      // iOS uses relative values, Android uses absolute
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

      if (isIOS) {
        // iOS: Values are relative to portrait orientation
        beta = THREE.MathUtils.clamp(beta, -90, 90);
        gamma = THREE.MathUtils.clamp(gamma, -90, 90);
      } else {
        // Android: Values are absolute
        beta = THREE.MathUtils.clamp(beta - 90, -90, 90);
        gamma = THREE.MathUtils.clamp(gamma, -90, 90);
      }

      // Map to camera position
      const targetX = -1.5 + gamma * 0.03;
      const targetY = 1 + beta * 0.02;

      easing.damp3(state.camera.position, [targetX, targetY, 5.5], 0.3, delta);
    } else {
      // Original pointer-based movement
      easing.damp3(
        state.camera.position,
        [
          -1 + (state.pointer.x * viewport.width) / 3,
          (1 + state.pointer.y) / 2,
          5.5,
        ],
        0.5,
        delta
      );
    }

    // Maintain original lookAt point
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}
