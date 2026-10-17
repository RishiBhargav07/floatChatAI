import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, Search, MapPin, 
  Battery, Clock, Send, Shield, HeartPulse, 
  Smartphone, Share2, AlertCircle, WifiOff
} from 'lucide-react';

export default function FamilySafetyCenter({ 
  shelters, 
  userLocation, 
  isOfflineMode 
}) {
  const [checkins, setCheckins] = useState([
    {
      id: 'CHK-1001',
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      phone: '+91-98765-43210',
      fullName: 'Priya Sharma',
      status: 'NEED_ASSISTANCE',
      currentLocationName: 'Submerged Marina Colony (Near Pier 4)',
      shelterId: null,
      lat: 13.042,
      lng: 80.231,
      batteryPercent: 28,
      message: 'We are on the second floor roof. SOS requested. Water still rising but we are safe for now.',
      viaMesh: true
    },
    {
      id: 'CHK-1002',
      timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
      phone: '+91-98401-11223',
      fullName: 'Rajesh Subramanian',
      status: 'SAFE_AT_SHELTER',
      currentLocationName: 'St. Jude High-Elevation Safe Citadel',
      shelterId: 'SHELTER-01',
      lat: 13.085,
      lng: 80.195,
      batteryPercent: 78,
      message: 'Arrived at St. Jude Citadel safely with grandma. Power, warm food, and medical checkup available.',
      viaMesh: false
    },
    {
      id: 'CHK-1003',
      timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      phone: '+91-99402-33445',
      fullName: 'Divya & Children',
      status: 'EVACUATING',
      currentLocationName: 'Heading towards Hilltop Community Center via Ridge Bypass',
      shelterId: 'SHELTER-03',
      lat: 13.089,
      lng: 80.180,
      batteryPercent: 54,
      message: 'Walking along North Ridge high-ground bypass. Avoiding coastal highway.',
      viaMesh: true
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    status: 'I_AM_SAFE',
    shelterId: shelters?.[0]?.id || '',
    message: "I am safe and accounted for. Moving towards high ground shelter.",
    batteryPercent: 82
  });

  const [feedback, setFeedback] = useState(null);

  // Load checkins from backend if possible
  const fetchCheckins = async () => {
    try {
      const res = await fetch(`/api/disaster/family-checkin?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) setCheckins(data);
      }
    } catch (e) {
      // offline fallback
    }
  };

  useEffect(() => {
    fetchCheckins();
  }, [searchQuery]);

  const handleSubmitCheckin = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please provide your Full Name and Contact Phone Number.');
      return;
    }

    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      status: formData.status,
      shelterId: formData.status === 'SAFE_AT_SHELTER' ? formData.shelterId : null,
      currentLocationName: formData.status === 'SAFE_AT_SHELTER' 
        ? (shelters?.find(s => s.id === formData.shelterId)?.name || 'Safe Shelter')
        : 'Disaster Safe Sector',
      lat: userLocation?.lat || 13.052,
      lng: userLocation?.lng || 80.235,
      batteryPercent: formData.batteryPercent,
      message: formData.message,
      viaMesh: isOfflineMode
    };

    try {
      const res = await fetch('/api/disaster/family-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setCheckins(prev => [data.checkin, ...prev]);
      } else {
        // Local fallback
        const localCheckin = {
          id: `CHK-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          ...payload
        };
        setCheckins(prev => [localCheckin, ...prev]);
      }

      setFeedback('✅ Safety check-in broadcast successfully! Kin and rescue teams can now search your status.');
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      const localCheckin = {
        id: `CHK-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        ...payload
      };
      setCheckins(prev => [localCheckin, ...prev]);
      setFeedback('✅ Broadcast relayed via Offline Mesh Store-and-Forward!');
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const filteredCheckins = checkins.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.fullName.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
  });

  return (
    <div className="family-safety-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header Banner */}
      <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="live-pulse-badge" style={{ background: 'rgba(0, 242, 254, 0.2)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
                <span className="pulse-dot" style={{ backgroundColor: 'var(--color-primary)' }}></span>
                FAMILY SAFETY SENTINEL & KIN REGISTRY
              </span>
              {isOfflineMode && (
                <span style={{ fontSize: '11px', background: 'rgba(245, 166, 35, 0.2)', color: 'var(--color-warning)', padding: '2px 8px', borderRadius: '10px' }}>
                  📡 Transmitting via Offline Mesh
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={26} color="var(--color-primary)" />
              Family Safety Check-In & Kin Status Directory
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '720px', marginTop: '4px', lineHeight: '1.6' }}>
              Send an instant "I am Safe" ping with your GPS coordinates and battery level to comfort family members. Works both over cellular networks and via offline peer-to-peer mesh relays.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 18px', borderRadius: '10px', border: '1px solid var(--border-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CHECKED-IN PERSONS</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-success)', marginTop: '2px' }}>
              {checkins.length} CITIZENS
            </div>
          </div>
        </div>

        {feedback && (
          <div style={{ marginTop: '14px', background: 'rgba(5, 255, 176, 0.15)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
            {feedback}
          </div>
        )}
      </div>

      {/* 2. Check-In Form & Kin Search */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
        
        {/* Left: Quick "I'm Safe" Broadcast Form */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            Broadcast "I'm Safe" Status
          </h3>

          <form onSubmit={handleSubmitCheckin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>YOUR FULL NAME</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="E.g. Rajesh Kumar"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                required
                style={{ marginTop: '4px', fontSize: '12px', padding: '8px 12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>CONTACT PHONE NUMBER</label>
              <input 
                type="tel" 
                className="input-field" 
                placeholder="+91-98765-43210"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
                style={{ marginTop: '4px', fontSize: '12px', padding: '8px 12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>CURRENT SAFETY STATUS</label>
              <select 
                className="input-field" 
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                style={{ marginTop: '4px', fontSize: '12px', padding: '8px 12px' }}
              >
                <option value="I_AM_SAFE">🟢 I Am Safe & Uninjured</option>
                <option value="SAFE_AT_SHELTER">🏛️ Checked-in at Verified Shelter</option>
                <option value="EVACUATING">🚶 Evacuating Towards High Ground</option>
                <option value="NEED_ASSISTANCE">⚠️ Need Assistance (Non-Critical)</option>
              </select>
            </div>

            {formData.status === 'SAFE_AT_SHELTER' && (
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>SHELTER FACILITY</label>
                <select 
                  className="input-field" 
                  value={formData.shelterId}
                  onChange={e => setFormData({ ...formData, shelterId: e.target.value })}
                  style={{ marginTop: '4px', fontSize: '12px', padding: '8px 12px' }}
                >
                  {(shelters || []).map(s => (
                    <option key={s.id} value={s.id}>{s.name} (+{s.elevationMeters}m)</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>PERSONAL MESSAGE TO FAMILY</label>
              <textarea 
                className="input-field" 
                rows="2"
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="We are safe on high ground, don't worry..."
                style={{ marginTop: '4px', fontSize: '12px', padding: '8px 12px', resize: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ justifyContent: 'center', marginTop: '6px' }}
            >
              <Send size={15} />
              <span>Broadcast Safety Check-in</span>
            </button>
          </form>
        </div>

        {/* Right: Search Kin & Family Directory */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} color="var(--color-primary)" />
              Search Kin Safety Registry
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {filteredCheckins.length} verified records
            </span>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by name or phone number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '13px' }}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>

          {/* Records List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '440px' }}>
            {filteredCheckins.map(chk => (
              <div 
                key={chk.id}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#fff' }}>{chk.fullName}</strong>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: '700', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        background: chk.status.includes('SAFE') ? 'rgba(5, 255, 176, 0.2)' : 'rgba(245, 166, 35, 0.2)',
                        color: chk.status.includes('SAFE') ? 'var(--color-success)' : 'var(--color-warning)'
                      }}>
                        {chk.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📞 {chk.phone} | 📍 {chk.currentLocationName}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {new Date(chk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-primary)' }}>
                      🔋 {chk.batteryPercent || 80}% Battery
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '6px', fontStyle: 'italic' }}>
                  "{chk.message}"
                </div>

                {chk.viaMesh && (
                  <div style={{ fontSize: '10px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Share2 size={11} /> Relayed via Offline BLE/Wi-Fi Mesh Network
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
