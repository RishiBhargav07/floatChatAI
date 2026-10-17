import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle, Radio, PhoneCall, Shield, MapPin,
  Users, Activity, CheckCircle2, Clock, Volume2,
  VolumeX, Eye, Flame, Droplets, HeartPulse, Send,
  Battery, Wifi, WifiOff, Siren, BellRing
} from 'lucide-react';
import { startEmergencySiren, stopEmergencySiren, isSirenRunning } from '../utils/audioSiren';

export default function EmergencySOSCenter({
  activeSOSList,
  onCreateSOS,
  onUpdateSOSStatus,
  isOfflineMode,
  selectedShelter
}) {
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [activeSOS, setActiveSOS] = useState(null);
  const [abortCountdown, setAbortCountdown] = useState(null);
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);

  // SOS Form State
  const [formData, setFormData] = useState({
    userName: 'Citizen Survivor',
    phone: '+91-98765-43210',
    emergencyType: 'RISING_WATER_FLOOD',
    adults: 2,
    children: 1,
    elderly: 1,
    disabled: 0,
    medicalNotes: 'Elderly diabetic with insulin requirement. Water rising rapidly on 1st floor.',
    lat: 13.042,
    lng: 80.231,
    elevationMeters: 6
  });

  const [simulatedDistance, setSimulatedDistance] = useState(950);
  const [simulatedEtaMins, setSimulatedEtaMins] = useState(6);

  // Load first active SOS if exists
  useEffect(() => {
    if (activeSOSList && activeSOSList.length > 0 && !activeSOS) {
      setActiveSOS(activeSOSList[0]);
    }
  }, [activeSOSList, activeSOS]);

  // Attempt real browser GPS capture
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            lat: parseFloat(pos.coords.latitude.toFixed(4)),
            lng: parseFloat(pos.coords.longitude.toFixed(4))
          }));
        },
        (err) => {
          console.warn('Geolocation fallback to disaster test coordinates:', err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Handle Abort Countdown timer
  useEffect(() => {
    let timer = null;
    if (abortCountdown !== null && abortCountdown > 0) {
      timer = setTimeout(() => {
        setAbortCountdown(prev => prev - 1);
      }, 1000);
    } else if (abortCountdown === 0) {
      // Abort window passed -> send SOS
      setAbortCountdown(null);
      executeSOSDispatch();
    }
    return () => clearTimeout(timer);
  }, [abortCountdown]);

  // Simulated live responder distance countdown
  useEffect(() => {
    let interval = null;
    if (activeSOS && (activeSOS.status === 'IN_TRANSIT' || activeSOS.status === 'DISPATCHED')) {
      interval = setInterval(() => {
        setSimulatedDistance(prev => {
          if (prev <= 50) {
            if (activeSOS.status !== 'ON_SCENE') {
              onUpdateSOSStatus && onUpdateSOSStatus(activeSOS.id, 'ON_SCENE');
            }
            return 20;
          }
          return Math.max(20, prev - 85);
        });
        setSimulatedEtaMins(prev => Math.max(1, Math.round(simulatedDistance / 150)));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [activeSOS, simulatedDistance, onUpdateSOSStatus]);

  const triggerSOSCountdown = () => {
    setAbortCountdown(3);
  };

  const cancelSOSCountdown = () => {
    setAbortCountdown(null);
  };

  const executeSOSDispatch = async () => {
    const payload = {
      userName: formData.userName,
      phone: formData.phone,
      emergencyType: formData.emergencyType,
      peopleCount: {
        adults: formData.adults,
        children: formData.children,
        elderly: formData.elderly,
        disabled: formData.disabled
      },
      medicalNotes: formData.medicalNotes,
      lat: formData.lat,
      lng: formData.lng,
      elevationMeters: formData.elevationMeters,
      networkOrigin: isOfflineMode ? 'OFFLINE_BLE_MESH' : 'ONLINE_CELLULAR'
    };

    if (onCreateSOS) {
      const created = await onCreateSOS(payload);
      if (created) {
        setActiveSOS(created);
        setIsSOSModalOpen(false);
        setSimulatedDistance(1200);
        setSimulatedEtaMins(7);
      }
    }
  };

  const toggleSiren = () => {
    if (isSirenOn) {
      stopEmergencySiren();
      setIsSirenOn(false);
    } else {
      startEmergencySiren();
      setIsSirenOn(true);
    }
  };

  const toggleStrobe = () => {
    setIsStrobeActive(!isStrobeActive);
  };

  const EMERGENCY_TYPES = [
    { id: 'RISING_WATER_FLOOD', label: 'Rising Flood / Submerged', icon: '🌊', color: 'var(--color-primary)' },
    { id: 'STRUCTURAL_COLLAPSE_TRAPPED', label: 'Trapped Under Debris', icon: '🏚️', color: 'var(--color-danger)' },
    { id: 'SEVERE_MEDICAL_TRAUMA', label: 'Severe Medical Trauma', icon: '🩸', color: 'var(--color-danger)' },
    { id: 'FIRE_CHEMICAL_HAZARD', label: 'Fire / Chemical Smoke', icon: '🔥', color: 'var(--color-warning)' },
    { id: 'LOST_STRANDED_NO_POWER', label: 'Stranded / Zero Power', icon: '🆘', color: 'var(--color-secondary)' }
  ];

  return (
    <div className="sos-center-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Night Search Rescue Strobe Overlay */}
      {isStrobeActive && (
        <div
          onClick={toggleStrobe}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            animation: 'rescueStrobe 0.4s infinite alternate'
          }}
        >
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#000', background: '#fff', padding: '16px 32px', borderRadius: '12px' }}>
            🚨 RESCUE STROBE ACTIVE - TAP TO CLOSE
          </h1>
          <p style={{ color: '#fff', fontSize: '18px', marginTop: '14px', background: 'rgba(0,0,0,0.8)', padding: '8px 16px', borderRadius: '6px' }}>
            Aim phone screen towards sky/rescuers to illuminate location in darkness
          </p>
        </div>
      )}

      {/* 1. Giant SOS Beacon Launcher Card */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(255, 71, 114, 0.15) 0%, rgba(12, 22, 48, 0.8) 100%)',
          border: '1px solid rgba(255, 71, 114, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="live-pulse-badge" style={{ background: 'rgba(255, 71, 114, 0.25)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
            <span className="pulse-dot" style={{ backgroundColor: 'var(--color-danger)' }}></span>
            CRITICAL LIFE-SAFETY CHANNEL
          </span>
          {isOfflineMode ? (
            <span style={{ fontSize: '12px', background: 'rgba(245, 166, 35, 0.2)', color: 'var(--color-warning)', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <WifiOff size={12} /> Mesh Peer Relay Mode
            </span>
          ) : (
            <span style={{ fontSize: '12px', background: 'rgba(5, 255, 176, 0.2)', color: 'var(--color-success)', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Wifi size={12} /> Direct First Responder Uplink
            </span>
          )}
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff' }}>
          National Emergency SOS & Rescue Dispatch
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '620px', marginTop: '6px', lineHeight: '1.6' }}>
          Broadcast your exact coordinates, number of people trapped, and vital medical conditions directly to NDRF, Coast Guard, and local volunteer SAR units.
        </p>

        {/* Big Pulsating SOS Trigger Button */}
        <div style={{ margin: '24px 0', position: 'relative' }}>
          {abortCountdown !== null ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '52px',
                  fontWeight: '900',
                  color: '#fff',
                  boxShadow: '0 0 45px rgba(255, 71, 114, 0.8)',
                  animation: 'pulse 0.8s infinite'
                }}
              >
                {abortCountdown}
              </div>
              <p style={{ color: 'var(--color-danger)', fontWeight: '700', fontSize: '14px' }}>
                DISPATCHING SOS TO RESCUE COMMAND...
              </p>
              <button
                className="btn-secondary"
                onClick={cancelSOSCountdown}
                style={{ borderColor: 'var(--color-warning)', color: 'var(--color-warning)', fontSize: '13px', padding: '8px 20px' }}
              >
                Cancel / False Alarm
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSOSModalOpen(true)}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #ff2a5f 0%, #a8002b 100%)',
                border: '4px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 0 35px rgba(255, 71, 114, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                color: '#fff'
              }}
              className="sos-button-glow"
            >
              <span style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '2px' }}>SOS</span>
              <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.9 }}>TAP TO TRIGGER</span>
            </button>
          )}
        </div>

        {/* Acoustic Alarm & Visual Strobe Quick Toggles */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={toggleSiren}
            style={{
              borderColor: isSirenOn ? 'var(--color-danger)' : 'var(--border-muted)',
              color: isSirenOn ? 'var(--color-danger)' : 'var(--text-secondary)'
            }}
          >
            {isSirenOn ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isSirenOn ? 'Stop Acoustic Siren' : 'Activate 920Hz Audio Siren'}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={toggleStrobe}
            style={{
              borderColor: isStrobeActive ? 'var(--color-warning)' : 'var(--border-muted)',
              color: isStrobeActive ? 'var(--color-warning)' : 'var(--text-secondary)'
            }}
          >
            <Eye size={16} />
            <span>Night Search Strobe Flasher</span>
          </button>
        </div>
      </div>

      {/* 2. Active Rescue Mission Tracker & First Responder Live Unit */}
      {activeSOS && (
        <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: activeSOS.triageScore === 'CRITICAL_P1' ? 'rgba(255, 71, 114, 0.25)' : 'rgba(245, 166, 35, 0.25)',
                  color: activeSOS.triageScore === 'CRITICAL_P1' ? 'var(--color-danger)' : 'var(--color-warning)'
                }}>
                  AI TRIAGE: {activeSOS.triageScore?.replace('_', ' ') || 'CRITICAL P1'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Incident ID: {activeSOS.id}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>
                Distress Signal: {activeSOS.userName} ({activeSOS.emergencyType?.replace(/_/g, ' ')})
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                📍 Coordinates: {activeSOS.lat}°N, {activeSOS.lng}°E | Elev: +{activeSOS.elevationMeters || 6}m MSL | Origin: {activeSOS.networkOrigin}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-primary)' }}>
                {simulatedDistance}m
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>
                Responder ETA: ~{simulatedEtaMins} mins
              </div>
            </div>
          </div>

          {/* Rescue Status Step Progression Bar */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>

              {/* Background Connecting Line */}
              <div style={{ position: 'absolute', top: '14px', left: '20px', right: '20px', height: '3px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />

              {['QUEUED', 'DISPATCHED', 'IN_TRANSIT', 'ON_SCENE', 'RESCUED'].map((stepStatus, idx) => {
                const statuses = ['QUEUED', 'DISPATCHED', 'IN_TRANSIT', 'ON_SCENE', 'RESCUED'];
                const currentIdx = statuses.indexOf(activeSOS.status);
                const isPassed = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div key={stepStatus} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '6px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: isPassed ? 'var(--color-primary)' : 'var(--bg-deep)',
                        border: isCurrent ? '2px solid #fff' : (isPassed ? '2px solid var(--color-primary)' : '2px solid rgba(255,255,255,0.2)'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isPassed ? '#000' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: '800'
                      }}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: isPassed ? '#fff' : 'var(--text-muted)' }}>
                      {stepStatus.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned First Responder Details Card */}
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-muted)', borderRadius: '10px', padding: '14px', marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(0, 136, 255, 0.2)', border: '1px solid #0088ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                🚤
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                  {activeSOS.assignedUnit?.name || 'NDRF Swift-Water Rescue Vessel Alpha-3'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Callsign: <strong style={{ color: 'var(--color-primary)' }}>{activeSOS.assignedUnit?.callsign || 'RESCUE-EAGLE-3'}</strong> | 4 Specialist Divers & Defibrillator Onboard
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => alert(`Radio frequency tuned to 156.800 MHz (VHF Channel 16). Contacting ${activeSOS.assignedUnit?.callsign || 'RESCUE-EAGLE-3'}...`)}
              >
                <Radio size={14} color="var(--color-primary)" />
                <span>Tactical Radio Ping</span>
              </button>

              <button
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--color-success)', borderColor: 'var(--color-success)', color: '#000' }}
                onClick={() => onUpdateSOSStatus && onUpdateSOSStatus(activeSOS.id, 'RESCUED')}
              >
                <CheckCircle2 size={14} />
                <span>Confirm Rescued & Safe</span>
              </button>
            </div>
          </div>

          {/* Medical & Triage Notes */}
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255, 71, 114, 0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 71, 114, 0.2)' }}>
            <strong style={{ color: 'var(--color-danger)' }}>Medical Protocol: </strong>
            {activeSOS.medicalNotes} | <strong>Trapped Persons: </strong>
            {activeSOS.peopleCount?.adults || 2} Adults, {activeSOS.peopleCount?.children || 0} Children, {activeSOS.peopleCount?.elderly || 0} Elderly
          </div>
        </div>
      )}

      {/* 3. SOS Trigger Intake Modal */}
      {isSOSModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              border: '2px solid var(--color-danger)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={22} color="var(--color-danger)" />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                  Emergency SOS Dispatch Details
                </h3>
              </div>
              <button
                onClick={() => setIsSOSModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Confirm your emergency situation to enable AI-powered emergency triage & responder prioritization.
            </p>

            {/* Emergency Type Selector */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>EMERGENCY CATEGORY</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginTop: '6px' }}>
                {EMERGENCY_TYPES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, emergencyType: t.id })}
                    style={{
                      background: formData.emergencyType === t.id ? 'rgba(255, 71, 114, 0.2)' : 'rgba(0,0,0,0.3)',
                      border: formData.emergencyType === t.id ? '1px solid var(--color-danger)' : '1px solid var(--border-muted)',
                      borderRadius: '8px',
                      padding: '10px 8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{t.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* People Count Grid */}
            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>PEOPLE INVOLVED</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '6px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Adults</span>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.adults}
                    onChange={e => setFormData({ ...formData, adults: parseInt(e.target.value) || 0 })}
                    style={{ marginTop: '2px', padding: '6px 8px' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Children</span>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.children}
                    onChange={e => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                    style={{ marginTop: '2px', padding: '6px 8px' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Elderly</span>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.elderly}
                    onChange={e => setFormData({ ...formData, elderly: parseInt(e.target.value) || 0 })}
                    style={{ marginTop: '2px', padding: '6px 8px' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Disabled</span>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.disabled}
                    onChange={e => setFormData({ ...formData, disabled: parseInt(e.target.value) || 0 })}
                    style={{ marginTop: '2px', padding: '6px 8px' }}
                  />
                </div>
              </div>
            </div>

            {/* Medical Details */}
            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>CRITICAL MEDICAL CONDITIONS / NOTES</label>
              <textarea
                className="input-field"
                rows="2"
                value={formData.medicalNotes}
                onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
                placeholder="E.g. Insulin needed, broken leg, trapped in attic room..."
                style={{ marginTop: '6px', fontSize: '12px', width: '100%', resize: 'none' }}
              />
            </div>

            {/* GPS & Network Dispatch Status */}
            <div style={{ marginTop: '12px', background: 'rgba(0, 242, 254, 0.08)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.2)', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div>📍 <strong>Auto-Captured Location:</strong> {formData.lat}°N, {formData.lng}°E (Accuracy ±4m)</div>
              <div style={{ marginTop: '2px' }}>
                📶 <strong>Transmission Channel:</strong> {isOfflineMode ? 'Decentralized BLE/Wi-Fi Direct Peer Mesh (Offline Store & Forward)' : 'Emergency Cellular / Satellite Direct Gateway'}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsSOSModalOpen(false)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={triggerSOSCountdown}
                style={{ flex: 2, justifyContent: 'center', background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              >
                <AlertTriangle size={16} />
                <span>Confirm & Dispatch SOS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Active Distress Incidents Stream */}
      <div className="glass-panel" style={{ padding: '18px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="var(--color-primary)" />
          Active Coastal Sector SOS Registry
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {activeSOSList && activeSOSList.map(sos => (
            <div
              key={sos.id}
              onClick={() => setActiveSOS(sos)}
              style={{
                background: activeSOS?.id === sos.id ? 'rgba(0, 242, 254, 0.1)' : 'rgba(0,0,0,0.2)',
                border: activeSOS?.id === sos.id ? '1px solid var(--color-primary)' : '1px solid var(--border-muted)',
                borderRadius: '8px',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: sos.triageScore === 'CRITICAL_P1' ? 'rgba(255, 71, 114, 0.3)' : 'rgba(245, 166, 35, 0.3)',
                    color: sos.triageScore === 'CRITICAL_P1' ? 'var(--color-danger)' : 'var(--color-warning)'
                  }}>
                    {sos.triageScore || 'P1'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                    {sos.userName}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ({sos.emergencyType?.replace(/_/g, ' ')})
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  📞 {sos.phone} | 👥 Total: {sos.peopleCount?.adults + (sos.peopleCount?.children || 0) + (sos.peopleCount?.elderly || 0)} Persons | Origin: {sos.networkOrigin}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: sos.status === 'RESCUED' ? 'rgba(5, 255, 176, 0.2)' : 'rgba(0, 242, 254, 0.2)',
                  color: sos.status === 'RESCUED' ? 'var(--color-success)' : 'var(--color-primary)'
                }}>
                  {sos.status}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(sos.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
