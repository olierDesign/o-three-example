import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import testGlb from "./static/test.glb";
import testHdr from "./static/test.hdr";

export default function Model(props) {
  const {
    orientation
  } = props;
  /* ---------- variable ---------- */
  const comCls = "test__device-orientation";

  /* ---------- useRef ---------- */
  // 画布 dom
  const canvasRef = useRef();
  // 场景 scene
  const sceneRef = useRef();
  // 相机 camera
  const cameraRef = useRef();
  // 渲染器 renderer
  const rendererRef = useRef();
  // 动画混合器 mixer
  const mixerRef = useRef();
  // 定时器
  const reqId = useRef();
  // 时间
  const clockRef = useRef();
  // 组
  const groupRef = useRef();
  // 模型 gltf
  const gltfRef = useRef();
  // hdr
  const hdrRef = useRef();
  // 控制器
  const controlRef = useRef();

  /* ---------- function ---------- */
  // 加载 hdr
  const handleHdr = url => (
    new Promise(resolve => {
      new RGBELoader().load(url, texture => {
        hdrRef.current = texture;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        sceneRef.current.environment = texture;
        resolve(texture);
      });

      const pmremGenerator = new THREE.PMREMGenerator(rendererRef.current);
      pmremGenerator.compileEquirectangularShader();
    })
  );

  // 加载 glb
  const handleGltf = url => (
    new Promise(resolve => {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(`${process.env.PUBLIC_URL}/libs/draco/`);
  
      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);
      gltfLoader.load(url, gltf => {
        gltfRef.current = gltf;
  
        const { scene, animations } = gltf;
  
        groupRef.current.clear();
        groupRef.current.add(scene);
  
        if (animations && animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(sceneRef.current);
  
          animations.forEach(localClip => {
            !!localClip && mixerRef.current.clipAction(localClip).play();
          });
        }
      });
    })
  );

  // 初始函数
  const init = () => {
    THREE.ColorManagement.legacyMode = false;

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 创建组
    groupRef.current = new THREE.Group();
    groupRef.current.name = "t-group";
    sceneRef.current.add(groupRef.current);

    // 创建透视相机
    cameraRef.current = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    cameraRef.current.position.set(0, 10, 100);
    cameraRef.current.lookAt(groupRef.current.position);
    // 添加相机到场景
    sceneRef.current.add(cameraRef.current);

    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    rendererRef.current.outputEncoding = THREE.sRGBEncoding;
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);

    // 预计算辐射环境贴图生成器
    // const pmremGenerator = new THREE.PMREMGenerator(rendererRef.current);
    // sceneRef.current.background = pmremGenerator.fromScene( new RoomEnvironment(), 0 ).texture;
    // sceneRef.current.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

    // 创建时间
    clockRef.current = new THREE.Clock();

    // 操作面板
    // createActionPanel();

    // 播放动画
    let now;
    let pre = Date.now();

    const animate = () => {
      reqId.current = requestAnimationFrame(animate);
      now = Date.now();

      if (now - pre > 16.6) {
        pre = now - ((now - pre) % 16.6);
        rendererRef.current.render(sceneRef.current, cameraRef.current);

        if (mixerRef.current) {
          mixerRef.current.update(clockRef.current.getDelta());
        }
      }
    };
    animate();

    return new Promise((resolve, reject) => {
      if (sceneRef.current) {
        resolve(sceneRef.current);
      } else {
        reject("error");
      }
    });
  };

  // 屏幕尺寸
  const onWindowResize = () => {
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  useEffect(() => {
    if (!sceneRef.current) {
      !!reqId.current && cancelAnimationFrame(reqId.current);
      
      Promise.all([init(), handleHdr(testHdr)]).then(() => {
        handleGltf(testGlb)
      });
    }
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  useEffect(() => {
    if (!orientation) return;

    const { gamma } = orientation;
    groupRef.current.rotation.y = gamma;
  }, [orientation]);

  return (
    <canvas ref={canvasRef} ></canvas>
  );
}
