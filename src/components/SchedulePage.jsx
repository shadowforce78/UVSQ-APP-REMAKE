import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fr } from 'date-fns/locale';

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

function SchedulePage({ onBack, groupe, onRefresh, loading, error, schedule: scheduleData }) {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 14)));
    const [schedule, setSchedule] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('INFO');
    const [groupeLocal, setGroupeLocal] = useState(groupe || AVAILABLE_GROUPS.INFO[0]);

    const formatEventData = (rawEvents) => {
        return rawEvents.map(event => {
            const [date, time] = event.Heure.split(' ');
            const [startTime, endTime] = time.split('-');
            const [day, month, year] = date.split('/');
            
            // Créer les timestamps
            const start = new Date(`${year}-${month}-${day}T${startTime}:00`);
            const end = new Date(`${year}-${month}-${day}T${endTime}:00`);

            return {
                start,
                end,
                summary: Array.isArray(event.Matière) ? event.Matière.join(' + ') : event.Matière,
                location: event.Salle || 'Non défini',
                type: event['Catégorie d\'événement'],
                staff: Array.isArray(event.Personnel) ? event.Personnel.join(', ') : event.Personnel,
                description: event.Remarques
            };
        });
    };

    // Mettre à jour le state schedule quand les données arrivent
    useEffect(() => {
        if (scheduleData && Array.isArray(scheduleData)) {
            const formattedData = formatEventData(scheduleData);
            setSchedule(formattedData);
        }
    }, [scheduleData]);

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const timeSlots = Array.from({ length: 24 }, (_, i) => i + 8).filter(h => h >= 8 && h <= 19);

    const formatTime = (hour) => {
        return `${hour}:00`;
    };

    const getEventForTimeSlot = (day, hour) => {
        return schedule.find(event => {
            const eventDate = new Date(event.start);
            const eventDay = eventDate.getDay();
            const eventHour = eventDate.getHours();
            const eventDuration = (new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60);
            
            // Vérifier si l'événement commence à cette heure ou est en cours
            const isInTimeSlot = eventHour <= hour && (eventHour + eventDuration) > hour;
            return eventDay === days.indexOf(day) + 1 && isInTimeSlot;
        });
    };

    const getEventType = (type) => {
        if (!type) return 'default';
        if (type.includes('CM')) return 'cm';
        if (type.includes('TD')) return 'td';
        if (type.includes('TP')) return 'tp';
        if (type.includes('DS')) return 'ds';
        if (type.includes('autonomie')) return 'autonomie';
        return 'default';
    };

    return (
        <div className="schedule-page">
            <div className="schedule-header">
                <div className="schedule-header-content">
                    <div className="schedule-header-top">
                        <button className="back-button" onClick={onBack}>← Retour</button>
                        <div className="schedule-title">
                            <h1>Emploi du temps</h1>
                        </div>
                    </div>

                    <div className="schedule-controls">
                        <div className="control-group">
                            <label>Département</label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => {
                                    setSelectedDepartment(e.target.value);
                                    setGroupeLocal(AVAILABLE_GROUPS[e.target.value][0]);
                                }}
                                className="department-select"
                            >
                                {Object.keys(AVAILABLE_GROUPS).map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div className="control-group">
                            <label>Groupe</label>
                            <select
                                value={groupeLocal}
                                onChange={(e) => setGroupeLocal(e.target.value)}
                                className="group-select"
                            >
                                {AVAILABLE_GROUPS[selectedDepartment].map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        </div>
                        <div className="date-controls">
                            <div className="control-group">
                                <label>Du</label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={date => setStartDate(date)}
                                    locale={fr}
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                            <div className="control-group">
                                <label>Au</label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={date => setEndDate(date)}
                                    locale={fr}
                                    dateFormat="dd/MM/yyyy"
                                    minDate={startDate}
                                />
                            </div>
                        </div>
                        <button 
                            className="refresh-button"
                            onClick={() => onRefresh(groupeLocal, startDate, endDate)}
                            disabled={loading}
                        >
                            {loading ? "Chargement..." : "Actualiser"}
                        </button>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="schedule-grid-container">
                    <div className="schedule-grid">
                        <div className="grid-header time-header"></div>
                        {days.map(day => (
                            <div key={day} className="grid-header">
                                {day}
                            </div>
                        ))}
                        
                        {timeSlots.map(hour => (
                            <React.Fragment key={hour}>
                                <div className="time-slot">
                                    {formatTime(hour)}
                                </div>
                                {days.map(day => {
                                    const event = getEventForTimeSlot(day, hour);
                                    return (
                                        <div key={`${day}-${hour}`} className="grid-cell">
                                            {event && (
                                                <div className={`course-card ${getEventType(event.type)}`}>
                                                    <div className="course-title">
                                                        {event.summary}
                                                    </div>
                                                    <div className="course-details">
                                                        {event.location && (
                                                            <div className="course-location">
                                                                {event.location}
                                                            </div>
                                                        )}
                                                        {event.staff && (
                                                            <div className="course-staff">
                                                                {event.staff}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SchedulePage;
