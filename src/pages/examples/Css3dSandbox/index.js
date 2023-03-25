import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

import './css/Css3dSandbox.scss'

const Css3dSandbox = () => {
  /* ---------- variable ---------- */
  // 相机
  const camera = useRef();
  // 场景一：放置 Mesh 对象，用于 WebGL 渲染
  const scene = useRef();
  // 场景二：放置 HTML 元素，用于 CSS3D 渲染
  const scene2 = useRef();
  // WebGL 渲染器
  const renderer = useRef();
  // CSS3D 渲染器
  const renderer2 = useRef();
  // 控制器
  const controls = useRef();
  
  /* ---------- useRef ---------- */
  
  /* ---------- function ---------- */
  /** 初始化函数 */
  const init = () => {
    // 创建透视相机
    camera.current = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    // 设置相机的位置
    camera.current.position.set(200, 200, 200);

    // 创建场景一
    scene.current = new THREE.Scene();
    // 设置场景一背景色
    scene.current.background = new THREE.Color(0xf0f0f0);

    // 创建场景二
    scene2.current = new THREE.Scene();

    // 创建基础网格材质
    const material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true, wireframeLinewidth: 1, side: THREE.DoubleSide});

    // 创建 10 个面板
    for (let i = 0; i < 10; i ++) {
      // 创建 HTML 元素
      const element = document.createElement('div');
      // 设置 HTML 元素的样式
      element.style.width = '100px';
      element.style.height = '100px';
      element.style.opacity = i < 5 ? 0.5 : 1;
      // keynote：（Math.random() * 0xffffff）用 16 进制的随机数生成随机颜色
      element.style.background = new THREE.Color(Math.random() * 0xffffff).getStyle();

      /* ---------- 创建 CSS3D 对象 ---------- */
      const object = new CSS3DObject(element);
      // 设置 CSS3D 对象的随机位置，xyz 位置范围在 -100 ~ 100
      object.position.x = Math.random() * 200 - 100;
      object.position.y = Math.random() * 200 - 100;
      object.position.z = Math.random() * 200 - 100;

      // 设置 CSS3D 对象的随机旋转角度，xyz 旋转角度范围在 0 ~ 1
      object.rotation.x = Math.random();
      object.rotation.y = Math.random();
      object.rotation.z = Math.random();

      // 设置 CSS3D 对象的随机缩放大小，xyz 缩放大小在 0.5 ~ 1.5
      object.scale.x = Math.random() + 0.5;
      object.scale.y = Math.random() + 0.5;

      // 把 CSS3D 对象添加到场景 scene2 中
      scene2.current.add(object);

      /* ---------- 创建线框 ---------- */
      // 创建平面几何体
      const geometry = new THREE.PlaneGeometry(100, 100);
      // 创建 mesh
      const mesh = new THREE.Mesh(geometry, material);
      // 拷贝 CSS3D 对象的位置
      mesh.position.copy(object.position);
      // 拷贝 CSS3D 对象的旋转角度
      mesh.rotation.copy(object.rotation);
      // 拷贝 CSS3D 对象的缩放大小
      mesh.scale.copy(object.scale);

      // 把平面几何体添加到场景 scene 中
      scene.current.add(mesh);
    }

    // 创建坐标轴辅助对象
    const axesHelper = new THREE.AxesHelper(200);
    // 把坐标轴辅助对象添加到场景 scene 中
    scene.current.add(axesHelper);

    /**
     * 创建 WebGL 渲染器
     * 执行抗锯齿
     */
    renderer.current = new THREE.WebGLRenderer({antialias: true});
    // 设置 WebGL 渲染器设备像素比
    renderer.current.setPixelRatio(window.devicePixelRatio);
    // 将 WebGL 渲染器输出 canvas 的大小调整为 (window.innerWidth, window.innerHeight) 并考虑设备像素比
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    // 把 WebGL 渲染器添加到 body 中
    document.body.appendChild(renderer.current.domElement);

    /**
     * 创建 CSS3D 渲染器
     */
    renderer2.current = new CSS3DRenderer();
    // 将 CSS3D 渲染器尺寸重新调整为(window.innerWidth, window.innerHeight)
    renderer2.current.setSize(window.innerWidth, window.innerHeight);
    // 设置 CSS3D 渲染器的样式
    renderer2.current.domElement.style.position = 'absolute';
    renderer2.current.domElement.style.top = 0;
    // 把 CSS3D 渲染器添加到 body 中
    document.body.appendChild(renderer2.current.domElement);

    // 创建轨迹球控制器
    controls.current = new TrackballControls(camera.current, renderer2.current.domElement);
  };

  /** 动画函数 */
  const animate = () => {
    requestAnimationFrame(animate);

    // 更新轨道控制器
    controls.current.update();
    // WebGL 执行渲染场景一
    renderer.current.render(scene.current, camera.current);
    // CSS3D 执行渲染场景二
    renderer2.current.render(scene2.current, camera.current);
  };

  /** 窗口尺寸变化函数 */
  const onWindowResize = () => {
    // 调整相机视锥体的长宽比
    camera.current.aspect = window.innerWidth / window.innerHeight;
    // 更新摄像机投影矩阵
    camera.current.updateProjectionMatrix();
    // 调整 WebGL 渲染器的尺寸
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    // 调整 CSS3D 渲染器的尺寸
    renderer2.current.setSize(window.innerWidth, window.innerHeight);
  };

  /* ---------- useEffect ---------- */
  useEffect(() => {
    init();
    animate();
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      !!renderer.current.domElement && document.body.removeChild(renderer.current.domElement);
      !!renderer2.current.domElement && document.body.removeChild(renderer2.current.domElement);
    }
  }, []);
};

export default Css3dSandbox;