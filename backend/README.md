# Scene-Gen Backend

This directory contains the Node.js and Express.js backend for the Scene-Gen application.

## Responsibilities

*   Provides a REST API for the frontend.
*   Manages project and asset data (database interactions would be added here).
*   Orchestrates the creation of multimodal prompts for the Gemini 2.5 Flash Image ("NB") model.
*   Communicates with the NB API to generate renderings.

## Setup

All dependencies are installed from the root directory using `npm install`.

To install dependencies for this workspace only:
```bash
npm install
```

## Running in Development

The server can be run in development mode with hot-reloading via `nodemon`.

From the **root** directory:
```bash
npm run dev:backend
```

Or from this directory:
```bash
npm run dev
```

The server will start on `http://localhost:5000`.

## Environment Variables

This project uses a `DATABASE_URL` to connect to a Neon serverless PostgreSQL database and a `GEMINI_API_KEY`.

Create a `.env` file in this directory to store your credentials. You can copy the example file to get started:

```bash
cp .env.example .env
```

Then, add your credentials to the new `.env` file. The `DATABASE_URL` should be the connection string provided in your Neon project dashboard.
