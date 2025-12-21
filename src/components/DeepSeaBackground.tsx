"use client";

import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import * as THREE from 'three';

export default function DeepSeaBackground() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }}>
            <ShaderGradientCanvas
                style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                pixelDensity={0.9}
            >
                <ShaderGradient
                    animate="on"
                    brightness={1.3}
                    cAzimuthAngle={181}
                    cDistance={3.91}
                    cPolarAngle={99}
                    cameraZoom={1}
                    color1="#3B489D" // Indigo-900 (深邃)
                    color2="#3CA08A" // Green-700 (生機)
                    color3="#FFDFB3" // Yellow-100 (光暈)
                    envPreset="lobby"
                    grain="on"
                    lightType="3d"

                    positionX={-1.4}
                    positionY={0}
                    positionZ={0}

                    reflection={0.7}
                    rotationX={0}
                    rotationY={10}
                    rotationZ={50}
                    shader="defaults"
                    type="waterPlane"
                    uAmplitude={1}
                    uDensity={1.6}
                    uFrequency={5.5}
                    uSpeed={0.04}
                    uStrength={1.8}
                    uTime={0}
                    wireframe={false}
                />
            </ShaderGradientCanvas>
        </div>
    );
}
