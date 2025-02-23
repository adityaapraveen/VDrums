// src/App.jsx
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import DrumKit from './components/DrumKit';
import './App.css';

const App = () => {
  const [startPlaying, setStartPlaying] = useState(false);

  return (
    <div className="app">
      {!startPlaying ? (
        <LandingPage onStart={() => setStartPlaying(true)} />
      ) : (
        <DrumKit />
      )}
    </div>
  );
};

export default App;