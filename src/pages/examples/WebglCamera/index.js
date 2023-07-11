import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import './css/WebglCamera.scss'

const WebglCamera = () => {
  /* ---------- variable ---------- */
  // 屏幕宽度
  let SCREEN_WIDTH = window.innerWidth;
  // 屏幕高度
  let SCREEN_HEIGHT = window.innerHeight
  // 视锥体长宽比
  let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  
  /* ---------- useRef ---------- */
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
  // 正交相机
  const cameraOrthoRef = useRef();
  
  // 透视相机 Helper
  const cameraPerspectiveHelperRef = useRef();
  // 正交相机 Helper
  const cameraOrthoHelperRef = useRef();

  // 相机组
  const cameraRigRef = useRef();
  // 激活的相机
  const activeCameraRef = useRef();
  // 激活的相机 Helper
  const activeHelperRef = useRef();

  // 截锥体尺寸
  const frustumSize = 600;
  
  /* ---------- function ---------- */
  // 初始化函数
  const init = () => {
    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 创建相机(全局相机)
    cameraRef.current = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 10000 );
    cameraRef.current.position.z = 2500;

    // 透视相机
    cameraPerspectiveRef.current = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 );
    // 透视相机 helper
    cameraPerspectiveHelperRef.current = new THREE.CameraHelper( cameraPerspectiveRef.current );
    // 透视相机 helper 添加到场景 scene 中
    sceneRef.current.add(cameraPerspectiveHelperRef.current);

    // 正交相机
    cameraOrthoRef.current = new THREE.OrthographicCamera( frustumSize * 0.5 * aspect / - 2, frustumSize * 0.5 * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000 );
    // 正交相机 helper
    cameraOrthoHelperRef.current = new THREE.CameraHelper( cameraOrthoRef.current );
    // 正交相机 helper 添加到场景 scene 中
    sceneRef.current.add(cameraOrthoHelperRef.current);

    // 透视相机设置成激活相机
    activeCameraRef.current = cameraPerspectiveRef.current;
    // 透视相机 helper 设置成激活的相机 Helper
    activeHelperRef.current = cameraPerspectiveHelperRef.current;

    // 正交相机 y 轴旋转 Math.PI
    cameraOrthoRef.current.rotation.y = Math.PI;
    // 透视相机 y 轴旋转 Math.PI
    cameraPerspectiveRef.current.rotation.y = Math.PI;

    // 创建相机组
    cameraRigRef.current = new THREE.Group();
    // 相机组添加透视相机
    cameraRigRef.current.add(cameraPerspectiveRef.current);
    // 相机组添加正交相机
    cameraRigRef.current.add(cameraOrthoRef.current);
    // 相机组添加到场景中
    sceneRef.current.add(cameraRigRef.current);

    // 创建白球 Mesh
    meshRef.current = new THREE.Mesh(
      new THREE.SphereGeometry( 100, 16, 8 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } )
    );
    // 白球 Mesh添加到场景中
    sceneRef.current.add(meshRef.current);

    // 创建绿球 Mesh
    const mesh2 = new THREE.Mesh(
      new THREE.SphereGeometry( 50, 16, 8 ),
      new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } )
    );
    mesh2.position.y = 150;
    // 绿球 Mesh添加到白球 Mesh
    meshRef.current.add( mesh2 );

    // 创建蓝球 Mesh：用来标记相机们的近端面
    const mesh3 = new THREE.Mesh(
      new THREE.SphereGeometry( 5, 16, 8 ),
      new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } )
    );
    mesh3.position.z = 150;
    // 蓝球 Mesh添加到相机 Group
    cameraRigRef.current.add(mesh3);

    // 创建 BufferGeometry
    const geometry = new THREE.BufferGeometry();
    // 定点数组
    const vertices = [];
    // 创建xyz坐标随机值
    for ( let i = 0; i < 10000; i ++ ) {
      // 在区间 [- range / 2, range / 2] 内随机一个浮点数
      vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
      vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
      vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z
    }
    // 设置位置
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    // 颗粒点 Mesh
    const particles = new THREE.Points(geometry, new THREE.PointsMaterial({color: 0x888888}));
    // 颗粒点 Mesh 添加到场景
    sceneRef.current.add(particles);

    // 创建 WEBGl 渲染器
    rendererRef.current = new THREE.WebGLRenderer( { antialias: true } );
    rendererRef.current.setPixelRatio( window.devicePixelRatio );
    rendererRef.current.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    document.getElementById('container').appendChild(rendererRef.current.domElement);
    // 渲染器在渲染每一帧之前不自动清除其输出
    rendererRef.current.autoClear = false;

    controlsRef.current = new OrbitControls( cameraRef.current, rendererRef.current.domElement );
    controlsRef.current.update();

    // window.addEventListener( 'resize', onWindowResize );
    // document.addEventListener( 'keydown', onKeyDown );
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
    meshRef.current.position.x = 700 * Math.cos(r);
    meshRef.current.position.y = 700 * Math.sin(r);
    meshRef.current.position.z = 700 * Math.sin(r);

    // 更新绿球 position 位置
    meshRef.current.children[0].position.x = 70 * Math.cos(2 * r);
    meshRef.current.children[0].position.z = 70 * Math.sin(r);

    // 当前激活相机是透视相机还是正交相机
    if (activeCameraRef.current === cameraPerspectiveRef.current) {
      cameraPerspectiveRef.current.fov = 35 + 30 * Math.sin( 0.5 * r );
      // 设置透视相机的 far：从(0, 0, 0) 到 白球位置(x, y, z)的直线长度
      cameraPerspectiveRef.current.far = meshRef.current.position.length();
      // 更新透视摄像机投影矩阵
      cameraPerspectiveRef.current.updateProjectionMatrix();
      // 更新透视相机 Helper
      cameraPerspectiveHelperRef.current.update();

      // 开启透视相机 Helper 可见性
      cameraPerspectiveHelperRef.current.visible = true;
      // 关闭正交相机 Helper 可见性
      cameraOrthoHelperRef.current.visible = false;
    } else {
      // 设置正交相机的 far：从(0, 0, 0) 到 白球位置(x, y, z)的直线长度
      cameraOrthoRef.current.far = meshRef.current.position.length();
      // 更新正交摄像机投影矩阵
      cameraOrthoRef.current.updateProjectionMatrix();
      // 更新正交相机 Helper
      cameraOrthoHelperRef.current.update()

      // 开启正交相机 Helper 可见性
      cameraOrthoHelperRef.current.visible = true;
      // 关闭透视相机 Helper 可见性
      cameraPerspectiveHelperRef.current.visible = false;
    }

    // 相机组朝向白球 Mesh (相机组仍然在中心点)
    cameraRigRef.current.lookAt(meshRef.current.position);

    // 渲染器清除颜色、深度或模板缓存
    rendererRef.current.clear();

    // 关闭激活的相机 Helper 的可见性
    activeHelperRef.current.visible = false;
    // 设置渲染器视口大小（左）
    rendererRef.current.setViewport( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
    // 渲染激活相机的视野
    rendererRef.current.render( sceneRef.current, activeCameraRef.current );

    // 开启激活的相机 Helper 的可见性
    activeHelperRef.current.visible = true;
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
    // 更新正交相机
    cameraPerspectiveRef.current.left = - 0.5 * frustumSize * aspect / 2;
    cameraPerspectiveRef.current.right = 0.5 * frustumSize * aspect / 2;
    cameraPerspectiveRef.current.top = frustumSize / 2;
    cameraPerspectiveRef.current.bottom = - frustumSize / 2;
    cameraPerspectiveRef.current.updateProjectionMatrix();
  }; 

  // 切换激活相机类型
  const onKeyDown = (event) => {
    switch ( event.keyCode ) {
      // 点击 “o”，激活正交相机
      case 79: {
        activeCameraRef.current = cameraOrthoRef.current;
        activeHelperRef.current = cameraOrthoHelperRef.current;
        break;
      }
      // 点击 “p”，激活透视相机
      case 80: {
        activeCameraRef.current = cameraPerspectiveRef.current;
        activeHelperRef.current = cameraPerspectiveHelperRef.current;
        break;
      }
      default: ;
    }
  };

  /** 操作区 */
  const initGui = () => {
    if (!cameraOrthoRef.current || !cameraPerspectiveRef.current) return;

    const params = {
      OrthographicCamera: () => {
        activeCameraRef.current = cameraOrthoRef.current;
        activeHelperRef.current = cameraOrthoHelperRef.current;
      },
      PerspectiveCamera: () => {
        activeCameraRef.current = cameraPerspectiveRef.current;
        activeHelperRef.current = cameraPerspectiveHelperRef.current;
      }
    };

    const gui = new GUI();
    gui.add(params, 'OrthographicCamera');
    gui.add(params, 'PerspectiveCamera');
  }

  /* ---------- useEffect ---------- */
  useEffect(() => {
    init();
    animate();
    initGui();
    window.addEventListener( 'resize', onWindowResize );
    document.addEventListener( 'keydown', onKeyDown );

    return () => {
      rendererRef.current?.domElement && document.getElementById('container').removeChild(rendererRef.current.domElement);
      window.removeEventListener( 'resize', onWindowResize );
      document.removeEventListener( 'keydown', onKeyDown );
    }
  }, []);

  return (
    <div id="container" className="examples__webgl-camera"></div>
  );
};

export default WebglCamera;