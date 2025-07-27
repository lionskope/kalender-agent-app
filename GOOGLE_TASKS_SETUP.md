# Google Tasks API Setup

## Problem: Tasks werden nicht erstellt

Wenn Sie die Fehlermeldung "Google Tasks API nicht aktiviert" erhalten, müssen Sie die Google Tasks API in der Google Cloud Console aktivieren.

## Schritt-für-Schritt Anleitung:

### 1. Google Cloud Console öffnen
Gehen Sie zu: https://console.cloud.google.com/

### 2. Projekt auswählen
- Wählen Sie Ihr Google Cloud Projekt aus
- Falls Sie kein Projekt haben, erstellen Sie eines

### 3. Google Tasks API aktivieren
1. Gehen Sie zu "APIs & Services" > "Library"
2. Suchen Sie nach "Google Tasks API"
3. Klicken Sie auf "Google Tasks API"
4. Klicken Sie auf "ENABLE" (Aktivieren)

### 4. OAuth 2.0 Scopes überprüfen
Stellen Sie sicher, dass Ihr OAuth 2.0 Client die folgenden Scopes hat:
- `https://www.googleapis.com/auth/tasks`
- `https://www.googleapis.com/auth/calendar`

### 5. Credentials überprüfen
1. Gehen Sie zu "APIs & Services" > "Credentials"
2. Überprüfen Sie Ihre OAuth 2.0 Client ID
3. Stellen Sie sicher, dass die Client ID korrekt ist: `824903097451-ilmndqqfa247ka93k4rbiapqhov7c6br.apps.googleusercontent.com`

### 6. OAuth Consent Screen
1. Gehen Sie zu "APIs & Services" > "OAuth consent screen"
2. Stellen Sie sicher, dass die Google Tasks API in den Scopes aufgeführt ist

## Debugging

### Browser-Konsole überprüfen
Öffnen Sie die Browser-Konsole (F12) und schauen Sie nach Fehlermeldungen:

```javascript
// Erwartete Logs:
"Hole Tasklisten mit Token: Token vorhanden"
"Tasks API Response Status: 200"
"Tasks API Response: {items: [...]}"
"Gefundene Taskliste: {id: '@default', ...}"
```

### Häufige Fehler:

1. **403 Forbidden**: API nicht aktiviert
2. **401 Unauthorized**: Ungültiger Access Token
3. **404 Not Found**: Keine Taskliste vorhanden

## Test der API

Nach der Aktivierung können Sie die API testen:

1. Melden Sie sich in der App an
2. Öffnen Sie die Browser-Konsole
3. Versuchen Sie eine Aufgabe zu erstellen
4. Überprüfen Sie die Logs

## Alternative: Manuelle API-Tests

Sie können die API auch manuell testen:

```bash
# Mit curl (ersetzen Sie YOUR_ACCESS_TOKEN)
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     https://tasks.googleapis.com/tasks/v1/users/@me/lists
```

## Support

Falls das Problem weiterhin besteht:

1. Überprüfen Sie die Browser-Konsole auf Fehlermeldungen
2. Stellen Sie sicher, dass Sie sich mit dem richtigen Google-Konto angemeldet haben
3. Versuchen Sie sich abzumelden und wieder anzumelden
4. Überprüfen Sie, ob Sie Google Tasks in Ihrem Google-Konto verwenden

## Wichtige Hinweise

- Die Google Tasks API ist kostenlos
- Sie benötigen ein Google-Konto
- Die API hat Limits (1000 Requests pro 100 Sekunden)
- Tasks werden in der Standard-Taskliste erstellt 