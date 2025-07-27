# Google Tasks Integration

Diese App wurde um Google Tasks Funktionalität erweitert. Sie können jetzt Aufgaben erstellen, verwalten und mit Ihrem Google-Konto synchronisieren.

## Features

- ✅ Aufgaben erstellen mit Titel, Fälligkeitsdatum und Notizen
- ✅ Aufgaben als erledigt markieren
- ✅ Aufgaben löschen
- ✅ Alle Aufgaben anzeigen
- ✅ Automatische Synchronisation mit Google Tasks
- ✅ Integration in das Chat-Interface

## Verwendung

### 1. Anmeldung
Melden Sie sich mit Ihrem Google-Konto an. Die App benötigt Zugriff auf:
- Google Calendar (für Termine)
- Google Tasks (für Aufgaben)

### 2. Aufgaben erstellen über Chat
Sie können Aufgaben über das Chat-Interface erstellen:

**Beispiele für Chat-Befehle:**
- "Erstelle eine Aufgabe: Einkaufen gehen"
- "Ich brauche eine Aufgabe für morgen"
- "Neue Aufgabe: Projektpräsentation vorbereiten"
- "Todo: E-Mails beantworten"

### 3. Tasks-Panel verwenden
Nach einem Task-Befehl öffnet sich automatisch das Tasks-Panel, wo Sie:

- Neue Aufgaben erstellen
- Bestehende Aufgaben anzeigen
- Aufgaben als erledigt markieren
- Aufgaben löschen

## API-Funktionen

### `create_task(title, due_date, notes)`

**Parameter:**
- `title` (string, erforderlich): Titel der Aufgabe
- `due_date` (string, optional): Fälligkeitsdatum im Format "YYYY-MM-DD"
- `notes` (string, optional): Zusätzliche Notizen

**Beispiel:**
```javascript
import useGoogleTasks from './hooks/useGoogleTasks';

const { create_task } = useGoogleTasks(accessToken);

// Einfache Aufgabe
await create_task('Einkaufen gehen');

// Aufgabe mit Fälligkeitsdatum
await create_task('Projektpräsentation', '2024-01-15', 'Folien erstellen');

// Aufgabe mit Notizen
await create_task('Doktortermin', null, 'Dr. Müller anrufen unter 0123-456789');
```

### Weitere verfügbare Funktionen:

- `getTasks()` - Alle Aufgaben abrufen
- `deleteTask(taskId)` - Aufgabe löschen
- `completeTask(taskId, completed)` - Aufgabe als erledigt markieren

## Technische Details

### Authentifizierung
Die App verwendet OAuth 2.0 für die Google API-Authentifizierung. Der gleiche Access Token wird für Calendar und Tasks verwendet.

### API-Endpunkte
- Google Tasks API v1
- Standard-Taskliste wird automatisch erkannt
- Alle CRUD-Operationen unterstützt

### Fehlerbehandlung
- Automatische Fehlerbehandlung mit benutzerfreundlichen Meldungen
- Netzwerkfehler werden abgefangen
- Validierung der Eingabedaten

## Beispielcode

Siehe `examples/tasks-example.js` für detaillierte Beispiele zur Verwendung der API.

### Grundlegende Verwendung:
```javascript
const { create_task } = useGoogleTasks(accessToken);

try {
  const task = await create_task('Meine neue Aufgabe');
  console.log('Aufgabe erstellt:', task);
} catch (error) {
  console.error('Fehler:', error.message);
}
```

### Mit Fälligkeitsdatum:
```javascript
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

await create_task(
  'Wichtige Aufgabe',
  tomorrow.toISOString().split('T')[0],
  'Diese Aufgabe ist wichtig!'
);
```

## Troubleshooting

### Häufige Probleme:

1. **"Kein Access Token verfügbar"**
   - Stellen Sie sicher, dass Sie mit Google angemeldet sind
   - Versuchen Sie sich abzumelden und wieder anzumelden

2. **"Keine Taskliste gefunden"**
   - Stellen Sie sicher, dass Sie Google Tasks verwenden
   - Erstellen Sie eine Standard-Taskliste in Google Tasks

3. **"Fehler beim Erstellen der Aufgabe"**
   - Überprüfen Sie Ihre Internetverbindung
   - Stellen Sie sicher, dass der Titel nicht leer ist
   - Überprüfen Sie das Datumsformat (YYYY-MM-DD)

### Support
Bei Problemen überprüfen Sie:
1. Browser-Konsole auf Fehlermeldungen
2. Google-Konto-Einstellungen
3. Internetverbindung
4. API-Berechtigungen in der Google Cloud Console

## Entwicklung

### Neue Features hinzufügen:
1. Erweitern Sie den `useGoogleTasks` Hook
2. Aktualisieren Sie die UI-Komponenten
3. Fügen Sie Chat-Befehle hinzu
4. Testen Sie die Integration

### Testing:
- Testen Sie mit verschiedenen Datumsformaten
- Überprüfen Sie die Fehlerbehandlung
- Testen Sie die Synchronisation mit Google Tasks 