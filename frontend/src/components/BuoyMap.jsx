import React, { useState } from 'react';
import { Battery, Compass, AlertCircle } from 'lucide-react';

export default function BuoyMap({ buoys, selectedBuoy, onSelectBuoy, telemetryData }) {
  const [hoveredBuoy, setHoveredBuoy] = useState(null);

  // Map latitude/longitude to SVG viewport (X: 0 to 400, Y: 0 to 200)
  // longitude: -180 to 180, latitude: -90 to 90
  const getXY = (lat, lng) => {
    // simple projection
    const x = ((lng + 180) / 360) * 400;
    const y = ((90 - lat) / 180) * 200;
    return { x, y };
  };

  // Get current readings for each buoy (most recent record)
  const buoyReadings = React.useMemo(() => {
    const readings = {};
    telemetryData.forEach(d => {
      if (!readings[d.buoyId] || new Date(d.timestamp) > new Date(readings[d.buoyId].timestamp)) {
        readings[d.buoyId] = d;
      }
    });
    return readings;
  }, [telemetryData]);

  // Assess buoy health status
  const getBuoyStatus = (buoyId) => {
    const data = buoyReadings[buoyId];
    if (!data) return 'offline';
    if (data.oxygenContent < 4.0) return 'danger';
    if (data.batteryLevel < 25 || data.temperature > 24.0) return 'warning';
    return 'active';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '100%' }}>
      {/* Interactive Map Canvas */}
      <div className="map-viewport">
        <svg viewBox="0 0 400 200" className="map-svg">
          {/* Latitude/Longitude Dotted Grid Lines */}
          <line x1="0" y1="50" x2="400" y2="50" className="map-grid-line" strokeDasharray="2,2" />
          <line x1="0" y1="100" x2="400" y2="100" className="map-grid-line" strokeDasharray="2,2" />
          <line x1="0" y1="150" x2="400" y2="150" className="map-grid-line" strokeDasharray="2,2" />
          
          <line x1="100" y1="0" x2="100" y2="200" className="map-grid-line" strokeDasharray="2,2" />
          <line x1="200" y1="0" x2="200" y2="200" className="map-grid-line" strokeDasharray="2,2" />
          <line x1="300" y1="0" x2="300" y2="200" className="map-grid-line" strokeDasharray="2,2" />

          {/* Grid Labels */}
          <text x="5" y="98" fill="var(--text-muted)" fontSize="6" opacity="0.6">Equator 0°</text>
          <text x="195" y="195" fill="var(--text-muted)" fontSize="6" opacity="0.6" textAnchor="middle">Prime Meridian 0°</text>

          {/* Simulated Landmass outlines */}
          <path d="M 20 20 Q 40 10, 50 30 T 80 40 T 110 20 L 120 80 Q 90 90, 70 80 T 30 70 Z" className="map-islands" opacity="0.3" />
          <path d="M 310 110 Q 340 100, 360 120 T 380 150 L 350 170 Q 320 160, 310 130 Z" className="map-islands" opacity="0.3" />
          <path d="M 220 30 Q 250 40, 270 20 T 290 50 L 260 80 Q 240 60, 220 50 Z" className="map-islands" opacity="0.3" />

          {/* Render Buoys */}
          {buoys.map(b => {
            const { x, y } = getXY(b.lat, b.lng);
            const status = getBuoyStatus(b.id);
            const isSelected = selectedBuoy === b.id;
            const currentTemp = buoyReadings[b.id]?.temperature || 'N/A';
            const currentO2 = buoyReadings[b.id]?.oxygenContent || 'N/A';

            let pulseColor = 'var(--color-primary)';
            if (status === 'warning') pulseColor = 'var(--color-warning)';
            if (status === 'danger') pulseColor = 'var(--color-danger)';

            return (
              <g 
                key={b.id} 
                className="buoy-node"
                onClick={() => onSelectBuoy(b.id)}
                onMouseEnter={() => setHoveredBuoy({ ...b, status, currentTemp, currentO2, x, y })}
                onMouseLeave={() => setHoveredBuoy(null)}
              >
                {/* Glowing Outer Beacon Ring */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r={isSelected ? 10 : 7} 
                  fill="none" 
                  stroke={pulseColor} 
                  strokeWidth="1.5" 
                  opacity={isSelected ? 0.9 : 0.6}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                >
                  <animate attributeName="r" values="3;12;3" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Inner Anchor Node */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="3.5" 
                  fill={pulseColor} 
                  stroke="white" 
                  strokeWidth="0.8" 
                />

                {/* Buoy Label */}
                <text 
                  x={x} 
                  y={y - 8} 
                  fill={isSelected ? 'white' : 'var(--text-secondary)'} 
                  fontSize="6" 
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {b.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip display */}
        {hoveredBuoy && (
          <div 
            className="buoy-tooltip"
            style={{ 
              left: `${Math.min(hoveredBuoy.x + 10, 210)}px`, 
              top: `${Math.min(hoveredBuoy.y + 10, 110)}px` 
            }}
          >
            <h4 style={{ color: 'white', marginBottom: '4px' }}>{hoveredBuoy.name}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: 'var(--text-secondary)', fontSize: '11px' }}>
              <span>ID: <strong style={{ color: 'white' }}>{hoveredBuoy.id}</strong></span>
              <span>Position: {hoveredBuoy.lat.toFixed(2)}°, {hoveredBuoy.lng.toFixed(2)}°</span>
              <span>Temp: <strong style={{ color: 'var(--color-warning)' }}>{hoveredBuoy.currentTemp}°C</strong></span>
              <span>O₂ Level: <strong style={{ color: 'var(--color-success)' }}>{hoveredBuoy.currentO2} mg/L</strong></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                Status: 
                <span style={{ 
                  color: hoveredBuoy.status === 'danger' ? 'var(--color-danger)' : 
                         hoveredBuoy.status === 'warning' ? 'var(--color-warning)' : 'var(--color-success)',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {hoveredBuoy.status}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mini Beacons List panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {buoys.map(b => {
          const status = getBuoyStatus(b.id);
          const currentReading = buoyReadings[b.id];
          const isSelected = selectedBuoy === b.id;

          return (
            <div 
              key={b.id} 
              className={`map-buoy-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectBuoy(isSelected ? 'ALL' : b.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`beacon-ring ${status === 'warning' ? 'warning' : status === 'danger' ? 'danger' : ''}`}></span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: isSelected ? 'white' : 'var(--text-primary)' }}>{b.name}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lat: {b.lat} Lng: {b.lng}</span>
                </div>
              </div>
              
              {currentReading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--text-secondary)' }}>
                    <Battery size={12} color={currentReading.batteryLevel < 30 ? 'var(--color-danger)' : 'var(--text-muted)'} />
                    {currentReading.batteryLevel}%
                  </span>
                  {status === 'danger' && <AlertCircle size={12} color="var(--color-danger)" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
