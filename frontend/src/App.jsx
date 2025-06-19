import './App.css';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout/Layout';
import Home from './pages/Home/Home';

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      {/* Add more routes wrapped in <Layout> as needed */}
    </Routes>
  );
};

export default App;