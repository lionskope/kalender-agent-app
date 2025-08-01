import { useState, useEffect } from 'react';

export default function useCookiePreferences() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Lade gespeicherte Cookie-Einstellungen
    const savedPreferences = localStorage.getItem('cookie-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
      } catch (error) {
        console.error('Fehler beim Laden der Cookie-Einstellungen:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('cookie-preferences', JSON.stringify(newPreferences));
  };

  const hasAccepted = (category) => {
    return preferences[category] || false;
  };

  const isFunctionalAccepted = () => {
    return hasAccepted('functional');
  };

  const isAnalyticsAccepted = () => {
    return hasAccepted('analytics');
  };

  const isMarketingAccepted = () => {
    return hasAccepted('marketing');
  };

  return {
    preferences,
    updatePreferences,
    hasAccepted,
    isFunctionalAccepted,
    isAnalyticsAccepted,
    isMarketingAccepted,
    isLoaded
  };
} 