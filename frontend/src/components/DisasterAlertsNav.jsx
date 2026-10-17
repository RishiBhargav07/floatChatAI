import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, Shield, Navigation, Compass, MapPin, 
  ChevronRight, Volume2, VolumeX, Eye, ArrowUpRight, 
  CheckCircle2, Clock, Wind, Waves, Activity, AlertOctagon,
  Layers, RefreshCw, ZoomIn, ZoomOut, Maximize2, ShieldAlert
} from 'lucide-react';

export default function DisasterAlertsNav({ 
  disasterScenario, 
  onSwitchScenario, 
  allScenarios,
  shelters, 
  onSelectShelterForSOS,
  activeSOSList,
  onSelectTab
}) {
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 13.052, lng: 80.235, name: 'Marina Coastal Strip (Lowland +4m)' });
  const [activeLayers, setActiveLayers] = useState({
    hazards: true,
    shelters: true,
    evacRoutes: true,
    blockedRoads: true,
    elevationContours: true
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationStep, setNavigationStep] = useState(0);
  const [etaRemainingMins, setEtaRemainingMins] = useState(24);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Set default shelter when loaded
  useEffect(() => {
    if (shelters && shelters.length > 0 && !selectedShelter) {
      setSelectedShelter(shelters[0]);
    }
  }, [shelters, selectedShelter]);

  // Multilingual Guidance Strings
  const TRANSLATIONS = {
    en: {
      tsunamiTitle: 'Tsunami Early Warning Protocol',
      tsunamiSteps: [
        'Move immediately to high ground (+30m elevation or 3km inland).',
        'Do NOT visit the shore to observe receding water or ocean troughs.',
        'Follow designated high-elevation safe corridors—avoid coastal highways.'
      ],
      cycloneTitle: 'Supercyclone Life-Safety Protocol',
      cycloneSteps: [
        'Seek shelter in reinforced Cat-5 concrete facilities.',
        'Fasten heavy storm shutters and disconnect electrical mains.',
        'Remain in interior windowless rooms during eye-wall passage.'
      ],
      floodTitle: 'Flash Flood & Inundation Protocol',
      floodSteps: [
        'Never walk or drive across flooded roads (15cm can knock down adults).',
        'Evacuate horizontally towards high ridge terrain immediately.',
        'Turn off gas lines and avoid touching submerged power outlets.'
      ],
      quakeTitle: 'Earthquake & Aftershock Protocol',
      quakeSteps: [
        'Drop, Cover, and Hold On under sturdy furniture.',
        'Stay clear of glass facades, chimneys, and exterior walls.',
        'Evacuate compromised structures once primary shaking ceases.'
      ]
    },
    hi: {
      tsunamiTitle: 'सुनामी पूर्व चेतावनी निर्देशिका',
      tsunamiSteps: [
        'तुरंत ऊंचे स्थानों (30 मीटर से ऊपर या तट से 3 किमी दूर) पर जाएं।',
        'समुद्र के पीछे हटते पानी को देखने के लिए तट के पास कभी न जाएं।',
        'निर्दिष्ट ऊंचे सुरक्षा गलियारों का ही उपयोग करें।'
      ],
      cycloneTitle: 'चक्रवात जीवन-सुरक्षा प्रोटोकॉल',
      cycloneSteps: [
        'मजबूत कंक्रीट आश्रय में शरण लें।',
        'बिजली और गैस की मुख्य लाइन बंद कर दें।',
        'खिड़कियों से दूर आंतरिक कमरों में सुरक्षित रहें।'
      ],
      floodTitle: 'बाढ़ एवं जलभराव सुरक्षा निर्देशिका',
      floodSteps: [
        'बहते बाढ़ के पानी में कभी न चलें या गाड़ी न चलाएं।',
        'तत्काल ऊंचे टीलों व सुरक्षित आश्रयों की ओर बढ़ें।',
        'डूबे हुए बिजली के खंभों व तारों से दूर रहें।'
      ],
      quakeTitle: 'भूकंप एवं पश्चात्-कंपन सुरक्षा',
      quakeSteps: [
        'झुकें, ढकें और मजबूती से पकड़ें (Drop, Cover & Hold On)।',
        'कांच और बाहरी दीवारों से दूर रहें।',
        'झटके रुकने के बाद सुरक्षित खुले स्थान पर निकलें।'
      ]
    },
    ta: {
      tsunamiTitle: 'சுனாமி முன்னெச்சரிக்கை வழிகாட்டுதல்',
      tsunamiSteps: [
        'உடனடியாக உயரமான இடங்களுக்கு (+30 மீட்டர் அல்லது 3 கி.மீ உட்செல்லவும்) செல்லவும்.',
        'கடல் உள்வாங்குவதை வேடிக்கை பார்க்க கடற்கரைக்குச் செல்ல வேண்டாம்.',
        'பாதுகாப்பான ஒதுக்கப்பட்ட பாதைகளைப் பின்பற்றவும்.'
      ],
      cycloneTitle: 'புயல் பாதுகாப்பு நெறிமுறை',
      cycloneSteps: [
        'பலப்படுத்தப்பட்ட கான்கிரீட் முகாம்களில் தஞ்சம் புகவும்.',
        'மின்சாரம் மற்றும் எரிவாயு இணைப்புகளைத் துண்டிக்கவும்.',
        'ஜன்னல்களுக்கு அப்பால் உட்புற அறைகளில் பாதுகாப்பாக இருக்கவும்.'
      ],
      floodTitle: 'வெள்ள அபாய பாதுகாப்பு',
      floodSteps: [
        'வெள்ள நீரில் ஒருபோதும் நடக்கவோ வாகனம் ஓட்டவோ வேண்டாம்.',
        'உடனடியாக மேட்டு நிலங்களுக்கு செல்லவும்.',
        'நீரில் மூழ்கிய மின்கம்பிகளைத் தொடாதீர்கள்.'
      ],
      quakeTitle: 'நிலநடுக்க பாதுகாப்பு நெறிமுறைகள்',
      quakeSteps: [
        'குனிந்து, மறைந்து, பிடித்துக் கொள்ளுங்கள் (Drop, Cover, Hold).',
        'கண்ணாடி மற்றும் இடிந்து விழும் பொருட்களிலிருந்து விலகியிருங்கள்.',
        'அதிர்வு நின்றவுடன் பாதுகாப்பான திறந்தவெளிக்குச் செல்லவும்.'
      ]
    },
    bn: {
      tsunamiTitle: 'সুনামি প্রাথমিক সতর্কতা নির্দেশিকা',
      tsunamiSteps: [
        'অবিলম্বে উচ্চ ভূমিতে (+৩০ মিটার বা ৩ কিমি অভ্যন্তরে) সরে যান।',
        'সমুদ্রের নেমে যাওয়া পানি দেখতে তীরের দিকে যাবেন না।',
        'উপকূলীয় মহাসড়ক এড়িয়ে নিরাপদ উচ্চ করিডোর অনুসরণ করুন।'
      ],
      cycloneTitle: 'ঘূর্ণিঝড় সুরক্ষা নির্দেশিকা',
      cycloneSteps: [
        'পাকা কংক্রিট আশ্রয়কেন্দ্রে আশ্রয় নিন।',
        'বিদ্যুৎ ও গ্যাস সংযোগ বন্ধ রাখুন।',
        'জানালাবিহীন নিরাপদ ভেতরের ঘরে অবস্থান করুন।'
      ],
      floodTitle: 'বন্যা ও আকস্মিক প্লাবন নির্দেশিকা',
      floodSteps: [
        'প্লাবিত পানির মধ্য দিয়ে হাঁটবেন বা গাড়ি চালাবেন না।',
        'অবিলম্বে উঁচু শৈলশিরার দিকে চলে যান।',
        'বিদ্যুতের খুঁটি ও তার থেকে দূরে থাকুন।'
      ],
      quakeTitle: 'ভূমিকম্প সুরক্ষা প্রোটোকল',
      quakeSteps: [
        'নিচু হয়ে কোনো শক্ত কিছুর নিচে আশ্রয় নিন (Drop, Cover, Hold)।',
        'কাচের জানালা ও দেওয়াল থেকে দূরে থাকুন।',
        'কম্পন থামার পর খোলা জায়গায় বেরিয়ে আসুন।'
      ]
    },
    es: {
      tsunamiTitle: 'Protocolo de Alerta Temprana de Tsunami',
      tsunamiSteps: [
        'Evacuar inmediatamente a terrenos altos (+30m de elevación o 3 km tierra adentro).',
        'NO se acerque a la costa a observar el retroceso del agua marina.',
        'Siga los corredores de evacuación seguros designados.'
      ],
      cycloneTitle: 'Protocolo de Seguridad para Ciclones',
      cycloneSteps: [
        'Busque refugio en instalaciones de hormigón reforzado Cat-5.',
        'Cierre persianas contra tormentas y desconecte el suministro eléctrico.',
        'Permanezca en habitaciones interiores lejos de ventanas.'
      ],
      floodTitle: 'Protocolo para Inundaciones Repentinas',
      floodSteps: [
        'Nunca camine ni conduzca por carreteras inundadas.',
        'Evacúe inmediatamente hacia terrenos elevados y crestas.',
        'Evite tocar tomas de corriente o cables sumergidos.'
      ],
      quakeTitle: 'Protocolo para Terremotos y Réplicas',
      quakeSteps: [
        'Agáchese, Cúbrase y Sujétese bajo muebles resistentes.',
        'Manténgase alejado de fachadas de vidrio y paredes exteriores.',
        'Evacúe estructuras comprometidas una vez que cese el temblor.'
      ]
    }
  };

  const currentLangTexts = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  // Map coordinate conversion helper (tactical viewport)
  // Bounding Box: lat 13.02 to 13.12, lng 80.14 to 80.26
  const getMapCoordinates = (lat, lng) => {
    const minLat = 13.02;
    const maxLat = 13.13;
    const minLng = 80.14;
    const maxLng = 80.26;

    const x = ((lng - minLng) / (maxLng - minLng)) * 800;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 500;
    return { x, y };
  };

  // Safe Evacuation Route Steps calculation
  const getEvacuationSteps = (shelter) => {
    if (!shelter) return [];
    return [
      {
        step: 1,
        instruction: 'Evacuate immediately West from Marina Coastal Lowlands.',
        hazardAvoidance: 'Avoid Coastal Hwy 14 (Active Storm Surge & Inundation Zone +1.8m water).',
        distanceMeters: 600,
        elevationGain: '+8m',
        action: 'Turn right at Harbour Cross onto Old Fort Road'
      },
      {
        step: 2,
        instruction: 'Ascend onto Central Elevated Ridge Bypass.',
        hazardAvoidance: 'Bridge Pier 4 is structurally compromised. Use reinforced flyover.',
        distanceMeters: 950,
        elevationGain: '+18m',
        action: 'Continue along Ridge Bypass Northbound'
      },
      {
        step: 3,
        instruction: `Arrive at High-Ground Citadel: ${shelter.name}.`,
        hazardAvoidance: `Elevated above surge risk (+${shelter.elevationMeters}m MSL). Tsunami & Cyclone immune.`,
        distanceMeters: 750,
        elevationGain: `+${shelter.elevationMeters - 26}m`,
        action: 'Enter through Gate 2 (Emergency Intake & Medical Triage)'
      }
    ];
  };

  const evacuationSteps = getEvacuationSteps(selectedShelter);

  // Live GPS Evacuation Simulation Loop
  useEffect(() => {
    let timer = null;
    if (isNavigating) {
      timer = setInterval(() => {
        setNavigationStep(prev => {
          if (prev >= evacuationSteps.length - 1) {
            setIsNavigating(false);
            return prev;
          }
          return prev + 1;
        });
        setEtaRemainingMins(prev => Math.max(1, prev - 7));
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isNavigating, evacuationSteps.length]);

  const userCoords = getMapCoordinates(userLocation.lat, userLocation.lng);

  return (
    <div className="disaster-alerts-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header Banner & Scenario Switcher */}
      <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--color-danger)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="live-pulse-badge" style={{ backgroundColor: 'rgba(255, 71, 114, 0.2)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
                <span className="pulse-dot" style={{ backgroundColor: 'var(--color-danger)' }}></span>
                VERIFIED AI DISASTER SENTINEL
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Agency: {disasterScenario?.agency || 'INCOIS / NDMA Sentinel'}
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={28} color="var(--color-danger)" />
              {disasterScenario?.name || 'Active Disaster Scenario'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', maxWidth: '750px', lineHeight: '1.6' }}>
              {disasterScenario?.instructions}
            </p>
          </div>

          {/* Quick Scenario Selector & Multilingual Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scenario Mode:</span>
              <select 
                className="input-field" 
                value={allScenarios?.find(s => s.name === disasterScenario?.name)?.key || 'tsunami'}
                onChange={(e) => onSwitchScenario && onSwitchScenario(e.target.value)}
                style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--bg-panel)', border: '1px solid var(--border-glow)' }}
              >
                <option value="tsunami">🌊 Bay of Bengal Tsunami Warning (8.4M)</option>
                <option value="cyclone">🌀 Category-4 Supercyclone Vardah II</option>
                <option value="flood">🌧️ Monsoonal Cloudburst & Flash Flood</option>
                <option value="earthquake">🌋 7.6M Subduction Earthquake</option>
                <option value="normal">✅ All Clear - Routine Monitoring</option>
              </select>
            </div>

            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Instructions Language:</span>
              {['en', 'hi', 'ta', 'bn', 'es'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: selectedLanguage === lang ? '1px solid var(--color-primary)' : '1px solid var(--border-muted)',
                    background: selectedLanguage === lang ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
                    color: selectedLanguage === lang ? 'var(--color-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hazard Metrics Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '18px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SURGE VELOCITY / WIND</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)', marginTop: '4px' }}>
              {disasterScenario?.waveVelocityKph ? `${disasterScenario.waveVelocityKph} km/h` : `${disasterScenario?.windSpeedKph || 195} km/h`}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Hydrostatic Wave Speed</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>COASTAL ARRIVAL ETA</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-danger)', marginTop: '4px' }}>
              {disasterScenario?.coastalEtaMinutes ? `${disasterScenario.coastalEtaMinutes} Minutes` : 'IMMEDIATE'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Time to Inundation Crest</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SURGE HEIGHT FORECAST</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-warning)', marginTop: '4px' }}>
              {disasterScenario?.estimatedWaveHeightMeters ? `${disasterScenario.estimatedWaveHeightMeters}m Crest` : `${disasterScenario?.stormSurgeMeters || 3.8}m Surge`}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Above High Tide Line</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MINIMUM SAFE ELEVATION</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-success)', marginTop: '4px' }}>
              +{disasterScenario?.elevationHazardLimitMeters || 25} Meters MSL
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Vertical Evacuation Level</div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Tactical Map & Safe-Zone Navigation Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', minHeight: '560px' }}>
        
        {/* Left: Interactive Vector Map Canvas */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
                Tactical Safe-Zone Navigation Map
              </h3>
              <span style={{ fontSize: '11px', background: 'rgba(5, 255, 176, 0.15)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                LIVE GPS LINK
              </span>
            </div>

            {/* Map Controls & Layer Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                className="btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.0))}
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button 
                className="btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button 
                className="btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
                title="Reset View"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Layer Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '11px' }}>
            <button 
              onClick={() => setActiveLayers(p => ({ ...p, hazards: !p.hazards }))}
              style={{
                background: activeLayers.hazards ? 'rgba(255, 71, 114, 0.2)' : 'rgba(255,255,255,0.05)',
                border: activeLayers.hazards ? '1px solid var(--color-danger)' : '1px solid var(--border-muted)',
                color: activeLayers.hazards ? 'var(--color-danger)' : 'var(--text-muted)',
                padding: '3px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ⚠️ Hazard Inundation Zones
            </button>
            <button 
              onClick={() => setActiveLayers(p => ({ ...p, shelters: !p.shelters }))}
              style={{
                background: activeLayers.shelters ? 'rgba(5, 255, 176, 0.2)' : 'rgba(255,255,255,0.05)',
                border: activeLayers.shelters ? '1px solid var(--color-success)' : '1px solid var(--border-muted)',
                color: activeLayers.shelters ? 'var(--color-success)' : 'var(--text-muted)',
                padding: '3px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🏛️ Verified Shelters ({shelters?.length || 4})
            </button>
            <button 
              onClick={() => setActiveLayers(p => ({ ...p, evacRoutes: !p.evacRoutes }))}
              style={{
                background: activeLayers.evacRoutes ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255,255,255,0.05)',
                border: activeLayers.evacRoutes ? '1px solid var(--color-primary)' : '1px solid var(--border-muted)',
                color: activeLayers.evacRoutes ? 'var(--color-primary)' : 'var(--text-muted)',
                padding: '3px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ⚡ Safe Evacuation Route
            </button>
            <button 
              onClick={() => setActiveLayers(p => ({ ...p, blockedRoads: !p.blockedRoads }))}
              style={{
                background: activeLayers.blockedRoads ? 'rgba(245, 166, 35, 0.2)' : 'rgba(255,255,255,0.05)',
                border: activeLayers.blockedRoads ? '1px solid var(--color-warning)' : '1px solid var(--border-muted)',
                color: activeLayers.blockedRoads ? 'var(--color-warning)' : 'var(--text-muted)',
                padding: '3px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🚫 Blocked/Flooded Corridors
            </button>
          </div>

          {/* SVG Tactical Map Render */}
          <div style={{ flex: 1, minHeight: '420px', background: '#020612', borderRadius: '12px', border: '1px solid rgba(0, 242, 254, 0.15)', overflow: 'hidden', position: 'relative' }}>
            <svg 
              viewBox="0 0 800 500" 
              style={{ 
                width: '100%', 
                height: '100%', 
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <defs>
                <pattern id="tactical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 242, 254, 0.08)" strokeWidth="0.8" />
                </pattern>
                <radialGradient id="hazardSurgeGrad" cx="100%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="rgba(255, 71, 114, 0.65)" />
                  <stop offset="60%" stopColor="rgba(255, 71, 114, 0.25)" />
                  <stop offset="100%" stopColor="rgba(255, 71, 114, 0.0)" />
                </radialGradient>
                <linearGradient id="safeRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f2fe" />
                  <stop offset="100%" stopColor="#05ffb0" />
                </linearGradient>
              </defs>

              {/* Background Map Grid */}
              <rect width="800" height="500" fill="#040b1e" />
              <rect width="800" height="500" fill="url(#tactical-grid)" />

              {/* Ocean & Shoreline Boundary (Right side is Sea) */}
              <path 
                d="M 680 0 Q 640 150, 660 300 T 630 500 L 800 500 L 800 0 Z" 
                fill="#021430" 
                stroke="rgba(0, 242, 254, 0.3)" 
                strokeWidth="2" 
              />
              <text x="730" y="240" fill="rgba(0, 242, 254, 0.4)" fontSize="12" fontWeight="700" transform="rotate(90, 730, 240)">
                OCEAN INUNDATION FRONT
              </text>

              {/* Elevation Contours (West is High Ground +60m) */}
              {activeLayers.elevationContours && (
                <g opacity="0.35">
                  <path d="M 120 0 Q 150 250, 100 500" fill="none" stroke="#05ffb0" strokeWidth="1" strokeDasharray="4,4" />
                  <text x="110" y="480" fill="#05ffb0" fontSize="9">+55m Ridge</text>
                  
                  <path d="M 320 0 Q 360 250, 290 500" fill="none" stroke="#05ffb0" strokeWidth="1" strokeDasharray="4,4" />
                  <text x="310" y="480" fill="#05ffb0" fontSize="9">+35m Safe Benchmark</text>

                  <path d="M 500 0 Q 530 250, 480 500" fill="none" stroke="#f5a623" strokeWidth="1" strokeDasharray="4,4" />
                  <text x="490" y="480" fill="#f5a623" fontSize="9">+15m Critical Line</text>
                </g>
              )}

              {/* Coastal Hazard Zone Overlay */}
              {activeLayers.hazards && (
                <g>
                  <path 
                    d="M 540 0 Q 570 200, 520 350 T 490 500 L 800 500 L 800 0 Z" 
                    fill="url(#hazardSurgeGrad)" 
                    stroke="rgba(255, 71, 114, 0.8)" 
                    strokeWidth="1.5"
                  />
                  <text x="560" y="120" fill="var(--color-danger)" fontSize="11" fontWeight="700">
                    ⚠️ SECTOR A-C SURGE INUNDATION ZONE (&lt; 20m)
                  </text>
                </g>
              )}

              {/* Road Corridors */}
              <g stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" fill="none">
                {/* Coastal Road (Flooded) */}
                <path d="M 620 20 L 610 180 L 590 320 L 580 480" />
                {/* Cross Arterial to High Ground */}
                <path d="M 610 180 L 460 220 L 260 200 L 140 180" />
                {/* North Ridge Safe Expressway */}
                <path d="M 460 220 L 410 120 L 280 90 L 120 70" />
                {/* South Radial */}
                <path d="M 590 320 L 420 360 L 240 380" />
              </g>

              {/* Blocked Roads Indicators */}
              {activeLayers.blockedRoads && (
                <g>
                  {/* Barrier 1 on Coastal Hwy */}
                  <g transform="translate(605, 230)">
                    <rect x="-14" y="-8" width="28" height="16" fill="#ff4772" rx="3" />
                    <text x="0" y="3" fill="#fff" fontSize="8" fontWeight="800" textAnchor="middle">CLOSED</text>
                  </g>
                  {/* Barrier 2 at Lowland Bridge */}
                  <g transform="translate(530, 200)">
                    <rect x="-14" y="-8" width="28" height="16" fill="#f5a623" rx="3" />
                    <text x="0" y="3" fill="#000" fontSize="7" fontWeight="800" textAnchor="middle">FLOOD</text>
                  </g>
                </g>
              )}

              {/* Safe Evacuation Route Path */}
              {activeLayers.evacRoutes && selectedShelter && (
                <g>
                  {/* Route Polyline from User (approx 610, 280) to Shelter 1 (approx 240, 110) */}
                  <path 
                    d="M 605 270 L 520 260 L 440 215 L 360 160 L 240 110" 
                    fill="none" 
                    stroke="url(#safeRouteGrad)" 
                    strokeWidth="4" 
                    strokeDasharray="6,4"
                    style={{ animation: 'routeFlow 1.5s linear infinite' }}
                  />
                  {/* Waypoint Nodes along safe path */}
                  <circle cx="520" cy="260" r="4" fill="#00f2fe" stroke="#fff" strokeWidth="1" />
                  <circle cx="440" cy="215" r="4" fill="#00f2fe" stroke="#fff" strokeWidth="1" />
                  <circle cx="360" cy="160" r="4" fill="#05ffb0" stroke="#fff" strokeWidth="1" />
                </g>
              )}

              {/* User Location Node (GPS Pin or Active SOS Distress Beacon) */}
              {activeSOSList && activeSOSList.some(s => s.status !== 'RESCUED') ? (
                <g transform={`translate(${userCoords.x}, ${userCoords.y})`}>
                  {/* Radiating High-Alert Red Radar Rings */}
                  <circle r="40" fill="none" stroke="var(--color-danger)" strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" values="10;45;10" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle r="10" fill="var(--color-danger)" stroke="#fff" strokeWidth="2.5" />
                  <rect x="-65" y="-32" width="130" height="20" fill="rgba(255, 71, 114, 0.95)" rx="4" stroke="#fff" strokeWidth="1" />
                  <text x="0" y="-18" fill="#fff" fontSize="9" fontWeight="900" textAnchor="middle">🚨 ACTIVE SOS DISTRESS</text>
                </g>
              ) : (
                <g transform={`translate(${userCoords.x}, ${userCoords.y})`}>
                  <circle r="18" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.6">
                    <animate attributeName="r" values="6;24;6" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle r="6" fill="var(--color-primary)" stroke="#fff" strokeWidth="2" />
                  <rect x="-45" y="-28" width="90" height="18" fill="rgba(0,0,0,0.85)" rx="4" stroke="var(--color-primary)" strokeWidth="0.8" />
                  <text x="0" y="-16" fill="#00f2fe" fontSize="8" fontWeight="700" textAnchor="middle">YOU (+4m Surge)</text>
                </g>
              )}

              {/* Interception Trajectory Line from SAR Boat to Active SOS Pin */}
              {activeSOSList && activeSOSList.some(s => s.status !== 'RESCUED') && (
                <g>
                  <line 
                    x1="560" y1="310" 
                    x2={userCoords.x} y2={userCoords.y} 
                    stroke="#0088ff" 
                    strokeWidth="3" 
                    strokeDasharray="6,4" 
                    style={{ animation: 'routeFlow 1s linear infinite' }} 
                  />
                  <rect x={(560 + userCoords.x) / 2 - 75} y={(310 + userCoords.y) / 2 - 16} width="150" height="18" fill="rgba(0, 30, 80, 0.9)" rx="3" stroke="#0088ff" strokeWidth="1" />
                  <text x={(560 + userCoords.x) / 2} y={(310 + userCoords.y) / 2 - 4} fill="#00f2fe" fontSize="8" fontWeight="800" textAnchor="middle">
                    ➔ SAR INTERCEPTION VECTOR (ETA: ~4m)
                  </text>
                </g>
              )}

              {/* Shelters Markers */}
              {activeLayers.shelters && shelters && shelters.map(s => {
                const coords = getMapCoordinates(s.lat, s.lng);
                const isSelected = selectedShelter?.id === s.id;
                const occPercent = Math.round((s.currentOccupancy / s.totalCapacity) * 100);

                return (
                  <g 
                    key={s.id} 
                    transform={`translate(${coords.x}, ${coords.y})`}
                    onClick={() => setSelectedShelter(s)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Ring highlight if selected */}
                    {isSelected && (
                      <circle r="22" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeDasharray="3,3" />
                    )}

                    {/* Fortress Pin */}
                    <circle r="12" fill={occPercent > 90 ? 'var(--color-danger)' : 'var(--color-success)'} stroke="#fff" strokeWidth="2" />
                    <text x="0" y="4" fill="#000" fontSize="9" fontWeight="900" textAnchor="middle">🏛️</text>

                    {/* Shelter Name & Elevation Label */}
                    <rect x="-65" y="16" width="130" height="22" fill="rgba(12, 22, 48, 0.9)" rx="4" stroke={isSelected ? 'var(--color-success)' : 'var(--border-muted)'} strokeWidth="1" />
                    <text x="0" y="27" fill="#fff" fontSize="8" fontWeight="700" textAnchor="middle">{s.name.substring(0, 20)}</text>
                    <text x="0" y="36" fill="var(--color-success)" fontSize="7" fontWeight="600" textAnchor="middle">+{s.elevationMeters}m | {occPercent}% Full</text>
                  </g>
                );
              })}

              {/* First Responder Active Boat Marker */}
              <g transform="translate(560, 310)">
                <circle r="10" fill="#0088ff" stroke="#fff" strokeWidth="2" />
                <text x="0" y="4" fill="#fff" fontSize="9" fontWeight="800" textAnchor="middle">🚤</text>
                <text x="14" y="4" fill="#00e5ff" fontSize="9" fontWeight="800">SAR Boat Alpha (NDRF)</text>
              </g>
            </svg>

            {/* In-Map Navigation Status Pill */}
            {isNavigating && (
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(5, 255, 176, 0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--color-success)',
                padding: '8px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span className="pulse-dot" style={{ backgroundColor: 'var(--color-success)' }}></span>
                <span style={{ fontSize: '12px', color: '#fff', fontWeight: '700' }}>
                  Simulated Turn-by-Turn Navigation Active
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: '800' }}>
                  ETA: {etaRemainingMins} mins
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Turn-by-Turn Safe Zone Navigation & Shelter Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Target Shelter Card */}
          <div className="glass-panel" style={{ padding: '18px', borderTop: '3px solid var(--color-success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: '700', textTransform: 'uppercase' }}>
                  TARGET SAFE REFUGE CITADEL
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
                  {selectedShelter?.name || 'St. Jude High-Elevation Safe Citadel'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedShelter?.address || '44 Summit Ridge Road'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary)' }}>
                  +{selectedShelter?.elevationMeters || 44}m
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Above Sea Level</div>
              </div>
            </div>

            {/* Capacity & Facilities */}
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Occupancy Status:</span>
                <span style={{ fontWeight: '700', color: selectedShelter?.currentOccupancy > selectedShelter?.totalCapacity * 0.85 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                  {selectedShelter?.currentOccupancy} / {selectedShelter?.totalCapacity} Beds Taken ({Math.round((selectedShelter?.currentOccupancy / selectedShelter?.totalCapacity) * 100)}%)
                </span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.round((selectedShelter?.currentOccupancy / selectedShelter?.totalCapacity) * 100)}%`,
                    backgroundColor: selectedShelter?.currentOccupancy > selectedShelter?.totalCapacity * 0.85 ? 'var(--color-warning)' : 'var(--color-success)',
                    transition: 'width 0.5s ease'
                  }} 
                />
              </div>
            </div>

            {/* Facilities Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
              <span className="nav-tag" style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--color-primary)' }}>🏥 Medical Clinic</span>
              <span className="nav-tag" style={{ background: 'rgba(5, 255, 176, 0.1)', color: 'var(--color-success)' }}>💧 Clean Water</span>
              <span className="nav-tag" style={{ background: 'rgba(245, 166, 35, 0.1)', color: 'var(--color-warning)' }}>⚡ Solar Microgrid</span>
              <span className="nav-tag" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' }}>🛰️ Starlink Mesh</span>
              <span className="nav-tag" style={{ background: 'rgba(255, 71, 114, 0.1)', color: '#ff7fa1' }}>🐾 Pet Friendly</span>
            </div>

            {/* Navigation Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button 
                className="btn-primary" 
                style={{ flex: 1, justifyContent: 'center', fontSize: '13px' }}
                onClick={() => {
                  setIsNavigating(!isNavigating);
                  if (!isNavigating) setNavigationStep(0);
                }}
              >
                <Compass size={16} />
                <span>{isNavigating ? 'Cancel Live Simulation' : 'Start Live GPS Evacuation'}</span>
              </button>

              <button 
                className="btn-secondary"
                style={{ fontSize: '13px', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                onClick={() => onSelectShelterForSOS && onSelectShelterForSOS(selectedShelter)}
                title="Send Emergency SOS with this Shelter as Destination"
              >
                🆘 Request SOS Pick-up
              </button>
            </div>
          </div>

          {/* Turn-by-Turn Safe Path Details */}
          <div className="glass-panel" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Navigation size={15} color="var(--color-primary)" />
                Turn-by-Turn Safe Zone Corridor
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Total: 2.3 km (24 min walk / 6 min vehicle)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              {evacuationSteps.map((stepItem, index) => {
                const isActive = navigationStep === index;
                const isCompleted = navigationStep > index;

                return (
                  <div 
                    key={stepItem.step}
                    style={{
                      background: isActive ? 'rgba(0, 242, 254, 0.12)' : 'rgba(0,0,0,0.2)',
                      border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--border-muted)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      gap: '10px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isCompleted ? 'var(--color-success)' : (isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'),
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '800',
                      flexShrink: 0
                    }}>
                      {isCompleted ? '✓' : stepItem.step}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                        {stepItem.instruction}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '2px' }}>
                        ➔ {stepItem.action} ({stepItem.distanceMeters}m | Elev: {stepItem.elevationGain})
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--color-warning)', marginTop: '3px' }}>
                        🛡️ {stepItem.hazardAvoidance}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Multilingual Protocol Card */}
            <div style={{ marginTop: 'auto', background: 'rgba(255, 71, 114, 0.08)', border: '1px solid rgba(255, 71, 114, 0.25)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertOctagon size={14} />
                {currentLangTexts.tsunamiTitle}
              </div>
              <ul style={{ paddingLeft: '18px', marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {currentLangTexts.tsunamiSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
