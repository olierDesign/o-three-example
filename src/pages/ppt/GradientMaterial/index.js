import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
  const MeshRef = useRef(null);
  // 轨道控制器
  const orbitControlRef = useRef(null);

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
  ]

  /* ---------- function ---------- */
  /**
   * 设置渐变
   * @param {*} geometry  几何体
   * @param {*} colors    渐变颜色
   * @param {*} axis      渐变轴
   * @param {*} reverse   是否反向
   */
  function setGradient(geometry, colors, axis, reverse) {
    // 计算当前几何体的的边界矩形
    geometry.computeBoundingBox();
    // 获取几何体的外边界矩形 (Box3)
    const geoBoundingBox = geometry.boundingBox;
    // 计算几何体范围
    const geoBoundingSize = new THREE.Vector3().subVectors(geoBoundingBox.max, geoBoundingBox.min);
    
    // “位置变量”在“边界矩形”范围内的“标准化设备坐标”
    const normalized = new THREE.Vector3();
    // “标准化设备坐标”中 axis 轴的值
    let normalizedAxis = 0;

    // 位置列表
    const geoPositions = geometry.attributes.position;
    // 位置临时变量
    const posVector = new THREE.Vector3();
    // 颜色列表
    const geoColors = [];
    // 颜色临时变量
    const colorVector = new THREE.Color();

    // 遍历渐变颜色数组
    for (let c = 0; c < colors.length - 1; c++) {
      // 计算相邻颜色的色差
      const colorDiff = colors[c + 1].stop - colors[c].stop;

      for (let i = 0; i < geoPositions.count; i++) {
        posVector.fromArray(geoPositions.array, i * 3);
        normalizedAxis = normalized.subVectors(posVector, geoBoundingBox.min).divide(geoBoundingSize)[axis];

        // 反向处理
        if (reverse) {
          normalizedAxis = 1 - normalizedAxis;
        }

        // 根据坐标轴的值计算颜色
        if (normalizedAxis >= colors[c].stop && normalizedAxis <= colors[c + 1].stop) {
          // 计算颜色区间中，当前位置的颜色比例
          const localNormalizedAxis = (normalizedAxis - colors[c].stop) / colorDiff;
          // 将 colorVector 设置为线性插值颜色 colors[c] 和 colors[c+1] 
          colorVector.lerpColors(colors[c].color, colors[c+1].color, localNormalizedAxis);
          colorVector.toArray(geoColors, i * 3);
        }
      }
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(geoColors, 3));
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

    // 创建几何体
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    setGradient(geometry, gradientColors, 'z', false);

    // 创建材质
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true
    });

    // 创建 Mesh
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
  );
}