// src/components/DrumKit.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { Hands } from '@mediapipe/hands';
import '../styles/DrumKit.css';
import * as Tone from 'tone';

// Import local audio files
import hihatSound from '../../public/hihat.wav';
import crashSound from '../../public/crash.wav';
import rideSound from '../../public/ride.wav';
import snareSound from '../../public/snare.wav';
import kickSound from '../../public/kick.wav';
import tom1Sound from '../../public/tom1.wav';
import tom2Sound from '../../public/tom2.wav';
import floorTomSound from '../../public/floorTom.wav';

// Use Tone.Player to play local audio files
const drumSamples = {
  hihat: new Tone.Player(hihatSound).toDestination(),
  crash: new Tone.Player(crashSound).toDestination(),
  ride: new Tone.Player(rideSound).toDestination(),
  snare: new Tone.Player(snareSound).toDestination(),
  kick: new Tone.Player(kickSound).toDestination(),
  tom1: new Tone.Player(tom1Sound).toDestination(),
  tom2: new Tone.Player(tom2Sound).toDestination(),
  floorTom: new Tone.Player(floorTomSound).toDestination(),
};

// Standard beginner drum kit layout
const drumZones = {
  crash: { x: 0.15, y: 0.2, radius: 0.08 },  // Top left
  ride: { x: 0.85, y: 0.2, radius: 0.08 },   // Top right
  hihat: { x: 0.25, y: 0.35, radius: 0.08 }, // Left
  tom1: { x: 0.5, y: 0.3, radius: 0.08 },    // Top middle
  tom2: { x: 0.7, y: 0.35, radius: 0.08 },   // Right middle
  snare: { x: 0.4, y: 0.5, radius: 0.08 },   // Center
  floorTom: { x: 0.8, y: 0.6, radius: 0.08 },// Bottom right
  kick: { x: 0.5, y: 0.7, radius: 0.1 }      // Bottom middle (larger radius for kick)
};

// Mock function to simulate fetching drum patterns from deepseek API
const fetchDrumPattern = async (songName) => {
  // Simulate an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Example pattern for demonstration
      resolve(['kick', 'snare', 'kick', 'snare', 'hihat', 'hihat']);
    }, 1000);
  });
};

const DrumKit = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [songPattern, setSongPattern] = useState([]);
  const [songName, setSongName] = useState('');

  const drumHoverStates = useRef({
    snare: false,
    hihat: false,
    kick: false,
    crash: false,
    ride: false,
    tom1: false,
    tom2: false,
    floorTom: false
  });

  const playDrumSound = async (drum) => {
    await Tone.start();

    switch (drum) {
      case 'snare':
        drumSamples.snare.start();
        break;
      case 'hihat':
        drumSamples.hihat.start();
        break;
      case 'kick':
        drumSamples.kick.start();
        break;
      case 'crash':
        drumSamples.crash.start();
        break;
      case 'ride':
        drumSamples.ride.start();
        break;
      case 'tom1':
        drumSamples.tom1.start();
        break;
      case 'tom2':
        drumSamples.tom2.start();
        break;
      case 'floorTom':
        drumSamples.floorTom.start();
        break;
    }
  };

  const handleDrumHit = (drum) => {
    if (drum === songPattern[currentStep]) {
      setCurrentStep((prevStep) => (prevStep + 1) % songPattern.length);
    }
  };

  const isInDrumZone = (x, y, zone) => {
    const flippedX = 1 - x;
    const distance = Math.sqrt(
      Math.pow(flippedX - zone.x, 2) + Math.pow(y - zone.y, 2)
    );
    return distance < zone.radius;
  };

  const updateDrumZones = (landmarks) => {
    const currentZoneStates = {};

    Object.entries(drumZones).forEach(([drum, zone]) => {
      currentZoneStates[drum] = false;

      landmarks.forEach(handLandmarks => {
        const indexTip = handLandmarks[8];
        if (isInDrumZone(indexTip.x, indexTip.y, zone)) {
          currentZoneStates[drum] = true;
        }
      });

      if (currentZoneStates[drum] && !drumHoverStates.current[drum]) {
        drumHoverStates.current[drum] = true;
        playDrumSound(drum);
        handleDrumHit(drum);
      } else if (!currentZoneStates[drum] && drumHoverStates.current[drum]) {
        drumHoverStates.current[drum] = false;
      }
    });
  };

  const handleSearch = async () => {
    const pattern = await fetchDrumPattern(songName);
    setSongPattern(pattern);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (isInitialized) return;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.image) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(results.image, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Draw drum zones
      Object.entries(drumZones).forEach(([drum, zone]) => {
        ctx.beginPath();
        ctx.arc(
          zone.x * canvas.width,
          zone.y * canvas.height,
          zone.radius * canvas.width,
          0,
          2 * Math.PI
        );
        ctx.strokeStyle = drumHoverStates.current[drum] ? '#00ff00' : '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = drumHoverStates.current[drum]
          ? 'rgba(0, 255, 0, 0.2)'
          : 'rgba(255, 255, 255, 0.2)';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          drum.toUpperCase(),
          zone.x * canvas.width,
          zone.y * canvas.height
        );

        // Highlight the current step in the song pattern
        if (drum === songPattern[currentStep]) {
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 5;
          ctx.stroke();
        }
      });

      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        Object.keys(drumHoverStates.current).forEach(drum => {
          drumHoverStates.current[drum] = false;
        });
      } else {
        updateDrumZones(results.multiHandLandmarks);
      }

      if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach((landmarks) => {
          for (const landmark of landmarks) {
            ctx.beginPath();
            ctx.arc(
              (1 - landmark.x) * canvas.width,
              landmark.y * canvas.height,
              5,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = '#00ff00';
            ctx.fill();
          }
        });
      }
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 854,
        height: 480
      });
      camera.start();
      setIsInitialized(true);
    }

    return () => {
      hands.close();
    };
  }, [isInitialized]);

  return (
    <div className="drum-kit">
      <div className="drum-kit-header">
        <h1>Virtual Drums</h1>
        <button className="back-button" onClick={() => window.location.reload()}>
          Back to Home
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
          placeholder="Enter song name"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="camera-container">
        <video ref={videoRef} className="input-video"></video>
        <canvas ref={canvasRef} className="output-canvas" width="854" height="480"></canvas>
      </div>

      <div className="instructions">
        <h2>How to Play</h2>
        <p>Move your index finger over the drum zones to play sounds. Each zone will light up green when activated!</p>
        <p>Follow the red highlighted drum to play the song pattern!</p>
      </div>
    </div>
  );
};

export default DrumKit;