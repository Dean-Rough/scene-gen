# Scene-Gen Technical Architecture

This document provides a detailed overview of the technical architecture for the Scene-Gen application.

## System Components

The system is composed of three main parts: a React single-page application (Frontend), a Node.js/Express server (Backend), and the Gemini 2.5 Flash Image API (NB).

### 1. Frontend (React)

The frontend is the user-facing interactive design canvas.

*   **Framework:** React.js
*   **Key Libraries:**
    *   `react-konva` or similar for the 2D canvas functionality (floorplan display, asset drag-and-drop).
    *   `axios` for making API requests to the backend.
    *   A UI component library like Material-UI or Ant Design for a consistent look and feel.
*   **Responsibilities:**
    *   **Project Management:** UI for creating, saving, and loading design projects.
    *   **Asset Library:** UI for uploading and managing images for floorplans, furniture, and materials.
    *   **Interactive Canvas:** The core feature. Displays the floorplan and allows users to place, move, and rotate assets. It captures the X/Y coordinates and rotation for each asset.
    *   **Properties Panel:** Allows users to input text-based attributes for selected items (e.g., material, color hex codes).
    *   **Render Settings:** UI for selecting camera angle, lighting, and style.
    *   **Communication:** Sends all the structured design data to the backend via a REST API.

### 2. Backend (Node.js / Express.js)

The backend acts as the orchestrator between the user's design and the AI model.

*   **Framework:** Node.js with Express.js
*   **Database:** Neon (Serverless PostgreSQL) for storing project and asset data.
*   **Responsibilities:**
    *   **API Server:** Exposes RESTful endpoints for the frontend (e.g., `POST /api/render`, `POST /api/projects`, `GET /api/projects/:id`).
    *   **Authentication:** (Future) Manages user accounts and authentication.
    *   **Database Management:** Handles all CRUD operations for projects, assets, and users.
    *   **Prompt Orchestration Engine:** This is the most critical backend component. When a render is requested, it:
        1.  Retrieves all project data from the database (floorplan, asset images, placements, materials, etc.).
        2.  Constructs a complex, multimodal prompt for the NB model. This prompt is a carefully structured combination of text and image references.
        3.  Sends the prompt to the Gemini 2.5 Flash Image API.
    *   **Image Handling:** Receives the generated image from the NB API and stores it (e.g., in a cloud storage bucket like Amazon S3 or Google Cloud Storage).
    *   **Response:** Returns the URL of the final rendered image to the frontend.

### 3. Gemini 2.5 Flash Image API ("NB")

This is the external, third-party service that performs the image generation.

*   **Input:** A multimodal prompt containing both text instructions and image data/references.
*   **Processing:** The model interprets the spatial layout from the floorplan, the appearance of objects from the asset images, and the specific instructions for placement, materials, and style. It then generates a new, coherent image based on this comprehensive input.
*   **Output:** A high-resolution, photorealistic image.

## Testing Strategy

*   **Backend:** Unit and integration tests are written with **Jest** and **Supertest**. The focus is on testing API endpoints, middleware, and the logic of the Prompt Orchestration Engine.
*   **Frontend:** Component and integration tests are written with **Jest** and **React Testing Library**. The focus is on testing user interactions, component behavior, and state management.

## Data Flow for a Render Request

1.  **User Action:** The user clicks "Generate High-Res Render" in the frontend UI.
2.  **Frontend:** The React app gathers all the data from the canvas and settings panels into a single JSON object.
    ```json
    {
      "projectId": "proj_123",
      "floorplan": "image_id_floorplan.jpg",
      "assets": [
        {
          "assetId": "asset_sofa_456",
          "imageId": "image_id_sofa.jpg",
          "position": { "x": 150, "y": 200 },
          "rotation": 90,
          "material": "Cognac Leather"
        }
      ],
      "camera": { "angle": "eye-level", "direction": "north" },
      "style": "Modern, Scandinavian"
    }
    ```
3.  **API Request:** The frontend sends this JSON object in a `POST` request to the backend's `/api/render` endpoint.
4.  **Backend:**
    *   The Express server receives the request.
    *   The Prompt Orchestration Engine queries the database to get full details for the assets if needed.
    *   The engine constructs the multimodal prompt for the NB API.
    *   The backend makes a secure API call to the Gemini 2.5 Flash Image service.
5.  **NB API:** The model generates the image and returns it to the backend.
6.  **Backend:** The backend saves the image to cloud storage and saves the new image's URL to the database.
7.  **API Response:** The backend responds to the frontend's request with the URL of the newly created image.
8.  **Frontend:** The React app receives the image URL and displays the final render to the user.
