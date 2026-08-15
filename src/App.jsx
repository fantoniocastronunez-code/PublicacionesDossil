import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddVehicle from './pages/AddVehicle';
import VehicleDetail from './pages/VehicleDetail';
import { useThemeStore } from './store/useThemeStore';

function App() {
  const initTheme = useThemeStore(state => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 selection:bg-indigo-200">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/agregar" element={<AddVehicle />} />
            <Route path="/editar/:id" element={<AddVehicle />} />
            <Route path="/vehiculo/:id" element={<VehicleDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;