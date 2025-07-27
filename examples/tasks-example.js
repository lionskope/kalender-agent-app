// Beispiel für die Verwendung der create_task Funktion
// Diese Datei zeigt, wie Sie die Google Tasks API in Ihrer App verwenden können

import useGoogleTasks from '../src/hooks/useGoogleTasks';
import { useState } from 'react'; // Added missing import for useState

// Beispiel 1: Grundlegende Verwendung
async function createSimpleTask(accessToken) {
  const { create_task } = useGoogleTasks(accessToken);
  
  try {
    const task = await create_task('Einkaufen gehen');
    console.log('Aufgabe erstellt:', task);
    return task;
  } catch (error) {
    console.error('Fehler beim Erstellen der Aufgabe:', error);
  }
}

// Beispiel 2: Aufgabe mit Fälligkeitsdatum
async function createTaskWithDueDate(accessToken) {
  const { create_task } = useGoogleTasks(accessToken);
  
  try {
    // Aufgabe für morgen
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const task = await create_task(
      'Projektpräsentation vorbereiten',
      tomorrow.toISOString().split('T')[0], // Format: YYYY-MM-DD
      'Folien erstellen und Vortrag üben'
    );
    console.log('Aufgabe mit Fälligkeitsdatum erstellt:', task);
    return task;
  } catch (error) {
    console.error('Fehler beim Erstellen der Aufgabe:', error);
  }
}

// Beispiel 3: Aufgabe mit Notizen
async function createTaskWithNotes(accessToken) {
  const { create_task } = useGoogleTasks(accessToken);
  
  try {
    const task = await create_task(
      'Doktortermin vereinbaren',
      null, // kein Fälligkeitsdatum
      'Dr. Müller anrufen unter 0123-456789\nTermin für nächste Woche vereinbaren'
    );
    console.log('Aufgabe mit Notizen erstellt:', task);
    return task;
  } catch (error) {
    console.error('Fehler beim Erstellen der Aufgabe:', error);
  }
}

// Beispiel 4: Mehrere Aufgaben erstellen
async function createMultipleTasks(accessToken) {
  const { create_task } = useGoogleTasks(accessToken);
  
  const tasks = [
    { title: 'Frühstück machen', due_date: null, notes: 'Müsli und Kaffee' },
    { title: 'E-Mails beantworten', due_date: null, notes: 'Wichtige E-Mails priorisieren' },
    { title: 'Sport treiben', due_date: null, notes: '30 Minuten Cardio' },
  ];
  
  try {
    const createdTasks = [];
    for (const taskData of tasks) {
      const task = await create_task(
        taskData.title,
        taskData.due_date,
        taskData.notes
      );
      createdTasks.push(task);
      console.log(`Aufgabe "${taskData.title}" erstellt`);
    }
    return createdTasks;
  } catch (error) {
    console.error('Fehler beim Erstellen der Aufgaben:', error);
  }
}

// Beispiel 5: Verwendung in einer React-Komponente
function TaskCreatorComponent({ accessToken }) {
  const { create_task, getTasks, deleteTask, completeTask } = useGoogleTasks(accessToken);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Aufgaben laden
  const loadTasks = async () => {
    setLoading(true);
    try {
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Fehler beim Laden der Aufgaben:', error);
    } finally {
      setLoading(false);
    }
  };

  // Neue Aufgabe erstellen
  const handleCreateTask = async (title, dueDate, notes) => {
    try {
      await create_task(title, dueDate, notes);
      // Aufgaben neu laden
      await loadTasks();
      alert('Aufgabe erfolgreich erstellt!');
    } catch (error) {
      alert(`Fehler: ${error.message}`);
    }
  };

  // Aufgabe löschen
  const handleDeleteTask = async (taskId) => {
    if (confirm('Aufgabe wirklich löschen?')) {
      try {
        await deleteTask(taskId);
        await loadTasks();
      } catch (error) {
        alert(`Fehler beim Löschen: ${error.message}`);
      }
    }
  };

  // Aufgabe als erledigt markieren
  const handleCompleteTask = async (taskId, completed) => {
    try {
      await completeTask(taskId, completed);
      await loadTasks();
    } catch (error) {
      alert(`Fehler beim Aktualisieren: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Meine Aufgaben</h2>
      
      {/* Formular für neue Aufgabe */}
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        handleCreateTask(
          formData.get('title'),
          formData.get('dueDate') || null,
          formData.get('notes') || null
        );
        e.target.reset();
      }}>
        <input name="title" placeholder="Aufgabentitel" required />
        <input name="dueDate" type="date" />
        <textarea name="notes" placeholder="Notizen (optional)" />
        <button type="submit">Aufgabe erstellen</button>
      </form>

      {/* Aufgabenliste */}
      {loading ? (
        <p>Lade Aufgaben...</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={!!task.completed}
                onChange={(e) => handleCompleteTask(task.id, e.target.checked)}
              />
              <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                {task.title}
              </span>
              {task.notes && <p>{task.notes}</p>}
              {task.due && <p>Fällig: {new Date(task.due).toLocaleDateString('de-DE')}</p>}
              <button onClick={() => handleDeleteTask(task.id)}>Löschen</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Beispiel 6: Integration in Chat-Bot
async function handleTaskCommand(message, accessToken) {
  const { create_task } = useGoogleTasks(accessToken);
  
  // Einfache Texterkennung für Aufgaben
  const taskMatch = message.match(/erstelle aufgabe: (.+)/i);
  if (taskMatch) {
    const taskTitle = taskMatch[1].trim();
    try {
      await create_task(taskTitle);
      return `Aufgabe "${taskTitle}" wurde erfolgreich erstellt!`;
    } catch (error) {
      return `Fehler beim Erstellen der Aufgabe: ${error.message}`;
    }
  }
  
  return null; // Kein Task-Befehl erkannt
}

// Export für Verwendung in anderen Dateien
export {
  createSimpleTask,
  createTaskWithDueDate,
  createTaskWithNotes,
  createMultipleTasks,
  TaskCreatorComponent,
  handleTaskCommand
}; 