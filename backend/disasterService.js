import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DISASTER_DATA_FILE = path.join(__dirname, 'data', 'disaster_state.json');

// Initial Disaster Scenarios
const INITIAL_SCENARIOS = {
  tsunami: {
    id: 'SCENARIO-TSUNAMI-01',
    type: 'TSUNAMI',
    name: 'Bay of Bengal Subduction Tsunami Warning',
    severity: 'CRITICAL',
    agency: 'Indian National Centre for Ocean Information Services (INCOIS) / PTWC',
    timestamp: new Date().toISOString(),
    epicenter: { lat: 12.85, lng: 88.42, depthKm: 18, magnitude: 8.4 },
    affectedRadiusKm: 320,
    waveVelocityKph: 740,
    estimatedWaveHeightMeters: 4.8,
    coastalEtaMinutes: 28,
    affectedSectors: ['Sector A - Coastal Fishery Zone', 'Sector B - Marina Port Harbour', 'Sector C - Lowland Delta'],
    elevationHazardLimitMeters: 25,
    evacuationPriority: 'IMMEDIATE_VERTICAL_EVACUATION',
    instructions: 'Evacuate immediately to designated high-elevation safe citadels (+30m elevation) or inland beyond 3 kilometers. Do not approach shorelines to observe receding water.'
  },
  cyclone: {
    id: 'SCENARIO-CYCLONE-02',
    type: 'CYCLONE',
    name: 'Category-4 Supercyclone "Vardah II"',
    severity: 'CRITICAL',
    agency: 'Regional Specialized Meteorological Centre (RSMC) / IMD',
    timestamp: new Date().toISOString(),
    epicenter: { lat: 13.10, lng: 84.20 },
    windSpeedKph: 195,
    gustSpeedKph: 220,
    centralPressureHpa: 938,
    stormSurgeMeters: 3.8,
    coastalEtaMinutes: 140,
    affectedSectors: ['Coastal Highway Strip', 'River Delta Estuary', 'North Beach Residential'],
    elevationHazardLimitMeters: 18,
    evacuationPriority: 'REINFORCED_SHELTER_LOCKDOWN',
    instructions: 'Seek shelter in Cat-5 engineered concrete shelters. Fasten storm shutters, turn off gas/electrical mains, and stay in interior rooms away from glass windows.'
  },
  flood: {
    id: 'SCENARIO-FLOOD-03',
    type: 'FLOOD',
    name: 'Monsoonal Cloudburst & River Breach',
    severity: 'HIGH',
    agency: 'State Disaster Management Authority (SDMA) Flood Hydrograph',
    timestamp: new Date().toISOString(),
    epicenter: { lat: 13.04, lng: 80.24 },
    waterLevelRiseMeters: 2.1,
    flowRateCusecs: 48000,
    submergedRoads: ['Coastal Express Bypass', 'Old River Bridge Causeway', 'Canal Cross Arterial'],
    coastalEtaMinutes: 45,
    affectedSectors: ['Riverside Lowlands', 'Urban Canal Basin', 'East Coast Ring Road'],
    elevationHazardLimitMeters: 14,
    evacuationPriority: 'HORIZONTAL_INLAND_EVACUATION',
    instructions: 'Move to higher elevations immediately. Never walk or drive through moving water—15 cm of moving flood water can sweep away adults, and 30 cm can float vehicles.'
  },
  earthquake: {
    id: 'SCENARIO-QUAKE-04',
    type: 'EARTHQUAKE',
    name: 'Coastal Subduction 7.6M Seismological Rupture',
    severity: 'CRITICAL',
    agency: 'National Seismological Network / USGS',
    timestamp: new Date().toISOString(),
    epicenter: { lat: 12.92, lng: 81.15, depthKm: 14, magnitude: 7.6 },
    mmiIntensity: 'VIII - SEVERE',
    peakGroundAccelerationG: 0.44,
    aftershockProbabilityPercent: 88,
    affectedSectors: ['Old Town Masonry District', 'Harbour Port Docks', 'Industrial Petrochemical Corridor'],
    elevationHazardLimitMeters: 20,
    evacuationPriority: 'OPEN_AIR_DROP_COVER_HOLD',
    instructions: 'Drop, Cover, and Hold On during active shaking. Once shaking stops, evacuate compromised structures. Beware fallen electrical cables, gas ruptures, and secondary tsunami risks.'
  },
  normal: {
    id: 'SCENARIO-NORMAL-00',
    type: 'NORMAL',
    name: 'All Clear - Routine Oceanographic Monitoring',
    severity: 'LOW',
    agency: 'FloatChat AI Early Warning Automated Sentinel',
    timestamp: new Date().toISOString(),
    instructions: 'No active disaster triggers detected across ocean buoy sensor networks. Normal maritime advisory in effect.'
  }
};

