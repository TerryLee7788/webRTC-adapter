import React from 'react'
import { useEffect } from 'react/cjs/react.production.min';
import { Scene, WebGLRenderer } from 'three';
import { ARUtils, ARPerspectiveCamera, ARView } from 'three.ar.js';

async function init() {
  const display = await ARUtils.getARDisplay();
  const renderer = new WebGLRenderer({ alpha: true });
  const arView = new ARView(display, renderer);
    console.log(123);
  // And so forth...
}

const AR = () => {
    useEffect(() => {
        init()
    }, [])
    return (
        <div>
            AR
        </div>
    )
}

export default AR