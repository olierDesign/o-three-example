import React, { useEffect, useRef } from "react";

import * as THREE from 'three';
import{ OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./css/Airplanes.scss";

export default function PortalDynamicMap(props) {
  /* ---------- variable ---------- */
  const comCls = "ppt__airplanes";

  /* ---------- state ---------- */

  /* ---------- ref ---------- */
  const objRef = useRef(null);

  /* ---------- function ---------- */
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
      },
      /**
       * onProgress: 当每个项目完成后
       * url — 被加载的项的url
       * itemsLoaded — 目前已加载项的个数
       * itemsTotal — 总共所需要加载项的个数
       */
      (url, itemsLoaded, itemsTotal) => {
        console.log(url, itemsLoaded, itemsTotal);
      }
    );

    // 创建加载器
    const loader = new OBJLoader(manager);
    loader.load(`${process.env.PUBLIC_URL}/models/obj/airplane.obj`, (obj) => {
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
                  href="https://poly.google.com/view/8ciDd9k8wha"
                  target="_blank"
                >
                  Google
                </a>
              </li>
              <li>
                Animated using{" "}
                <a href="https://greensock.com/scrolltrigger/" target="_blank">
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
