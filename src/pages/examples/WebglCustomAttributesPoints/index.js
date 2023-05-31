import React, {useEffect, useRef} from 'react';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

const WebglCustomAttributesPoints = () => {
  /* ---------- useRef ---------- */
  // 渲染器
  const rendererRef = useRef(null);
  // 场景
  const sceneRef = useRef(null);
  // 相机
  const cameraRef = useRef(null);
  // 点 Mesh
  const sphereRef = useRef(null);
  // 轨道控制器
  const controlRef = useRef(null);
  // 画布
  const canvasRef = useRef(null);

  /* ---------- variable ---------- */
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;

  /* ---------- function ---------- */
  /** 屏幕尺寸监听函数 */
  const onWindowResize  = () => {
    // 更新相机
    cameraRef.current.aspect = WIDTH / HEIGHT;
    cameraRef.current.updateProjectionMatrix();

    // 更新渲染器
    rendererRef.current.setSize(WIDTH, HEIGHT);
  };

  /** 初始化 */
  const init = () => {
    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 1, 10000);
    cameraRef.current.position.z = 300;

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 点的数量
    const amount = 100000;
    // 点所在的范围，是一个半径为 200 的区域
    const radius = 200;

    // 几何体属性 —— 位置数组
    const positions = new Float32Array(amount * 3);
    // 几何体属性 —— 颜色数组
    const colors = new Float32Array(amount * 3);
    // 几何体属性 —— 点的大小
    const sizes = new Float32Array(amount);

    // 临时变量 —— 坐标向量
    const vertex = new THREE.Vector3();
    // 临时变量 —— 颜色
    const color = new THREE.Color(0xffffff);

    // 设置几何体属性 —— 位置 + 颜色 + 点的大小
    for (let i = 0; i < amount; i++) {
      // 配置随机位置 (-radius ~ radius)
      vertex.x = (Math.random() * 2 - 1) * radius;
      vertex.y = (Math.random() * 2 - 1) * radius;
      vertex.z = (Math.random() * 2 - 1) * radius;
      // 把随机位置保存在“位置数组 positions”
      vertex.toArray(positions, i * 3);

      // 配置颜色
      if (vertex.x < 0) {
        /**
         * 色相: 0.5 ～ 0.6
         * 饱和度: 0.7
         * 亮度: 0.5
         */
        color.setHSL(0.5 + 0.1 * (i / amount), 0.7, 0.5);
      } else {
        /**
         * 色相: 0.0 ～ 0.1
         * 饱和度: 0.9
         * 亮度: 0.5
         */
        color.setHSL(0.0 + 0.1 * (i / amount), 0.9, 0.5);
      }
      // 把颜色保存在“颜色数组 colors”
      color.toArray(colors, i * 3);

      // 配置点的大小
      sizes[i] = 10;
    }

    // 创建几何体
    const geometry = new THREE.BufferGeometry();
    // 添加位置属性
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    // 添加自定义颜色属性
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    // 添加点的大小属性
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // 创建着色器材质
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0xffffff)
        },
        pointTexture: {
          value: new THREE.TextureLoader().load(`${process.env.PUBLIC_URL}/textures/sprites/spark1.png`)
        }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    // 创建点 Mesh
    sphereRef.current = new THREE.Points(geometry, material);
    // 把点 Mesh 添加到场景中
    sceneRef.current.add(sphereRef.current);

    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current
    });
    // 设置渲染器设备像素比
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    // 设置渲染器大小
    rendererRef.current.setSize(WIDTH, HEIGHT);

    // 创建轨道控制器
    controlRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    sceneRef.current.add(controlRef.current);

    // 监听屏幕尺寸变化
    window.addEventListener('resize', onWindowResize);
  };

  /** 渲染 */
  const render = () => {
    // 获取时间
    const time = Date.now() * 0.005;

    // Mesh 绕 y 轴旋转
    sphereRef.current.rotation.z = 0.01 * time;

    // 获取 Mesh 的几何体
    const geometry = sphereRef.current.geometry;
    // 获取几何体的属性
    const attributes = geometry.attributes;

    // 随时间更新 size 的大小 (1.x ~ 27.x 左右)
    for (let i = 0; i < attributes.size.array.length; i++) {
      attributes.size.array[i] = 14 + 13 * Math.sin(0.1 * i + time);
    }

    // 重新编译 size 材质属性
    attributes.size.needsUpdate = true;

    // 渲染
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  /** 动画 */
  const animate = () => {
    // 重复执行动画
    requestAnimationFrame(animate);

    // 更新轨道控制器
    controlRef.current.update();

    // 渲染
    render();
  };

  /* ---------- useEffect ---------- */
  useEffect(() => {
    if (!sceneRef.current) {
      init();
      animate();
    }

    return () => {
      // 取消监听屏幕尺寸变化
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return (
    <div id="container">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default WebglCustomAttributesPoints;

/**
 * example 小结：
 * 左右分界的思路：利用坐标的 x 轴的正负值做区分
 * 色相：0 ~ 1 的色值
 * !!不断渲染时，随着时间变化，更新点的大小：Math.sin(0.1 * i + time)
 * !!顶点着色器中，gl_PointSize 会根据视觉矩阵的 z 轴调整点的大小
 */