# 🧠 Spaced-Repetition Flashcards (SM-2 Lite) - Design Notes

## 📋 Feature Overview

Implementation of a spaced-repetition flashcard system based on the SM-2 algorithm (simplified version) for optimal learning retention. Users can create, study, and review flashcards with intelligent scheduling based on their performance.

## 🎯 Requirements Analysis

Based on the GitHub issue "Feature: spaced-repetition flashcards (SM-2 lite)":

### Core Features
1. **Flashcard Management**: Create, read, update, delete flashcards
2. **SRS Algorithm**: SM-2 lite implementation for review scheduling
3. **Study Sessions**: Interactive study interface with performance tracking
4. **Review Scheduling**: Intelligent next review date calculation
5. **Progress Tracking**: Statistics and learning analytics

### User Stories
- As a user, I want to create flashcards with questions and answers
- As a user, I want to study flashcards in scheduled review sessions
- As a user, I want the system to intelligently schedule reviews based on my performance
- As a user, I want to see my learning progress and statistics
- As a user, I want to manage my flashcard collections

## 🏗️ System Architecture

### Frontend (React/Next.js)
```
apps/web/
├── pages/
│   ├── index.tsx              # Dashboard with study statistics
│   ├── flashcards/
│   │   ├── index.tsx          # Flashcard management
│   │   ├── create.tsx         # Create new flashcard
│   │   └── study.tsx          # Study session interface
│   └── api/                   # Next.js API routes (proxy to FastAPI)
├── components/
│   ├── FlashcardList.tsx      # List of flashcards
│   ├── FlashcardEditor.tsx    # Create/edit flashcard form
│   ├── StudySession.tsx       # Study interface
│   ├── PerformanceStats.tsx   # Progress statistics
│   └── ReviewScheduler.tsx    # Next review information
├── hooks/
│   ├── useFlashcards.tsx      # Flashcard data management
│   ├── useStudySession.tsx    # Study session state
│   └── useSRS.tsx             # SRS calculations
└── types/
    └── flashcard.ts           # TypeScript interfaces
```

### Backend (FastAPI)
```
services/api/app/
├── main.py                    # Main application
├── models/
│   ├── flashcard.py          # Flashcard data models
│   ├── study_session.py      # Study session models
│   └── srs.py                # SRS algorithm models
├── routers/
│   ├── flashcards.py         # Flashcard CRUD endpoints
│   ├── study.py              # Study session endpoints
│   └── analytics.py          # Progress analytics endpoints
├── services/
│   ├── srs_service.py        # SRS calculation service
│   ├── flashcard_service.py  # Flashcard business logic
│   └── study_service.py      # Study session management
└── storage/
    └── memory_store.py       # In-memory data storage
```

### Shared Libraries
```
libs/shared/src/
├── srs/
│   ├── algorithm.ts          # Enhanced SM-2 implementation
│   ├── scheduler.ts          # Review scheduling logic
│   └── types.ts              # SRS-related types
└── flashcard/
    ├── types.ts              # Shared flashcard interfaces
    └── validation.ts         # Validation utilities
```

## 🧮 SM-2 Algorithm Implementation

### Enhanced SRS Algorithm
Building on the existing `scheduleNextReview` function with proper SM-2 implementation:

```typescript
interface SRSCard {
  id: string;
  easeFactor: number;    // Default: 2.5
  interval: number;      // Days until next review
  repetition: number;    // Number of successful reviews
  lastReviewed: Date;    // Last review timestamp
  nextReview: Date;      // Next scheduled review
}

interface ReviewResult {
  quality: number;       // 0-5 (SM-2 quality scale)
  responseTime: number;  // Time taken to answer (ms)
  correct: boolean;      // Whether answer was correct
}
```

### Algorithm Flow
1. **Initial State**: New cards start with interval=1, repetition=0, easeFactor=2.5
2. **Quality Assessment**: User rates difficulty (0=total blackout, 5=perfect response)
3. **Interval Calculation**: Based on SM-2 formula with quality feedback
4. **Ease Factor Adjustment**: Adapts to user performance over time
5. **Scheduling**: Next review date calculated from interval

## 🔌 API Design

### Flashcard Endpoints
```python
# Flashcard Management
POST   /api/flashcards          # Create flashcard
GET    /api/flashcards          # List all flashcards
GET    /api/flashcards/{id}     # Get specific flashcard
PUT    /api/flashcards/{id}     # Update flashcard
DELETE /api/flashcards/{id}     # Delete flashcard

# Study Session Endpoints  
GET    /api/study/due           # Get cards due for review
POST   /api/study/review        # Submit review result
GET    /api/study/session/{id}  # Get study session info

# Analytics Endpoints
GET    /api/analytics/stats     # Overall learning statistics
GET    /api/analytics/progress  # Progress over time
GET    /api/analytics/cards/{id}/history # Card review history
```

