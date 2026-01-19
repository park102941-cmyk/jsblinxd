import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

/**
 * ScrollReveal component
 * Wraps children with scroll reveal animation
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.animation - Animation type: 'fade', 'left', 'right', 'scale'
 * @param {number} props.threshold - Visibility threshold (0-1)
 * @param {boolean} props.triggerOnce - Trigger animation only once
 * @param {number} props.delay - Animation delay in ms
 */
const ScrollReveal = ({ 
  children, 
  animation = 'fade',
  threshold = 0.1,
  triggerOnce = true,
  delay = 0,
  className = ''
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold, triggerOnce });

  const animationClass = {
    fade: 'scroll-reveal',
    left: 'scroll-reveal-left',
    right: 'scroll-reveal-right',
    scale: 'scroll-reveal-scale'
  }[animation] || 'scroll-reveal';

  return (
    <div
      ref={ref}
      className={`${animationClass} ${isVisible ? 'revealed' : ''} ${className}`}
      style={{
        transitionDelay: delay ? `${delay}ms` : undefined
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
