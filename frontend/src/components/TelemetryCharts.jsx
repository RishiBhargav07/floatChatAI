import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  ScatterChart, 
  Scatter,
  ZAxis
} from 'recharts';

export default function TelemetryCharts({ data, selectedBuoy }) {
  const [activeChart, setActiveChart] = useState('timeseries');

  // Format date helper
  const formatDate = (tickItem) => {
    try {
      const d = new Date(tickItem);
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:00`;
    } catch (err) {
      return tickItem;
    }
  };

  // Custom glass tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(5, 12, 30, 0.95)',
          border: '1px solid var(--color-primary)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          fontSize: '12px',
          lineHeight: '1.6'
        }}>
          <p style={{ fontWeight: '600', color: 'white', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
            {new Date(label).toLocaleString()}
          </p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ color: p.color || p.stroke }}>
              <span style={{ textTransform: 'capitalize' }}>{p.name}</span>: <strong>{p.value}</strong> {p.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Profile Custom Tooltip (Depth vs Pressure)
  const ProfileTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const buoyData = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(5, 12, 30, 0.95)',
          border: '1px solid var(--color-accent)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          fontSize: '12px',
          lineHeight: '1.6'
        }}>
          <p style={{ fontWeight: '600', color: 'white', marginBottom: '4px' }}>
            {buoyData.buoyName} ({buoyData.buoyId})
          </p>
          <p style={{ color: 'var(--color-primary)' }}>Depth: <strong>{buoyData.depth} m</strong></p>
          <p style={{ color: 'var(--color-accent)' }}>Hydrostatic Pressure: <strong>{buoyData.pressure} dbar</strong></p>
          <p style={{ color: 'var(--color-warning)' }}>Temperature: <strong>{buoyData.temperature} °C</strong></p>
          <p style={{ color: 'var(--color-success)' }}>Oxygen: <strong>{buoyData.oxygenContent} mg/L</strong></p>
        </div>
      );
    }
    return null;
  };

  // Limit data points to ~100 for line charts for rendering speed
  const processedData = React.useMemo(() => {
    if (data.length <= 100) return data;
    // Downsample data
    const step = Math.ceil(data.length / 100);
    return data.filter((_, idx) => idx % step === 0);
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Chart Toggles */}
      <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Analysis Mode:</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`btn-secondary ${activeChart === 'timeseries' ? 'btn-primary' : ''}`}
            style={{ padding: '6px 14px', fontSize: '12px' }}
            onClick={() => setActiveChart('timeseries')}
          >
            Temporal Trends
          </button>
          <button 
            className={`btn-secondary ${activeChart === 'oxygen-ph' ? 'btn-primary' : ''}`}
            style={{ padding: '6px 14px', fontSize: '12px' }}
            onClick={() => setActiveChart('oxygen-ph')}
          >
            Biogeochemical (O₂ / pH)
          </button>
          <button 
            className={`btn-secondary ${activeChart === 'hydrostatic' ? 'btn-primary' : ''}`}
            style={{ padding: '6px 14px', fontSize: '12px' }}
            onClick={() => setActiveChart('hydrostatic')}
          >
            Hydrostatic Profile
          </button>
        </div>
      </div>

      {/* Visual Chart Viewports */}
      <div className="glass-panel chart-container">
        
        {activeChart === 'timeseries' && (
          <>
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Water Temperature & Salinity</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Correlating thermal dynamics with salinity patterns</p>
              </div>
            </div>
            
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <LineChart data={processedData}>
                  <defs>
                    <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatDate} 
                    stroke="var(--text-muted)" 
                    fontSize={10}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="var(--color-warning)" 
                    label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', style: { fill: 'var(--color-warning)', fontSize: 11, fontWeight: 500 } }}
                    fontSize={11}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#b388ff" 
                    label={{ value: 'Salinity (PSU)', angle: 90, position: 'insideRight', style: { fill: '#b388ff', fontSize: 11, fontWeight: 500 } }}
                    fontSize={11}
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="temperature" 
                    name="water temperature" 
                    stroke="var(--color-warning)" 
                    strokeWidth={2.5} 
                    unit="°C"
                    dot={false}
                    activeDot={{ r: 6, stroke: 'white', strokeWidth: 1 }}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="salinity" 
                    name="ocean salinity" 
                    stroke="#b388ff" 
                    strokeWidth={2} 
                    unit=" PSU"
                    dot={false}
                    activeDot={{ r: 6, stroke: 'white', strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeChart === 'oxygen-ph' && (
          <>
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Dissolved Oxygen & Acidity levels</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Monitoring oxygen content (mg/L) and pH fluctuations</p>
              </div>
            </div>
            
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatDate} 
                    stroke="var(--text-muted)" 
                    fontSize={10}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="var(--color-success)" 
                    label={{ value: 'Oxygen (mg/L)', angle: -90, position: 'insideLeft', style: { fill: 'var(--color-success)', fontSize: 11, fontWeight: 500 } }}
                    fontSize={11}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="var(--color-primary)" 
                    label={{ value: 'pH (acidity)', angle: 90, position: 'insideRight', style: { fill: 'var(--color-primary)', fontSize: 11, fontWeight: 500 } }}
                    fontSize={11}
                    domain={[7.0, 9.0]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="oxygenContent" 
                    name="dissolved oxygen" 
                    stroke="var(--color-success)" 
                    strokeWidth={2.5} 
                    unit=" mg/L"
                    dot={false}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="ph" 
                    name="pH level" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeChart === 'hydrostatic' && (
          <>
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Hydrostatic Profiling (Pressure vs Depth)</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Demonstrating linear relationship between depth and pressure (Reversed Y-Axis)</p>
              </div>
            </div>
            
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    type="number" 
                    dataKey="pressure" 
                    name="Pressure" 
                    unit=" dbar" 
                    stroke="var(--text-muted)" 
                    fontSize={11}
                    label={{ value: 'Pressure (dbar)', position: 'bottom', offset: 0, fill: 'var(--text-secondary)', fontSize: 12 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="depth" 
                    name="Depth" 
                    unit="m" 
                    reversed={true} // Reverse depth so surface (0) is at the top
                    stroke="var(--text-muted)" 
                    fontSize={11}
                    label={{ value: 'Depth (meters)', angle: -90, position: 'insideLeft', offset: 5, fill: 'var(--text-secondary)', fontSize: 12 }}
                  />
                  <ZAxis type="number" range={[40, 100]} />
                  <Tooltip content={<ProfileTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter 
                    name="buoy telemetry" 
                    data={data} 
                    fill="var(--color-accent)"
                    lineJointType="monotoneX"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
