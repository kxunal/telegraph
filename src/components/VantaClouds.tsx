'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import CLOUDS from 'vanta/dist/vanta.clouds.min';

export default function VantaClouds() {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        CLOUDS({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          skyColor: 0x87ceeb, // Natural sky blue
          cloudColor: 0xffffff, // Pure white clouds
          cloudShadowColor: 0x2e4f66, // Soft natural shadow
          sunColor: 0xffa500, // Golden sunlight
          sunGlareColor: 0xff5500,
          sunPosition: new THREE.Vector3(2, 2, -1), // Top corner directional light
          speed: 0.5, // Slow movement
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div 
      ref={vantaRef} 
      style={{ 
        position: 'fixed', 
        zIndex: -2, 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh',
        pointerEvents: 'none'
      }} 
    />
  );
}
