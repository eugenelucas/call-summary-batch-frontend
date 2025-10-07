import { Bold } from 'lucide-react';
import React, { useRef, useState } from 'react';

const AnomalyChart = ({ agent }: { agent: { total_calls: number; total_anomalies: number; detected_audiofiles?: string[] } }) => {
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const percentage = agent.total_anomalies / agent.total_calls;
  const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
  
  // State for tooltip visibility and position
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Handle mouse enter to show tooltip
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  // Handle mouse move to update tooltip position
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      // Calculate position relative to SVG's top-left corner
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setTooltipPosition({ x, y });
    }
  };

  // Handle mouse leave to hide tooltip
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Calculate the end point of the red arc
  const angle = percentage * 360 - 90; // Adjust for rotation (-90 degrees)
  const radian = (angle * Math.PI) / 180;
  const arcEndX = 190 + radius * Math.cos(radian); // Center (190, 190) + radius * cos(angle)
  const arcEndY = 190 + radius * Math.sin(radian); // Center (190, 190) + radius * sin(angle)

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width="380"
        height="380"
        onMouseEnter={handleMouseEnter}
        // onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="5" stdDeviation="10" floodColor="rgba(145, 15, 15, 0.27)" />
          </filter>
        </defs>
        <circle
          cx="190"
          cy="190"
          r={radius}
          fill="none"
          stroke="#EAEDF1"
          strokeWidth="20"
        />
        <circle
          cx="190"
          cy="190"
          r={radius}
          fill="none"
          stroke="#D43100"
          strokeWidth="20"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={circumference / 2}
          transform="rotate(-90 190 190)"
          strokeLinecap="round"
          filter="url(#dropShadow)" 
        />
        <text x="50%" y="50%" textAnchor="middle" dy="0.3em" fill="#007bff" fontSize="50" fontWeight="bold">
          {agent.total_anomalies}
        </text>
        <text x="50%" y="60%" textAnchor="middle" dy="0.3em" fill="#757575" fontSize="14">
          Total Anomalies
        </text>
      </svg>
      {showTooltip && agent.detected_audiofiles && agent.detected_audiofiles.length > 0 && (
        <div
          className="absolute bg-black rounded-md shadow-lg p-3 z-10"
           onMouseEnter={handleMouseEnter}
        // onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            top: arcEndY - -20, // Position above the arc's end point
            left: arcEndX - 300, // Center horizontally relative to arc's end point
            // maxHeight: '400px',
            // overflowY: 'auto',
          }}
        >
          {/* Triangle pointer */}
          <div
            className="absolute w-0 h-0  text-white bg-black"
            style={{
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
            }}
          />
          <h4 className="text-sm font-bold mb-2 text-white">Detected Audio Files</h4>
          <ul className="list-none m-0 p-0 text-white">
            {agent.detected_audiofiles.map((file, index) => (
              <li key={index} className="text-sm text-gray-700 mb-1 text-white">{file}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnomalyChart;