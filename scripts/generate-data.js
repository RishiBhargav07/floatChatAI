import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUOYS = [
  { id: 'FC-PAC-01', name: 'Pacific Deep-Shift', lat: 14.599, lng: -140.211, baseDepth: 1200, baseTemp: 4.5, baseSalinity: 34.6 },
  { id: 'FC-ATL-02', name: 'Atlantic Trench-Link', lat: 23.412, lng: -65.122, baseDepth: 2500, baseTemp: 2.1, baseSalinity: 34.9 },
  { id: 'FC-IND-03', name: 'Indian Current-Buoy', lat: -8.125, lng: 88.544, baseDepth: 150, baseTemp: 22.8, baseSalinity: 35.2 },
  { id: 'FC-ARC-04', name: 'Arctic Drift-Beacon', lat: 78.910, lng: 15.120, baseDepth: 450, baseTemp: -0.8, baseSalinity: 33.1 }
];

function generateData() {
  const records = [];
  const now = new Date();
  
  // Generate 30 days of data, two readings per day (00:00 and 12:00)
  for (let d = 30; d >= 0; d--) {
    for (let h = 0; h < 24; h += 12) {
      const timestamp = new Date(now.getTime() - d * 24 * 60 * 60 * 1000 + h * 60 * 60 * 1000);
      const timestampStr = timestamp.toISOString();

      BUOYS.forEach(buoy => {
        // Add some random variation based on date and time
        const dayFactor = Math.sin(d / 5);
        const timeFactor = Math.cos(h / 12);
        
        // Compute realistic physics: deeper = colder, higher pressure, lower oxygen (minimum at oxygen minimum zone)
        const depthVar = buoy.baseDepth + (Math.sin(d) * 10);
        // Pressure increases by ~1 dbar per meter of depth
        const pressure = parseFloat((depthVar * 1.005 + (dayFactor * 2)).toFixed(1));
        
        // Temperature fluctuations (surface has high fluctuation, deep ocean is very stable near 2C)
        let temp = buoy.baseTemp;
        if (buoy.baseDepth < 500) {
          temp += (dayFactor * 2.5) + (timeFactor * 0.8);
        } else {
          temp += (dayFactor * 0.15);
        }
        temp = parseFloat(temp.toFixed(2));

        // Salinity fluctuations
        const salinity = parseFloat((buoy.baseSalinity + (dayFactor * 0.15) + (timeFactor * 0.05)).toFixed(2));

        // Oxygen: surface has high O2 (8-11 mg/L), deep has low (2-5 mg/L), intermediate has oxygen minimum zone
        let oxygen = 7.5;
        if (depthVar < 200) {
          oxygen = 8.5 + (dayFactor * 0.8);
        } else if (depthVar >= 200 && depthVar < 1000) {
          oxygen = 3.2 + (dayFactor * 0.4);
        } else {
          oxygen = 5.1 + (dayFactor * 0.25);
        }
        oxygen = parseFloat(oxygen.toFixed(2));

        // PH: ocean is slightly alkaline, average 8.1
        const ph = parseFloat((8.1 + (dayFactor * 0.05) + (timeFactor * 0.02)).toFixed(2));

        // Battery levels decline slowly, but simulate solar recharge for shallow buoys during daylight
        let battery = 100 - (d * 0.8);
        if (buoy.baseDepth < 500 && h === 12) {
          battery += 2.0; // partial Solar charging at noon
        }
        battery = Math.min(100, Math.max(5, parseFloat(battery.toFixed(1))));

        // Inject realistic oceanographic anomalies at specific timesteps
        if (d === 10 && buoy.id === 'FC-PAC-01') {
          oxygen = 2.4; // Critical Hypoxia anomaly
        }
        if (d === 5 && buoy.id === 'FC-ARC-04') {
          battery = 14.5; // Battery exhaustion anomaly
        }
        if (d === 18 && buoy.id === 'FC-ATL-02') {
          temp = 18.2; // Thermal inversion anomaly at 2500m depth
        }

        records.push({
          timestamp: timestampStr,
          buoyId: buoy.id,
          buoyName: buoy.name,
          latitude: buoy.lat,
          longitude: buoy.lng,
          depth: parseFloat(depthVar.toFixed(1)),
          temperature: temp,
          pressure: pressure,
          salinity: salinity,
          oxygenContent: oxygen,
          ph: ph,
          batteryLevel: battery
        });
      });
    }
  }

  // Create directories if they don't exist
  const backendDataDir = path.join(__dirname, '..', 'backend', 'data');
  const frontendPublicDir = path.join(__dirname, '..', 'frontend', 'public');
  
  if (!fs.existsSync(backendDataDir)) {
    fs.mkdirSync(backendDataDir, { recursive: true });
  }
  if (!fs.existsSync(frontendPublicDir)) {
    fs.mkdirSync(frontendPublicDir, { recursive: true });
  }

  // Save JSON formats
  fs.writeFileSync(path.join(backendDataDir, 'telemetry.json'), JSON.stringify(records, null, 2));
  fs.writeFileSync(path.join(frontendPublicDir, 'ocean_telemetry_sample.json'), JSON.stringify(records, null, 2));

  // Save CSV formats
  const headers = ['timestamp', 'buoyId', 'buoyName', 'latitude', 'longitude', 'depth', 'temperature', 'pressure', 'salinity', 'oxygenContent', 'ph', 'batteryLevel'];
  const csvRows = [headers.join(',')];
  
  records.forEach(r => {
    const row = headers.map(header => {
      let val = r[header];
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`;
      }
      return val;
    });
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  fs.writeFileSync(path.join(backendDataDir, 'telemetry.csv'), csvContent);
  fs.writeFileSync(path.join(frontendPublicDir, 'ocean_telemetry_sample.csv'), csvContent);

  console.log(`Successfully generated telemetry data:`);
  console.log(`- Created ${records.length} records across 4 buoys`);
  console.log(`- Saved JSON and CSV to backend/data/`);
  console.log(`- Saved JSON and CSV to frontend/public/`);
}

generateData();
