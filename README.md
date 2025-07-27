# Kalender Agent App

Eine moderne, mobilefreundliche Chatbot-App mit Sprachfunktion, React und Tailwind CSS.

## 🚀 Live Demo

**App:** https://lionskope.github.io/kalender-agent-app/

## 🔧 Setup

### API-Schlüssel einrichten

1. **GitHub Repository Secrets hinzufügen:**
   - Gehe zu: `https://github.com/lionskope/kalender-agent-app/settings/secrets/actions`
   - Füge folgende Secrets hinzu:
     - `VITE_OPENAI_API_KEY`: Dein OpenAI API Key
     - `VITE_GOOGLE_CLIENT_ID`: Deine Google Client ID

2. **GitHub Pages Source ändern:**
   - Gehe zu: `https://github.com/lionskope/kalender-agent-app/settings/pages`
   - Ändere Source von "Deploy from a branch" zu "GitHub Actions"

3. **Automatisches Deployment:**
   - Bei jedem Push wird die App automatisch neu deployed
   - Die API-Schlüssel werden sicher in den Build eingebettet

### Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# .env Datei erstellen
echo "VITE_OPENAI_API_KEY=your_openai_api_key_here" > .env
echo "VITE_GOOGLE_CLIENT_ID=your_google_client_id_here" >> .env

# Development Server starten
npm run dev
```

## 🛠️ Technologien

- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS
- **AI:** OpenAI ChatGPT API
- **Authentication:** Google OAuth 2.0
- **Deployment:** GitHub Pages + GitHub Actions

## 📱 Features

- 🤖 Intelligenter Chatbot mit OpenAI
- 🎤 Sprach-zu-Text Funktion
- 📅 Google Calendar Integration
- ✅ Google Tasks Integration
- 📱 Responsive Design
- 🌙 Dark/Light Mode
- ⚡ Schnelle Performance

## 🔒 Sicherheit

- API-Schlüssel werden als GitHub Secrets gespeichert
- Keine sensiblen Daten im Code
- Sichere OAuth 2.0 Implementation # Test deployment
