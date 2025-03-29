# Medical AI Assistant

A comprehensive medical AI assistant that combines vision models for MRI analysis and RAG-based chatbot for medical queries.

## Project Structure

```
project/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Utility functions
│   │   ├── styles/         # CSS and styling files
│   │   └── static/         # Static assets
│   └── public/             # Public assets
│
├── backend/                 # Python backend application
│   ├── api/                # API routes and controllers
│   │   ├── routes/        # Route definitions
│   │   └── controllers/   # Route handlers
│   │
│   ├── core/              # Core application logic
│   │   ├── config/       # Configuration management
│   │   └── middleware/   # Custom middleware
│   │
│   ├── models/           # Data models and schemas
│   │
│   ├── services/         # Business logic services
│   │   ├── vision/      # Vision model services
│   │   └── rag/         # RAG system services
│   │
│   ├── utils/           # Utility functions
│   └── tests/           # Test files
│
├── VisionModel/          # Vision model implementation
│   ├── model/           # Model weights and configurations
│   ├── training/        # Training scripts
│   └── inference/       # Inference scripts
│
└── RAG/                 # RAG system implementation
    ├── embeddings/      # Embedding models
    ├── retrieval/       # Retrieval logic
    └── generation/      # Text generation
```

## Setup Instructions

### Frontend
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Backend
1. Navigate to the backend directory
2. Create virtual environment: `python -m venv .venv`
3. Activate virtual environment:
   - Windows: `.venv\Scripts\activate`
   - Unix/MacOS: `source .venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and configure environment variables
6. Start server: `python run.py`

## Features
- MRI Image Analysis using YOLO
- Medical Query Chatbot using RAG
- Interactive Dashboard
- Report Generation
- User Authentication

## API Documentation
API documentation is available at `/api/docs` when the server is running.
