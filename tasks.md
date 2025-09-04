# AI Agent Tasks

This file tracks tasks for AI agents using git worktrees and tmux sessions.

## Current Tasks

### Task 1: Backend - Database Schema
- **Branch**: feature/db-schema
- **Status**: pending
- **Description**: Implement the initial PostgreSQL schema using `node-postgres`. Create a script in `backend/db/init.js` that, when run, connects to the `DATABASE_URL` and creates the following tables: `projects` (id, name), `assets` (id, project_id, type, image_url, attributes_json), and `scene_elements` (id, project_id, asset_id, position_x, position_y, rotation_z).

### Task 2: Backend - Project CRUD Endpoints
- **Branch**: feature/project-endpoints
- **Status**: pending
- **Description**: In `backend/routes/api.js`, create the REST endpoints for managing projects. Implement `POST /projects` to create a new project, `GET /projects/:id` to fetch a project with its assets and scene elements, and `PUT /projects/:id` to update a project's name or contents.

### Task 3: Frontend - Canvas Component Setup
- **Branch**: feature/canvas-component
- **Status**: pending
- **Description**: Create the main interactive canvas component at `frontend/src/components/DesignCanvas.js`. Use the `react-konva` library to set up a Stage. This component should accept a floorplan image URL as a prop and render it as the background of the Konva Stage.

### Task 4: Frontend - Asset Library UI
- **Branch**: feature/asset-library-ui
- **Status**: pending
- **Description**: Create the `frontend/src/components/AssetLibrary.js` component. It should have a button to trigger a file input for uploading asset images (e.g., furniture). Display the uploaded images as thumbnails in a scrollable list. Clicking a thumbnail should set it as the currently selected asset in the parent component's state.

### Task 5: Frontend - Place Asset on Canvas
- **Branch**: feature/place-asset
- **Status**: pending
- **Description**: Implement the logic to add a selected asset to the canvas. When the user clicks on the `DesignCanvas`, an image of the currently selected asset from the `AssetLibrary` should appear on the canvas at the click coordinates. Make these new images draggable.

## Task Status Legend
- **pending**: Available for assignment
- **claimed**: Assigned to an agent
- **in_progress**: Currently being worked on
- **completed**: Ready for review/merge
- **intervention_required**: Needs human input

## Usage
1. Use `/tmux-spawn <name> <branch> <task>` to assign tasks
2. Use `/tmux-status` to check progress
3. Use `/tmux-list` to see active agents