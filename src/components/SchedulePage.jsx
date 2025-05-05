import React, { useState, useEffect } from 'react';
import './SchedulePage.css';

// Constants for event types and their colors
const EVENT_TYPES = {
  "Travaux Dirigés (TD)": { short: "TD", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.1)" },
  "Cours Magistraux (CM)": { short: "CM", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)" },
  "Travaux Pratiques (TP)": { short: "TP", color: "#f97316", bgColor: "rgba(249, 115, 22, 0.1)" },
  "DS": { short: "DS", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)" },
  "Projet en autonomie": { short: "Autonomie", color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.1)" },
  "Jour férié": { short: "Férié", color: "#64748b", bgColor: "rgba(100, 116, 139, 0.1)" }
};

// Days of the week
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

// Hours range for the schedule
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 to 19:00

// Available groups by department
const AVAILABLE_GROUPS = {
  INFO: [
      "INF1-A1", "INF1-A2", "INF1-B1", "INF1-B2",
      "INF1-C1", "INF1-C2", "INF2-FA", "INF2-FI-A",
      "INF2-FI-B", "INF3-FA-A", "INF3-FA-B", "INF3-FI"
  ],
  MMI: [
      "MMI1-A1", "MMI1-A2", "MMI1-B1", "MMI1-B2",
      "MMI2-A1", "MMI2-A2", "MMI2-B1", "MMI2-B2"
  ],
  RT: [
      "RT1-FA", "RT1-FI-A1", "RT1-FI-A2",
      "RT1-FI-B1", "RT1-FI-B2"
  ],
  GEII: [
      "GEII1-TDA1", "GEII1-TDA2", "GEII1-TDB1",
      "GEII1-TDB2", "GEII1-TDC", "GEII1-TP1",
      "GEII1-TP2", "GEII1-TP3"
  ]
};

