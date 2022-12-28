import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import PageGuide from './pages/PageGuide';
import Css2dLabel from './pages/examples/Css2dLabel';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<PageGuide/>} />
        <Route exact path="/Css2dLabel" element={<Css2dLabel/>} />
      </Routes>
    </Router>
  );
}

export default App;
