import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { Recipes } from './pages/Recipes';
import { Health } from './pages/Health';
import { AppRoute } from './types';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#FFF9F5] text-stone-800 font-sans selection:bg-orange-200">
        <Routes>
          <Route path={AppRoute.HOME} element={<Home />} />
          <Route path={AppRoute.SCAN} element={<Scan />} />
          <Route path={AppRoute.RECIPES} element={<Recipes />} />
          <Route path={AppRoute.HEALTH} element={<Health />} />
          <Route path="*" element={<Navigate to={AppRoute.HOME} replace />} />
        </Routes>
        <Navbar />
      </div>
    </Router>
  );
};

export default App;
