import React, { useRef, useEffect } from 'react';

import * as THREE from 'three';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

const WebglCustomAttributes = () => {
  // 渲染器
  const rendererRef = useRef(null);
  // 场景
  const sceneRef = useRef(null);
  // 相机
  const cameraRef = useRef(null);
  // 球几何体
  const sphereRef = useRef(null);
  // 全局对象
  const uniformsRef = useRef(null);
  // 位移
  const displacementRef = useRef(null);
  // 噪音
  const noiseRef = useRef(null);
  // 画布
  const canvasRef = useRef(null);

  /* --------- function --------- */
  /** 屏幕尺寸变化 */
  const onWindowResize = () => {
    // 更新相机
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();

    // 更新画布
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  /** 初始化 */
  const init = () => {
    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    cameraRef.current.position.z = 300;

    // 创建场景
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x050505);

    // 全局对象
    uniformsRef.current = {
      // 振幅
      amplitude: {
        value: 1.0,
      },
      // 颜色
      color: {
        value: new THREE.Color(0xff2200),
      },
      // 颜色贴图
      colorTexture: {
        value: new THREE.TextureLoader().load(`${process.env.PUBLIC_URL}/textures/water.jpg`), 
      }
    };
    // 设置颜色贴图的重复模式
    uniformsRef.current.colorTexture.value.wrapS = THREE.RepeatWrapping;
    uniformsRef.current.colorTexture.value.wrapT = THREE.RepeatWrapping;

    // 创建着色器材质
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    /**
     * 球几何体
     * radius: 球体半径
     * segments: 水平分段数
     * rings: 垂直分段数
     */
    const radius = 50, segments = 128, rings = 64;
    // 创建球几何体
    const geometry = new THREE.SphereGeometry(radius, segments, rings);

    // 创建位置数组(位移数量和 position 数量一致)
    displacementRef.current = new Float32Array(geometry.attributes.position.count);
    // 创建噪音数组（噪音数量和 position 数量一致）
    noiseRef.current = new Float32Array(geometry.attributes.position.count);

    // 设置每个 postion 的 noise 随机值 (0 ~ 5)
    for (let i = 0; i < noiseRef.current.length; i++) {
      noiseRef.current[i] = Math.random() * 5;
    }

    // 球几何体添加属性 displacement
    geometry.setAttribute('displacement', new THREE.BufferAttribute(displacementRef.current, 1));

    // 创建 mesh
    sphereRef.current = new THREE.Mesh(geometry, shaderMaterial);
    // mesh 添加到 scene 中
    sceneRef.current.add(sphereRef.current);

    // 渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current
    });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  /** 渲染 */
  const render = () => {
    // 获取时间
    const time = Date.now() * 0.01;
    // 旋转 mesh
    sphereRef.current.rotation.y = sphereRef.current.rotation.z = 0.01 * time;
    // 振幅跟随转动变化
    uniformsRef.current.amplitude.value = 2.5 * Math.sin(sphereRef.current.rotation.y * 0.125);
    // 将给定的 h, s, 和 l值加到当前颜色值
    uniformsRef.current.color.value.offsetHSL(0.0005, 0, 0);

    for (let i = 0; i < displacementRef.current.length; i++) {
      // 位移
      displacementRef.current[i] = Math.sin(0.1 * i + time);
      // // 噪音增量 -0.25 ~ -0.25
      noiseRef.current[i] += 0.5 * (0.5 - Math.random());
      // // 噪音的范围在 -5 ～ 5 之间
      noiseRef.current[i] = THREE.MathUtils.clamp(noiseRef.current[i], -5, 5);
      // // 位移 = 位移 + 噪音
      displacementRef.current[i] += noiseRef.current[i];
    }

    // 更新 mesh 的 displacement 属性
    sphereRef.current.geometry.attributes.displacement.needsUpdate = true;

    // 渲染
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  /** 动画 */
  const animate = () => {
    requestAnimationFrame(animate);
    render();
  };

  /* --------- useEffect --------- */
  useEffect(() => {
    if (!sceneRef.current) {
      init();
      animate();
    }
    window.addEventListener( 'resize', onWindowResize );

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

export default WebglCustomAttributes;

/**
 * example 小结：
 * 1、displacement（位移）：是球体表面 position 垂直偏移量，它是 sin 线性分布
 * 2、noise（噪音）：由随机值产生，让 displacement（位移） 平滑的 sin 线变得躁动
 * 3、amplitude（振幅）：由 y 轴旋转角度 (rotation.y) 决定振幅大小
 * 
 * vetexShader
 * 1、vUv（贴图坐标）：跟随振幅发生缩放和位移
 * 2、position 的法向量(normal)方向，会叠加 amplitude（振幅）和 displacement（位移）
 * 
 * fragmentShader
 * 1、光的强度（dProd） = 标准化光向量和法向量的点积
 * 2、灰度贴图 = vec4(vec3(系数1 * 贴图.r + 系数2 * 贴图.g + 系数3 * 贴图.b), 1.0); RGB的系数之和为1
 */