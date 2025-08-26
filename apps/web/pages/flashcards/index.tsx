import React, { useState } from 'react';
import Link from 'next/link';
import { useFlashcards } from '../../hooks/useFlashcards';
import { Flashcard, FlashcardCreate } from '../../types/flashcard';

export default function FlashcardManager() {
  const { flashcards, loading, error, createFlashcard, deleteFlashcard } = useFlashcards();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<FlashcardCreate>({ question: '', answer: '', tags: [] });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Please fill in both question and answer');
      return;
    }

    setSubmitting(true);
    try {
      await createFlashcard(formData);
      setFormData({ question: '', answer: '', tags: [] });
      setShowCreateForm(false);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (confirm(`Delete flashcard: "${question}"?`)) {
      await deleteFlashcard(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilReview = (nextReview: string) => {
    const days = Math.ceil((new Date(nextReview).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Due now';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <div>
            <Link href="/" style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ 
              color: 'white', 
              fontSize: '2.5rem', 
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              📝 Flashcard Manager
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
              {flashcards.length} cards • {flashcards.filter(card => new Date(card.next_review) <= new Date()).length} due now
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/flashcards/study" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: 'linear-gradient(45deg, #45B7D1, #96CEB4)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                🧠 Start Study
              </button>
            </Link>
            
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                color: 'white',
                border: 'none',
                padding: '1rem 1.5rem',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              + Add New Card
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ 
            background: 'rgba(255, 107, 107, 0.2)',
            border: '1px solid rgba(255, 107, 107, 0.5)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#FF6B6B'
          }}>
            Error: {error}
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Create New Flashcard</h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold',
                    color: '#555'
                  }}>
                    Question *
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    placeholder="Enter your question here..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #e1e5e9',
                      fontSize: '1rem',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold',
                    color: '#555'
                  }}>
                    Answer *
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                    placeholder="Enter the answer here..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #e1e5e9',
                      fontSize: '1rem',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      background: 'white',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: submitting ? '#ccc' : 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                      color: 'white',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {submitting ? 'Creating...' : 'Create Card'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Flashcard Grid */}
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: 'white' 
          }}>
            Loading flashcards...
          </div>
        ) : flashcards.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>No flashcards yet</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Create your first flashcard to start learning with spaced repetition!
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {flashcards.map((card) => (
              <div key={card.id} style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '15px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    background: new Date(card.next_review) <= new Date() ? 'rgba(255, 107, 107, 0.3)' : 'rgba(78, 205, 196, 0.3)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px'
                  }}>
                    {getDaysUntilReview(card.next_review)}
                  </div>
                  
                  <button
                    onClick={() => handleDelete(card.id, card.question)}
                    style={{
                      background: 'rgba(255, 107, 107, 0.2)',
                      border: 'none',
                      color: '#FF6B6B',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Delete
                  </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    color: 'white', 
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}>
                    Q: {card.question}
                  </h4>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    margin: 0,
                    fontSize: '0.95rem'
                  }}>
                    A: {card.answer}
                  </p>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  <span>Interval: {card.interval} days</span>
                  <span>Reviews: {card.total_reviews}</span>
                  <span>Ease: {card.ease_factor.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}