// Initial Verified Shelters
const INITIAL_SHELTERS = [
  {
    id: 'SHELTER-01',
    name: 'St. Jude High-Elevation Safe Citadel',
    address: '44 Summit Ridge Road, North Sector',
    lat: 13.085,
    lng: 80.195,
    elevationMeters: 44,
    totalCapacity: 850,
    currentOccupancy: 540,
    structureRating: 'Tsunami & Earthquake Grade 9 Citadel',
    contactPhone: '+1-800-555-0101',
    distanceKm: 2.3,
    status: 'OPEN',
    facilities: {
      medicalClinic: true,
      potableWater: true,
      solarMicrogrid: true,
      dieselBackup: true,
      babyCare: true,
      wheelchairAccess: true,
      petFriendly: true,
      starlinkMeshUplink: true
    },
    supplies: {
      waterLiters: 8500,
      foodMeals: 3400,
      medicalKits: 140,
      blankets: 650
    }
  },
  {
    id: 'SHELTER-02',
    name: 'Naval Station Fort Coastal Bunker',
    address: 'Pier 12, Naval Defense Perimeter',
    lat: 13.065,
    lng: 80.225,
    elevationMeters: 28,
    totalCapacity: 1400,
    currentOccupancy: 1260, // 90% full!
    structureRating: 'Cat-5 Supercyclone Bunker & Helipad',
    contactPhone: '+1-800-555-0102',
    distanceKm: 1.4,
    status: 'NEAR_CAPACITY',
    facilities: {
      medicalClinic: true,
      potableWater: true,
      solarMicrogrid: true,
      dieselBackup: true,
      babyCare: false,
      wheelchairAccess: true,
      petFriendly: false,
      starlinkMeshUplink: true
    },
    supplies: {
      waterLiters: 1950, // CRITICAL SHORTAGE imminent!
      foodMeals: 1100,
      medicalKits: 28,
      blankets: 320
    }
  },
  {
    id: 'SHELTER-03',
    name: 'Hilltop Community Center & Polytech',
    address: '88 Highland Avenue, West Ward',
    lat: 13.098,
    lng: 80.175,
    elevationMeters: 58,
    totalCapacity: 650,
    currentOccupancy: 310,
    structureRating: 'Flood-Immune Reinforced Concrete Complex',
    contactPhone: '+1-800-555-0103',
    distanceKm: 3.8,
    status: 'OPEN',
    facilities: {
      medicalClinic: true,
      potableWater: true,
      solarMicrogrid: true,
      dieselBackup: true,
      babyCare: true,
      wheelchairAccess: true,
      petFriendly: true,
      starlinkMeshUplink: true
    },
    supplies: {
      waterLiters: 7800,
      foodMeals: 4200,
      medicalKits: 95,
      blankets: 700
    }
  },
  {
    id: 'SHELTER-04',
    name: 'Govt Model Higher Secondary Safe Haven',
    address: '12 Central Boulevard, Sector 4',
    lat: 13.045,
    lng: 80.210,
    elevationMeters: 34,
    totalCapacity: 900,
    currentOccupancy: 710,
    structureRating: 'State Engineered Emergency Evac Facility',
    contactPhone: '+1-800-555-0104',
    distanceKm: 2.9,
    status: 'OPEN',
    facilities: {
      medicalClinic: true,
      potableWater: true,
      solarMicrogrid: false,
      dieselBackup: true,
      babyCare: true,
      wheelchairAccess: true,
      petFriendly: false,
      starlinkMeshUplink: false
    },
    supplies: {
      waterLiters: 4100,
      foodMeals: 2200,
      medicalKits: 62,
      blankets: 480
    }
  }
];

