import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

/**
 * 更新每只鸟的三维坐标
 * 其中的翅膀摆动的相位变量 phase 保存在 w 分量中，用于在之后的 birdVS 顶点着色器中使用，来更新翅膀的摆动幅度，期望速率越大时，摆动的幅度也越大，频率也越快 
 * 其中的 62.83 约等于 PI 的20倍
 */
import fragmentShaderPosition from './fragmentShaderPosition.glsl';
/**
 * 更新每只鸟的速度向量
 * 优先级最高的是规避 捕食者，让鸟群远离捕食者一定的距离
 * 捕食者的排斥力，只有鸟靠近捕食者一定距离，才会收到这种斥力
 * 使鸟始终向着屏幕的中心移动，这些鸟始终都受到来自屏幕中心的引力；如果没有这个力，鸟群就散开了，很快飞到相机看不见的位置
 * 紧接着是一个 32 * 32 的二重循环，来对鸟群中每只鸟应用来自其他鸟的排斥力，吸引力，偏向力
 */
import fragmentShaderVelocity from './fragmentShaderVelocity.glsl';

const WebglGpgpuBirds = () => {
  /* ---------- useRef ---------- */
  // 画布
  const canvasRef = useRef(null);
  // 相机
  const cameraRef = useRef(null);
  // 场景
  const sceneRef = useRef(null);
  // 渲染器
  const rendererRef = useRef(null);
  // 鼠标 X
  const mouseXRef = useRef(null);
  // 鼠标 Y
  const mouseYRef = useRef(null);

  // GPU 计算渲染器
  const gpuComputeRef = useRef(null);
  // GPU 计算渲染器 —— 位置变量
  const positionVariableRef = useRef(null);
  // GPU 计算渲染器 —— 速度变量
  const velocityVariableRef = useRef(null);
  // GPU 计算渲染器 —— 位置 uniforms
  const positionUniformsRef = useRef(null);
  // GPU 计算渲染器 —— 速度 uniforms
  const velocityUniformsRef = useRef(null);
  

  /* ---------- variable ---------- */
  // "模拟贴图"的宽度
  const WIDTH = 32;
  // 鸟的数量
  const BIRDS = WIDTH * WIDTH;
  // 屏幕中心点 XY
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;
  // 界限
  const BOUNDS = 800, BOUNDS_HALF = BOUNDS / 2;
  // 精确到毫秒的时间戳
  let last = performance.now();
  // 鸟 uniform 值
  let birdUniforms;

  /* ---------- function ---------- */
  /**
   * 位置贴图赋值函数
   * @param {*} texture: DataTexture
   */
  function fillPositionTexture(texture) {
    const theArray = texture.image.data;
    
    for (let k = 0, kl = theArray.length; k < kl; k += 4) {
      // XYZ 范围 -BOUNDS_HALF ～ BOUNDS_HALF
      const x = Math.random() * BOUNDS - BOUNDS_HALF;
      const y = Math.random() * BOUNDS - BOUNDS_HALF;
      const z = Math.random() * BOUNDS - BOUNDS_HALF;

      theArray[k + 0] = x;
      theArray[k + 1] = y;
      theArray[k + 2] = z;
      theArray[k + 3] = 1;
    }
  }

  /**
   * 速度贴图赋值函数
   * @param {*} texture 
   */
  function fillVelocityTexture(texture) {
    const theArray = texture.image.data;

    for (let k = 0, kl = theArray.length; k < kl; k += 4) {
      // XYZ 范围 -5 ～ 5
      theArray[k + 0] = Math.random() * 10 - 5;
      theArray[k + 1] = Math.random() * 10 - 5;
      theArray[k + 2] = Math.random() * 10 - 5;
      theArray[k + 3] = 1;
    }
  }

  /** 初始计算渲染器 */
  function initComputeRenderer() {
    /**
     * 创建 GPU 计算渲染器
     * sizeX: X 轴方向数量
     * sizeY: Y 轴方向数量
     * renderer: WebGL 渲染器
     */
    gpuComputeRef.current = new GPUComputationRenderer(WIDTH, WIDTH, rendererRef.current);

    // 如果使用的上下文是 WebGL2RenderingContext对象
    if (rendererRef.current.capabilities.isWebGL2 === false) {
      gpuComputeRef.current.setDataType(THREE.HalfFloatType);
    }

    // 创建位置贴图
    const dtPosition = gpuComputeRef.current.createTexture();
    // 创建速度贴图
    const dtVelocity = gpuComputeRef.current.createTexture();
    // 位置贴图赋值
    fillPositionTexture(dtPosition);
    // 速度贴图赋值
    fillVelocityTexture(dtVelocity);

    /**
     * addVariable
     * @param {*} variableName 变量名
     * @param {*} fragmentShaderPosition 片段着色器代码
     * @param {*}  initialValueTexture 贴图
     */
    // GPU 计算渲染器添加属性：位置变量
    // 负责更新鸟群中每只鸟的三维坐标
    positionVariableRef.current = gpuComputeRef.current.addVariable('texturePosition', fragmentShaderPosition, dtPosition);
    // GPU 计算渲染器添加属性：速度变量
    // 负责更新鸟群中每只鸟的速度
    velocityVariableRef.current = gpuComputeRef.current.addVariable('textureVelocity', fragmentShaderVelocity, dtVelocity);

    // 创建位置变量的依赖
    gpuComputeRef.current.setVariableDependencies(positionVariableRef.current, [positionVariableRef.current, velocityVariableRef.current]);
    // 创建速度变量的依赖
    gpuComputeRef.current.setVariableDependencies(velocityVariableRef.current, [positionVariableRef.current, velocityVariableRef.current]);

    // 获取“位置变量”的着色器材质的 uniforms 属性
    positionUniformsRef.current = positionVariableRef.current.material.uniforms;
    // 获取“速度变量”的着色器材质的 uniforms 属性
    velocityUniformsRef.current = velocityVariableRef.current.material.uniforms;

    // uniforms 赋值
    positionUniformsRef.current['time'] = {value: 0.0};                           // 时间
    positionUniformsRef.current['delta'] = {value: 0.0};                          // 频次
    velocityUniformsRef.current['time'] = {value: 1.0};                           // 时间
    velocityUniformsRef.current['delta'] = {value: 0.0};                          // 频次
    velocityUniformsRef.current['testing'] = {value: 1.0};                        // 测试
    velocityUniformsRef.current['separationDistance'] = {value: 1.0};             // 分离距离
    velocityUniformsRef.current['alignmentDistance'] = {value: 1.0};              // 对齐距离
    velocityUniformsRef.current['cohesionDistance'] = {value: 1.0};               // 内聚距离
    velocityUniformsRef.current['freedomFactor'] = {value: 1.0};                  // 自由度系数
    velocityUniformsRef.current['predator'] = {value: new THREE.Vector3()};       // 掠夺者
    velocityVariableRef.current.material.defines.BOUNDS = BOUNDS.toFixed(2);      // 定义 BOUNDS 常量

    // 包裹模式
    positionVariableRef.current.wrapS = THREE.RepeatWrapping;
    positionVariableRef.current.wrapT = THREE.RepeatWrapping;
    velocityVariableRef.current.wrapS = THREE.RepeatWrapping;
    velocityVariableRef.current.wrapT = THREE.RepeatWrapping;

    // 初始化 GPU 计算渲染器
    const error = gpuComputeRef.current.init();

    // 如果有错误，返回错误
    if (error !== null) {
      console.error(error);
    }
  }

  /** 初始函数 */
  function init() {
    // 创建相机
    cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    cameraRef.current.position.z = 350;

    // 创建场景
    sceneRef.current = new THREE.Scene();
    // 场景设置白色背景色
    sceneRef.current.background = new THREE.Color(0xffffff);
    // 场景的雾
    sceneRef.current.fog = new THREE.Fog(0xffffff, 100, 1000);

    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current
    });
    // 渲染器设置设备像素比
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    // 渲染器设置尺寸
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    // 渲染器是否使用传统照明
    rendererRef.current.useLegacyLights = false;

    // 初始化计算渲染
    initComputeRenderer();
  }

  /* ---------- useEffect ---------- */
  useEffect(() => {
    if (!sceneRef.current) {
      init();
    }
  });

  return (
    <div id="container">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default WebglGpgpuBirds;
