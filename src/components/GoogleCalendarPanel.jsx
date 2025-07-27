import React, { useState } from 'react';

export default function GoogleCalendarPanel({ user }) {
  const [events, setEvents] = useState([
    { id: 1, title: 'Meeting mit Alex', time: '09:00', date: '2024-06-20' },
    { id: 2, title: 'Projekt-Deadline', time: '14:00', date: '2024-06-20' },
  ]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '' });

  function handleCreateEvent(e) {
    e.preventDefault();
    // TODO: Echte Google Calendar API Integration
    setEvents(evts => [
      ...evts,
      { id: Date.now(), ...newEvent }
    ]);
    setNewEvent({ title: '', date: '', time: '' });
    alert('Termin (Platzhalter) erstellt!');
  }

  return (
    <></>
  );
} 