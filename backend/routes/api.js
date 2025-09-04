const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize Gemini AI client
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/projects', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO projects (name) VALUES ($1) RETURNING *',
      [name]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * GET /api/projects/:id
 * Fetch a project with its assets and scene elements
 */
router.get('/projects/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Get project details
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // Get assets for this project
    const assetsResult = await pool.query('SELECT * FROM assets WHERE project_id = $1', [id]);
    
    // Get scene elements for this project
    const elementsResult = await pool.query(`
      SELECT se.*, a.type as asset_type, a.image_url as asset_image_url 
      FROM scene_elements se 
      JOIN assets a ON se.asset_id = a.id 
      WHERE se.project_id = $1
    `, [id]);

    res.json({
      ...project,
      assets: assetsResult.rows,
      sceneElements: elementsResult.rows
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * PUT /api/projects/:id
 * Update a project's name
 */
router.put('/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE projects SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

/**
 * POST /api/projects/:id/assets
 * Add an asset to a project
 */
router.post('/projects/:id/assets', async (req, res) => {
  const { id } = req.params;
  const { type, imageUrl, attributes = {} } = req.body;

  if (!type || !imageUrl) {
    return res.status(400).json({ error: 'Asset type and image URL are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO assets (project_id, type, image_url, attributes_json) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, type, imageUrl, JSON.stringify(attributes)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding asset:', error);
    res.status(500).json({ error: 'Failed to add asset' });
  }
});

/**
 * POST /api/projects/:id/scene-elements
 * Place an asset on the scene
 */
router.post('/projects/:id/scene-elements', async (req, res) => {
  const { id } = req.params;
  const { assetId, positionX, positionY, rotationZ = 0, scaleX = 1, scaleY = 1 } = req.body;

  if (!assetId || positionX === undefined || positionY === undefined) {
    return res.status(400).json({ error: 'Asset ID, position X, and position Y are required' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO scene_elements (project_id, asset_id, position_x, position_y, rotation_z, scale_x, scale_y) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [id, assetId, positionX, positionY, rotationZ, scaleX, scaleY]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error placing scene element:', error);
    res.status(500).json({ error: 'Failed to place scene element' });
  }
});

/**
 * PUT /api/projects/:projectId/scene-elements/:elementId
 * Update a scene element's transform properties
 */
router.put('/projects/:projectId/scene-elements/:elementId', async (req, res) => {
  const { projectId, elementId } = req.params;
  const { positionX, positionY, rotationZ, scaleX, scaleY } = req.body;

  try {
    const result = await pool.query(`
      UPDATE scene_elements 
      SET position_x = COALESCE($1, position_x),
          position_y = COALESCE($2, position_y), 
          rotation_z = COALESCE($3, rotation_z),
          scale_x = COALESCE($4, scale_x),
          scale_y = COALESCE($5, scale_y),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND project_id = $7
      RETURNING *
    `, [positionX, positionY, rotationZ, scaleX, scaleY, elementId, projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scene element not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating scene element:', error);
    res.status(500).json({ error: 'Failed to update scene element' });
  }
});

/**
 * GET /api/projects
 * Get all projects
 */
router.get('/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * POST /api/render
 * The core endpoint to handle render requests with real Gemini AI.
 */
router.post('/render', async (req, res) => {
  const { projectId, floorplan, assets = [], camera = {}, style = "Photorealistic, Modern" } = req.body;

  console.log('🎨 Starting AI render generation...', { 
    projectId, 
    floorplan: floorplan ? 'provided' : 'none',
    assetsCount: assets.length,
    style 
  });

  try {
    // 1. CONSTRUCT THE MULTIMODAL PROMPT
    let prompt = `Create a photorealistic interior design rendering based on the following specifications:

STYLE: ${style}
CAMERA: ${camera.angle || 'eye-level'} perspective, facing ${camera.direction || 'north'}

ROOM LAYOUT:`;

    // Add floorplan description if provided
    if (floorplan) {
      prompt += `\n- Base the room layout on the provided floorplan image`;
    } else {
      prompt += `\n- Create a modern interior room with good proportions`;
    }

    // Add furniture and asset descriptions
    if (assets.length > 0) {
      prompt += `\n\nFURNITURE & ASSETS:`;
      assets.forEach((asset, index) => {
        prompt += `\n${index + 1}. Place furniture at position (${asset.position?.x || 0}, ${asset.position?.y || 0})`;
        if (asset.rotation) {
          prompt += ` with ${asset.rotation} degree rotation`;
        }
        if (asset.scale && asset.scale.x !== 1) {
          prompt += ` scaled to ${asset.scale.x}x size`;
        }
      });
    } else {
      prompt += `\n\nFURNITURE & ASSETS:
- Include appropriate modern furniture like sofas, coffee tables, lamps
- Arrange furniture in a natural, livable layout`;
    }

    prompt += `\n\nRENDER REQUIREMENTS:
- Photorealistic quality with proper lighting and shadows
- High resolution and professional interior design presentation
- Warm, inviting atmosphere suitable for a modern home
- Include realistic materials and textures
- Ensure proper scale and proportions for all elements`;

    console.log('🧠 Constructed prompt for Gemini AI');

    // 2. CALL THE GEMINI AI API
    console.log('🚀 Calling Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiDescription = response.text();

    console.log('✅ Gemini AI response received');

    // 3. FOR NOW, RETURN THE AI DESCRIPTION 
    // In a full implementation, you would:
    // - Use an image generation model (DALL-E, Midjourney API, etc.)
    // - Or implement Gemini's multimodal capabilities with image input/output
    // - Store generated images in cloud storage
    
    // For this implementation, we return a structured response with the AI's design description
    res.status(200).json({ 
      success: true,
      renderType: 'ai_description',
      description: aiDescription,
      prompt: prompt,
      timestamp: new Date().toISOString(),
      // Fallback image for demonstration
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    });

  } catch (error) {
    console.error('❌ Error during AI rendering process:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI render.',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
