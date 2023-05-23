import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

const WebglBuffergeometrySelectiveDraw = () => {
  /* ---------- useRef ---------- */
  // 相机
  const cameraRef = useRef();
  // 场景
  const sceneRef = useRef();
  // 渲染器
  const rendererRef = useRef();
  // 几何体
  const geometryRef = useRef();
  // 网格
  const meshRef = useRef();
  // 隐藏的线的数量
  const numLinesCulledRef = useRef(0);
  // 控制器
  const controlsRef = useRef();

  /* ---------- variable ---------- */
  // 纬度数量
  const numLat = 100;
  // 经度数量
  const numlng = 200;

  /* ---------- function ---------- */
  /** 更新屏幕尺寸 */
  const onWindowResize = () => {
    // 更新相机
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();

    // 更新渲染器
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  /**
   * 创建线段
   * radius 线段长度（球的半径）
   */
  const addLines = (radius) => {
    // 创建几何体
    geometryRef.current = new THREE.BufferGeometry();

    // 位置、颜色、显隐属性（起始点 & 终点）
    const linePositions = new Float32Array(numLat * numlng * 3 * 2);
    const lineColors = new Float32Array(numLat * numlng * 3 * 2);
    const visible = new Float32Array(numLat * numlng * 2);

    for (let i = 0; i < numLat; i++) {
      for (let j = 0; j < numlng; j++) {
        // 获取经纬度（经纬 0-180度，在这个基础上加 0-3.6 度范围内的偏差）
        // 注释：(Math.random() * Math.PI) / 50.0 ,查看效果
        const lat = (Math.random() * Math.PI) / 50.0 + i / numLat * Math.PI;
        const lng = (Math.random() * Math.PI) / 50.0 + j / numlng * 2 * Math.PI;

        // 序号
        const index = i * numlng + j;

        // 位置 position 属性
        linePositions[index * 6 + 0] = 0.0; // 起始点 x
        linePositions[index * 6 + 1] = 0.0; // 起始点 y
        linePositions[index * 6 + 2] = 0.0; // 起始点 z
        linePositions[index * 6 + 3] = radius * Math.sin(lat) * Math.cos(lng); // 终点 x
        linePositions[index * 6 + 4] = radius * Math.cos(lat);                 // 终点 y
        linePositions[index * 6 + 5] = radius * Math.sin(lat) * Math.sin(lng); // 终点 z

        // 颜色 color 属性
        const color = new THREE.Color(0xffffff);

        color.setHSL(lat / Math.PI, 1.0, 0.2);
        lineColors[index * 6 + 0] = color.r;  // 起始点 r
        lineColors[index * 6 + 1] = color.g;  // 起始点 g
        lineColors[index * 6 + 2] = color.b;  // 起始点 b

        color.setHSL(lat / Math.PI, 1.0, 0.7);
        lineColors[index * 6 + 3] = color.r;  // 终点 r
        lineColors[index * 6 + 4] = color.g;  // 终点 g
        lineColors[index * 6 + 5] = color.b;  // 终点 b

        // 隐藏 visible 属性
        visible[index * 2 + 0] = 1.0;  // 起始点 visible
        visible[index * 2 + 1] = 1.0;  // 终点 visible
      }
    }

    // 设置当前几何体的属性
    geometryRef.current.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    geometryRef.current.setAttribute('vertColor', new THREE.BufferAttribute(lineColors, 3));
    geometryRef.current.setAttribute('visible', new THREE.BufferAttribute(visible, 1));

    // 计算当前几何体的的边界球形
    geometryRef.current.computeBoundingSphere();

    // 创建着色器
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    // 创建 mesh
    meshRef.current = new THREE.LineSegments(geometryRef.current, shaderMaterial);
    // 把 mesh 添加到场景
    sceneRef.current.add(meshRef.current);
  };

  /** 隐藏随机线段 */
  const hideLines = () => {
    for (let i = 0; i < geometryRef.current.attributes.visible.array.length; i += 2) {
      // 隐藏 25% 的线段
      if (Math.random() > 0.75) {
        // 计算隐藏的线的数量，保证不重复计算
        if (geometryRef.current.attributes.visible.array[i + 0]) {
          numLinesCulledRef.current += 1;
        }

        // 设置当前线段的起始点 & 终点的 visible 为 0
        geometryRef.current.attributes.visible.array[i + 0] = 0.0;
        geometryRef.current.attributes.visible.array[i + 1] = 0.0;
      }
    }

    // 更新材质属性
    geometryRef.current.attributes.visible.needsUpdate = true;
  };

  /** 显示所有线段 */
  const showAllLines = () => {
    // 重置隐藏的线的数量
    numLinesCulledRef.current = 0;

    for (let i = 0; i < geometryRef.current.attributes.visible.array.length; i += 2) {
      // 设置所有线段的起始点 & 终点的 visible 为 1
      geometryRef.current.attributes.visible.array[i + 0] = 1.0;
      geometryRef.current.attributes.visible.array[i + 1] = 1.0;
    }

    // 更新材质属性
    geometryRef.current.attributes.visible.needsUpdate = true;
  };

  /** 初始化 */
  const init = () => {
    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
    })
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(rendererRef.current.domElement);

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10);
    cameraRef.current.position.z = 3.5;

    // 创建环境光
    const light = new THREE.AmbientLight( 0x444444 );
    sceneRef.current.add(light);

    // 控制器
    controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);

    // 监听屏幕尺寸
    window.addEventListener( 'resize', onWindowResize );

    // 添加线段
    addLines(1.0);
  };

  /** 动画 */
  const animate = () => {
    // 循环动画
    requestAnimationFrame( animate );

    // 获取时间
    const time = Date.now() * 0.001;

    // mesh 旋转
    meshRef.current.rotation.x = time * 0.25;
    meshRef.current.rotation.y = time * 0.5;

    // 渲染
    rendererRef.current.render(sceneRef.current, cameraRef.current);

    // 更新控制器
    controlsRef.current.update();
  };

  /** 操作区 */
  const initGui = () => {
    const params = {
      hideLines,
      showAllLines,
    };

    const gui = new GUI();
    gui.add(params, 'hideLines');
    gui.add(params, 'showAllLines');
  }

  /* ---------- useEffect ---------- */
  useEffect(()=> {
    if (!sceneRef.current) {
      init();
      animate();
    }
  }, []);

  useEffect(()=> {
    if (!meshRef.current) return;

    initGui();
  }, [meshRef.current]);
}

export default WebglBuffergeometrySelectiveDraw;
