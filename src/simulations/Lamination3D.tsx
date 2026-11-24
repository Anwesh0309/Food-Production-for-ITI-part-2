import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';

/** Real WebGL (Three.js via react-three-fiber) stack of dough and butter layers. */
function Stack({ layers, puffed }: { layers: number; puffed: boolean }) {
  const g = useRef<Group>(null);
  const [drag, setDrag] = useState<{ x: number } | null>(null);
  const rot = useRef(0.6);
  const shown = Math.max(3, Math.min(layers, 61));            // visible slices (count text shows the true number)
  const slices = useMemo(() => Array.from({ length: shown }, (_, i) => i), [shown]);
  const total = 1.1; const th = total / shown; const gap = puffed ? th * 0.6 : 0;
  useFrame((_, dt) => { if (!g.current) return; if (!drag) rot.current += dt * 0.35; g.current.rotation.y = rot.current; });
  return (
    <group ref={g}
      onPointerDown={(e) => { setDrag({ x: e.clientX }); (e.target as Element)?.setPointerCapture?.(e.pointerId); }}
      onPointerMove={(e) => { if (drag) { rot.current += (e.clientX - drag.x) * 0.01; setDrag({ x: e.clientX }); } }}
      onPointerUp={() => setDrag(null)}>
      {slices.map((i) => {
        const butter = i % 2 === 1;
        const y = -0.55 + i * (th + gap) + th / 2;
        return (
          <mesh key={i} position={[0, y - (puffed ? (shown * gap) / 2 : 0), 0]}>
            <boxGeometry args={[1.8, th * 0.92, 1.3]} />
            <meshStandardMaterial color={butter ? (puffed ? '#e9b44c' : '#f7d65a') : (puffed ? '#d9a35b' : '#f3e3c0')} roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Lamination3D({ layers, puffed }: { layers: number; puffed: boolean }) {
  return (
    <Canvas camera={{ position: [3, 1.8, 3.6], fov: 40 }} style={{ height: 220, touchAction: 'none' }} data-testid="canvas3d">
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <Stack layers={layers} puffed={puffed} />
    </Canvas>
  );
}
