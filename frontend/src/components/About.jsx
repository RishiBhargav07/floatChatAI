import React from 'react';
import { Shield, Cpu, Database, Network, Anchor } from 'lucide-react';

export default function About() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Title */}
      <div>
        <h2 className="glow-text gradient-text" style={{ fontSize: '24px', fontWeight: '800' }}>Project Architecture</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          FloatChat AI represents a state-of-the-art telemetry aggregation and AI-driven oceanographic warning system.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* Conceptual Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
              <Cpu size={24} color="var(--color-primary)" />
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '6px', fontSize: '15px' }}>Telemetry Beacons (Floaters)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                Simulating floating deep-sea sensors anchored across global coordinate coordinates. Every 12 hours, they measure ocean temperature, salinity (PSU), acidity (pH), battery health, depth (m), and hydrostatic pressure (dbar).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
              <Database size={24} color="var(--color-success)" />
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '6px', fontSize: '15px' }}>MERN Stack Pipeline</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                Powered by a Vite-React UI frontend and a Node.js + Express API backend. Connected to a MongoDB document store via Mongoose, with a local file-based database fallback (`db.json`) ensuring immediate run times out-of-the-box.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
              <Network size={24} color="#b388ff" />
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '6px', fontSize: '15px' }}>Gemini AI Analysis</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                Calls the Google Gemini API to analyze current telemetry packets. By dynamically parsing stats summaries and anomalies, the chatbot advises on hypoxia warnings, thermal currents, and ocean stratification.
              </p>
            </div>
          </div>

        </div>

        {/* System parameters table */}
        <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '25px' }}>
          <h3 className="chart-title" style={{ marginBottom: '15px' }}>Sensor Specifications & Alert Thresholds</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px' }}>Parameter</th>
                  <th style={{ padding: '10px' }}>Typical Range</th>
                  <th style={{ padding: '10px' }}>Unit</th>
                  <th style={{ padding: '10px' }}>Alert Threshold</th>
                  <th style={{ padding: '10px' }}>Impact / Meaning</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-primary)' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px', fontWeight: '600' }}>Temperature</td>
                  <td style={{ padding: '10px' }}>-2.0 to 30.0</td>
                  <td style={{ padding: '10px' }}>°C (Celsius)</td>
                  <td style={{ padding: '10px', color: 'var(--color-warning)' }}>&gt; 24.0°C (at depths &gt; 50m)</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Indicates warm thermocline/El Niño currents.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px', fontWeight: '600' }}>Salinity</td>
                  <td style={{ padding: '10px' }}>32.0 to 38.0</td>
                  <td style={{ padding: '10px' }}>PSU</td>
                  <td style={{ padding: '10px', color: 'var(--color-warning)' }}>&lt; 32.5 or &gt; 36.5</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Flags glacier melts (low) or high evaporation zones.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px', fontWeight: '600' }}>Dissolved Oxygen</td>
                  <td style={{ padding: '10px' }}>2.0 to 12.0</td>
                  <td style={{ padding: '10px' }}>mg/L</td>
                  <td style={{ padding: '10px', color: 'var(--color-danger)' }}>&lt; 4.0 mg/L</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Hypoxic waters, dangerous to fish and benthic organisms.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px', fontWeight: '600' }}>Acidity (pH)</td>
                  <td style={{ padding: '10px' }}>7.5 to 8.5</td>
                  <td style={{ padding: '10px' }}>pH scale</td>
                  <td style={{ padding: '10px', color: 'var(--color-warning)' }}>&lt; 7.8 (Acidification)</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Detects absorption of atmospheric carbon dioxide.</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: '600' }}>Hydrostatic Pressure</td>
                  <td style={{ padding: '10px' }}>10.0 to 3000.0</td>
                  <td style={{ padding: '10px' }}>dbar</td>
                  <td style={{ padding: '10px' }}>N/A</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Directly proportional to buoy sensor depth (1m ≈ 1dbar).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
