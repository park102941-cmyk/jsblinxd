import React from 'react';

/**
 * LoadingSpinner component
 * @param {Object} props
 * @param {string} props.size - Size of spinner: 'small', 'medium', 'large'
 * @param {string} props.color - Color of spinner (CSS color value)
 * @param {boolean} props.fullScreen - Whether to show as full screen overlay
 * @param {string} props.text - Optional loading text
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'var(--primary-green)', 
  fullScreen = false,
  text = ''
}) => {
  const sizeClass = {
    small: 'spinner-small',
    medium: '',
    large: 'spinner-large'
  }[size];

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div 
        className={`spinner ${sizeClass}`}
        style={{ borderTopColor: color }}
      />
      {text && (
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem',
          margin: 0 
        }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
