import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

export default function PortalDynamicMap(props) {
  /* ---------- variable ---------- */
  const WIDTH = 256;
  const HEIGHT = 256;

  /* ---------- state ---------- */
  // 画布
  const canvasRef = useRef(null);
  // 场景
  const sceneRef = useRef(null);
  // 渲染器
  const rendererRef = useRef(null);
  // 相机
  const cameraRef = useRef(null);
  // 二十面几何体
  const sphereMeshRef = useRef(null);
  // 轨道控制器
  const orbitControlRef = useRef(null);

  const uniforms = {
    color1: {
      value: new THREE.Color('hsl(214, 100%, 50%)')
    },
    color2: {
      value: new THREE.Color('hsl(191, 100%, 50%)')
    },
    color3: {
      value: new THREE.Color('hsl(181, 100%, 50%)')
    },
    factor1: {
      value: 0.58
    },
    factor2: {
      value: 0.66
    },
    morph: {
      value: 10.0
    },
    pointSize: {
      value: 1.0
    },
    time: {
      value: 0.9493
    },
    timeStep: {
      value: 0.0055,
    }
  };

  /* ---------- function ---------- */
  /** 初始函数 */
  const init = () => {
    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false,
    });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(WIDTH, HEIGHT);
    rendererRef.current.setClearColor(new THREE.Color(0xffffff), 1);

    // 创建相机
    cameraRef.current = new THREE.OrthographicCamera(
      WIDTH / - 2,
      WIDTH / 2,
      HEIGHT / 2,
      HEIGHT / - 2,
      0,
      400
    );
    cameraRef.current.position.set(0, 0, 0);

    // 创建 mesh
    const sphereGeo = new THREE.IcosahedronGeometry(200, 1);
    const sphereMaterial = new THREE.ShaderMaterial({
      uniforms,
      side: THREE.DoubleSide,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      wireframe: false
    });
    sphereMeshRef.current = new THREE.Mesh(sphereGeo, sphereMaterial);
    sphereMeshRef.current.position.set(0, 0, -300);
    sceneRef.current.add(sphereMeshRef.current);
    sphereMeshRef.current.visible = true;

    // 添加轨道
    orbitControlRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    orbitControlRef.current.update();
  }

  /** 渲染函数 */
  const render = () => {
    const uniforms = sphereMeshRef.current.material.uniforms;
    uniforms.time.value += uniforms.timeStep.value;

    orbitControlRef.current.update();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }

  /** 动画函数 */
  const animate = () => {
    requestAnimationFrame(animate);
    render();
  }

  /* ---------- useEffect ---------- */
  useEffect(() => {
    if (!sceneRef.current) {
      init();
      animate();
    }
  }, [])

  return (
    <div id="container">
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
