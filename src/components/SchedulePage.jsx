import React, { useState } from 'react';
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

function SchedulePage({ onBack, groupe, onRefresh, loading, error }) {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 14)));
    const [schedule, setSchedule] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('INFO');
    const [groupeLocal, setGroupeLocal] = useState(groupe || AVAILABLE_GROUPS.INFO[0]);

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const timeSlots = Array.from({ length: 24 }, (_, i) => i + 8).filter(h => h >= 8 && h <= 19);

    const formatTime = (hour) => {
        return `${hour}:00`;
    };

    const getEventForTimeSlot = (day, hour) => {
        // Logique pour trouver l'événement correspondant au créneau horaire
        return schedule.find(event => {
            const eventDate = new Date(event.start);
            const eventDay = eventDate.getDay();
            const eventHour = eventDate.getHours();
            return eventDay === days.indexOf(day) + 1 && eventHour === hour;
        });
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
                                {days.map(day => (
                                    <div key={`${day}-${hour}`} className="grid-cell">
                                        {getEventForTimeSlot(day, hour) && (
                                            <div className="course-card">
                                                <div className="course-title">
                                                    {getEventForTimeSlot(day, hour).summary}
                                                </div>
                                                <div className="course-location">
                                                    {getEventForTimeSlot(day, hour).location}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SchedulePage;
