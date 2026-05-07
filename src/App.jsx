import { useState, useEffect } from "react";

const SUPABASE_URL = "https://nsrrylqzzpjgfylvgbyb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcnJ5bHF6enBqZ2Z5bHZnYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzg5ODYsImV4cCI6MjA5MzY1NDk4Nn0.d2DS2bgUBFhYemdKDZK6_SIw6L97Xj1kUTeGigexIZ4";

const sbFetch = (path, opts = {}) => fetch(`${SUPABASE_URL}/rest/v1${path}`, {
  headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation", ...(opts.headers || {}) },
  ...opts,
});

const loadSessions = async () => {
  const r = await sbFetch("/sessions?order=created_at.asc");
  if (!r.ok) return null;
  const rows = await r.json();
  return rows.map(row => row.data);
};

const saveSession = async (session) => {
  await sbFetch("/sessions", { method: "POST", body: JSON.stringify({ data: session }) });
};

const DISTANCE_EXERCISES = ["Marche inclinée", "Marche", "Randonnée", "Course", "Tapis de course", "Vélo stationnaire", "Vélo elliptique"];

const calcSpeed = (duration, distance) => {
  if (!duration || !distance || parseFloat(duration) === 0) return null;
  return (parseFloat(distance) / (parseFloat(duration) / 60)).toFixed(1);
};

const EXERCISES = {
  "Cardio": ["Marche inclinée", "Vélo elliptique", "Vélo stationnaire", "Rameur", "Escalier", "Course", "Tapis de course", "Marche", "Randonnée"],
  "Jambes": ["Presse", "Squat barre", "Squat sangle", "Leg Curl", "Leg Extension", "Fentes", "Hip Trust", "Exos Océane"],
  "Hanches / Fessiers": ["Hip Abducteur", "Hip Adducteur", "Glute machine", "Glute traîner"],
  "Dos": ["Tirage vertical", "Lat Pulldown", "Machine Tanguy", "Machine en face Tanguy", "Rameur machine"],
  "Abdos": ["Abdos machine", "Crunch poulie", "Exos au sol"],
  "Poitrine / Bras": ["Chest Press", "Shoulder Press", "Arm Extension"],
  "Piscine": ["Brasse", "Nage libre"],
};

