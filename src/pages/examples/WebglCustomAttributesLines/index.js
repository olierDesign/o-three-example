import React, { useRef, useEffect } from 'react';

import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

const WebglCustomAttributesLines = () => {
  /* ---------- useRef ---------- */
  // 渲染器
  const rendererRef = useRef(null);
  // 场景
  const sceneRef = useRef(null);
  // 相机
  const cameraRef = useRef(null);
  // mesh
  const lineRef = useRef(null);
  // 着色器 uniforms
  const uniformsRef = useRef(null);
  // 画布
  const canvasRef = useRef(null);

  /* ---------- function ---------- */
  /**
   * 屏幕尺寸变化监听函数
   */
  const onWindowResize = () => {
    // 更新相机
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();

    // 更新渲染器
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  /**
   * 初始化
   * @font 加载的font
   */
  const init = (font) => {
    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    cameraRef.current.position.z = 400;

    // 创建场景
    sceneRef.current = new THREE.Scene();
    // 设置场景的背景颜色
    sceneRef.current.background = new THREE.Color(0x050505);

    // 设置着色器 uniforms
    uniformsRef.current = {
      // 振幅
      amplitude: {
        value: 5.0
      },
      // 透明度
      opacity: {
        value: 0.3
      },
      // 颜色
      color: {
        value: new THREE.Color(0xffffff)
      }
    };

    // 创建着色器材质
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,   // 混合模式
      depthTest: false,                   // 深度测试
      transparent: true,                  // 材质是否透明
    });

    // 创建文本缓冲几何体
    const geometry = new TextGeometry('KUMA', {
      font: font,         // THREE.Font 的实例
      size: 50,           // 字体大小
      height: 15,         // 文本的厚度
      curveSegments: 10,  // 文本曲线上点的数量
      bevelEnabled: true, // 是否开启斜角
      bevelThickness: 5,  // 文本上斜角的深度
      bevelSize: 1.5,     // 斜角与原始文本轮廓之间的延伸距离
      bevelSegments: 10,  // 斜角的分段数
    });
    // 根据边界矩形将几何体居中
    geometry.center();
    
    // 获取几何体位置的数量
    const count = geometry.attributes.position.count;

    // 创建文本几何体属性 —— 位移(x, y, z)
    const displacement = new THREE.Float32BufferAttribute(count * 3, 3);
    // 把位移属性添加到文本几何体
    geometry.setAttribute('displacement', displacement);

    // 创建文本几何体属性 —— 颜色(r, g, b)
    const customColor = new THREE.Float32BufferAttribute(count * 3, 3);
    // 把位移属性添加到文本几何体
    geometry.setAttribute('customColor', customColor);

    // 创建一个临时颜色
    const color = new THREE.Color(0xffffff);
    // 定制 customColor 颜色属性
    for (let i = 0; i < customColor.count; i++) {
      // 设置 color 颜色
      color.setHSL(i / customColor.count, 0.5, 0.5);
      // 把 color 的值添加到 customColor 数组中
      color.toArray(customColor.array, i * customColor.itemSize);
    }

    // 创建 "线Mesh"
    lineRef.current = new THREE.Line(geometry, shaderMaterial);
    // "线Mesh" 绕着 x 轴旋转 0.2
    lineRef.current.rotation.x = 0.2;
    // 把 "线Mesh" 添加到场景中
    sceneRef.current.add(lineRef.current);

    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current
    });
    // 设置渲染器像素比
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    // 设置渲染器大小
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);

    // 监听屏幕尺寸变化
    window.addEventListener( 'resize', onWindowResize );
  };

  /** 渲染 */
  const render = () => {
    // 当前时间
    const time = Date.now() * 0.001;

    // “线模型” 绕 y 轴旋转
    lineRef.current.rotation.y = 0.25 * time;

    // 更新着色器 uniforms 的振幅和颜色
    uniformsRef.current.amplitude.value = Math.sin(0.5 * time);
    uniformsRef.current.color.value.offsetHSL(0.0005, 0, 0);

    // 获取文本几何体的属性
    const attributes = lineRef.current.geometry.attributes;
    // 获取位移属性数组
    const array = attributes.displacement.array;
    // 遍历位移属性， xyz 随机数增量（-0.15 ~ 0.15）
    for (let i = 0, l = array.length; i < l; i += 3) {
      array[i] += 0.3 * (0.5 - Math.random());
      array[i + 1] += 0.3 * (0.5 - Math.random());
      array[i + 2] += 0.3 * (0.5 - Math.random());
    }
    // 更新位移属性
    attributes.displacement.needsUpdate = true;

    // 渲染
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }

  /** 动画 */
  const animate = () => {
    requestAnimationFrame(animate);

    render();
  };

  /* ---------- useEffect ---------- */
  useEffect(() => {
    if (!sceneRef.current) {
      // 加载字体
      new FontLoader().load(
        `${process.env.PUBLIC_URL}/fonts/helvetiker_bold.typeface.json`,
        (font) => {
          // 初始化
          init(font);
          animate();
        }
      );
    }

    return () => {
      window.removeEventListener( 'resize', onWindowResize );
    };
  }, []);

  return (
    <div id="container">
      <canvas ref={canvasRef}></canvas>
    </div>
  )
};

export default WebglCustomAttributesLines;
