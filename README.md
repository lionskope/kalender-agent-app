# Sprach-Chatbot App

Moderne, mobilefreundliche Single-Page-Webanwendung mit React und Tailwind CSS. Die App bietet eine sprachfähige Chatbot-Oberfläche zur Erstellung von Aufgaben und Terminen (später Google Calendar/Tasks Integration).

## Features
- Chat-UI mit Nachrichtenverlauf
- Text- und Spracheingabe (Web Speech API)
- Optionale Sprachausgabe (SpeechSynthesis)
- Platzhalter für OpenAI ChatGPT API (TODO)
- Platzhalter für Google Calendar/Tasks (TODO)
- Responsives, modernes Design (Tailwind CSS)
- PWA-ready (manifest, Favicon, Meta-Tags)

## Entwicklung
```bash
npm install
npm run dev
```

## .env Hinweise
- Für die spätere API-Integration können folgende Variablen in einer `.env` gepflegt werden:
  - `OPENAI_API_KEY`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_API_KEY`
- Beispiel für Redirect-URI (lokal):
  - http://localhost:5182

## Deployment
- Die App ist als PWA vorbereitet und kann auf jedem modernen Webserver gehostet werden.

---

**Hinweis:**
- Die API-Integrationen (OpenAI, Google) sind aktuell nur als Platzhalter implementiert und müssen noch ergänzt werden. 