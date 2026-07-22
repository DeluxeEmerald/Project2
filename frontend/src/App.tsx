//import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmail from './components/VerifyEmail';

import LoggedInTopBar from './pages/MainContent';
import Packs from './components/Packs';
import OpenPack from './components/OpenPack';
import Inventory from './components/Inventory';
import Decks from './components/Decks';
import CardDetails from './components/CardDetails';
import SignUpSubmission from './components/SignUpSubmission';
import RequestReset from './components/ResetRequest';
import ResetPassword from './components/ResetPassword';

import DeckDetails from './components/DeckDetails';
import Modified from './components/ModifyCardInDeck';
import CreateDeck from './components/CreateDeck';
import DeckDeleteConfirm from './components/DeckDeleteConfirm';

function App() {
return (
  <Router >
    <main id="main-content">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/confirm" element={<SignUpSubmission />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/requestreset" element={<RequestReset />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<LoggedInTopBar />}>
          <Route path="/packs" element={<Packs />} />
          <Route path="/openpack" element={<OpenPack />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/card/:cardId" element={<CardDetails />} />
          <Route path="/decks/" element={<Decks />} />
          <Route path="/createdeck" element={<CreateDeck />} />
          <Route path="/deckdelete" element={<DeckDeleteConfirm />} />
          <Route path="/deckdetails/:deckId" element={<DeckDetails />} />
          <Route path="/modifycard/:deckId" element={<Modified />} />
        </Route>

        <Route path="*" element={<Navigate to="/"/>} />
      </Routes>
    </main>
  </Router>
  );
}

export default App;
