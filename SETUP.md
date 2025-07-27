# Setup für API-Schlüssel

## 1. .env Datei erstellen

Erstelle eine `.env` Datei im Hauptverzeichnis mit folgenden Inhalten:

```
# OpenAI API Key
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Google API Credentials
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CALLBACK_URL=http://localhost:5183/auth/callback
```

## 2. API-Schlüssel besorgen

- **OpenAI API Key**: Gehe zu [platform.openai.com](https://platform.openai.com) und erstelle einen API-Schlüssel
- **Google Client ID**: Gehe zu [console.cloud.google.com](https://console.cloud.google.com) und erstelle OAuth 2.0 Credentials

## 3. Für Produktion

Für GitHub Pages müssen die Umgebungsvariablen in den GitHub Repository Settings gesetzt werden. 