import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, Wifi, WifiOff, 
  Volume2, VolumeX, Radio, Compass, Users, 
  Building2, Activity, Bell, ChevronDown
} from 'lucide-react';
import { startEmergencySiren, stopEmergencySiren, isSirenRunning } from '../utils/audioSiren';

export default function DisasterTopBar({ 
  disasterScenario, 
  allScenarios, 
  onSwitchScenario, 
  isOfflineMode, 
  onToggleOfflineMode, 
  onOpenSOS, 
  activeTab, 
  setActiveTab 
}) {
  const [isSirenActive, setIsSirenActive] = useState(false);

  const toggleSiren = () => {
    if (isSirenActive) {
      stopEmergencySiren();
      setIsSirenActive(false);
    } else {
      startEmergencySiren();
      setIsSirenActive(true);
    }
  };

  return (
    <header className="disaster-top-bar glass-panel" style={{
      margin: '0 0 16px 0',
      padding: '12px 18px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      border: '1px solid rgba(0, 242, 254, 0.2)',
      background: 'rgba(7, 14, 32, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: '0px',
      zIndex: 100
    }}>
      
      {/* Left: Active Disaster Alert Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="pulse-dot" style={{ backgroundColor: 'var(--color-danger)' }}></span>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-danger)', letterSpacing: '0.5px' }}>
            CRISIS SENTINEL
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select 
            className="input-field" 
            value={allScenarios?.find(s => s.name === disasterScenario?.name)?.key || 'tsunami'}
            onChange={(e) => onSwitchScenario && onSwitchScenario(e.target.value)}
            style={{ 
              fontSize: '11px', 
              padding: '4px 10px', 
              background: 'rgba(255, 71, 114, 0.15)', 
              borderColor: 'rgba(255, 71, 114, 0.4)', 
              color: '#fff',
              fontWeight: '700'
            }}
          >
            <option value="tsunami">🌊 Tsunami Warning (8.4M Subduction)</option>
            <option value="cyclone">🌀 Supercyclone Vardah II (195 km/h)</option>
            <option value="flood">🌧️ Monsoonal Flash Flood (+2.1m)</option>
            <option value="earthquake">🌋 7.6M Subduction Earthquake</option>
            <option value="normal">✅ All Clear - Routine Monitoring</option>
          </select>
        </div>
      </div>

      {/* Center: Primary Disaster Navigation Quick Tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('disaster-alerts')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            border: activeTab === 'disaster-alerts' ? '1px solid var(--color-primary)' : '1px solid transparent',
            background: activeTab === 'disaster-alerts' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
            color: activeTab === 'disaster-alerts' ? 'var(--color-primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Compass size={14} />
          <span>Alerts & Safe Nav</span>
        </button>

        <button
          onClick={() => setActiveTab('emergency-sos')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            border: activeTab === 'emergency-sos' ? '1px solid var(--color-danger)' : '1px solid transparent',
            background: activeTab === 'emergency-sos' ? 'rgba(255, 71, 114, 0.25)' : 'transparent',
            color: activeTab === 'emergency-sos' ? 'var(--color-danger)' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <AlertTriangle size={14} />
          <span>SOS & Tracking</span>
        </button>

        <button
          onClick={() => setActiveTab('shelter-resources')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            border: activeTab === 'shelter-resources' ? '1px solid var(--color-success)' : '1px solid transparent',
            background: activeTab === 'shelter-resources' ? 'rgba(5, 255, 176, 0.2)' : 'transparent',
            color: activeTab === 'shelter-resources' ? 'var(--color-success)' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Building2 size={14} />
          <span>Shelters & Resources</span>
        </button>

        <button
          onClick={() => setActiveTab('offline-mesh')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            border: activeTab === 'offline-mesh' ? '1px solid var(--color-warning)' : '1px solid transparent',
            background: activeTab === 'offline-mesh' ? 'rgba(245, 166, 35, 0.2)' : 'transparent',
            color: activeTab === 'offline-mesh' ? 'var(--color-warning)' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Radio size={14} />
          <span>Offline Mesh</span>
        </button>

        <button
          onClick={() => setActiveTab('family-safety')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            border: activeTab === 'family-safety' ? '1px solid var(--color-primary)' : '1px solid transparent',
            background: activeTab === 'family-safety' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
            color: activeTab === 'family-safety' ? 'var(--color-primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Users size={14} />
          <span>Family Check-in</span>
        </button>

        <button
          onClick={() => setActiveTab('rescue-command')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            border: activeTab === 'rescue-command' ? '1px solid var(--color-danger)' : '1px solid transparent',
            background: activeTab === 'rescue-command' ? 'rgba(255, 71, 114, 0.2)' : 'transparent',
            color: activeTab === 'rescue-command' ? '#ff7fa1' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Activity size={14} />
          <span>Live Command</span>
        </button>
      </div>

      {/* Right: Offline Switch, Acoustic Alarm & PROMINENT SOS BUTTON */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* Offline Toggle Pill */}
        <button
          onClick={onToggleOfflineMode}
          title={isOfflineMode ? 'Running in Decentralized BLE/Wi-Fi Mesh Mode' : 'Connected to Cellular & Cloud'}
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            borderRadius: '20px',
            background: isOfflineMode ? 'rgba(245, 166, 35, 0.2)' : 'rgba(5, 255, 176, 0.15)',
            border: isOfflineMode ? '1px solid var(--color-warning)' : '1px solid var(--color-success)',
            color: isOfflineMode ? 'var(--color-warning)' : 'var(--color-success)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {isOfflineMode ? <WifiOff size={13} /> : <Wifi size={13} />}
          <span>{isOfflineMode ? 'Mesh Mode (Offline)' : 'Online Cloud'}</span>
        </button>

        {/* Siren Sound Toggle */}
        <button
          onClick={toggleSiren}
          title="Toggle 920Hz Acoustic Alarm Siren"
          style={{
            padding: '6px 10px',
            background: isSirenActive ? 'var(--color-danger)' : 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-muted)',
            borderRadius: '6px',
            color: isSirenActive ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          {isSirenActive ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* PROMINENT EMERGENCY SOS BUTTON */}
        <button
          onClick={() => {
            setActiveTab('emergency-sos');
            onOpenSOS && onOpenSOS();
          }}
          style={{
            background: 'linear-gradient(135deg, #ff2a5f 0%, #d60037 100%)',
            color: '#fff',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 0 16px rgba(255, 71, 114, 0.65)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: '900',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            animation: 'pulse-beacon 1.8s infinite'
          }}
        >
          <AlertTriangle size={15} />
          <span>EMERGENCY SOS</span>
        </button>
      </div>

    </header>
  );
}
