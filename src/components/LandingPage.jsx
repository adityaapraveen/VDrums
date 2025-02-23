// src/components/LandingPage.jsx
import React from 'react';
import '../styles/LandingPage.css';

const LandingPage = ({ onStart }) => {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="landing-title">Virtual Drums</h1>
        <p className="landing-subtitle">
          Experience the future of music with our AI-powered virtual drum kit
        </p>
        
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">🎵</div>
            <h3>No Equipment Needed</h3>
            <p>Just use your hands to create amazing beats</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered</h3>
            <p>Advanced hand tracking technology</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Interactive Design</h3>
            <p>Visual feedback for each drum hit</p>
          </div>
        </div>

        <button className="start-button" onClick={onStart}>
          Start Playing
        </button>

        <div className="requirements">
          <h3>Requirements</h3>
          <ul>
            <li>Webcam access</li>
            <li>Well-lit environment</li>
            <li>Space for hand movements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;