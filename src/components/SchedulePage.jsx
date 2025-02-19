import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fr } from 'date-fns/locale';

function SchedulePage({ onBack, groupe, onRefresh, loading, error }) {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 14)));
    const [schedule, setSchedule] = useState([]);
    const [groupeLocal, setGroupeLocal] = useState(groupe || 'BUT Info');

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
                <button className="back-button" onClick={onBack}>← Retour</button>
                <h1>Emploi du temps</h1>
                
                <div className="schedule-controls">
                    <div className="control-group">
                        <label>Formation</label>
                        <input
                            type="text"
                            value={groupeLocal}
                            onChange={(e) => setGroupeLocal(e.target.value)}
                        />
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
