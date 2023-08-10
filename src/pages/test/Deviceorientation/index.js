import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";

import { useShouldRenderModel } from '../../../utils/hooks/useShouldRenderModel';

import Model from './Model';

import "./css/Deviceorientation.scss";

export default function Deviceorientation(props) {
  /* ---------- variable ---------- */
  const comCls = "test__device-orientation";

  /* ---------- useRef ---------- */
  const [shouldRenderModel] = useShouldRenderModel();

  /* ---------- useState ---------- */
  const [orientation, setOrientation] = useState({
    beta: 0,
    gamma: 0,
    alpha: 0,
  });
  const [maskVisible, setMaskVisible] = useState(true);

  // 防抖函数
  const debounce = (fn, delay) => {
    let timer = 0;

    return (...args) => {
      const self = this;
      timer && clearTimeout(timer);
      timer = window.setTimeout(() => {
        fn.apply(self, args);
      }, delay);
    };
  };

  // 重力感应
  const handleDeviceOrientation = (e) => {
    // beta表示设备绕x轴倾斜的角度（-180到180度）
    const beta = (Math.floor(e.beta) * 10) / 1000;
    // gamma表示设备绕y轴倾斜的角度（-90到90度）
    const gamma = (Math.floor(e.gamma) * 10) / 1000;
    // alpha表示设备绕z轴旋转的角度（0-360度）
    const alpha = (Math.floor(e.alpha) * 10) / 1000;
    setOrientation({
      beta,
      gamma,
      alpha,
    });
  };

  // 重力感应请求
  const requestAccess = e => {
    if ('DeviceOrientationEvent' in window) {
      // 设备支持 DeviceOrientationEvent
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // 需对于 iOS 13 及更高版本，需要请求设备方向权限
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener(
                'deviceorientation',
                handleDeviceOrientation,
                false
              );
            } else {
              alert('apply permission state: ' + permissionState);
            }
          })
          .catch(console.error);
      } else {
        // 不需要请求权限
        window.addEventListener(
          'deviceorientation',
          handleDeviceOrientation,
          false
        );
      }
    } else {
      alert('设备不支持 DeviceOrientationEvent');
    }
    setMaskVisible(false);
  };

  return (
    <div className={comCls} id="container">
      <div className={`${comCls}-detail`}>
        {`gamma: ${orientation.gamma}`}
      </div>
      <div className={`${comCls}-bd`}>
       <Model orientation={orientation} />
      </div>
      <div className={classnames(`${comCls}-mask`, {
        'is-hide': !maskVisible
      })}>
        <button className={`${comCls}-btn`} onClick={requestAccess}>
          欢迎体验
        </button>
      </div>
    </div>
  );
}
