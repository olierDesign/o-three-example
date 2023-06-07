import React, {useEffect, useRef} from 'react';

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

const WebglCustomAttributesPoints2 = () => {
  /* ---------- variable ---------- */
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;

  /* ---------- useRef ---------- */
  // 渲染器
  const rendererRef = useRef(null);
  // 场景
  const sceneRef = useRef(null);
  // 相机
  const cameraRef = useRef(null);
  // 点 mesh
  const meshRef = useRef(null);
  // 球几何体 position 属性的数组长度
  const sphereLengthRef = useRef(null);
  // 画布
  const canvasRef = useRef(null);

  /* ---------- function ---------- */
  /** 监听屏幕尺寸变化 */
  const onWindowResize = () => {
    cameraRef.current.aspect = WIDTH / HEIGHT;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize(WIDTH, HEIGHT);
  };

  /** 初始化 */
  const init = () => {
    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 10000);
    cameraRef.current.position.z = 300;

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 球体半径 | 水平分段数 | 垂直分段数
    const radius = 100, segments = 68, rings = 38;

    // 创建球缓冲几何体
    let sphereGeometry = new THREE.SphereGeometry(radius, segments, rings);
    // 创建立方缓冲几何体
    let boxGeometry = new THREE.BoxGeometry(0.8 * radius, 0.8 * radius, 0.8 * radius, 10, 10, 10);

    // 如果不删除法线和 uv 属性, mergeVertices() 无法合并具有不同法线/uv 数据的相同顶点
    sphereGeometry.deleteAttribute('uv');
    sphereGeometry.deleteAttribute('normal');

    boxGeometry.deleteAttribute('uv');
    boxGeometry.deleteAttribute('normal');

    sphereGeometry = BufferGeometryUtils.mergeVertices(sphereGeometry);
    boxGeometry = BufferGeometryUtils.mergeVertices(boxGeometry);

    // 创建合并几何体
    const combinedGeometry = BufferGeometryUtils.mergeBufferGeometries([sphereGeometry, boxGeometry]);
    // 合并几何体的 position 属性
    const positionAttribute = combinedGeometry.getAttribute('position');

    // 创建颜色、点大小数组
    const colors = [];
    const sizes = [];

    // 创建临时颜色、3位变量
    const color = new THREE.Color();
    const vertex = new THREE.Vector3();

    // 保存球缓存几何体的位置长度
    sphereLengthRef.current = sphereGeometry.getAttribute('position').count;

    // 遍历合并几何体 position 的数组长度
    for(let i = 0, l = positionAttribute.count; i < l; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);

      if (i < sphereLengthRef.current) {
        /**
         * 球
         * 色相：0.01 ~ 0.11
         * 饱和度：0.99
         * 亮度：根据 y 轴，0 ~ 0.5
         */
        color.setHSL(0.01 + 0.1 * (i / sphereLengthRef.current), 0.99, (vertex.y + radius) / (4 * radius))
      } else {
        /**
         * 立方体
         * 色相：0.6
         * 饱和度：0.75
         * 亮度：根据 y 轴，0.05 ~ 0.45
         */
        color.setHSL(0.6, 0.75, 0.25 + vertex.y / (2 * radius));
      }

      // 保存球和立方体每个顶点的颜色和大小
      color.toArray(colors, i * 3);
      sizes[i] = i < sphereLengthRef.current ? 10 : 40;
    }

    // 创建 BufferGeometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('ca', new THREE.Float32BufferAttribute(colors, 3));

    // 加载贴图
    const texture = new THREE.TextureLoader().load(`${process.env.PUBLIC_URL}/textures/sprites/disc.png`);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    // 创建着色器材质
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0xffffff)
        },
        pointTexture: {
          value: texture,
        }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true
    });

    // 创建点 mesh
    meshRef.current = new THREE.Points(geometry, material);
    sceneRef.current.add(meshRef.current);

    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current
    });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(WIDTH, HEIGHT);

    window.addEventListener('resize', onWindowResize);
  };

  /** 点排序 */
  const sortPoints  = () => {
    // 创建一个临时3维变量
    const vector = new THREE.Vector3();

    // 创建"模型+视图+投影矩阵"
    const matrix = new THREE.Matrix4();
    matrix.multiplyMatrices( cameraRef.current.projectionMatrix, cameraRef.current.matrixWorldInverse );
    matrix.multiply( meshRef.current.matrixWorld );

    // 获取点 mesh 的几何体
    const geometry = meshRef.current.geometry;
    // 获取几何体的索引
    let index = geometry.getIndex();
    // 获取几何体 position 属性数组，和长度
    const positions = geometry.getAttribute('position').array;
    const length = positions.length / 3;

    // 如果几何体索引为空，创建索引
    if (index === null) {
      const array = new Uint16Array(length);

      for (let i = 0; i < length; i++) {
        array[i] = i;
      }

      index = new THREE.BufferAttribute(array, 1);
      geometry.setIndex(index);
    }

    // 创建排序数组
    const sortArray = [];

    // 遍历点 mesh 的position属性
    for (let i = 0; i < length; i++) {
      // 获取每一个 position 属性
      vector.fromArray(positions, i * 3);
      // 与 modelViewProjection 矩阵相乘
      vector.applyMatrix4(matrix);
      // 存储最后的坐标到 sortArray 数组
      sortArray.push([vector.z, i]);
    }

    // 排序函数
    function numericalSort(a, b) {
      return b[0] - a[0];
    }

    // 按照变量的 z 轴排序
    sortArray.sort(numericalSort);

    // 获取索引属性数组
    const indices = index.array;

    // 按照排序后的数组，更新 index 属性
    for (let i = 0; i < length; i++) {
      indices[i] = sortArray[i][1];
    }

    geometry.index.needsUpdate = true;
  };

  /** 渲染 */
  const render = () => {
    // 获取时间
    const time = Date.now() * 0.005;

    // 点 mesh 绕着 zy 轴旋转
    meshRef.current.rotation.y = 0.02 * time;
    meshRef.current.rotation.z = 0.02 * time;

    // 获取点 mesh 的属性
    const attributes = meshRef.current.geometry.attributes;

    // 每次渲染改变球 size 的大小
    for (let i = 0; i < attributes.size.array.length; i++) {
      // 过滤出球的size
      if (i < sphereLengthRef.current) {
        // 4 ～ 28
        attributes.size.array[i] =16 + 12 * Math.sin(0.1 * i + time);
      }
    }
    attributes.size.needsUpdate = true;

    // 排序
    sortPoints();

    // 渲染
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  /** 执行动画 */
  const animate = () => {
    requestAnimationFrame(animate);

    render();
  };

  /* ---------- useEffect ---------- */
  useEffect(() => {
    if (!sceneRef.current) {
      // 初始化
      init();
      // 执行动画
      animate();
    }

    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, [])

  return (
    <div id="container">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default WebglCustomAttributesPoints2;

/**
 * example 小结：
 * 如果不删除几何体的法线和 uv 属性, BufferGeometryUtils 的 mergeVertices() 无法合并具有不同法线/uv 数据的相同顶点
 * 1、“球几何体”、“立方几何体”：分别删除 normal 和 uv 属性
 * 2、“球几何体”、“立方几何体”：分别使用 BufferGeometryUtils.mergeVertices 合并顶点
 * 3、“合并几何体”：使用 BufferGeometryUtils.mergeBufferGeometries 合并“球几何体”、“立方几何体”
 * 4、根据“合并几何体“，获取 positon、color、size 新属性
 * 5、根据新属性创建新的 BufferGeometry
 * 
 * 获取 modelViewProjection 矩阵
 * modelViewProjectionMatrix = camera.projectionMatrix * camera.matrixWorldInverse * mesh.matrixWorld 
 * 
 * 如果不根据位置在 modelViewProjection 的 z 轴进行 index 排序
 * 会出现贴图黑色背景覆盖问题
 */