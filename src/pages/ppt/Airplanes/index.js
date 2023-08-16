import React, { useEffect, useRef } from "react";

import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./css/Airplanes.scss";

export default function PortalDynamicMap(props) {
  /* ---------- variable ---------- */
  const comCls = "ppt__airplanes";

  /* ---------- state ---------- */

  /* ---------- ref ---------- */
  const objRef = useRef(null);

  /* ---------- class ---------- */
  class Scene {
    constructor(model) {
      this.views = [
        { bottom: 0, height: 1 },
        { bottom: 0, height: 0 },
      ];

      /** 创建渲染器 */
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      // 允许在场景中使用阴影贴图
      this.renderer.shadowMap.enabled = true;
      // 使用 Percentage-Closer Filtering (PCF) 算法过滤阴影映射，但在使用低分辨率阴影图时具有更好的软阴影
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setPixelRatio(window.devicePixelRatio);

      document
        .getElementsByClassName("ppt__airplanes")[0]
        .appendChild(this.renderer.domElement);

      /** 创建场景 */
      this.scene = new THREE.Scene();

      for (let i = 0; i < this.views.length; i++) {
        // 获取视图
        const view = this.views[i];

        // 创建视图相机
        const camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          1,
          2000
        ); // 透视相机
        camera.position.fromArray([0, 0, 180]); // 相机位置
        camera.layers.disableAll(); // 禁用所有层
        camera.layers.enable(i); // 启动当前视图层
        camera.lookAt(new THREE.Vector3(0, 5, 0)); // 相机朝向

        // 存储相机到 this.views 中
        view.camera = camera;
      }

      /** 创建灯光 */
      // 点光
      this.light = new THREE.PointLight(0xffffff, 0.75);
      this.light.position.set(70, -20, 150);
      this.scene.add(this.light);

      // 环境光
      this.softLight = new THREE.AmbientLight(0xffffff, 1.5);
      this.scene.add(this.softLight);

      // 屏幕尺寸更新
      this.onResize();
      window.addEventListener("resize", this.onResize, false);

      // 创建边缘几何体
      const edges = new THREE.EdgesGeometry(model.children[0].geometry);
      // 创建线段
      const line = new THREE.LineSegments(edges);
      line.material.depthTest = false;
      line.material.opacity = 0.5;
      line.material.transparent = true;
      line.position.set(0.5, 0.2, -1);

      // 设置层级
      model.layers.set(0); // 飞机实体 mesh 层级是 0
      line.layers.set(1); // 飞机线稿 mesh 层级是 1

      // 创建组
      this.modelGroup = new THREE.Group();
      this.modelGroup.add(model); // 飞机实体 mesh 添加到 modelGroup
      this.modelGroup.add(line); // 飞机线稿 mesh 添加到 modelGroup
      this.scene.add(this.modelGroup); // modelGroup 添加到场景
    }
    render = () => {
      for (let i = 0; i < this.views.length; i++) {
        // 获取视图
        const view = this.views[i];
        // 获取相机
        const camera = view.camera;

        // 设置裁剪参数
        const bottom = Math.floor(this.h * view.bottom);
        const height = Math.floor(this.h * view.height);

        this.renderer.setViewport(0, 0, this.w, this.h);
        this.renderer.setScissor(0, bottom, this.w, height);
        this.renderer.setScissorTest(true);

        camera.aspect = this.w / this.h;
        this.renderer.render(this.scene, camera);
      }
    }
    onResize = () => {
      this.w = window.innerWidth;
      this.h = window.innerHeight;

      for (let i = 0; i < this.views.length; i++) {
        // 获取视图
        const view = this.views[i];
        // 获取相机
        const camera = view.camera;
        // 更新相机的视锥体长宽比
        camera.aspect = this.w / this.h;
        // 获取相机的 z 轴位置
        const cameraZ = (window.screen.width - this.w * 1) / 3;
        camera.position.z = cameraZ < 180 ? 180 : cameraZ;
        camera.updateProjectionMatrix();
      }

      this.renderer.setSize(this.w, this.h);
      this.render();
    }
  }

  /* ---------- function ---------- */
  /** 设置 gsap 动画 */
  function setupAnimation() {
    // 创建场景
    const scene = new Scene(objRef.current);
    // 飞机模型
    const plane = scene.modelGroup;

    // 创建 gsap 动画
    // canvas 从右到左
    gsap.fromTo(
      "canvas",
      { x: "50%", autoAlpha: 0 },
      {
        duration: 1,
        x: "0%",
        autoAlpha: 1,
      }
    );
    // loading 文本隐藏
    gsap.to(".loading", {
      autoAlpha: 0,
    });
    // scroll 文本隐藏
    gsap.to(".scroll-cta", {
      opacity: 1,
    });

    // 设置飞机方向
    gsap.set(plane.rotation, {
      y: -Math.PI / 2,
    });
    // 设置飞机位置
    gsap.set(plane.position, { x: 80, y: -32, z: -60 });
    // 渲染
    scene.render();

     // 离开 blueprint 的可视区域，线框飞机图层 从 h -> 0
     gsap.fromTo(
      scene.views[1],
      { height: 1, bottom: 0 },
      {
        height: 0,
        bottom: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".blueprint",
          scrub: true,
          start: "bottom bottom",
          end: "bottom top",
        },
      }
    );
    // 进入 blueprint 的可视区域，线框飞机图层 从 0 -> h
    gsap.fromTo(
      scene.views[1],
      { height: 0, bottom: 0 },
      {
        height: 1,
        bottom: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".blueprint",
          scrub: true,
          start: "top bottom",
          end: "top top",
        },
      }
    );

    // 大地视差动画
    gsap.to(".ground", {
      y: "30%",
      scrollTrigger: {
        trigger: ".ground-container",
        scrub: true,
        start: "top bottom",
        end: "bottom top",
      },
    });
    // 白云视差动画
    gsap.from(".clouds", {
      y: "25%",
      scrollTrigger: {
        trigger: ".ground-container",
        scrub: true,
        start: "top bottom",
        end: "bottom top",
      },
    });

    // 创建整页的时间线
    const sectionDuration = 1;      // 模块时长
    let delay = 0;                  // 延时
    const tl = new gsap.timeline({
      onUpdate: scene.render,
      scrollTrigger: {
        trigger: ".content",
        scrub: true,
        start: "top top",
        end: "bottom bottom",
      },
      defaults: {duration: sectionDuration, ease: 'power2.inOut'}
    });
    // scroll 文案透明度
    tl.to(".scroll-cta", { duration: 0.25, opacity: 0 }, delay);
    // 实体飞机 mesh 位置
    tl.to(plane.position, { x: -10, ease: "power1.in" }, delay);

    delay += sectionDuration;

    tl.to(plane.rotation, {x: Math.PI / 2, y: 0, z: -Math.PI * 0.1, ease: 'power1.inOut'}, delay);
    tl.to(plane.position, {x: -40, y: 0, z: -60, ease: 'power1.inOut'}, delay);

    delay += sectionDuration;

    tl.to(plane.rotation, {x: Math.PI / 2, y: 0, z: Math.PI * 0.1, ease: 'power3.inOut'}, delay);
    tl.to(plane.position, {x: 40, y: 0, z: -60, ease: 'power2.inOut'}, delay);

    delay += sectionDuration;
	
    tl.to(plane.rotation, {x: Math.PI * 0.4, y: 0, z: Math.PI * 0.2, ease: 'power3.inOut'}, delay);
    tl.to(plane.position, {x: -40, y: 0, z: -30, ease: 'power2.inOut'}, delay);

    delay += sectionDuration;
	
    tl.to(plane.rotation, { x: 0, y: Math.PI * 0.5, z: 0}, delay);
    tl.to(plane.position, { x: 0, y: -10, z: 50}, delay);

    delay += sectionDuration;
	
    tl.to(plane.rotation, {x: Math.PI * 0.5, y: Math.PI, z: 0, ease:'power4.inOut'}, delay);
    tl.to(plane.position, {z: 30, ease:'power4.inOut'}, delay);

    delay += sectionDuration;
	
    tl.to(plane.rotation, {x: Math.PI * 0.5, y: Math.PI, z: 0, ease:'power4.inOut'}, delay);
    tl.to(plane.position, {z: 60, x: 30, ease:'power4.inOut'}, delay);

    delay += sectionDuration;
	
    tl.to(plane.rotation, {x: Math.PI * 0.7, y: Math.PI * 1.5, z: Math.PI * 1.2, ease:'power4.inOut'}, delay);
    tl.to(plane.position, {z: 100, x: 20, y: 0, ease:'power4.inOut'}, delay);

    delay += sectionDuration;
	
    tl.to(plane.rotation, {x:  Math.PI * 0.3, y: Math.PI * 1.7, z: 0, ease: 'power1.in'}, delay);
    tl.to(plane.position, {z: -150, x: 0, y: 0, ease: 'power1.inOut'}, delay);

    delay += sectionDuration;
	
    tl.to(plane.rotation, {x: -Math.PI * 0.1, y: Math.PI * 2, z: -Math.PI * 0.2, ease: 'none'}, delay);
    tl.to(plane.position, {x: 0, y: 30, z: 320, ease: 'power1.in'}, delay);

    tl.to(scene.light.position, { x: 0, y: 0, z: 0}, delay)
  }

  /** 加载模型 */
  function loadModel() {
    // 创建 gsap 滚动触发器
    gsap.registerPlugin(ScrollTrigger);

    // 创建加载管理器
    const manager = new THREE.LoadingManager(
      // onload: 所有加载器加载完成后
      () => {
        if (!objRef.current) return;

        // 遍历对象的子 3d 对象
        objRef.current.traverse(child => {
          if (child.isMesh) {
            // 创建材质
            const material = new THREE.MeshPhongMaterial({
              color: 0x171511, // 颜色
              specular: 0xd0cbc7, // 高光颜色
              shininess: 5, // 光泽度
              flatShading: true, // 平面着色
            });

            // 更新子对象材质
            child.material = material;
            child.material.needsUpdate = true;
          }
        });

        setupAnimation();
      },
      /**
       * onProgress: 当每个项目完成后
       * url — 被加载的项的url
       * itemsLoaded — 目前已加载项的个数
       * itemsTotal — 总共所需要加载项的个数
       */
      (url, itemsLoaded, itemsTotal) => {
        // console.log(url, itemsLoaded, itemsTotal);
      }
    );

    // 创建加载器
    const loader = new OBJLoader(manager);
    loader.load(`${process.env.PUBLIC_URL}/models/obj/airplane.obj`, obj => {
      objRef.current = obj;
    });
  }

  /* ---------- useEffect ---------- */
  useEffect(() => {
    // 记载模型
    loadModel();
  }, []);

  return (
    <div className={comCls}>
      <div className="content">
        <div className="loading">Loading</div>
        <div className="trigger"></div>
        <div className="section">
          <h1>Airplanes.</h1>
          <h3>The beginners guide.</h3>
          <p>You've probably forgotten what these are.</p>
          {/* <div className="phonetic">/ ˈɛərˌpleɪn /</div> */}
          <div className="scroll-cta">Scroll</div>
        </div>

        <div className="section right">
          <h2>They're kinda like buses...</h2>
        </div>

        <div className="ground-container">
          <div className="parallax ground"></div>
          <div className="section right">
            <h2>..except they leave the ground.</h2>
            <p>Saaay what!?.</p>
          </div>

          <div className="section">
            <h2>They fly through the sky.</h2>
            <p>For realsies!</p>
          </div>

          <div className="section right">
            <h2>Defying all known physical laws.</h2>
            <p>It's actual magic!</p>
          </div>
          <div className="parallax clouds"></div>
        </div>

        <div className="blueprint">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <line
              id="line-length"
              x1="10"
              y1="80"
              x2="90"
              y2="80"
              strokeWidth="0.5"
            ></line>
            <path
              id="line-wingspan"
              d="M10 50, L40 35, M60 35 L90 50"
              strokeWidth="0.5"
            ></path>
            <circle
              id="circle-phalange"
              cx="60"
              cy="60"
              r="15"
              fill="transparent"
              strokeWidth="0.5"
            ></circle>
          </svg>
          <div className="section dark ">
            <h2>The facts and figures.</h2>
            <p>Lets get into the nitty gritty...</p>
          </div>
          <div className="section dark length">
            <h2>Length.</h2>
            <p>Long.</p>
          </div>
          <div className="section dark wingspan">
            <h2>Wing Span.</h2>
            <p>I dunno, longer than a cat probably.</p>
          </div>
          <div className="section dark phalange">
            <h2>Left Phalange</h2>
            <p>Missing</p>
          </div>
          <div className="section dark">
            <h2>Engines</h2>
            <p>Turbine funtime</p>
          </div>
          {/* <div className="section"></div> */}
        </div>
        <div className="sunset">
          <div className="section"></div>
          <div className="section end">
            <h2>Fin.</h2>
            <ul className="credits">
              <li>
                Plane model by{" "}
                <a
                  href=""
                  target="_blank"
                >
                  Google
                </a>
              </li>
              <li>
                Animated using{" "}
                <a href="" target="_blank">
                  GSAP ScrollTrigger
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
