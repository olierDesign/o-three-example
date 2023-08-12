export const isClientSide = () => Boolean(typeof window !== 'undefined' && window.document);

export const checkIsMobile = () => {
  if (!isClientSide()) {
    return false;
  }
  // 与 nodejs 保持一致
  // 保证初始渲染内容的一致性，后续再根据宽度来判定是否需要重新渲染
  const ua = navigator.userAgent.toLocaleLowerCase();
  const types = ['android', 'ipad', 'iphone', 'windows phone'];

  return types.some((type) => ua.indexOf(type) !== -1);
};

export const checkIsSafari = () => {
  if (!isClientSide()) {
    return false;
  }

  const ua = navigator.userAgent.toLocaleLowerCase();
  return ua.includes('safari') && !ua.includes('chrome');
};

// https://github.com/faisalman/ua-parser-js/blob/master/src/ua-parser.js
export const checkIsQQBrowser = (ua) => {
  return ua?.toLowerCase().indexOf('qqbrowser') !== -1;
};

export const checkIs360 = (ua) => {
  return /\bqihu|(qi?ho?o?|360)browser/i.test(ua);
};

export const checkIsSougou = (ua) => {
  return /(metasr)[/ ]?([\w.]+)/i.test(ua);
};

export const matchMedia = (responseWidth) => {
  // Safari 浏览器 media 查询和 window.innerWidth <= responseWidth 对于移动端的判定不一致，导致前端逻辑和样式应用不一致
  // media 读的是 viewport 的宽度，innerWidth 读的是 Layout viewport的宽度，存在 viewport <= Layout viewport 的情况，故针对 safari 用window.matchMedia 判定 Document 是否匹配媒体查询
  if (checkIsSafari() && (typeof window.matchMedia === 'function')) {
    return window.matchMedia(`(max-width: ${responseWidth}px)`)?.matches;
  }

  return window.innerWidth <= responseWidth
};
