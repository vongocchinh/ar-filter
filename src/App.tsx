import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CameraKit from './CameraKit';
import PrivacyPolicy from './PrivacyPolicy';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CameraKit />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}

export default App;

