import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import points from './points';

export default function DynamicMap(props) {
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const meshRef = useRef(null);
  const controlRef = useRef(null);
  const pointsRef = useRef(points());

  /* ---------- function ---------- */
  /** 初始函数 */
  const init = () => {
    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(40, window.innerWidth/ window.innerHeight, 1, 1000);
    cameraRef.current.position.z = 100;

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 环境光
    const light = new THREE.AmbientLight( 0xffffff ); // soft white light
    sceneRef.current.add(light);

    // 创建mesh
    const geometry = new THREE.BoxGeometry(40, 40, 40);
    const material = new THREE.MeshStandardMaterial({color: new THREE.Color(0xffffff), map: new THREE.CanvasTexture(pointsRef.current.canvas)});
    meshRef.current = new THREE.Mesh(geometry, material);
    meshRef.current.material.needsUpdate = true;
    sceneRef.current.add(meshRef.current);

    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current
    });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);

    // 控制器
    controlRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    controlRef.current.update();
  }

  /** 渲染函数 */
  const render = () => {
    const time = Date.now() * 0.005;

    meshRef.current.rotation.y = meshRef.current.rotation.z = time * 0.01;

    pointsRef.current.render();
    meshRef.current.material.map.needsUpdate = true;

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    controlRef.current.update();
  }

  /** 动画函数 */
  const animate = () => {
    requestAnimationFrame(animate);
    render();
  }

  /** 屏幕尺寸变化 */
  const onWindowResize = () => {
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  /* ---------- useEffect ---------- */
  useEffect(() => {
    if (!sceneRef.current) {
      init();
      animate();
    }
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
    }
  }, [])

  return (
    <div id="container">
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
