import { useState, useCallback } from 'react';

// Deine Google Client-ID
const GOOGLE_CLIENT_ID = "824903097451-sj1qur0tuon669812hbp8ogpon0ka6b3.apps.googleusercontent.com";

function loadGoogleScriptPromise() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) return resolve();
    if (document.getElementById('google-identity')) {
      // Script ist schon da, warte auf window.google
      const check = () => {
        if (window.google && window.google.accounts) resolve();
        else setTimeout(check, 50);
      };
      check();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.id = 'google-identity';
    script.onload = () => {
      if (window.google && window.google.accounts) resolve();
      else reject(new Error('Google Script geladen, aber window.google nicht verfügbar.'));
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function useGoogleAuth() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login Popup öffnen
  const login = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadGoogleScriptPromise();
      if (!window.google?.accounts?.oauth2) throw new Error('Google Identity Services nicht verfügbar.');
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks',
        callback: (resp) => {
          if (resp.error) {
            setError(resp.error);
            setLoading(false);
          } else {
            setAccessToken(resp.access_token);
            // Userinfo holen
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${resp.access_token}` },
            })
              .then(r => r.json())
              .then(data => {
                setUser({ name: data.name, email: data.email, picture: data.picture });
                setLoading(false);
              })
              .catch(() => setLoading(false));
          }
        },
        prompt: '' // kein automatischer Prompt
      });
      client.requestAccessToken();
    } catch (err) {
      setError(err.message || 'Google Login Fehler');
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  return { user, accessToken, login, logout, loading, error };
} 