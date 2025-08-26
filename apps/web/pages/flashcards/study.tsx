import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDueCards, useFlashcards } from '../../hooks/useFlashcards';
import { Flashcard, QUALITY_LABELS } from '../../types/flashcard';

export default function StudySession() {
  const { dueCards, loading, error, reviewCard } = useDueCards();
  const { flashcards } = useFlashcards();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    cardsStudied: 0,
    correctAnswers: 0,
    averageQuality: 0,
    totalQualityPoints: 0
  });

  const currentCard = dueCards[currentCardIndex];
  const hasCards = dueCards.length > 0;
  const isLastCard = currentCardIndex === dueCards.length - 1;

  const handleReveal = () => {
    setShowAnswer(true);
  };

  const handleQualityRating = async (quality: number) => {
    if (!currentCard) return;

    try {
      await reviewCard(currentCard.id, quality);
      
      // Update session stats
      const newCardsStudied = sessionStats.cardsStudied + 1;
      const newTotalQuality = sessionStats.totalQualityPoints + quality;
      const newCorrectAnswers = sessionStats.correctAnswers + (quality >= 3 ? 1 : 0);
      
      setSessionStats({
        cardsStudied: newCardsStudied,
        correctAnswers: newCorrectAnswers,
        averageQuality: newTotalQuality / newCardsStudied,
        totalQualityPoints: newTotalQuality
      });

      // Move to next card or finish session
      if (isLastCard) {
        // Session completed
        setCurrentCardIndex(0);
        setShowAnswer(false);
      } else {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
      }
    } catch (error) {
      console.error('Failed to record review:', error);
    }
  };

  const resetSession = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionStats({
      cardsStudied: 0,
      correctAnswers: 0,
      averageQuality: 0,
      totalQualityPoints: 0
    });
  };

  const getQualityColor = (quality: number) => {
    if (quality <= 1) return '#FF6B6B';
    if (quality <= 2) return '#FFB84D';
    if (quality <= 3) return '#4ECDC4';
    if (quality <= 4) return '#45B7D1';
    return '#96CEB4';
  };

  const getProgressPercentage = () => {
    if (dueCards.length === 0) return 0;
    return ((sessionStats.cardsStudied) / dueCards.length) * 100;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
          <h2>Loading your study session...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/flashcards" style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}>
            ← Back to Flashcards
          </Link>
          <h1 style={{ 
            color: 'white', 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🧠 Study Session
          </h1>
        </div>

        {/* Progress Bar */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ color: 'white', fontSize: '0.9rem' }}>
              Progress: {sessionStats.cardsStudied} / {dueCards.length} cards
            </span>
            <span style={{ color: 'white', fontSize: '0.9rem' }}>
              Accuracy: {sessionStats.cardsStudied > 0 ? Math.round((sessionStats.correctAnswers / sessionStats.cardsStudied) * 100) : 0}%
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${getProgressPercentage()}%`, 
              height: '100%', 
              background: 'linear-gradient(45deg, #4ECDC4, #45B7D1)',
              transition: 'width 0.3s ease'
            }} />
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

        {/* No Cards Message */}
        {!hasCards && !loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>
              {flashcards.length === 0 ? 'No flashcards available' : 'All caught up!'}
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
              {flashcards.length === 0 
                ? 'Create some flashcards to start studying with spaced repetition.'
                : 'You have no cards due for review right now. Great job staying on top of your studies!'
              }
            </p>
            <Link href="/flashcards" style={{
              display: 'inline-block',
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              color: 'white',
              textDecoration: 'none',
              padding: '1rem 2rem',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}>
              {flashcards.length === 0 ? 'Create Flashcards' : 'Manage Flashcards'}
            </Link>
          </div>
        )}

        {/* Study Card */}
        {hasCards && currentCard && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '3rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            marginBottom: '2rem',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '1rem'
              }}>
                Card {currentCardIndex + 1} of {dueCards.length}
              </div>
              
              <h2 style={{ 
                color: 'white', 
                fontSize: '1.8rem', 
                marginBottom: '2rem',
                lineHeight: '1.4'
              }}>
                {currentCard.question}
              </h2>

              {!showAnswer ? (
                <button
                  onClick={handleReveal}
                  style={{
                    background: 'linear-gradient(45deg, #4ECDC4, #45B7D1)',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Show Answer
                </button>
              ) : (
                <div>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem'
                  }}>
                    <h3 style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '1rem',
                      marginBottom: '0.5rem'
                    }}>
                      Answer:
                    </h3>
                    <p style={{ 
                      color: 'white', 
                      fontSize: '1.3rem',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {currentCard.answer}
                    </p>
                  </div>

                  <div>
                    <h4 style={{ 
                      color: 'white', 
                      marginBottom: '1rem',
                      fontSize: '1.1rem'
                    }}>
                      How well did you know this?
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                      gap: '0.5rem',
                      maxWidth: '600px',
                      margin: '0 auto'
                    }}>
                      {Object.entries(QUALITY_LABELS).map(([quality, label]) => (
                        <button
                          key={quality}
                          onClick={() => handleQualityRating(parseInt(quality))}
                          style={{
                            background: getQualityColor(parseInt(quality)),
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 0.5rem',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'center'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {quality}: {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Session Summary */}
        {sessionStats.cardsStudied > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Session Statistics</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '1rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '2rem', color: '#4ECDC4' }}>{sessionStats.cardsStudied}</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Cards Studied</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', color: '#96CEB4' }}>{sessionStats.correctAnswers}</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Correct</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', color: '#45B7D1' }}>
                  {sessionStats.averageQuality.toFixed(1)}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Avg Quality</div>
              </div>
            </div>
            
            {sessionStats.cardsStudied >= dueCards.length && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  onClick={resetSession}
                  style={{
                    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Start New Session
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}