### Data Models
```python
class Flashcard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    question: str = Field(..., min_length=3, max_length=1000)
    answer: str = Field(..., min_length=1, max_length=1000)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    tags: List[str] = Field(default_factory=list)
    
    # SRS Properties
    ease_factor: float = Field(default=2.5, ge=1.0, le=5.0)
    interval: int = Field(default=1, ge=0)  # Days
    repetition: int = Field(default=0, ge=0)
    last_reviewed: Optional[datetime] = None
    next_review: datetime = Field(default_factory=datetime.now)
    
class ReviewResult(BaseModel):
    flashcard_id: str
    quality: int = Field(..., ge=0, le=5)  # SM-2 quality rating
    response_time: int = Field(..., ge=0)  # Milliseconds
    correct: bool
    reviewed_at: datetime = Field(default_factory=datetime.now)
```

## 🎨 User Interface Design

### Dashboard (/)
- Welcome message with study statistics
- "Start Study Session" button (only if cards are due)
- Quick stats: cards due today, total cards, study streak
- Recent activity feed

### Flashcard Management (/flashcards)
- List of all flashcards with search/filter
- Add new flashcard button
- Edit/delete actions for each card
- Bulk operations (import/export)

### Study Session (/flashcards/study)
- Card presentation (question first, reveal answer)
- Quality rating buttons (0-5) with descriptive labels
- Progress indicator (X of Y cards)
- Skip/difficult card options
- Session completion summary

### Analytics Dashboard (/analytics)
- Learning statistics and progress charts
- Card difficulty analysis
- Study time tracking
- Performance trends over time

## 🧪 Testing Strategy

### Unit Tests
- **SRS Algorithm**: Test scheduling calculations with various inputs
- **API Endpoints**: Test all CRUD operations and edge cases
- **Components**: Test React component rendering and interactions
- **Services**: Test business logic and data transformations

### Integration Tests
- **API Integration**: Test full request/response cycles
- **Database Operations**: Test data persistence and retrieval
- **SRS Integration**: Test algorithm integration with real data

### E2E Tests
- **Complete Study Flow**: Create card → Study → Review → Schedule
- **User Journey**: Registration → Card creation → Study session → Progress view
- **Cross-browser**: Test in different browsers and screen sizes

## 📊 Data Storage Strategy

### In-Memory Storage (Phase 1)
- Simple Python dict-based storage for MVP
- Data persistence across application restarts using JSON files
- Suitable for development and demo purposes

### Future Enhancements (Phase 2+)
- SQLite database for better performance and relationships
- User authentication and multi-user support
- Cloud synchronization capabilities
- Advanced analytics and reporting

## 🔒 Security Considerations

### Input Validation
- Sanitize all flashcard content (XSS prevention)
- Validate SRS parameters (prevent algorithm gaming)
- Rate limiting on API endpoints
- CORS configuration for frontend/backend communication

### Data Protection
- Secure storage of user-generated content
- Privacy-first approach (no tracking without consent)
- Proper error handling (don't leak sensitive information)

## 🚀 Implementation Phases

### Phase 1: Core MVP ✅
1. Enhanced SRS algorithm implementation
2. Basic flashcard CRUD API
3. Simple React frontend for card management
4. In-memory storage with JSON persistence
5. Basic study session functionality

### Phase 2: Enhanced UX 🚧
1. Improved UI/UX with better styling
2. Advanced study session features (hints, difficulty adjustment)
3. Progress analytics and charts
4. Bulk import/export functionality
5. Mobile-responsive design

### Phase 3: Advanced Features 🔮
1. User authentication and profiles
2. Shared decks and community features
3. Advanced analytics and learning insights
4. Spaced repetition algorithm customization
5. Integration with external services

## 💡 Technical Decisions

### Frontend Framework
- **Next.js/React**: Leverages existing setup, great TypeScript support
- **CSS-in-JS/Styled-components**: For component styling
- **React Hook Form**: For form validation and management
- **Chart.js**: For analytics visualizations

### Backend Framework
- **FastAPI**: Already established, excellent API documentation
- **Pydantic**: Strong data validation and serialization
- **SQLModel**: Future database integration (SQLite → PostgreSQL)

### State Management
- **React Hooks**: For local component state
- **Context API**: For global application state
- **SWR/React Query**: For server state management and caching

## 🎯 Success Metrics

### User Experience
- Time to complete first study session < 2 minutes
- Study session completion rate > 80%
- User retention after 1 week > 60%

### Technical Performance
- API response time < 200ms for all endpoints
- Frontend load time < 3 seconds
- Test coverage > 90% for core functionality

### Learning Effectiveness
- Retention improvement demonstrable through analytics
- Optimal spacing intervals achieved for different difficulty levels
- User satisfaction with scheduling algorithm

---

This design provides a solid foundation for implementing a comprehensive spaced-repetition flashcard system that's both user-friendly and technically robust.