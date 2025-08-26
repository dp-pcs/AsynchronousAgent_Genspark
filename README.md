# 🧠 Spaced-Repetition Flashcards

A modern spaced-repetition learning system implementing the SM-2 algorithm for optimal knowledge retention. Create flashcards, study systematically, and track your progress with intelligent review scheduling.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

## ✨ Features

### 🎯 Core Functionality
- **Smart Scheduling**: SM-2 algorithm automatically schedules reviews based on performance
- **Flashcard Management**: Create, edit, and organize flashcards with tags
- **Study Sessions**: Interactive study interface with quality-based feedback
- **Progress Tracking**: Comprehensive analytics and learning statistics
- **Beautiful UI**: Modern, responsive interface with glassmorphism design

### 📊 SM-2 Algorithm Implementation
- **Quality Ratings**: 0-5 scale for review difficulty assessment
- **Adaptive Intervals**: Dynamic spacing based on recall performance
- **Ease Factor**: Personalized difficulty adjustments per card
- **Streak Tracking**: Monitor learning progress over time
- **Intelligent Ordering**: Prioritizes overdue and difficult cards

### 🧪 Quality Assurance
- **Unit Tests**: Comprehensive test coverage for all components
- **E2E Testing**: Complete user journey validation
- **Type Safety**: Full TypeScript implementation
- **API Documentation**: Interactive FastAPI docs

## 🏗️ Architecture

### 📁 Project Structure
```
├── apps/
│   └── web/                    # React frontend application
│       ├── pages/              # Next.js pages
│       │   ├── index.tsx       # Dashboard with statistics
│       │   └── flashcards/     # Flashcard management & study
│       ├── hooks/              # Custom React hooks
│       ├── types/              # Frontend TypeScript types
│       └── tests/              # E2E and integration tests
├── libs/
│   └── shared/                 # Shared TypeScript libraries
│       └── src/srs/           # SM-2 algorithm implementation
│           ├── algorithm.ts    # Core SM-2 logic
│           ├── scheduler.ts    # Study session management
│           ├── types.ts        # Shared type definitions
│           └── tests/          # Unit tests
├── services/
│   └── api/                   # FastAPI backend service
│       ├── app/
│       │   ├── models/         # Pydantic data models
│       │   ├── services/       # Business logic services
│       │   ├── storage/        # In-memory data store
│       │   └── main.py         # FastAPI application
│       └── tests/              # API unit tests
└── package.json               # Monorepo configuration
```

### 🔄 Data Flow
1. **Frontend** (React/Next.js) handles user interface and interactions
2. **Shared Libraries** provide SM-2 algorithm and type definitions
3. **Backend API** (FastAPI) manages data persistence and business logic
4. **In-Memory Store** provides fast, file-backed data storage

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **npm** or **yarn**

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webapp
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies
   cd services/api
   pip install -r requirements.txt
   cd ../..
   ```

### 🏃‍♂️ Running Locally

#### Option 1: Full Development Setup

1. **Start the FastAPI backend**
   ```bash
   cd services/api
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at: `http://localhost:8000`
   API Documentation: `http://localhost:8000/docs`

2. **Start the React frontend** (in a new terminal)
   ```bash
   cd apps/web
   npm run dev
   ```
   The frontend will be available at: `http://localhost:3000`

#### Option 2: Using Process Managers (Recommended for Production)

1. **Backend with Supervisor**
   ```bash
   cd services/api
   
   # Create supervisor config (already included)
   supervisord -c supervisord.conf
   supervisorctl start webserver
   ```

2. **Frontend with PM2**
   ```bash
   cd apps/web
   
   # Install PM2 globally if not already installed
   npm install -g pm2
   
   # Start with PM2
   pm2 start npm --name "flashcards-web" -- run dev
   ```

### 🧪 Testing

#### Run All Tests
```bash
npm run test:all
```

#### Individual Test Suites
```bash
# TypeScript/JavaScript tests (Jest)
npm test

# Python API tests (pytest)
npm run test:python

# With coverage
npm run test:coverage
```

