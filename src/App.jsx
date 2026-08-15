import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddVehicle from './pages/AddVehicle';
import VehicleDetail from './pages/VehicleDetail';
import PublishVehicle from './pages/PublishVehicle';
import { useThemeStore } from './store/useThemeStore';

function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/agregar" element={<AddVehicle />} />
            <Route path="/editar/:id" element={<AddVehicle />} />
            <Route path="/vehiculo/:id" element={<VehicleDetail />} />
            <Route path="/vehiculo/:id/publicar" element={<PublishVehicle />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;