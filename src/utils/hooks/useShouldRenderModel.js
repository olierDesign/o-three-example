import { useState, useEffect } from 'react';
import { checkIsMobile, checkIsQQBrowser, checkIs360, checkIsSougou } from '../util';

// 首次渲染时的 dom 结构和 renderToString 保持一致
// 最终值需要在 useEffect 中确认，hydrate 才没问题
export const useShouldRenderModel = () => {
  const [shouldRenderModel, setShouldRenderModel] = useState(true);

  useEffect(() => {
    detect();
  }, []);

  async function detect() {
    if (!checkIsUsableDevice()) {
      setShouldRenderModel(false);
      return;
    }

    if (await checkIsLowFPS()) {
      setShouldRenderModel(false);
      // @ts-ignore
      if (window.aegisIns) {
        // @ts-ignore
        window.aegisIns.reportEvent({ name: 'DEGRADE_HOME_BANNER' });
      }
    }
  }

  return [shouldRenderModel, detect];
};

function checkIsUsableDevice() {
  return (
    // 模型在移动端不显示，此处移动端的判断不由宽度决定
    !checkIsMobile() &&
    !checkIsQQBrowser(navigator.userAgent) &&
    !checkIsSougou(navigator.userAgent) &&
    !checkIs360(navigator.userAgent) &&
    !checkIsLowVersion() &&
    isSupportWebgl() &&
    checkHardwareAccelerate()
  );
}

// For debug: 模拟第n次后调用为 FPS 低的情况
// let time = 0;
// async function checkIsLowFPS(): Promise<boolean> {
//   return new Promise<boolean>((resolve) => {
//     setTimeout(() => {
//       time -= 1;
//       resolve(time < 0);
//     }, 4000);
//   });
// }

async function checkIsLowFPS() {
  const records = await calcFPS();
  return records.every((record) => record < 50);
}

function calcFPS() {
  return new Promise((resovle) => {
    const records = [];

    let prevTime = (performance || Date).now();
    let frames = 0;

    function load() {
      frames += 1;
      const time = (performance || Date).now();

      if (time > prevTime + 1000) {
        const fps = Math.round((frames * 1000) / (time - prevTime));
        records.push(fps);

        prevTime = time;
        frames = 0;
      }

      // 采样 4s，banner 一屏切换的时间 4s
      if (records.length >= 4) {
        resovle(records);
      } else {
        window.requestAnimationFrame(load);
      }
    }
    load();
  });
}

function isSupportWebgl() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

// https://gist.github.com/cvan/042b2448fcecefafbb6a91469484cdf8#file-webgl-detect-gpu-js-L8
// https://gist.github.com/gkjohnson/9ee8b40bd9475576a1ab5c2ca9c6121d
// 检测是否开启硬件加速 (不能准确判断)
// 在 chrome 浏览器中，如果开启硬件加速，renderer 的值为 GPU 信息，否则为其他值
// 有一些老的苹果电脑 renderer 的值是 Apple GPU，新的电脑是 Apple M1
// 在 firefox 中，是否开启硬件加速， renderer 的值均为 GPU 信息
function checkHardwareAccelerate() {
  const canvas = document.createElement('canvas');
  let gl;
  let debugInfo;
  let renderer;

  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e) {}

  if (gl) {
    debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return ['AMD', 'Intel', 'NVIDIA', 'Apple'].some((d) => renderer.indexOf(d) !== -1);
  }

  return false;
}

// https://stackoverflow.com/questions/23242002/css-class-for-only-safari-on-windows
function checkIsLowVersion() {
  const nAgt = navigator.userAgent;
  let fullVersion = `${parseFloat(navigator.appVersion)}`;
  let majorVersion;
  let verOffset;
  let ix;
  const getVersion = () => {
    // trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(';')) != -1) fullVersion = fullVersion.substring(0, ix);
    if ((ix = fullVersion.indexOf(' ')) != -1) fullVersion = fullVersion.substring(0, ix);
    majorVersion = parseInt(`${fullVersion}`, 10);
    // @ts-ignore
    fullVersion = parseFloat(fullVersion);
    if (isNaN(majorVersion)) {
      // @ts-ignore
      fullVersion = parseFloat(navigator.appVersion);
      majorVersion = parseInt(navigator.appVersion, 10);
    }
  };

  // In Opera, the true version is after "Opera" or after "Version"
  if ((verOffset = nAgt.indexOf('Opera')) != -1) {
    fullVersion = nAgt.substring(verOffset + 6);
    if ((verOffset = nAgt.indexOf('Version')) != -1) fullVersion = nAgt.substring(verOffset + 8);
    getVersion();
    return majorVersion < 45;
  }
  // In MSIE, the true version is after "MSIE" in userAgent
  if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
    return true;
  }
  // In edge, the true version is after "Chrome"
  if ((verOffset = nAgt.indexOf('Edge')) != -1) {
    fullVersion = nAgt.substring(verOffset + 5);
    getVersion();
    return majorVersion < 50;
  }
  // In Chrome, the true version is after "Chrome"
  if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
    fullVersion = nAgt.substring(verOffset + 7);
    getVersion();
    return majorVersion < 56;
  }
  // In Safari, the true version is after "Safari" or after "Version"
  if ((verOffset = nAgt.indexOf('Safari')) != -1) {
    fullVersion = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf('Version')) != -1) fullVersion = nAgt.substring(verOffset + 8);
    getVersion();
    // @ts-ignore
    return fullVersion < 15.1;
  }
  // In Firefox, the true version is after "Firefox"
  if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
    fullVersion = nAgt.substring(verOffset + 8);
    getVersion();
    return majorVersion < 80;
  }
  return true;
}
