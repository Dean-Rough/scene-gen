import React, { useState } from 'react';

const AssetLibrary = ({ assets, onAssetSelect, selectedAsset, onAssetUpload }) => {
  const [uploadType, setUploadType] = useState('furniture');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // In a real implementation, you would upload to cloud storage
    // For now, we'll create a local URL for demo purposes
    const imageUrl = URL.createObjectURL(file);
    
    const newAsset = {
      type: uploadType,
      imageUrl: imageUrl,
      name: file.name,
      attributes: {}
    };

    onAssetUpload(newAsset);
    
    // Reset the file input
    event.target.value = '';
  };

  const assetTypes = ['floorplan', 'furniture', 'decoration', 'material'];

  return (
    <div className="asset-library" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 15px 0' }}>Asset Library</h3>
      
      {/* Upload Section */}
      <div className="upload-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '10px' }}>
            Asset Type:
          </label>
          <select 
            value={uploadType} 
            onChange={(e) => setUploadType(e.target.value)}
            style={{ padding: '5px', marginRight: '10px' }}
          >
            {assetTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ marginBottom: '5px' }}
        />
        <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
          Upload images for floorplans, furniture, or decorations
        </p>
      </div>

      {/* Assets Grid */}
      <div className="assets-grid">
        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Assets ({assets.length})</h4>
        
        {assets.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'italic', margin: '10px 0' }}>
            No assets uploaded yet. Upload some images to get started!
          </p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
            gap: '10px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {assets.map((asset) => (
              <div
                key={asset.id || asset.imageUrl}
                className={`asset-thumbnail ${selectedAsset?.id === asset.id ? 'selected' : ''}`}
                onClick={() => onAssetSelect(asset)}
                style={{
                  border: selectedAsset?.id === asset.id ? '3px solid #007bff' : '2px solid #ddd',
                  borderRadius: '4px',
                  padding: '5px',
                  cursor: 'pointer',
                  backgroundColor: selectedAsset?.id === asset.id ? '#e7f3ff' : 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <img
                  src={asset.image_url || asset.imageUrl}
                  alt={asset.name || asset.type}
                  style={{
                    width: '100%',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '2px'
                  }}
                />
                <div style={{ 
                  fontSize: '11px', 
                  marginTop: '5px', 
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {asset.type}
                  </div>
                  {asset.name && (
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>
                      {asset.name.length > 12 ? asset.name.substring(0, 12) + '...' : asset.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAsset && (
        <div className="selected-asset-info" style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#e7f3ff', 
          borderRadius: '4px',
          border: '1px solid #007bff'
        }}>
          <h5 style={{ margin: '0 0 5px 0', color: '#007bff' }}>Selected Asset:</h5>
          <p style={{ margin: '0', fontSize: '14px' }}>
            <strong>Type:</strong> {selectedAsset.type} <br />
            {selectedAsset.name && <span><strong>Name:</strong> {selectedAsset.name}</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssetLibrary;