import React, { useState, useMemo } from 'react';
import TelemetryCharts from './TelemetryCharts';
import BuoyMap from './BuoyMap';
import { Thermometer, Droplets, Waves, Compass, Activity, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function Dashboard({ telemetryData, selectedBuoy, setSelectedBuoy }) {
  
  // Get unique buoys list
  const buoysList = useMemo(() => {
    const list = [];
    const ids = new Set();
    telemetryData.forEach(item => {
      if (!ids.has(item.buoyId)) {
        ids.add(item.buoyId);
        list.push({ id: item.buoyId, name: item.buoyName, lat: item.latitude, lng: item.longitude });
      }
    });
    return list;
  }, [telemetryData]);

  // Filter data by selected buoy
  const filteredData = useMemo(() => {
    if (selectedBuoy === 'ALL') {
      return telemetryData;
    }
    return telemetryData.filter(d => d.buoyId === selectedBuoy);
  }, [telemetryData, selectedBuoy]);

  // Compute metrics
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { temp: 0, salinity: 0, oxygen: 0, pressure: 0, ph: 0, depth: 0 };
    
    let tempSum = 0;
    let salinitySum = 0;
    let oxygenSum = 0;
    let pressureSum = 0;
    let phSum = 0;
    let depthSum = 0;

    filteredData.forEach(d => {
      tempSum += d.temperature;
      salinitySum += d.salinity;
      oxygenSum += d.oxygenContent;
      pressureSum += d.pressure;
      phSum += d.ph;
      depthSum += d.depth;
    });

    const len = filteredData.length;
    return {
      temp: (tempSum / len).toFixed(2),
      salinity: (salinitySum / len).toFixed(2),
      oxygen: (oxygenSum / len).toFixed(2),
      pressure: (pressureSum / len).toFixed(2),
      ph: (phSum / len).toFixed(2),
      depth: (depthSum / len).toFixed(0)
    };
  }, [filteredData]);

  // Generate Alerts
  const alerts = useMemo(() => {
    const list = [];
    // Only check the most recent telemetry readings per buoy to avoid flooding history alerts
    const recentReadings = {};
    telemetryData.forEach(d => {
      if (!recentReadings[d.buoyId] || new Date(d.timestamp) > new Date(recentReadings[d.buoyId].timestamp)) {
        recentReadings[d.buoyId] = d;
      }
    });

    Object.values(recentReadings).forEach(d => {
      if (d.oxygenContent < 4.0) {
        list.push({
          id: `o2-${d.buoyId}`,
          buoyId: d.buoyId,
          buoyName: d.buoyName,
          type: 'danger',
          message: `Hypoxia Warning: Dissolved oxygen critically low (${d.oxygenContent} mg/L) at depth ${d.depth}m.`,
          timestamp: d.timestamp
        });
      }
      if (d.temperature > 24.0 && d.depth > 50) {
        list.push({
          id: `temp-${d.buoyId}`,
          buoyId: d.buoyId,
          buoyName: d.buoyName,
          type: 'warning',
          message: `Thermal Anomaly: Shallow temperature unexpectedly warm (${d.temperature}°C).`,
          timestamp: d.timestamp
        });
      }
      if (d.batteryLevel < 25) {
        list.push({
          id: `bat-${d.buoyId}`,
          buoyId: d.buoyId,
          buoyName: d.buoyName,
          type: 'warning',
          message: `Battery Low: Sensor reporting ${d.batteryLevel}% remaining battery charge.`,
          timestamp: d.timestamp
        });
      }
      if (d.ph < 7.8 || d.ph > 8.5) {
        list.push({
          id: `ph-${d.buoyId}`,
          buoyId: d.buoyId,
          buoyName: d.buoyName,
          type: 'warning',
          message: `pH Shift: Acidification warning. System reading abnormal pH: ${d.ph}.`,
          timestamp: d.timestamp
        });
      }
    });

    return list;
  }, [telemetryData]);

  const activeBuoyDetails = useMemo(() => {
    if (selectedBuoy === 'ALL') return null;
    return buoysList.find(b => b.id === selectedBuoy);
  }, [buoysList, selectedBuoy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Top Banner Selection */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 className="glow-text gradient-text" style={{ fontSize: '28px', fontWeight: '800' }}>Oceanic Telemetry Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {selectedBuoy === 'ALL' 
              ? 'Aggregated readouts for all active deep-sea monitoring stations.' 
              : `Real-time monitoring: ${activeBuoyDetails?.name || selectedBuoy} [${selectedBuoy}]`
            }
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Monitoring Station:</span>
          <select 
            className="input-field" 
            value={selectedBuoy} 
            onChange={(e) => setSelectedBuoy(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            <option value="ALL">All Buoys (Aggregated)</option>
            {buoysList.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        {/* Temperature */}
        <div className="glass-panel metric-card temp">
          <div className="metric-header">
            <span>Water Temp</span>
            <Thermometer size={18} color="var(--color-warning)" />
          </div>
          <div className="metric-value">
            {stats.temp}<span className="metric-unit"> °C</span>
          </div>
          <div className="metric-trend">
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
              Avg temperature reading
            </span>
          </div>
        </div>

        {/* Oxygen Content */}
        <div className="glass-panel metric-card oxygen">
          <div className="metric-header">
            <span>Dissolved Oxygen</span>
            <Waves size={18} color="var(--color-success)" />
          </div>
          <div className="metric-value">
            {stats.oxygen}<span className="metric-unit"> mg/L</span>
          </div>
          <div className="metric-trend">
            {parseFloat(stats.oxygen) < 5.0 ? (
              <span className="trend-down" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                <AlertTriangle size={12} /> hypoxic risk
              </span>
            ) : (
              <span className="trend-up" style={{ fontSize: '11px' }}>Stable oxygenation</span>
            )}
          </div>
        </div>

        {/* Salinity */}
        <div className="glass-panel metric-card salinity">
          <div className="metric-header">
            <span>Salinity</span>
            <Droplets size={18} color="#b388ff" />
          </div>
          <div className="metric-value">
            {stats.salinity}<span className="metric-unit"> PSU</span>
          </div>
          <div className="metric-trend">
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
              Practical Salinity Unit
            </span>
          </div>
        </div>

        {/* Depth & Pressure */}
        <div className="glass-panel metric-card pressure">
          <div className="metric-header">
            <span>Mean Depth & Pressure</span>
            <Compass size={18} color="var(--color-accent)" />
          </div>
          <div className="metric-value" style={{ fontSize: '22px' }}>
            {stats.depth}<span className="metric-unit">m</span>
            <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>|</span>
            {parseFloat(stats.pressure).toFixed(0)}<span className="metric-unit"> dbar</span>
          </div>
          <div className="metric-trend">
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
              Avg pH: <strong style={{ color: 'white' }}>{stats.ph}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Map Main Section */}
      <div className="dashboard-grid">
        {/* Left Side: Graphs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <TelemetryCharts data={filteredData} selectedBuoy={selectedBuoy} />
        </div>

        {/* Right Side: Map & Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* Buoy Locator Map */}
          <div className="glass-panel map-panel">
            <h3 className="chart-title" style={{ marginBottom: '15px' }}>Beacon Network Map</h3>
            <BuoyMap 
              buoys={buoysList} 
              selectedBuoy={selectedBuoy} 
              onSelectBuoy={setSelectedBuoy} 
              telemetryData={telemetryData}
            />
          </div>

          {/* Alerts panel */}
          <div className="glass-panel alerts-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--color-danger)" />
              <h3 className="chart-title">Anomalies & Alerts</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
              {alerts.length === 0 ? (
                <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  🟢 All stations reporting optimal parameters.
                </div>
              ) : (
                alerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`alert-item ${alert.type}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedBuoy(alert.buoyId)}
                  >
                    <AlertTriangle className="alert-icon" size={16} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <strong style={{ color: 'white', fontSize: '12px' }}>{alert.buoyName} ({alert.buoyId})</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{alert.message}</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                        {new Date(alert.timestamp).toLocaleTimeString()} - {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
