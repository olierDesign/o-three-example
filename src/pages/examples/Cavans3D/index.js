import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import './css/Cavans3D.scss'

const Cavans3D = () => {
  /* ---------- useRef ---------- */
  // 场景
  const sceneRef = useRef();
  // 全局相机
  const globalCamera = useRef();
  // 场内相机
  const sceneCamera = useRef();
  // 场内相机辅助
  const helperRef = useRef();
  // 渲染器
  const rendererRef = useRef();
  // 组
  const groupRef = useRef();
  // id
  const rqfId = useRef();
  // 贴图
  const textureRef = useRef();

  /* ---------- function ---------- */
  // 获取 hdr
  const getHdr = () => new Promise((resolve) => {
    new RGBELoader().load('http://assets.woa.com/open_proj/proj_qcloud_v2/static/hdr-demo.hdr', (texture) => {

      texture.mapping = THREE.EquirectangularReflectionMapping;
      sceneRef.current.environment = texture;
      sceneRef.current.background = texture;
      resolve(texture);
    });
  });
  
  // 获取模型
  const getModel = () => new Promise((resolve) => {
    new GLTFLoader().load('http://assets.woa.com/open_proj/proj_qcloud_v2/static/model-demo.glb', (gltf) => {
      resolve(gltf);
    });
  });

  // 初始化函数
  const init = () => {
    if (sceneRef.current) return;
    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 创建全局相机
    globalCamera.current = new THREE.PerspectiveCamera(50, 0.5 *  window.innerWidth/window.innerHeight, 1, 1000);
    globalCamera.current.position.z = 500;

    // 创建场内相机
    sceneCamera.current = new THREE.PerspectiveCamera(50, 0.5 * window.innerWidth/window.innerHeight, 1, 200);
    sceneCamera.current.position.set(0, 10, 100); 
    sceneCamera.current.lookAt(0, 0, 0);
    sceneRef.current.add(sceneCamera.current);
    helperRef.current = new THREE.CameraHelper( sceneCamera.current );
    sceneRef.current.add( helperRef.current );

    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.outputEncoding = THREE.sRGBEncoding;
    // !!!渲染器在渲染每一帧之前不自动清除其输出
    rendererRef.current.autoClear = false;
    document.getElementById('container').appendChild(rendererRef.current.domElement);
    
    // 创建组
    groupRef.current = new THREE.Group();

    Promise.all([getHdr(), getModel()]).then(([texture, gltf]) => {
      gltf.scene.traverse(child => {
        if (child.isMesh) {
          // console.log(child);
        }
      });
      textureRef.current = texture;
      sceneRef.current.add(gltf.scene);
    });
  }

  // 渲染
  const render = () => {
    // !!!渲染器清除颜色、深度或模板缓存
    rendererRef.current.clear();
    
    // 渲染场内相机
    sceneRef.current.background = textureRef.current;
    helperRef.current.visible = false;
    rendererRef.current.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
    rendererRef.current.render(sceneRef.current, sceneCamera.current);

    // 渲染全局相机
    sceneRef.current.background = null;
    helperRef.current.visible = true;
    rendererRef.current.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    rendererRef.current.render(sceneRef.current, globalCamera.current);

    // hdr
    sceneRef.current.rotation.y += 0.006;
  }

  // 动画
  const animate = () => {
    rqfId.current = requestAnimationFrame(animate);
    render();
  };

  // 屏幕尺寸
  const onWindowResize = () => {
    globalCamera.current.aspect = 0.5 *  window.innerWidth/window.innerHeight;
    // !!!更新摄像机投影矩阵
    globalCamera.current.updateProjectionMatrix();

    sceneCamera.current.aspect = 0.5 * window.innerWidth/window.innerHeight
    // !!!更新摄像机投影矩阵
    sceneCamera.current.updateProjectionMatrix();
    
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };
  
  /* ---------- useEffect ---------- */
  useEffect(() => {
    init();
    animate();
    window.addEventListener('resize', onWindowResize);

    return () => {
      cancelAnimationFrame(rqfId.current);
      window.removeEventListener('resize', onWindowResize);
    }
  }, []);

  return (
    <div id="container"></div>
  );
};

export default Cavans3D;