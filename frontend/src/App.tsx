//import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import Packs from './pages/PackPage';
import Inventory from './pages/InventoryPage';
import Decks from './pages/DecksPage';
import Social from './pages/SocialPage';
import SignupPage from './pages/SignupPage';

function App() {
return (
  <Router >
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/packs" element={<Packs />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/decks" element={<Decks />} />
      <Route path="/social" element={<Social />} />
      <Route path="*" element={<Navigate to="/"/>} />
    </Routes>
  </Router>
  );
}

export default App;
