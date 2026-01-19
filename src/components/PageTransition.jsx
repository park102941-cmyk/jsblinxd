import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition component for smooth page transitions
 * Wraps page content with fade-in animation
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'fadeOut') {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
        window.scrollTo(0, 0); // Scroll to top on page change
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, location]);

  return (
    <div
      className={`page-transition ${transitionStage === 'fadeIn' ? 'animate-fade-in-up' : ''}`}
      style={{
        opacity: transitionStage === 'fadeOut' ? 0 : 1,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
