import React, { useState } from 'react';
import Link from 'next/link';
import { useStudyStats, useDueCards } from '../hooks/useFlashcards';

export default function Home() {
  const { stats, loading: statsLoading } = useStudyStats();
  const { dueCards, loading: dueLoading } = useDueCards();

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem',
        color: 'white'
      }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🧠 Spaced Repetition Flashcards
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Learn efficiently with the SM-2 algorithm. Create flashcards, study systematically, and track your progress.
          </p>
        </header>

        {/* Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <Link href="/flashcards/study" style={{ textDecoration: 'none' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Start Studying</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                {dueLoading ? 'Loading...' : `${dueCards.length} cards due`}
              </p>
            </div>
          </Link>

          <Link href="/flashcards" style={{ textDecoration: 'none' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Manage Cards</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                {statsLoading ? 'Loading...' : `${stats?.total_cards || 0} cards total`}
              </p>
            </div>
          </Link>

          <Link href="/analytics" style={{ textDecoration: 'none' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>View Progress</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                {statsLoading ? 'Loading...' : `${stats?.accuracy.toFixed(1) || 0}% accuracy`}
              </p>
            </div>
          </Link>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ 
              color: 'white', 
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '1.5rem'
            }}>
              📈 Your Learning Statistics
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFD700' }}>
                  {stats.total_cards}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Total Cards</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF6B6B' }}>
                  {stats.due_today}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Due Today</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4ECDC4' }}>
                  {stats.total_reviews}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Reviews Done</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#45B7D1' }}>
                  {stats.accuracy.toFixed(1)}%
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Accuracy</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#96CEB4' }}>
                  {formatTime(stats.total_study_time)}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Study Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started */}
        {(!stats || stats.total_cards === 0) && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '2rem',
            textAlign: 'center',
            marginTop: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>🚀 Getting Started</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1.5rem' }}>
              Ready to start learning? Create your first flashcard to begin your spaced repetition journey!
            </p>
            <Link href="/flashcards">
              <button style={{
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textDecoration: 'none'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}>
                Create Your First Card
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
