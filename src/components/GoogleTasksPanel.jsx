import React, { useState, useEffect } from 'react';
import useGoogleTasks from '../hooks/useGoogleTasks';

export default function GoogleTasksPanel({ user, accessToken }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', due_date: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { create_task, getTasks, deleteTask, completeTask } = useGoogleTasks(accessToken);

  // Aufgaben beim Laden der Komponente abrufen
  useEffect(() => {
    if (accessToken) {
      loadTasks();
    }
  }, [accessToken]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setError('Titel ist erforderlich');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await create_task(
        newTask.title,
        newTask.due_date || null,
        newTask.notes || null
      );
      
      // Formular zurücksetzen und Aufgaben neu laden
      setNewTask({ title: '', due_date: '', notes: '' });
      setShowCreateForm(false);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Möchten Sie diese Aufgabe wirklich löschen?')) return;
    
    setLoading(true);
    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId, completed) => {
    setLoading(true);
    try {
      await completeTask(taskId, completed);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now && !due.toDateString() === now.toDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Google Tasks</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showCreateForm ? 'Abbrechen' : 'Neue Aufgabe'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formular für neue Aufgabe */}
      {showCreateForm && (
        <form onSubmit={handleCreateTask} className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel *
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Aufgabe beschreiben..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fälligkeitsdatum
              </label>
              <input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notizen
            </label>
            <textarea
              value={newTask.notes}
              onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Zusätzliche Notizen..."
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Erstelle...' : 'Aufgabe erstellen'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {/* Aufgabenliste */}
      <div className="space-y-3">
        {loading && tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade Aufgaben...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Keine Aufgaben vorhanden</p>
            <p className="text-sm">Erstellen Sie Ihre erste Aufgabe!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`border rounded-lg p-4 transition-all ${
                task.completed
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={!!task.completed}
                    onChange={(e) => handleCompleteTask(task.id, e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        task.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.notes && (
                      <p
                        className={`text-sm mt-1 ${
                          task.completed ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {task.notes}
                      </p>
                    )}
                    {task.due && (
                      <p
                        className={`text-xs mt-2 ${
                          task.completed
                            ? 'text-gray-400'
                            : isOverdue(task.due)
                            ? 'text-red-500 font-medium'
                            : 'text-gray-500'
                        }`}
                      >
                        Fällig: {formatDate(task.due)}
                        {isOverdue(task.due) && !task.completed && ' (Überfällig)'}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 ml-2 p-1"
                  title="Aufgabe löschen"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {tasks.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={loadTasks}
            disabled={loading}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            {loading ? 'Lade...' : 'Aktualisieren'}
          </button>
        </div>
      )}
    </div>
  );
} 