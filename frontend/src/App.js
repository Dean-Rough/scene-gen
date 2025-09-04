import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DesignCanvas from './components/DesignCanvas';
import AssetLibrary from './components/AssetLibrary';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);
  
  // Project and asset state
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [sceneElements, setSceneElements] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [floorplanUrl, setFloorplanUrl] = useState('');

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
      
      // If no projects exist, create a default one
      if (response.data.length === 0) {
        await createProject('My First Scene');
      } else {
        // Load the first project
        loadProject(response.data[0].id);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const createProject = async (name) => {
    try {
      const response = await axios.post('/api/projects', { name });
      const newProject = response.data;
      setProjects([newProject, ...projects]);
      setCurrentProject(newProject);
      setAssets([]);
      setSceneElements([]);
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project');
    }
  };

  const loadProject = async (projectId) => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      const project = response.data;
      setCurrentProject(project);
      setAssets(project.assets || []);
      setSceneElements(project.sceneElements || []);
      
      // Set floorplan if available
      const floorplan = project.assets.find(asset => asset.type === 'floorplan');
      setFloorplanUrl(floorplan ? floorplan.image_url : '');
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project');
    }
  };

  const handleAssetUpload = async (newAsset) => {
    if (!currentProject) return;

    try {
      const response = await axios.post(`/api/projects/${currentProject.id}/assets`, {
        type: newAsset.type,
        imageUrl: newAsset.imageUrl,
        attributes: newAsset.attributes || {}
      });
      
      const uploadedAsset = response.data;
      setAssets([...assets, uploadedAsset]);
      
      // If it's a floorplan, set it as the background
      if (newAsset.type === 'floorplan') {
        setFloorplanUrl(newAsset.imageUrl);
      }
    } catch (err) {
      console.error('Error uploading asset:', err);
      setError('Failed to upload asset');
    }
  };

  const handleElementPlace = async (elementData) => {
    if (!currentProject) return;

    try {
      const response = await axios.post(`/api/projects/${currentProject.id}/scene-elements`, elementData);
      const newElement = response.data;
      
      // Add asset info for rendering
      const asset = assets.find(a => a.id === elementData.assetId);
      const elementWithAsset = {
        ...newElement,
        asset_image_url: asset?.image_url,
        asset_type: asset?.type
      };
      
      setSceneElements([...sceneElements, elementWithAsset]);
    } catch (err) {
      console.error('Error placing element:', err);
      setError('Failed to place element');
    }
  };

  const handleElementMove = (elementId, newPosition) => {
    // Update local state immediately for smooth UX
    setSceneElements(elements => 
      elements.map(el => 
        el.id === elementId 
          ? { ...el, position_x: newPosition.positionX, position_y: newPosition.positionY }
          : el
      )
    );
    
    // TODO: Debounce API call to update position in backend
  };

  const handleRender = async () => {
    if (!currentProject) {
      setError('Please create a project first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl('');

    const designData = {
      projectId: currentProject.id,
      floorplan: floorplanUrl,
      assets: sceneElements.map(element => ({
        assetId: element.asset_id,
        imageUrl: element.asset_image_url,
        position: { x: element.position_x, y: element.position_y },
        rotation: element.rotation_z,
        scale: { x: element.scale_x, y: element.scale_y }
      })),
      camera: { angle: "eye-level", direction: "north" },
      style: "Photorealistic, Modern"
    };

    try {
      const response = await axios.post('/api/render', designData);
      // Handle both old format (just imageUrl) and new format (full AI response)
      if (response.data.success) {
        setImageUrl(response.data); // Store the full AI response
      } else {
        setImageUrl(response.data.imageUrl); // Fallback to old format
      }
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
        <p>AI-Powered Interior Design Visualizer</p>
        {currentProject && (
          <div className="project-info">
            <strong>Current Project:</strong> {currentProject.name}
          </div>
        )}
      </header>
      
      <main>
        <div className="workspace" style={{ display: 'flex', gap: '20px', padding: '20px' }}>
          {/* Left Panel - Asset Library */}
          <div className="left-panel" style={{ flex: '0 0 300px' }}>
            <AssetLibrary
              assets={assets}
              onAssetSelect={setSelectedAsset}
              selectedAsset={selectedAsset}
              onAssetUpload={handleAssetUpload}
            />
            
            <div className="project-controls" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h4>Project Controls</h4>
              <button 
                onClick={() => createProject('New Scene ' + (projects.length + 1))}
                style={{ padding: '8px 16px', marginRight: '10px', marginBottom: '10px' }}
              >
                New Project
              </button>
              
              {projects.length > 0 && (
                <div>
                  <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                    Switch Project:
                  </label>
                  <select 
                    value={currentProject?.id || ''} 
                    onChange={(e) => loadProject(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '5px' }}
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {/* Center Panel - Design Canvas */}
          <div className="center-panel" style={{ flex: '1' }}>
            <DesignCanvas
              floorplanUrl={floorplanUrl}
              selectedAsset={selectedAsset}
              sceneElements={sceneElements}
              onElementPlace={handleElementPlace}
              onElementMove={handleElementMove}
            />
            
            <div className="render-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                onClick={handleRender} 
                disabled={isLoading || !currentProject}
                style={{ 
                  padding: '12px 24px', 
                  fontSize: '16px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Generating Render...' : 'Generate AI Render'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="error" style={{ 
            padding: '15px', 
            margin: '20px', 
            backgroundColor: '#ffebee', 
            border: '1px solid #f44336', 
            borderRadius: '4px',
            color: '#c62828' 
          }}>
            {error}
          </div>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="loading" style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner" style={{ 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p>Generating your AI-powered interior design...</p>
          </div>
        )}
        
        {/* Render Results */}
        {imageUrl && (
          <div className="results" style={{ textAlign: 'center', padding: '20px' }}>
            <h2>🤖 AI-Generated Interior Design</h2>
            <div className="ai-response" style={{ 
              border: '2px solid #007bff', 
              borderRadius: '8px', 
              padding: '20px',
              backgroundColor: 'white',
              textAlign: 'left',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {/* AI Description */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#007bff', marginTop: '0' }}>💭 AI Design Analysis:</h3>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {/* Show AI description if available */}
                  {typeof imageUrl === 'object' && imageUrl.description ? imageUrl.description : 
                   'AI analysis not available for this render.'}
                </div>
              </div>

              {/* Reference Image */}
              <div>
                <h3 style={{ color: '#007bff' }}>🖼️ Reference Image:</h3>
                <img 
                  src={typeof imageUrl === 'object' ? imageUrl.imageUrl : imageUrl}
                  alt="Interior design reference" 
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
                <p style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: '5px',
                  fontStyle: 'italic'
                }}>
                  Reference image while we work on implementing image generation capabilities.
                </p>
              </div>

              {/* Timestamp */}
              {typeof imageUrl === 'object' && imageUrl.timestamp && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#999', 
                  textAlign: 'center',
                  marginTop: '15px',
                  borderTop: '1px solid #eee',
                  paddingTop: '10px'
                }}>
                  Generated: {new Date(imageUrl.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
