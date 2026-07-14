//import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import LoggedInTopBar from './pages/MainContent';
import Packs from './components/Packs';
import OpenPack from './components/OpenPack';
import Inventory from './components/Inventory';
import Decks from './components/Decks';
import Social from './components/Social';

function App() {
return (
  <Router >
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<LoggedInTopBar />}>
        <Route path="/packs" element={<Packs />} />
        <Route path="/openpack" element={<OpenPack />}></Route>
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/decks" element={<Decks />} />
        <Route path="/social" element={<Social />} />
      </Route>

      <Route path="*" element={<Navigate to="/"/>} />
    </Routes>
  </Router>
  );
}

export default App;
