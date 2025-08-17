import React, { useState, useRef } from 'react';
import ChatMessage from './components/ChatMessage';
import { MicrophoneIcon, PaperAirplaneIcon, SpeakerWaveIcon } from './icons.jsx';
import GoogleLoginButton from './components/GoogleLoginButton.jsx';
import GoogleTasksPanel from './components/GoogleTasksPanel.jsx';
import CookieBanner from './components/CookieBanner.jsx';
import useGoogleAuth from './hooks/useGoogleAuth.js';
import useGoogleTasks from './hooks/useGoogleTasks.js';
import useCookiePreferences from './hooks/useCookiePreferences.js';

// Platzhalterfunktionen für Google APIs
function createGoogleEvent(data) {
  console.log('TODO: createGoogleEvent', data);
}
function createGoogleTask(data) {
  console.log('TODO: createGoogleTask', data);
}
function getTodaysEvents() {
  console.log('TODO: getTodaysEvents');
}

// Platzhalterfunktion für Google Calendar
async function createGoogleEventFromText(text, accessToken) {
  if (!accessToken) return 'Du bist nicht mit Google eingeloggt.';
  let title = 'Neuer Termin';
  let start, end;
  const now = new Date();

  // 1. Versuche: "morgen um 10 Uhr ..." oder "heute Abend 23 Uhr ..."
  let match;
  if ((match = text.match(/morgen.*?(\d{1,2})([:\.]?(\d{2}))? ?uhr/i))) {
    // Morgen
    const hour = parseInt(match[1], 10);
    const minute = match[3] ? parseInt(match[3], 10) : 0;
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour, minute, 0);
    start = tomorrow.toISOString();
    end = new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString();
    title = text.replace(/.*morgen.*?\d{1,2}([:\.]?\d{2})? ?uhr/i, '').trim() || 'Neuer Termin';
  } else if ((match = text.match(/heute.*?(\d{1,2})([:\.]?(\d{2}))? ?uhr/i))) {
    // Heute
    const hour = parseInt(match[1], 10);
    const minute = match[3] ? parseInt(match[3], 10) : 0;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
    start = today.toISOString();
    end = new Date(today.getTime() + 60 * 60 * 1000).toISOString();
    title = text.replace(/.*heute.*?\d{1,2}([:\.]?\d{2})? ?uhr/i, '').trim() || 'Neuer Termin';
  } else if ((match = text.match(/am (\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?(?: um)? (\d{1,2})([:\.]?(\d{2}))? ?uhr/i))) {
    // Konkretes Datum: am 25.06. um 18 Uhr
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = match[3] ? parseInt(match[3], 10) : now.getFullYear();
    const hour = parseInt(match[4], 10);
    const minute = match[6] ? parseInt(match[6], 10) : 0;
    const date = new Date(year, month, day, hour, minute, 0);
    start = date.toISOString();
    end = new Date(date.getTime() + 60 * 60 * 1000).toISOString();
    title = text.replace(/am \d{1,2}\.\d{1,2}(?:\.\d{2,4})?(?: um)? \d{1,2}([:\.]?\d{2})? ?uhr/i, '').trim() || 'Neuer Termin';
  } else if ((match = text.match(/(\d{1,2}) ?uhr/i))) {
    // Fallback: Irgendeine Uhrzeit heute
    const hour = parseInt(match[1], 10);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0);
    start = today.toISOString();
    end = new Date(today.getTime() + 60 * 60 * 1000).toISOString();
    title = text.replace(/.*\d{1,2} ?uhr/i, '').trim() || 'Neuer Termin';
  } else {
    // Kein Datum/Uhrzeit erkannt
    return 'Ich konnte kein Datum oder keine Uhrzeit erkennen. Bitte formuliere z.B. "morgen um 10 Uhr Meeting" oder "am 25.06. um 18 Uhr Kino".';
  }

  // Google Calendar API Call
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: title,
        start: { dateTime: start },
        end: { dateTime: end },
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      return `Fehler beim Anlegen des Termins: ${res.status} ${res.statusText} - ${err.error?.message || JSON.stringify(err)}`;
    }
    return `Termin "${title}" wurde erfolgreich im Google Kalender angelegt!`;
  } catch (e) {
    return `Fehler beim Anlegen des Termins: ${e.message}`;
  }
}

