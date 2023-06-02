import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const Css3dOrthographic = () => {
  /* ---------- useRef ---------- */
  // 相机
  const camera = useRef();
  // 场景一
  const scene = useRef();
  // 场景二
  const scene2 = useRef();
  // WebGLRenderer 渲染器，用于渲染 mesh
  const renderer = useRef();
  // CSS3DRenderer 渲染器，用于渲染 CSS3DObject
  const renderer2 = useRef();
  // 轨道控制器
  const controls = useRef();

  /* ---------- variable ---------- */
  const frustumSize = 500;

  // 创建基础材质
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,  // 颜色(黑色)
    wireframe: true,  // 线框
    wireframeLinewidth: 1,  // 线框宽度
    side: THREE.DoubleSide, // 双面
  });

  /* ---------- function ---------- */
  /**
   * 创建面板
   * @param width 宽度
   * @param height 高度
   * @param cssColor css颜色值
   * @param pos 位置
   * @param rot 角度
   */
  const createPlane = (width, height, cssColor, pos, rot) => {    
    // 创建一个 div 元素
    const element = document.createElement('div');
    // 设置 div 的样式
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.opacity = 0.75;
    element.style.backgroundColor = cssColor;

    // 创建一个 CSS3DObject 对象
    const object = new CSS3DObject(element);
    // 设置 CSS3DObject 对象的位置和旋转角度
    object.position.copy(pos);
    object.rotation.copy(rot);
    // 把 CSS3DObject 对象放入场景 scene2 中
    scene2.current.add(object);

    // 创建一个几何体
    const geometry = new THREE.PlaneGeometry(width, height);
    // 创建一个 mesh
    const mesh = new THREE.Mesh(geometry, material);
    // 设置 mesh 的位置和旋转角度
    mesh.position.copy(object.position);
    mesh.rotation.copy(object.rotation);
    // 把 mesh 放入场景 scene 中
    scene.current.add(mesh);

    const axesHelper = new THREE.AxesHelper( 1000 );
    scene.current.add( axesHelper );
  };

  /** 初始化 */
  const init = () => {
    // 计算窗口的宽高比，用于相机参数配置，保证 left & right 和 top & bottom 的宽高比和窗口一致
    const aspect = window.innerWidth / window.innerHeight;

    /**
     * OrthographicCamera 正交相机
     * @param left width / -2
     * @param right width / 2
     * @param top height / 2
     * @param bottom height / -2
     * @param near 1
     * @param far 1000
     */
    camera.current = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      1000
    );
    // camera.current.position.set(-200, 200, 200);
    camera.current.position.set(0, 0, 200);


    /**
     * 创建场景一
     */
    scene.current = new THREE.Scene();
    // 设置场景一背景色
    scene.current.background = new THREE.Color(0xf0f0f0);

    /**
     * 创建场景二
     */
    scene2.current = new THREE.Scene();

    /**
     * left 左边面板
     * DEG2RAD：将角从以度为单位转换为以弧度为单位
     */
    createPlane(
      100,
      100,
      'chocolate',
      new THREE.Vector3(-50, 0, 0),
      new THREE.Euler(0, -90 * THREE.MathUtils.DEG2RAD, 0)
    );
    /**
     * right 右边面板
     * DEG2RAD：将角从以度为单位转换为以弧度为单位
     */
    createPlane(
      100,
      100,
      'saddlebrown',
      new THREE.Vector3(50, 0, 0),
      new THREE.Euler(0, -90 * THREE.MathUtils.DEG2RAD, 0)
    );
    /**
     * font 前面面板
     */
    createPlane(
      100,
      100,
      'saddlebrown',
      new THREE.Vector3(0, 0, 50),
      new THREE.Euler(0, 0, 0)
    );
    /**
     * back 后面面板
     */
    createPlane(
      100,
      100,
      'saddlebrown',
      new THREE.Vector3(0, 0, -50),
      new THREE.Euler(0, 0, 0)
    );
    /**
     * top 上边面板
     * DEG2RAD：将角从以度为单位转换为以弧度为单位
     */
    createPlane(
      100,
      100,
      'yellowgreen',
      new THREE.Vector3(0, 50, 0),
      new THREE.Euler(-90 * THREE.MathUtils.DEG2RAD, 0, 0)
    );
    /**
     * bottom 底部面板
     */
    createPlane(
      300,
      300,
      'seagreen',
      new THREE.Vector3(0, -50, 0),
      new THREE.Euler(-90 * THREE.MathUtils.DEG2RAD, 0, 0)  
    );

    // 创建 WebGLRenderer 渲染器
    renderer.current = new THREE.WebGLRenderer();
    // 设置设备像素比
    renderer.current.setPixelRatio(window.devicePixelRatio);
    // 设置尺寸
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    // 渲染器的 domElement 添加到 body 元素
    document.body.appendChild(renderer.current.domElement);

    // 创建 CSS3DRenderer 渲染器
    renderer2.current = new CSS3DRenderer();
    // 设置尺寸
    renderer2.current.setSize(window.innerWidth, window.innerHeight);
    // 设置渲染器的 domElement 的样式
    renderer2.current.domElement.style.position = 'absolute';
    renderer2.current.domElement.style.top = 0;
    // 渲染器的 domElement 添加到 body 元素
    document.body.appendChild(renderer2.current.domElement);

    // 创建一个控制器
    controls.current = new OrbitControls(camera.current, renderer2.current.domElement);
    // 够将相机缩小多少
    controls.current.minZoom = 0.5;
    // 够将相机放大多少
    controls.current.maxZoom = 2;
  };

  /** 动画 */
  const animate = () => {
    // 轨道控制器的变换需要 requestAnimationFrame 重复渲染
    requestAnimationFrame(animate);
    
    // WebGLRenderer 渲染器执行渲染
    renderer.current.render(scene.current, camera.current);
    // CSS3DRenderer 渲染器执行渲染
    renderer2.current.render(scene2.current, camera.current);
  };
  
  /** 窗口尺寸变化 */
  const onWindowResize = () => {
    // 计算窗口的宽高比，用于相机参数配置，保证 left & right 和 top & bottom 的宽高比和窗口一致
    const aspect = window.innerWidth / window.innerHeight;

    // 重置相机参数
    camera.current.left = frustumSize * aspect / -2;
    camera.current.right = frustumSize * aspect / 2;
    camera.current.top = frustumSize / 2;
    camera.current.bottom = frustumSize / -2;
    // 生效相机的更新
    camera.current.updateProjectionMatrix();

    // 设置 WebGLRenderer 渲染器尺寸
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    // 设置 CSS3DRenderer 渲染器尺寸
    renderer2.current.setSize(window.innerWidth, window.innerHeight)
  };

  /* ---------- useEffect ---------- */
  useEffect(() => {
    window.addEventListener( 'resize', onWindowResize );

    return () => {
      window.removeEventListener( 'resize', onWindowResize );
    }
  }, []);

  useEffect(() => {
    // 执行初始化
    init();
    // 执行动画
    animate();

    return () => {
      !!renderer.current && document.body.removeChild(renderer.current.domElement);
      !!renderer2.current && document.body.removeChild(renderer2.current.domElement);
    };
  }, []);
};

export default Css3dOrthographic;

/**
 * 小结：
 * 1、用 CSS3DObject 承载 DOM 元素，绘制颜色面板。宽高背景均用样式处理
 * 2、用 Mesh 绘制线框，位置和旋转角度均和 CSS3DObject 一致
 * 3、CSS3DObject 和 Mesh 分别添加到两个 scene 场景中
 * 4、CSS3DObject 和 Mesh 分别使用 CSS3DRenderer 和 WebGLRenderer 渲染各自的 scene 场景
 */

/**
 * 知识点：
 * 1、相机坐标的意义
 * 2、Euler 欧拉角：描述旋转变换，通过指定轴顺序（XYZ）和其各个轴上的指定旋转角度来旋转一个物体
 * 3、MathUtils 数学库：将度转化为弧度(DEG2RAD 常量 || degToRad 函数)，可应用到 Euler 欧拉角
 */