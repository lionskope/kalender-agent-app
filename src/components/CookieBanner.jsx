import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Immer aktiv
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Prüfe, ob Cookie-Einstellungen bereits gespeichert sind
    const savedPreferences = localStorage.getItem('cookie-preferences');
    if (!savedPreferences) {
      setShowBanner(true);
    } else {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-preferences', JSON.stringify(allAccepted));
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookie-preferences', JSON.stringify(onlyNecessary));
    setShowBanner(false);
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Necessary kann nicht deaktiviert werden
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Cookie-Einstellungen</h3>
          </div>

          {/* Beschreibung */}
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            Wir verwenden Cookies, um deine Erfahrung zu verbessern. Du kannst deine Einstellungen jederzeit ändern.
          </p>

          {/* Cookie-Kategorien */}
          <div className="space-y-3 mb-6">
            {/* Notwendige Cookies */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Notwendige Cookies</h4>
                <p className="text-xs text-gray-500">Für die Grundfunktionen der App erforderlich</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Funktional */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Funktionale Cookies</h4>
                <p className="text-xs text-gray-500">Google Anmeldung, Mikrofon-Zugriff</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={() => togglePreference('functional')}
                  className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                <p className="text-xs text-gray-500">Hilft uns die App zu verbessern</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                  className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                <p className="text-xs text-gray-500">Personalisierte Inhalte und Werbung</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                  className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-sky-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-sky-700 transition"
            >
              Alle akzeptieren
            </button>
            <button
              onClick={handleAcceptSelected}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Auswahl speichern
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Alle ablehnen
            </button>
          </div>

          {/* Datenschutz-Link */}
          <p className="text-xs text-gray-500 mt-3 text-center">
            Mehr Informationen in unserer{' '}
            <a href="#" className="text-sky-600 hover:underline">Datenschutzerklärung</a>
          </p>
        </div>
      </div>
    </div>
  );
} 