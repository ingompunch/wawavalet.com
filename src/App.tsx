import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Reservation } from './pages/Reservation';
import { Admin } from './pages/Admin';
import { Intro } from './pages/Intro';
import { Guide } from './pages/Guide';
import { Fees } from './pages/Fees';
import { FAQ } from './pages/FAQ';

export default function App() {
  const basename = window.location.hostname.includes('github.io') ? '/wawavalet.com' : '/';
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/reservation" element={<Layout><Reservation /></Layout>} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