const initialMessages = [
  { sender: 'bot', text: 'Hallo! Mit mir kannst du Termine einfach über Spracheingabe erstellen. Probiere "Erinner mich an Einkaufen gehen" für GOOGLE TASK oder "erstelle mir einen termin morgen um 14 uhr Zahnarzt" für GOOGLE KALENDER!' }
];

// Hilfsfunktion: OpenAI ChatGPT API Call
async function fetchChatGPTMessage(message) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API Key fehlt! Bitte setze VITE_OPENAI_API_KEY in deiner .env Datei.');
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Du bist ein hilfreicher deutschsprachiger Assistent für Aufgaben und Termine.' },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    let errorText = 'OpenAI API Fehler';
    try {
      const errData = await res.json();
      errorText += ` (${res.status}): ${errData.error?.message || JSON.stringify(errData)}`;
    } catch (e) {
      errorText += ` (${res.status})`;
    }
    throw new Error(errorText);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Fehler: Keine Antwort erhalten.';
}

// Google API-Zugangsdaten (aus Umgebungsvariablen)
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "824903097451-sj1qur0tuon669812hbp8ogpon0ka6b3.apps.googleusercontent.com";
const googleCallbackUrl = import.meta.env.VITE_GOOGLE_CALLBACK_URL || "http://localhost:5183/auth/callback";
const sessionSecret = "meineSuperGeheimeZufallsZeichenkette123!§$%&/()=abc";

