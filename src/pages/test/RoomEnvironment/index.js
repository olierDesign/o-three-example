import React, { useRef, useEffect } from "react";

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import "./css/RoomEnvironment.scss";

function RoomEnvironment (props) {
  /* ---------- variable ---------- */

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
  function onWindowResize() {
    // 更新渲染器
    rendererRef.current.setSize( window.innerWidth, window.innerHeight );
    // 更新全局相机
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
  };

  function createAreaLightMaterial(intensity) {
    const material = new THREE.MeshBasicMaterial();
    material.color.setScalar(intensity);
    return material;
  }

  // 初始化函数
  function init() {
    // 创建相机(全局相机)
    cameraRef.current = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
    cameraRef.current.position.z = 500;

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 创建立方几何体
    const geometry = new THREE.BoxGeometry();
    geometry.deleteAttribute( 'uv' );
    
    // 创建房间材质
    const roomMaterial = new THREE.MeshStandardMaterial({
      side: THREE.BackSide
    });
    
    // 创建盒子材质
    const boxMaterial = new THREE.MeshStandardMaterial();

    // 添加点光源
    const mainLight = new THREE.PointLight(0xffffff, 5.0, 28, 2);
    mainLight.position.set(0.418, 16.199, 0.300);
    sceneRef.current.add(mainLight);

    // 创建房间 MESH
    const room = new THREE.Mesh(geometry, roomMaterial);
    room.position.set(-0.757, 13.219, 0.717);
    room.scale.set(31.713, 28.305, 28.591);
    sceneRef.current.add(room);

    // 创建盒子1 Mesh
    const box1 = new THREE.Mesh(geometry, boxMaterial);
    box1.position.set(-10.906, 2.009, 1.846);
    box1.rotation.set(0, -0.195, 0);
    box1.scale.set(2.328, 7.905, 4.651);
    sceneRef.current.add(box1);

    // 创建盒子2 Mesh
    const box2 = new THREE.Mesh(geometry, boxMaterial);
    box2.position.set(-5.607, -0.754, -0.758 );
    box2.rotation.set(0, 0.994, 0);
    box2.scale.set(1.970, 1.534, 3.955);
    sceneRef.current.add(box2);

    // 创建盒子3 Mesh
    const box3 = new THREE.Mesh(geometry, boxMaterial);
    box3.position.set(6.167, 0.857, 7.803);
    box3.rotation.set(0, 0.561, 0);
    box3.scale.set(3.927, 6.285, 3.687);
    sceneRef.current.add(box3);

    // 创建盒子4 Mesh
    const box4 = new THREE.Mesh(geometry, boxMaterial);
    box4.position.set(-2.017, 0.018, 6.124);
    box4.rotation.set(0, 0.333, 0);
    box4.scale.set(2.002, 4.566, 2.064);
    sceneRef.current.add(box4);

    // 创建盒子5 Mesh
    const box5 = new THREE.Mesh(geometry, boxMaterial);
    box5.position.set(2.291, -0.756, -2.621);
    box5.rotation.set(0, -0.286, 0);
    box5.scale.set(1.546, 1.552, 1.496);
    sceneRef.current.add(box5);

    // 创建盒子6 Mesh
    const box6 = new THREE.Mesh(geometry, boxMaterial);
    box6.position.set(-2.193, -0.369, -5.547);
    box6.rotation.set(0, 0.516, 0);
    box6.scale.set(3.875, 3.487, 2.986);
    sceneRef.current.add(box6);

    // 创建灯光1
    const light1 = new THREE.Mesh(geometry, createAreaLightMaterial(50));
    light1.position.set(-16.116, 14.37, 8.208);
    light1.scale.set(0.1, 2.428, 2.739);
    sceneRef.current.add(light1); // -x left

    // 创建灯光2
    const light2 = new THREE.Mesh(geometry, createAreaLightMaterial(50));
    light2.position.set(-16.109, 18.021, -8.207);
    light2.scale.set(0.1, 2.425, 2.751);
    sceneRef.current.add(light2);

    // 创建灯光3
    const light3 = new THREE.Mesh(geometry, createAreaLightMaterial(17));
    light3.position.set(14.904, 12.198, -1.832);
    light3.scale.set(0.15, 4.265, 6.331);
    sceneRef.current.add(light3);

    // 创建灯光4
    const light4 = new THREE.Mesh(geometry, createAreaLightMaterial(43));
    light4.position.set(-0.462, 8.89, 14.520);
    light4.scale.set(4.38, 5.441, 0.088);
    sceneRef.current.add(light4);

    // 创建灯光5
    const light5 = new THREE.Mesh(geometry, createAreaLightMaterial(20));
    light5.position.set(3.235, 11.486, -12.541);
    light5.scale.set(2.5, 2.0, 0.1);
    sceneRef.current.add(light5);

    // 创建灯光5
    const light6 = new THREE.Mesh(geometry, createAreaLightMaterial(100));
    light6.position.set(0.0, 20.0, 0.0);
    light6.scale.set(1.0, 0.1, 1.0);
    sceneRef.current.add(light6);

    // 创建 WEBGl 渲染器
    rendererRef.current = new THREE.WebGLRenderer( { antialias: true } );
    rendererRef.current.setPixelRatio( window.devicePixelRatio );
    rendererRef.current.setSize( window.innerWidth, window.innerHeight );
    // 渲染器在渲染每一帧之前不自动清除其输出
    rendererRef.current.autoClear = false;
    // 把渲染器的 dom 元素添加到容器 dom 中
    containerDom.current.appendChild(rendererRef.current.domElement);

    controlsRef.current = new OrbitControls( cameraRef.current, rendererRef.current.domElement );
    controlsRef.current.update();
  }

  // 动画
  function animate() {
    requestAnimationFrame( animate );
    controlsRef.current.update();
    render();
  }

  // 渲染
  function render() {
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }

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

export default RoomEnvironment;
