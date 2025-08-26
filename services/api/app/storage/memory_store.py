import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from ..models.flashcard import Flashcard, StudySession


class MemoryStore:
    """In-memory storage with JSON file persistence"""
    
    def __init__(self, data_file: str = "flashcard_data.json"):
        self.data_file = data_file
        self.flashcards: Dict[str, Flashcard] = {}
        self.study_sessions: Dict[str, StudySession] = {}
        self.load_data()
    
    def load_data(self):
        """Load data from JSON file if it exists"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                
                # Load flashcards
                for card_data in data.get('flashcards', []):
                    # Convert datetime strings back to datetime objects
                    if card_data.get('created_at'):
                        card_data['created_at'] = datetime.fromisoformat(card_data['created_at'])
                    if card_data.get('updated_at'):
                        card_data['updated_at'] = datetime.fromisoformat(card_data['updated_at'])
                    if card_data.get('last_reviewed'):
                        card_data['last_reviewed'] = datetime.fromisoformat(card_data['last_reviewed'])
                    if card_data.get('next_review'):
                        card_data['next_review'] = datetime.fromisoformat(card_data['next_review'])
                    
                    flashcard = Flashcard(**card_data)
                    self.flashcards[flashcard.id] = flashcard
                
                # Load study sessions
                for session_data in data.get('study_sessions', []):
                    if session_data.get('start_time'):
                        session_data['start_time'] = datetime.fromisoformat(session_data['start_time'])
                    if session_data.get('end_time'):
                        session_data['end_time'] = datetime.fromisoformat(session_data['end_time'])
                    
                    session = StudySession(**session_data)
                    self.study_sessions[session.id] = session
                    
            except Exception as e:
                print(f"Error loading data: {e}")
                # Start with empty data if loading fails
                self.flashcards = {}
                self.study_sessions = {}
    
    def save_data(self):
        """Save data to JSON file"""
        try:
            data = {
                'flashcards': [],
                'study_sessions': []
            }
            
            # Convert flashcards to dict format
            for flashcard in self.flashcards.values():
                card_dict = flashcard.dict()
                # Convert datetime objects to ISO strings
                for key, value in card_dict.items():
                    if isinstance(value, datetime):
                        card_dict[key] = value.isoformat()
                data['flashcards'].append(card_dict)
            
            # Convert study sessions to dict format
            for session in self.study_sessions.values():
                session_dict = session.dict()
                for key, value in session_dict.items():
                    if isinstance(value, datetime):
                        session_dict[key] = value.isoformat()
                data['study_sessions'].append(session_dict)
            
            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=2)
                
        except Exception as e:
            print(f"Error saving data: {e}")
    
    # Flashcard operations
    def create_flashcard(self, flashcard: Flashcard) -> Flashcard:
        """Create a new flashcard"""
        self.flashcards[flashcard.id] = flashcard
        self.save_data()
        return flashcard
    
    def get_flashcard(self, flashcard_id: str) -> Optional[Flashcard]:
        """Get a flashcard by ID"""
        return self.flashcards.get(flashcard_id)
    
    def get_all_flashcards(self) -> List[Flashcard]:
        """Get all flashcards"""
        return list(self.flashcards.values())
    
    def update_flashcard(self, flashcard_id: str, flashcard: Flashcard) -> Optional[Flashcard]:
        """Update an existing flashcard"""
        if flashcard_id in self.flashcards:
            flashcard.updated_at = datetime.now()
            self.flashcards[flashcard_id] = flashcard
            self.save_data()
            return flashcard
        return None
    
    def delete_flashcard(self, flashcard_id: str) -> bool:
        """Delete a flashcard"""
        if flashcard_id in self.flashcards:
            del self.flashcards[flashcard_id]
            self.save_data()
            return True
        return False
    
    def get_due_flashcards(self) -> List[Flashcard]:
        """Get flashcards due for review"""
        now = datetime.now()
        due_cards = []
        
        for flashcard in self.flashcards.values():
            if flashcard.next_review <= now:
                due_cards.append(flashcard)
        
        # Sort by how overdue they are (most overdue first)
        due_cards.sort(key=lambda card: card.next_review)
        return due_cards
    
    # Study session operations
    def create_study_session(self, session: StudySession) -> StudySession:
        """Create a new study session"""
        self.study_sessions[session.id] = session
        self.save_data()
        return session
    
    def get_study_session(self, session_id: str) -> Optional[StudySession]:
        """Get a study session by ID"""
        return self.study_sessions.get(session_id)
    
    def update_study_session(self, session_id: str, session: StudySession) -> Optional[StudySession]:
        """Update an existing study session"""
        if session_id in self.study_sessions:
            self.study_sessions[session_id] = session
            self.save_data()
            return session
        return None
    
    def get_all_study_sessions(self) -> List[StudySession]:
        """Get all study sessions"""
        return list(self.study_sessions.values())
    
    # Statistics
    def get_stats(self) -> dict:
        """Get comprehensive statistics"""
        now = datetime.now()
        today = datetime(now.year, now.month, now.day)
        
        all_cards = self.get_all_flashcards()
        due_today = len([card for card in all_cards if card.next_review.date() <= today.date()])
        
        # Calculate average ease factor
        avg_ease = sum(card.ease_factor for card in all_cards) / len(all_cards) if all_cards else 2.5
        
        # Calculate total reviews and accuracy
        total_reviews = sum(card.total_reviews for card in all_cards)
        
        # Study session stats
        completed_sessions = [s for s in self.study_sessions.values() if s.end_time]
        total_study_time = sum(s.total_time for s in completed_sessions)
        total_correct = sum(s.cards_correct for s in completed_sessions)
        total_reviewed = sum(s.cards_reviewed for s in completed_sessions)
        
        accuracy = (total_correct / total_reviewed * 100) if total_reviewed > 0 else 0
        
        # Interval distribution
        interval_dist = {"1 day": 0, "2-6 days": 0, "1-4 weeks": 0, "1+ months": 0}
        for card in all_cards:
            if card.interval == 1:
                interval_dist["1 day"] += 1
            elif card.interval <= 6:
                interval_dist["2-6 days"] += 1
            elif card.interval <= 28:
                interval_dist["1-4 weeks"] += 1
            else:
                interval_dist["1+ months"] += 1
        
        # Upcoming reviews (next 7 days)
        upcoming = {}
        for i in range(7):
            date = datetime(now.year, now.month, now.day)
            date = date.replace(day=date.day + i)
            date_str = date.strftime('%Y-%m-%d')
            upcoming[date_str] = len([
                card for card in all_cards 
                if card.next_review.date() == date.date()
            ])
        
        return {
            "total_cards": len(all_cards),
            "due_today": due_today,
            "total_reviews": total_reviews,
            "accuracy": round(accuracy, 2),
            "average_ease_factor": round(avg_ease, 2),
            "sessions_completed": len(completed_sessions),
            "total_study_time": total_study_time,
            "interval_distribution": interval_dist,
            "upcoming_reviews": upcoming
        }


# Global store instance
store = MemoryStore()