import React, { useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva';
import useImage from 'use-image';

// Component for background floorplan image
const FloorplanImage = ({ src }) => {
  const [image] = useImage(src);
  return image ? <KonvaImage image={image} width={800} height={600} listening={false} /> : null;
};

// Component for asset elements with drag, scale, rotate capabilities
const AssetElement = ({ element, isSelected, onSelect, onTransform }) => {
  const [image] = useImage(element.asset_image_url);
  const elementRef = useRef();
  const transformerRef = useRef();

  React.useEffect(() => {
    if (isSelected && transformerRef.current && elementRef.current) {
      transformerRef.current.nodes([elementRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    const node = e.target;
    onTransform(element.id, {
      positionX: node.x(),
      positionY: node.y(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: node.rotation()
    });
  };

  const handleTransformEnd = () => {
    const node = elementRef.current;
    if (node) {
      onTransform(element.id, {
        positionX: node.x(),
        positionY: node.y(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
        rotation: node.rotation()
      });
    }
  };

  return (
    <>
      {image && (
        <KonvaImage
          ref={elementRef}
          image={image}
          x={element.position_x || 50}
          y={element.position_y || 50}
          width={80}
          height={80}
          scaleX={element.scale_x || 1}
          scaleY={element.scale_y || 1}
          rotation={element.rotation_z || 0}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        />
      )}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const DesignCanvas = ({ 
  floorplanUrl, 
  selectedAsset, 
  sceneElements, 
  onElementPlace,
  onElementMove,
  onElementDelete 
}) => {
  const stageRef = useRef();
  const [canvasDimensions] = useState({ width: 800, height: 600 });
  const [selectedElementId, setSelectedElementId] = useState(null);

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      if (selectedAsset) {
        // Place new asset
        const pos = e.target.getStage().getPointerPosition();
        onElementPlace({
          assetId: selectedAsset.id,
          positionX: pos.x,
          positionY: pos.y,
          rotationZ: 0,
          scaleX: 1,
          scaleY: 1
        });
      } else {
        // Deselect any selected element
        setSelectedElementId(null);
      }
    }
  };

  const handleElementSelect = (elementId) => {
    setSelectedElementId(elementId);
  };

  const handleElementTransform = (elementId, transformData) => {
    // Update element in real-time for smooth UX
    onElementMove(elementId, transformData);
  };

  const handleDeleteElement = () => {
    if (selectedElementId && onElementDelete) {
      onElementDelete(selectedElementId);
      setSelectedElementId(null);
    }
  };

  // Keyboard event handling
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedElementId) {
        handleDeleteElement();
      } else if (e.key === 'Escape') {
        setSelectedElementId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId]);

  return (
    <div className="design-canvas">
      <div className="canvas-container" style={{ 
        border: '2px solid #007bff', 
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa'
      }}>
        <Stage
          ref={stageRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* Background floorplan */}
            {floorplanUrl && <FloorplanImage src={floorplanUrl} />}
            
            {/* Grid background when no floorplan */}
            {!floorplanUrl && (
              <>
                {Array.from({ length: Math.ceil(canvasDimensions.width / 50) }, (_, i) => (
                  <Text
                    key={`grid-v-${i}`}
                    x={i * 50}
                    y={0}
                    width={1}
                    height={canvasDimensions.height}
                    fill="#e0e0e0"
                  />
                ))}
                {Array.from({ length: Math.ceil(canvasDimensions.height / 50) }, (_, i) => (
                  <Text
                    key={`grid-h-${i}`}
                    x={0}
                    y={i * 50}
                    width={canvasDimensions.width}
                    height={1}
                    fill="#e0e0e0"
                  />
                ))}
              </>
            )}
            
            {/* Placed scene elements */}
            {sceneElements.map((element) => (
              <AssetElement
                key={element.id}
                element={element}
                isSelected={selectedElementId === element.id}
                onSelect={() => handleElementSelect(element.id)}
                onTransform={handleElementTransform}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      
      <div className="canvas-controls" style={{ 
        marginTop: '15px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0', fontSize: '14px', color: '#495057', fontWeight: '500' }}>
              {selectedAsset 
                ? `🎯 Click to place: ${selectedAsset.type}` 
                : '📚 Select an asset from the library to place it'
              }
            </p>
            {sceneElements.length > 0 && (
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
                📍 Assets placed: {sceneElements.length} | {selectedElementId ? '✏️ Selected - drag, scale, rotate, or press Delete' : '👆 Click elements to select'}
              </p>
            )}
          </div>
          {selectedElementId && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleDeleteElement}
                style={{
                  padding: '5px 10px',
                  fontSize: '12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => setSelectedElementId(null)}
                style={{
                  padding: '5px 10px',
                  fontSize: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Deselect
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignCanvas;