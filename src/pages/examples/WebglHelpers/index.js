import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import { VertexTangentsHelper } from 'three/examples/jsm/helpers/VertexTangentsHelper';

const WebglHelpers = () => {
  /* ---------- useRef ---------- */
  // 画布
  const canvasRef = useRef(null);
  // 相机
  const cameraRef = useRef(null);
  // 场景
  const sceneRef = useRef(null);
  // 渲染器
  const rendererRef = useRef(null);
  // 点光源
  const lightRef = useRef(null);
  

  /* ---------- variable ---------- */
  const comCls = 'examples__webgl_helpers';

  /* ---------- function ---------- */
  /** 初始化 */
  function init() {
    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current
    });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);

    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    cameraRef.current.position.z = 400;

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 创建点光源
    lightRef.current = new THREE.PointLight();
    lightRef.current.position.set(200, 100, 150);
    sceneRef.current.add(lightRef.current);

    // 创建点光源辅助对象
    sceneRef.current.add(new THREE.PointLightHelper(lightRef.current, 15));

    // 创建坐标格辅助对象
    const gridHelper = new THREE.GridHelper(400, 40, 0x0000ff, 0x808080);
    gridHelper.position.y = - 150;
    gridHelper.position.x = - 150;
    sceneRef.current.add(gridHelper);

    // 创建极坐标格辅助对象
    const polarGridHelper  = new THREE.PolarGridHelper(200, 16, 8, 64, 0x0000ff, 0x808080);
    polarGridHelper.position.y = - 150;
    polarGridHelper.position.x = 200;
    sceneRef.current.add(polarGridHelper);

    // 创建 GLTF 加载器
    const loader = new GLTFLoader();
    loader.load(`${process.env.PUBLIC_URL}/models/gltf/LeePerrySmith/LeePerrySmith.glb`, (gltf) => {
      const { scene } = gltf;

      // 获取 mesh
      const mesh = scene.children[0];
      // 计算几何体切线
      mesh.geometry.computeTangents();

      // 创建一个组
      const group = new THREE.Group();
      // 放大50倍
      group.scale.multiplyScalar(50);
      // 更新组的世界坐标
      group.updateMatrixWorld(true);
      // 把 mesh 添加到组
      group.add(mesh);
      // 把组添加到场景
      sceneRef.current.add(group);

      // 创建定点法线辅助对象
      const vnh = new VertexNormalsHelper(mesh, 5);
      sceneRef.current.add(vnh);

      // 创建定点切线辅助对象
      const vth = new VertexTangentsHelper(mesh, 5);
      sceneRef.current.add(vth);

      // 创建包围盒辅助对象
      sceneRef.current.add(new THREE.BoxHelper(mesh));

      // 创建网格几何体
      const wireframe = new THREE.WireframeGeometry(mesh.geometry);
      // 创建线段
      let line = new THREE.LineSegments(wireframe);
      // 设置线段的材质
      line.material.depthTest = false;
      line.material.opacity = 0.25;
      line.material.transparent = true;
      line.position.x = 4;
      // 把网格几何体线段添加到组里
      group.add(line);
      // 添加网格几何体包围盒
      sceneRef.current.add(new THREE.BoxHelper(line));

      // 创建边缘几何体
      const edges = new THREE.EdgesGeometry(mesh.geometry);
      // 创建线段
      line = new THREE.LineSegments(edges);
      // 设置线段的材质
      line.material.depthTest = false;
      line.material.opacity = 0.25;
      line.material.transparent = true;
      line.position.x = -4;
      // 把网格几何体线段添加到组里
      group.add(line);
      // 添加网格几何体包围盒
      sceneRef.current.add(new THREE.BoxHelper(line));

      // 添加组包围盒
      sceneRef.current.add(new THREE.BoxHelper(group, 0xff0000));
      // 添加场景包围盒
      sceneRef.current.add(new THREE.BoxHelper(sceneRef.current, 0x00ff00));
    });
  }

  /** 动画 */
  function animate() {
    requestAnimationFrame(animate);
    const time = - performance.now() * 0.0003;

    // 相机围绕场景旋转
    cameraRef.current.position.x = 400 * Math.cos(time);
    cameraRef.current.position.z = 400 * Math.sin(time);
    cameraRef.current.lookAt(sceneRef.current.position);

    lightRef.current.position.x = Math.sin( time * 1.7 ) * 300;
    lightRef.current.position.y = Math.cos( time * 1.5 ) * 400;
    lightRef.current.position.z = Math.cos( time * 1.3 ) * 300;

    // 渲染
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }

  /** 监听屏幕尺寸变化 */
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
    window.addEventListener( 'resize', onWindowResize );
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return (
    <div className={comCls} id="container">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default WebglHelpers;