// Initial Warehouses
const INITIAL_WAREHOUSES = [
  {
    id: 'WH-CENTRAL-01',
    name: 'Central Disaster Logistics Depot (Ridge North)',
    lat: 13.120,
    lng: 80.160,
    elevationMeters: 62,
    accessibleByRoad: true,
    inventory: {
      waterLiters: 65000,
      foodMeals: 28000,
      medicalKits: 650,
      antibioticsUnits: 1200,
      blankets: 4800,
      waterPurificationTabs: 50000,
      satelliteRadios: 120
    },
    availableTransport: [
      { id: 'TRK-01', type: 'Heavy Amphibious 6x6 Cargo Truck', capacityKg: 8000, status: 'AVAILABLE' },
      { id: 'TRK-02', type: 'All-Terrain High-Clearance 4x4', capacityKg: 4000, status: 'AVAILABLE' },
      { id: 'HEL-01', type: 'SAR Heavy-Lift Helicopter Puma-1', capacityKg: 2500, status: 'STANDBY' }
    ]
  },
  {
    id: 'WH-PORT-02',
    name: 'Port Sector Staging Warehouse Beta',
    lat: 13.055,
    lng: 80.245,
    elevationMeters: 16,
    accessibleByRoad: false, // Low elevation / coastal caution
    inventory: {
      waterLiters: 14000,
      foodMeals: 6200,
      medicalKits: 140,
      antibioticsUnits: 300,
      blankets: 1100,
      waterPurificationTabs: 12000,
      satelliteRadios: 25
    },
    availableTransport: [
      { id: 'BOAT-01', type: 'Twin-Hull Flood Rescue Cargo Vessel', capacityKg: 3500, status: 'AVAILABLE' }
    ]
  },
  {
    id: 'WH-WEST-03',
    name: 'West Ward Airfield Strategic Hub',
    lat: 13.078,
    lng: 80.140,
    elevationMeters: 52,
    accessibleByRoad: true,
    inventory: {
      waterLiters: 42000,
      foodMeals: 19500,
      medicalKits: 420,
      antibioticsUnits: 850,
      blankets: 3200,
      waterPurificationTabs: 35000,
      satelliteRadios: 90
    },
    availableTransport: [
      { id: 'TRK-03', type: 'All-Terrain Tactical Transporter', capacityKg: 6000, status: 'AVAILABLE' }
    ]
  }
];

// Initial SOS Incidents
const INITIAL_SOS_RECORDS = [
  {
    id: 'SOS-2026-9011',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    userName: 'Priya Sharma & Family',
    phone: '+91-98765-43210',
    lat: 13.042,
    lng: 80.231,
    elevationMeters: 6,
    emergencyType: 'RISING_WATER_FLOOD',
    peopleCount: { adults: 2, children: 2, elderly: 1, disabled: 0 },
    medicalNotes: 'Elderly diabetic with insulin requirement. Water at 1.4m and rising.',
    triageScore: 'CRITICAL_P1',
    status: 'IN_TRANSIT',
    assignedUnit: {
      id: 'SAR-BOAT-03',
      name: 'NDRF Swift-Water Rescue Vessel Alpha',
      callsign: 'RESCUE-EAGLE-3',
      responderCount: 4,
      lat: 13.048,
      lng: 80.226,
      distanceKm: 0.8,
      etaMinutes: 4
    },
    networkOrigin: 'BLE_MESH_RELAY',
    hopCount: 3,
    acknowledgedByGateway: true
  },
  {
    id: 'SOS-2026-9012',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    userName: 'Karthik Raman',
    phone: '+91-98401-23456',
    lat: 13.071,
    lng: 80.218,
    elevationMeters: 14,
    emergencyType: 'STRUCTURAL_COLLAPSE_TRAPPED',
    peopleCount: { adults: 3, children: 0, elderly: 0, disabled: 1 },
    medicalNotes: 'Leg fracture trapped under collapsed roof beam.',
    triageScore: 'CRITICAL_P1',
    status: 'DISPATCHED',
    assignedUnit: {
      id: 'SAR-MEDIC-01',
      name: 'Urban Search & Extrication Squad Delta',
      callsign: 'LIFE-SAVER-1',
      responderCount: 6,
      lat: 13.082,
      lng: 80.205,
      distanceKm: 1.8,
      etaMinutes: 9
    },
    networkOrigin: 'CELLULAR_ONLINE',
    hopCount: 0,
    acknowledgedByGateway: true
  },
  {
    id: 'SOS-2026-9013',
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    userName: 'Ananya & Ramesh',
    phone: '+91-97110-88223',
    lat: 13.059,
    lng: 80.238,
    elevationMeters: 8,
    emergencyType: 'LOST_STRANDED_NO_POWER',
    peopleCount: { adults: 2, children: 1, elderly: 0, disabled: 0 },
    medicalNotes: 'Cell tower down, phone battery 12%. Need route to safe shelter.',
    triageScore: 'HIGH_P2',
    status: 'QUEUED',
    assignedUnit: null,
    networkOrigin: 'WIFI_DIRECT_MESH',
    hopCount: 2,
    acknowledgedByGateway: true
  }
];

