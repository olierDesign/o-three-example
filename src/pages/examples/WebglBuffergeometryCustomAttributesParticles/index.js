import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

const WebglBuffergeometryCustomAttributesParticles = () => {
  /* ---------- variable start ---------- */
  // 粒子数量
  const particles = 100000;
  /* ---------- variable start ---------- */

  /* ---------- useRef start ---------- */
  // 相机
  const cameraRef = useRef();
  // 场景
  const sceneRef = useRef();
  // 几何体
  const geometryRef = useRef();
  // 创建粒子模型
  const particleSystemRef = useRef();
  // 渲染器
  const rendererRef = useRef();
  // 画布
  const canvasRef = useRef();
  /* ---------- useRef end ---------- */
  // 渲染
  const render = () => {
    // 获取时间
    const time = Date.now() * 0.005;
    // 旋转粒子模型
    particleSystemRef.current.rotation.z = 0.01 * time;

    // 获取所有粒子的尺寸数组
    const sizes = geometryRef.current.attributes.size.array;
    for (let i = 0; i < particles; i++) {
      /** 
       * 所有点的大小范围
       * 单个点的缩放范围
       */
      sizes[i] = 10 * (1 + Math.sin(0.1 * i + time)); // 0 ~ 20
    }
    // 更新size属性
    geometryRef.current.attributes.size.needsUpdate = true;

    // 渲染
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  // 动画
  const animate = () => {
    requestAnimationFrame(animate);
    render();
  };

  // 屏幕尺寸变化
  const onWindowResize = () => {
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  // 初始化
  const init = () => {
    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    cameraRef.current.position.z = 300;

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // uniforms
    const uniforms = {
      pointTexture: {
        value: new THREE.TextureLoader().load(`${process.env.PUBLIC_URL}/textures/sprites/ball.png`)
      },
    };

    // 创建着色器材质
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
    });
    
    // 点半径
    const radius = 200;

    // 创建几何体
    geometryRef.current = new THREE.BufferGeometry();
    const positions = []; // 位置数组
    const colors = [];    // 颜色数组
    const sizes = [];     // 大小数组
    // 创建颜色(临时变量)
    const color = new THREE.Color();
    // 遍历出 100000 个点
    for (let i = 0; i < particles; i++) {
      // 位置(-200 ~ 200)
      positions.push((Math.random() * 2 - 1) * radius);   // x
      positions.push((Math.random() * 2 - 1) * radius);   // y
      positions.push((Math.random() * 2 - 1) * radius);   // z

      // 颜色
      color.setHSL(i / particles, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);

      // 尺寸
      sizes.push(20);
    }
    geometryRef.current.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometryRef.current.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometryRef.current.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));
    
    // 创建粒子模型
    particleSystemRef.current = new THREE.Points(geometryRef.current, shaderMaterial); 
    // 把粒子模型添加到场景
    sceneRef.current.add(particleSystemRef.current);

    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current
    });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  useEffect(() => {
    if (!sceneRef.current) {
      init();
      animate();
    }
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
    }
  }, []);

  return (
    <div id="container">
      <canvas ref={canvasRef}></canvas>
    </div>
  )
};

export default WebglBuffergeometryCustomAttributesParticles;
