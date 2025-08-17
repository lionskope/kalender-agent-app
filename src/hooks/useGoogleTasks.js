import { useCallback } from 'react';

export default function useGoogleTasks(accessToken, refreshToken) {
  
  // Google Tasks API Client initialisieren
  const getTasksClient = useCallback(() => {
    if (!accessToken) {
      throw new Error('Kein Access Token verfügbar. Bitte zuerst anmelden.');
    }
    
    return {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    };
  }, [accessToken]);

  // API Request mit automatischem Token-Refresh
  const makeApiRequest = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Wenn 401 Unauthorized, versuche Token-Refresh
      if (response.status === 401 && refreshToken) {
        console.log('Token expired, attempting refresh...');
        try {
          // Hier würden wir den refreshToken aufrufen, aber das machen wir in der App.jsx
          throw new Error('Token expired, please refresh');
        } catch (refreshError) {
          throw new Error('Access Token abgelaufen. Bitte melden Sie sich erneut an.');
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }, [accessToken, refreshToken]);

  // Standard Taskliste ID holen
  const getDefaultTaskList = useCallback(async () => {
    const client = getTasksClient();
    
    try {
      console.log('Hole Tasklisten mit Token:', accessToken ? 'Token vorhanden' : 'Kein Token');
      
      const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: client.headers,
      });
      
      console.log('Tasks API Response Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Tasks API Error:', errorData);
        
        if (response.status === 403) {
          throw new Error('Google Tasks API nicht aktiviert. Bitte aktivieren Sie die Google Tasks API in der Google Cloud Console.');
        } else if (response.status === 401) {
          throw new Error('Ungültiger Access Token. Bitte melden Sie sich erneut an.');
        } else {
          throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('Tasks API Response:', data);
      
      // Suche nach der Standard-Taskliste (meist "@default")
      const defaultList = data.items?.find(list => list.id === '@default') || data.items?.[0];
      
      if (!defaultList) {
        throw new Error('Keine Taskliste gefunden. Bitte erstellen Sie eine Taskliste in Google Tasks.');
      }
      
      console.log('Gefundene Taskliste:', defaultList);
      return defaultList.id;
    } catch (error) {
      console.error('Fehler beim Abrufen der Taskliste:', error);
      throw error;
    }
  }, [getTasksClient, accessToken]);

  // Aufgabe erstellen
  const create_task = useCallback(async (title, due_date = null, notes = null) => {
    if (!title || title.trim() === '') {
      throw new Error('Titel ist erforderlich');
    }

    console.log('Erstelle Aufgabe:', { title, due_date, notes });
    const client = getTasksClient();
    
    try {
      // Standard-Taskliste ID holen
      const taskListId = await getDefaultTaskList();
      console.log('Taskliste ID:', taskListId);
      
      // Task-Objekt erstellen
      const task = {
        title: title.trim(),
        notes: notes || '',
      };
      
      // Due date hinzufügen, falls angegeben
      if (due_date) {
        // Konvertiere das Datum in RFC 3339 Format
        const dueDate = new Date(due_date);
        if (isNaN(dueDate.getTime())) {
          throw new Error('Ungültiges Datum');
        }
        task.due = dueDate.toISOString();
        console.log('Fälligkeitsdatum:', task.due);
      }
      
      console.log('Sende Task an API:', task);
      
      // Task erstellen
      const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
        method: 'POST',
        headers: client.headers,
        body: JSON.stringify(task),
      });
      
      console.log('Task API Response Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Task API Error:', errorData);
        
        if (response.status === 403) {
          throw new Error('Keine Berechtigung für Google Tasks API. Bitte aktivieren Sie die API in der Google Cloud Console.');
        } else if (response.status === 401) {
          throw new Error('Ungültiger Access Token. Bitte melden Sie sich erneut an.');
        } else {
          throw new Error(`Fehler beim Erstellen der Aufgabe: ${errorData.error?.message || response.statusText}`);
        }
      }
      
      const createdTask = await response.json();
      console.log('Aufgabe erfolgreich erstellt:', createdTask);
      
      return createdTask;
    } catch (error) {
      console.error('Fehler beim Erstellen der Aufgabe:', error);
      throw error;
    }
  }, [getTasksClient, getDefaultTaskList]);

  // Alle Aufgaben abrufen
  const getTasks = useCallback(async () => {
    const client = getTasksClient();
    
    try {
      const taskListId = await getDefaultTaskList();
      
      const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
        headers: client.headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Fehler beim Abrufen der Aufgaben:', error);
      throw error;
    }
  }, [getTasksClient, getDefaultTaskList]);

  // Aufgabe löschen
  const deleteTask = useCallback(async (taskId) => {
    const client = getTasksClient();
    
    try {
      const taskListId = await getDefaultTaskList();
      
      const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: client.headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen der Aufgabe:', error);
      throw error;
    }
  }, [getTasksClient, getDefaultTaskList]);

  // Aufgabe als erledigt markieren
  const completeTask = useCallback(async (taskId, completed = true) => {
    const client = getTasksClient();
    
    try {
      const taskListId = await getDefaultTaskList();
      
      const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: client.headers,
        body: JSON.stringify({
          completed: completed ? new Date().toISOString() : null,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedTask = await response.json();
      return updatedTask;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Aufgabe:', error);
      throw error;
    }
  }, [getTasksClient, getDefaultTaskList]);

  // Test-Funktion für API-Verbindung
  const testConnection = useCallback(async () => {
    const client = getTasksClient();
    
    try {
      console.log('Teste Google Tasks API Verbindung...');
      
      const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: client.headers,
      });
      
      console.log('Test Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Google Tasks API funktioniert!', data);
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Google Tasks API Test fehlgeschlagen:', errorData);
        return { success: false, error: errorData };
      }
    } catch (error) {
      console.error('❌ Google Tasks API Test Fehler:', error);
      return { success: false, error: error.message };
    }
  }, [getTasksClient]);

  return {
    create_task,
    getTasks,
    deleteTask,
    completeTask,
    getDefaultTaskList,
    testConnection,
  };
} 