// Initial Family Check-Ins
const INITIAL_FAMILY_CHECKINS = [
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
];

// Active State in-memory
class DisasterStateStore {
  constructor() {
    this.activeScenarioKey = 'tsunami';
    this.activeScenario = { ...INITIAL_SCENARIOS.tsunami };
    this.shelters = JSON.parse(JSON.stringify(INITIAL_SHELTERS));
    this.warehouses = JSON.parse(JSON.stringify(INITIAL_WAREHOUSES));
    this.sosRecords = JSON.parse(JSON.stringify(INITIAL_SOS_RECORDS));
    this.familyCheckins = JSON.parse(JSON.stringify(INITIAL_FAMILY_CHECKINS));
    this.meshPackets = [];
    this.activeConvoys = [];
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DISASTER_DATA_FILE)) {
        const raw = fs.readFileSync(DISASTER_DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.activeScenario) this.activeScenario = parsed.activeScenario;
        if (parsed.activeScenarioKey) this.activeScenarioKey = parsed.activeScenarioKey;
        if (parsed.shelters) this.shelters = parsed.shelters;
        if (parsed.warehouses) this.warehouses = parsed.warehouses;
        if (parsed.sosRecords) this.sosRecords = parsed.sosRecords;
        if (parsed.familyCheckins) this.familyCheckins = parsed.familyCheckins;
        if (parsed.activeConvoys) this.activeConvoys = parsed.activeConvoys;
      }
    } catch (e) {
      console.warn('Could not load disaster state from disk, using defaults:', e.message);
    }
  }

  saveToDisk() {
    try {
      const dir = path.dirname(DISASTER_DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        DISASTER_DATA_FILE,
        JSON.stringify(
          {
            activeScenarioKey: this.activeScenarioKey,
            activeScenario: this.activeScenario,
            shelters: this.shelters,
            warehouses: this.warehouses,
            sosRecords: this.sosRecords,
            familyCheckins: this.familyCheckins,
            activeConvoys: this.activeConvoys
          },
          null,
          2
        )
      );
    } catch (e) {
      console.error('Error saving disaster state to disk:', e.message);
    }
  }

  setScenario(key) {
    if (INITIAL_SCENARIOS[key]) {
      this.activeScenarioKey = key;
      this.activeScenario = { ...INITIAL_SCENARIOS[key], timestamp: new Date().toISOString() };
      this.saveToDisk();
      return this.activeScenario;
    }
    throw new Error(`Scenario ${key} not recognized.`);
  }

  getScenario() {
    return this.activeScenario;
  }

  getAllScenarios() {
    return Object.keys(INITIAL_SCENARIOS).map(k => ({
      key: k,
      name: INITIAL_SCENARIOS[k].name,
      type: INITIAL_SCENARIOS[k].type,
      severity: INITIAL_SCENARIOS[k].severity
    }));
  }

  getShelters() {
    return this.shelters;
  }

  getWarehouses() {
    return this.warehouses;
  }

  getSOSRecords() {
    return this.sosRecords;
  }

  createSOS(data) {
    const adults = Number(data.peopleCount?.adults || 1);
    const children = Number(data.peopleCount?.children || 0);
    const elderly = Number(data.peopleCount?.elderly || 0);
    const disabled = Number(data.peopleCount?.disabled || 0);
    const totalPeople = adults + children + elderly + disabled;

    // AI Prioritization Algorithm
    let triageScore = 'MEDIUM_P3';
    const isWaterRising = data.emergencyType === 'RISING_WATER_FLOOD';
    const isTrapped = data.emergencyType === 'STRUCTURAL_COLLAPSE_TRAPPED';
    const hasVulnerable = children > 0 || elderly > 0 || disabled > 0;
    const hasSevereMed = data.medicalNotes && data.medicalNotes.length > 5;

    if (isWaterRising || isTrapped || (hasVulnerable && hasSevereMed)) {
      triageScore = 'CRITICAL_P1';
    } else if (hasVulnerable || hasSevereMed || totalPeople >= 4) {
      triageScore = 'HIGH_P2';
    }

    // Auto-assign appropriate SAR unit based on emergency type
    const assignedUnit = (isWaterRising || data.lat < 13.06) ? {
      id: 'SAR-BOAT-03',
      name: 'NDRF Swift-Water Rescue Vessel Alpha',
      callsign: 'RESCUE-EAGLE-3',
      type: 'RAPID_SURFACE_VESSEL',
      responderCount: 4,
      equipment: '4x Paramedic Divers, Defibrillator, Inflatable Rafts',
      lat: Number((data.lat + 0.012).toFixed(4)),
      lng: Number((data.lng - 0.008).toFixed(4)),
      distanceKm: 1.2,
      distanceMeters: 1200,
      etaMinutes: 6,
      dispatchedAt: new Date().toISOString()
    } : {
      id: 'SAR-MEDIC-01',
      name: 'Urban Search & Extrication Squad Delta',
      callsign: 'LIFE-SAVER-1',
      type: 'AMBULANCE_RESCUE',
      responderCount: 6,
      equipment: 'Hydraulic Jaws of Life, Trauma Kit, Oxygen',
      lat: Number((data.lat + 0.015).toFixed(4)),
      lng: Number((data.lng + 0.005).toFixed(4)),
      distanceKm: 1.8,
      distanceMeters: 1800,
      etaMinutes: 9,
      dispatchedAt: new Date().toISOString()
    };

    const newSos = {
      id: `SOS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      userName: data.userName || 'Emergency Citizen',
      phone: data.phone || 'Unknown Phone',
      lat: Number(data.lat || 13.05 + (Math.random() * 0.04 - 0.02)),
      lng: Number(data.lng || 80.22 + (Math.random() * 0.04 - 0.02)),
      elevationMeters: Number(data.elevationMeters || 12),
      emergencyType: data.emergencyType || 'GENERAL_EMERGENCY',
      peopleCount: { adults, children, elderly, disabled, total: totalPeople },
      medicalNotes: data.medicalNotes || 'None specified',
      triageScore,
      status: 'DISPATCHED',
      assignedUnit,
      networkOrigin: data.networkOrigin || 'ONLINE',
      hopCount: data.hopCount || 0,
      acknowledgedByGateway: true,
      gatewayReceiptId: `ACK-GW-${Date.now().toString(36).toUpperCase()}`
    };

    this.sosRecords.unshift(newSos);
    this.saveToDisk();
    return newSos;
  }

  updateSOSStatus(id, status, assignedUnitData) {
    const item = this.sosRecords.find(s => s.id === id);
    if (!item) return null;
    item.status = status;
    if (assignedUnitData) {
      item.assignedUnit = {
        ...assignedUnitData,
        updatedAt: new Date().toISOString()
      };
    }
    this.saveToDisk();
    return item;
  }

  // AI Resource Optimizer & Reallocation Algorithm
  computeResourceOptimization() {
    const recommendations = [];
    const shelterShortages = [];

    this.shelters.forEach(shelter => {
      const occ = shelter.currentOccupancy;
      // Consumption benchmarks:
      // Water: ~3.0 L/person/day -> 0.125 L/person/hour
      // Meals: ~3.0 packs/person/day -> 0.125 packs/person/hour
      const hourlyWaterRate = Math.max(10, Math.round(occ * 0.125));
      const hourlyMealsRate = Math.max(10, Math.round(occ * 0.125));

      const waterHoursLeft = shelter.supplies.waterLiters / (hourlyWaterRate || 1);
      const foodHoursLeft = shelter.supplies.foodMeals / (hourlyMealsRate || 1);
      const isCapacityCritical = (occ / shelter.totalCapacity) > 0.85;

      const shortages = [];
      if (waterHoursLeft < 24) {
        shortages.push({
          type: 'POTABLE_WATER',
          hoursLeft: parseFloat(waterHoursLeft.toFixed(1)),
          deficitLiters: Math.max(2000, Math.round((24 - waterHoursLeft) * hourlyWaterRate)),
          severity: waterHoursLeft < 10 ? 'CRITICAL' : 'WARNING'
        });
      }

      if (foodHoursLeft < 24) {
        shortages.push({
          type: 'FOOD_MEALS',
          hoursLeft: parseFloat(foodHoursLeft.toFixed(1)),
          deficitMeals: Math.max(800, Math.round((24 - foodHoursLeft) * hourlyMealsRate)),
          severity: foodHoursLeft < 12 ? 'CRITICAL' : 'WARNING'
        });
      }

      if (shelter.supplies.medicalKits < 40) {
        shortages.push({
          type: 'TRAUMA_KITS',
          currentCount: shelter.supplies.medicalKits,
          deficitKits: 60,
          severity: 'HIGH'
        });
      }

      if (shortages.length > 0 || isCapacityCritical) {
        shelterShortages.push({
          shelterId: shelter.id,
          shelterName: shelter.name,
          occupancy: occ,
          capacity: shelter.totalCapacity,
          occupancyPercentage: Math.round((occ / shelter.totalCapacity) * 100),
          shortages
        });
      }
    });

    // Match Shortages with Surplus Warehouses (prefer road-accessible, highest elevation)
    shelterShortages.forEach(item => {
      item.shortages.forEach(sh => {
        // Find best warehouse
        const bestWarehouse = this.warehouses
          .filter(wh => wh.accessibleByRoad)
          .sort((a, b) => (b.inventory.waterLiters || 0) - (a.inventory.waterLiters || 0))[0];

        if (bestWarehouse) {
          const recId = `REC-OPT-${Math.floor(1000 + Math.random() * 9000)}`;
          let itemsToTransfer = {};
          if (sh.type === 'POTABLE_WATER') {
            itemsToTransfer = { waterLiters: sh.deficitLiters || 3000 };
          } else if (sh.type === 'FOOD_MEALS') {
            itemsToTransfer = { foodMeals: sh.deficitMeals || 1200 };
          } else if (sh.type === 'TRAUMA_KITS') {
            itemsToTransfer = { medicalKits: sh.deficitKits || 50, antibioticsUnits: 100 };
          }

          recommendations.push({
            id: recId,
            targetShelterId: item.shelterId,
            targetShelterName: item.shelterName,
            sourceWarehouseId: bestWarehouse.id,
            sourceWarehouseName: bestWarehouse.name,
            reason: `${sh.type.replace('_', ' ')} critical shortage (${sh.hoursLeft ? sh.hoursLeft + ' hrs left' : 'stock exhausted'})`,
            urgency: sh.severity === 'CRITICAL' ? 'IMMEDIATE' : 'SCHEDULED',
            itemsToTransfer,
            suggestedVehicle: bestWarehouse.availableTransport[0]?.type || 'Heavy Amphibious 6x6 Cargo Truck',
            routeSafetyScore: 94,
            avoidRoads: ['Coastal Highway Strip (Surge Zone)'],
            safeCorridor: 'North Ridge Bypass -> High Ground Radial 4',
            estimatedTravelTimeMins: 22
          });
        }
      });
    });

    return {
      timestamp: new Date().toISOString(),
      shelterShortages,
      recommendations,
      activeConvoys: this.activeConvoys
    };
  }

  dispatchConvoy(recommendationId) {
    const optimization = this.computeResourceOptimization();
    const rec = optimization.recommendations.find(r => r.id === recommendationId);
    if (!rec) {
      throw new Error(`Recommendation ${recommendationId} not found.`);
    }

    const convoyId = `CONVOY-${Math.floor(1000 + Math.random() * 9000)}`;
    const newConvoy = {
      convoyId,
      dispatchedAt: new Date().toISOString(),
      etaMinutes: rec.estimatedTravelTimeMins,
      sourceWarehouseName: rec.sourceWarehouseName,
      targetShelterName: rec.targetShelterName,
      targetShelterId: rec.targetShelterId,
      vehicle: rec.suggestedVehicle,
      cargo: rec.itemsToTransfer,
      route: rec.safeCorridor,
      status: 'IN_TRANSIT'
    };

    // Update target shelter supplies immediately for simulation responsiveness
    const targetShelter = this.shelters.find(s => s.id === rec.targetShelterId);
    if (targetShelter) {
      if (rec.itemsToTransfer.waterLiters) targetShelter.supplies.waterLiters += rec.itemsToTransfer.waterLiters;
      if (rec.itemsToTransfer.foodMeals) targetShelter.supplies.foodMeals += rec.itemsToTransfer.foodMeals;
      if (rec.itemsToTransfer.medicalKits) targetShelter.supplies.medicalKits += rec.itemsToTransfer.medicalKits;
    }

    this.activeConvoys.unshift(newConvoy);
    this.saveToDisk();
    return newConvoy;
  }

  // Family Safety Registry
  createFamilyCheckIn(data) {
    const newCheckin = {
      id: `CHK-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      phone: data.phone,
      fullName: data.fullName,
      status: data.status || 'SAFE',
      currentLocationName: data.currentLocationName || 'Disaster Safe Sector',
      shelterId: data.shelterId || null,
      lat: Number(data.lat || 13.08),
      lng: Number(data.lng || 80.20),
      batteryPercent: Number(data.batteryPercent || 85),
      message: data.message || "I'm safe and accounted for.",
      viaMesh: Boolean(data.viaMesh)
    };

    this.familyCheckins.unshift(newCheckin);
    this.saveToDisk();
    return newCheckin;
  }

  searchFamilyCheckIns(query) {
    if (!query) return this.familyCheckins;
    const q = query.toLowerCase().trim();
    return this.familyCheckins.filter(
      item =>
        item.phone.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q) ||
        (item.currentLocationName && item.currentLocationName.toLowerCase().includes(q))
    );
  }

  // Mesh Gateway Ingestion & Ack Generation
  processMeshPacket(packet) {
    const receipt = {
      ackId: `ACK-${Math.floor(100000 + Math.random() * 900000)}`,
      packetId: packet.packetId || packet.id,
      timestamp: new Date().toISOString(),
      receivedByGateway: 'GATEWAY-COASTGUARD-SATLINK-01',
      status: 'ACKNOWLEDGED',
      signature: `SIG-RSA4096-GATEWAY-${Date.now().toString(36).toUpperCase()}`
    };

    if (packet.type === 'SOS_ALERT' && packet.payload) {
      this.createSOS({
        ...packet.payload,
        networkOrigin: 'OFFLINE_MESH_P2P',
        hopCount: packet.hops || 1
      });
    } else if (packet.type === 'FAMILY_CHECKIN' && packet.payload) {
      this.createFamilyCheckIn({
        ...packet.payload,
        viaMesh: true
      });
    }

    this.meshPackets.unshift({ ...packet, receipt });
    if (this.meshPackets.length > 200) this.meshPackets.pop();

    return receipt;
  }
}

export const disasterStore = new DisasterStateStore();
