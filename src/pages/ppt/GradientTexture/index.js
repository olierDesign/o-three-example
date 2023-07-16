import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import './css/GradientTexture.scss'

export default function GradientTexture(props) {
  /* ---------- state ---------- */
  // 画布
  const canvasRef = useRef(null);
  // 场景
  const sceneRef = useRef(null);
  // 渲染器
  const rendererRef = useRef(null);
  // 相机
  const cameraRef = useRef(null);
  // mesh
  const MeshRef = useRef(null);
  // 轨道控制器
  const orbitControlRef = useRef(null);

  /* ---------- function ---------- */
  /** 创建渐变画布 */
  function createGradientCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, canvas.height, canvas.width, 0);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(1, '#0000ff');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    return canvas;
  }

  /** 初始函数 */
  function init() {
    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    cameraRef.current.position.z = 400;

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 创建环境光
    const light = new THREE.AmbientLight(new THREE.Color(1, 1, 1)); // 柔和的白光
    sceneRef.current.add( light );

    // 创建 mesh
    const gradientTexture = new THREE.CanvasTexture(createGradientCanvas());
    gradientTexture.mapping = THREE.CubeReflectionMapping;
    gradientTexture.wrapS = THREE.RepeatWrapping;
    gradientTexture.wrapT = THREE.RepeatWrapping;
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshStandardMaterial({
      map: gradientTexture
    });
    MeshRef.current = new THREE.Mesh(geometry, material);
    sceneRef.current.add(MeshRef.current);

    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    rendererRef.current.getPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);

    // 创建轨道控制器
    orbitControlRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    orbitControlRef.current.update();
  }

  /** 渲染函数 */
  function render() {
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    orbitControlRef.current.update();
  }

  /** 动画函数 */
  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  /** 屏幕尺寸变化 */
  function onWindowResize() {
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
  );
}