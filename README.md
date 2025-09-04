# Scene-Gen: AI-Powered Interior Design Visualizer

Scene-Gen is a web-based interactive design canvas that leverages the power of the Gemini 2.5 Flash Image model ("NB") to generate photorealistic interior design renderings from 2D floorplans and asset libraries.

## Project Overview

This project allows a user to design a room by uploading a floorplan, placing furniture and assets, and defining materials and styles. The application then constructs a detailed multimodal prompt for the "NB" model to generate a high-resolution, photorealistic rendering of the scene.

## Architecture

The application is a modern web stack:

*   **Frontend:** React
*   **Backend:** Node.js with Express.js
*   **AI Model:** Gemini 2.5 Flash Image ("NB")

For a detailed explanation of the architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Getting Started

### Prerequisites

*   Node.js (v18.x or later)
*   npm (v9.x or later)
*   A Neon account and project.
*   Access to the Gemini 2.5 Flash Image API

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Scene-Gen
    ```

2.  **Install root dependencies:**
    ```bash
    npm install
    ```

3.  **Install backend dependencies:**
    ```bash
    npm run install:backend
    ```

4.  **Install frontend dependencies:**
    ```bash
    npm run install:frontend
    ```

5.  **Configure Environment Variables:**
    Create a `.env` file in the `backend` directory. You can copy the example file to get started:
    ```bash
    cp backend/.env.example backend/.env
    ```
    Then, fill in your Neon database connection string and your Gemini API key in the new `backend/.env` file.

### Development

To run both the frontend and backend servers concurrently in development mode:

```bash
npm run dev
```

*   The React frontend will be available at `http://localhost:3000`.
*   The Node.js backend will be available at `http://localhost:5000`.

## Testing

This project uses Jest for testing.

*   **Backend:** The backend uses Jest and Supertest for API integration tests. Run the backend tests from the root directory:
    ```bash
    npm test --prefix backend
    ```
*   **Frontend:** The frontend is set up with Jest and React Testing Library. Run the frontend tests from the root directory:
    ```bash
    npm test --prefix frontend
    ```

## Build and Deploy

To build the frontend for production:

```bash
npm run build:frontend
```

The production-ready static files will be in the `frontend/build` directory. These can be served by the backend or a static file host.
