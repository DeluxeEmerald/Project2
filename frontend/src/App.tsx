//import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import LoggedInTopBar from './pages/MainContent';
import Packs from './components/Packs';
import OpenPack from './components/OpenPack';
import Inventory from './components/Inventory';
import Card from './components/Card';
import Decks from './components/Decks';
import Deck from './components/Deck';
import Social from './components/Social';
import CardDetails from './components/CardDetails';

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
        <Route path="/cardinfo" element={<Card />} />
        <Route path="/decks" element={<Decks />} />
        <Route path="/deckinfo" element={<Deck />} />
        <Route path="/social" element={<Social />} />
        <Route path="/card/:cardId" element={<CardDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/"/>} />
    </Routes>
  </Router>
  );
}

export default App;
