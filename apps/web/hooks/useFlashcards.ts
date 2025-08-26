import { useState, useEffect } from 'react';
import { Flashcard, FlashcardCreate, StudyStats } from '../types/flashcard';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:8000/api';

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/flashcards`);
      if (!response.ok) throw new Error('Failed to fetch flashcards');
      
      const data = await response.json();
      setFlashcards(data.flashcards || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createFlashcard = async (flashcardData: FlashcardCreate) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flashcardData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create flashcard');
      }
      
      const newFlashcard = await response.json();
      setFlashcards(prev => [...prev, newFlashcard]);
      return newFlashcard;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateFlashcard = async (id: string, updates: Partial<FlashcardCreate>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/flashcards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update flashcard');
      
      const updatedFlashcard = await response.json();
      setFlashcards(prev => prev.map(card => 
        card.id === id ? updatedFlashcard : card
      ));
      return updatedFlashcard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const deleteFlashcard = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/flashcards/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete flashcard');
      
      setFlashcards(prev => prev.filter(card => card.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  return {
    flashcards,
    loading,
    error,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    refetchFlashcards: fetchFlashcards
  };
}

export function useStudyStats() {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/analytics/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetchStats: fetchStats };
}

export function useDueCards() {
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDueCards = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/study/due`);
      if (!response.ok) throw new Error('Failed to fetch due cards');
      
      const cards = await response.json();
      setDueCards(cards);
    } catch (err) {
      console.error('Error fetching due cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueCards();
  }, []);

  return { dueCards, loading, refetchDueCards: fetchDueCards };
}