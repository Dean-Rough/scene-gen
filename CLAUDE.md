# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scene-Gen is an AI-powered interior design visualizer that leverages Gemini 2.5 Flash Image model to generate photorealistic renderings from 2D floorplans and asset libraries. The application allows users to design rooms by uploading floorplans, placing furniture, defining materials, and generating high-quality renders.

## Architecture

The application uses a modern web stack with three main components:

### Frontend (React)
- **Location**: `frontend/` directory
- **Framework**: React.js with Create React App
- **Key Libraries**: axios for API calls, testing-library for tests
- **Purpose**: Interactive design canvas where users upload floorplans, place furniture, and configure render settings
- **Proxy**: Configured to proxy API requests to `http://localhost:5000`

### Backend (Node.js/Express)
- **Location**: `backend/` directory  
- **Framework**: Node.js with Express.js
- **Database**: Neon (Serverless PostgreSQL)
- **Key Responsibility**: Prompt Orchestration Engine that constructs multimodal prompts for the Gemini API by combining floorplan images, asset placements, materials, and render settings

### AI Model Integration
- **Service**: Gemini 2.5 Flash Image API
- **Input**: Multimodal prompts with both text instructions and image references
- **Output**: High-resolution photorealistic interior renders

## Development Commands

### Installation
```bash
# Install all dependencies (runs postinstall script)
npm install

# Or install individually
npm run install:backend
npm run install:frontend
```

### Development
```bash
# Run both frontend and backend concurrently
npm run dev

# Run individually
npm run dev:backend    # Backend on http://localhost:5000
npm run dev:frontend   # Frontend on http://localhost:3000
```

### Testing
```bash
# Backend tests (Jest + Supertest)
npm test --prefix backend

# Frontend tests (Jest + React Testing Library)  
npm test --prefix frontend
```

### Build
```bash
# Build frontend for production
npm run build:frontend
```

## Environment Setup

Backend requires environment variables in `backend/.env`:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `GEMINI_API_KEY`: API key for Gemini 2.5 Flash Image model

Copy `backend/.env.example` to get started.

## Core Data Flow

1. User designs room in React frontend canvas
2. Frontend sends structured JSON with project data to `/api/render` endpoint
3. Backend's Prompt Orchestration Engine:
   - Retrieves asset images and placement data
   - Constructs multimodal prompt combining floorplan, furniture positions, materials, and camera settings
   - Calls Gemini 2.5 Flash Image API
4. Generated image is stored and URL returned to frontend

## Key Implementation Notes

- The Prompt Orchestration Engine is the critical backend component that translates UI design data into effective multimodal prompts for the AI model
- Spatial coordinates from the UI canvas must be precisely mapped to instructions the AI model can interpret
- The system leverages Gemini's large context window to process multiple images and detailed instructions in a single prompt
- Frontend uses proxy configuration to route API calls during development