const HISTORY_DATA = [
  { id: 1, date: "2025-06-16T10:00:00", lieu: "Liberty Gym", noDate: true, duration: 3600, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "incl 10 / 5km/h" }] },
    { name: "Hip Abducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "10", weight: "32" }, { reps: "10", weight: "36" }, { reps: "10", weight: "41" }, { reps: "10", weight: "45" }] },
    { name: "Hip Adducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "10", weight: "18" }, { reps: "10", weight: "23" }, { reps: "10", weight: "27" }, { reps: "10", weight: "32" }] },
    { name: "Squat barre", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "0" }, { reps: "10", weight: "0" }, { reps: "10", weight: "0" }, { reps: "10", weight: "0" }] },
    { name: "Presse", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "80" }, { reps: "10", weight: "85" }, { reps: "10", weight: "90" }] },
    { name: "Squat sangle", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "32" }, { reps: "10", weight: "36" }, { reps: "10", weight: "36" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
  ]},
  { id: 2, date: "2025-06-23T10:00:00", lieu: "Liberty Gym", noDate: true, duration: 3000, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 10 / 4.5km/h" }] },
    { name: "Vélo elliptique", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
  ]},
  { id: 3, date: "2025-06-26T10:00:00", lieu: "Liberty Gym", noDate: true, duration: 3000, exercises: [
    { name: "Vélo elliptique", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "10", weight: "27" }, { reps: "10", weight: "32" }, { reps: "10", weight: "36" }] },
    { name: "Hip Abducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "10", weight: "36" }, { reps: "10", weight: "41" }, { reps: "10", weight: "45" }] },
    { name: "Hip Adducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "10", weight: "23" }, { reps: "10", weight: "27" }, { reps: "10", weight: "32" }] },
    { name: "Glute machine", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "10", weight: "14" }, { reps: "10", weight: "18" }, { reps: "10", weight: "23" }] },
    { name: "Rameur machine", category: "Dos", type: "reps", sets: [{ reps: "55", weight: "0" }] },
  ]},
  { id: 4, date: "2025-06-30T10:00:00", lieu: "Liberty Gym", noDate: true, duration: 2700, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "27", notes: "incl 14 / 4.6km/h" }] },
    { name: "Vélo elliptique", category: "Cardio", type: "time", sets: [{ duration: "15", notes: "vitesse 5" }] },
  ]},
  { id: 5, date: "2025-07-07T10:00:00", lieu: "Liberty Gym", noDate: true, duration: 2400, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "25", notes: "incl 10.5 / 4.7km/h" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "10", weight: "10" }, { reps: "10", weight: "15" }, { reps: "10", weight: "20" }] },
  ]},
  { id: 6, date: "2025-07-10T10:00:00", lieu: "Liberty Gym", noDate: true, duration: 3600, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 10.5 / 4.7km/h" }] },
    { name: "Vélo elliptique", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5" }] },
    { name: "Hip Abducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "41" }, { reps: "12", weight: "45" }, { reps: "12", weight: "50" }] },
    { name: "Hip Adducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "27" }, { reps: "12", weight: "32" }, { reps: "12", weight: "36" }] },
    { name: "Leg Curl", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "14" }, { reps: "10", weight: "14" }, { reps: "10", weight: "14" }] },
    { name: "Squat barre", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "5" }, { reps: "10", weight: "5" }, { reps: "10", weight: "5" }] },
    { name: "Glute traîner", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "10", weight: "0" }, { reps: "10", weight: "0" }, { reps: "10", weight: "0" }] },
  ]},
  { id: 7, date: "2025-07-14T10:00:00", lieu: "Baume", noDate: true, duration: 3600, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "36", notes: "36 km" }] },
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "18", notes: "incl 10 / vitesse 5" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Lat Pulldown", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "27" }, { reps: "10", weight: "32" }, { reps: "10", weight: "36" }] },
    { name: "Presse", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "63" }, { reps: "10", weight: "75" }, { reps: "10", weight: "86" }] },
  ]},
  { id: 8, date: "2025-07-21T10:00:00", lieu: "Baume", noDate: true, duration: 2700, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 10 / 4.8km/h" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "15", weight: "36" }, { reps: "15", weight: "36" }, { reps: "15", weight: "36" }] },
    { name: "Lat Pulldown", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "32" }, { reps: "10", weight: "32" }, { reps: "10", weight: "32" }] },
  ]},
  { id: 9, date: "2025-07-24T10:00:00", lieu: "Baume", noDate: true, duration: 1800, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5" }, { duration: "15", notes: "vitesse 6" }] },
    { name: "Vélo elliptique", category: "Cardio", type: "time", sets: [{ duration: "5", notes: "vitesse 6" }] },
  ]},
  { id: 10, date: "2025-07-28T10:00:00", lieu: "Valdahon", noDate: true, duration: 2700, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "incl 10 / 4.7km/h" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 6" }] },
    { name: "Vélo elliptique", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 7" }] },
    { name: "Course", category: "Cardio", type: "time", sets: [{ duration: "5", notes: "8-8.5 km/h" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "10", weight: "0" }] },
  ]},
  { id: 11, date: "2025-08-04T10:00:00", lieu: "Valdahon", noDate: true, duration: 3600, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 6" }, { duration: "5", notes: "vitesse 5" }] },
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "19", notes: "incl 6 / 5km/h" }] },
    { name: "Chest Press", category: "Poitrine / Bras", type: "reps", sets: [{ reps: "12", weight: "15" }, { reps: "12", weight: "15" }, { reps: "12", weight: "15" }, { reps: "12", weight: "15" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
  ]},
  { id: 12, date: "2025-08-07T10:00:00", lieu: "Baume", noDate: true, duration: 3000, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 7.5 / 5km/h + 5 min 9-10km/h" }] },
    { name: "Presse", category: "Jambes", type: "reps", sets: [{ reps: "12", weight: "75" }, { reps: "12", weight: "75" }, { reps: "12", weight: "75" }, { reps: "12", weight: "75" }] },
    { name: "Hip Adducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "27" }, { reps: "12", weight: "32" }, { reps: "12", weight: "36" }] },
    { name: "Hip Abducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "45" }, { reps: "12", weight: "50" }, { reps: "12", weight: "54" }] },
    { name: "Glute machine", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "18" }, { reps: "12", weight: "23" }, { reps: "12", weight: "27" }] },
  ]},
  { id: 13, date: "2025-08-11T10:00:00", lieu: "Valdahon", noDate: true, duration: 3000, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 8 / 5km/h" }] },
    { name: "Escalier", category: "Cardio", type: "time", sets: [{ duration: "5", notes: "vitesse 7" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "5", notes: "vitesse 6" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "réussi en entier ✓" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }] },
  ]},
  { id: 14, date: "2025-08-14T10:00:00", lieu: "Baume", noDate: true, duration: 2700, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "15", notes: "incl 8.5 / 5km/h" }] },
    { name: "Escalier", category: "Cardio", type: "time", sets: [{ duration: "5", notes: "vitesse 7" }] },
    { name: "Squat barre", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "0" }, { reps: "10", weight: "0" }, { reps: "10", weight: "0" }] },
    { name: "Glute machine", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "8", weight: "0" }, { reps: "8", weight: "0" }, { reps: "8", weight: "0" }] },
    { name: "Hip Adducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "27" }, { reps: "12", weight: "27" }] },
    { name: "Hip Abducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "50" }, { reps: "12", weight: "50" }, { reps: "12", weight: "50" }] },
  ]},
  { id: 15, date: "2025-09-01T10:00:00", lieu: "Baume", noDate: true, duration: 3600, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 8.5 / 5km/h" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 6" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "réussi en entier ✓" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "27" }, { reps: "12", weight: "27" }, { reps: "12", weight: "27" }, { reps: "12", weight: "27" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "0.75", notes: "45 sec en entier" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "32" }, { reps: "10", weight: "32" }, { reps: "10", weight: "32" }] },
  ]},
  { id: 16, date: "2025-09-08T10:00:00", lieu: "Montbéliard", noDate: true, duration: 3000, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 8.5 / 5km/h" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5-6" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "réussi en entier ✓" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "20" }, { reps: "12", weight: "20" }, { reps: "12", weight: "20" }, { reps: "12", weight: "20" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "35" }, { reps: "10", weight: "35" }, { reps: "10", weight: "35" }] },
  ]},
  { id: 17, date: "2025-09-09T10:00:00", lieu: "Montbéliard", noDate: true, duration: 2100, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 8.5 / 5km/h" }] },
    { name: "Vélo elliptique", category: "Cardio", type: "time", sets: [{ duration: "15", notes: "vitesse 5" }] },
  ]},
  { id: 18, date: "2025-09-10T10:00:00", lieu: "Valdahon", noDate: true, duration: 2400, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "40", notes: "" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
  ]},
  { id: 19, date: "2025-09-11T10:00:00", lieu: "Baume", noDate: true, duration: 1700, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "17", notes: "incl 9 / 5km/h + 3 min vitesse 5" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "5", notes: "vitesse 4" }] },
    { name: "Escalier", category: "Cardio", type: "time", sets: [{ duration: "5", notes: "vitesse 7" }] },
  ]},
  { id: 20, date: "2025-09-17T10:00:00", lieu: "Valdahon", noDate: true, duration: 3000, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 9 / 5km/h" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "35" }, { reps: "10", weight: "35" }, { reps: "10", weight: "35" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "20" }, { reps: "12", weight: "20" }, { reps: "12", weight: "20" }, { reps: "12", weight: "20" }] },
  ]},
  { id: 21, date: "2025-09-19T10:00:00", lieu: "Valdahon", noDate: true, duration: 600, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5" }] },
  ]},
  { id: 22, date: "2025-09-23T10:00:00", lieu: "Piscine", noDate: true, duration: 1800, exercises: [
    { name: "Brasse", category: "Piscine", type: "reps", sets: [{ reps: "900", weight: "0", notes: "900m brasse" }] },
  ]},
  { id: 23, date: "2025-09-24T10:00:00", lieu: "Valdahon", noDate: true, duration: 3000, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "v5" }, { duration: "10", notes: "v4" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }] },
    { name: "Machine Tanguy", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "10" }, { reps: "10", weight: "10" }, { reps: "10", weight: "10" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "0.75", notes: "45 sec" }] },
  ]},
  { id: 24, date: "2025-09-30T10:00:00", lieu: "Valdahon", noDate: true, duration: 2700, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "vitesse 5" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Machine Tanguy", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "10" }, { reps: "10", weight: "10" }, { reps: "10", weight: "10" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "0.75", notes: "45 sec (6 exos)" }] },
  ]},
  { id: 25, date: "2025-10-02T10:00:00", lieu: "Valdahon", noDate: true, duration: 2520, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "30", notes: "incl 8 / 5km/h" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "12", notes: "vitesse 5" }] },
  ]},
  { id: 26, date: "2025-10-04T10:00:00", lieu: "Valdahon", noDate: true, duration: 2700, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 8.5 / 5km/h" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5" }] },
    { name: "Hip Adducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "24", weight: "30" }, { reps: "24", weight: "30" }] },
    { name: "Hip Abducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "50" }, { reps: "12", weight: "50" }, { reps: "12", weight: "50" }, { reps: "12", weight: "50" }] },
    { name: "Leg Extension", category: "Jambes", type: "reps", sets: [{ reps: "12", weight: "0" }, { reps: "12", weight: "0" }, { reps: "12", weight: "0" }, { reps: "12", weight: "0" }] },
  ]},
  { id: 27, date: "2025-10-06T10:00:00", lieu: "Valdahon", noDate: true, duration: 3000, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5" }] },
    { name: "Rameur machine", category: "Dos", type: "time", sets: [{ duration: "8", notes: "" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }] },
    { name: "Machine Tanguy", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "10" }, { reps: "10", weight: "10" }, { reps: "10", weight: "10" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "35" }, { reps: "10", weight: "35" }, { reps: "10", weight: "35" }] },
  ]},
  { id: 28, date: "2025-10-16T10:00:00", lieu: "Baume", noDate: true, duration: 3000, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 5 et 8" }] },
    { name: "Hip Adducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "24", weight: "30" }, { reps: "24", weight: "30" }] },
    { name: "Hip Abducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "50" }, { reps: "12", weight: "50" }, { reps: "12", weight: "50" }, { reps: "12", weight: "50" }] },
    { name: "Exos Océane", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "0" }, { reps: "10", weight: "0" }, { reps: "10", weight: "0" }] },
    { name: "Presse", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "70" }, { reps: "10", weight: "70" }, { reps: "10", weight: "70" }] },
  ]},
  { id: 29, date: "2025-10-18T10:00:00", lieu: "Montbéliard", noDate: true, duration: 3000, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 4" }] },
    { name: "Rameur machine", category: "Dos", type: "time", sets: [{ duration: "5", notes: "puissance 5" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "35" }, { reps: "10", weight: "35" }, { reps: "10", weight: "35" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Crunch poulie", category: "Abdos", type: "reps", sets: [{ reps: "10", weight: "17.5" }, { reps: "10", weight: "17.5" }, { reps: "10", weight: "17.5" }] },
    { name: "Machine Tanguy", category: "Dos", type: "reps", sets: [{ reps: "12", weight: "15" }, { reps: "12", weight: "15" }, { reps: "12", weight: "15" }] },
  ]},
  { id: 30, date: "2025-11-03T10:00:00", lieu: "Valdahon", noDate: true, duration: 3000, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 5 et 8" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "15", notes: "vitesse 4" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }] },
    { name: "Machine en face Tanguy", category: "Dos", type: "reps", sets: [{ reps: "12", weight: "25" }, { reps: "12", weight: "25" }, { reps: "12", weight: "25" }] },
  ]},
  { id: 31, date: "2025-11-06T10:00:00", lieu: "Baume", noDate: true, duration: 3000, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 4" }] },
    { name: "Presse", category: "Jambes", type: "reps", sets: [{ reps: "12", weight: "75" }, { reps: "12", weight: "75" }, { reps: "12", weight: "75" }, { reps: "12", weight: "75" }] },
    { name: "Hip Trust", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "0" }, { reps: "10", weight: "0" }, { reps: "10", weight: "0" }, { reps: "10", weight: "0" }] },
    { name: "Hip Abducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "10", weight: "45" }, { reps: "10", weight: "45" }, { reps: "10", weight: "45" }] },
    { name: "Hip Adducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "10", weight: "27" }, { reps: "10", weight: "27" }, { reps: "10", weight: "27" }] },
    { name: "Squat barre", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "0" }, { reps: "10", weight: "0" }, { reps: "10", weight: "0" }] },
    { name: "Leg Curl", category: "Jambes", type: "reps", sets: [{ reps: "10", weight: "18" }, { reps: "10", weight: "18" }, { reps: "10", weight: "18" }] },
  ]},
  { id: 32, date: "2025-11-10T10:00:00", lieu: "Valdahon", noDate: true, duration: 3600, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "v5" }, { duration: "10", notes: "v4" }] },
    { name: "Rameur machine", category: "Dos", type: "time", sets: [{ duration: "8", notes: "puissance 8" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "35" }, { reps: "10", weight: "35" }, { reps: "10", weight: "35" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "35" }, { reps: "12", weight: "35" }, { reps: "12", weight: "35" }] },
    { name: "Machine Tanguy", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "10" }] },
  ]},
  { id: 33, date: "2025-11-18T10:00:00", lieu: "Valdahon", noDate: true, duration: 3000, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 8.5 / 5km/h" }] },
    { name: "Rameur machine", category: "Dos", type: "time", sets: [{ duration: "8", notes: "puissance 8" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "35" }, { reps: "10", weight: "35" }, { reps: "10", weight: "35" }] },
    { name: "Machine Tanguy", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "10" }, { reps: "5", weight: "10" }, { reps: "10", weight: "10" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "35" }, { reps: "12", weight: "35" }, { reps: "12", weight: "35" }] },
  ]},
  { id: 34, date: "2025-11-24T10:00:00", lieu: "Montbéliard", noDate: true, duration: 3000, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "16", notes: "incl 8.5 puis 9.5 pendant 9 min" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "35" }, { reps: "10", weight: "30" }, { reps: "10", weight: "30" }] },
    { name: "Chest Press", category: "Poitrine / Bras", type: "reps", sets: [{ reps: "10", weight: "10" }, { reps: "10", weight: "10" }, { reps: "10", weight: "15" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "35" }, { reps: "12", weight: "35" }, { reps: "12", weight: "35" }] },
  ]},
  { id: 35, date: "2025-12-01T10:00:00", lieu: "Valdahon", noDate: true, duration: 3000, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "5", notes: "" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Machine Tanguy", category: "Dos", type: "reps", sets: [{ reps: "12", weight: "7.5" }, { reps: "12", weight: "7.5" }, { reps: "12", weight: "7.5" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "35" }, { reps: "12", weight: "35" }, { reps: "12", weight: "35" }] },
    { name: "Machine en face Tanguy", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "0" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "0" }] },
  ]},
  { id: 36, date: "2025-12-04T10:00:00", lieu: "Baume", noDate: true, duration: 2700, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "23", notes: "incl 8 et 5" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5" }] },
    { name: "Presse", category: "Jambes", type: "reps", sets: [{ reps: "12", weight: "75" }, { reps: "12", weight: "75" }, { reps: "12", weight: "75" }] },
    { name: "Hip Abducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "45" }, { reps: "12", weight: "45" }, { reps: "12", weight: "45" }] },
    { name: "Hip Adducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "27" }, { reps: "12", weight: "27" }, { reps: "12", weight: "27" }] },
  ]},
  { id: 37, date: "2025-12-22T10:00:00", lieu: "Valdahon", noDate: true, duration: 3600, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "15", notes: "vitesse 5" }] },
    { name: "Rameur machine", category: "Dos", type: "time", sets: [{ duration: "8", notes: "puissance 8" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "8", notes: "8 min" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "35" }, { reps: "12", weight: "35" }, { reps: "12", weight: "35" }] },
    { name: "Arm Extension", category: "Poitrine / Bras", type: "reps", sets: [{ reps: "12", weight: "25" }, { reps: "12", weight: "25" }, { reps: "12", weight: "25" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }] },
    { name: "Machine Tanguy", category: "Dos", type: "reps", sets: [{ reps: "12", weight: "7.5" }, { reps: "12", weight: "7.5" }, { reps: "12", weight: "7.5" }] },
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 8 / 5km/h" }] },
  ]},
  { id: 38, date: "2025-12-27T10:00:00", lieu: "Valdahon", noDate: true, duration: 1500, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "incl 8 / 5.5km/h" }, { duration: "14", notes: "5km/h" }, { duration: "5", notes: "vitesse 6" }] },
  ]},
  { id: 39, date: "2026-01-12T10:00:00", lieu: "Montbéliard", noDate: true, duration: 2700, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 8.5 / 5km/h" }] },
    { name: "Course", category: "Cardio", type: "time", sets: [{ duration: "15", notes: "7 km/h" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "20" }, { reps: "12", weight: "20" }, { reps: "12", weight: "20" }] },
    { name: "Shoulder Press", category: "Poitrine / Bras", type: "reps", sets: [{ reps: "12", weight: "10" }, { reps: "12", weight: "10" }, { reps: "12", weight: "10" }] },
  ]},
  { id: 40, date: "2026-01-19T10:00:00", lieu: "Valdahon", noDate: true, duration: 3000, exercises: [
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "15", notes: "vitesse 4" }] },
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 5 et 8" }] },
    { name: "Exos au sol", category: "Abdos", type: "time", sets: [{ duration: "1", notes: "" }] },
    { name: "Abdos machine", category: "Abdos", type: "reps", sets: [{ reps: "12", weight: "35" }] },
    { name: "Arm Extension", category: "Poitrine / Bras", type: "reps", sets: [{ reps: "12", weight: "20" }] },
    { name: "Tirage vertical", category: "Dos", type: "reps", sets: [{ reps: "10", weight: "35" }, { reps: "10", weight: "30" }, { reps: "10", weight: "30" }] },
  ]},
  { id: 41, date: "2026-01-22T10:00:00", lieu: "Valdahon", noDate: true, duration: 3000, exercises: [
    { name: "Marche inclinée", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 5 et 8" }] },
    { name: "Course", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "7 km/h" }] },
    { name: "Rameur machine", category: "Dos", type: "time", sets: [{ duration: "5", notes: "puissance 7" }] },
    { name: "Vélo stationnaire", category: "Cardio", type: "time", sets: [{ duration: "10", notes: "vitesse 5" }] },
  ]},
  { id: 42, date: "2026-05-04T10:00:00", lieu: "Montbéliard", noDate: true, duration: 3600, exercises: [
    { name: "Tapis de course", category: "Cardio", type: "time", sets: [{ duration: "20", notes: "incl 5 et 8" }] },
    { name: "Fentes", category: "Jambes", type: "reps", sets: [{ reps: "20", weight: "3.5" }, { reps: "20", weight: "3.5" }, { reps: "20", weight: "3.5" }] },
    { name: "Squat barre", category: "Jambes", type: "reps", sets: [{ reps: "15", weight: "6" }, { reps: "15", weight: "6" }, { reps: "15", weight: "6" }] },
    { name: "Hip Trust", category: "Jambes", type: "reps", sets: [{ reps: "12", weight: "5" }, { reps: "12", weight: "5" }, { reps: "12", weight: "5" }] },
    { name: "Presse", category: "Jambes", type: "reps", sets: [{ reps: "12", weight: "70" }, { reps: "12", weight: "70" }, { reps: "12", weight: "70" }] },
    { name: "Hip Abducteur", category: "Hanches / Fessiers", type: "reps", sets: [{ reps: "12", weight: "30" }, { reps: "12", weight: "30" }, { reps: "12", weight: "30" }] },
  ]},
];

