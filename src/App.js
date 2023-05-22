import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import PageGuide from './pages/PageGuide';
import Css2dLabel from './pages/examples/Css2dLabel';
import Css3dMolecules from './pages/examples/Css3dMolecules';
import Css3dOrthographic from './pages/examples/Css3dOrthographic';
import Css3dPeriodictable from './pages/examples/Css3dPeriodictable';
import Css3dSandbox from './pages/examples/Css3dSandbox';
import WebglCamera from './pages/examples/WebglCamera';
import WebglBuffergeometryCustomAttributesParticles from './pages/examples/WebglBuffergeometryCustomAttributesParticles';

import PPTCavans3D from './pages/ppt/Cavans3D';
import PPTCamera from './pages/ppt/Camera';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<PageGuide/>} />
        <Route exact path="/Css2dLabel" element={<Css2dLabel/>} />
        <Route exact path="/Css3dMolecules" element={<Css3dMolecules/>} />
        <Route exact path="/Css3dOrthographic" element={<Css3dOrthographic/>} />
        <Route exact path="/Css3dPeriodictable" element={<Css3dPeriodictable/>} />
        <Route exact path="/Css3dSandbox" element={<Css3dSandbox/>} />

        <Route exact path="/WebglCamera" element={<WebglCamera/>} />
        <Route exact path="/WebglBuffergeometryCustomAttributesParticles" element={<WebglBuffergeometryCustomAttributesParticles/>} />
        
        <Route exact path="/PPTCavans3D" element={<PPTCavans3D/>} />
        <Route exact path="/PPTCamera" element={<PPTCamera/>} />
      </Routes>
    </Router>
  );
}

export default App;
