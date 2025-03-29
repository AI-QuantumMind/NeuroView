# NeuroView

A cutting-edge medical AI platform that combines advanced vision models for MRI analysis with intelligent medical assistance.

## Features

- 🔍 MRI Image Analysis
- 💬 AI-Powered Medical Chat
- 👨‍⚕️ Doctor-Patient Management
- 📊 Medical Records Management
- 📅 Appointment Scheduling
- 🔐 Secure Authentication
- 📱 Responsive Design

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Context API
- Axios

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- Vision API
- RAG System

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.9 or higher)
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/neuroview.git
cd neuroview
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:8000/api/v1

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost/neuroview
JWT_SECRET_KEY=your-secret-key
VISION_API_KEY=your-vision-api-key
RAG_API_KEY=your-rag-api-key
```

5. Start the development servers:

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
uvicorn app.main:app --reload
```

### Docker Deployment

1. Build the images:
```bash
docker-compose build
```

2. Start the containers:
```bash
docker-compose up -d
```

## Project Structure

```
neuroview/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── public/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── services/
│   └── tests/
└── docs/             # Documentation
    ├── api.md
    ├── frontend.md
    └── backend.md
```

## Documentation

- [API Documentation](docs/api.md)
- [Frontend Documentation](docs/frontend.md)
- [Backend Documentation](docs/backend.md)

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
pytest
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Support

For support, email support@neuroview.com or join our Slack channel.
