const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// In-memory placeholder for the Gemini API client
// In a real application, you would initialize the client here
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview" }); // Official model name for "NB"

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
 * The core endpoint to handle render requests.
 */
router.post('/render', async (req, res) => {
  const designData = req.body;

  console.log('Received design data for rendering:', designData);

  try {
    // 1. CONSTRUCT THE MULTIMODAL PROMPT
    // This is where the core logic of the Prompt Orchestration Engine goes.
    // You will build a prompt array with text and image parts.
    //
    // Example prompt structure:
    // const prompt = [
    //   "Render a photorealistic interior design...",
    //   "Floorplan:", { inlineData: { mimeType: 'image/jpeg', data: '...' } },
    //   "Asset: Sofa", { inlineData: { mimeType: 'image/jpeg', data: '...' } },
    //   "Instructions: Place the sofa at (150, 200)..."
    // ];

    // For now, we will just simulate the call to the NB model.
    console.log('Constructing multimodal prompt for NB model...');

    // 2. CALL THE NB (GEMINI) API
    // const result = await model.generateContentStream(prompt);
    // In a real scenario, you would process the stream or promise.

    // 3. SIMULATE A RESPONSE
    // This simulates receiving an image URL back from the model/storage.
    const simulatedImageUrl = 'https://storage.googleapis.com/gemini-prod-us-west1-assets/images/20240502/gemini_generated_image_1.jpeg';
    console.log(`Simulated render complete. Image URL: ${simulatedImageUrl}`);

    // 4. RETURN THE IMAGE URL
    res.status(200).json({ imageUrl: simulatedImageUrl });

  } catch (error) {
    console.error('Error during rendering process:', error);
    res.status(500).json({ error: 'Failed to generate render.' });
  }
});

module.exports = router;