function SchedulePage({ onBack }) {
  const [currentWeek, setCurrentWeek] = useState(getWeekDates());
  const [processedSchedule, setProcessedSchedule] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState([]);
  
  // Initialisation avec les valeurs du localStorage ou valeurs par défaut
  const [department, setDepartment] = useState(() => {
    return localStorage.getItem('selectedDepartment') || 'INFO';
  });
  
  const [selectedClass, setSelectedClass] = useState(() => {
    const savedClass = localStorage.getItem('selectedClass');
    const savedDept = localStorage.getItem('selectedDepartment') || 'INFO';
    
    // Vérifier si la classe sauvegardée appartient bien au département
    if (savedClass && AVAILABLE_GROUPS[savedDept]?.includes(savedClass)) {
      return savedClass;
    }
    
    // Sinon, prendre la première classe du département
    return AVAILABLE_GROUPS[savedDept][0];
  });

  // Function to get an array of dates for the current week
  function getWeekDates() {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the Monday of the current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    // Generate array of dates for the week (Monday to Friday)
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  }

  // Function to format date to YYYY-MM-DD for API request
  function formatDateForAPI(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  // Function to get the previous week
  function getPreviousWeek() {
    const newWeek = currentWeek.map(date => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() - 7);
      return newDate;
    });
    setCurrentWeek(newWeek);
  }

  // Function to get the next week
  function getNextWeek() {
    const newWeek = currentWeek.map(date => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 7);
      return newDate;
    });
    setCurrentWeek(newWeek);
  }

  // Format a date to DD/MM/YYYY for display
  function formatDate(date) {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }

  // Parse time string to get hours and minutes
  function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  }
  
  // Calculate position and height for a schedule event
  function calculateEventStyle(timeRange) {
    const [startTime, endTime] = timeRange.split('-');
    const startHour = parseTime(startTime);
    const endHour = parseTime(endTime);
    
    const topPercentage = ((startHour - 8) / 12) * 100; // 8 is the start hour, 12 is the total hours range
    const heightPercentage = ((endHour - startHour) / 12) * 100;
    
    return {
      top: `${topPercentage}%`,
      height: `${heightPercentage}%`
    };
  }

  // Fonction pour obtenir l'URL de base de l'API en fonction de l'environnement
  function getApiBaseUrl() {
    // En production, utiliser l'URL relative (même serveur)
    // Sinon, utiliser localhost pour le développement
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : '';
  }

  // Fetch schedule data from API
  async function fetchSchedule() {
    if (!selectedClass) return;
    
    setIsLoading(true);
    setError(null);
    
    const startDate = formatDateForAPI(currentWeek[0]);
    const endDate = formatDateForAPI(currentWeek[4]);
    
    try {
      // Utilisation de l'URL adaptative selon l'environnement
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/schedule/${selectedClass}+${startDate}+${endDate}`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de l'emploi du temps (${response.status})`);
      }
      
      const data = await response.json();
      setSchedule(data);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'emploi du temps:", err);
      setError(`Impossible de récupérer l'emploi du temps: ${err.message}`);
      
      // Utilisation de données de test si l'API n'est pas disponible
      if (process.env.NODE_ENV === 'development') {
        console.log("Utilisation des données de test pour le développement");
        const testData = [
          {"Date":"07/05/2025","Heure":"15:00-17:00","Matière":"IN2R13","Personnel":"TROTIGNON Clemence","Groupe":"INF1-B","Salle":"414 - VEL","Catégorie d’événement":"Travaux Dirigés (TD)","Remarques":null},
          {"Date":"07/05/2025","Heure":"08:30-10:00","Matière":"IN2SA01, IN2SA02","Personnel":null,"Groupe":"INF1-B","Salle":null,"Catégorie d’événement":"Projet en autonomie","Remarques":"Salle g21 ou g23"},
          {"Date":"07/05/2025","Heure":"10:30-12:30","Matière":"IN2R05","Personnel":"HOGUIN Fabrice","Groupe":"INF1-B","Salle":null,"Catégorie d’événement":"Travaux Dirigés (TD)","Remarques":null},
          {"Date":"07/05/2025","Heure":"13:30-15:00","Matière":"IN2R09","Personnel":"OSTER Alain","Groupe":"INF1-B","Salle":"313 - VEL","Catégorie d’événement":"Travaux Dirigés (TD)","Remarques":null},
          {"Date":"09/05/2025","Heure":"10:30-12:00","Matière":"IN2R10","Personnel":"BARREAU Sebastien","Groupe":"INF1-B","Salle":"414 - VEL","Catégorie d’événement":"Travaux Dirigés (TD)","Remarques":null},
          {"Date":"09/05/2025","Heure":"08:30-10:30","Matière":"IN2R06","Personnel":"ZEITOUNI Karine","Groupe":"INF1-B","Salle":"G25 - VEL","Catégorie d’événement":"Travaux Dirigés (TD)","Remarques":null},
          {"Date":"09/05/2025","Heure":"14:30-16:30","Matière":"IN2SA04","Personnel":null,"Groupe":"INF1-B","Salle":null,"Catégorie d’événement":"Projet en autonomie","Remarques":"Salle g21 ou g23"},
          {"Date":"09/05/2025","Heure":"13:00-14:30","Matière":"IN2SA01, IN2SA02","Personnel":null,"Groupe":"INF1-B","Salle":null,"Catégorie d’événement":"Projet en autonomie","Remarques":"Salle g21 ou g23"},
          {"Date":"05/05/2025","Heure":"14:00-15:00","Matière":"IN2R06","Personnel":"ZEITOUNI Karine","Groupe":"INF1","Salle":"Amphi B - VEL","Catégorie d’événement":"Cours Magistraux (CM)","Remarques":null},
          {"Date":"05/05/2025","Heure":"09:00-11:00","Matière":"IN2R03","Personnel":"NETO Lucas","Groupe":"INF1-B","Salle":"I21 - VEL","Catégorie d’événement":"Travaux Dirigés (TD)","Remarques":null},
          {"Date":"05/05/2025","Heure":"11:00-12:30","Matière":"IN2R10","Personnel":"BARREAU Sebastien","Groupe":"INF1-B","Salle":"414 - VEL","Catégorie d’événement":"Travaux Dirigés (TD)","Remarques":null},
          {"Date":"05/05/2025","Heure":"15:00-17:30","Matière":"IN2R02","Personnel":"ROBBA Isabelle","Groupe":"INF1-B","Salle":"G26 - VEL","Catégorie d’événement":"Travaux Dirigés (TD)","Remarques":null},
          {"Date":"06/05/2025","Heure":"12:00-13:00","Matière":"IN2SA04","Personnel":"HOGUIN Fabrice","Groupe":"INF1","Salle":"Amphi C - VEL","Catégorie d’événement":"DS","Remarques":null},
          {"Date":"06/05/2025","Heure":"14:00-15:30","Matière":"IN2R02","Personnel":"MARTIN Yohann, ROBBA Isabelle","Groupe":"INF1-B","Salle":"G26 - VEL","Catégorie d’événement":"Travaux Pratiques (TP)","Remarques":null},
          {"Date":"06/05/2025","Heure":"15:44-17:14","Matière":"IN2R09","Personnel":"OSTER Alain","Groupe":"INF1-B","Salle":"414 - VEL","Catégorie d’événement":"Travaux Dirigés (TD)","Remarques":null},
          {"Date":"06/05/2025","Heure":"08:30-10:00","Matière":"IN2R09","Personnel":"OSTER Alain","Groupe":"INF1-B","Salle":"414 - VEL","Catégorie d’événement":"Travaux Dirigés (TD)","Remarques":null},
          {"Date":"06/05/2025","Heure":"10:15-12:00","Matière":"IN2R07","Personnel":"OSTER Alain, ROBBA Isabelle","Groupe":"INF1-B","Salle":"Amphi A - VEL","Catégorie d’événement":"DS","Remarques":null},
          {"Date":"08/05/2025","Heure":"08:00-19:00","Matière":null,"Personnel":null,"Groupe":null,"Salle":null,"Catégorie d’événement":"Jour férié","Remarques":null}
        ];
        setSchedule(testData);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Handle department change
  const handleDepartmentChange = (e) => {
    const newDepartment = e.target.value;
    setDepartment(newDepartment);
    
    // Sauvegarder le département dans le localStorage
    localStorage.setItem('selectedDepartment', newDepartment);
    
    // Select first group from the new department
    const newClass = AVAILABLE_GROUPS[newDepartment][0];
    setSelectedClass(newClass);
    
    // Sauvegarder la nouvelle classe dans le localStorage
    localStorage.setItem('selectedClass', newClass);
  };
  
  // Handle class change
  const handleClassChange = (e) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    
    // Sauvegarder la classe dans le localStorage
    localStorage.setItem('selectedClass', newClass);
  };
  
  // Sauvegarder les préférences quand elles changent
  useEffect(() => {
    localStorage.setItem('selectedDepartment', department);
    localStorage.setItem('selectedClass', selectedClass);
  }, [department, selectedClass]);

  // Process schedule data into a format for display
  useEffect(() => {
    if (!schedule || !Array.isArray(schedule)) return;
    
    const processed = {};
    
    // Initialize empty arrays for each day of the week
    currentWeek.forEach(date => {
      processed[formatDate(date)] = [];
    });
    
    // Add events to their respective days
    schedule.forEach(event => {
      if (processed[event.Date]) {
        processed[event.Date].push(event);
      }
    });
    
    // Sort events by start time for each day
    Object.keys(processed).forEach(date => {
      processed[date].sort((a, b) => {
        const aStartTime = parseTime(a.Heure.split('-')[0]);
        const bStartTime = parseTime(b.Heure.split('-')[0]);
        return aStartTime - bStartTime;
      });
    });
    
    setProcessedSchedule(processed);
  }, [schedule, currentWeek]);

  // Fetch schedule when component mounts or when week/class changes
  useEffect(() => {
    fetchSchedule();
  }, [currentWeek, selectedClass]);

  // Handle event click to show the modal
  const handleEventClick = (event, e) => {
    setSelectedEvent(event);
    
    // Calculate the modal position
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    setModalPosition({
      top: rect.top + scrollTop,
      left: rect.right + 10 // 10px offset from the event
    });
  };

  // Close the modal when clicking outside
  const handleClickOutside = (e) => {
    if (selectedEvent && !e.target.closest('.schedule-event') && !e.target.closest('.event-details-modal')) {
      setSelectedEvent(null);
    }
  };

  // Add event listener for clicking outside the modal
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedEvent]);

  // Get the proper event type styling
  const getEventTypeStyle = (eventType) => {
    const type = EVENT_TYPES[eventType] || { color: "#64748b", bgColor: "rgba(100, 116, 139, 0.1)", short: "?" };
    return {
      borderLeftColor: type.color,
      backgroundColor: type.bgColor
    };
  };

  // Get shortened event type name
  const getEventTypeShort = (eventType) => {
    return EVENT_TYPES[eventType]?.short || eventType;
  };

  // Format the date range of the current week
  const weekDateRange = `${formatDate(currentWeek[0])} - ${formatDate(currentWeek[4])}`;

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="schedule-page" onClick={handleClickOutside}>
      <header className="schedule-header">
        <button 
          className="back-button" 
          onClick={onBack}
          aria-label="Retourner à la page précédente"
        >
          ← Retour
        </button>
        <h1>Emploi du temps</h1>

        <div className="schedule-controls">
          <div className="controls-group">
            <label htmlFor="department-select">Département:</label>
            <select 
              id="department-select" 
              value={department} 
              onChange={handleDepartmentChange}
              className="schedule-select"
            >
              {Object.keys(AVAILABLE_GROUPS).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div className="controls-group">
            <label htmlFor="class-select">Groupe:</label>
            <select 
              id="class-select" 
              value={selectedClass} 
              onChange={handleClassChange}
              className="schedule-select"
            >
              {AVAILABLE_GROUPS[department].map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="refresh-button" 
            onClick={fetchSchedule}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>

        <div className="week-navigation">
          <button 
            className="nav-button prev" 
            onClick={getPreviousWeek}
            aria-label="Semaine précédente"
          >
            ← Semaine précédente
          </button>
          <span className="current-week" aria-live="polite">
            {weekDateRange}
          </span>
          <button 
            className="nav-button next" 
            onClick={getNextWeek}
            aria-label="Semaine suivante"
          >
            Semaine suivante →
          </button>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="loading-indicator" aria-live="polite">
          <div className="spinner"></div>
          <p>Chargement de l'emploi du temps...</p>
        </div>
      )}

      <div className="schedule-legend" aria-label="Légende des types de cours">
        {Object.entries(EVENT_TYPES).map(([type, { short, color }]) => (
          <div className="legend-item" key={type}>
            <span className="legend-color" style={{ backgroundColor: color }}></span>
            <span className="legend-text">{short} - {type}</span>
          </div>
        ))}
      </div>

      {!isLoading && !error && (
        <div className="schedule-grid-container" role="region" aria-label="Grille d'emploi du temps">
          <div className="schedule-grid">
            {/* Time column */}
            <div className="time-column">
              <div className="day-header empty-header"></div>
              {HOURS.map(hour => (
                <div className="time-slot" key={hour}>
                  {`${hour}:00`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {currentWeek.map((date, index) => {
              const formattedDate = formatDate(date);
              const dayName = DAYS[index];
              const dayEvents = processedSchedule[formattedDate] || [];
              const isTodayClass = isToday(date) ? 'today' : '';
              
              return (
                <div className={`day-column ${isTodayClass}`} key={formattedDate}>
                  <div className="day-header">
                    <span className="day-name">{dayName}</span>
                    <span className="day-date">{formattedDate}</span>
                  </div>
                  <div className="day-events">
                    {/* Hour grid lines */}
                    {HOURS.map(hour => (
                      <div className="hour-gridline" key={hour}></div>
                    ))}
                    
                    {/* Special handling for holidays */}
                    {dayEvents.some(event => event["Catégorie d’événement"] === "Jour férié") ? (
                      <div className="holiday-indicator">
                        <div className="holiday-content">
                          <span className="holiday-icon">🏖️</span>
                          <span className="holiday-text">Jour férié</span>
                        </div>
                      </div>
                    ) : (
                      /* Regular events */
                      dayEvents.map((event, eventIndex) => {
                        const eventStyle = {
                          ...calculateEventStyle(event.Heure),
                          ...getEventTypeStyle(event["Catégorie d’événement"])
                        };
                        
                        return (
                          <div 
                            className="schedule-event" 
                            style={eventStyle}
                            key={eventIndex}
                            onClick={(e) => handleEventClick(event, e)}
                            tabIndex={0}
                            role="button"
                            aria-label={`${event.Matière || ''} - ${event["Catégorie d’événement"]} - ${event.Heure}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleEventClick(event, e);
                                e.preventDefault();
                              }
                            }}
                          >
                            <div className="event-time">{event.Heure}</div>
                            <div className="event-title">{event.Matière || 'Sans titre'}</div>
                            <div className="event-type">
                              {getEventTypeShort(event["Catégorie d’événement"])}
                            </div>
                            {event.Salle && (
                              <div className="event-location">{event.Salle}</div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event details modal */}
      {selectedEvent && (
        <div 
          className="event-details-modal"
          style={{ top: `${modalPosition.top}px`, left: `${modalPosition.left}px` }}
          role="dialog"
          aria-label="Détails du cours"
        >
          <button 
            className="close-modal"
            onClick={() => setSelectedEvent(null)}
            aria-label="Fermer les détails"
          >
            ×
          </button>
          <h3>{selectedEvent.Matière || 'Sans titre'}</h3>
          <div className="modal-detail">
            <strong>Date:</strong> {selectedEvent.Date}
          </div>
          <div className="modal-detail">
            <strong>Horaire:</strong> {selectedEvent.Heure}
          </div>
          <div className="modal-detail">
            <strong>Type:</strong> {selectedEvent["Catégorie d’événement"]}
          </div>
          {selectedEvent.Personnel && (
            <div className="modal-detail">
              <strong>Enseignant:</strong> {selectedEvent.Personnel}
            </div>
          )}
          {selectedEvent.Groupe && (
            <div className="modal-detail">
              <strong>Groupe:</strong> {selectedEvent.Groupe}
            </div>
          )}
          {selectedEvent.Salle && (
            <div className="modal-detail">
              <strong>Salle:</strong> {selectedEvent.Salle}
            </div>
          )}
          {selectedEvent.Remarques && (
            <div className="modal-detail">
              <strong>Remarques:</strong> {selectedEvent.Remarques}
            </div>
          )}
        </div>
      )}

      {/* No events message */}
      {!isLoading && !error && Object.values(processedSchedule).flat().length === 0 && (
        <div className="no-events">
          <p>Aucun cours programmé pour cette semaine</p>
        </div>
      )}
    </div>
  );
}

export default SchedulePage;