export default function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [showTasksPanel, setShowTasksPanel] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const { user, accessToken, login, logout, loading, error, refreshToken, isAuthenticated } = useGoogleAuth();
  const { create_task } = useGoogleTasks(accessToken, refreshToken);
  const { isFunctionalAccepted, isLoaded: cookieLoaded } = useCookiePreferences();
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem('auto-voice-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [hasAutoStarted, setHasAutoStarted] = useState(() => {
    // Reset beim App-Start
    return false;
  });

  // Platzhalter für Google Login
  const handleGoogleLogin = () => {
    // TODO: Echte Google OAuth Integration
    setUser({ name: 'Max Mustermann', email: 'max@example.com' });
    alert('Google Login (Platzhalter): Erfolgreich angemeldet!');
  };

  // Sprache zu Text (Web Speech API)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Spracherkennung wird von deinem Browser nicht unterstützt.');
      return;
    }
    
    // Prüfe Cookie-Einstellungen für funktionale Cookies
    if (!isFunctionalAccepted()) {
      alert('Bitte akzeptiere die funktionalen Cookies, um die Spracherkennung zu nutzen.');
      return;
    }
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      setTimeout(() => {
        // Automatisch absenden, wenn Text erkannt wurde
        document.getElementById('chat-input-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }, 100);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
    setListening(true);
    recognitionRef.current = recognition;
  };

  // Text zu Sprache (SpeechSynthesis)
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'de-DE';
      // Suche nach einer hochwertigen deutschen Stimme
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.lang === 'de-DE' &&
        (v.name.includes('Google') || v.name.includes('Apple') || v.name.includes('Microsoft') || v.name.includes('Siri') || v.name.includes('Vicki') || v.name.includes('Anna'))
      );
      if (preferred) utter.voice = preferred;
      window.speechSynthesis.speak(utter);
    }
  };

  // Scroll zum Chat-Ende
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Automatisch Sprachmodus starten beim App-Start (nur einmal)
  React.useEffect(() => {
    // Nur beim ersten Laden der App
    if (!hasAutoStarted && autoVoiceEnabled) {
      console.log('Auto-Voice Check:', { cookieLoaded, functionalAccepted: isFunctionalAccepted(), autoVoiceEnabled, listening, hasAutoStarted });
      
      // Warte kurz, bis die App vollständig geladen ist
      const timer = setTimeout(() => {
        // Einfache Prüfung: Wenn funktionale Cookies akzeptiert oder noch nicht geladen
        if ((cookieLoaded && isFunctionalAccepted()) || !cookieLoaded) {
          console.log('Starting auto voice mode...');
          // Zeige eine kurze Nachricht an, dass der Sprachmodus startet
          const autoStartMsg = { sender: 'bot', text: '🎤 Sprachmodus wird automatisch gestartet... Sprich jetzt!' };
          setMessages(msgs => [...msgs, autoStartMsg]);
          startListening();
          setHasAutoStarted(true); // Markiere als gestartet
        } else {
          console.log('Functional cookies not accepted yet');
        }
      }, 1500); // 1.5 Sekunden Verzögerung

      return () => clearTimeout(timer);
    }
  }, [cookieLoaded, isFunctionalAccepted, autoVoiceEnabled, hasAutoStarted]);

  // API Call mit automatischem Token-Refresh
  const makeApiCallWithRefresh = async (apiCall) => {
    try {
      return await apiCall();
    } catch (error) {
      if (error.message.includes('Token expired') || error.message.includes('401')) {
        try {
          console.log('Attempting token refresh...');
          await refreshToken();
          // Versuche den API-Call erneut
          return await apiCall();
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.');
        }
      }
      throw error;
    }
  };

  // Nachricht senden
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');

    // Erkenne Kalender-Befehl (deutlich erweitert)
    const kalenderRegex = /\b(erstelle(n)?( mir)?( einen| einen neuen| einen weiteren)? ?termin|trage (mir )?einen termin ein|kalendereintrag|termin für|ich brauche einen termin|neuer termin|termin am|termin um|meeting|besprechung|appointment|treffen)\b/i;
    if (kalenderRegex.test(input)) {
      if (isAuthenticated) {
        try {
          const info = await makeApiCallWithRefresh(() => createGoogleEventFromText(input, accessToken));
          const botMsg = { sender: 'bot', text: info };
          setMessages((msgs) => [...msgs, botMsg]);
          speak(botMsg.text);
          return;
        } catch (error) {
          const botMsg = { sender: 'bot', text: `❌ Fehler beim Erstellen des Termins: ${error.message}` };
          setMessages((msgs) => [...msgs, botMsg]);
          speak(botMsg.text);
          return;
        }
      } else {
        const botMsg = { sender: 'bot', text: 'Bitte melden Sie sich zuerst mit Google an, um Termine zu erstellen.' };
        setMessages((msgs) => [...msgs, botMsg]);
        speak(botMsg.text);
        return;
      }
    }

    // Erkenne Tasks-Befehl
    const tasksRegex = /\b(erstelle(n)?( mir)?( eine| eine neue| eine weitere)? ?aufgabe|trage (mir )?eine aufgabe ein|task für|ich brauche eine aufgabe|neue aufgabe|aufgabe erstellen|todo|to-do|task|aufgabe)\b/i;
    if (tasksRegex.test(input)) {
      setShowTasksPanel(true);
      const botMsg = { sender: 'bot', text: 'Ich öffne das Tasks-Panel für Sie. Dort können Sie neue Aufgaben erstellen und verwalten.' };
      setMessages((msgs) => [...msgs, botMsg]);
      speak(botMsg.text);
      return;
    }

    // Erkenne Erinnerungs-Befehl (Tasks)
    const reminderRegex = /\b(erinner mich|erinnere mich)\b/i;
    if (reminderRegex.test(input)) {
      // Extrahiere den Erinnerungstext
      const reminderMatch = input.match(/\berinner(?:e)? mich\s+(.+)/i);
      if (reminderMatch) {
        const reminderText = reminderMatch[1].trim();
        
        // Versuche, ein Datum/Uhrzeit zu erkennen
        let dueDate = null;
        let title = reminderText;
        
        // Datum/Uhrzeit Erkennung verbessern
        const dateTimeMatch = input.match(/\b(heute|morgen|übermorgen|nächste woche|nächsten montag|nächsten dienstag|nächsten mittwoch|nächsten donnerstag|nächsten freitag|nächsten samstag|nächsten sonntag)\b/i);
        if (dateTimeMatch) {
          const dateKeyword = dateTimeMatch[1].toLowerCase();
          const today = new Date();
          
          switch (dateKeyword) {
            case 'heute':
              dueDate = today.toISOString().split('T')[0];
              break;
            case 'morgen':
              today.setDate(today.getDate() + 1);
              dueDate = today.toISOString().split('T')[0];
              break;
            case 'übermorgen':
              today.setDate(today.getDate() + 2);
              dueDate = today.toISOString().split('T')[0];
              break;
            case 'nächste woche':
              today.setDate(today.getDate() + 7);
              dueDate = today.toISOString().split('T')[0];
              break;
            default:
              // Für Wochentage
              const weekdays = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag'];
              const targetDay = weekdays.findIndex(day => dateKeyword.includes(day));
              if (targetDay !== -1) {
                let daysUntilTarget = (targetDay - today.getDay() + 7) % 7;
                if (daysUntilTarget === 0) daysUntilTarget = 7; // Nächste Woche
                today.setDate(today.getDate() + daysUntilTarget);
                dueDate = today.toISOString().split('T')[0];
              }
          }
        }
        
        // Bereinige den Titel von Datums-Texten
        title = title.replace(/\b(heute|morgen|übermorgen|nächste woche|nächsten montag|nächsten dienstag|nächsten mittwoch|nächsten donnerstag|nächsten freitag|nächsten samstag|nächsten sonntag)\b/gi, '').trim();
        title = title.replace(/\b(an|an den|an die)\b/gi, '').trim();
        
        // Erstelle die Aufgabe über die Tasks API
        if (isAuthenticated) {
          try {
            await makeApiCallWithRefresh(() => create_task(title, dueDate, 'Erinnerung erstellt über Chat'));
            
            const botMsg = { 
              sender: 'bot', 
              text: `✅ Erinnerung "${title}" wurde erfolgreich als Aufgabe erstellt!${dueDate ? ` Fällig am: ${dueDate}` : ''}` 
            };
            setMessages((msgs) => [...msgs, botMsg]);
            speak(botMsg.text);
            return;
          } catch (error) {
            const botMsg = { 
              sender: 'bot', 
              text: `❌ Fehler beim Erstellen der Erinnerung: ${error.message}` 
            };
            setMessages((msgs) => [...msgs, botMsg]);
            speak(botMsg.text);
            return;
          }
        } else {
          const botMsg = { 
            sender: 'bot', 
            text: 'Bitte melden Sie sich zuerst mit Google an, um Erinnerungen zu erstellen.' 
          };
          setMessages((msgs) => [...msgs, botMsg]);
          speak(botMsg.text);
          return;
        }
      }
    }

    try {
      const reply = await fetchChatGPTMessage(input);
      const botMsg = { sender: 'bot', text: reply };
      setMessages((msgs) => [...msgs, botMsg]);
      speak(botMsg.text);
    } catch (err) {
      const botMsg = { sender: 'bot', text: 'Fehler bei der Kommunikation mit ChatGPT: ' + err.message };
      setMessages((msgs) => [...msgs, botMsg]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-100 to-sky-50 font-sfpro">

      
      {/* Voice-Modal im Apple Design */}
      {listening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 border border-gray-200 animate-fade-in" style={{minWidth:320, minHeight:260}}>
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg mb-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 18.75v1.5m0 0h3m-3 0H9m6-6a3 3 0 01-6 0V6a3 3 0 016 0v7.5z"/></svg>
            </div>
            <div className="w-32 h-8 flex items-center justify-center">
              {/* Wellenform-Animation */}
              <div className="flex gap-1">
                <div className="w-2 h-6 bg-sky-400 rounded animate-wave1" />
                <div className="w-2 h-4 bg-sky-300 rounded animate-wave2" />
                <div className="w-2 h-8 bg-sky-500 rounded animate-wave3" />
                <div className="w-2 h-5 bg-sky-400 rounded animate-wave1" />
                <div className="w-2 h-7 bg-sky-300 rounded animate-wave2" />
              </div>
            </div>
            <div className="mt-2 text-lg font-semibold text-gray-700 font-sfpro">Sprich jetzt…</div>
            <button onClick={()=>{recognitionRef.current?.stop(); setListening(false);}} className="mt-4 px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm border border-gray-200 transition active:scale-95">Abbrechen</button>
          </div>
        </div>
      )}
      <header className="p-6 bg-white/80 backdrop-blur-md shadow-xl flex flex-col items-center gap-2 rounded-b-3xl border-b border-gray-200 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm" style={{fontFamily:'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif', letterSpacing:'-0.02em'}}>Kalender Agent</h1>
        
        {/* Loading State */}
        {loading && (
          <div className="mt-4 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Authentifizierung lädt...</span>
          </div>
        )}
        
        {/* Login Button */}
        {!loading && !user && (
          <div className="mt-4 w-full max-w-xs">
            <GoogleLoginButton 
              onClick={() => {
                if (!isFunctionalAccepted()) {
                  alert('Bitte akzeptiere die funktionalen Cookies, um dich mit Google anzumelden.');
                  return;
                }
                login();
              }} 
              disabled={loading || !isFunctionalAccepted()} 
            />
          </div>
        )}
        
        {/* User Info */}
        {!loading && user && (
          <div className="flex items-center gap-3 mt-2">
            <img src={user.picture} alt="Profil" className="w-10 h-10 rounded-full border border-gray-200 shadow" />
            <span className="font-semibold text-gray-800" style={{fontFamily:'SF Pro Text, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif'}}>{user.name}</span>
            <button onClick={logout} className="ml-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm border border-gray-200 transition active:scale-95">Logout</button>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </header>
      <main className="flex-1 flex flex-col max-w-lg w-full mx-auto p-2 pb-32">
        {/* Google Tasks Panel */}
        {showTasksPanel && user && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Aufgaben verwalten</h3>
              <button
                onClick={() => setShowTasksPanel(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <GoogleTasksPanel user={user} accessToken={accessToken} />
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto space-y-2 pt-2 pb-4" style={{ minHeight: 0 }}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} sender={msg.sender} text={msg.text} />
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>
      
      {/* Mobile-optimierte Eingabeleiste */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-lg mx-auto p-3">
          {/* Mikrofon-Button und Auto-Voice Toggle */}
          <div className="flex justify-center items-center gap-3 mb-2">
            <button
              type="button"
              onClick={startListening}
              className={`p-3 rounded-full ${listening ? 'bg-sky-200' : 'bg-sky-100'} hover:bg-sky-200 transition shadow-md`}
              aria-label="Spracheingabe starten"
              disabled={listening}
            >
              <MicrophoneIcon className="h-7 w-7 text-sky-600" />
            </button>
            
            {/* Auto-Voice Toggle */}
            <button
              type="button"
              onClick={() => {
                const newValue = !autoVoiceEnabled;
                setAutoVoiceEnabled(newValue);
                localStorage.setItem('auto-voice-enabled', JSON.stringify(newValue));
                
                // Wenn aktiviert, starte sofort den Sprachmodus
                if (newValue && !hasAutoStarted) {
                  setTimeout(() => {
                    const autoStartMsg = { sender: 'bot', text: '🎤 Auto-Sprachmodus aktiviert! Sprich jetzt!' };
                    setMessages(msgs => [...msgs, autoStartMsg]);
                    startListening();
                    setHasAutoStarted(true);
                  }, 500);
                }
              }}
              className={`p-2 rounded-full transition shadow-md ${
                autoVoiceEnabled 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}
              aria-label="Automatischen Sprachmodus umschalten"
              title={autoVoiceEnabled ? 'Auto-Sprachmodus aktiv' : 'Auto-Sprachmodus inaktiv'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
          
          {/* Eingabeleiste */}
          <form id="chat-input-form" onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400 text-base"
              placeholder="Nachricht eingeben..."
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="p-3 rounded-full bg-sky-600 hover:bg-sky-700 transition text-white shadow-md"
              aria-label="Nachricht senden"
            >
              <PaperAirplaneIcon className="h-6 w-6 rotate-90" />
            </button>
          </form>
        </div>
      </div>
      {/* Platzhalter für Google API Buttons */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      </div>
      
      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
}

// Hinweise für .env:
// In einer .env Datei können später OPENAI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_API_KEY etc. hinterlegt werden. 