#### E2E Testing
The E2E test suite covers the complete user journey:
```bash
# E2E tests are included in the main test suite
npm test apps/web/tests/e2e/
```

## 📖 Usage Guide

### 🎮 Getting Started

1. **Access the Application**
   - Open your browser to `http://localhost:3000`
   - You'll see the dashboard with learning statistics

2. **Create Your First Flashcard**
   - Click "Manage Cards" or use the "+" button
   - Fill in the question and answer
   - Add optional tags for organization
   - Click "Create Card"

3. **Start Studying**
   - Click "Start Studying" on the dashboard
   - Cards due for review will be presented
   - Read the question and think of your answer
   - Click "Show Answer" to reveal the correct answer
   - Rate your performance on the 0-5 scale:
     - **0**: Total blackout - complete failure to recall
     - **1**: Incorrect - but remembered upon seeing answer
     - **2**: Difficult - correct response with serious difficulty
     - **3**: Hesitant - correct response with some hesitation
     - **4**: Good - correct response with minor hesitation
     - **5**: Perfect - perfect response with no hesitation

4. **Track Your Progress**
   - View statistics on the dashboard
   - Monitor accuracy, study time, and streak counts
   - Check individual card performance

### 🧠 Understanding the SM-2 Algorithm

The system uses the SuperMemo SM-2 algorithm to optimize review scheduling:

- **Initial Review**: New cards are reviewed after 1 day
- **Second Review**: If successful, reviewed after 6 days
- **Subsequent Reviews**: Interval = Previous Interval × Ease Factor
- **Ease Factor**: Adjusted based on performance (starts at 2.5)
- **Failed Reviews**: Reset to 1-day interval, decrease ease factor

#### Quality Rating Effects
- **Ratings 0-2**: Reset repetition, interval = 1 day, decrease ease factor
- **Rating 3**: Maintain ease factor, progress normally
- **Ratings 4-5**: Increase ease factor, progress normally

### 🎯 Study Strategies

1. **Consistent Daily Practice**: Review due cards daily for best results
2. **Honest Self-Assessment**: Rate difficulty accurately for optimal scheduling
3. **Focus on Understanding**: Don't just memorize, understand the concepts
4. **Use Tags**: Organize cards by subject or difficulty level
5. **Regular Review**: Check statistics to identify problem areas

## 🔧 API Reference

### 📋 Endpoints Overview

The FastAPI backend provides the following endpoints:

#### Flashcard Management
- `POST /api/flashcards` - Create a new flashcard
- `GET /api/flashcards` - Get all flashcards with metadata
- `GET /api/flashcards/{id}` - Get specific flashcard
- `PUT /api/flashcards/{id}` - Update flashcard
- `DELETE /api/flashcards/{id}` - Delete flashcard

#### Study System
- `GET /api/study/due` - Get cards due for review
- `POST /api/study/session` - Start a new study session
- `POST /api/study/review/{id}` - Submit a card review

#### Analytics
- `GET /api/analytics/stats` - Get learning statistics
- `GET /api/analytics/cards/{id}/history` - Get card review history

#### Legacy Support
- `GET /api/quiz` - Legacy quiz endpoint (backward compatibility)
- `POST /api/quiz/score` - Legacy score submission

### 📄 Example API Usage

#### Create a Flashcard
```bash
curl -X POST "http://localhost:8000/api/flashcards" \
     -H "Content-Type: application/json" \
     -d '{
       "question": "What is the capital of France?",
       "answer": "Paris",
       "tags": ["geography", "capitals"]
     }'
```

#### Review a Card
```bash
curl -X POST "http://localhost:8000/api/study/review/{card_id}" \
     -H "Content-Type: application/json" \
     -d '{"quality": 4}'
```

#### Get Statistics
```bash
curl "http://localhost:8000/api/analytics/stats"
```

### 🔗 Interactive Documentation
Visit `http://localhost:8000/docs` when the API is running to explore the interactive Swagger documentation.

