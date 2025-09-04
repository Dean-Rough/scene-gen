import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);

  const handleRender = async () => {
    setIsLoading(true);
    setError(null);
    setImageUrl('');

    // This is a mock of the data that would be collected from the UI
    const designData = {
      projectId: "proj_123",
      floorplan: "image_id_floorplan.jpg",
      assets: [
        {
          assetId: "asset_sofa_456",
          imageId: "image_id_sofa.jpg",
          position: { x: 150, y: 200 },
          rotation: 90,
          material: "Cognac Leather"
        }
      ],
      camera: { angle: "eye-level", direction": "north" },
      style: "Modern, Scandinavian"
    };

    try {
      const response = await axios.post('/api/render', designData);
      setImageUrl(response.data.imageUrl);
    } catch (err) {
      setError('Failed to generate render. Please check the console.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Scene-Gen</h1>
        <p>Interactive Design Canvas</p>
      </header>
      <main>
        <div className="controls">
          {/* In a real app, the design canvas would be here */}
          <p>This is a placeholder for the interactive design canvas.</p>
          <button onClick={handleRender} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate High-Res Render'}
          </button>
        </div>
        <div className="results">
          {error && <p className="error">{error}</p>}
          {isLoading && <div className="spinner"></div>}
          {imageUrl && (
            <div className="image-container">
              <h2>Render Result:</h2>
              <img src={imageUrl} alt="AI-generated interior design" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
