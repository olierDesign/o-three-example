import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

const WebglCustomAttributesPoints3 = () => {
  /* ---------- useRef ---------- */
  // 渲染器
  const rendererRef = useRef(null);
  // 场景
  const sceneRef = useRef(null);
  // 相机
  const cameraRef = useRef(null);
  // mesh 对象
  const objectRef = useRef(null);
  // 正方体内点的数量
  const verticesRef = useRef(null);
  // 画布
  const canvasRef = useRef(null);

  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;

  /* ---------- function ---------- */
  /** 监听屏幕尺寸变化 */
  function onWindowResize() {
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };
  
  /** 初始化 */
  function init() {
    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 1, 1000);
    cameraRef.current.position.z = 500;

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 范围边界值
    let radius = 100;
    // 正方体内点的的范围 (60)
    const inner = 0.6 * radius;
    /// 创建临时变量：三维变量
    const vertex = new THREE.Vector3();
    // 点位置坐标(x, y, z)数组
    const vertices = [];

    // 定义 10 万个点
    for (let i = 0; i < 100000; i++) {
      vertex.x = Math.random() * 2 - 1;
      vertex.y = Math.random() * 2 - 1;
      vertex.z = Math.random() * 2 - 1;
      vertex.multiplyScalar(radius);

      // 只保留坐标是 40(radius - inner) 范围内的点
      // ............
      // ..        ..
      // ..        ..
      // ............
      if (
        (vertex.x > inner || vertex.x < -inner) ||
        (vertex.y > inner || vertex.y < -inner) ||
        (vertex.z > inner || vertex.z < -inner)
      ) {
        // 存储位置坐标
        vertices.push(vertex.x, vertex.y, vertex.z);
      }
    }
    // 存储正方体内点的数量
    verticesRef.current = vertices.length / 3;

    radius = 200;

    /**
     * 创建立方几何体
     * width: 200
     * height: 20
     * depth: 20
     */
    let boxGeometry1 = new THREE.BoxGeometry(radius, 0.1 * radius, 0.1 * radius, 50, 5, 5);
    // 删除 normal 和 uv 属性
    // 如果未删除 normal 和 uv 属性，则 mergeVertices() 无法合并具有不同 normal /uv 数据的相同顶点
    boxGeometry1.deleteAttribute('normal');
    boxGeometry1.deleteAttribute('uv');
    // 合并顶点
    boxGeometry1 = BufferGeometryUtils.mergeVertices(boxGeometry1);

    // 创建临时变量：四维矩阵
    const matrix = new THREE.Matrix4();
    // 创建临时变量：位置变量
    const position = new THREE.Vector3();
    // 创建临时变量：旋转角度
    const rotation = new THREE.Euler();
    // 创建临时变量：四元数
    const quaternion = new THREE.Quaternion();
    // 创建临时变量：缩放
    const scale =  new THREE.Vector3(1, 1, 1);
    
    /**
     * 添加几何体
     * @param {*} geo 被添加的几何体
     * @param {*} x   position.x
     * @param {*} y   position.y
     * @param {*} z   position.z
     * @param {*} ry  rotation.y (绕着 y 轴旋转)
     */
    function addGeo(geo, x, y, z, ry) {
      // 设置位置变量
      position.set(x, y, z);
      // 设置旋转变量
      rotation.set(0, ry, 0);
      // 设置矩阵
      matrix.compose(position, quaternion.setFromEuler(rotation), scale);

      // 获取几何体 position 属性
      const positionAttribute = geo.getAttribute('position');

      for ( let i = 0, l = positionAttribute.count; i < l; i ++ ) {
        // 获取每一个位置变量
        vertex.fromBufferAttribute(positionAttribute, i);
        // 变量与矩阵相乘
        vertex.applyMatrix4(matrix);
        // 存储位置坐标
        vertices.push(vertex.x, vertex.y, vertex.z);
      }
    }

    /**
     * side1
     * ==
     */
    addGeo(boxGeometry1, 0, 110, 110, 0);
    addGeo(boxGeometry1, 0, 110, -110, 0);
    addGeo(boxGeometry1, 0, -110, 110, 0);
    addGeo(boxGeometry1, 0, -110, -110, 0);

    /**
     * side2
     * //
     */
    addGeo(boxGeometry1, 110, 110, 0, Math.PI / 2);
    addGeo(boxGeometry1, 110, -110, 0, Math.PI / 2);
    addGeo(boxGeometry1, -110, 110, 0, Math.PI / 2);
    addGeo(boxGeometry1, -110, -110, 0, Math.PI / 2);

    /**
     * 创建立方几何体
     * width: 20
     * height: 240
     * depth: 20
     */
    let boxGeometry2 = new THREE.BoxGeometry(0.1 * radius, 1.2 * radius, 0.1 * radius, 5, 60, 5);
    // 删除 normal 和 uv 属性
    // 如果未删除 normal 和 uv 属性，则 mergeVertices() 无法合并具有不同 normal /uv 数据的相同顶点
    boxGeometry2.deleteAttribute('normal');
    boxGeometry2.deleteAttribute('uv');
    // 合并顶点
    boxGeometry2 = BufferGeometryUtils.mergeVertices(boxGeometry2);

    /**
     * corner edges
     * ||
     */
    addGeo(boxGeometry2, 110,0, 110, 0);
    addGeo(boxGeometry2, 110, 0, -110, 0);
    addGeo(boxGeometry2, -110, 0, 110, 0);
    addGeo(boxGeometry2, -110, 0, -110, 0);

    // 创建位置属性
    const positionAttribute = new THREE.Float32BufferAttribute(vertices, 3);
    // 创建临时变量：颜色数组
    const colors = [];
    // 创建临时变量：尺寸数组
    const sizes = [];
    // 创建临时变量：颜色
    const color = new THREE.Color();

    for (let i = 0; i < positionAttribute.count; i++) {
      if (i < verticesRef.current) {
        // 框内点颜色 H: 0.5 ~ 0.7 ｜ S: 1 ｜ L:0.5
        color.setHSL( 0.5 + 0.2 * ( i / verticesRef.current ), 1, 0.5 );
      } else {
        // 边框点颜色 H: 0.1 ｜ S: 1 ｜ L:0.5
        color.setHSL( 0.1, 1, 0.5 );
      }

      color.toArray(colors, i * 3);

      // 框内点大小为: 10，边框点大小为 40
      sizes[i] = i < verticesRef.current ? 10 : 40;
    }

    // 创建几何体
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('ca', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // 创建贴图
    const texture = new THREE.TextureLoader().load( `${process.env.PUBLIC_URL}/textures/sprites/ball.png` );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT =THREE.RepeatWrapping;

    // 创建着色器材质
    const material = new THREE.ShaderMaterial({
      uniforms: {
        amplitude: {value: 1.0},                      // 振幅
        color: {value: new THREE.Color(0xffffff)},    // 颜色
        pointTexture: {value: texture}                // 贴图
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    // 创建点 mesh
    objectRef.current = new THREE.Points(geometry, material);
    // 添加到场景
    sceneRef.current.add(objectRef.current);

    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current
    });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(WIDTH, HEIGHT);
  }

  /** 渲染 */
  function render() {
    const time = Date.now() * 0.01;

    // 点 mesh 绕 y 轴和 z 轴旋转
    objectRef.current.rotation.y = objectRef.current.rotation.z  = 0.02 * time;

    // 获取点 mesh 的几何体
    const geometry = objectRef.current.geometry;
    // 获取几何体的属性
    const attributes = geometry.attributes;

    for (let i = 0; i < attributes.size.count; i++) {
      if (i < verticesRef.current) {
        // 大小随时间变化: 0 ~ 58
        attributes.size.array[i] = Math.max(0, 26 + 32 * Math.sin(0.1 * i + 0.6 * time));
      }
    }

    // 更新属性
    attributes.size.needsUpdate = true;
    // 渲染
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }

  /** 动画 */
  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  /* ---------- useEffect ---------- */
  useEffect(() => {
    if (!sceneRef.current) {
      // 初始化
      init();
      // 执行动画
      animate();
    }
    window.addEventListener( 'resize', onWindowResize );
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return (
    <div id="container">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default WebglCustomAttributesPoints3;
