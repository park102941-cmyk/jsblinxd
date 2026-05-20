import React from 'react';

const LiftStyleIllustration = ({ type }) => {
    // Shared SVG elements
    const windowBg = "#f5f5f5";
    const shadeDark = "#8a8a8a";
    const shadeLight = "#b0b0b0";
    const highlightColor = "#eb6a00"; // Orange color from the screenshot

    // The zebra shade pattern
    const ZebraShade = () => (
        <g>
            <rect x="15" y="15" width="70" height="8" fill={shadeDark} />
            <rect x="15" y="23" width="70" height="10" fill={shadeLight} />
            <rect x="15" y="33" width="70" height="8" fill={shadeDark} />
            <rect x="15" y="41" width="70" height="10" fill={shadeLight} />
            <rect x="15" y="51" width="70" height="8" fill={shadeDark} />
            <rect x="15" y="59" width="70" height="8" fill={shadeLight} />
            <rect x="14" y="11" width="72" height="4" fill="#666" rx="1" /> {/* Top Cassette */}
        </g>
    );

    return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: windowBg }}>
            {/* Window Grid Lines */}
            <rect x="10" y="67" width="80" height="33" fill="#ffffff" />
            <rect x="33" y="67" width="2" height="33" fill={windowBg} />
            <rect x="65" y="67" width="2" height="33" fill={windowBg} />
            <rect x="10" y="67" width="80" height="4" fill="#e0e0e0" />

            <ZebraShade />

            {/* Bottom Rail */}
            <rect x="14" y="65" width="72" height="3" fill={type === 'standard' ? highlightColor : "#555"} rx="1" />

            {/* Lift Specific Details */}
            {type === 'standard' && (
                <g>
                    {/* Beaded Chain */}
                    <line x1="18" y1="15" x2="18" y2="75" stroke={highlightColor} strokeWidth="1" strokeDasharray="1,2" />
                    <line x1="21" y1="15" x2="21" y2="75" stroke={highlightColor} strokeWidth="1" strokeDasharray="1,2" />
                    {/* Tensioner / Connector */}
                    <rect x="17.5" y="75" width="4" height="6" fill={highlightColor} rx="1" />
                    <circle cx="19.5" cy="79" r="1" fill="#fff" />
                </g>
            )}

            {type === 'cordless' && (
                <g>
                    {/* Center Handle */}
                    <path d="M 43 65 L 57 65 C 57 65 55 69 50 69 C 45 69 43 65 43 65 Z" fill={highlightColor} />
                </g>
            )}

            {type === 'motorized' && (
                <g>
                    {/* Remote Control */}
                    <rect x="42" y="60" width="16" height="30" fill={highlightColor} rx="4" stroke="#333" strokeWidth="1.5" />
                    {/* Remote Signal Arc */}
                    <path d="M 46 56 A 6 6 0 0 1 54 56" fill="none" stroke="#333" strokeWidth="1" />
                    <path d="M 48 58 A 3 3 0 0 1 52 58" fill="none" stroke="#333" strokeWidth="1" />
                    {/* Remote Buttons */}
                    <circle cx="50" cy="66" r="1.5" fill="#333" />
                    <circle cx="50" cy="72" r="1.5" fill="#333" />
                    <circle cx="50" cy="78" r="1.5" fill="#333" />
                    <circle cx="50" cy="84" r="1.5" fill="#333" />
                </g>
            )}
        </svg>
    );
};

export default LiftStyleIllustration;
