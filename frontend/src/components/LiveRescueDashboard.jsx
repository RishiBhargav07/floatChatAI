import React, { useState } from 'react';
import { 
  ShieldAlert, Activity, Users, Radio, Truck, 
  CheckCircle2, Clock, MapPin, ChevronRight, AlertTriangle, 
  HeartPulse, PhoneCall, RefreshCw, Send, ArrowUpRight
} from 'lucide-react';

export default function LiveRescueDashboard({ 
  disasterScenario, 
  activeSOSList, 
  shelters, 
  onUpdateSOSStatus 
}) {
  const [responderFleet, setResponderFleet] = useState([
    {
      id: 'SAR-BOAT-03',
      name: 'NDRF Swift-Water Rescue Vessel Alpha',
      callsign: 'RESCUE-EAGLE-3',
      type: 'RAPID_SURFACE_VESSEL',
      status: 'MISSION_ACTIVE',
      crewCount: 4,
      equipment: '4x Paramedic Divers, Defibrillator, Inflatable Extraction Rafts',
      lat: 13.048,
      lng: 80.226,
      currentAssignment: 'SOS-2026-9011 (Marina Colony)'
    },
    {
      id: 'SAR-MEDIC-01',
      name: 'Urban Search & Extrication Squad Delta',
      callsign: 'LIFE-SAVER-1',
      type: 'ALL_TERRAIN_AMBULANCE',
      status: 'MISSION_ACTIVE',
      crewCount: 6,
      equipment: 'Hydraulic Jaws of Life, Trauma Surgical Suite, Oxygen Tanks',
      lat: 13.082,
      lng: 80.205,
      currentAssignment: 'SOS-2026-9012 (Collapsed Masonry)'
    },
    {
      id: 'SAR-HELO-02',
      name: 'Coast Guard Air Rescue Pelican-2',
      callsign: 'PELICAN-2',
      type: 'SAR_HEAVY_HELICOPTER',
      status: 'STANDBY_PATROL',
      crewCount: 5,
      equipment: 'Night FLIR Infrared Sensor, Heavy Hoist Winch, 12 Stretcher Capacity',
      lat: 13.095,
      lng: 80.185,
      currentAssignment: 'AERIAL_SURVEILLANCE'
    },
    {
      id: 'SAR-DRONE-01',
      name: 'Tactical Thermal Recon Drone Swarm Alpha',
      callsign: 'SKY-RECON-1',
      type: 'AUTONOMOUS_UAV_MESH',
      status: 'RELAY_AIRBORNE',
      crewCount: 1,
      equipment: 'Thermal Heat Signature Locator, 4K Optical, BLE Mesh Transponder',
      lat: 13.064,
      lng: 80.222,
      currentAssignment: 'MESH_P2P_PACKET_RELAY'
    }
  ]);

  const [auditEvents, setAuditEvents] = useState([
    { id: 'EVT-01', time: '14:42:10', type: 'TSUNAMI_SURGE', text: 'INCOIS bottom pressure surge anomaly (+145 dbar) confirmed on Buoy FC-ATL-02.' },
    { id: 'EVT-02', time: '14:44:25', type: 'SOS_DISPATCH', text: 'Critical SOS-2026-9011 triaged. Assigned NDRF Vessel Alpha (RESCUE-EAGLE-3).' },
    { id: 'EVT-03', time: '14:46:00', type: 'MESH_SYNC', text: 'Offline BLE Mesh packet PKT-9921 relayed across 3 hops & signed by Starlink Gateway.' },
    { id: 'EVT-04', time: '14:47:15', type: 'CONVOY_DISPATCH', text: 'AI Convoy CONVOY-8120 carrying 4,000L Water & 1,200 MREs en route to Shelter 2.' }
  ]);

  return (
    <div className="live-rescue-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Command Center Header */}
      <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--color-danger)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="live-pulse-badge" style={{ background: 'rgba(255, 71, 114, 0.25)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
                <span className="pulse-dot" style={{ backgroundColor: 'var(--color-danger)' }}></span>
                FIRST RESPONDER DISPATCH CONSOLE
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Integrated NDRF, Coast Guard & Community SAR Command
              </span>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={26} color="var(--color-danger)" />
              Live Emergency Operations & Rescue Command
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '750px', marginTop: '4px', lineHeight: '1.6' }}>
              Real-time situational intelligence dashboard for rescue coordinators. Monitor AI triage prioritization, first responder fleet deployments, shelter intake limits, and emergency audit feeds.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CURRENT DISASTER</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-danger)', marginTop: '2px' }}>
              {disasterScenario?.name || 'Coastal Surge Warning'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-primary)' }}>
              Severity: {disasterScenario?.severity || 'CRITICAL'}
            </div>
          </div>
        </div>

        {/* Command KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginTop: '18px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PENDING SOS DISTRESS</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-danger)', marginTop: '4px' }}>
              {(activeSOSList || []).filter(s => s.status !== 'RESCUED').length} ACTIVE
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Awaiting or In-Transit</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RESCUED CITIZENS</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-success)', marginTop: '4px' }}>
              {(activeSOSList || []).filter(s => s.status === 'RESCUED').length + 8} EVACUATED
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Secured at Safe Citadels</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DEPLOYED SAR UNITS</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-primary)', marginTop: '4px' }}>
              4 VEHICLES/BOATS
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Active in Hazard Zone</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SHELTERS AT CRITICAL</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-warning)', marginTop: '4px' }}>
              {(shelters || []).filter(s => s.currentOccupancy / s.totalCapacity > 0.85).length} CITADELS
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>&gt;85% Bed Capacity</div>
          </div>
        </div>
      </div>

      {/* 2. Triage Priority Queue & Rescue Operations Table */}
      <div className="glass-panel" style={{ padding: '20px', borderTop: '3px solid var(--color-danger)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--color-danger)" />
              Emergency SOS Triage Priority Queue
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Automated multi-factor triage priority scoring (P1: Life-Threat / Trapped / Infants, P2: Urgent, P3: Guidance).
            </p>
          </div>
        </div>

        {/* Triage Queue Table */}
        <div style={{ marginTop: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>PRIORITY</th>
                <th style={{ padding: '10px 12px' }}>CITIZEN / CONTACT</th>
                <th style={{ padding: '10px 12px' }}>EMERGENCY TYPE</th>
                <th style={{ padding: '10px 12px' }}>HEADCOUNT</th>
                <th style={{ padding: '10px 12px' }}>ASSIGNED UNIT</th>
                <th style={{ padding: '10px 12px' }}>STATUS</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>QUICK ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {(activeSOSList || []).map(sos => (
                <tr key={sos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: '800', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      background: sos.triageScore === 'CRITICAL_P1' ? 'rgba(255, 71, 114, 0.25)' : 'rgba(245, 166, 35, 0.25)',
                      color: sos.triageScore === 'CRITICAL_P1' ? 'var(--color-danger)' : 'var(--color-warning)'
                    }}>
                      {sos.triageScore || 'P1'}
                    </span>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <strong style={{ color: '#fff' }}>{sos.userName}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sos.phone}</div>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <div style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                      {sos.emergencyType?.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sos.medicalNotes}
                    </div>
                  </td>

                  <td style={{ padding: '12px' }}>
                    👥 {sos.peopleCount?.adults + (sos.peopleCount?.children || 0) + (sos.peopleCount?.elderly || 0)} Total
                    {sos.peopleCount?.children > 0 && <span style={{ color: 'var(--color-warning)', fontSize: '10px', display: 'block' }}>({sos.peopleCount.children} Children)</span>}
                  </td>

                  <td style={{ padding: '12px' }}>
                    {sos.assignedUnit ? (
                      <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>
                        🚤 {sos.assignedUnit.name}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Pending Unit</span>
                    )}
                  </td>

                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: sos.status === 'RESCUED' ? 'rgba(5, 255, 176, 0.2)' : 'rgba(0, 242, 254, 0.2)',
                      color: sos.status === 'RESCUED' ? 'var(--color-success)' : 'var(--color-primary)'
                    }}>
                      {sos.status}
                    </span>
                  </td>

                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {sos.status !== 'RESCUED' ? (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => onUpdateSOSStatus && onUpdateSOSStatus(sos.id, 'IN_TRANSIT', responderFleet[0])}
                        >
                          Dispatch Unit
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--color-success)', borderColor: 'var(--color-success)', color: '#000' }}
                          onClick={() => onUpdateSOSStatus && onUpdateSOSStatus(sos.id, 'RESCUED')}
                        >
                          Mark Rescued
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-success)', fontSize: '11px', fontWeight: '700' }}>
                        ✓ Safe
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. First Responder Fleets & Live Incident Audit Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        
        {/* Left: Responder Fleet Card Grid */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={16} color="var(--color-primary)" />
            Deployed First Responder Units ({responderFleet.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {responderFleet.map(unit => (
              <div 
                key={unit.id}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#fff' }}>{unit.name}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '700' }}>
                      ({unit.callsign})
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    🛡️ {unit.equipment}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Current Mission: <strong>{unit.currentAssignment}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: '800', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    background: unit.status === 'MISSION_ACTIVE' ? 'rgba(5, 255, 176, 0.2)' : 'rgba(0, 242, 254, 0.2)',
                    color: unit.status === 'MISSION_ACTIVE' ? 'var(--color-success)' : 'var(--color-primary)'
                  }}>
                    {unit.status.replace(/_/g, ' ')}
                  </span>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    👥 {unit.crewCount} Specialists Onboard
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Disaster Chronological Audit Feed */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--color-warning)" />
            Real-Time Crisis Event Audit Stream
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {auditEvents.map(evt => (
              <div 
                key={evt.id}
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  borderLeft: '3px solid var(--color-primary)',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '11px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px' }}>
                  <span>{evt.type}</span>
                  <span>{evt.time}</span>
                </div>
                <div style={{ color: 'var(--text-primary)', marginTop: '2px', lineHeight: '1.4' }}>
                  {evt.text}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
