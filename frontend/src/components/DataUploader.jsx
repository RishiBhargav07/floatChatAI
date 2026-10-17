import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';

export default function DataUploader({ onUploadSuccess, isMongoConnected }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState({ status: 'idle', message: '', count: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'csv' && fileExt !== 'json') {
      setUploadState({
        status: 'error',
        message: 'Unsupported file format! Please upload a valid .csv or .json file.',
        count: 0
      });
      return;
    }

    setIsUploading(true);
    setUploadState({ status: 'uploading', message: 'Parsing and transferring telemetry data...', count: 0 });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadState({
          status: 'success',
          message: result.message || `Telemetry uploaded successfully!`,
          count: result.count
        });
        // Notify parent to refetch telemetry
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setUploadState({
          status: 'error',
          message: result.error || 'Failed to parse the uploaded file.',
          count: 0
        });
      }
    } catch (error) {
      console.error('Upload request failed:', error);
      setUploadState({
        status: 'error',
        message: 'Network error occurred during file upload. Make sure backend is running.',
        count: 0
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Title */}
      <div>
        <h2 className="glow-text gradient-text" style={{ fontSize: '24px', fontWeight: '800' }}>Telemetry Ingestion Portal</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Upload data packets collected from float beacons. Supports formatted CSV and JSON sheets.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '25px' }}>
        
        {/* Drag Drop Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div 
            className={`glass-panel upload-container ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              accept=".csv,.json"
            />
            
            <div className="upload-icon">
              {isUploading ? (
                <RefreshCw className="spinner" size={40} />
              ) : (
                <UploadCloud size={40} />
              )}
            </div>

            <p className="upload-text">
              {isUploading ? 'Ingesting telemetry records...' : 'Drag & Drop your telemetry file here'}
            </p>
            <p className="upload-subtext">
              or <span style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'underline' }}>browse files</span> on your computer (CSV or JSON)
            </p>
          </div>

          {/* Status Alert Panels */}
          {uploadState.status === 'success' && (
            <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid var(--color-success)', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <CheckCircle color="var(--color-success)" size={24} />
              <div>
                <h4 style={{ color: 'white', fontSize: '14px' }}>Upload Successful</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Loaded <strong>{uploadState.count}</strong> telemetry measurements. Dashboard visuals have been refreshed.
                </p>
              </div>
            </div>
          )}

          {uploadState.status === 'error' && (
            <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid var(--color-danger)', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <AlertTriangle color="var(--color-danger)" size={24} />
              <div>
                <h4 style={{ color: 'white', fontSize: '14px' }}>Upload Failed</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{uploadState.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Templates Downloads & Instructions */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="chart-title">Data Specifications</h3>
          
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '12px' }}>
              To ensure proper visual analysis, uploaded sheets must contain standard parameters for each reading:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><code>timestamp</code>: ISO-8601 UTC date string.</li>
              <li><code>buoyId</code>: Unique identifier (e.g. FC-PAC-01).</li>
              <li><code>temperature</code>: Numerical Celsius values.</li>
              <li><code>depth</code>: Sensor depth in meters.</li>
              <li><code>pressure</code>: Hydrostatic pressure in dbar.</li>
              <li><code>salinity</code>: Water salinity in PSU.</li>
              <li><code>oxygenContent</code>: Dissolved oxygen in mg/L.</li>
            </ul>
          </div>

          <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>Download Sample Telemetry Templates:</h4>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <a 
                href="/ocean_telemetry_sample.csv" 
                download="ocean_telemetry_sample.csv"
                style={{ textDecoration: 'none', flexGrow: '1' }}
              >
                <button className="btn-secondary" style={{ width: '100%', fontSize: '12px', padding: '8px 12px', justifyContent: 'center' }}>
                  <FileSpreadsheet size={16} color="var(--color-success)" />
                  <span>Sample CSV</span>
                  <Download size={12} />
                </button>
              </a>

              <a 
                href="/ocean_telemetry_sample.json" 
                download="ocean_telemetry_sample.json"
                style={{ textDecoration: 'none', flexGrow: '1' }}
              >
                <button className="btn-secondary" style={{ width: '100%', fontSize: '12px', padding: '8px 12px', justifyContent: 'center' }}>
                  <UploadCloud size={16} color="var(--color-primary)" />
                  <span>Sample JSON</span>
                  <Download size={12} />
                </button>
              </a>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '5px' }}>
              Download one of these, change the values, and upload it back to see real-time chart rendering updates.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
