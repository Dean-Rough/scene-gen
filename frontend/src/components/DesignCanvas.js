import React, { useState, useRef } from 'react';

const DesignCanvas = ({ 
  floorplanUrl, 
  selectedAsset, 
  sceneElements, 
  onElementPlace,
  onElementMove 
}) => {
  const canvasRef = useRef();
  const [canvasDimensions] = useState({ width: 800, height: 600 });

  const handleCanvasClick = (e) => {
    if (!selectedAsset) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onElementPlace({
      assetId: selectedAsset.id,
      positionX: x,
      positionY: y,
      rotationZ: 0,
      scaleX: 1,
      scaleY: 1
    });
  };

  return (
    <div className="design-canvas">
      <div className="canvas-container" style={{ 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        position: 'relative',
        width: canvasDimensions.width,
        height: canvasDimensions.height,
        overflow: 'hidden',
        cursor: selectedAsset ? 'crosshair' : 'default'
      }}>
        {/* Background floorplan */}
        {floorplanUrl && (
          <img
            src={floorplanUrl}
            alt="Floorplan"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none'
            }}
          />
        )}
        
        {/* Click overlay */}
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        />
        
        {/* Placed scene elements */}
        {sceneElements.map((element) => (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: element.position_x - 30,
              top: element.position_y - 30,
              width: '60px',
              height: '60px',
              zIndex: 2,
              cursor: 'move'
            }}
          >
            <img
              src={element.asset_image_url}
              alt="Asset"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '2px solid #007bff',
                borderRadius: '4px'
              }}
            />
          </div>
        ))}
      </div>
      
      <div className="canvas-controls" style={{ 
        marginTop: '10px', 
        padding: '10px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px' 
      }}>
        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
          {selectedAsset 
            ? `Click on the canvas to place: ${selectedAsset.type}` 
            : 'Select an asset from the library to place it on the canvas'
          }
        </p>
        {sceneElements.length > 0 && (
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
            Assets placed: {sceneElements.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default DesignCanvas;