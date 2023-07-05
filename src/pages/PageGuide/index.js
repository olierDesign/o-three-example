import React from 'react';
import { Link } from 'react-router-dom';

function PageGuide() {
  return (
    <div className="o-guide">
      <h3>Css2D</h3>
      <ul className="o-guide__list">
        <li className="o-guide__item">
          <Link to="Css2dLabel">月亮绕着地球转(Css2dLabel)</Link>
        </li>
      </ul>

      <h3>Css3D</h3>
      <ul className="o-guide__list">
        <li className="o-guide__item">
          <Link to="Css3dMolecules">分子旋转(Css3dMolecules)</Link>
        </li>
        <li className="o-guide__item">
          <Link to="Css3dOrthographic">正交相机(Css3dOrthographic)</Link>
        </li>
        <li className="o-guide__item">
          <Link to="Css3dPeriodictable">周期表(Css3dPeriodictable)</Link>
        </li>
        <li className="o-guide__item">
          <Link to="Css3dSandbox">沙盒(Css3dSandbox)</Link>
        </li>
      </ul>

      <h3>WEBGL</h3>
      <ul className="o-guide__list">
        <li className="o-guide__item">
          <Link to="WebglCamera">相机 Helper(WebglCamera)</Link>
        </li>
        <li className="o-guide__item">
          <Link to="WebglBuffergeometryCustomAttributesParticles">缓冲几何体自定义属性 (WebglBuffergeometryCustomAttributesParticles)</Link>
        </li>
        <li className="o-guide__item">
          <Link to="WebglBuffergeometrySelectiveDraw">缓冲几何体选择性绘制 (WebglBuffergeometrySelectiveDraw)</Link>
        </li>
        <li className="o-guide__item">
          <Link to="WebglCustomAttributes">着色器线段球 (WebglCustomAttributes)</Link>
        </li>
        <li className="o-guide__item">
          <Link to="WebglCustomAttributesLines">着色器线形文字 (WebglCustomAttributesLines)</Link>
        </li>
        <li className="o-guide__item">
          <Link to="WebglCustomAttributesPoints">着色器两种颜色分界点 (WebglCustomAttributesPoints)</Link>
        </li>
        <li className="o-guide__item">
          <Link to="WebglCustomAttributesPoints2">着色器两种几何体组合 (WebglCustomAttributesPoints2)</Link>
        </li>
        <li className="o-guide__item">
          <Link to="WebglCustomAttributesPoints3">着色器两种几何体组合 (WebglCustomAttributesPoints3)</Link>
        </li>
        <li className="o-guide__item">
          <Link to="WebglGpgpuBirds">着色器鸟群 todo (WebglGpgpuBirds)</Link>
        </li>
        
      </ul>

      <h3>PPT 示例</h3>
      <ul className="o-guide__list">
        <li className="o-guide__item">
          <Link to="PPTCavans3D">Cavans3D</Link>
        </li>
        <li className="o-guide__item">
          <Link to="PPTCamera">Camera 相机调试</Link>
        </li>
        <li className="o-guide__item">
          <Link to="PPTDynamicMap">动态贴图</Link>
        </li>
        
      </ul>

      <h3>测试 示例</h3>
      <ul className="o-guide__list">
        <li className="o-guide__item">
          <Link to="TestDirectionalLight">平行光</Link>
        </li>
      </ul>
    </div>
  );
};

export default PageGuide;