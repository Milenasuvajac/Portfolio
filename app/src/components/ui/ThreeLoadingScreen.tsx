'use client';

import React, { useState, useEffect } from 'react';

interface ThreeLoadingScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

const ThreeLoadingScreen: React.FC<ThreeLoadingScreenProps> = ({ 
  onComplete, 
  minDisplayTime = 2000 
}) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing 3D environment...');

  const loadingSteps = [
    'Initializing 3D environment...',
    'Loading room model...',
    'Setting up lighting...',
    'Preparing textures...',
    'Finalizing scene...'
  ];

  useEffect(() => {
    const startTime = Date.now();
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15 + 5, 100);
        
        // Update loading text based on progress
        const stepIndex = Math.floor((newProgress / 100) * loadingSteps.length);
        if (stepIndex !== currentStep && stepIndex < loadingSteps.length) {
          currentStep = stepIndex;
          setLoadingText(loadingSteps[stepIndex]);
        }

        // Complete when progress reaches 100% and minimum time has passed
        if (newProgress >= 100) {
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime >= minDisplayTime) {
            clearInterval(progressInterval);
            setTimeout(onComplete, 300); // Small delay for smooth transition
          }
        }

        return newProgress;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [onComplete, minDisplayTime]);

  return (
    <div className="three-loading-screen">
      <div className="three-loading-grid" />

      <div className="three-loading-content">
          <img
              src="/icons/favicon/ms.png"
              alt="MS Logo"
              width={32}
              height={32}
          />

        {/* Title */}
        <h2 className="three-loading-title">
          Loading...
        </h2>

        {/* Subtitle */}
        <p className="three-loading-subtitle">
            Preparing interactive portfolio...
        </p>

        {/* Progress Bar */}
        <div className="three-loading-progress">
          <div 
            className="three-loading-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="three-loading-text">
          {loadingText}
        </p>

        {/* Animated Dots */}
        <div className="three-loading-dots">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="three-loading-dot"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreeLoadingScreen;