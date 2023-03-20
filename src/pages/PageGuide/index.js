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
      </ul>
    </div>
  );
};

export default PageGuide;