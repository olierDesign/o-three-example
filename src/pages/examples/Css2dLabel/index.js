/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import './css/Css2dLabel.scss';

const Css2dLabel = (props) => {
  // 时钟
  const clock = new THREE.Clock();
  // 贴图 loader
  const textureLoader = new THREE.TextureLoader();

  /* ---------- useRef ---------- */
  /** 相机 */
  const camera = useRef();
  /** 场景 */
  const scene = useRef();
  /** 定向光 */
  const dirLight = useRef();
  /** 坐标轴辅助线 */
  const axesHelper = useRef();
  /** 渲染器 */
  const renderer = useRef();
  /** CSS2D 渲染器 */
  const labelRenderer = useRef();
  /** 地球 */
  const earth = useRef();
  /** 月球 */
  const moon = useRef();

  // 操作对象
  const layers = {
    'Toggle Name': () => {
      camera.current.layers.toggle(0);
    },
    'Toggle Mass': () => {
      camera.current.layers.toggle(1);
    },
    'Enable All': () => {
      camera.current.layers.enableAll();
    },
    'Disable All': () => {
      camera.current.layers.disableAll();
    }
  };

  /* ---------- function ---------- */
  /** 窗口尺寸变化 */
  const onWindowResize = () => {
    camera.current.aspect = window.innerWidth / window.innerHeight;
    camera.current.updateProjectionMatrix();
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.current.setSize(window.innerWidth, window.innerHeight);
  };

  /** 操作区 */
  const initGui = () => {
    const gui = new GUI();
    gui.add(layers, 'Toggle Name');
    gui.add(layers, 'Toggle Mass');
    gui.add(layers, 'Enable All');
    gui.add(layers, 'Disable All');
  }

  /** 初始化 */
  const init = () => {
    const EARTH_RADIUS = 1;       // 地球半径
    const MOON_RADIUS = 0.27;     // 月球半径

    // 创建透视相机
    camera.current = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 );
    camera.current.position.set(10, 5, 20);
    camera.current.layers.enableAll();
    /**
     * 重点：
     * 其他对象的 layers 和 camera 的 layers 相同时，会隐藏 
     */
    camera.current.layers.toggle(1);

    // 创建场景
    scene.current = new THREE.Scene();

    // 创建定向光
    dirLight.current = new THREE.DirectionalLight(0xffffff);
    dirLight.current.position.set(0, 0, 1);
    dirLight.current.layers.enableAll();
    // 把定向光添加到场景
    scene.current.add(dirLight.current);

    // 创建坐标轴辅助线
    axesHelper.current = new THREE.AxesHelper(5);
    axesHelper.current.layers.enableAll();
    // 把定坐标轴辅助线添加到场景
    scene.current.add(axesHelper.current);

    // 创建地球 mesh
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 16, 16);
    const earthMaterial = new THREE.MeshPhongMaterial({
      specular: 0x333333,                                                         // 高光颜色
      shininess: 5,                                                               // 光泽度
      map: textureLoader.load(`${process.env.PUBLIC_URL}/textures/planets/earth_atmos_2048.jpg`),                 // 贴图
      specularMap: textureLoader.load(`${process.env.PUBLIC_URL}/textures/planets/earth_specular_2048.jpg`),      // 高光贴图
      normalMap: textureLoader.load(`${process.env.PUBLIC_URL}/textures/planets/earth_normal_2048.jpg`),          // 法线贴图
      normalScale: new THREE.Vector2(0.85, 0.85),                                 // 法线比例
    });
    earth.current = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.current.layers.enableAll();
    // 把地球 mesh 添加到场景
    scene.current.add(earth.current);

    // 创建月球 mesh
    const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);
    const moonMaterial = new THREE.MeshPhongMaterial({
      shininess: 5,
      map: textureLoader.load(`${process.env.PUBLIC_URL}/textures/planets/moon_1024.jpg`),
    });
    moon.current = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.current.layers.enableAll();
    // 把月球 mesh 添加到场景
    scene.current.add(moon.current);

    // 创建地球名称 dom
    const earthDiv = document.createElement('div');
    earthDiv.className = 'label';
    earthDiv.textContent = 'Earth';
    earthDiv.style.marginTop = '-1em';

    const earthLabel = new CSS2DObject(earthDiv);
    earthLabel.position.set(0, EARTH_RADIUS, 0);
    earthLabel.layers.set(0);
    earth.current.add(earthLabel);

    // 创建地球坐标 dom
    const earthMassDiv = document.createElement('div');
    earthMassDiv.className = 'label';
    earthMassDiv.textContent = '5.97237e24 kg';
    earthMassDiv.style.marginTop = '-1em';

    const earthMassLabel = new CSS2DObject(earthMassDiv);
    earthMassLabel.position.set(0, -2 * EARTH_RADIUS, 0);
    earthMassLabel.layers.set(1);
    earth.current.add(earthMassLabel);

    // 创建月球名称 dom
    const moonDiv = document.createElement('div');
    moonDiv.className = 'label';
    moonDiv.textContent = 'Moon';
    moonDiv.style.marginTop = '-1em';

    const moonLabel = new CSS2DObject(moonDiv);
    moonLabel.position.set(0, MOON_RADIUS, 0);
    moonLabel.layers.set(0);
    moon.current.add(moonLabel);

    // 创建月球坐标 dom
    const moonMassDiv = document.createElement('div');
    moonMassDiv.className = 'label';
    moonMassDiv.textContent = '7.342e22 kg';
    moonMassDiv.style.marginTop = '-1em';

    const moonMassLabel = new CSS2DObject(moonMassDiv);
    moonMassLabel.position.set(0, -2 * MOON_RADIUS, 0);
    moonMassLabel.layers.set(1);
    moon.current.add(moonMassLabel);

    // 创建一个渲染器
    renderer.current = new THREE.WebGLRenderer();
    // 设置设备像素比。这通常用于 HiDPI 设备，以防止输出画布模糊
    renderer.current.setPixelRatio(window.devicePixelRatio);
    // 将输出画布的大小调整为 (width, height) 并考虑设备像素比率，并将视口设置为适合该大小
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.current.domElement);

    // 创建 css2d 渲染器
    labelRenderer.current = new CSS2DRenderer();
    labelRenderer.current.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.current.domElement.style.position = 'absolute';
    labelRenderer.current.domElement.style.top = '0';
    document.body.appendChild(labelRenderer.current.domElement);

    // 轨道控制器
    const controls = new OrbitControls(camera.current, labelRenderer.current.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 100;

    // 监听窗口尺寸变化
    window.addEventListener('resize', onWindowResize);

    // 初始化操作区
    initGui();
  };

  /** 动画 */
  const animate = () => {
    requestAnimationFrame(animate);

    /**
     * 重点：月球绕地球旋转的位置算法
     * 1、elapsed：获取时钟启动以来经过的秒数
     * 2、根据 elapsed 计算出月球的 position 位置
     */
    const elapsed = clock.getElapsedTime();
    moon.current.position.set(Math.sin( elapsed ) * 5, 0, Math.cos( elapsed ) * 5);

    renderer.current.render(scene.current, camera.current);
    labelRenderer.current.render(scene.current, camera.current);
  };

  /* ---------- useEffect ---------- */
  useEffect(() => {
    if (scene.current) return;
    init();
    animate();
  }, []);
}

export default Css2dLabel;
