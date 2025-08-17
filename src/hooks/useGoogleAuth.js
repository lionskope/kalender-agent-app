import { useState, useCallback, useEffect } from 'react';

// Google OAuth2 Konfiguration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "824903097451-sj1qur0tuon669812hbp8ogpon0ka6b3.apps.googleusercontent.com";

// Utility-Funktion zum Refresh des Access Tokens
// Für Prototyp: Verwende Google Identity Services für Token-Refresh
async function refreshAccessToken() {
  try {
    // Für Prototyp: Verwende Google Identity Services
    // Das ist sicherer als Client Secret im Frontend
    if (!window.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services nicht verfügbar');
    }

    // Verwende Google Identity Services für Token-Refresh
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks',
        access_type: 'offline',
        prompt: 'consent',
        callback: (resp) => {
          if (resp.error) {
            reject(new Error(resp.error));
          } else {
            resolve({
              access_token: resp.access_token,
              expires_in: resp.expires_in || 3600,
              token_type: 'Bearer',
            });
          }
        },
      });
      client.requestAccessToken();
    });
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

// Utility-Funktion zum Prüfen ob Token abgelaufen ist
function isTokenExpired(tokenData) {
  if (!tokenData || !tokenData.expires_at) return true;
  return Date.now() >= tokenData.expires_at;
}

// Utility-Funktion zum Laden der gespeicherten Token
function loadStoredTokens() {
  try {
    const stored = localStorage.getItem('google-auth-tokens');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading stored tokens:', error);
    return null;
  }
}

// Utility-Funktion zum Speichern der Token
function saveTokens(accessToken, refreshToken, expiresIn) {
  try {
    const tokenData = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: Date.now() + (expiresIn * 1000),
      created_at: Date.now(),
    };
    localStorage.setItem('google-auth-tokens', JSON.stringify(tokenData));
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
}

// Utility-Funktion zum Laden der User-Info
async function loadUserInfo(accessToken) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load user info: ${response.status}`);
    }
    
    const userData = await response.json();
    return {
      name: userData.name,
      email: userData.email,
      picture: userData.picture,
    };
  } catch (error) {
    console.error('Error loading user info:', error);
    throw error;
  }
}

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
  const [loading, setLoading] = useState(true); // Startet mit loading=true
  const [error, setError] = useState(null);

  // Initialisierung beim App-Start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialisierung der Authentifizierung
  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lade gespeicherte Token
      const storedTokens = loadStoredTokens();
      console.log('Stored tokens:', storedTokens);
      
      if (!storedTokens) {
        // Keine Token vorhanden
        console.log('No stored tokens found');
        setLoading(false);
        return;
      }

      // Prüfe ob Access Token noch gültig ist
      if (!isTokenExpired(storedTokens)) {
        // Token ist noch gültig
        console.log('Token still valid, loading user info...');
        setAccessToken(storedTokens.access_token);
        try {
          const userInfo = await loadUserInfo(storedTokens.access_token);
          setUser(userInfo);
          console.log('User loaded successfully:', userInfo);
        } catch (error) {
          console.error('Failed to load user info:', error);
          // Token ist ungültig, lösche es
          localStorage.removeItem('google-auth-tokens');
        }
        setLoading(false);
        return;
      }

      // Token ist abgelaufen
      console.log('Token expired, attempting refresh...');
      
      // Für Prototyp: Verwende Google Identity Services für neuen Token
      try {
        await loadGoogleScriptPromise();
        
        const newTokenData = await refreshAccessToken();
        
        // Speichere neue Token
        saveTokens(
          newTokenData.access_token,
          storedTokens.refresh_token || null, // Refresh Token falls vorhanden
          newTokenData.expires_in
        );

        setAccessToken(newTokenData.access_token);
        const userInfo = await loadUserInfo(newTokenData.access_token);
        setUser(userInfo);
        console.log('Token refreshed successfully');
        setLoading(false);
        return;
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh fehlgeschlagen, lösche gespeicherte Token
        localStorage.removeItem('google-auth-tokens');
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Login mit Refresh Token Support
  const login = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await loadGoogleScriptPromise();
      
      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services nicht verfügbar.');
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks',
        access_type: 'offline', // Wichtig für Refresh Token
        prompt: 'consent', // Wichtig für Refresh Token
        callback: async (resp) => {
          if (resp.error) {
            console.error('Login error:', resp.error);
            setError(resp.error);
            setLoading(false);
          } else {
            try {
              console.log('Login successful, saving tokens...');
              // Speichere Token (inkl. Refresh Token falls vorhanden)
              saveTokens(
                resp.access_token,
                resp.refresh_token, // Kann undefined sein beim ersten Login
                resp.expires_in || 3600
              );

              setAccessToken(resp.access_token);
              
              // Lade User-Info
              const userInfo = await loadUserInfo(resp.access_token);
              setUser(userInfo);
              console.log('User logged in successfully:', userInfo);
              setLoading(false);
            } catch (error) {
              console.error('Error after login:', error);
              setError(error.message);
              setLoading(false);
            }
          }
        },
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
    localStorage.removeItem('google-auth-tokens');
  }, []);

  // Manueller Token Refresh
  const refreshToken = useCallback(async () => {
    try {
      const newTokenData = await refreshAccessToken();
      
      // Speichere neue Token
      const storedTokens = loadStoredTokens();
      saveTokens(
        newTokenData.access_token,
        storedTokens?.refresh_token || null,
        newTokenData.expires_in
      );

      setAccessToken(newTokenData.access_token);
      return newTokenData.access_token;
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      throw error;
    }
  }, []);

  return { 
    user, 
    accessToken, 
    login, 
    logout, 
    loading, 
    error,
    refreshToken,
    isAuthenticated: !!accessToken && !!user
  };
} 