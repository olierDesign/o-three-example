import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import PageGuide from './pages/PageGuide';

import Css2dLabel from './pages/examples/Css2dLabel';
import Css3dMolecules from './pages/examples/Css3dMolecules';
import Css3dOrthographic from './pages/examples/Css3dOrthographic';
import Css3dPeriodictable from './pages/examples/Css3dPeriodictable';
import Css3dSandbox from './pages/examples/Css3dSandbox';

import WebglCamera from './pages/examples/WebglCamera';
import WebglBuffergeometryCustomAttributesParticles from './pages/examples/WebglBuffergeometryCustomAttributesParticles';
import WebglBuffergeometrySelectiveDraw from './pages/examples/WebglBuffergeometrySelectiveDraw';
import WebglCustomAttributes from './pages/examples/WebglCustomAttributes';
import WebglCustomAttributesLines from './pages/examples/WebglCustomAttributesLines';
import WebglCustomAttributesPoints from './pages/examples/WebglCustomAttributesPoints';
import WebglCustomAttributesPoints2 from './pages/examples/WebglCustomAttributesPoints2';
import WebglCustomAttributesPoints3 from './pages/examples/WebglCustomAttributesPoints3';
import WebglGpgpuBirds from './pages/examples/WebglGpgpuBirds';
import WebglHelpers from './pages/examples/WebglHelpers';

import PPTCavans3D from './pages/ppt/Cavans3D';
import PPTCamera from './pages/ppt/Camera';
import PPTDynamicMap from './pages/ppt/DynamicMap';
import PPTPortalDynamicMap from './pages/ppt/PortalDynamicMap';
import PPTGradientTexture from './pages/ppt/GradientTexture';
import PPTGradientMaterial from './pages/ppt/GradientMaterial';
import PPTGradientGltf from './pages/ppt/GradientGltf';
import PPTAirplanes from './pages/ppt/Airplanes';

import TestDirectionalLight from './pages/test/DirectionalLight';
import TestRoomEnvironment from './pages/test/RoomEnvironment';
import TestDeviceorientation from './pages/test/Deviceorientation';

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
        <Route exact path="/WebglBuffergeometrySelectiveDraw" element={<WebglBuffergeometrySelectiveDraw/>} />
        <Route exact path="/WebglCustomAttributes" element={<WebglCustomAttributes/>} />
        <Route exact path="/WebglCustomAttributesLines" element={<WebglCustomAttributesLines/>} />
        <Route exact path="/WebglCustomAttributesPoints" element={<WebglCustomAttributesPoints/>} />
        <Route exact path="/WebglCustomAttributesPoints2" element={<WebglCustomAttributesPoints2/>} />
        <Route exact path="/WebglCustomAttributesPoints3" element={<WebglCustomAttributesPoints3/>} />
        <Route exact path="/WebglGpgpuBirds" element={<WebglGpgpuBirds/>} />
        <Route exact path="/WebglHelpers" element={<WebglHelpers/>} />
        
        <Route exact path="/PPTCavans3D" element={<PPTCavans3D/>} />
        <Route exact path="/PPTCamera" element={<PPTCamera/>} />
        <Route exact path="/PPTDynamicMap" element={<PPTDynamicMap/>} />
        <Route exact path="/PPTPortalDynamicMap" element={<PPTPortalDynamicMap/>} />
        <Route exact path="/PPTGradientTexture" element={<PPTGradientTexture/>} />
        <Route exact path="/PPTGradientMaterial" element={<PPTGradientMaterial/>} />
        <Route exact path="/PPTGradientGltf" element={<PPTGradientGltf/>} />
        <Route exact path="/PPTAirplanes" element={<PPTAirplanes/>} />

        <Route exact path="/TestDirectionalLight" element={<TestDirectionalLight/>} />
        <Route exact path="/TestRoomEnvironment" element={<TestRoomEnvironment/>} />
        <Route exact path="/TestDeviceorientation" element={<TestDeviceorientation/>} />
      </Routes>
    </Router>
  );
}

export default App;
