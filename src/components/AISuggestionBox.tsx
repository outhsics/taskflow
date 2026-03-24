import React, { useState, useEffect } from 'react';
import { settingsRepository } from '@/repositories/SettingsRepository';
import { AISuggestion } from '@/types';
import './AISuggestionBox.css';

export function AISuggestionBox() {
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    checkAIEnabled();
  }, []);

  async function checkAIEnabled() {
    const isEnabled = await settingsRepository.isAIEnabled();
    setEnabled(isEnabled);
  }

  async function getSuggestions() {
    setLoading(true);
    try {
      const hasKey = await settingsRepository.hasApiKey();
      if (!hasKey) {
        setSuggestion({
          id: 'no-key',
          type: 'custom',
          message: 'Configure your OpenAI API key in settings to enable AI suggestions.',
          timestamp: new Date(),
        });
        return;
      }

      // TODO: Implement actual AI suggestion logic
      // For now, show a placeholder
      setSuggestion({
        id: 'placeholder',
        type: 'productivity',
        message: 'AI suggestions will appear here after you complete more tasks. Keep tracking your tasks!',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    setSuggestion(null);
  }

  async function handleAccept() {
    if (suggestion?.action) {
      try {
        await suggestion.action();
      } catch (error) {
        console.error('Failed to accept suggestion:', error);
      }
    }
    setSuggestion(null);
  }

  if (!enabled) {
    return null;
  }

  if (loading) {
    return (
      <div className="ai-suggestion-box loading">
        <span className="ai-icon">🤖</span>
        <span className="ai-message">Analyzing your tasks...</span>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="ai-suggestion-box">
        <span className="ai-icon">🤖</span>
        <span className="ai-message">
          Click <button onClick={getSuggestions} className="ai-link">here</button> to get AI suggestions
        </span>
      </div>
    );
  }

  return (
    <div className="ai-suggestion-box">
      <span className="ai-icon">🤖</span>
      <span className="ai-message">{suggestion.message}</span>
      <div className="ai-actions">
        {suggestion.action && (
          <button onClick={handleAccept} className="ai-btn ai-btn-accept">
            Accept
          </button>
        )}
        <button onClick={handleDismiss} className="ai-btn ai-btn-dismiss">
          Dismiss
        </button>
      </div>
    </div>
  );
}
