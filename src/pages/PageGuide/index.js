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
      </ul>

      <h3>canvas3d</h3>
      <ul className="o-guide__list">
        <li className="o-guide__item">
          <Link to="Cavans3D">Cavans3D</Link>
        </li>
      </ul>
    </div>
  );
};

export default PageGuide;