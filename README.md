# Memory-Graph-App

This is a full-stack application designed to visualize and manage memories as a graph. It consists of a Next.js frontend and a NestJS backend, utilizing Neo4j as its graph database.

## Features

*   **Memory Management:** Add, view, and update memories.
*   **Relationship Mapping:** Define and visualize relationships between memories.
*   **Interactive Graph:** Explore memories and their connections in a dynamic graph interface.
*   **User Authentication:** Secure login functionality.
*   **Timeline View:** See memories organized chronologically.
*   **Dashboard:** Overview of memory data.

## Technologies Used

### Frontend (Next.js)

*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **UI Components:** Radix UI, Shadcn/ui
*   **Graph Visualization:** React Flow Renderer
*   **Charting:** Recharts
*   **Authentication:** Firebase
*   **Form Management:** React Hook Form, Zod
*   **State Management:** React Context API

### Backend (NestJS)

*   **Framework:** NestJS
*   **Language:** TypeScript
*   **Database:** Neo4j (via `neo4j-driver` and `nest-neo4j`)
*   **Validation:** `class-validator`, `class-transformer`
*   **Configuration:** `@nestjs/config`, `dotenv`

### Database

*   **Graph Database:** Neo4j

### Other

*   **Containerization:** Docker, Docker Compose
*   **Package Manager:** npm

## Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (v18 or higher)
*   npm (Node Package Manager)
*   Docker
*   Docker Compose
*   Neo4j Database (can be run locally or via Docker)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Memory-Graph-App.git
cd Memory-Graph-App
```

### 2. Environment Variables

You need to create `.env` files for both the frontend and backend.

#### Frontend (`.env.local` in the root directory)

Create a file named `.env.local` in the root of the project (`Memory-Graph-App/`) and add your Firebase configuration:

```
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_APIKEY="YOUR_FIREBASE_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECTID="YOUR_FIREBASE_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APPID="YOUR_FIREBASE_APP_ID"
NEXT_PUBLIC_FIREBASE_MEASUREMENTID="YOUR_FIREBASE_MEASUREMENT_ID"
```
**Note:** Replace the placeholder values with your actual Firebase project credentials.

#### Backend (`backend/.env` in the `backend` directory)

Create a file named `.env` inside the `backend/` directory (`Memory-Graph-App/backend/.env`) and configure your Neo4j database connection:

```
DATABASE_URL="your_database_connection_string" # e.g., neo4j://localhost:7687
API_KEY="your_api_key" # A secret key for your API
NEO4J_SCHEME="neo4j" # or "bolt", "neo4j+s", etc.
NEO4J_HOST="localhost"
NEO4J_PORT="7687"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="Golu@8678" # Replace with your Neo4j password
```
**Note:** Ensure your Neo4j database is running and accessible with the provided credentials.

### 3. Running with Docker Compose (Recommended)

This is the easiest way to get both the frontend and backend running.

```bash
docker-compose up --build
```

This command will:
*   Build the Docker images for both frontend and backend.
*   Start the frontend service (accessible at `http://localhost:80`).
*   Start the backend service (accessible at `http://localhost:3001`).

### 4. Running Locally (Without Docker)

#### 4.1. Start the Backend

Navigate to the `backend` directory, install dependencies, and start the server:

```bash
cd backend
npm install
npm run start:dev
```
The backend will typically run on `http://localhost:3001`.

#### 4.2. Start the Frontend

Open a new terminal, navigate back to the root directory of the project, install dependencies, and start the Next.js development server:

```bash
cd .. # If you are in the backend directory
npm install
npm run dev
```
The frontend will typically run on `http://localhost:3000`.

## Project Structure

*   `app/`: Next.js pages and routes for the frontend.
*   `backend/`: NestJS application for the API, including controllers, services, and DTOs for memory management.
*   `components/`: Reusable React components for the frontend.
*   `config/`: Configuration files.
*   `contexts/`: React Context API providers.
*   `hooks/`: Custom React hooks.
*   `lib/`: Utility functions and Firebase/Memory Service configurations.
*   `types/`: TypeScript type definitions.
*   `Dockerfile`: Dockerfile for the Next.js frontend.
*   `backend/Dockerfile`: Dockerfile for the NestJS backend.
*   `docker-compose.yml`: Defines the multi-container Docker application.
