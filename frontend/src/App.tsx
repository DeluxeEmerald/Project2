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
import CardDetails from './components/CardDetails';
import SignUpSubmission from './components/SignUpSubmission';
import DeckCreation from './components/DeckCreation';
import DeckDetails from './components/DeckDetails';
import Modified from './components/ModifyCardInDeck';

function App() {
return (
  <Router >
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/confirm" element={<SignUpSubmission />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<LoggedInTopBar />}>
        <Route path="/packs" element={<Packs />} />
        <Route path="/openpack" element={<OpenPack />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/card/:cardId" element={<CardDetails />} />
        <Route path="/decks/" element={<Decks />} />
        <Route path="/deckcreation" element={<DeckCreation />} />
        <Route path="/deckdetails/:deckId" element={<DeckDetails />} />
        <Route path="/modifycard/:deckId" element={<Modified />} />
      </Route>

      <Route path="*" element={<Navigate to="/"/>} />
    </Routes>
  </Router>
  );
}

export default App;
