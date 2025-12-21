"use client";

import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import * as THREE from 'three';

export default function DeepSeaBackground() {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <ShaderGradientCanvas
                style={{ width: '100%', height: '100%' }}
                pixelDensity={1}
            >
                <ShaderGradient
                    control="query"
                    urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.2&cAzimuthAngle=180&cDistance=3.6&cPolarAngle=90&cameraZoom=1&color1=%23050b1a&color2=%230b1e3b&color3=%231e3a8a&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=-1.4&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=10&rotationZ=50&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.3&uFrequency=5.5&uSpeed=0.2&uStrength=2.4&uTime=0&wireframe=false"
                />
            </ShaderGradientCanvas>
        </div>
    );
}