## 🧩 Development

### 🛠️ Technology Stack

#### Frontend
- **React 18**: Modern component library
- **Next.js**: Full-stack React framework
- **TypeScript**: Type-safe development
- **Custom Hooks**: Reusable state management
- **CSS-in-JS**: Inline styling with dynamic theming

#### Backend
- **FastAPI**: High-performance async Python framework
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI web server
- **In-Memory Storage**: Fast, file-backed data persistence

#### Shared
- **TypeScript**: Shared type definitions and algorithms
- **SM-2 Algorithm**: Scientifically-proven spaced repetition
- **Jest**: Unit and integration testing
- **Pytest**: Python API testing

### 🔄 Adding New Features

#### Frontend Components
1. Create components in `apps/web/components/`
2. Add pages in `apps/web/pages/`
3. Implement hooks in `apps/web/hooks/`
4. Update types in `apps/web/types/`

#### Backend Endpoints
1. Define models in `services/api/app/models/`
2. Implement services in `services/api/app/services/`
3. Add endpoints in `services/api/app/main.py`
4. Write tests in `services/api/tests/`

#### Shared Logic
1. Update types in `libs/shared/src/srs/types.ts`
2. Extend algorithm in `libs/shared/src/srs/algorithm.ts`
3. Add scheduler features in `libs/shared/src/srs/scheduler.ts`

### 🧪 Testing Guidelines

#### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Aim for >80% code coverage
- Use descriptive test names

#### E2E Tests
- Test complete user workflows
- Verify API integrations
- Include error scenarios
- Test SM-2 algorithm correctness

#### Test Commands
```bash
# Run all tests
npm run test:all

# TypeScript tests with watch mode
npm run test:watch

# Python tests with verbose output
npm run test:python

# Coverage report
npm run test:coverage
```

## 🤝 Contributing

### 📝 Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm run test:all`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### 🎯 Commit Guidelines
- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`
- Write descriptive commit messages
- Include tests for new features
- Update documentation as needed

### 🔍 Code Review Process
- All changes require pull request review
- Ensure tests pass and coverage is maintained
- Follow existing code style and conventions
- Update documentation for user-facing changes

## 📊 Performance & Scalability

### 🚀 Current Implementation
- **In-Memory Storage**: Fast read/write operations
- **File Persistence**: Automatic JSON backup
- **Async API**: Non-blocking request handling
- **Client-Side Caching**: Optimized React state management

### 📈 Scaling Considerations
For larger deployments, consider:
- **Database Integration**: PostgreSQL, MongoDB, or Redis
- **Authentication**: User accounts and data isolation
- **Cloud Deployment**: Docker containers with load balancing
- **CDN**: Static asset optimization
- **Monitoring**: Application performance monitoring

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes on ports 3000 or 8000
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

#### Python Dependencies
```bash
# Reinstall Python dependencies
cd services/api
pip install --force-reinstall -r requirements.txt
```

#### Node Dependencies
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### API Connection Issues
- Ensure the FastAPI server is running on port 8000
- Check CORS configuration in `services/api/app/main.py`
- Verify firewall settings allow local connections

### 📞 Getting Help
- Check the [Issues](../../issues) page for known problems
- Review the [API documentation](http://localhost:8000/docs)
- Run tests to verify your environment: `npm run test:all`

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SuperMemo**: For the SM-2 algorithm research
- **FastAPI**: For the excellent Python web framework
- **React Team**: For the component architecture
- **Open Source Community**: For tools and inspiration

## 📚 Further Reading

- [SM-2 Algorithm Paper](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2) - Original SuperMemo research
- [Spaced Repetition](https://en.wikipedia.org/wiki/Spaced_repetition) - Wikipedia overview
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - Backend framework docs
- [React Documentation](https://reactjs.org/docs/) - Frontend framework docs
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type system documentation

---

<div align="center">
  <strong>Happy Learning! 🧠✨</strong><br>
  <em>Built with ❤️ for effective knowledge retention</em>
</div>