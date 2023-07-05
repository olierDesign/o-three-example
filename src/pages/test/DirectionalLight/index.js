import React, { useRef, useEffect } from "react";

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import "./css/DirectionalLight.scss";

function DirectionalLight (props) {
  /* ---------- variable ---------- */
  // 屏幕宽度
  let SCREEN_WIDTH = window.innerWidth;
  // 屏幕高度
  let SCREEN_HEIGHT = window.innerHeight;
  // 视锥体长宽比
  let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

  /* ---------- useRef ---------- */
  // dom 容器
  const containerDom = useRef(null);
  // 摄像机
  const cameraRef = useRef();
  // 场景
  const sceneRef = useRef();
  // WEBGL 渲染器
  const rendererRef = useRef();
  // 控制器
  const controlsRef = useRef();

  /* ---------- function ---------- */
  // 屏幕尺寸
  const onWindowResize = () => {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    // 更新渲染器
    rendererRef.current.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    // 更新全局相机
    cameraRef.current.aspect = aspect;
    cameraRef.current.updateProjectionMatrix();
  }; 

  // 初始化函数
  const init = () => {
    // 创建场景
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0xcccccc);

    // 创建相机(全局相机)
    cameraRef.current = new THREE.PerspectiveCamera( 50, aspect, 0.1, 1000 );
    cameraRef.current.position.z = 500;

    // 创建mesh
    const geometry = new THREE.BoxGeometry( 30, 30, 30 );
    const material = new THREE.MeshStandardMaterial({color: new THREE.Color(0, 0, 1)});
    const mesh = new THREE.Mesh(geometry, material);
    
    for (let i = 0; i < 5; i++) {
      const copyMesh = mesh.clone();
      copyMesh.position.set(i * 100 - 200 , 0, 0)
      sceneRef.current.add(copyMesh);
    }

    // 灯光
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(0, 0, 1).normalize();
    sceneRef.current.add( directionalLight );

    // 创建 WEBGl 渲染器
    rendererRef.current = new THREE.WebGLRenderer( { antialias: true } );
    rendererRef.current.setPixelRatio( window.devicePixelRatio );
    rendererRef.current.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    // 渲染器在渲染每一帧之前不自动清除其输出
    rendererRef.current.autoClear = false;
    // 把渲染器的 dom 元素添加到容器 dom 中
    containerDom.current.appendChild(rendererRef.current.domElement);

    controlsRef.current = new OrbitControls( cameraRef.current, rendererRef.current.domElement );
    controlsRef.current.update();
  }

  // 动画
  const animate = () => {
    requestAnimationFrame( animate );
    controlsRef.current.update();
    render();
  };

  // 渲染
  const render = () => {
    // 渲染全局视野
    rendererRef.current.render( sceneRef.current, cameraRef.current );
  };

   /* ---------- useEffect ---------- */
   useEffect(() => {
    if (!sceneRef.current) {
      init();
      animate();
    }
    window.addEventListener( 'resize', onWindowResize );

    return () => {
      window.removeEventListener( 'resize', onWindowResize );
    };
  }, []);

  return <div id="container" ref={containerDom}></div>;
}

export default DirectionalLight;
