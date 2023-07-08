attribute float size;

varying vec3 vColor;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  /** 
   * 此代码使用模型视图矩阵将顶点在模型空间中的位置转换为摄影机空间，
   * 然后根据摄影机和顶点之间的距离计算要渲染的点的大小。
   * 点的大小是通过将指定的大小乘以缩放因子来确定的，该缩放因子与顶点在相机空间中的位置的z坐标的负倒数成比例。
   * 这使得离摄影机较近的点看起来比离摄影机较远的点更大。
   */
  gl_PointSize = size * (300.0 / -mvPosition.z);

  gl_Position = projectionMatrix * mvPosition;
}