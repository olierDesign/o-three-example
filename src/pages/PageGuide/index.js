import React from 'react';
import { Link } from 'react-router-dom';

function PageGuide() {
  return (
    <div className="o-guide">
      <ul className="o-guide__list">
        <li className="o-guide__item">
          <Link to="Css2dLabel">月亮绕着地球转(Css2dLabel)</Link>
        </li>
      </ul>
    </div>
  );
};

export default PageGuide;