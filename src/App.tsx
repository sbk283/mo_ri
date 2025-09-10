import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Index from './pages/Index';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