const MOTIVATIONS = [
  "Chaque séance te rapproche de la meilleure version de toi 💪",
  "La douleur d'aujourd'hui, c'est la force de demain ⚡",
  "Tu n'as jamais regretté une séance. Go ! 🔥",
  "Les résultats arrivent à celles qui ne lâchent pas 🏆",
  "Ton seul adversaire, c'est toi d'hier 👊",
  "Une séance de plus, une fierté de plus ✨",
  "Le corps accomplit ce que l'esprit décide 🧠",
  "Pas d'excuses, juste des résultats 💥",
  "Tu es plus forte que tu ne le crois 🌟",
  "Aujourd'hui on transpire, demain on brille 😎",
  "Chaque rep compte. Chaque minute compte ⏱",
  "La régularité bat la perfection. T'es là, c'est déjà gagné 🎯",
];

const getDailyMotivation = () => {
  const day = new Date().getDay() + new Date().getDate();
  return MOTIVATIONS[day % MOTIVATIONS.length];
};

const formatTime = (sec) => `${Math.floor(sec/60).toString().padStart(2,"0")}:${(sec%60).toString().padStart(2,"0")}`;
const formatDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const displayDate = (s) => s.noDate ? s.lieu : formatDate(s.date);
const totalVolume = (exercises) => exercises.reduce((a, ex) => ex.type === "reps" ? a + ex.sets.reduce((b, s) => b + (s.reps && s.weight ? parseFloat(s.reps)*parseFloat(s.weight) : 0), 0) : a, 0);
const totalCardioMin = (exercises) => Math.round(exercises.reduce((a, ex) => ex.type === "time" ? a + ex.sets.reduce((b, s) => b + (s.duration ? parseFloat(s.duration) : 0), 0) : a, 0));

