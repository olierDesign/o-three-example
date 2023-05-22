import React, { useRef, useEffect } from "react";

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import "./css/Camera.scss";

const PPTCamera = () => {
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
  // MESH 网格
  const meshRef = useRef();
  // 控制器
  const controlsRef = useRef();

  // 透视相机
  const cameraPerspectiveRef = useRef();
  // 透视相机 Helper
  const cameraPerspectiveHelperRef = useRef();

  // 相机组
  const cameraRigRef = useRef();

  /* ---------- function ---------- */
  // 初始化函数
  const init = () => {
    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 创建相机(全局相机)
    cameraRef.current = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 10000 );
    cameraRef.current.position.z = 2500;

    // 透视相机
    cameraPerspectiveRef.current = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 0.1, 1000 );
    // 透视相机 helper
    cameraPerspectiveHelperRef.current = new THREE.CameraHelper( cameraPerspectiveRef.current );
    // 透视相机 helper 添加到场景 scene 中
    sceneRef.current.add(cameraPerspectiveHelperRef.current);

    // 创建相机组
    cameraRigRef.current = new THREE.Group();
    // 相机组添加透视相机
    cameraRigRef.current.add(cameraPerspectiveRef.current);
    // 相机组添加到场景中
    sceneRef.current.add(cameraRigRef.current);

    // 创建白球 Mesh
    meshRef.current = new THREE.Mesh(
      new THREE.SphereGeometry( 100, 16, 8 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } )
    );
    // 问题：如果 mesh 初始坐标为 （0，0，150） ，是否会出现在局部相机视野中？ 
    // meshRef.current.position.z = 150;
    // 白球 Mesh添加到场景中
    // sceneRef.current.add(meshRef.current);

    // 创建蓝球 Mesh：用来标记相机们的近端面
    const mesh3 = new THREE.Mesh(
      new THREE.SphereGeometry( 5, 16, 8 ),
      new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } )
    );
    // 蓝球 Mesh添加到相机 Group
    // cameraRigRef.current.add(mesh3);

    // 问题：调试相机的 position、lookAt，是否能让 mesh 出现在局部相机视野中？ 
    // 方法一（不推荐，因为目标位置不确定性）：
    // cameraPerspectiveRef.current.position.z = 500;
    // 方法二（不推荐，因为目标位置不确定性）：
    // cameraPerspectiveRef.current.rotation.y = Math.PI;
    // 方法三（推荐）：
    // cameraPerspectiveRef.current.lookAt(meshRef.current.position);

    // 问题：假设相机在 Group 里，调试 Group 的 position、lookAt，是否能让 mesh 出现在局部相机视野中？
    // 方法一（不推荐，因为目标位置不确定性）：
    // cameraRigRef.current.position.z = 500;
    // 方法二（推荐）：
    // cameraRigRef.current.position.x = 500;
    // cameraPerspectiveRef.current.rotation.y = Math.PI;
    // cameraRigRef.current.lookAt(meshRef.current.position);

    const axesHelper = new THREE.AxesHelper( 1000 );
    sceneRef.current.add( axesHelper );

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
  };

  // 动画
  const animate = () => {
    requestAnimationFrame( animate );
    controlsRef.current.update();
    render();
  };

  // 渲染
  const render = () => {
    // 时间比率
    const r = Date.now() * 0.0005;

    // 更新白球 position 位置（不再在中心点）
    // meshRef.current.position.x = 700 * Math.cos(r);
    // meshRef.current.position.y = 700 * Math.sin(r);
    // meshRef.current.position.z = 700 * Math.sin(r);

    // 白球自转
    meshRef.current.rotation.y = r;

    // 设置透视相机的 far：从(0, 0, 0) 到 白球位置(x, y, z)的直线长度
    // cameraPerspectiveRef.current.far = meshRef.current.position.length();
    // 更新透视摄像机投影矩阵
    cameraPerspectiveRef.current.updateProjectionMatrix();
    // 更新透视相机 Helper
    cameraPerspectiveHelperRef.current.update();

    // 相机组朝向白球 Mesh (相机组仍然在中心点)
    // cameraPerspectiveRef.current.lookAt(meshRef.current.position);
    // cameraRigRef.current.lookAt(meshRef.current.position);

    // 渲染器清除颜色、深度或模板缓存
    rendererRef.current.clear();

    // 关闭透视相机 Helper 的可见性
    cameraPerspectiveHelperRef.current.visible = false;
    // 设置渲染器视口大小（左）
    rendererRef.current.setViewport( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
    // 渲染透视相机的视野
    rendererRef.current.render( sceneRef.current, cameraPerspectiveRef.current );

    // 开启透视的相机 Helper 的可见性
    cameraPerspectiveHelperRef.current.visible = true;
    // 设置渲染器视口大小（右）
    rendererRef.current.setViewport(SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
    // 渲染全局视野
    rendererRef.current.render( sceneRef.current, cameraRef.current );
  };

  // 屏幕尺寸
  const onWindowResize = () => {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    // 更新渲染器
    rendererRef.current.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    // 更新全局相机
    cameraRef.current.aspect = 0.5 * aspect;
    cameraRef.current.updateProjectionMatrix();
    // 更新透视相机
    cameraPerspectiveRef.current.aspect =  0.5 * aspect;
    cameraPerspectiveRef.current.updateProjectionMatrix();
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
};

export default PPTCamera;
