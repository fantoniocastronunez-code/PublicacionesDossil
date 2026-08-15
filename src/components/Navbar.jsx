import { Link } from 'react-router-dom';
import { CarFront, PlusCircle, Moon, Sun, RefreshCw } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { useVehicleStore } from '../store/useVehicleStore';

export default function Navbar() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { fetchVehiculos, loading } = useVehicleStore();

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <img src="/LOGO.gif" alt="Dossil Automotriz Logo" className="h-10 w-auto rounded object-contain" />
            <span>Dossil Automotriz</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => fetchVehiculos()} 
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              title="Actualizar stock"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <Link 
              to="/agregar" 
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md font-medium"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Nuevo Vehículo</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