function ExerciseList({ exercises }) {
  return (
    <div style={S.reportExList}>
      {exercises.map((ex, i) => (
        <div key={i} style={S.reportExItem}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <span style={S.exCardCat}>{ex.category}</span>
            <span style={S.exCardName}>{ex.name}</span>
          </div>
          <div style={S.reportExSets}>
            {ex.sets.map((s, j) => (
              <span key={j} style={S.reportSetTag}>
                {ex.type === "reps"
                  ? `${s.reps||0} rép${s.weight ? ` × ${s.weight} kg` : ""}`
                  : `${s.duration||0} min${s.distance ? ` · ${s.distance} km` : ""}${s.distance && s.duration ? ` · ⚡${calcSpeed(s.duration,s.distance)} km/h` : ""}${s.notes ? ` · ${s.notes}` : ""}`}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [activeCategory, setActiveCategory] = useState("Cardio");
  const [sessionExercises, setSessionExercises] = useState([]);
  const [history, setHistory] = useState(HISTORY_DATA);
  const [saving, setSaving] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  // 0 = loading, 1 = connecting, 2 = fetching, 3 = done, -1 = error

  useEffect(() => {
    const boot = async () => {
      setLoadStep(1);
      await new Promise(r => setTimeout(r, 700));
      setLoadStep(2);
      try {
        const rows = await loadSessions();
        await new Promise(r => setTimeout(r, 600));
        setLoadStep(3);
        if (rows && rows.length > 0) setHistory([...HISTORY_DATA, ...rows]);
        await new Promise(r => setTimeout(r, 800));
        setLoadStep(4);
      } catch {
        setLoadStep(-1);
        await new Promise(r => setTimeout(r, 1500));
        setLoadStep(4);
      }
    };
    boot();
  }, []);

  const saveHistory = async (session) => {
    setSaving(true);
    setHistory(prev => [session, ...prev]);
    await saveSession(session);
    setSaving(false);
  };
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionStart] = useState(Date.now());
  const [filterLieu, setFilterLieu] = useState("Tous");
  const [exSearch, setExSearch] = useState("");
  const [editingSession, setEditingSession] = useState(null); // null | session object
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0,10));
  const [sessionLieu, setSessionLieu] = useState("Liberty Gym");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showTuto, setShowTuto] = useState(() => {
    try { return localStorage.getItem("elodie-tuto-seen") !== "true"; } catch { return true; }
  });

  const closeTuto = (forever) => {
    setShowTuto(false);
    if (forever) try { localStorage.setItem("elodie-tuto-seen", "true"); } catch {}
  };

  const addExercise = (name) => { setSessionExercises(p => [...p, { id: Date.now(), name, category: activeCategory, type: "reps", sets: [{ reps:"", weight:"", duration:"" }] }]); setExSearch(""); };
  const updateSet = (ei, si, f, v) => setSessionExercises(p => { const c=[...p]; c[ei]={...c[ei], sets:c[ei].sets.map((s,i)=>i===si?{...s,[f]:v}:s)}; return c; });
  const addSet = (ei) => setSessionExercises(p => { const c=[...p]; c[ei]={...c[ei], sets:[...c[ei].sets,{reps:"",weight:"",duration:""}]}; return c; });
  const removeExercise = (ei) => setSessionExercises(p => p.filter((_,i)=>i!==ei));
  const toggleType = (ei) => setSessionExercises(p => { const c=[...p]; c[ei]={...c[ei],type:c[ei].type==="reps"?"time":"reps"}; return c; });

  const finishSession = () => {
    if (editingSession) {
      const updated = { ...editingSession, exercises: sessionExercises, date: sessionDate + "T10:00:00", lieu: sessionLieu, noDate: false };
      const newHist = history.map(s => s.id === editingSession.id ? updated : s);
      setHistory(newHist);
      try { localStorage.setItem("elodie-gym-history", JSON.stringify(newHist)); } catch {}
      saveSession(updated);
      setSelectedSession(updated);
    } else {
      const s = { id: Date.now(), date: sessionDate + "T10:00:00", lieu: sessionLieu, noDate: false, duration: Math.floor((Date.now()-sessionStart)/1000), exercises: sessionExercises };
      saveHistory(s);
      setSelectedSession(s);
    }
    setEditingSession(null);
    setView("report");
  };

  const deleteSession = (id) => {
    const newHist = history.filter(s => s.id !== id);
    setHistory(newHist);
    try { localStorage.setItem("elodie-gym-history", JSON.stringify(newHist)); } catch {}
    setConfirmDelete(false);
    setView("history");
  };

  const startEditSession = (session) => {
    setEditingSession(session);
    setSessionExercises(session.exercises);
    setSessionDate(session.date ? session.date.slice(0,10) : new Date().toISOString().slice(0,10));
    setSessionLieu(session.lieu || "Liberty Gym");
    setView("session");
  };

  const startNewSession = () => {
    setEditingSession(null);
    setSessionExercises([]);
    setSessionDate(new Date().toISOString().slice(0,10));
    setSessionLieu("Liberty Gym");
    setView("session");
  };

  const lieux = ["Tous", ...Array.from(new Set(history.map(s => s.lieu)))];
  const filteredHistory = filterLieu === "Tous" ? history : history.filter(s => s.lieu === filterLieu);
  const totalSessions = history.length;
  const allCardio = history.reduce((a,s) => a + totalCardioMin(s.exercises), 0);
  const totalEx = history.reduce((a,s) => a + s.exercises.length, 0);

  return (
    <div style={S.root}>
      <div style={S.bg} />

      {/* LOADING SCREEN */}
      {loadStep < 4 && (
        <div style={S.loadOverlay}>
          <div style={S.loadCard}>
            <div style={S.loadLogo}>
              <span style={{fontSize:44, filter:"drop-shadow(0 0 16px #e8ff3b)"}}>⚡</span>
              <div style={{fontSize:22, fontWeight:700, letterSpacing:"0.2em", color:"#e8ff3b"}}>LIBERTY GYM</div>
              <div style={{fontSize:11, color:"#888", letterSpacing:"0.2em"}}>Tracker · Élodie</div>
            </div>

            <div style={S.loadSteps}>
              {[
                { label: "Connexion à Supabase", step: 1 },
                { label: "Récupération des séances", step: 2 },
                { label: "Tout est prêt !", step: 3 },
              ].map(({ label, step }) => {
                const done = loadStep > step;
                const active = loadStep === step;
                const error = loadStep === -1 && step === 2;
                return (
                  <div key={step} style={{...S.loadStepRow, opacity: loadStep >= step ? 1 : 0.3}}>
                    <div style={{...S.loadStepDot, background: error ? "#f44" : done || active ? "#e8ff3b" : "#333", boxShadow: active ? "0 0 10px #e8ff3b" : "none"}}>
                      {done ? "✓" : error ? "✕" : step}
                    </div>
                    <span style={{color: error ? "#f44" : done ? "#e8ff3b" : active ? "#f0f0f0" : "#555", fontSize:13}}>
                      {error ? "Erreur de connexion — mode hors ligne" : label}
                    </span>
                    {active && !error && <span style={S.loadSpinner}>⏳</span>}
                  </div>
                );
              })}
            </div>

            <div style={S.loadBarWrap}>
              <div style={{...S.loadBar, width: loadStep === -1 ? "66%" : `${Math.min(100, (Math.max(0,loadStep-1)) / 3 * 100)}%`, background: loadStep === -1 ? "#f44" : "#e8ff3b"}} />
            </div>
            <div style={{fontSize:10, color:"#555", textAlign:"center", marginTop:8, letterSpacing:"0.1em"}}>
              {loadStep === 1 && "Connexion en cours..."}
              {loadStep === 2 && "Chargement de tes données..."}
              {loadStep === 3 && "Presque prête..."}
              {loadStep === -1 && "Démarrage en mode hors ligne"}
            </div>
          </div>
        </div>
      )}

      <header style={S.header}>
        <div style={S.logo}>
          <span style={S.logoIcon}>⚡</span>
          <div>
            <div style={S.logoName}>LIBERTY GYM</div>
            <div style={S.logoSub}>Tracker · Élodie</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {loadStep < 4 && <span style={{fontSize:9,color:"#888",letterSpacing:"0.1em"}}>⏳ SYNC...</span>}
          {loadStep === 4 && <span style={{fontSize:9,color:"#4a4",letterSpacing:"0.1em"}}>● EN LIGNE</span>}
        </div>
        <nav style={S.nav}>
          {[["home","SÉANCE"],["history","HISTORIQUE"],["stats","STATS"]].map(([v,l]) => (
            <button key={v} style={{...S.navBtn,...(view===v||( v==="home"&&view==="session")||( v==="history"&&view==="detail")||( v==="home"&&view==="report")?S.navActive:{})}}
              onClick={() => { if(v==="home") setView(sessionExercises.length>0?"session":"home"); else setView(v); }}>{l}</button>
          ))}
        </nav>
      </header>

      <main style={S.main}>

        {/* HOME */}
        {(view === "home") && (
          <div style={S.centerWrap}>
            <div style={S.startCard}>
              <div style={S.startEmoji}>🏋️</div>
              <h1 style={S.startTitle}>Prête à soulever ?</h1>
              <p style={S.startSub}>Enregistre tes exercices, séries et répétitions, et génère ton rapport de séance.</p>
              <div style={S.quickStats}>
                <div style={S.qs}><span style={S.qsV}>{totalSessions}</span><span style={S.qsL}>séances</span></div>
                <div style={S.qs}><span style={S.qsV}>{totalEx}</span><span style={S.qsL}>exercices</span></div>
                <div style={S.qs}><span style={S.qsV}>{allCardio}</span><span style={S.qsL}>min cardio</span></div>
              </div>
              <div style={S.motivBox}>
                <span style={S.motivText}>"{getDailyMotivation()}"</span>
              </div>
              <button style={S.startBtn} onClick={startNewSession}>DÉMARRER LA SÉANCE</button>
            </div>
          </div>
        )}

        {/* SESSION */}
        {view === "session" && (
          <div style={S.sessionLayout}>
            <div style={S.picker}>
              <input
                style={S.searchInput}
                type="text"
                placeholder="🔍 Rechercher un exercice..."
                value={exSearch}
                onChange={e => setExSearch(e.target.value)}
              />
              {exSearch.trim() === "" ? (
                <>
                  <div style={S.sectionLabel}>CATÉGORIE</div>
                  <div style={S.catList}>
                    {Object.keys(EXERCISES).map(cat => (
                      <button key={cat} style={{...S.catBtn,...(activeCategory===cat?S.catActive:{})}} onClick={() => setActiveCategory(cat)}>{cat}</button>
                    ))}
                  </div>
                  <div style={{...S.sectionLabel, marginTop:18}}>EXERCICES</div>
                  <div style={S.exList}>
                    {EXERCISES[activeCategory].map(ex => (
                      <button key={ex} style={S.exBtn} onClick={() => addExercise(ex)}>+ {ex}</button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={S.sectionLabel}>RÉSULTATS</div>
                  <div style={S.exList}>
                    {Object.entries(EXERCISES).flatMap(([cat, exs]) =>
                      exs.filter(ex => ex.toLowerCase().includes(exSearch.toLowerCase())).map(ex => (
                        <button key={cat+ex} style={S.exBtnSearch} onClick={() => { setActiveCategory(cat); addExercise(ex); }}>
                          <span style={{color:"#e8ff3b",fontSize:8,letterSpacing:"0.1em"}}>{cat}</span>
                          <span>+ {ex}</span>
                        </button>
                      ))
                    )}
                    {Object.values(EXERCISES).flat().filter(ex => ex.toLowerCase().includes(exSearch.toLowerCase())).length === 0 && (
                      <div style={{color:"#888",fontSize:11,padding:"12px 0",textAlign:"center"}}>Aucun résultat</div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div style={S.log}>
              <div style={S.logHeader}>
                <div>
                  {editingSession && <div style={S.editBanner}>✏️ Modification d'une séance</div>}
              <div style={S.sectionLabel}>MA SÉANCE</div>
                  <div style={S.exerciseCount}>{sessionExercises.length} exercice{sessionExercises.length!==1?"s":""}</div>
                  <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                    <input type="date" style={S.dateInput} value={sessionDate} onChange={e=>setSessionDate(e.target.value)} />
                    <input type="text" style={S.dateInput} placeholder="Lieu" value={sessionLieu} onChange={e=>setSessionLieu(e.target.value)} />
                  </div>
                </div>
                {sessionExercises.length > 0 && <button style={S.finishBtn} onClick={finishSession}>{saving ? "SAUVEGARDE..." : "TERMINER ✓"}</button>}
              </div>
              {sessionExercises.length === 0
                ? <div style={S.emptyLog}><span style={{fontSize:36}}>👈</span><p>Sélectionne un exercice à gauche</p></div>
                : <div style={S.exCards}>
                    {sessionExercises.map((ex, ei) => (
                      <div key={ex.id} style={S.exCard}>
                        <div style={S.exCardHeader}>
                          <div><div style={S.exCardCat}>{ex.category}</div><div style={S.exCardName}>{ex.name}</div></div>
                          <div style={S.exCardActions}>
                            <button style={S.typeToggle} onClick={() => toggleType(ei)}>{ex.type==="reps"?"⏱ Temps":"🔄 Rép."}</button>
                            <button style={S.removeBtn} onClick={() => removeExercise(ei)}>✕</button>
                          </div>
                        </div>
                        <div style={S.setsHeader}>
                          <span style={{flex:"0 0 38px",textAlign:"center"}}>Série</span>
                          {ex.type==="reps"?<><span style={{flex:1,textAlign:"center"}}>Rép.</span><span style={{flex:1,textAlign:"center"}}>Poids (kg)</span></> : <>
                            <span style={{flex:1,textAlign:"center"}}>Durée (min)</span>
                            {DISTANCE_EXERCISES.includes(ex.name) && <span style={{flex:1,textAlign:"center"}}>Distance</span>}
                          </>}
                        </div>
                        {ex.sets.map((set, si) => (
                          <div key={si} style={S.setRow}>
                            <span style={S.setNum}>{si+1}</span>
                            {ex.type==="reps"
                              ? <><input style={S.setInput} type="number" placeholder="0" value={set.reps} onChange={e => updateSet(ei,si,"reps",e.target.value)} /><input style={S.setInput} type="number" placeholder="0" value={set.weight} onChange={e => updateSet(ei,si,"weight",e.target.value)} /></>
                              : <>
                                  <input style={{...S.setInput,flex:1}} type="number" placeholder="0 min" value={set.duration} onChange={e => updateSet(ei,si,"duration",e.target.value)} />
                                  {DISTANCE_EXERCISES.includes(ex.name) && (
                                    <div style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
                                      <input style={{...S.setInput,width:"100%",boxSizing:"border-box"}} type="number" placeholder="km (optionnel)" value={set.distance||""} onChange={e => updateSet(ei,si,"distance",e.target.value)} />
                                      {calcSpeed(set.duration, set.distance) && (
                                        <span style={{fontSize:9,color:"#e8ff3b",textAlign:"center"}}>⚡ {calcSpeed(set.duration, set.distance)} km/h moy.</span>
                                      )}
                                    </div>
                                  )}
                                </>}
                          </div>
                        ))}
                        <button style={S.addSetBtn} onClick={() => addSet(ei)}>+ Ajouter une série</button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        )}

        {/* RAPPORT */}
        {view === "report" && selectedSession && (
          <div style={S.reportWrap}>
            <div style={S.reportCard}>
              <div style={S.reportBadge}>✓ SÉANCE TERMINÉE</div>
              <div style={S.reportDate}>{selectedSession.noDate ? "Séance importée" : formatDate(selectedSession.date)}</div>
              <div style={S.reportStats}>
                <div style={S.statBox}><div style={S.statVal}>{selectedSession.exercises.length}</div><div style={S.statLbl}>Exercices</div></div>
                <div style={S.statBox}><div style={S.statVal}>{selectedSession.exercises.reduce((a,e)=>a+e.sets.length,0)}</div><div style={S.statLbl}>Séries</div></div>
                <div style={S.statBox}><div style={S.statVal}>{Math.round(totalVolume(selectedSession.exercises))} kg</div><div style={S.statLbl}>Volume</div></div>
                <div style={S.statBox}><div style={S.statVal}>{formatTime(selectedSession.duration)}</div><div style={S.statLbl}>Durée</div></div>
              </div>
              <ExerciseList exercises={selectedSession.exercises} />
              <div style={S.reportActions}>
                <button style={S.historyBtn} onClick={() => setView("history")}>VOIR L'HISTORIQUE</button>
                <button style={S.newSessionBtn} onClick={() => { setSessionExercises([]); setView("home"); }}>NOUVELLE SÉANCE</button>
              </div>
            </div>
          </div>
        )}

        {/* HISTORIQUE */}
        {view === "history" && (
          <div style={S.historyWrap}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
              <div style={S.sectionLabel}>{filteredHistory.length} SÉANCES</div>
              <div style={S.filterRow}>
                {lieux.map(l => <button key={l} style={{...S.filterBtn,...(filterLieu===l?S.filterActive:{})}} onClick={() => setFilterLieu(l)}>{l}</button>)}
              </div>
            </div>
            <div style={S.historyList}>
              {filteredHistory.map(s => (
                <div key={s.id} style={S.historyCard} onClick={() => { setSelectedSession(s); setView("detail"); }}>
                  <div>
                    <div style={S.historyCardDate}>{s.noDate ? <span style={{color:C.muted,fontSize:11,fontStyle:"italic"}}>{s.lieu} · séance importée</span> : formatDate(s.date)}</div>
                    <div style={S.historyCardInfo}>{s.exercises.length} exercices · {s.lieu}</div>
                    <div style={S.historyTags}>{[...new Set(s.exercises.map(e=>e.category))].map(c => <span key={c} style={S.catTag}>{c}</span>)}</div>
                  </div>
                  <div style={S.historyCardRight}>
                    {totalVolume(s.exercises)>0 && <><div style={S.historyVol}>{Math.round(totalVolume(s.exercises))} kg</div><div style={S.historyVolLbl}>volume</div></>}
                    {totalCardioMin(s.exercises)>0 && <><div style={{...S.historyVol,fontSize:15}}>{totalCardioMin(s.exercises)} min</div><div style={S.historyVolLbl}>cardio</div></>}
                    <span style={S.arrow}>›</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DETAIL */}
        {view === "detail" && selectedSession && (
          <div style={S.reportWrap}>
            <button style={S.backBtn} onClick={() => setView("history")}>← Retour</button>
            <div style={S.reportCard}>
              <span style={S.lieuBadge}>📍 {selectedSession.lieu}</span>
              <div style={{...S.reportDate, marginTop:12}}>{selectedSession.noDate ? <span style={{fontSize:14,color:"#888",fontStyle:"italic"}}>Séance importée · {selectedSession.lieu}</span> : formatDate(selectedSession.date)}</div>
              <div style={S.reportStats}>
                <div style={S.statBox}><div style={S.statVal}>{selectedSession.exercises.length}</div><div style={S.statLbl}>Exercices</div></div>
                <div style={S.statBox}><div style={S.statVal}>{selectedSession.exercises.reduce((a,e)=>a+e.sets.length,0)}</div><div style={S.statLbl}>Séries</div></div>
                <div style={S.statBox}><div style={S.statVal}>{Math.round(totalVolume(selectedSession.exercises))} kg</div><div style={S.statLbl}>Volume</div></div>
                <div style={S.statBox}><div style={S.statVal}>{totalCardioMin(selectedSession.exercises)} min</div><div style={S.statLbl}>Cardio</div></div>
              </div>
              <ExerciseList exercises={selectedSession.exercises} />

              {/* Edit / Delete */}
              {!selectedSession.noDate && (
                <div style={{display:"flex",gap:8,marginTop:20}}>
                  <button style={S.historyBtn} onClick={() => startEditSession(selectedSession)}>✏️ Modifier</button>
                  <button style={{...S.historyBtn, color:"#ff4646", borderColor:"#ff464640"}} onClick={() => setConfirmDelete(true)}>🗑 Supprimer</button>
                </div>
              )}

              {confirmDelete && (
                <div style={S.confirmBox}>
                  <p style={{margin:"0 0 12px",fontSize:13}}>Supprimer cette séance définitivement ?</p>
                  <div style={{display:"flex",gap:8}}>
                    <button style={S.historyBtn} onClick={() => setConfirmDelete(false)}>Annuler</button>
                    <button style={{...S.newSessionBtn, background:"#ff4646"}} onClick={() => deleteSession(selectedSession.id)}>Supprimer</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STATS */}
        {view === "stats" && (
          <div style={S.historyWrap}>
            <div style={S.sectionLabel}>MES STATISTIQUES</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:14,marginBottom:28}}>
              <div style={S.statBox}><div style={S.statVal}>{totalSessions}</div><div style={S.statLbl}>Séances</div></div>
              <div style={S.statBox}><div style={S.statVal}>{totalEx}</div><div style={S.statLbl}>Exercices</div></div>
              <div style={S.statBox}><div style={S.statVal}>{allCardio} min</div><div style={S.statLbl}>Cardio total</div></div>
            </div>

            <div style={S.sectionLabel}>TOP EXERCICES</div>
            <div style={{marginTop:10,marginBottom:26}}>
              {(() => {
                const cnt = {};
                history.forEach(s => s.exercises.forEach(e => { cnt[e.name]=(cnt[e.name]||0)+1; }));
                const max = Math.max(...Object.values(cnt));
                return Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,count]) => (
                  <div key={name} style={S.statRow}>
                    <span style={S.statRowName}>{name}</span>
                    <div style={S.barWrap}><div style={{...S.bar,width:`${Math.round(count/max*100)}%`}} /></div>
                    <span style={S.statRowCount}>{count}×</span>
                  </div>
                ));
              })()}
            </div>

            <div style={S.sectionLabel}>PROGRESSION PRESSE (kg max par séance)</div>
            <div style={{marginTop:10,marginBottom:26}}>
              {history.filter(s=>s.exercises.some(e=>e.name==="Presse")).map(s => {
                const ex = s.exercises.find(e=>e.name==="Presse");
                const max = Math.max(...ex.sets.map(st=>parseFloat(st.weight||0)));
                return (
                  <div key={s.id} style={S.statRow}>
                    <span style={{...S.statRowName,fontSize:10}}>{s.noDate ? s.lieu : new Date(s.date).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>
                    <div style={S.barWrap}><div style={{...S.bar,width:`${Math.round(max/90*100)}%`,background:"#4af"}} /></div>
                    <span style={S.statRowCount}>{max} kg</span>
                  </div>
                );
              })}
            </div>

            <div style={S.sectionLabel}>PROGRESSION HIP ABDUCTEUR (kg max)</div>
            <div style={{marginTop:10}}>
              {history.filter(s=>s.exercises.some(e=>e.name==="Hip Abducteur")).map(s => {
                const ex = s.exercises.find(e=>e.name==="Hip Abducteur");
                const max = Math.max(...ex.sets.map(st=>parseFloat(st.weight||0)));
                return (
                  <div key={s.id} style={S.statRow}>
                    <span style={{...S.statRowName,fontSize:10}}>{s.noDate ? s.lieu : new Date(s.date).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>
                    <div style={S.barWrap}><div style={{...S.bar,width:`${Math.round(max/55*100)}%`,background:"#f4a"}} /></div>
                    <span style={S.statRowCount}>{max} kg</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* TUTO MODAL */}
      {showTuto && (
        <div style={S.tutoOverlay}>
          <div style={S.tutoCard}>
            <div style={S.tutoHeader}>
              <span style={S.tutoEmoji}>👋</span>
              <div>
                <div style={S.tutoTitle}>Bienvenue Élodie !</div>
                <div style={S.tutoSub}>Voici comment utiliser ton tracker</div>
              </div>
            </div>

            <div style={S.tutoSteps}>
              <div style={S.tutoStep}>
                <span style={S.tutoNum}>1</span>
                <div>
                  <div style={S.tutoStepTitle}>Démarre une séance</div>
                  <div style={S.tutoStepDesc}>Appuie sur <b style={{color:"#e8ff3b"}}>DÉMARRER LA SÉANCE</b> depuis l'accueil.</div>
                </div>
              </div>
              <div style={S.tutoStep}>
                <span style={S.tutoNum}>2</span>
                <div>
                  <div style={S.tutoStepTitle}>Ajoute tes exercices</div>
                  <div style={S.tutoStepDesc}>Choisis une catégorie à gauche, ou tape directement dans la <b style={{color:"#e8ff3b"}}>barre de recherche</b>. Clique sur un exercice pour l'ajouter.</div>
                </div>
              </div>
              <div style={S.tutoStep}>
                <span style={S.tutoNum}>3</span>
                <div>
                  <div style={S.tutoStepTitle}>Remplis tes séries</div>
                  <div style={S.tutoStepDesc}>Pour chaque exercice, entre tes <b style={{color:"#e8ff3b"}}>répétitions et le poids</b>. Bascule en mode <b style={{color:"#e8ff3b"}}>⏱ Temps</b> pour le cardio.</div>
                </div>
              </div>
              <div style={S.tutoStep}>
                <span style={S.tutoNum}>4</span>
                <div>
                  <div style={S.tutoStepTitle}>Termine et génère ton rapport</div>
                  <div style={S.tutoStepDesc}>Appuie sur <b style={{color:"#e8ff3b"}}>TERMINER ✓</b> pour voir le résumé de ta séance et la sauvegarder.</div>
                </div>
              </div>
              <div style={S.tutoStep}>
                <span style={S.tutoNum}>5</span>
                <div>
                  <div style={S.tutoStepTitle}>Consulte ton historique et tes stats</div>
                  <div style={S.tutoStepDesc}>Retrouve toutes tes séances dans <b style={{color:"#e8ff3b"}}>HISTORIQUE</b>, et suis ta progression dans <b style={{color:"#e8ff3b"}}>STATS</b>.</div>
                </div>
              </div>
            </div>

            <div style={S.tutoBtns}>
              <button style={S.tutoClose} onClick={() => closeTuto(false)}>Compris, on y va ! 💪</button>
              <button style={S.tutoNever} onClick={() => closeTuto(true)}>Ne plus afficher</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const C = { black:"#0a0a0a", dark:"#111111", card:"#161616", border:"#272727", accent:"#e8ff3b", text:"#f0f0f0", muted:"#888", red:"#ff4646" };

const S = {
  root:{ minHeight:"100vh", background:C.black, color:C.text, fontFamily:"'DM Mono','Courier New',monospace", position:"relative" },
  bg:{ position:"fixed", inset:0, backgroundImage:"radial-gradient(ellipse 80% 60% at 50% -10%, #1a2200 0%, transparent 70%)", pointerEvents:"none", zIndex:0 },
  header:{ position:"relative", zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", borderBottom:`1px solid ${C.border}`, background:"rgba(10,10,10,0.95)", backdropFilter:"blur(10px)", flexWrap:"wrap", gap:10 },
  logo:{ display:"flex", alignItems:"center", gap:10 },
  logoIcon:{ fontSize:24, filter:"drop-shadow(0 0 8px #e8ff3b)" },
  logoName:{ fontSize:17, fontWeight:700, letterSpacing:"0.18em", color:C.accent, lineHeight:1 },
  logoSub:{ fontSize:9, color:C.muted, letterSpacing:"0.2em" },
  nav:{ display:"flex", gap:5 },
  navBtn:{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"7px 12px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:10, letterSpacing:"0.1em" },
  navActive:{ borderColor:C.accent, color:C.accent },
  main:{ position:"relative", zIndex:5, padding:"20px 24px", maxWidth:1100, margin:"0 auto" },
  centerWrap:{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"72vh" },
  startCard:{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"44px 36px", textAlign:"center", maxWidth:420 },
  startEmoji:{ fontSize:48, marginBottom:14 },
  startTitle:{ fontSize:24, fontWeight:700, margin:"0 0 8px", letterSpacing:"0.04em" },
  startSub:{ color:C.muted, fontSize:12, lineHeight:1.6, marginBottom:20 },
  quickStats:{ display:"flex", justifyContent:"center", gap:20, marginBottom:24, padding:"14px 0", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` },
  qs:{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 },
  qsV:{ fontSize:20, fontWeight:700, color:C.accent },
  qsL:{ fontSize:9, color:C.muted, letterSpacing:"0.1em" },
  startBtn:{ background:C.accent, color:C.black, border:"none", borderRadius:8, padding:"13px 28px", fontFamily:"inherit", fontWeight:700, fontSize:12, letterSpacing:"0.1em", cursor:"pointer" },
  sessionLayout:{ display:"grid", gridTemplateColumns:"240px 1fr", gap:20 },
  picker:{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16, height:"fit-content", position:"sticky", top:20 },
  sectionLabel:{ fontSize:9, letterSpacing:"0.25em", color:C.accent, marginBottom:9, fontWeight:700 },
  catList:{ display:"flex", flexDirection:"column", gap:3, marginBottom:10 },
  catBtn:{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"6px 10px", borderRadius:5, cursor:"pointer", fontFamily:"inherit", fontSize:10, textAlign:"left" },
  catActive:{ background:"rgba(232,255,59,0.12)", borderColor:C.accent, color:C.accent },
  exList:{ display:"flex", flexDirection:"column", gap:3 },
  searchInput:{ width:"100%", boxSizing:"border-box", background:"#1a1a1a", border:`1px solid ${C.border}`, borderRadius:6, color:C.text, fontFamily:"inherit", fontSize:11, padding:"8px 10px", outline:"none", marginBottom:14 },
  exBtn:{ background:"transparent", border:`1px solid ${C.border}`, color:C.text, padding:"6px 10px", borderRadius:5, cursor:"pointer", fontFamily:"inherit", fontSize:10, textAlign:"left" },
  exBtnSearch:{ background:"transparent", border:`1px solid ${C.border}`, color:C.text, padding:"6px 10px", borderRadius:5, cursor:"pointer", fontFamily:"inherit", fontSize:10, textAlign:"left", display:"flex", flexDirection:"column", gap:2 },
  log:{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 },
  logHeader:{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 },
  exerciseCount:{ fontSize:11, color:C.muted, marginTop:3 },
  finishBtn:{ background:C.accent, color:C.black, border:"none", borderRadius:7, padding:"10px 20px", fontFamily:"inherit", fontWeight:700, fontSize:11, letterSpacing:"0.08em", cursor:"pointer" },
  emptyLog:{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:240, color:C.muted, gap:10, fontSize:12 },
  exCards:{ display:"flex", flexDirection:"column", gap:12 },
  exCard:{ background:C.dark, border:`1px solid ${C.border}`, borderRadius:9, padding:13 },
  exCardHeader:{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 },
  exCardCat:{ fontSize:8, color:C.accent, letterSpacing:"0.18em", fontWeight:700 },
  exCardName:{ fontSize:14, fontWeight:600, marginTop:2 },
  exCardActions:{ display:"flex", gap:4 },
  typeToggle:{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"3px 7px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:9 },
  removeBtn:{ background:"transparent", border:`1px solid #ff464640`, color:C.red, padding:"3px 7px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:10 },
  setsHeader:{ display:"flex", gap:6, fontSize:9, color:C.muted, letterSpacing:"0.1em", marginBottom:5 },
  setRow:{ display:"flex", gap:6, alignItems:"center", marginBottom:4 },
  setNum:{ flex:"0 0 34px", textAlign:"center", fontSize:11, color:C.muted, background:"#1e1e1e", borderRadius:4, padding:"6px 0" },
  setInput:{ flex:1, background:"#1a1a1a", border:`1px solid ${C.border}`, borderRadius:4, color:C.text, fontFamily:"inherit", fontSize:13, padding:"6px 8px", textAlign:"center", outline:"none" },
  addSetBtn:{ background:"transparent", border:`1px dashed ${C.border}`, color:C.muted, padding:"6px", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:10, width:"100%", marginTop:3 },
  reportWrap:{ maxWidth:680, margin:"0 auto" },
  reportCard:{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"28px 24px" },
  reportBadge:{ display:"inline-block", background:"rgba(232,255,59,0.15)", border:`1px solid ${C.accent}`, color:C.accent, borderRadius:20, padding:"4px 12px", fontSize:9, letterSpacing:"0.14em", fontWeight:700, marginBottom:12 },
  reportDate:{ fontSize:19, fontWeight:700, marginBottom:18 },
  reportStats:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:20 },
  statBox:{ background:C.dark, border:`1px solid ${C.border}`, borderRadius:9, padding:"12px 8px", textAlign:"center" },
  statVal:{ fontSize:18, fontWeight:700, color:C.accent },
  statLbl:{ fontSize:8, color:C.muted, letterSpacing:"0.1em", marginTop:3 },
  reportExList:{ display:"flex", flexDirection:"column", gap:7 },
  reportExItem:{ background:C.dark, border:`1px solid ${C.border}`, borderRadius:7, padding:"10px 12px" },
  reportExSets:{ display:"flex", flexWrap:"wrap", gap:4 },
  reportSetTag:{ background:"rgba(232,255,59,0.1)", border:`1px solid rgba(232,255,59,0.25)`, color:C.accent, borderRadius:20, padding:"2px 8px", fontSize:9 },
  reportActions:{ display:"flex", gap:8, marginTop:20 },
  historyBtn:{ flex:1, background:"transparent", border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:"10px", fontFamily:"inherit", fontWeight:600, fontSize:10, letterSpacing:"0.06em", cursor:"pointer" },
  newSessionBtn:{ flex:1, background:C.accent, color:C.black, border:"none", borderRadius:6, padding:"10px", fontFamily:"inherit", fontWeight:700, fontSize:10, letterSpacing:"0.06em", cursor:"pointer" },
  historyWrap:{ maxWidth:760, margin:"0 auto" },
  filterRow:{ display:"flex", gap:4, flexWrap:"wrap" },
  filterBtn:{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"4px 9px", borderRadius:20, cursor:"pointer", fontFamily:"inherit", fontSize:9 },
  filterActive:{ borderColor:C.accent, color:C.accent, background:"rgba(232,255,59,0.08)" },
  historyList:{ display:"flex", flexDirection:"column", gap:7 },
  historyCard:{ background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" },
  historyCardDate:{ fontSize:13, fontWeight:600, marginBottom:2 },
  historyCardInfo:{ fontSize:10, color:C.muted, marginBottom:6 },
  historyTags:{ display:"flex", gap:4, flexWrap:"wrap" },
  catTag:{ background:"rgba(232,255,59,0.08)", border:`1px solid rgba(232,255,59,0.2)`, color:C.accent, borderRadius:20, padding:"1px 6px", fontSize:8, letterSpacing:"0.07em" },
  historyCardRight:{ textAlign:"right", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:1, minWidth:65 },
  historyVol:{ fontSize:17, fontWeight:700, color:C.accent },
  historyVolLbl:{ fontSize:8, color:C.muted, letterSpacing:"0.08em" },
  arrow:{ fontSize:18, color:C.muted, marginTop:3 },
  backBtn:{ background:"transparent", border:"none", color:C.muted, fontFamily:"inherit", fontSize:11, cursor:"pointer", marginBottom:12, padding:0 },
  lieuBadge:{ background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`, borderRadius:20, padding:"3px 10px", fontSize:10, color:C.muted },
  statRow:{ display:"flex", alignItems:"center", gap:8, marginBottom:7 },
  statRowName:{ flex:"0 0 150px", fontSize:10, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  barWrap:{ flex:1, height:7, background:"#1e1e1e", borderRadius:4, overflow:"hidden" },
  bar:{ height:"100%", background:C.accent, borderRadius:4 },
  statRowCount:{ flex:"0 0 48px", textAlign:"right", fontSize:10, color:C.accent, fontWeight:700 },
  tutoOverlay:{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" },
  tutoCard:{ background:"#161616", border:`1px solid #272727`, borderRadius:16, padding:"28px 24px", maxWidth:480, width:"100%", maxHeight:"90vh", overflowY:"auto" },
  tutoHeader:{ display:"flex", alignItems:"center", gap:14, marginBottom:24, paddingBottom:18, borderBottom:"1px solid #272727" },
  tutoEmoji:{ fontSize:40 },
  tutoTitle:{ fontSize:20, fontWeight:700, color:"#f0f0f0", letterSpacing:"0.03em" },
  tutoSub:{ fontSize:11, color:"#888", marginTop:3 },
  tutoSteps:{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 },
  tutoStep:{ display:"flex", gap:14, alignItems:"flex-start" },
  tutoNum:{ flex:"0 0 28px", height:28, background:"rgba(232,255,59,0.15)", border:"1px solid rgba(232,255,59,0.4)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#e8ff3b" },
  tutoStepTitle:{ fontSize:13, fontWeight:700, color:"#f0f0f0", marginBottom:4 },
  tutoStepDesc:{ fontSize:11, color:"#888", lineHeight:1.6 },
  tutoBtns:{ display:"flex", flexDirection:"column", gap:8 },
  tutoClose:{ background:"#e8ff3b", color:"#0a0a0a", border:"none", borderRadius:8, padding:"13px", fontFamily:"inherit", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:"0.06em" },
  tutoNever:{ background:"transparent", color:"#555", border:"1px solid #272727", borderRadius:8, padding:"10px", fontFamily:"inherit", fontSize:11, cursor:"pointer" },
  loadOverlay:{ position:"fixed", inset:0, background:"#0a0a0a", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 },
  loadCard:{ display:"flex", flexDirection:"column", alignItems:"center", gap:32, maxWidth:340, width:"100%" },
  loadLogo:{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, textAlign:"center" },
  loadSteps:{ display:"flex", flexDirection:"column", gap:14, width:"100%" },
  loadStepRow:{ display:"flex", alignItems:"center", gap:12, transition:"opacity 0.4s" },
  loadStepDot:{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#0a0a0a", flexShrink:0, transition:"all 0.3s" },
  loadSpinner:{ marginLeft:"auto", fontSize:14 },
  loadBarWrap:{ width:"100%", height:4, background:"#1e1e1e", borderRadius:4, overflow:"hidden" },
  loadBar:{ height:"100%", borderRadius:4, transition:"width 0.6s ease, background 0.3s" },
  loadMotivation:{ minHeight:40, textAlign:"center", fontSize:12, color:"#e8ff3b", fontStyle:"italic", lineHeight:1.6, padding:"0 10px", transition:"opacity 0.5s" },
  motivBox:{ background:"rgba(232,255,59,0.08)", border:"1px solid rgba(232,255,59,0.25)", borderRadius:10, padding:"14px 16px", marginBottom:20, width:"100%", boxSizing:"border-box", textAlign:"center" },
  motivText:{ fontSize:12, color:"#e8ff3b", fontStyle:"italic", lineHeight:1.7 },
  editBanner:{ background:"rgba(232,255,59,0.12)", border:"1px solid rgba(232,255,59,0.3)", borderRadius:6, padding:"6px 12px", fontSize:10, color:"#e8ff3b", letterSpacing:"0.1em", marginBottom:10, textAlign:"center" },
  dateInput:{ background:"#1a1a1a", border:"1px solid #272727", borderRadius:5, color:"#f0f0f0", fontFamily:"inherit", fontSize:11, padding:"5px 8px", outline:"none" },
  confirmBox:{ background:"rgba(255,70,70,0.08)", border:"1px solid rgba(255,70,70,0.3)", borderRadius:8, padding:"16px", marginTop:12 },
};
