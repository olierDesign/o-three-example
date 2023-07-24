import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import setGradient from '../../../utils/setGradient';

import './css/GradientMaterial.scss'

export default function GradientMaterial(props) {
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
  const meshRef = useRef(null);
  // 轨道控制器
  const orbitControlRef = useRef(null);
  // 时钟
  const clockRef = useRef(null);

  /* ---------- variable ---------- */
  const gradientColors = [
    {
      stop: 0,
      color: new THREE.Color(1, 0, 0),
    },
    {
      stop: 1,
      color: new THREE.Color(0, 0, 1),
    }
  ];

  /* ---------- function ---------- */
  /** 初始函数 */
  function init() {
    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    cameraRef.current.position.z = 400;

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 创建坐标辅助对象
    const axesHelper = new THREE.AxesHelper(200);
    sceneRef.current.add(axesHelper);

    // 创建环境光
    const light = new THREE.AmbientLight(new THREE.Color(1, 1, 1)); // 柔和的白光
    sceneRef.current.add( light );

    // 创建几何体
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    setGradient({
      geometry,
      colors: gradientColors,
      axis: 'xyz',
      reverse: true,
      rotation: {
        x: 0,
        y: -Math.PI / 2,
        z: 0,
      }
    });

    // 创建材质
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true
    });

    // 创建 Mesh
    meshRef.current = new THREE.Mesh(geometry, material);
    sceneRef.current.add(meshRef.current);

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

    // 开启时钟
    clockRef.current = new THREE.Clock();
  }

  /** 渲染函数 */
  function render() {
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    orbitControlRef.current.update();

    /** 渐变动画 start */
    // 时间
    const time = clockRef.current.getElapsedTime();
    // "位置比例值"偏移量
    const axisOffset = (Math.sin(time) + 1) / 2;
    // 几何体
    const geometry = meshRef.current.geometry;
    // "位置比例值"列表
    const { normalizedAxisList } = geometry.userData;
    // 颜色临时变量
    const colorVector = new THREE.Color();
    // 颜色列表
    const geoColors = [];

    if (!!normalizedAxisList) {
      // 遍历渐变颜色数组
      for (let c = 0; c < gradientColors.length - 1; c++) {
        // 计算相邻颜色区间的色差
        const colorDiff = gradientColors[c + 1].stop - gradientColors[c].stop;

        // 遍历每个顶点的位置比例值
        for (let i = 0; i < normalizedAxisList.length; i++) {
          // 位置比例值 + 偏移量
          const result = Number(((normalizedAxisList[i] + axisOffset) / 2).toFixed(2));
          if (result < 0) result = 0;
          if (result > 1) result = 1;

          // “位置比例值” 在颜色区间范围内
          if (result >= gradientColors[c].stop && result <= gradientColors[c + 1].stop) {
            // 根据“位置比例值”计算“颜色比例值”
            const colorAxis = (result - gradientColors[c].stop) / colorDiff;

            // 根据颜色比例值获取渐变区间的线性插值
            colorVector.lerpColors(gradientColors[c].color, gradientColors[c+1].color, colorAxis);
            // 存储在颜色属性数组中
            colorVector.toArray(geoColors, i * 3);
          }
        }
      }

      // 设置几何体的颜色属性
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(geoColors, 3));
      geometry.attributes.color.needsUpdate = true;
    }
    /** 渐变动画 end */
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