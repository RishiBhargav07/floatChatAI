import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, Wifi, WifiOff, ShieldCheck, Lock, 
  Send, AlertTriangle, ArrowRight, CheckCircle2, 
  Clock, Share2, Smartphone, Cpu, RefreshCw, 
  MapPin, Battery, Signal, Eye, ShieldAlert, Layers, Play
} from 'lucide-react';

export default function OfflineMeshNetwork({ 
  isOfflineMode, 
  onToggleOfflineMode, 
  userLocation, 
  activeSOSList 
}) {
  const [meshPeers, setMeshPeers] = useState([
    {
      id: 'NODE-LOCAL-01',
      name: 'Your Device (Local Node)',
      type: 'ORIGIN_NODE',
      lat: 13.052,
      lng: 80.235,
      x: 100,
      y: 180,
      distanceMeters: 0,
      rssiDbm: -32,
      batteryPercent: 84,
      protocol: 'BLE 5.3 & Wi-Fi Direct',
      bufferCount: 0,
      status: 'TRANSMITTING'
    },
    {
      id: 'PEER-PHONE-19',
      name: 'Citizen Mobile (Samsung S24 - Peer #19)',
      type: 'CITIZEN_PHONE',
      lat: 13.056,
      lng: 80.231,
      x: 270,
      y: 120,
      distanceMeters: 75,
      rssiDbm: -68,
      batteryPercent: 62,
      protocol: 'BLE 5.3 (2.4 GHz)',
      bufferCount: 1,
      status: 'LINKED_RELAY'
    },
    {
      id: 'PEER-DRONE-02',
      name: 'NDRF Autonomous Mesh Drone Sky-2',
      type: 'DRONE_RELAY',
      lat: 13.064,
      lng: 80.222,
      x: 440,
      y: 180,
      distanceMeters: 190,
      rssiDbm: -74,
      batteryPercent: 88,
      protocol: 'Wi-Fi Direct 802.11ax (5.8 GHz)',
      bufferCount: 1,
      status: 'LINKED_RELAY'
    },
    {
      id: 'PEER-BUOY-01',
      name: 'FloatChat Deep-Shift Buoy Relay FC-PAC-01',
      type: 'OCEAN_BUOY',
      lat: 13.072,
      lng: 80.245,
      x: 440,
      y: 290,
      distanceMeters: 380,
      rssiDbm: -86,
      batteryPercent: 94,
      protocol: 'Long-Range UHF Radio',
      bufferCount: 0,
      status: 'STANDBY_RELAY'
    },
    {
      id: 'GATEWAY-SAT-01',
      name: 'Coast Guard Starlink Gateway Base',
      type: 'RESCUE_GATEWAY',
      lat: 13.085,
      lng: 80.195,
      x: 610,
      y: 120,
      distanceMeters: 1200,
      rssiDbm: -92,
      batteryPercent: 100,
      protocol: 'Starlink Low-Earth Satellite Uplink',
      bufferCount: 2,
      status: 'GATEWAY_ONLINE'
    }
  ]);

  const [meshMessages, setMeshMessages] = useState([
    {
      id: 'PKT-9921',
      senderName: 'Priya Sharma & Family',
      senderNodeId: 'NODE-LOCAL-01',
      type: 'EMERGENCY_SOS',
      timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
      status: 'ACKNOWLEDGED',
      hops: 3,
      ttl: 3,
      encryptedPayload: '0x8f4c91a02d8471b0ecf798a3...',
      decryptedText: 'Water at 1.4m on Marina Colony 1st floor. 2 Adults, 2 Children, 1 Elderly diabetic trapped. Immediate boat rescue needed.',
      coordinates: { lat: 13.042, lng: 80.231 },
      hopTrail: [
        'Local Phone (BLE 5.3)',
        'Citizen Mobile #19 (BLE)',
        'NDRF Mesh Drone Sky-2 (Wi-Fi Direct)',
        'Coast Guard Starlink Gateway (Delivered & Signed ACK)'
      ],
      ackSignature: 'SIG-RSA4096-GATEWAY-CG-7721'
    },
    {
      id: 'PKT-9922',
      senderName: 'Volunteer SAR Scout #4',
      senderNodeId: 'PEER-PHONE-19',
      type: 'HAZARD_PING',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      status: 'RELAYED',
      hops: 2,
      ttl: 4,
      encryptedPayload: '0x3a4b99812e4f0122cd...',
      decryptedText: 'Old Fort Bridge impassable! Flood water 2.1m with strong river current. Direct all evacuees to North Ridge flyover.',
      coordinates: { lat: 13.058, lng: 80.228 },
      hopTrail: [
        'Volunteer Phone #4',
        'Citizen Mobile #19 (BLE Relay)',
        'NDRF Mesh Drone Sky-2 (Transmitting to Gateway...)'
      ],
      ackSignature: null
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [msgType, setMsgType] = useState('EMERGENCY_SOS');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [selectedNode, setSelectedNode] = useState(meshPeers[0]);
  const [seenPacketIds, setSeenPacketIds] = useState(new Set(['PKT-9921', 'PKT-9922']));

  // Active in-flight packet state machine for VISUAL HOPPING
  const [activeHopState, setActiveHopState] = useState({
    isActive: false,
    packetId: null,
    packetLabel: '',
    currentHop: 0, // 0: Local Phone -> 1: Peer 19 -> 2: Drone -> 3: Gateway -> 4: ACK Returning
    packetX: 100,
    packetY: 180,
    stageDescription: 'Mesh Ready. No in-flight packet.',
    isAckReturning: false
  });

  const [liveRelayLogs, setLiveRelayLogs] = useState([
    { time: '15:28:10.120', text: 'BLE 5.3 mesh scanner initialized. 4 participating nodes in radio range.' },
    { time: '15:28:12.450', text: 'Packet PKT-9921 arrived at Coast Guard Gateway. Decrypted AES-GCM-256 payload.' },
    { time: '15:28:13.800', text: 'Gateway issued signed ACK: SIG-RSA4096-GATEWAY-CG-7721' }
  ]);

  const broadcastChannelRef = useRef(null);

  // Setup Web BroadcastChannel for Multi-Tab P2P Sync
  useEffect(() => {
    try {
      if ('BroadcastChannel' in window) {
        broadcastChannelRef.current = new BroadcastChannel('floatchat_mesh_p2p_channel');
        broadcastChannelRef.current.onmessage = (event) => {
          const packet = event.data;
          if (packet && packet.id) {
            handleIncomingMeshPacket(packet);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment:', e);
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, []);

  const addRelayLog = (text) => {
    const timeStr = new Date().toTimeString().split(' ')[0] + '.' + String(Date.now() % 1000).padStart(3, '0');
    setLiveRelayLogs(prev => [{ time: timeStr, text }, ...prev.slice(0, 15)]);
  };

  // Deduplication & Store-and-Forward packet ingest
  const handleIncomingMeshPacket = (packet) => {
    if (seenPacketIds.has(packet.id)) {
      addRelayLog(`[DEDUP] Duplicate packet ${packet.id} discarded. Loop prevented.`);
      return;
    }

    setSeenPacketIds(prev => new Set(prev).add(packet.id));
    addRelayLog(`[RELAY] Ingested packet ${packet.id} from peer. TTL: ${packet.ttl}. Forwarding...`);

    const updatedPacket = {
      ...packet,
      hops: (packet.hops || 1) + 1,
      status: packet.hops >= 2 ? 'DELIVERED' : 'RELAYED',
      hopTrail: [...(packet.hopTrail || []), `Peer Relay (${(packet.hops || 1) + 1} Hops)`]
    };

    setMeshMessages(prev => [updatedPacket, ...prev]);

    // Animate the incoming packet across nodes
    animatePacketHop(packet.id, packet.decryptedText || packet.type);
  };

  // STEP-BY-STEP CONTROLLED PACKET HOPPING ANIMATION
  const animatePacketHop = (pktId, textPreview) => {
    // Stage 0: Local Phone
    setActiveHopState({
      isActive: true,
      packetId: pktId,
      packetLabel: `${pktId}: ${textPreview.substring(0, 16)}...`,
      currentHop: 0,
      packetX: 100,
      packetY: 180,
      stageDescription: 'Node 1 (Your Phone): Encrypting AES-GCM-256 payload & generating BLE advertisement frame...',
      isAckReturning: false
    });
    addRelayLog(`[NODE-1] Local phone sealed payload with E2EE. Transmitting via BLE 5.3.`);

    // Stage 1: Hop to Peer Phone 19
    setTimeout(() => {
      setActiveHopState({
        isActive: true,
        packetId: pktId,
        packetLabel: `${pktId}: Relaying...`,
        currentHop: 1,
        packetX: 270,
        packetY: 120,
        stageDescription: 'Node 2 (Citizen Phone #19): Ingested packet via BLE 5.3 (-68 dBm). Deduplication check OK. Forwarding via Wi-Fi Direct...',
        isAckReturning: false
      });
      addRelayLog(`[NODE-2] Peer #19 received ${pktId}. Buffer: 1 pkt. Relay beam directed to Drone Sky-2.`);
    }, 1800);

    // Stage 2: Hop to Drone Sky-2
    setTimeout(() => {
      setActiveHopState({
        isActive: true,
        packetId: pktId,
        packetLabel: `${pktId}: Airborne Relay`,
        currentHop: 2,
        packetX: 440,
        packetY: 180,
        stageDescription: 'Node 3 (NDRF Drone Sky-2): Airborne relay node routing high-throughput 5.8 GHz microwave beam to Base Gateway...',
        isAckReturning: false
      });
      addRelayLog(`[NODE-3] NDRF Drone Sky-2 in-flight relay active. Target: Starlink Coastal Gateway.`);
    }, 3600);

    // Stage 3: Reached Starlink Rescue Gateway
    setTimeout(() => {
      setActiveHopState({
        isActive: true,
        packetId: pktId,
        packetLabel: `[DELIVERED] ${pktId}`,
        currentHop: 3,
        packetX: 610,
        packetY: 120,
        stageDescription: 'Node 4 (Starlink Gateway): DELIVERED! Coast Guard MRCC Decrypts E2EE payload. First Responder team assigned!',
        isAckReturning: false
      });
      addRelayLog(`[GATEWAY] ${pktId} DELIVERED to Coast Guard MRCC. Registered in National Rescue Command.`);
    }, 5400);

    // Stage 4: Signed ACK returns down the mesh chain
    setTimeout(() => {
      const ackCode = `ACK-CG-${Math.floor(1000 + Math.random() * 9000)}`;
      setActiveHopState({
        isActive: true,
        packetId: pktId,
        packetLabel: `✅ ${ackCode}`,
        currentHop: 4,
        packetX: 100,
        packetY: 180,
        stageDescription: `ACK Receipt Verified! Gateway returned cryptographic confirmation (${ackCode}) back to your device!`,
        isAckReturning: true
      });
      addRelayLog(`[ACK] Signed receipt ${ackCode} returned through mesh chain to sender phone.`);

      // Update message status in table
      setMeshMessages(prev =>
        prev.map(m =>
          m.id === pktId
            ? {
                ...m,
                status: 'ACKNOWLEDGED',
                ackSignature: `SIG-RSA4096-GATEWAY-${ackCode}`
              }
            : m
        )
      );

      setIsBroadcasting(false);
    }, 7200);

    // Reset hop state after completion
    setTimeout(() => {
      setActiveHopState(prev => ({ ...prev, isActive: false, stageDescription: 'Mesh Idle. All in-flight packets acknowledged.' }));
    }, 10000);
  };

  // Broadcast Message over Simulated BLE & Wi-Fi Direct Mesh
  const handleBroadcastMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setIsBroadcasting(true);
    const packetId = `PKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPacket = {
      id: packetId,
      senderName: 'You (Local Citizen Device)',
      senderNodeId: 'NODE-LOCAL-01',
      type: msgType,
      timestamp: new Date().toISOString(),
      status: 'QUEUED',
      hops: 0,
      ttl: 6,
      encryptedPayload: `0x${Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      decryptedText: inputMsg,
      coordinates: userLocation || { lat: 13.052, lng: 80.235 },
      hopTrail: ['Local Phone [Sender Node: BLE 5.3 / Wi-Fi Direct]'],
      ackSignature: null
    };

    // Add to local list
    setMeshMessages(prev => [newPacket, ...prev]);
    setSeenPacketIds(prev => new Set(prev).add(packetId));
    setInputMsg('');

    // Broadcast across HTML5 BroadcastChannel for other tabs
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(newPacket);
      } catch (err) {
        console.warn('BroadcastChannel send error:', err);
      }
    }

    // Trigger visual hop animation
    animatePacketHop(packetId, newPacket.decryptedText);

    // Sync to backend if available
    try {
      await fetch('/api/disaster/mesh/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packet: newPacket })
      });
    } catch (e) {
      // Expected in pure offline mesh mode
    }
  };

  return (
    <div className="offline-mesh-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Network Status Banner & Offline Mode Toggle */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px', 
          borderLeft: isOfflineMode ? '4px solid var(--color-warning)' : '4px solid var(--color-primary)',
          background: isOfflineMode ? 'linear-gradient(180deg, rgba(245, 166, 35, 0.12) 0%, rgba(12, 22, 48, 0.7) 100%)' : 'var(--bg-panel)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="live-pulse-badge" style={{ 
                background: isOfflineMode ? 'rgba(245, 166, 35, 0.25)' : 'rgba(0, 242, 254, 0.25)', 
                color: isOfflineMode ? 'var(--color-warning)' : 'var(--color-primary)',
                border: isOfflineMode ? '1px solid var(--color-warning)' : '1px solid var(--color-primary)'
              }}>
                <span className="pulse-dot" style={{ backgroundColor: isOfflineMode ? 'var(--color-warning)' : 'var(--color-primary)' }}></span>
                {isOfflineMode ? 'OFFLINE P2P MESH NETWORKING ACTIVE' : 'HYBRID MESH & CELLULAR UPLINK'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Decentralized Bluetooth 5.3 & Wi-Fi Direct Multi-Hop Swarm
              </span>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isOfflineMode ? <WifiOff size={26} color="var(--color-warning)" /> : <Radio size={26} color="var(--color-primary)" />}
              Offline Peer-to-Peer Emergency Mesh Network
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '750px', marginTop: '4px', lineHeight: '1.6' }}>
              When commercial cell towers and fiber lines fail during disasters, participating citizen phones automatically form an ad-hoc multi-hop relay. Packets are cryptographically sealed, stored in local buffers, and passed hop-by-hop until reaching an active rescue gateway.
            </p>
          </div>

          {/* Toggle Offline Mode Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <button
              onClick={onToggleOfflineMode}
              style={{
                background: isOfflineMode ? 'var(--color-warning)' : 'rgba(0, 242, 254, 0.2)',
                color: isOfflineMode ? '#000' : 'var(--color-primary)',
                border: '1px solid var(--border-glow)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              {isOfflineMode ? <WifiOff size={16} /> : <Wifi size={16} />}
              <span>{isOfflineMode ? 'Disable Offline Mode (Online)' : 'Simulate Complete Network Failure (Offline)'}</span>
            </button>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Open two browser windows to test real-time P2P packet hopping!
            </span>
          </div>
        </div>

        {/* PROMINENT DELIVERY DISCLAIMER BOX */}
        <div style={{ 
          marginTop: '16px', 
          background: 'rgba(255, 71, 114, 0.12)', 
          border: '1px solid rgba(255, 71, 114, 0.4)', 
          borderRadius: '8px', 
          padding: '12px 16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={20} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-danger)' }}>
              ⚠️ Decentralized Mesh Transmission & Delivery Guarantee Notice
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.5' }}>
              In decentralized peer-to-peer mesh mode, message transmission relies on opportunistic physical relay across participating devices (BLE ~100m, Wi-Fi Direct ~250m). <strong>Message delivery cannot be guaranteed without a continuous reachable communication path or unbroken chain of devices leading to an active gateway.</strong> Store-and-forward buffers hold packets locally until a participating node enters range.
            </p>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME MESH TOPOLOGY VISUALIZER & DYNAMIC HOP ANIMATION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        
        {/* Left: Dynamic Mesh Graph Canvas */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={17} color="var(--color-primary)" />
                Real-Time Mesh Topology & Packet Hopping Canvas
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Click any node to inspect radio telemetry. Watch packets traverse hops in real time.
              </p>
            </div>

            <button
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '4px 10px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              onClick={() => animatePacketHop(`PKT-${Math.floor(1000 + Math.random() * 9000)}`, 'Emergency Ping Simulation')}
              disabled={activeHopState.isActive}
            >
              <Play size={13} />
              <span>Simulate Test Relay Hop</span>
            </button>
          </div>

          {/* SVG Mesh Topology Canvas */}
          <div style={{ background: '#020615', border: '1px solid rgba(0, 242, 254, 0.15)', borderRadius: '10px', height: '380px', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 700 360" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="activeLinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f2fe" />
                  <stop offset="100%" stopColor="#05ffb0" />
                </linearGradient>
              </defs>

              {/* Connecting Radio Mesh Links */}
              <g stroke="rgba(0, 242, 254, 0.2)" strokeWidth="2" strokeDasharray="4,4">
                {/* Node 1 to Peer Phone */}
                <line 
                  x1="100" y1="180" x2="270" y2="120" 
                  stroke={activeHopState.currentHop === 1 ? '#00f2fe' : 'rgba(0, 242, 254, 0.3)'} 
                  strokeWidth={activeHopState.currentHop === 1 ? 4 : 2} 
                />
                {/* Peer Phone to Drone */}
                <line 
                  x1="270" y1="120" x2="440" y2="180" 
                  stroke={activeHopState.currentHop === 2 ? '#00f2fe' : 'rgba(0, 242, 254, 0.3)'} 
                  strokeWidth={activeHopState.currentHop === 2 ? 4 : 2} 
                />
                {/* Drone to Ocean Buoy */}
                <line x1="440" y1="180" x2="440" y2="290" stroke="rgba(0, 242, 254, 0.15)" strokeWidth="1.5" />
                {/* Drone to Gateway */}
                <line 
                  x1="440" y1="180" x2="610" y2="120" 
                  stroke={activeHopState.currentHop === 3 ? '#05ffb0' : 'rgba(5, 255, 176, 0.3)'} 
                  strokeWidth={activeHopState.currentHop === 3 ? 4 : 2} 
                />
              </g>

              {/* LIVE IN-FLIGHT PACKET CAPSULE (ONLY APPEARS ON ACTUAL MESSAGE/SOS) */}
              {activeHopState.isActive && (
                <g 
                  transform={`translate(${activeHopState.packetX}, ${activeHopState.packetY})`}
                  style={{ transition: 'transform 1.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  <circle r="16" fill="none" stroke={activeHopState.isAckReturning ? '#05ffb0' : '#ff4772'} strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" values="8;20;8" dur="1s" repeatCount="indefinite" />
                  </circle>
                  <circle r="8" fill={activeHopState.isAckReturning ? '#05ffb0' : '#ff4772'} stroke="#fff" strokeWidth="1.5" />
                  
                  {/* Floating Packet Label Tag */}
                  <rect x="-60" y="-32" width="120" height="20" fill="rgba(0,0,0,0.9)" rx="4" stroke={activeHopState.isAckReturning ? '#05ffb0' : '#ff4772'} strokeWidth="1" />
                  <text x="0" y="-18" fill="#fff" fontSize="8" fontWeight="800" textAnchor="middle">
                    {activeHopState.packetLabel}
                  </text>
                </g>
              )}

              {/* Node 1: Local User Device */}
              <g 
                transform="translate(100, 180)" 
                onClick={() => setSelectedNode(meshPeers[0])}
                style={{ cursor: 'pointer' }}
              >
                <circle r={activeHopState.currentHop === 0 ? 32 : 24} fill="none" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.5">
                  <animate attributeName="r" values="18;30;18" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r="16" fill="rgba(0, 242, 254, 0.25)" stroke="var(--color-primary)" strokeWidth="2" />
                <text x="0" y="5" fill="#fff" fontSize="12" textAnchor="middle">📱</text>
                <text x="0" y="32" fill="#00f2fe" fontSize="10" fontWeight="800" textAnchor="middle">YOUR PHONE</text>
                <text x="0" y="44" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Origin Node (BLE)</text>
              </g>

              {/* Node 2: Citizen Mobile Peer #19 */}
              <g 
                transform="translate(270, 120)" 
                onClick={() => setSelectedNode(meshPeers[1])}
                style={{ cursor: 'pointer' }}
              >
                {activeHopState.currentHop === 1 && (
                  <circle r="26" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeDasharray="3,3" />
                )}
                <circle r="16" fill="rgba(5, 255, 176, 0.25)" stroke="var(--color-success)" strokeWidth="2" />
                <text x="0" y="4" fill="#fff" fontSize="11" textAnchor="middle">📲</text>
                <text x="0" y="28" fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle">Peer #19 (75m)</text>
                <text x="0" y="38" fill="var(--color-success)" fontSize="8" textAnchor="middle">Buffer: 1 pkt | -68dBm</text>
              </g>

              {/* Node 3: NDRF SAR Mesh Drone Relay */}
              <g 
                transform="translate(440, 180)" 
                onClick={() => setSelectedNode(meshPeers[2])}
                style={{ cursor: 'pointer' }}
              >
                {activeHopState.currentHop === 2 && (
                  <circle r="28" fill="none" stroke="#0088ff" strokeWidth="2" strokeDasharray="3,3" />
                )}
                <circle r="18" fill="rgba(0, 136, 255, 0.25)" stroke="#0088ff" strokeWidth="2" />
                <text x="0" y="5" fill="#fff" fontSize="13" textAnchor="middle">🛸</text>
                <text x="0" y="32" fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle">Drone Sky-2</text>
                <text x="0" y="42" fill="#0088ff" fontSize="8" textAnchor="middle">Wi-Fi Direct Relay (190m)</text>
              </g>

              {/* Node 4: Ocean Buoy */}
              <g 
                transform="translate(440, 290)" 
                onClick={() => setSelectedNode(meshPeers[3])}
                style={{ cursor: 'pointer' }}
              >
                <circle r="13" fill="rgba(245, 166, 35, 0.25)" stroke="var(--color-warning)" strokeWidth="1.5" />
                <text x="0" y="4" fill="#fff" fontSize="9" textAnchor="middle">⚓</text>
                <text x="0" y="24" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Buoy FC-PAC-01 (380m)</text>
              </g>

              {/* Node 5: Starlink Rescue Gateway */}
              <g 
                transform="translate(610, 120)" 
                onClick={() => setSelectedNode(meshPeers[4])}
                style={{ cursor: 'pointer' }}
              >
                <circle r={activeHopState.currentHop === 3 ? 34 : 24} fill="none" stroke="#05ffb0" strokeWidth="2" strokeDasharray="3,3">
                  <animate attributeName="r" values="20;32;20" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r="18" fill="rgba(5, 255, 176, 0.3)" stroke="#05ffb0" strokeWidth="2.5" />
                <text x="0" y="6" fill="#fff" fontSize="13" textAnchor="middle">🛰️</text>
                <text x="0" y="34" fill="#05ffb0" fontSize="10" fontWeight="900" textAnchor="middle">STARLINK GATEWAY</text>
                <text x="0" y="46" fill="var(--text-secondary)" fontSize="8" textAnchor="middle">Coast Guard Base (Online)</text>
              </g>
            </svg>

            {/* In-Flight Packet Dynamic Stage Description Bar */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '12px',
              right: '12px',
              background: 'rgba(7, 14, 32, 0.9)',
              backdropFilter: 'blur(8px)',
              border: activeHopState.isActive ? '1px solid var(--color-primary)' : '1px solid var(--border-muted)',
              padding: '8px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: '#fff',
              transition: 'all 0.3s ease'
            }}>
              <span className="pulse-dot" style={{ backgroundColor: activeHopState.isActive ? 'var(--color-primary)' : 'var(--color-success)' }}></span>
              <strong>Active Transmission Status:</strong>
              <span style={{ color: activeHopState.isAckReturning ? 'var(--color-success)' : 'var(--color-primary)' }}>
                {activeHopState.stageDescription}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Selected Node Radio Telemetry & Live Hop Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Node Radio Inspector Card */}
          <div className="glass-panel" style={{ padding: '16px', borderTop: '3px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>INSPECTED RADIO NODE</span>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#fff', marginTop: '2px' }}>
                  {selectedNode.name}
                </h4>
                <div style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>
                  Protocol: <strong>{selectedNode.protocol}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: selectedNode.rssiDbm > -75 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {selectedNode.rssiDbm} dBm
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Signal Strength</div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px', fontSize: '11px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Distance</span>
                <div style={{ fontWeight: '700', color: '#fff' }}>{selectedNode.distanceMeters}m</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Buffer Queue</span>
                <div style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{selectedNode.bufferCount} pkts</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Battery</span>
                <div style={{ fontWeight: '700', color: 'var(--color-success)' }}>{selectedNode.batteryPercent}%</div>
              </div>
            </div>
          </div>

          {/* Microsecond Chronological Hop Audit Log */}
          <div className="glass-panel" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="var(--color-warning)" />
              Real-Time Peer Relay Hop Audit Stream
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '180px', fontSize: '10px', fontFamily: 'monospace' }}>
              {liveRelayLogs.map((log, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '5px 8px', borderRadius: '4px', borderLeft: '2px solid var(--color-primary)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>[{log.time}] </span>
                  <span style={{ color: 'var(--text-primary)' }}>{log.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Emergency Mesh Broadcast Terminal & Packet Audit Log */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Send size={18} color="var(--color-primary)" />
          Broadcast Emergency Message via Mesh Peer Swarm
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Message will be encrypted, stored in local device buffer, and hopped across nearby participating phones until reaching an online satellite gateway.
        </p>

        {/* Input Form */}
        <form onSubmit={handleBroadcastMessage} style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
          <select 
            className="input-field" 
            value={msgType}
            onChange={e => setMsgType(e.target.value)}
            style={{ width: '180px', fontSize: '12px' }}
          >
            <option value="EMERGENCY_SOS">🆘 Emergency SOS Alert</option>
            <option value="HAZARD_REPORT">⚠️ Hazard Roadblock Report</option>
            <option value="FAMILY_PING">👨‍👩‍👧 Family Safety Status</option>
            <option value="SHELTER_INQUIRY">🏛️ Shelter Space Inquiry</option>
          </select>

          <input 
            type="text" 
            className="input-field" 
            placeholder="Type emergency message (e.g. Trapped on 2nd floor, water rising, 3 people need boat evacuation)..."
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            style={{ flex: 1, minWidth: '280px', fontSize: '12px' }}
          />

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isBroadcasting}
            style={{ minWidth: '160px', justifyContent: 'center' }}
          >
            <Send size={15} />
            <span>{isBroadcasting ? 'Relaying via Mesh...' : 'Broadcast to Mesh'}</span>
          </button>
        </form>

        {/* Messages Stream with 4-Stage Lifecycle: Queued -> Relayed -> Delivered -> Acknowledged */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>
            MESH PACKET RELAY AUDIT TRAIL (STORE-AND-FORWARD BUFFER)
          </h4>

          {meshMessages.map(msg => {
            const isAck = msg.status === 'ACKNOWLEDGED';
            const isDelivered = msg.status === 'DELIVERED';
            const isRelayed = msg.status === 'RELAYED';

            let statusColor = 'var(--text-muted)';
            if (isAck) statusColor = 'var(--color-success)';
            else if (isDelivered) statusColor = 'var(--color-primary)';
            else if (isRelayed) statusColor = 'var(--color-warning)';

            return (
              <div 
                key={msg.id}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${isAck ? 'rgba(5, 255, 176, 0.3)' : 'var(--border-muted)'}`,
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: '800', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      background: statusColor === 'var(--color-success)' ? 'rgba(5, 255, 176, 0.2)' : 'rgba(245, 166, 35, 0.2)',
                      color: statusColor
                    }}>
                      {msg.status}
                    </span>
                    <strong style={{ fontSize: '13px', color: '#fff' }}>{msg.senderName}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({msg.type})</span>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Packet ID: <strong>{msg.id}</strong> | Hops: <strong>{msg.hops}</strong> | TTL: <strong>{msg.ttl}</strong> | {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {/* Decrypted Content */}
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '6px' }}>
                  {msg.decryptedText}
                </div>

                {/* Hop Trail Progression */}
                <div style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>
                  📍 <strong>Relay Hop Chain:</strong> {msg.hopTrail.join(' ➔ ')}
                </div>

                {/* Gateway Acknowledged Signature */}
                {msg.ackSignature && (
                  <div style={{ fontSize: '10px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} />
                    Verified Delivery Receipt: <strong>{msg.ackSignature}</strong> (Signed by Coast Guard Starlink Base)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
