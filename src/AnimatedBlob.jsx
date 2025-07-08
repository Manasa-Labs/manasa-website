import { useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Vector3 } from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise";

export function AnimatedBlob({ scale = 1, ...props }) {
  const meshRef = useRef();
  const geometryRef = useRef();
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  useCursor(hovered);

  // Initialize SimplexNoise correctly
  const noise = useMemo(() => new SimplexNoise(), []);

  // Reusable objects
  const vertex = useMemo(() => new Vector3(), []);
  const originalPositions = useRef();

  useFrame((state) => {
    if (!meshRef.current || !geometryRef.current) return;

    const geometry = geometryRef.current;
    const position = geometry.attributes.position;
    const time = state.clock.getElapsedTime();

    // Store original positions
    if (!originalPositions.current) {
      originalPositions.current = new Float32Array(position.array);
    }

    // Update vertices
    for (let i = 0; i < position.count; i++) {
      // Get original position
      vertex.set(
        originalPositions.current[i * 3],
        originalPositions.current[i * 3 + 1],
        originalPositions.current[i * 3 + 2]
      );

      // Calculate noise displacement - CORRECTED METHOD NAME HERE
      const noiseValue = noise.noise(
        vertex.x * 0.5 + time * 0.5,
        vertex.y * 0.5,
        vertex.z * 0.5
      );

      const offset = noiseValue * 0.2;
      vertex.normalize().multiplyScalar(1 + offset);

      // Update position
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={clicked ? scale * 1.4 : scale * 1.2}
      onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <icosahedronGeometry ref={geometryRef} args={[1, 4]} />
      <meshStandardMaterial
        color={hovered ? "white" : "#fc5454"}
        metalness={0.5}
        roughness={0.5}
        emissive="#fc5454"
      />
    </mesh>
  );
}
