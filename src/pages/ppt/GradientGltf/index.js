import React, { useState, useEffect, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import "./css/GradientGltf.scss";

export default function GradientGltf(props) {
  const comCls = 'ppt__gradient-gltf';

  /* ---------- useState ---------- */
  const [glbUrl, setGlbUrl] = useState();
  const [hdrUrl, setHdrUrl] = useState();

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
  // 获取文件链接
  const getFileUrl = file =>
    new Promise((resolve, reject) => {
      if (file && window.FileReader) {
        const fr = new FileReader();
        fr.onloadend = function (event) {
          resolve(event.target.result);
        };
        fr.readAsDataURL(file);
      } else {
        reject("error");
      }
    });

  // 上传 glb
  const uploadGlbHandle = e => {
    const file = e.target.files[0];

    getFileUrl(file).then(result => {
      setGlbUrl(result);
    });
  };

  // 上传 hdr
  const uploadHdrHandle = e => {
    const file = e.target.files[0];

    getFileUrl(file).then(result => {
      setHdrUrl(result);
    });
  };

  // 加载 hdr
  const handleHdr = (url) => new Promise((resolve) => {
    new RGBELoader().load(url, (texture) => {
      hdrRef.current = texture;
      texture.mapping = THREE.EquirectangularReflectionMapping;
      sceneRef.current.environment = texture;
    });

    const pmremGenerator = new THREE.PMREMGenerator(rendererRef.current);
    pmremGenerator.compileEquirectangularShader();
  })

  // 加载 glb
  const handleGltf = (url) => new Promise((resolve) => {
    new GLTFLoader().load(url, (gltf) => {
      gltfRef.current = gltf;

      const {scene, animations} = gltf;
      groupRef.current.clear();
      groupRef.current.add(scene);
      
      if (animations && animations.length > 0) {
        mixerRef.current = new THREE.AnimationMixer(sceneRef.current);

        animations.forEach((localClip) => {
          !!localClip && mixerRef.current.clipAction(localClip).play();
        })
      }
    });
  });

  // 初始函数
  const init = () => {
    THREE.ColorManagement.legacyMode = false;

    // 创建场景
    sceneRef.current = new THREE.Scene();

    // 创建组
    groupRef.current = new THREE.Group();
    groupRef.current.name = 't-group';
    sceneRef.current.add(groupRef.current);

    // 创建透视相机
    cameraRef.current = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    cameraRef.current.position.set(0, 10, 50);
    cameraRef.current.lookAt(groupRef.current.position);
    // 添加相机到场景
    sceneRef.current.add(cameraRef.current);

    // 创建渲染器
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    rendererRef.current.outputEncoding = THREE.sRGBEncoding;
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);

    // 创建时间
    clockRef.current = new THREE.Clock();

    // 创建一个控制器
    controlRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);

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
				controlRef.current.update();

        if (mixerRef.current) {
          mixerRef.current.update(clockRef.current.getDelta())
        }

        if (hdrRef.current) {
          sceneRef.current.rotation.y += 0.006;
        }
      }
    }
    animate();
  };

  // 屏幕尺寸
  const onWindowResize = () => {
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  useEffect(() => {
    init();
    window.addEventListener('resize', onWindowResize);

    return () => {
      !!reqId.current && cancelAnimationFrame(reqId.current);
      window.removeEventListener('resize', onWindowResize);
    }
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !glbUrl) return;

    handleGltf(glbUrl);
  }, [glbUrl]);

  useEffect(() => {
    if (!sceneRef.current || !hdrUrl) return;

    handleHdr(hdrUrl);
  }, [hdrUrl]);

  return (
    <div className={comCls} id="container">
      <div className={`${comCls}-hd`}>
        {/* 上传 glb */}
        <button className={`${comCls}-btn`}>
          <input type="file" onChange={uploadGlbHandle} accept=".glb" />
          upload glb
        </button>

          {/* 上传 hdr */}
          <button className={`${comCls}-btn`}>
          <input type="file" onChange={uploadHdrHandle} accept=".hdr" />
          upload hdr
        </button>
      </div>

      <div className={`${comCls}-bd`}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}
