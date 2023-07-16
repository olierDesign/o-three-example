import * as THREE from 'three';

/**
 * 设置渐变
 * @param config {
 *   geometry: THREE.Geometry                       几何体
 *   colors {stop: number, color: THREE.Color}[]    渐变颜色数组
 *   axis: string                                   渐变轴 (XYZ)
 *   reverse: boolean                               是否反向
 *   rotation: {x, y, z}                            旋转弧度 (XYZ)
 * } 
*/
function setGradient(config) {
  const {
    geometry,
    colors,
    axis,
    reverse,
    rotation
  } = config;

  // 复制临时几何体
  const temGeometry = geometry.clone();

  // 计算当前几何体的的边界矩形
  temGeometry.computeBoundingBox();
  // 获取几何体的外边界矩形 (Box3)
  const geoBoundingBox = temGeometry.boundingBox;
  // 计算几何体范围
  const geoBoundingSize = new THREE.Vector3().subVectors(geoBoundingBox.max, geoBoundingBox.min);
  
  // 渐变方向轴列表
  const axisList = axis.split('');
  // “位置变量”在“边界矩形”范围内的“标准化设备坐标”
  const normalized = new THREE.Vector3();
  // 位置比例值
  let normalizedAxis = 0;

  // 位置列表
  const geoPositions = temGeometry.attributes.position;
  // 位置临时变量
  const posVector = new THREE.Vector3();
  // 颜色列表
  const geoColors = [];
  // 颜色临时变量
  const colorVector = new THREE.Color();

  // 遍历渐变颜色数组
  for (let c = 0; c < colors.length - 1; c++) {
    // 计算相邻颜色区间的色差
    const colorDiff = colors[c + 1].stop - colors[c].stop;

    for (let i = 0; i < geoPositions.count; i++) {
      // 获取坐标
      posVector.fromArray(geoPositions.array, i * 3);

      // 设置坐标的旋转值
      if (rotation) {
        posVector.applyEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z));
        // 坐标值限制在几何体的的边界矩形范围内
        posVector.clamp(geoBoundingBox.min, geoBoundingBox.max);
      }

      // 获取“位置变量”在“边界矩形”范围内的“标准化设备坐标”
      normalized.subVectors(posVector, geoBoundingBox.min).divide(geoBoundingSize);

      // 根据渐变方向轴，计算位置比例值
      // axisList => [x, y, z]
      switch (axisList.length) {
        case 3: {
          normalizedAxis = (normalized[axisList[0]] + normalized[axisList[1]] + normalized[axisList[2]]) / axisList.length;
          break;
        };
        case 2: {
          normalizedAxis = (normalized[axisList[0]] + normalized[axisList[1]]) / axisList.length;
          break;
        };
        default: {
          normalizedAxis = normalized[axisList[0]];
        }
      }

      // 反向处理
      if (reverse) {
        normalizedAxis = 1 - normalizedAxis;
      }

      // “位置比例值” 在颜色区间范围内
      if (normalizedAxis >= colors[c].stop && normalizedAxis <= colors[c + 1].stop) {
        // 根据“位置比例值”计算“颜色比例值”
        const localNormalizedAxis = (normalizedAxis - colors[c].stop) / colorDiff;

        // 根据颜色比例值获取渐变区间的线性插值
        colorVector.lerpColors(colors[c].color, colors[c+1].color, localNormalizedAxis);
        // 存储在颜色属性数组中
        colorVector.toArray(geoColors, i * 3);
      }
    }
  }

  // 设置几何体的颜色属性
  temGeometry.setAttribute('color', new THREE.Float32BufferAttribute(geoColors, 3));
  temGeometry.attributes.color.needsUpdate = true;

  return temGeometry;
}

export default setGradient;