import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const WebglMaterialsCubemapDynamic = () => {
  /* ---------- useRef ---------- */
  // 画布
  const canvasRef = useRef(null);
  // 相机
  const cameraRef = useRef(null);
  // 立方相机
  const cubeCameraRef = useRef(null);
  // 场景
  const sceneRef = useRef(null);
  // 渲染器
  const rendererRef = useRef(null);
  // 控制器
  const controlRef = useRef(null);
  // 立方体 mesh
  const cubeMeshRef = useRef(null);
  // 圆环扭结几何体 mesh
  const torusknotMeshRef = useRef(null);

  /* ---------- variable ---------- */
  const comCls = 'examples__webgl-materials-cubemap-dynamic';

  /* ---------- function ---------- */
  /** 
   * 动画 
   * msTime: 毫秒
   */
  const animate = (msTime) => {
    const time = msTime / 1000;

    // 立方体 mesh 位移
    cubeMeshRef.current.position.x = Math.cos(time) * 30;
    cubeMeshRef.current.position.y = Math.sin(time) * 30;
    cubeMeshRef.current.position.z = Math.sin(time) * 30;
    // 立方体 mesh 旋转
    cubeMeshRef.current.rotation.x += 0.02;
    cubeMeshRef.current.rotation.y += 0.03;

    // 圆环扭结几何体 mesh 位移
    torusknotMeshRef.current.position.x = Math.cos(time + 10) * 30;
    torusknotMeshRef.current.position.y = Math.sin(time + 10) * 30;
    torusknotMeshRef.current.position.z = Math.sin(time + 10) * 30;
    // 圆环扭结几何体 mesh 旋转
    torusknotMeshRef.current.rotation.x += 0.02;
    torusknotMeshRef.current.rotation.y += 0.03;

    // 更新立方体相机
    cubeCameraRef.current.update(rendererRef.current, sceneRef.current);
    // 更新轨道控制器
    controlRef.current.update();

    // 渲染
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  /** 屏幕监听处理器 */
  const onWindowResized = () => {
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  /** 初始函数 */
  const init = () => {
    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    // !!!自动更新动画
    rendererRef.current.setAnimationLoop(animate);
    // !!!色调映射
    rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;

    // 创建屏幕尺寸监听器
    window.addEventListener('resize', onWindowResized);

    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    cameraRef.current.position.z = 75;

    // 创建场景
    sceneRef.current = new THREE.Scene();
    // 避免飞行物遮挡太阳
    sceneRef.current.rotation.y = 0.5;

    // 加载环境贴图
    const loader = new RGBELoader();
    loader.load(`${process.env.PUBLIC_URL}/textures/equirectangular/quarry_01_1k.hdr`, texture => {
      // !!!贴图映射方式
      texture.mapping = THREE.EquirectangularReflectionMapping;

      // 贴图赋值场景背景和环境
      sceneRef.current.background = texture;
      sceneRef.current.environment = texture;
    });

    // !!!创建 webgl 立方体渲染目标
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    // !!!立方体渲染目标的贴图数据类型
    cubeRenderTarget.texture.type = THREE.HalfFloatType;

    // !!!创建立方相机
    cubeCameraRef.current = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

    // 创建材质
    const material = new THREE.MeshStandardMaterial({
      envMap: cubeRenderTarget.texture,   // !!!
      roughness: 0.05,
      metalness: 1,
    });

    // 创建操作区
    const gui = new GUI();
    gui.add(material, 'roughness', 0, 1);
    gui.add(material, 'metalness', 0, 1);
    // !!!色调映射的曝光级别
    gui.add(rendererRef.current, 'toneMappingExposure', 0, 2);

    // 创建球体
    const sphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(15, 8),
      material
    );
    sceneRef.current.add(sphere);

    // 创建材质2
    const material2 = new THREE.MeshStandardMaterial({
      roughness: 0.1,
      metalness: 0,
    });

    // 创建立方体mesh
    cubeMeshRef.current = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 15), material2);
    sceneRef.current.add(cubeMeshRef.current);

    // 创建圆环纽结几何体 mesh
    torusknotMeshRef.current = new THREE.Mesh(new THREE.TorusKnotGeometry(8, 3, 128, 16), material2);
    sceneRef.current.add(torusknotMeshRef.current);

    // 创建轨道控制器
    controlRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    // !!!轨道控制器自动旋转
    controlRef.current.autoRotate = true;
  };

  /** 屏幕尺寸更新 */

  /* ---------- useEffect ---------- */
  useEffect(() => {
    if (!sceneRef.current) {
      init();
    }
  }, []);

  return (
    <div className={comCls} id="container">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default WebglMaterialsCubemapDynamic;
