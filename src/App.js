import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import PageGuide from './pages/PageGuide';
import Css2dLabel from './pages/examples/Css2dLabel';
import Css3dMolecules from './pages/examples/Css3dMolecules';
import Css3dOrthographic from './pages/examples/Css3dOrthographic';
import Css3dPeriodictable from './pages/examples/Css3dPeriodictable';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<PageGuide/>} />
        <Route exact path="/Css2dLabel" element={<Css2dLabel/>} />
        <Route exact path="/Css3dMolecules" element={<Css3dMolecules/>} />
        <Route exact path="/Css3dOrthographic" element={<Css3dOrthographic/>} />
        <Route exact path="/Css3dPeriodictable" element={<Css3dPeriodictable/>} />
      </Routes>
    </Router>
  );
}

export default App;
